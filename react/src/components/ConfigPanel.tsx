import { useState } from 'react';
import type { SessionConfig } from '@verbex-ai/verbex-js-sdk';

/**
 * Configuration Panel Component
 *
 * Left sidebar containing all session configuration inputs and controls.
 *
 * FEATURES:
 * - Session token input
 * - Audio sample rate selector
 * - Microphone device selector
 * - Speaker device selector
 * - Connect/Disconnect/Mute buttons
 * - Microphone active indicator
 * - Agent speaking indicator
 *
 * SDK INTEGRATION:
 * - Config passed to client.initiateSession(sessionConfig)
 * - Device IDs from navigator.mediaDevices.enumerateDevices()
 *
 * @param inputDevices - Available microphone devices
 * @param outputDevices - Available speaker devices
 * @param selectedInput - Selected microphone device ID
 * @param selectedOutput - Selected speaker device ID
 * @param onInputChange - Callback for microphone selection
 * @param onOutputChange - Callback for speaker selection
 * @param isConnected - Connection status
 * @param isMuted - Mute status
 * @param isAgentSpeaking - Agent speaking status
 * @param onConnect - Callback to initiate session
 * @param onDisconnect - Callback to terminate session
 * @param onToggleMute - Callback to toggle mute
 */
interface ConfigPanelProps {
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  selectedInput: string;
  selectedOutput: string;
  onInputChange: (deviceId: string) => void;
  onOutputChange: (deviceId: string) => void;
  isConnected: boolean;
  isMuted: boolean;
  isAgentSpeaking: boolean;
  onConnect: (config: SessionConfig) => Promise<void>;
  onDisconnect: () => void;
  onToggleMute: () => void;
}

export function ConfigPanel({
  inputDevices,
  outputDevices,
  selectedInput,
  selectedOutput,
  onInputChange,
  onOutputChange,
  isConnected,
  isMuted,
  isAgentSpeaking,
  onConnect,
  onDisconnect,
  onToggleMute,
}: ConfigPanelProps) {
  const [sessionToken, setSessionToken] = useState('');
  const [sampleRate, setSampleRate] = useState('24000');
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Handle connect button click
   * Builds session config and calls onConnect callback
   */
  const handleConnect = async () => {
    if (!sessionToken.trim()) {
      alert('Please enter a session token');
      return;
    }

    setIsConnecting(true);

    try {
      const config: SessionConfig = {
        sessionToken: sessionToken.trim(),
        audioSampleRate: parseInt(sampleRate) || 24000,
        enableRawAudio: true, // Enable for audio visualization
      };

      // Add device IDs if selected (empty string = use default)
      if (selectedInput) {
        config.inputDeviceId = selectedInput;
      }
      if (selectedOutput) {
        config.outputDeviceId = selectedOutput;
      }

      await onConnect(config);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configuration & Controls
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Session Token Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Token</label>
          <input
            type="text"
            id="sessionToken"
            value={sessionToken}
            onChange={(e) => setSessionToken(e.target.value)}
            disabled={isConnected}
            placeholder="Enter your session token"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Sample Rate Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Audio Sample Rate</label>
          <input
            type="number"
            id="sampleRate"
            value={sampleRate}
            onChange={(e) => setSampleRate(e.target.value)}
            disabled={isConnected}
            placeholder="24000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Microphone Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Input Device
          </label>
          <select
            id="inputDevice"
            value={selectedInput}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isConnected}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Default Microphone</option>
            {inputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>

        {/* Speaker Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Output Device
          </label>
          <select
            id="outputDevice"
            value={selectedOutput}
            onChange={(e) => onOutputChange(e.target.value)}
            disabled={isConnected}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Default Speaker</option>
            {outputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Control Buttons */}
        <div className="space-y-3">
        {/* Connect Button (shown when disconnected) */}
        {!isConnected && (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Connect to Verbex</span>
              </>
            )}
          </button>
        )}

        {/* Disconnect Button (shown when connected) */}
        {isConnected && (
          <button
            onClick={onDisconnect}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>Disconnect</span>
          </button>
        )}

        {/* Mute/Unmute Button (shown when connected) */}
        {isConnected && (
          <button
            onClick={onToggleMute}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg ${
              isMuted
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {isMuted ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
                <span>Unmute</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <span>Mute</span>
              </>
            )}
          </button>
        )}
      </div>

        {/* Status Divider (shown when connected) */}
        {isConnected && <div className="border-t border-gray-200 my-4"></div>}

        {/* Agent Speaking Indicator */}
        {isConnected && isAgentSpeaking && (
          <div className="px-4 py-3 rounded-lg bg-purple-50 border border-purple-200 flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="speaking-dot" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-purple-900">AI Agent Speaking</p>
              <p className="text-xs text-purple-600">Please wait...</p>
            </div>
          </div>
        )}

        {/* Microphone Active Indicator */}
        {isConnected && (
          <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">Microphone Active</p>
              <p className="text-xs text-blue-600">Speak naturally with the AI</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
