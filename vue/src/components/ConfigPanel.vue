<script setup lang="ts">
import { ref } from 'vue';
import type { SessionConfig } from '@verbex-ai/verbex-js-sdk';

/**
 * Configuration Panel Component
 *
 * Left sidebar containing all session configuration inputs and controls.
 *
 * FEATURES:
 * - Session token input
 * - Audio sample rate selector
 * - Microphone device selector
 * - Speaker device selector
 * - Connect/Disconnect/Mute buttons
 * - Microphone active indicator
 * - Agent speaking indicator
 *
 * SDK INTEGRATION:
 * - Config passed to client.initiateSession(sessionConfig)
 * - Device IDs from navigator.mediaDevices.enumerateDevices()
 */

interface Props {
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  selectedInput: string;
  selectedOutput: string;
  isConnected: boolean;
  isMuted: boolean;
  isAgentSpeaking: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selectedInput': [deviceId: string]
  'update:selectedOutput': [deviceId: string]
  connect: [config: SessionConfig]
  disconnect: []
  toggleMute: []
}>();

const sessionToken = ref('');
const sampleRate = ref('24000');
const isConnecting = ref(false);

/**
 * Handle connect button click
 * Builds session config and emits connect event
 */
const handleConnect = async () => {
  if (!sessionToken.value.trim()) {
    alert('Please enter a session token');
    return;
  }

  isConnecting.value = true;

  try {
    const config: SessionConfig = {
      sessionToken: sessionToken.value.trim(),
      audioSampleRate: parseInt(sampleRate.value) || 24000,
      enableRawAudio: true, // Enable for audio visualization
    };

    // Add device IDs if selected (empty string = use default)
    if (props.selectedInput) {
      config.inputDeviceId = props.selectedInput;
    }
    if (props.selectedOutput) {
      config.outputDeviceId = props.selectedOutput;
    }

    emit('connect', config);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    isConnecting.value = false;
  }
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Panel Header -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
      <h2 class="text-lg font-semibold text-white flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Configuration & Controls
      </h2>
    </div>

    <div class="p-4 space-y-4">
      <!-- Session Token Input -->
      <div>
        <label for="sessionToken" class="block text-sm font-medium text-gray-700 mb-1">Session Token</label>
        <input
          id="sessionToken"
          v-model="sessionToken"
          type="text"
          :disabled="isConnected"
          placeholder="Enter your session token"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <!-- Sample Rate Input -->
      <div>
        <label for="sampleRate" class="block text-sm font-medium text-gray-700 mb-1">Audio Sample Rate</label>
        <input
          id="sampleRate"
          v-model="sampleRate"
          type="number"
          :disabled="isConnected"
          placeholder="24000"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <!-- Microphone Selector -->
      <div>
        <label for="inputDevice" class="block text-sm font-medium text-gray-700 mb-1">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Input Device
        </label>
        <select
          id="inputDevice"
          :value="selectedInput"
          @change="emit('update:selectedInput', ($event.target as HTMLSelectElement).value)"
          :disabled="isConnected"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Default Microphone</option>
          <option v-for="device in inputDevices" :key="device.deviceId" :value="device.deviceId">
            {{ device.label || `Microphone ${device.deviceId.slice(0, 8)}` }}
          </option>
        </select>
      </div>

      <!-- Speaker Selector -->
      <div>
        <label for="outputDevice" class="block text-sm font-medium text-gray-700 mb-1">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          Output Device
        </label>
        <select
          id="outputDevice"
          :value="selectedOutput"
          @change="emit('update:selectedOutput', ($event.target as HTMLSelectElement).value)"
          :disabled="isConnected"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Default Speaker</option>
          <option v-for="device in outputDevices" :key="device.deviceId" :value="device.deviceId">
            {{ device.label || `Speaker ${device.deviceId.slice(0, 8)}` }}
          </option>
        </select>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-200 my-4"></div>

      <!-- Control Buttons -->
      <div class="space-y-3">
        <!-- Connect Button (shown when disconnected) -->
        <button
          v-if="!isConnected"
          @click="handleConnect"
          :disabled="isConnecting"
          class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <template v-if="isConnecting">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Connecting...</span>
          </template>
          <template v-else>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Connect to Verbex</span>
          </template>
        </button>

        <!-- Disconnect Button (shown when connected) -->
        <button
          v-if="isConnected"
          @click="emit('disconnect')"
          class="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>Disconnect</span>
        </button>

        <!-- Mute/Unmute Button (shown when connected) -->
        <button
          v-if="isConnected"
          @click="emit('toggleMute')"
          :class="[
            'w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg',
            isMuted
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          ]"
        >
          <template v-if="isMuted">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
            <span>Unmute</span>
          </template>
          <template v-else>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <span>Mute</span>
          </template>
        </button>
      </div>

      <!-- Status Divider (shown when connected) -->
      <div v-if="isConnected" class="border-t border-gray-200 my-4"></div>

      <!-- Agent Speaking Indicator -->
      <div
        v-if="isConnected && isAgentSpeaking"
        class="px-4 py-3 rounded-lg bg-purple-50 border border-purple-200 flex items-center space-x-3"
      >
        <div class="flex-shrink-0">
          <div class="speaking-dot" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-purple-900">AI Agent Speaking</p>
          <p class="text-xs text-purple-600">Please wait...</p>
        </div>
      </div>

      <!-- Microphone Active Indicator -->
      <div
        v-if="isConnected"
        class="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center space-x-3"
      >
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-blue-900">Microphone Active</p>
          <p class="text-xs text-blue-600">Speak naturally with the AI</p>
        </div>
      </div>
    </div>
  </div>
</template>
