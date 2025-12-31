import { ref, onMounted } from 'vue';

/**
 * Composable for managing audio device enumeration and selection
 *
 * This composable handles:
 * - Enumerating available microphones and speakers
 * - Requesting microphone permission to get device labels
 * - Managing selected input/output device IDs
 * - Refreshing device list on demand
 *
 * SDK INTEGRATION:
 * - Selected devices passed to client.initiateSession() via SessionConfig
 * - Uses: sessionConfig.inputDeviceId and sessionConfig.outputDeviceId
 *
 * BROWSER API:
 * - navigator.mediaDevices.enumerateDevices() - Lists all media devices
 * - navigator.mediaDevices.getUserMedia() - Requests mic permission
 *
 * @returns Object containing device arrays, selected IDs, and control functions
 *
 * USAGE:
 * const { inputDevices, outputDevices, selectedInput, selectedOutput,
 *         setSelectedInput, setSelectedOutput, refreshDevices } = useAudioDevices();
 */
export function useAudioDevices() {
  const inputDevices = ref<MediaDeviceInfo[]>([]);
  const outputDevices = ref<MediaDeviceInfo[]>([]);
  const selectedInput = ref<string>('');
  const selectedOutput = ref<string>('');

  /**
   * Enumerate available audio devices
   *
   * PROCESS:
   * 1. Request microphone permission (required to get device labels)
   * 2. Enumerate all media devices
   * 3. Filter by audioinput and audiooutput
   * 4. Update state with device lists
   */
  const enumerateDevices = async () => {
    try {
      // Request permission first to get device labels (browser security requirement)
      // Without permission, device labels will be empty strings
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop test stream immediately

      // Get all available media devices
      const devices = await navigator.mediaDevices.enumerateDevices();

      // Filter and set input devices (microphones)
      const inputs = devices.filter((device) => device.kind === 'audioinput');
      inputDevices.value = inputs;

      // Filter and set output devices (speakers)
      const outputs = devices.filter((device) => device.kind === 'audiooutput');
      outputDevices.value = outputs;
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  };

  /**
   * Refresh device list
   * Useful when devices are plugged/unplugged
   */
  const refreshDevices = async () => {
    await enumerateDevices();
  };

  // Enumerate devices on mount
  onMounted(() => {
    enumerateDevices();
  });

  return {
    inputDevices,
    outputDevices,
    selectedInput,
    selectedOutput,
    refreshDevices,
  };
}
