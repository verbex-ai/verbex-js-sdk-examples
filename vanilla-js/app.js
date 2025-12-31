/*
==========================================
VERBEX JS SDK - IMPLEMENTATION EXAMPLE
==========================================

This file demonstrates the complete integration of the Verbex JS SDK for real-time voice AI conversations.

FILE STRUCTURE:
1. SDK Import and DOM References
2. Global State Management
3. Device Enumeration (Microphone/Speaker Selection)
4. Event Logging and UI Updates
5. Audio Visualization (Waveform + Volume Meter)
6. Transcription Display
7. SDK Event Handling (11 event types)
8. Session Management (Connect/Disconnect/Mute)

SDK DOCUMENTATION:
- Package: @verbex-ai/verbex-js-sdk
- Main Class: VerbexWebClient
- Events: 11 total events (see setupEventListeners function)
- Methods: initiateSession(), terminateSession(), mute(), unmute()
- Audio Analysis: audioAnalyzer.getPCMFrame(), audioAnalyzer.calculateVolume()
*/

/*
==========================================
1. SDK IMPORT
==========================================
VerbexWebClient is the main class for managing voice AI sessions.
It handles WebRTC connections, audio streaming, and event dispatching.
*/
import { VerbexWebClient } from "@verbex-ai/verbex-js-sdk";

/*
==========================================
2. DOM ELEMENT REFERENCES
==========================================
All UI elements referenced throughout the application.
These correspond to elements in index.html with matching IDs.
*/

// Configuration Inputs
const sessionTokenInput = document.getElementById("sessionToken"); // JWT token from server
const sampleRateInput = document.getElementById("sampleRate"); // Audio sample rate (24000, 16000, 48000)
const inputDeviceSelect = document.getElementById("inputDevice"); // Microphone device selector
const outputDeviceSelect = document.getElementById("outputDevice"); // Speaker device selector

// Control Buttons
const connectBtn = document.getElementById("connectBtn"); // Initiates SDK session
const disconnectBtn = document.getElementById("disconnectBtn"); // Terminates SDK session
const muteBtn = document.getElementById("muteBtn"); // Toggles microphone on/off

// Status Indicators
const headerStatus = document.getElementById("headerStatus"); // Shows connection state (connected/disconnected/connecting)
const statusDivider = document.getElementById("statusDivider"); // Visual divider shown when connected
const microphoneStatus = document.getElementById("microphoneStatus"); // Shows mic active indicator
const agentSpeakingIndicator = document.getElementById("agentSpeakingIndicator"); // Shows when agent is speaking

// Event Log
const eventLog = document.getElementById("eventLog"); // Container for SDK event logs

// Audio Visualization
const audioViz = document.getElementById("audioViz"); // Container for audio visualizers
const audioVizPlaceholder = document.getElementById("audioVizPlaceholder"); // Placeholder when not connected
const waveformCanvas = document.getElementById("waveform"); // Canvas for waveform visualization
const volumeBar = document.getElementById("volumeBar"); // Volume meter bar
const volumeText = document.getElementById("volumeText"); // Volume percentage text

// Transcription
const transcriptionSection = document.getElementById("transcriptionSection"); // Transcript container section
const transcriptionContainer = document.getElementById("transcriptionContainer"); // Transcript entries

// Session Metadata
const sessionMetadata = document.getElementById("sessionMetadata"); // Metadata container section
const sessionMetadataContent = document.getElementById("sessionMetadataContent"); // Metadata entries

/*
==========================================
3. GLOBAL STATE MANAGEMENT
==========================================
These variables track the SDK client instance and application state.
*/

let client = null; // VerbexWebClient instance (initialized on connect)
let isConnected = false; // Tracks session connection state
let isMuted = false; // Tracks microphone mute state
let animationFrameId = null; // RequestAnimationFrame ID for audio visualization
let canvasContext = null; // Canvas 2D rendering context for waveform

// Initialize canvas context (dimensions will be set when audio viz becomes active)
if (waveformCanvas) {
	canvasContext = waveformCanvas.getContext("2d");
}

