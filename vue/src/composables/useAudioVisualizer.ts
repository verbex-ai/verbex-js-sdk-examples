import { ref, watch, onUnmounted, Ref } from 'vue';
import type { AudioAnalyzer } from '@verbex-ai/verbex-js-sdk';
import { drawWaveform } from '../utils/canvas';

/**
 * Composable for managing audio visualization animation loop
 *
 * This composable:
 * - Runs a requestAnimationFrame loop at ~60fps
 * - Updates waveform canvas with PCM data from SDK
 * - Calculates and returns current volume level (0-1)
 * - Automatically cleans up animation on unmount
 *
 * SDK METHODS USED:
 * - audioAnalyzer.getPCMFrame() - Returns Float32Array of PCM samples
 * - audioAnalyzer.calculateVolume() - Returns RMS volume (0.0 to 1.0)
 *
 * @param audioAnalyzer - SDK AudioAnalyzer instance (from client.audioAnalyzer)
 * @param isConnected - Connection status (stops animation when false)
 * @param canvasRef - Vue ref to canvas element
 * @returns Current volume level (0-1)
 *
 * USAGE:
 * const canvasRef = ref<HTMLCanvasElement | null>(null);
 * const volume = useAudioVisualizer(audioAnalyzer, isConnected, canvasRef);
 */
export function useAudioVisualizer(
  audioAnalyzer: AudioAnalyzer | undefined,
  isConnected: boolean,
  canvasRef: Ref<HTMLCanvasElement | null>
) {
  const volume = ref<number>(0);
  let animationFrameId: number | null = null;

  /**
   * Animation loop function
   * Called ~60 times per second via requestAnimationFrame
   */
  function animate() {
    if (!audioAnalyzer || !isConnected) {
      return;
    }

    try {
      // Update volume level
      const currentVolume = audioAnalyzer.calculateVolume();
      volume.value = currentVolume;

      // Update waveform visualization
      const pcmData = audioAnalyzer.getPCMFrame();
      if (pcmData && pcmData.length > 0 && canvasRef.value) {
        drawWaveform(canvasRef.value, pcmData);
      }
    } catch (error) {
      console.error('Error in audio visualization:', error);
    }

    // Schedule next frame
    animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop animation and clean up
   */
  function stopAnimation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Clear canvas
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
      }
    }
  }

  // Watch for changes in connection status and audioAnalyzer
  watch(
    () => [audioAnalyzer, isConnected] as const,
    ([newAudioAnalyzer, newIsConnected]) => {
      // Stop existing animation
      stopAnimation();

      // Only run animation when connected and audioAnalyzer is available
      if (!newIsConnected || !newAudioAnalyzer) {
        volume.value = 0;
        return;
      }

      // Start animation loop
      animate();
    },
    { immediate: true }
  );

  // Cleanup on unmount
  onUnmounted(() => {
    stopAnimation();
  });

  return volume;
}
