<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { TranscriptEntry } from '@verbex-ai/verbex-js-sdk';

/**
 * Transcription Component
 *
 * Displays real-time conversation transcript with distinct styling
 * for user and agent messages.
 *
 * SDK EVENT:
 * - client.on('transcript_updated', callback) - Provides transcript array
 *
 * TRANSCRIPT ENTRY FORMAT:
 * {
 *   role: "user" | "agent",
 *   content: "transcribed text"
 * }
 *
 * FEATURES:
 * - Auto-scroll to latest message
 * - Color-coded user/agent messages
 * - Empty state placeholder
 * - Scrollable container
 */

interface Props {
  transcript: TranscriptEntry[];
  isConnected: boolean;
}

const props = defineProps<Props>();

const containerRef = ref<HTMLDivElement | null>(null);

// Auto-scroll to latest message
watch(
  () => props.transcript,
  async () => {
    await nextTick();
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    }
  },
  { deep: true }
);

const getRoleLabel = (role: string | undefined): string => {
  if (role === 'agent') return 'AI Agent';
  if (role === 'user') return 'You';
  return 'Unknown';
};
</script>

<template>
  <div v-if="isConnected" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Live Transcription
      </h2>
      <span class="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full">LIVE</span>
    </div>

    <!-- Transcript Container -->
    <div ref="containerRef" class="p-4 bg-gray-50 space-y-3 overflow-y-auto max-h-96">
      <!-- Empty State -->
      <div v-if="transcript.length === 0" class="text-center text-gray-400 py-8 text-sm">
        Transcription will appear here as the conversation progresses...
      </div>

      <!-- Transcript Entries -->
      <div
        v-for="(entry, index) in transcript"
        :key="index"
        :class="`transcript-entry ${entry.role || 'unknown'}`"
      >
        <div :class="`transcript-role ${entry.role || 'unknown'}`">
          {{ getRoleLabel(entry.role) }}
        </div>
        <div class="transcript-content">
          {{ entry.content || '[No content]' }}
        </div>
      </div>
    </div>
  </div>
</template>