/*
==========================================
4. DEVICE ENUMERATION
==========================================
Enumerates available audio input/output devices and populates dropdown selectors.

SDK INTEGRATION:
- Selected devices are passed to client.initiateSession() via SessionConfig
- Uses: sessionConfig.inputDeviceId and sessionConfig.outputDeviceId

BROWSER API:
- navigator.mediaDevices.enumerateDevices() - Lists all media devices
- navigator.mediaDevices.getUserMedia() - Requests permission to access microphone
*/

/**
 * Enumerate and populate audio devices
 *
 * This function:
 * 1. Requests microphone permission to get device labels (browser requirement)
 * 2. Gets all available audio input/output devices
 * 3. Populates the device selection dropdowns
 * 4. Logs the enumeration result
 *
 * Called automatically on app initialization.
 */
async function enumerateDevices() {
	try {
		// Request permission first to get device labels (browser security requirement)
		// Without permission, device labels will be empty strings
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		stream.getTracks().forEach((track) => track.stop()); // Stop test stream immediately

		// Get all available media devices
		const devices = await navigator.mediaDevices.enumerateDevices();

		// Populate input devices (microphones)
		const audioInputs = devices.filter((device) => device.kind === "audioinput");
		inputDeviceSelect.innerHTML = '<option value="">Default Microphone</option>';
		audioInputs.forEach((device) => {
			const option = document.createElement("option");
			option.value = device.deviceId; // Unique device identifier
			option.textContent = device.label || `Microphone ${device.deviceId.slice(0, 8)}`;
			inputDeviceSelect.appendChild(option);
		});

		// Populate output devices (speakers)
		const audioOutputs = devices.filter(
			(device) => device.kind === "audiooutput"
		);
		outputDeviceSelect.innerHTML = '<option value="">Default Speaker</option>';
		audioOutputs.forEach((device) => {
			const option = document.createElement("option");
			option.value = device.deviceId; // Unique device identifier
			option.textContent = device.label || `Speaker ${device.deviceId.slice(0, 8)}`;
			outputDeviceSelect.appendChild(option);
		});

		logEvent("devices_enumerated", {
			inputDevices: audioInputs.length,
			outputDevices: audioOutputs.length,
		});
	} catch (error) {
		console.error("Error enumerating devices:", error);
		logEvent("device_enumeration_error", {
			message: error?.message || String(error),
		});
	}
}

/*
==========================================
5. EVENT LOGGING & UI UPDATES
==========================================
Functions for logging SDK events and updating UI status indicators.
*/

/**
 * Log an event to the event log UI
 *
 * This function displays all SDK events and application events in the right sidebar.
 * Used throughout the app to track SDK lifecycle and debugging.
 *
 * @param {string} eventName - Name of the event (e.g., "session_connected", "transcript_updated")
 * @param {object|string|null} data - Optional event payload data
 *
 * EXAMPLE USAGE:
 * logEvent("session_connected");
 * logEvent("transcript_updated", { transcript: [...] });
 */
function logEvent(eventName, data = null) {
	const time = new Date().toLocaleTimeString();
	const eventItem = document.createElement("div");
	eventItem.className = "event-item";

	const timeSpan = document.createElement("div");
	timeSpan.className = "event-time";
	timeSpan.textContent = time;

	const nameSpan = document.createElement("div");
	nameSpan.className = "event-name";
	nameSpan.textContent = eventName;

	eventItem.appendChild(timeSpan);
	eventItem.appendChild(nameSpan);

	if (data !== null) {
		const dataSpan = document.createElement("div");
		dataSpan.className = "event-data";
		if (typeof data === "object") {
			dataSpan.textContent = JSON.stringify(data, null, 2); // Pretty-print objects
		} else {
			dataSpan.textContent = String(data);
		}
		eventItem.appendChild(dataSpan);
	}

	// Clear "No events yet" message if present
	if (eventLog.querySelector("p")) {
		eventLog.innerHTML = "";
	}

	eventLog.appendChild(eventItem);
	eventLog.scrollTop = eventLog.scrollHeight; // Auto-scroll to latest event
}

/**
 * Update connection status indicator in header
 *
 * Updates the colored dot and status text in the page header.
 *
 * @param {string} status - One of: "disconnected", "connected", "connecting"
 * @param {string} message - Optional status message (not currently displayed)
 *
 * STATES:
 * - disconnected: Gray dot
 * - connected: Green dot
 * - connecting: Amber dot
 */
