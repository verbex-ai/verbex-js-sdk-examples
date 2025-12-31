import { useState, useCallback, useEffect, useRef } from 'react';
import { VerbexWebClient, SessionConfig, TranscriptEntry } from '@verbex-ai/verbex-js-sdk';
import type { ConnectionStatus } from '../types';

/**
 * Custom hook for managing VerbexWebClient instance and session
 *
 * This is the main SDK integration hook that handles:
 * - Creating and destroying VerbexWebClient instance
 * - Managing connection state and session lifecycle
 * - Setting up all 11 SDK event listeners
 * - Handling mute/unmute functionality
 * - Storing transcript and metadata in React state
 *
 * SDK EVENTS HANDLED (All 11):
 * 1. session_connected - Session successfully established
 * 2. session_disconnected - Session terminated
 * 3. session_error - Error occurred during session
 * 4. microphone_permission_denied - Browser denied mic access
 * 5. agent_speech_started - AI agent began speaking
 * 6. agent_speech_ended - AI agent stopped speaking
 * 7. transcript_updated - New transcript data available
 * 8. session_metadata - Session metadata received
 * 9. audio_stream - Raw audio PCM data stream
 * 10. connection_lost - Network connection lost
 * 11. connection_restored - Network connection restored
 *
 * @param onEvent - Callback function for logging events
 * @returns Object containing client state and control functions
 *
 * USAGE:
 * const { client, isConnected, connectionStatus, isMuted, isAgentSpeaking,
 *         transcript, metadata, connect, disconnect, toggleMute } = useVerbexClient(logEvent);
 */
