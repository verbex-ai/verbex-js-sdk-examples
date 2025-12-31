/**
 * Canvas utility functions for audio waveform visualization
 */

/**
 * Draw audio waveform on canvas
 *
 * @param canvas - HTML canvas element
 * @param pcmData - PCM audio samples from SDK (Float32Array)
 *
 * SDK METHOD:
 * - client.audioAnalyzer.getPCMFrame() - Returns Float32Array of PCM samples
 *
 * VISUALIZATION:
 * - Each PCM sample is normalized from [-1, 1] to canvas height
 * - Uses linear interpolation to draw smooth waveform
 * - Color: Indigo (#667eea)
 */
export function drawWaveform(canvas: HTMLCanvasElement | null, pcmData: Float32Array): void {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Ensure canvas has proper dimensions (initialize if needed)
  if (canvas.width === 0 || canvas.height === 0) {
    canvas.width = canvas.offsetWidth || 700;
    canvas.height = canvas.offsetHeight || 80;
  }

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw waveform
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 2;
  ctx.beginPath();

  const sliceWidth = width / pcmData.length;
  let x = 0;

  for (let i = 0; i < pcmData.length; i++) {
    const v = pcmData[i] * 0.5 + 0.5; // Normalize to 0-1
    const y = v * height;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}