function updateStatus(status, message = "") {
	// Update header status
	if (headerStatus) {
		const statusColors = {
			disconnected: "bg-gray-400",
			connected: "bg-green-500",
			connecting: "bg-amber-500",
		};

		const statusTexts = {
			disconnected: "Disconnected",
			connected: "Connected",
			connecting: "Connecting...",
		};

		headerStatus.innerHTML = `
			<div class="w-2 h-2 rounded-full ${statusColors[status]} animate-pulse"></div>
			<span class="text-sm font-medium text-gray-600">${statusTexts[status]}</span>
		`;
	}
}

/**
 * Update control button states based on connection status
 *
 * This function:
 * 1. Shows/hides buttons based on connection state (Connect vs Disconnect/Mute)
 * 2. Updates mute button appearance and text
 * 3. Disables device selection when connected
 *
 * BUTTON VISIBILITY:
 * - Disconnected: Show "Connect" button only
 * - Connected: Show "Disconnect" and "Mute/Unmute" buttons
 */
function updateButtonStates() {
	// Show/hide buttons based on connection state
	if (isConnected) {
		// Hide Connect button, show Disconnect and Mute buttons
		connectBtn.classList.add("hidden");
		disconnectBtn.classList.remove("hidden");
		disconnectBtn.classList.add("flex");
		muteBtn.classList.remove("hidden");
		muteBtn.classList.add("flex");
		// Show status divider
		if (statusDivider) {
			statusDivider.classList.remove("hidden");
		}
	} else {
		// Show Connect button, hide Disconnect and Mute buttons
		connectBtn.classList.remove("hidden");
		disconnectBtn.classList.add("hidden");
		disconnectBtn.classList.remove("flex");
		muteBtn.classList.add("hidden");
		muteBtn.classList.remove("flex");
		// Hide status divider
		if (statusDivider) {
			statusDivider.classList.add("hidden");
		}
	}

	// Update mute button text and style
	if (isMuted) {
		muteBtn.className =
			"flex w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 items-center justify-center space-x-2 shadow-md hover:shadow-lg";
		muteBtn.innerHTML = `
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
			</svg>
			<span>Unmute</span>
		`;
	} else {
		muteBtn.className =
			"flex w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 items-center justify-center space-x-2 shadow-md hover:shadow-lg";
		muteBtn.innerHTML = `
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
			</svg>
			<span>Mute</span>
		`;
	}

	// Disable device selection when connected
	inputDeviceSelect.disabled = isConnected;
	outputDeviceSelect.disabled = isConnected;
}

/*
==========================================
6. TRANSCRIPTION & METADATA DISPLAY
==========================================
Functions for displaying conversation transcripts and session metadata.

SDK INTEGRATION:
- Transcripts received via: client.on('transcript_updated', callback)
- Metadata received via: client.on('session_metadata', callback)
*/

/**
 * Display conversation transcript in the UI
 *
 * This function renders the conversation transcript with distinct styling for user and agent messages.
 *
 * @param {Array} transcript - Array of transcript entries from SDK
 *
 * TRANSCRIPT ENTRY FORMAT:
 * {
 *   role: "user" | "agent",
 *   content: "transcribed text"
 * }
 *
 * SDK EVENT:
 * client.on('transcript_updated', (payload) => {
 *   displayTranscript(payload.transcript);
 * });
 */