export function useVerbexClient(onEvent?: (name: string, data?: any) => void) {
  const [client, setClient] = useState<VerbexWebClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [metadata, setMetadata] = useState<any>(null);

  // Use ref to track if client is being created to prevent double initialization
  const isInitializingRef = useRef(false);

  /**
   * Connect to Verbex voice AI session
   *
   * STEPS:
   * 1. Validate session token
   * 2. Check microphone permissions
   * 3. Create VerbexWebClient instance
   * 4. Initiate session with SDK
   *
   * @param config - Session configuration (token, sample rate, device IDs, etc.)
   */
  const connect = useCallback(
    async (config: SessionConfig) => {
      if (isInitializingRef.current) {
        console.warn('Connection already in progress');
        return;
      }

      try {
        isInitializingRef.current = true;

        // Validate session token
        if (!config.sessionToken) {
          throw new Error('Session token is required');
        }

        onEvent?.('connecting', 'Attempting to connect...');
        setConnectionStatus('connecting');

        // Check microphone permission before connecting
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          onEvent?.('microphone_check', 'Microphone access verified');
        } catch (error: any) {
          let message = 'Microphone access is required for Verbex to work.';
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            message = 'Microphone permission denied. Please allow microphone access in your browser settings and try again.';
          } else if (error.name === 'NotFoundError') {
            message = 'No microphone found. Please connect a microphone and try again.';
          } else if (error.name === 'NotReadableError') {
            message = 'Microphone is already in use by another application. Please close other apps using the microphone.';
          }
          onEvent?.('microphone_permission_error', { error: error.name, message });
          throw new Error(message);
        }

        // Create VerbexWebClient instance
        const newClient = new VerbexWebClient();
        setClient(newClient);

        // Initiate session (event listeners will be set up in useEffect)
        await newClient.initiateSession(config);

        onEvent?.('connection_success', 'Successfully connected to Verbex');
      } catch (error: any) {
        console.error('Connection error:', error);
        onEvent?.('connection_error', { message: error?.message || String(error) });
        setConnectionStatus('disconnected');
        setClient(null);
        throw error;
      } finally {
        isInitializingRef.current = false;
      }
    },
    [onEvent]
  );

  /**
   * Disconnect from Verbex session
   *
   * Terminates the active session and cleans up resources.
   */
  const disconnect = useCallback(() => {
    if (client) {
      try {
        client.terminateSession();
        onEvent?.('disconnect', 'Disconnected from Verbex');
      } catch (error: any) {
        console.error('Disconnect error:', error);
        onEvent?.('disconnect_error', { message: error?.message || String(error) });
      }
      setClient(null);
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    setIsMuted(false);
    setIsAgentSpeaking(false);
    setTranscript([]);
    setMetadata(null);
  }, [client, onEvent]);

  /**
   * Toggle microphone mute/unmute
   *
   * SDK METHODS:
   * - client.mute() - Mutes local microphone
   * - client.unmute() - Unmutes local microphone
   */
  const toggleMute = useCallback(() => {
    if (!client || !isConnected) return;

    if (isMuted) {
      client.unmute();
      setIsMuted(false);
      onEvent?.('unmuted', 'Microphone unmuted');
    } else {
      client.mute();
      setIsMuted(true);
      onEvent?.('muted', 'Microphone muted');
    }
  }, [client, isConnected, isMuted, onEvent]);

  /**
   * Setup all SDK event listeners
   * This effect runs when the client instance changes
   */
  useEffect(() => {
    if (!client) return;

    // EVENT 1: session_connected
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      setTranscript([]);
      onEvent?.('session_connected');
    };

    // EVENT 2: microphone_permission_denied
    const handleMicPermissionDenied = (payload: any) => {
      onEvent?.('microphone_permission_denied', payload);
      alert('Microphone permission denied. Please allow microphone access in your browser settings.');
    };

    // EVENT 3: session_disconnected
    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setIsAgentSpeaking(false);
      onEvent?.('session_disconnected');
    };

    // EVENT 4: session_error
    const handleError = (error: any) => {
      onEvent?.('session_error', { message: error?.message || String(error), error });
      setConnectionStatus('disconnected');
    };

    // EVENT 5: agent_speech_started
    const handleAgentSpeechStarted = () => {
      setIsAgentSpeaking(true);
      onEvent?.('agent_speech_started');
    };

    // EVENT 6: agent_speech_ended
    const handleAgentSpeechEnded = () => {
      setIsAgentSpeaking(false);
      onEvent?.('agent_speech_ended');
    };

    // EVENT 7: transcript_updated
    const handleTranscriptUpdated = (payload: any) => {
      if (payload?.transcript) {
        setTranscript(payload.transcript);
        onEvent?.('transcript_updated', payload.transcript);
      } else {
        console.error('Invalid transcript payload:', payload);
        onEvent?.('transcript_error', { message: 'Invalid payload: missing transcript field', rawPayload: payload });
      }
    };

    // EVENT 8: session_metadata
    const handleMetadata = (metadata: any) => {
      setMetadata(metadata);
      onEvent?.('session_metadata', metadata);
    };

    // EVENT 9: audio_stream
    const handleAudioStream = () => {
      // Audio stream is handled by useAudioVisualizer hook
      // No need to log this event as it fires ~60fps
    };

    // EVENT 10: connection_lost
    const handleConnectionLost = () => {
      setConnectionStatus('connecting');
      onEvent?.('connection_lost');
    };

    // EVENT 11: connection_restored
    const handleConnectionRestored = () => {
      setConnectionStatus('connected');
      onEvent?.('connection_restored');
    };

    // Register all event listeners
    client.on('session_connected', handleConnected);
    client.on('microphone_permission_denied', handleMicPermissionDenied);
    client.on('session_disconnected', handleDisconnected);
    client.on('session_error', handleError);
    client.on('agent_speech_started', handleAgentSpeechStarted);
    client.on('agent_speech_ended', handleAgentSpeechEnded);
    client.on('transcript_updated', handleTranscriptUpdated);
    client.on('session_metadata', handleMetadata);
    client.on('audio_stream', handleAudioStream);
    client.on('connection_lost', handleConnectionLost);
    client.on('connection_restored', handleConnectionRestored);

    // Cleanup function: remove all event listeners
    return () => {
      client.off('session_connected', handleConnected);
      client.off('microphone_permission_denied', handleMicPermissionDenied);
      client.off('session_disconnected', handleDisconnected);
      client.off('session_error', handleError);
      client.off('agent_speech_started', handleAgentSpeechStarted);
      client.off('agent_speech_ended', handleAgentSpeechEnded);
      client.off('transcript_updated', handleTranscriptUpdated);
      client.off('session_metadata', handleMetadata);
      client.off('audio_stream', handleAudioStream);
      client.off('connection_lost', handleConnectionLost);
      client.off('connection_restored', handleConnectionRestored);
    };
  }, [client, onEvent]);

  return {
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
  };
}
