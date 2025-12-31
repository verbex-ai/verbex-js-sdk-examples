import { useState, useCallback } from 'react';
import type { EventLogEntry } from '../types';

/**
 * Custom hook for managing event log entries
 *
 * This hook provides a simple interface for adding events to a log
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
  const [events, setEvents] = useState<EventLogEntry[]>([]);

  /**
   * Add a new event to the log
   *
   * @param name - Event name (e.g., "session_connected", "transcript_updated")
   * @param data - Optional event payload data
   */
  const logEvent = useCallback((name: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEvent: EventLogEntry = { timestamp, name, data };

    setEvents((prevEvents) => [...prevEvents, newEvent]);
  }, []);

  /**
   * Clear all events from the log
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, logEvent, clearEvents };
}