function displayTranscript(transcript) {
	// Debug: Log what's being displayed
	console.log("[DEBUG] displayTranscript called with:", transcript);

	// Handle invalid transcript data
	if (!transcript) {
		console.warn(
			"[WARN] displayTranscript called with null/undefined transcript"
		);
		transcriptionContainer.innerHTML = `
			<div class="text-center text-gray-400 py-8 text-sm">
				Waiting for transcription data...
			</div>
		`;
		return;
	}

	// Ensure transcript is an array
	if (!Array.isArray(transcript)) {
		console.error(
			"[ERROR] displayTranscript: transcript is not an array:",
			typeof transcript,
			transcript
		);
		transcriptionContainer.innerHTML = `
			<div class="text-center text-red-500 py-8 text-sm">
				Error: Invalid transcript format (expected array)
			</div>
		`;
		return;
	}

	// Handle empty transcript array
	if (transcript.length === 0) {
		transcriptionContainer.innerHTML = `
			<div class="text-center text-gray-400 py-8 text-sm">
				Listening... Start speaking to see transcription.
			</div>
		`;
		return;
	}

	transcriptionContainer.innerHTML = "";

	transcript.forEach((entry, index) => {
		// Validate each entry has required fields
		if (!entry || typeof entry !== "object") {
			console.warn(`[WARN] Invalid transcript entry at index ${index}:`, entry);
			return;
		}

		const entryDiv = document.createElement("div");
		entryDiv.className = `transcript-entry ${entry.role || "unknown"}`;

		const roleDiv = document.createElement("div");
		roleDiv.className = `transcript-role ${entry.role || "unknown"}`;
		roleDiv.textContent =
			entry.role === "agent"
				? "AI Agent"
				: entry.role === "user"
				? "You"
				: entry.role || "Unknown";

		const contentDiv = document.createElement("div");
		contentDiv.className = "transcript-content";
		contentDiv.textContent =
			entry.content || entry.text || entry.message || "[No content]";

		entryDiv.appendChild(roleDiv);
		entryDiv.appendChild(contentDiv);
		transcriptionContainer.appendChild(entryDiv);
	});

	// Scroll to bottom
	transcriptionContainer.scrollTop = transcriptionContainer.scrollHeight;
}

/**
 * Display session metadata received from SDK
 *
 * Session metadata contains additional information about the voice session
 * (e.g., session ID, agent info, custom parameters, etc.)
 *
 * @param {object} metadata - Key-value pairs of session metadata
 *
 * SDK EVENT:
 * client.on('session_metadata', (metadata) => {
 *   displaySessionMetadata(metadata);
 * });
 */
function displaySessionMetadata(metadata) {
	if (!metadata || typeof metadata !== "object") {
		sessionMetadataContent.innerHTML = `
			<p class="text-center text-gray-400 py-4 text-sm">No metadata available</p>
		`;
		return;
	}

	sessionMetadataContent.innerHTML = "";

	Object.entries(metadata).forEach(([key, value]) => {
		const metadataItem = document.createElement("div");
		metadataItem.className = "metadata-item";

		const keyDiv = document.createElement("div");
		keyDiv.className = "metadata-key";
		keyDiv.textContent = key;

		const valueDiv = document.createElement("div");
		valueDiv.className = "metadata-value";
		valueDiv.textContent =
			typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);

		metadataItem.appendChild(keyDiv);
		metadataItem.appendChild(valueDiv);
		sessionMetadataContent.appendChild(metadataItem);
	});

	sessionMetadata.classList.remove("hidden");
}

/*
==========================================
7. AUDIO VISUALIZATION
==========================================
Real-time audio visualization using SDK's audioAnalyzer.

SDK INTEGRATION:
- Volume: client.audioAnalyzer.calculateVolume() - Returns 0.0 to 1.0
- Waveform: client.audioAnalyzer.getPCMFrame() - Returns Float32Array of PCM samples
- Agent Speaking: client.isAgentSpeaking - Boolean property

IMPLEMENTATION:
- Uses requestAnimationFrame for ~60fps updates
- Canvas 2D API for waveform rendering
- Gradient volume bar with color coding (green → yellow → red)
*/

/**
 * Update volume meter and waveform visualization
 *
 * This function is called ~60 times per second via requestAnimationFrame.
 * It updates both the volume meter bar and the waveform canvas.
 *
 * SDK METHODS USED:
 * - client.audioAnalyzer.calculateVolume() - RMS volume (0.0 to 1.0)
 * - client.audioAnalyzer.getPCMFrame() - PCM audio samples for waveform
 *
 * Called from: startVolumeMeterAnimation() animation loop
 */
function updateVolumeMeter() {
	if (!client || !client.audioAnalyzer || !isConnected) {
		volumeBar.style.width = "0%";
		volumeText.textContent = "0%";
		return;
	}

	try {
		// Update volume meter using SDK's audio analyzer
		const volume = client.audioAnalyzer.calculateVolume(); // Returns 0.0 to 1.0
		const percentage = Math.round(volume * 100);

		volumeBar.style.width = `${percentage}%`;
		volumeText.textContent = `${percentage}%`;

		// Update waveform visualization using PCM data from SDK
		const pcmData = client.audioAnalyzer.getPCMFrame(); // Returns Float32Array
		if (pcmData && pcmData.length > 0) {
			drawWaveform(pcmData);
		}
	} catch (error) {
		console.error("Error updating audio visualization:", error);
	}
}

