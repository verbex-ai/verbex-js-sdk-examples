<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { EventLogEntry } from '../types';

/**
 * Event Log Component
 *
 * Displays a scrollable list of SDK events and application events.
 * Automatically scrolls to the latest event.
 *
 * FEATURES:
 * - Fixed height container with auto-scroll
 * - Event cards with timestamp, name, and optional data
 * - Empty state placeholder
 * - Clear button to reset log
 * - Mono font for better readability
 */

interface Props {
  events: EventLogEntry[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  clear: []
}>();

const containerRef = ref<HTMLDivElement | null>(null);

// Auto-scroll to latest event
watch(
  () => props.events,
  async () => {
    await nextTick();
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    }
  },
  { deep: true }
);

const handleClear = () => {
  emit('clear');
};

const formatData = (data: any): string => {
  return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style="height: 600px">
    <!-- Header -->
    <div class="bg-gradient-to-r from-gray-700 to-gray-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
      <h2 class="text-lg font-semibold text-white flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Event Log
      </h2>
      <button
        @click="handleClear"
        class="text-white hover:text-gray-200 text-xs font-medium px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
      >
        Clear
      </button>
    </div>

    <!-- Event List Container -->
    <div ref="containerRef" class="flex-1 overflow-y-auto p-4 bg-gray-50 font-mono text-xs space-y-2">
      <!-- Empty State -->
      <p v-if="events.length === 0" class="text-center text-gray-400 py-8">No events yet...</p>

      <!-- Event Items -->
      <div
        v-for="(event, index) in events"
        :key="index"
        class="event-item"
      >
        <div class="event-time">{{ event.timestamp }}</div>
        <div class="event-name">{{ event.name }}</div>
        <div v-if="event.data" class="event-data">
          {{ formatData(event.data) }}
        </div>
      </div>
    </div>
  </div>
</template>
