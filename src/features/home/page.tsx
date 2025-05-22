import { WaveIcon } from '@/components/wave-icon';
import './page.scss';
import { createSignal, Show } from 'solid-js';
import { postAudio, ApiError } from '../../remote/repository'; // Corrected import path

export function HomeScreen() {
  const [recording, setRecording] = createSignal(false);
  // const [playing, setPlaying] = createSignal(false); // Replaced by isLoadingBackendResponse
  const [isLoadingBackendResponse, setIsLoadingBackendResponse] =
    createSignal(false);
  const [backendAudioUrl, setBackendAudioUrl] = createSignal<string | null>(
    null,
  );
  const [apiError, setApiError] = createSignal<ApiError | string | null>(null);

  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];

  const requestPermissionAndStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setApiError(null); // Clear previous errors
      setBackendAudioUrl(null); // Clear previous audio

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = []; // Reset chunks

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioChunks = []; // Clear chunks after creating blob

        // Stop all tracks from the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop());

        if (audioBlob.size === 0) {
          setApiError('录音内容为空，请重新录制。');
          setIsLoadingBackendResponse(false);
          return;
        }

        setIsLoadingBackendResponse(true);
        setApiError(null);

        try {
          const response = await postAudio(audioBlob);
          if (response instanceof Blob) {
            const url = URL.createObjectURL(response);
            setBackendAudioUrl(url);
            setApiError(null);
          } else {
            // response is ApiError
            const errorResponse = response as ApiError; // Explicit cast
            setApiError(
              errorResponse.error
                ? errorResponse
                : { error: '播放音频失败，请重试。' },
            );
            setBackendAudioUrl(null);
          }
        } catch (error) {
          console.error('Error posting audio:', error);
          setApiError('上传失败，请检查网络连接。');
          setBackendAudioUrl(null);
        } finally {
          setIsLoadingBackendResponse(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error(
        'Failed to get recording permission or start recording:',
        err,
      );
      setApiError('无法获取麦克风权限，请检查设置并允许访问。');
      alert('无法获取麦克风权限。请在浏览器设置中允许麦克风访问，然后重试。');
      setRecording(false); // Ensure recording state is false if permission denied
    }
  };

  const handleStartRecording = () => {
    if (!recording()) {
      requestPermissionAndStartRecording();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && recording()) {
      mediaRecorder.stop();
      setRecording(false);
      // The rest of the logic (upload, etc.) is in mediaRecorder.onstop
    }
  };

  return (
    <div class="metallic-bg hover-scale">
      <div class="mental-health-card">
        <div class="card-body">
          <h1>心灵树洞</h1>
          <p class="subtitle">把心事说给树洞听，我会温柔地回应你</p>

          {/* 录音按钮 */}
          <div class="recording-button-area">
            <div
              onMouseDown={handleStartRecording}
              onMouseUp={handleStopRecording}
              onTouchStart={handleStartRecording}
              onTouchEnd={handleStopRecording}
              class={`record-button ${recording() ? 'recording' : ''}`}
            >
              <div class={`inner-circle ${recording() ? 'recording' : ''}`}>
                <svg viewBox="0 0 24 24"></svg>
              </div>
            </div>
            <p class="record-label">
              {recording() ? '松开停止录音' : '按住说话'}
            </p>
          </div>

          {/* API Error Message */}
          <Show when={apiError()}>
            <div class="error-message-box">
              <p class="status-text error-text">
                {(() => {
                  const err = apiError();
                  if (typeof err === 'string') return err;
                  if (err && typeof err === 'object' && 'error' in err)
                    return (err as ApiError).error;
                  return '发生未知错误'; // Fallback for unexpected error structure or null
                })()}
              </p>
            </div>
          </Show>

          {/* Loading Status / Playing Status */}
          <Show when={isLoadingBackendResponse()}>
            <div class="playing-status">
              {' '}
              {/* Reuse class if styles are similar, or create new */}
              <div class="flex items-center justify-center space-x-1 mb-2">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <p class="status-text">正在为你轻声回应...</p>
            </div>
          </Show>

          {/* Backend Audio Player */}
          <Show when={backendAudioUrl() && !apiError()}>
            <div class="audio-player-container">
              <audio src={backendAudioUrl()!} controls autoplay />
              <p class="status-text">这是给你的回应，请倾听：</p>
            </div>
          </Show>

          {/* 波形动画 */}
          <WaveIcon isAnimating={recording()} barCount={15} />
        </div>
      </div>
    </div>
  );
}
