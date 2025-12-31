'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
import type { AudioAnalyzer } from '@verbex-ai/verbex-js-sdk';
import { drawWaveform } from '../utils/canvas';

/**
 * Custom hook for managing audio visualization animation loop
 *
 * This hook:
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
 * @param canvasRef - React ref to canvas element
 * @returns Current volume level (0-1)
 *
 * USAGE:
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * const volume = useAudioVisualizer(client?.audioAnalyzer, isConnected, canvasRef);
 */
export function useAudioVisualizer(
  audioAnalyzer: AudioAnalyzer | undefined,
  isConnected: boolean,
  canvasRef: RefObject<HTMLCanvasElement | null>
): number {
  const [volume, setVolume] = useState<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Only run animation when connected and audioAnalyzer is available
    if (!isConnected || !audioAnalyzer) {
      setVolume(0);
      return;
    }

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
        setVolume(currentVolume);

        // Update waveform visualization
        const pcmData = audioAnalyzer.getPCMFrame();
        if (pcmData && pcmData.length > 0 && canvasRef.current) {
          drawWaveform(canvasRef.current, pcmData);
        }
      } catch (error) {
        console.error('Error in audio visualization:', error);
      }

      // Schedule next frame
      animationFrameIdRef.current = requestAnimationFrame(animate);
    }

    // Start animation loop
    animate();

    // Cleanup function: stop animation on unmount or when dependencies change
    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }

      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    };
  }, [audioAnalyzer, isConnected, canvasRef]);

  return volume;
}
