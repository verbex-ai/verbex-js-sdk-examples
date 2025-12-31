'use client';

import { useEffect, useRef } from 'react';
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
 *
 * @param transcript - Array of transcript entries from SDK
 * @param isConnected - Connection status (shows/hides section)
 */
interface TranscriptionProps {
  transcript: TranscriptEntry[];
  isConnected: boolean;
}

export function Transcription({ transcript, isConnected }: TranscriptionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Live Transcription
        </h2>
        <span className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full">LIVE</span>
      </div>

      {/* Transcript Container */}
      <div ref={containerRef} className="p-4 bg-gray-50 space-y-3 overflow-y-auto max-h-96">
        {transcript.length === 0 ? (
          /* Empty State */
          <div className="text-center text-gray-400 py-8 text-sm">
            Transcription will appear here as the conversation progresses...
          </div>
        ) : (
          /* Transcript Entries */
          transcript.map((entry, index) => (
            <div key={index} className={`transcript-entry ${entry.role || 'unknown'}`}>
              <div className={`transcript-role ${entry.role || 'unknown'}`}>
                {entry.role === 'agent' ? 'AI Agent' : entry.role === 'user' ? 'You' : 'Unknown'}
              </div>
              <div className="transcript-content">
                {entry.content || '[No content]'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
