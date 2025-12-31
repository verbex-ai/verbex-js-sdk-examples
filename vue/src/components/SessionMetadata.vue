<script setup lang="ts">
import { computed } from 'vue';

/**
 * Session Metadata Component
 *
 * Displays session metadata received from the SDK.
 * Only visible when metadata is available.
 *
 * SDK EVENT:
 * - client.on('session_metadata', callback) - Provides metadata object
 *
 * FEATURES:
 * - Key-value pairs display
 * - Conditional rendering (hidden when no metadata)
 * - Formatted display for objects
 */

interface Props {
  metadata: any;
}

const props = defineProps<Props>();

const entries = computed(() => {
  if (!props.metadata || typeof props.metadata !== 'object') {
    return [];
  }
  return Object.entries(props.metadata);
});

const shouldDisplay = computed(() => {
  return entries.value.length > 0;
});

const formatValue = (value: any): string => {
  return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
};
</script>

<template>
  <div v-if="shouldDisplay" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
      <h2 class="text-lg font-semibold text-white flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Session Information
      </h2>
    </div>

    <!-- Metadata Content -->
    <div class="p-4 bg-gray-50">
      <div v-for="[key, value] in entries" :key="key" class="metadata-item">
        <div class="metadata-key">{{ key }}</div>
        <div class="metadata-value">
          {{ formatValue(value) }}
        </div>
      </div>
    </div>
  </div>
</template>