/**
 * Update agent speaking indicator
 *
 * Shows/hides the "Agent is speaking" indicator based on SDK's isAgentSpeaking property.
 *
 * SDK PROPERTY:
 * - client.isAgentSpeaking - Boolean indicating if AI agent is currently speaking
 *
 * SDK EVENTS:
 * - agent_speech_started - Agent began speaking
 * - agent_speech_ended - Agent stopped speaking
 */
function updateAgentSpeakingIndicator() {
	if (!client || !isConnected) {
		agentSpeakingIndicator.classList.add("hidden");
		return;
	}

	// SDK provides isAgentSpeaking property
	if (client.isAgentSpeaking) {
		agentSpeakingIndicator.classList.remove("hidden");
	} else {
		agentSpeakingIndicator.classList.add("hidden");
	}
}

/**
 * Draw audio waveform on canvas
 *
 * Visualizes the audio PCM data as a waveform on the canvas element.
 *
 * @param {Float32Array} pcmData - PCM audio samples from client.audioAnalyzer.getPCMFrame()
 *
 * VISUALIZATION:
 * - Each PCM sample is normalized from [-1, 1] to canvas height
 * - Uses linear interpolation to draw smooth waveform
 * - Color: Indigo (#667eea)
 *
 * CANVAS INITIALIZATION:
 * - Canvas dimensions set lazily on first draw (avoids 0x0 when parent is hidden)
 * - Default size: 700px wide × 80px tall
 */
function drawWaveform(pcmData) {
	if (!canvasContext || !waveformCanvas) return;

	// Ensure canvas has proper dimensions (initialize if needed)
	if (waveformCanvas.width === 0 || waveformCanvas.height === 0) {
		waveformCanvas.width = waveformCanvas.offsetWidth || 700;
		waveformCanvas.height = waveformCanvas.offsetHeight || 80;
	}

	const width = waveformCanvas.width;
	const height = waveformCanvas.height;

	// Clear canvas
	canvasContext.clearRect(0, 0, width, height);

	// Draw waveform
	canvasContext.strokeStyle = "#667eea";
	canvasContext.lineWidth = 2;
	canvasContext.beginPath();

	const sliceWidth = width / pcmData.length;
	let x = 0;

	for (let i = 0; i < pcmData.length; i++) {
		const v = pcmData[i] * 0.5 + 0.5; // Normalize to 0-1
		const y = v * height;

		if (i === 0) {
			canvasContext.moveTo(x, y);
		} else {
			canvasContext.lineTo(x, y);
		}

		x += sliceWidth;
	}

	canvasContext.stroke();
}

/*
==========================================
8. SDK EVENT HANDLING
==========================================
All 11 SDK events are handled here using client.on(eventName, callback).

SDK EVENTS (Complete List):
1. session_connected - Session successfully established
2. session_disconnected - Session terminated
3. session_error - Error occurred during session
4. microphone_permission_denied - Browser denied mic access
5. agent_speech_started - AI agent began speaking
6. agent_speech_ended - AI agent stopped speaking
7. transcript_updated - New transcript data available
8. session_metadata - Session metadata received
9. audio_stream - Raw audio PCM data stream
10. connection_lost - Network connection lost
11. connection_restored - Network connection restored

USAGE PATTERN:
client.on('event_name', (payload) => {
  // Handle event
});
*/

/**
 * Setup all SDK event listeners
 *
 * This function registers callbacks for all 11 SDK events.
 * Must be called after creating VerbexWebClient instance but before initiateSession().
 *
 * LIFECYCLE:
 * 1. Create client: client = new VerbexWebClient()
 * 2. Setup listeners: setupEventListeners()
 * 3. Initiate session: client.initiateSession(config)
 */
