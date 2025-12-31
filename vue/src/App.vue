<script setup lang="ts">
/**
 * Verbex AI Vue Example - Main App Component
 *
 * This is a complete Vue 3 implementation demonstrating the Verbex JS SDK integration.
 *
 * ARCHITECTURE:
 * - Composables for SDK logic separation (useVerbexClient, useAudioDevices, etc.)
 * - Component composition for UI organization
 * - TypeScript for type safety
 * - Tailwind CSS for styling
 *
 * SDK FEATURES DEMONSTRATED:
 * - Real-time voice communication with AI agents
 * - Audio waveform visualization
 * - Volume level monitoring
 * - Live transcription
 * - Session metadata display
 * - Device selection (microphone/speaker)
 * - Mute/unmute controls
 * - All 11 SDK events
 * - Connection state management
 * - Error handling
 *
 * COMPOSABLES USED:
 * - useVerbexClient: Main SDK integration
 * - useAudioDevices: Device enumeration
 * - useEventLog: Event logging
 * - useAudioVisualizer: Audio visualization (used in AudioVisualizer component)
 */

import { onMounted } from 'vue';
import Header from './components/Header.vue';
import ConfigPanel from './components/ConfigPanel.vue';
import AudioVisualizer from './components/AudioVisualizer.vue';
import Transcription from './components/Transcription.vue';
import SessionMetadata from './components/SessionMetadata.vue';
import EventLog from './components/EventLog.vue';
import { useVerbexClient } from './composables/useVerbexClient';
import { useAudioDevices } from './composables/useAudioDevices';
import { useEventLog } from './composables/useEventLog';

// Event logging
const { events, logEvent, clearEvents } = useEventLog();

// SDK client management
const {
  client,
  isConnected,
  connectionStatus,
  isMuted,
  isAgentSpeaking,
  transcript,
  metadata,
  connect,
  disconnect,
  toggleMute,
} = useVerbexClient(logEvent);

// Audio device management
const {
  inputDevices,
  outputDevices,
  selectedInput,
  selectedOutput,
} = useAudioDevices();

// Log app initialization
onMounted(() => {
  logEvent('app_initialized', 'Vue app ready. Enter credentials and click Connect.');
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <!-- Header with connection status -->
    <Header :connection-status="connectionStatus" />

    <!-- Main Content Grid -->
    <main class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 3-Column Responsive Grid Layout -->
      <!-- Desktop: Left sidebar (config) | Center (audio/transcript) | Right sidebar (events) -->
      <!-- Tablet: Left (config) | Right (audio/transcript/events stacked) -->
      <!-- Mobile: All stacked vertically -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Sidebar - Configuration & Controls -->
        <div class="lg:col-span-4 xl:col-span-3">
          <ConfigPanel
            :input-devices="inputDevices"
            :output-devices="outputDevices"
            :selected-input="selectedInput"
            :selected-output="selectedOutput"
            @update:selected-input="selectedInput = $event"
            @update:selected-output="selectedOutput = $event"
            :is-connected="isConnected"
            :is-muted="isMuted"
            :is-agent-speaking="isAgentSpeaking"
            @connect="connect"
            @disconnect="disconnect"
            @toggle-mute="toggleMute"
          />
        </div>

        <!-- Center - Audio Visualization & Transcription -->
        <div class="lg:col-span-8 xl:col-span-6 space-y-6">
          <!-- Audio Visualizer -->
          <AudioVisualizer
            :audio-analyzer="(client?.audioAnalyzer as any)"
            :is-connected="isConnected"
          />

          <!-- Session Metadata (only shown when metadata available) -->
          <SessionMetadata :metadata="metadata" />

          <!-- Transcription (only shown when connected) -->
          <Transcription
            :transcript="transcript"
            :is-connected="isConnected"
          />
        </div>

        <!-- Right Sidebar - Event Log -->
        <div class="lg:col-span-12 xl:col-span-3">
          <EventLog
            :events="events"
            @clear="clearEvents"
          />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-12 py-6 border-t border-gray-200 bg-white/50">
      <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          Powered by <span class="font-semibold text-indigo-600">Verbex AI SDK</span> • Customer Agent Interface (Vue)
        </p>
      </div>
    </footer>
  </div>
</template>
