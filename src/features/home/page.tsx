import { WaveIcon } from '@/components/wave-icon';
import './page.scss';
import { createSignal, For, Show } from 'solid-js';

export function HomeScreen() {
  const [recording, setRecording] = createSignal(false);
  const [playing, setPlaying] = createSignal(false);

  return (
    <div class="metallic-bg hover-scale">
      <div class="mental-health-card">
        <div class="card-body">
          <h1>心灵树洞</h1>
          <p class="subtitle">把心事说给树洞听，我会温柔地回应你</p>

          {/* 录音按钮 */}
          <div class="recording-button-area">
            <div
              onMouseDown={() => setRecording(true)}
              onMouseUp={() => setRecording(false)}
              onTouchStart={() => setRecording(true)}
              onTouchEnd={() => setRecording(false)}
              class={`record-button ${recording() ? 'recording' : ''}`}
            >
              <div class={`inner-circle ${recording() ? 'recording' : ''}`}>
                <svg viewBox="0 0 24 24">{/* SVG 内容保持一致 */}</svg>
              </div>
            </div>
            <p class="record-label">
              {recording() ? '松开停止录音' : '按住说话'}
            </p>
          </div>

          {/* 播放状态 */}
          <Show when={playing()}>
            <div class="playing-status">
              <div class="flex items-center justify-center space-x-1 mb-2">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <p class="status-text">正在为你轻声回应...</p>
            </div>
          </Show>

          {/* 波形动画 */}
          <WaveIcon isAnimating={recording()} barCount={15} />
        </div>
      </div>
    </div>
  );
}