function setupEventListeners() {
	if (!client) return;

	/*
	 * EVENT 1: session_connected
	 * Fired when: WebRTC connection successfully established and session is ready
	 * Payload: None
	 */
	client.on("session_connected", () => {
		isConnected = true;
		updateStatus("connected", "Connected");
		updateButtonStates();
		logEvent("session_connected");
		// Show microphone active status (SDK has enabled local microphone)
		microphoneStatus.classList.remove("hidden");
		transcriptionSection.classList.remove("hidden");
		// Show audio viz, hide placeholder
		if (audioViz) {
			audioViz.classList.remove("hidden");
		}
		if (audioVizPlaceholder) {
			audioVizPlaceholder.classList.add("hidden");
		}
		// Clear transcription
		displayTranscript([]);

		// Start volume meter animation
		startVolumeMeterAnimation();
	});

	/*
	 * EVENT 2: microphone_permission_denied
	 * Fired when: Browser denies microphone access permission
	 * Payload: { message: string }
	 */
	client.on("microphone_permission_denied", (payload) => {
		logEvent("microphone_permission_denied", payload);
		alert(
			"Microphone permission denied. Please allow microphone access in your browser settings."
		);
	});

	/*
	 * EVENT 3: session_disconnected
	 * Fired when: Session is terminated (by user or server)
	 * Payload: None
	 */
	client.on("session_disconnected", () => {
		isConnected = false;
		updateStatus("disconnected", "Disconnected");
		updateButtonStates();
		logEvent("session_disconnected");
		microphoneStatus.classList.add("hidden");
		transcriptionSection.classList.add("hidden");
		sessionMetadata.classList.add("hidden");
		cleanupAudioVisualization();
		updateAgentSpeakingIndicator();
	});

	/*
	 * EVENT 4: session_error
	 * Fired when: An error occurs during the session
	 * Payload: Error object with message property
	 */
	client.on("session_error", (error) => {
		logEvent("session_error", {
			message: error?.message || String(error),
			error: error,
		});
		updateStatus("disconnected", `Error: ${error?.message || "Unknown error"}`);
	});

	/*
	 * EVENT 5: agent_speech_started
	 * Fired when: AI agent begins speaking
	 * Payload: None
	 * Note: Use client.isAgentSpeaking property to check current state
	 */
	client.on("agent_speech_started", () => {
		logEvent("agent_speech_started");
		updateAgentSpeakingIndicator();
	});

	/*
	 * EVENT 6: agent_speech_ended
	 * Fired when: AI agent stops speaking
	 * Payload: None
	 */
	client.on("agent_speech_ended", () => {
		logEvent("agent_speech_ended");
		updateAgentSpeakingIndicator();
	});

	/*
	 * EVENT 7: transcript_updated
	 * Fired when: New transcript data is available (real-time speech-to-text)
	 * Payload: { transcript: Array<TranscriptEntry> }
	 * TranscriptEntry: { role: "user" | "agent", content: string }
	 */
	client.on("transcript_updated", (payload) => {
		// Debug: Log raw payload to understand server response format
		console.log("[DEBUG] Raw transcript_updated payload:", payload);

		if (payload?.transcript) {
			logEvent("transcript_updated", payload.transcript);
			displayTranscript(payload.transcript);
		} else {
			// Log error when transcript field is missing or invalid
			console.error(
				"[ERROR] Invalid transcript payload - missing 'transcript' field:",
				payload
			);
			logEvent("transcript_error", {
				message: "Invalid payload: missing transcript field",
				rawPayload: payload,
			});
		}
	});

	/*
	 * EVENT 8: session_metadata
	 * Fired when: Session metadata is received from the server
	 * Payload: Object containing session metadata (key-value pairs)
	 * Examples: session ID, agent info, custom parameters
	 */
	client.on("session_metadata", (metadata) => {
		logEvent("session_metadata", metadata);
		displaySessionMetadata(metadata);
	});

	/*
	 * EVENT 9: audio_stream
	 * Fired when: Raw PCM audio data is available (if enableRawAudio: true in config)
	 * Payload: Float32Array containing PCM samples
	 * Note: This event fires frequently (~60fps). Use for real-time audio visualization.
	 */
	client.on("audio_stream", (pcmData) => {
		if (pcmData instanceof Float32Array) {
			drawWaveform(pcmData);
		}
	});

	/*
	 * EVENT 10: connection_lost
	 * Fired when: Network connection is lost (SDK will automatically attempt to reconnect)
	 * Payload: None
	 */
	client.on("connection_lost", () => {
		logEvent("connection_lost");
		updateStatus("connecting", "Connection Lost - Reconnecting...");
	});

	/*
	 * EVENT 11: connection_restored
	 * Fired when: Network connection is restored after being lost
	 * Payload: None
	 */
	client.on("connection_restored", () => {
		logEvent("connection_restored");
		updateStatus("connected", "Connected");
	});
}

