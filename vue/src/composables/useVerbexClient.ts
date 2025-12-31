import { ref, watch, onUnmounted } from 'vue';
import { VerbexWebClient, SessionConfig, TranscriptEntry } from '@verbex-ai/verbex-js-sdk';
import type { ConnectionStatus } from '../types';

/**
 * Composable for managing VerbexWebClient instance and session
 *
 * This is the main SDK integration composable that handles:
 * - Creating and destroying VerbexWebClient instance
 * - Managing connection state and session lifecycle
 * - Setting up all 11 SDK event listeners
 * - Handling mute/unmute functionality
 * - Storing transcript and metadata in reactive refs
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
  const client = ref<VerbexWebClient | null>(null);
  const isConnected = ref(false);
  const connectionStatus = ref<ConnectionStatus>('disconnected');
  const isMuted = ref(false);
  const isAgentSpeaking = ref(false);
  const transcript = ref<TranscriptEntry[]>([]);
  const metadata = ref<any>(null);

  // Track if client is being created to prevent double initialization
  let isInitializing = false;

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
  const connect = async (config: SessionConfig) => {
    if (isInitializing) {
      console.warn('Connection already in progress');
      return;
    }

    try {
      isInitializing = true;

      // Validate session token
      if (!config.sessionToken) {
        throw new Error('Session token is required');
      }

      onEvent?.('connecting', 'Attempting to connect...');
      connectionStatus.value = 'connecting';

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
      client.value = newClient;

      // Initiate session (event listeners will be set up in watch)
      await newClient.initiateSession(config);

      onEvent?.('connection_success', 'Successfully connected to Verbex');
    } catch (error: any) {
      console.error('Connection error:', error);
      onEvent?.('connection_error', { message: error?.message || String(error) });
      connectionStatus.value = 'disconnected';
      client.value = null;
      throw error;
    } finally {
      isInitializing = false;
    }
  };

  /**
   * Disconnect from Verbex session
   *
   * Terminates the active session and cleans up resources.
   */
  const disconnect = () => {
    if (client.value) {
      try {
        client.value.terminateSession();
        onEvent?.('disconnect', 'Disconnected from Verbex');
      } catch (error: any) {
        console.error('Disconnect error:', error);
        onEvent?.('disconnect_error', { message: error?.message || String(error) });
      }
      client.value = null;
    }

    isConnected.value = false;
    connectionStatus.value = 'disconnected';
    isMuted.value = false;
    isAgentSpeaking.value = false;
    transcript.value = [];
    metadata.value = null;
  };

  /**
   * Toggle microphone mute/unmute
   *
   * SDK METHODS:
   * - client.mute() - Mutes local microphone
   * - client.unmute() - Unmutes local microphone
   */
  const toggleMute = () => {
    if (!client.value || !isConnected.value) return;

    if (isMuted.value) {
      client.value.unmute();
      isMuted.value = false;
      onEvent?.('unmuted', 'Microphone unmuted');
    } else {
      client.value.mute();
      isMuted.value = true;
      onEvent?.('muted', 'Microphone muted');
    }
  };

  /**
   * Setup all SDK event listeners
   * This watch runs when the client instance changes
   */
  watch(
    client,
    (newClient, oldClient) => {
      // Remove old event listeners if there was a previous client
      if (oldClient) {
        // Cleanup is handled automatically when client changes
      }

      if (!newClient) return;

      // EVENT 1: session_connected
      const handleConnected = () => {
        isConnected.value = true;
        connectionStatus.value = 'connected';
        transcript.value = [];
        onEvent?.('session_connected');
      };

      // EVENT 2: microphone_permission_denied
      const handleMicPermissionDenied = (payload: any) => {
        onEvent?.('microphone_permission_denied', payload);
        alert('Microphone permission denied. Please allow microphone access in your browser settings.');
      };

      // EVENT 3: session_disconnected
      const handleDisconnected = () => {
        isConnected.value = false;
        connectionStatus.value = 'disconnected';
        isAgentSpeaking.value = false;
        onEvent?.('session_disconnected');
      };

      // EVENT 4: session_error
      const handleError = (error: any) => {
        onEvent?.('session_error', { message: error?.message || String(error), error });
        connectionStatus.value = 'disconnected';
      };

      // EVENT 5: agent_speech_started
      const handleAgentSpeechStarted = () => {
        isAgentSpeaking.value = true;
        onEvent?.('agent_speech_started');
      };

      // EVENT 6: agent_speech_ended
      const handleAgentSpeachEnded = () => {
        isAgentSpeaking.value = false;
        onEvent?.('agent_speech_ended');
      };

      // EVENT 7: transcript_updated
      const handleTranscriptUpdated = (payload: any) => {
        if (payload?.transcript) {
          transcript.value = payload.transcript;
          onEvent?.('transcript_updated', payload.transcript);
        } else {
          console.error('Invalid transcript payload:', payload);
          onEvent?.('transcript_error', { message: 'Invalid payload: missing transcript field', rawPayload: payload });
        }
      };

      // EVENT 8: session_metadata
      const handleMetadata = (meta: any) => {
        metadata.value = meta;
        onEvent?.('session_metadata', meta);
      };

      // EVENT 9: audio_stream
      const handleAudioStream = () => {
        // Audio stream is handled by useAudioVisualizer composable
        // No need to log this event as it fires ~60fps
      };

      // EVENT 10: connection_lost
      const handleConnectionLost = () => {
        connectionStatus.value = 'connecting';
        onEvent?.('connection_lost');
      };

      // EVENT 11: connection_restored
      const handleConnectionRestored = () => {
        connectionStatus.value = 'connected';
        onEvent?.('connection_restored');
      };

      // Register all event listeners
      newClient.on('session_connected', handleConnected);
      newClient.on('microphone_permission_denied', handleMicPermissionDenied);
      newClient.on('session_disconnected', handleDisconnected);
      newClient.on('session_error', handleError);
      newClient.on('agent_speech_started', handleAgentSpeechStarted);
      newClient.on('agent_speech_ended', handleAgentSpeachEnded);
      newClient.on('transcript_updated', handleTranscriptUpdated);
      newClient.on('session_metadata', handleMetadata);
      newClient.on('audio_stream', handleAudioStream);
      newClient.on('connection_lost', handleConnectionLost);
      newClient.on('connection_restored', handleConnectionRestored);

      // Store cleanup function for this client
      onUnmounted(() => {
        if (newClient) {
          newClient.off('session_connected', handleConnected);
          newClient.off('microphone_permission_denied', handleMicPermissionDenied);
          newClient.off('session_disconnected', handleDisconnected);
          newClient.off('session_error', handleError);
          newClient.off('agent_speech_started', handleAgentSpeechStarted);
          newClient.off('agent_speech_ended', handleAgentSpeachEnded);
          newClient.off('transcript_updated', handleTranscriptUpdated);
          newClient.off('session_metadata', handleMetadata);
          newClient.off('audio_stream', handleAudioStream);
          newClient.off('connection_lost', handleConnectionLost);
          newClient.off('connection_restored', handleConnectionRestored);
        }
      });
    },
    { immediate: true }
  );

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect();
  });

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
