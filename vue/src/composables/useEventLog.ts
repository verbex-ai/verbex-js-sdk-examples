import { ref } from 'vue';
import type { EventLogEntry } from '../types';

/**
 * Composable for managing event log entries
 *
 * This composable provides a simple interface for adding events to a log
 * with timestamps. Used throughout the app to track SDK events and
 * application lifecycle events.
 *
 * @returns Object containing events array, logEvent function, and clearEvents function
 *
 * USAGE:
 * const { events, logEvent, clearEvents } = useEventLog();
 * logEvent('session_connected');
 * logEvent('transcript_updated', { transcript: [...] });
 */
export function useEventLog() {
  const events = ref<EventLogEntry[]>([]);

  /**
   * Add a new event to the log
   *
   * @param name - Event name (e.g., "session_connected", "transcript_updated")
   * @param data - Optional event payload data
   */
  const logEvent = (name: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEvent: EventLogEntry = { timestamp, name, data };

    events.value = [...events.value, newEvent];
  };

  /**
   * Clear all events from the log
   */
  const clearEvents = () => {
    events.value = [];
  };

  return { events, logEvent, clearEvents };
}