/*
==========================================
9. AUDIO VISUALIZATION HELPERS
==========================================
Helper functions for managing the audio visualization animation loop.
*/

/**
 * Start volume meter animation loop
 *
 * Uses requestAnimationFrame for smooth ~60fps updates.
 * Updates both volume meter and waveform visualization.
 *
 * ANIMATION LIFECYCLE:
 * - Started when: session_connected event fires
 * - Stopped when: session_disconnected or cleanupAudioVisualization()
 */
function startVolumeMeterAnimation() {
	function animateVolume() {
		if (!isConnected || !client) {
			return;
		}

		updateVolumeMeter();
		animationFrameId = requestAnimationFrame(animateVolume);
	}

	animateVolume();
}

/**
 * Cleanup audio visualization
 *
 * Stops the animation loop, clears the canvas, and resets UI state.
 * Called when session disconnects or encounters an error.
 */
function cleanupAudioVisualization() {
	// Stop animation loop
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	// Clear waveform canvas
	if (canvasContext && waveformCanvas) {
		canvasContext.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
	}

	// Hide audio viz, show placeholder
	if (audioViz) {
		audioViz.classList.add("hidden");
	}
	if (audioVizPlaceholder) {
		audioVizPlaceholder.classList.remove("hidden");
	}

	// Reset volume meter
	volumeBar.style.width = "0%";
	volumeText.textContent = "0%";
}

/*
==========================================
10. SESSION MANAGEMENT
==========================================
Core functions for managing Verbex SDK sessions.

SDK METHODS USED:
- new VerbexWebClient() - Creates client instance
- client.initiateSession(config) - Starts voice session
- client.terminateSession() - Ends voice session
- client.mute() - Mutes microphone
- client.unmute() - Unmutes microphone
*/

/**
 * Connect to Verbex voice AI session
 *
 * This is the main function that initializes and starts a Verbex session.
 *
 * STEPS:
 * 1. Validate session token input
 * 2. Check microphone permissions
 * 3. Create VerbexWebClient instance
 * 4. Setup event listeners
 * 5. Build session configuration
 * 6. Initiate session with SDK
 *
 * SDK SESSION CONFIG:
 * {
 *   sessionToken: string (required) - JWT from your server
 *   audioSampleRate: number (optional) - 16000, 24000, or 48000 Hz
 *   inputDeviceId: string (optional) - Microphone device ID
 *   outputDeviceId: string (optional) - Speaker device ID
 *   enableRawAudio: boolean (optional) - Enable PCM audio stream for visualization
 * }
 */
