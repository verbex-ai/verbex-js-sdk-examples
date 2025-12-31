/**
 * Verbex AI Next.js Example - Main Page Component (App Router)
 *
 * This is a complete Next.js App Router implementation demonstrating the Verbex JS SDK integration.
 *
 * ARCHITECTURE:
 * - Next.js App Router with 'use client' directive for client-side interactivity
 * - Custom hooks for SDK logic separation (useVerbexClient, useAudioDevices, etc.)
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
 * CUSTOM HOOKS USED:
 * - useVerbexClient: Main SDK integration
 * - useAudioDevices: Device enumeration
 * - useEventLog: Event logging
 * - useAudioVisualizer: Audio visualization (used in AudioVisualizer component)
 */

'use client';

import { useEffect } from 'react';
import { Header } from '../components/Header';
import { ConfigPanel } from '../components/ConfigPanel';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { Transcription } from '../components/Transcription';
import { SessionMetadata } from '../components/SessionMetadata';
import { EventLog } from '../components/EventLog';
import { useVerbexClient } from '../hooks/useVerbexClient';
import { useAudioDevices } from '../hooks/useAudioDevices';
import { useEventLog } from '../hooks/useEventLog';

export default function Home() {
  // Event logging
  const { events, logEvent } = useEventLog();

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
    setSelectedInput,
    setSelectedOutput,
  } = useAudioDevices();

  // Log app initialization (only on client mount)
  useEffect(() => {
    if (events.length === 0) {
      logEvent('app_initialized', 'Next.js app ready. Enter credentials and click Connect.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header with connection status */}
      <Header connectionStatus={connectionStatus} />

      {/* Main Content Grid */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 3-Column Responsive Grid Layout */}
        {/* Desktop: Left sidebar (config) | Center (audio/transcript) | Right sidebar (events) */}
        {/* Tablet: Left (config) | Right (audio/transcript/events stacked) */}
        {/* Mobile: All stacked vertically */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Configuration & Controls */}
          <div className="lg:col-span-4 xl:col-span-3">
            <ConfigPanel
              inputDevices={inputDevices}
              outputDevices={outputDevices}
              selectedInput={selectedInput}
              selectedOutput={selectedOutput}
              onInputChange={setSelectedInput}
              onOutputChange={setSelectedOutput}
              isConnected={isConnected}
              isMuted={isMuted}
              isAgentSpeaking={isAgentSpeaking}
              onConnect={connect}
              onDisconnect={disconnect}
              onToggleMute={toggleMute}
            />
          </div>

          {/* Center - Audio Visualization & Transcription */}
          <div className="lg:col-span-8 xl:col-span-6 space-y-6">
            {/* Audio Visualizer */}
            <AudioVisualizer
              audioAnalyzer={client?.audioAnalyzer}
              isConnected={isConnected}
            />

            {/* Session Metadata (only shown when metadata available) */}
            <SessionMetadata metadata={metadata} />

            {/* Transcription (only shown when connected) */}
            <Transcription transcript={transcript} isConnected={isConnected} />
          </div>

          {/* Right Sidebar - Event Log */}
          <div className="lg:col-span-12 xl:col-span-3">
            <EventLog events={events} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white/50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by <span className="font-semibold text-indigo-600">Verbex AI SDK</span> • Customer Agent Interface (Next.js)
          </p>
        </div>
      </footer>
    </div>
  );
}
