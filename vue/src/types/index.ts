/**
 * Custom TypeScript types for the Verbex Vue example
 */

/**
 * Event log entry structure
 */
export interface EventLogEntry {
  timestamp: string;
  name: string;
  data?: any;
}

/**
 * Connection status type
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

/**
 * Audio device information
 */
export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}
