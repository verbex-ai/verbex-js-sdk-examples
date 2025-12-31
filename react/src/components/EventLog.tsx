import { useEffect, useRef, useState } from 'react';
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
 *
 * @param events - Array of event log entries
 */
interface EventLogProps {
  events: EventLogEntry[];
}

export function EventLog({ events }: EventLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayEvents, setDisplayEvents] = useState<EventLogEntry[]>(events);

  // Update display events when prop changes
  useEffect(() => {
    setDisplayEvents(events);
  }, [events]);

  // Auto-scroll to latest event
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayEvents]);

  // Clear all events
  const handleClear = () => {
    setDisplayEvents([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Event Log
        </h2>
        <button
          onClick={handleClear}
          className="text-white hover:text-gray-200 text-xs font-medium px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Event List Container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 font-mono text-xs space-y-2">
        {displayEvents.length === 0 ? (
          /* Empty State */
          <p className="text-center text-gray-400 py-8">No events yet...</p>
        ) : (
          /* Event Items */
          displayEvents.map((event, index) => (
            <div key={index} className="event-item">
              <div className="event-time">{event.timestamp}</div>
              <div className="event-name">{event.name}</div>
              {event.data && (
                <div className="event-data">
                  {typeof event.data === 'object' ? JSON.stringify(event.data, null, 2) : String(event.data)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
