'use client';

import { useRef } from 'react';
import type { AudioAnalyzer } from '@verbex-ai/verbex-js-sdk';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer';

/**
 * Audio Visualizer Component
 *
 * Displays real-time audio waveform and volume meter.
 *
 * SDK INTEGRATION:
 * - Uses client.audioAnalyzer.getPCMFrame() for waveform data
 * - Uses client.audioAnalyzer.calculateVolume() for volume level
 *
 * FEATURES:
 * - Canvas-based waveform visualization
 * - Volume meter with gradient bar
 * - Live volume percentage
 * - Placeholder when disconnected
 *
 * @param audioAnalyzer - SDK AudioAnalyzer instance
 * @param isConnected - Connection status
 */
interface AudioVisualizerProps {
  audioAnalyzer: AudioAnalyzer | undefined;
  isConnected: boolean;
}

export function AudioVisualizer({ audioAnalyzer, isConnected }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use audio visualizer hook to get volume and handle animation
  const volume = useAudioVisualizer(audioAnalyzer, isConnected, canvasRef);
  const volumePercentage = Math.round(volume * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 px-4 py-2.5">
        <h2 className="text-base font-semibold text-white flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Audio Visualization
        </h2>
      </div>

      {isConnected ? (
        /* Active Audio Visualization */
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Waveform Visualization */}
            <div className="lg:col-span-2 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Waveform</span>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              </div>
              <canvas
                ref={canvasRef}
                id="waveform"
                className="w-full"
                style={{ height: '80px' }}
              />
            </div>

            {/* Volume Meter */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Volume</span>
                <span className="text-xs font-bold text-indigo-600">{volumePercentage}%</span>
              </div>
              <div className="flex flex-col items-center justify-center h-20">
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full volume-bar transition-all duration-100 ease-out"
                    style={{ width: `${volumePercentage}%` }}
                  />
                </div>
                <div className="flex justify-between w-full mt-1 px-1">
                  <span className="text-[10px] text-gray-400">0%</span>
                  <span className="text-[10px] text-gray-400">50%</span>
                  <span className="text-[10px] text-gray-400">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Placeholder when disconnected */
        <div className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-gray-500 text-sm">Connect to see audio visualization</p>
        </div>
      )}
    </div>
  );
}
