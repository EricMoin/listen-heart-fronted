export interface ApiError {
  error: string;
}

export const postAudio = async (audio: Blob): Promise<Blob | ApiError> => {
  const formData = new FormData();
  formData.append('file', audio, 'recording.webm');

  const response = await fetch(`/api/analyze_audio`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    return response.json();
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.startsWith('audio/')) {
    return response.blob();
  } else {
    return response.json();
  }
};
