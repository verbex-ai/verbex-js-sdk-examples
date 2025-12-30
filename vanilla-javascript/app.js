import { VerbexWebClient } from "@verbex-ai/verbex-js-sdk";

// DOM elements
const sessionTokenInput = document.getElementById("sessionToken");
const sampleRateInput = document.getElementById("sampleRate");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const muteBtn = document.getElementById("muteBtn");
const statusDiv = document.getElementById("status");
const eventLog = document.getElementById("eventLog");
const audioViz = document.getElementById("audioViz");
const waveformCanvas = document.getElementById("waveform");
const microphoneStatus = document.getElementById("microphoneStatus");
const transcriptionSection = document.getElementById("transcriptionSection");
const transcriptionContainer = document.getElementById(
	"transcriptionContainer"
);

// Verbex client instance
let client = null;
let isConnected = false;
let isMuted = false;
let animationFrameId = null;
let canvasContext = null;

// Initialize canvas for audio visualization
if (waveformCanvas) {
	canvasContext = waveformCanvas.getContext("2d");
	waveformCanvas.width = waveformCanvas.offsetWidth;
	waveformCanvas.height = waveformCanvas.offsetHeight;
}

/**
 * Log an event to the event log UI
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
			dataSpan.textContent = JSON.stringify(data, null, 2);
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
	eventLog.scrollTop = eventLog.scrollHeight;
}

/**
 * Update UI status
 */
function updateStatus(status, message) {
	statusDiv.className = `status ${status}`;
	statusDiv.textContent = `Status: ${message}`;
}

/**
 * Update button states
 */
function updateButtonStates() {
	connectBtn.disabled = isConnected;
	disconnectBtn.disabled = !isConnected;
	muteBtn.disabled = !isConnected;
	muteBtn.textContent = isMuted ? "Unmute" : "Mute";
	muteBtn.className = isMuted ? "btn-primary" : "btn-warning";
}

/**
 * Display transcript in the transcription section
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
			<div class="transcription-placeholder">
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
			<div class="transcription-placeholder error">
				Error: Invalid transcript format (expected array)
			</div>
		`;
		return;
	}

	// Handle empty transcript array
	if (transcript.length === 0) {
		transcriptionContainer.innerHTML = `
			<div class="transcription-placeholder">
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
 * Draw audio waveform on canvas
 */
function drawWaveform(pcmData) {
	if (!canvasContext || !waveformCanvas) return;

	const width = waveformCanvas.width;
	const height = waveformCanvas.height;

	canvasContext.clearRect(0, 0, width, height);
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

/**
 * Setup event listeners for VerbexWebClient
 */
function setupEventListeners() {
	if (!client) return;

	// Session lifecycle events
	client.on("session_connected", () => {
		isConnected = true;
		updateStatus("connected", "Connected");
		updateButtonStates();
		logEvent("session_connected");
		// Show microphone active status (SDK has enabled local microphone)
		microphoneStatus.classList.add("active");
		transcriptionSection.style.display = "block";
		       if (audioViz) {
			       audioViz.classList.add("active");
		       }
		// Clear transcription
		displayTranscript([]);
	});

	// Microphone permission denied event
	client.on("microphone_permission_denied", (payload) => {
		logEvent("microphone_permission_denied", payload);
		alert(
			"Microphone permission denied. Please allow microphone access in your browser settings."
		);
	});

	client.on("session_disconnected", () => {
		isConnected = false;
		updateStatus("disconnected", "Disconnected");
		updateButtonStates();
		logEvent("session_disconnected");
		microphoneStatus.classList.remove("active");
		transcriptionSection.style.display = "none";
		cleanupAudioVisualization();
	});

	client.on("session_error", (error) => {
		logEvent("session_error", {
			message: error?.message || String(error),
			error: error,
		});
		updateStatus("disconnected", `Error: ${error?.message || "Unknown error"}`);
	});

	// Speech events
	client.on("agent_speech_started", () => {
		logEvent("agent_speech_started");
		updateStatus("connected", "Connected - AI Agent Speaking");
	});

	client.on("agent_speech_ended", () => {
		logEvent("agent_speech_ended");
		updateStatus("connected", "Connected");
	});

	// Transcript events
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

	// Metadata events
	client.on("session_metadata", (metadata) => {
		logEvent("session_metadata", metadata);
	});

	// Audio stream events
	client.on("audio_stream", (pcmData) => {
		if (pcmData instanceof Float32Array) {
			drawWaveform(pcmData);
		}
	});

	// Connection events
	client.on("connection_lost", () => {
		logEvent("connection_lost");
		updateStatus("connecting", "Connection Lost - Reconnecting...");
	});

	client.on("connection_restored", () => {
		logEvent("connection_restored");
		updateStatus("connected", "Connected");
	});
}

/**
 * Cleanup audio visualization
 */
function cleanupAudioVisualization() {
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
	if (canvasContext && waveformCanvas) {
		canvasContext.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
	}
	       if (audioViz) {
		       audioViz.classList.remove("active");
	       }
}

/**
 * Connect to Verbex
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

		// Create client instance
		client = new VerbexWebClient();
		setupEventListeners();

		// Get session config
		const sampleRate = Number.parseInt(sampleRateInput.value) || 24000;

		const sessionConfig = {
			sessionToken,
			audioSampleRate: sampleRate,
			enableRawAudio: true, // Always enable raw audio for visualization
		};

		// Clear event log
		eventLog.innerHTML = "";
		logEvent("connecting", "Attempting to connect...");

		// Update UI
		updateStatus("connecting", "Connecting...");
		updateButtonStates();

		// Initiate session
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
 * Disconnect from Verbex
 */
function disconnect() {
	if (client) {
		try {
			client.terminateSession();
			logEvent("disconnect", "Disconnected from Verbex");
		} catch (error) {
			console.error("Disconnect error:", error);
			logEvent("disconnect_error", {
				message: error?.message || String(error),
			});
		}
		client = null;
	}

	isConnected = false;
	updateStatus("disconnected", "Disconnected");
	updateButtonStates();
	cleanupAudioVisualization();
}

// Button event listeners
connectBtn.addEventListener("click", connect);
disconnectBtn.addEventListener("click", disconnect);
muteBtn.addEventListener("click", toggleMute);

/**
 * Toggle mute/unmute
 */
function toggleMute() {
	if (!client || !isConnected) return;

	if (isMuted) {
		client.unmute();
		isMuted = false;
		logEvent("unmuted", "Microphone unmuted");
	} else {
		client.mute();
		isMuted = true;
		logEvent("muted", "Microphone muted");
	}
	updateButtonStates();
}

// Initialize UI state
updateButtonStates();
logEvent(
	"app_initialized",
	"Test app ready. Enter credentials and click Connect."
);