async function connect() {
	try {
		// Validate inputs
		const sessionToken = sessionTokenInput.value.trim();
		if (!sessionToken) {
			alert("Please enter a session token");
			return;
		}

		// Check microphone permission before connecting
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			// Stop test stream - SDK will request again
			stream.getTracks().forEach((track) => track.stop());
			logEvent("microphone_check", "Microphone access verified");
		} catch (error) {
			let message = "Microphone access is required for Verbex to work.";
			if (
				error.name === "NotAllowedError" ||
				error.name === "PermissionDeniedError"
			) {
				message =
					"Microphone permission denied. Please allow microphone access in your browser settings and try again.";
			} else if (error.name === "NotFoundError") {
				message =
					"No microphone found. Please connect a microphone and try again.";
			} else if (error.name === "NotReadableError") {
				message =
					"Microphone is already in use by another application. Please close other apps using the microphone.";
			}
			alert(message);
			logEvent("microphone_permission_error", { error: error.name, message });
			return;
		}

		// STEP 3: Create VerbexWebClient instance
		client = new VerbexWebClient();

		// STEP 4: Setup all SDK event listeners (must be done before initiateSession)
		setupEventListeners();

		// STEP 5: Build session configuration from UI inputs
		const sampleRate = Number.parseInt(sampleRateInput.value) || 24000;
		const inputDeviceId = inputDeviceSelect.value || undefined; // Empty string = use default
		const outputDeviceId = outputDeviceSelect.value || undefined; // Empty string = use default

		const sessionConfig = {
			sessionToken, // REQUIRED: JWT token from your server
			audioSampleRate: sampleRate, // Optional: 16000, 24000 (default), or 48000 Hz
			enableRawAudio: true, // Enable PCM audio stream for waveform visualization
		};

		// Add device IDs if selected (optional)
		if (inputDeviceId) {
			sessionConfig.inputDeviceId = inputDeviceId;
		}
		if (outputDeviceId) {
			sessionConfig.outputDeviceId = outputDeviceId;
		}

		// Clear event log and update UI
		eventLog.innerHTML = "";
		logEvent("connecting", "Attempting to connect...");
		logEvent("session_config", sessionConfig);

		updateStatus("connecting", "Connecting...");
		updateButtonStates();

		// STEP 6: Initiate session with SDK (async operation)
		// This establishes WebRTC connection and triggers session_connected event on success
		await client.initiateSession(sessionConfig);

		logEvent("connection_success", "Successfully connected to Verbex");
	} catch (error) {
		console.error("Connection error:", error);
		logEvent("connection_error", {
			message: error?.message || String(error),
			error: error,
		});
		updateStatus(
			"disconnected",
			`Connection failed: ${error?.message || "Unknown error"}`
		);
		updateButtonStates();
		client = null;
		cleanupAudioVisualization();
	}
}

/**
 * Disconnect from Verbex session
 *
 * Terminates the active voice session and cleans up resources.
 *
 * SDK METHOD:
 * client.terminateSession() - Gracefully ends the session
 *
 * This triggers the session_disconnected event.
 */
function disconnect() {
	if (client) {
		try {
			// Call SDK method to terminate session
			client.terminateSession();
			logEvent("disconnect", "Disconnected from Verbex");
		} catch (error) {
			console.error("Disconnect error:", error);
			logEvent("disconnect_error", {
				message: error?.message || String(error),
			});
		}
		client = null; // Clear client instance
	}

	// Update UI state
	isConnected = false;
	updateStatus("disconnected", "Disconnected");
	updateButtonStates();
	cleanupAudioVisualization();
}

/**
 * Toggle microphone mute/unmute
 *
 * SDK METHODS:
 * - client.mute() - Mutes local microphone (agent can't hear you)
 * - client.unmute() - Unmutes local microphone
 *
 * Note: Muting only affects the microphone input, not the speaker output.
 */
function toggleMute() {
	if (!client || !isConnected) return;

	if (isMuted) {
		// Unmute microphone
		client.unmute();
		isMuted = false;
		logEvent("unmuted", "Microphone unmuted");
	} else {
		// Mute microphone
		client.mute();
		isMuted = true;
		logEvent("muted", "Microphone muted");
	}

	// Update button appearance
	updateButtonStates();
}

/*
==========================================
11. APPLICATION INITIALIZATION
==========================================
Setup event listeners and initialize the app when page loads.
*/

// Attach click event handlers to buttons
connectBtn.addEventListener("click", connect);
disconnectBtn.addEventListener("click", disconnect);
muteBtn.addEventListener("click", toggleMute);

// Initialize UI state (hide disconnect/mute buttons, show connect button)
updateButtonStates();

// Log app ready message
logEvent(
	"app_initialized",
	"Test app ready. Enter credentials and click Connect."
);

// Enumerate available audio devices and populate dropdowns
enumerateDevices();

/*
==========================================
END OF FILE
==========================================

QUICK START GUIDE:
1. Get a session token from your server (JWT)
2. Paste token into the Session Token input field
3. (Optional) Select specific microphone/speaker devices
4. Click "Connect" button
5. SDK will establish WebRTC connection and trigger session_connected event
6. Start speaking - transcription and audio visualization will appear
7. Click "Disconnect" when done

SDK DOCUMENTATION:
- npm: @verbex-ai/verbex-js-sdk
- GitHub: https://github.com/verbex-ai/verbex-js-sdk
- Docs: https://docs.verbex.ai

SUPPORT:
For issues or questions, please visit the GitHub repository.
*/
