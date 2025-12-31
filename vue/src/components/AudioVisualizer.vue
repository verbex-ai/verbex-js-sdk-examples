<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AudioAnalyzer } from '@verbex-ai/verbex-js-sdk';
import { useAudioVisualizer } from '../composables/useAudioVisualizer';

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
 */

interface Props {
  audioAnalyzer: AudioAnalyzer | undefined;
  isConnected: boolean;
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Use audio visualizer composable to get volume and handle animation
const volume = useAudioVisualizer(props.audioAnalyzer, props.isConnected, canvasRef);
const volumePercentage = computed(() => Math.round(volume.value * 100));
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-green-500 to-teal-600 px-4 py-2.5">
      <h2 class="text-base font-semibold text-white flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        Audio Visualization
      </h2>
    </div>

    <!-- Active Audio Visualization -->
    <div v-if="isConnected" class="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Waveform Visualization -->
        <div class="lg:col-span-2 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Waveform</span>
            <div class="flex items-center space-x-1">
              <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>
          <canvas
            ref="canvasRef"
            id="waveform"
            class="w-full"
            style="height: 80px"
          />
        </div>

        <!-- Volume Meter -->
        <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Volume</span>
            <span class="text-xs font-bold text-indigo-600">{{ volumePercentage }}%</span>
          </div>
          <div class="flex flex-col items-center justify-center h-20">
            <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full volume-bar transition-all duration-100 ease-out"
                :style="{ width: `${volumePercentage}%` }"
              />
            </div>
            <div class="flex justify-between w-full mt-1 px-1">
              <span class="text-[10px] text-gray-400">0%</span>
              <span class="text-[10px] text-gray-400">50%</span>
              <span class="text-[10px] text-gray-400">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Placeholder when disconnected -->
    <div v-else class="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
      <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
      <p class="text-gray-500 text-sm">Connect to see audio visualization</p>
    </div>
  </div>
</template>
