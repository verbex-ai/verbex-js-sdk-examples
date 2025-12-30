# Verbex Client JS SDK Examples

A collection of example applications demonstrating how to integrate the [Verbex Client JS SDK](https://www.npmjs.com/package/typetech-client-js-sdk) into various JavaScript frameworks and environments.

## Overview

This repository contains example implementations showing how to use the Verbex Client JS SDK for building voice AI applications. Each example demonstrates core features including:

- 🎤 Real-time voice communication
- 🔊 Audio visualization
- 📝 Live transcription
- 🔇 Mute/unmute controls
- 📡 WebSocket connection management

## Examples

| Example                | Description                              | Directory                                      |
| ---------------------- | ---------------------------------------- | ---------------------------------------------- |
| **Vanilla JavaScript** | Simple HTML/JS implementation using Vite | [`vanilla-javascript/`](./vannila-javascript/) |

## Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm, npm, or yarn package manager
- A Verbex session token (obtained from your backend)
- A modern web browser with WebRTC support

### Running an Example

1. Clone this repository:

   ```bash
   git clone https://github.com/typetechit/verbex-client-js-sdk-examples.git
   cd verbex-client-js-sdk-examples
   ```

2. Navigate to the example you want to run:

   ```bash
   cd vannila-javascript
   ```

3. Install dependencies:

   ```bash
   pnpm install
   # or
   npm install
   ```

4. Start the development server:

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:8000`).

## SDK Installation

To use the Verbex Client JS SDK in your own project:

```bash
# Using pnpm
pnpm add verbex-client-js-sdk

# Using npm
npm install verbex-client-js-sdk

# Using yarn
yarn add verbex-client-js-sdk
```

## Basic Usage

```javascript
import { VerbexWebClient } from "verbex-client-js-sdk";

// Create a new client instance
const client = new VerbexWebClient();

// Set up event listeners
client.on("connected", () => {
	console.log("Connected to Verbex");
});

client.on("transcript", (data) => {
	console.log("Transcript:", data);
});

client.on("error", (error) => {
	console.error("Error:", error);
});

// Connect with your session token
await client.connect({
	sessionToken: "your-session-token",
	sampleRate: 24000,
});

// Disconnect when done
client.disconnect();
```

## Features Demonstrated

### Audio Visualization

Real-time waveform visualization of audio input/output using Canvas API.

### Transcription

Live speech-to-text transcription with support for interim and final results.

### Connection Management

Proper handling of WebSocket connections, reconnection logic, and error states.

### Mute Controls

Toggle microphone input without disconnecting from the session.

## Contributing

Contributions are welcome! If you'd like to add an example for a specific framework or improve existing ones:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License - see individual example directories for specific license information.

## Resources

- [Verbex Documentation](https://docs.verbex.ai/introduction)
- [SDK npm Package](https://www.npmjs.com/package/typetech-client-js-sdk)
- [Report Issues](https://github.com/typetechit/verbex-client-js-sdk-examples/issues)
