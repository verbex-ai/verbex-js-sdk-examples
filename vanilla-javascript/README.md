# Verbex Client JS SDK - Vanilla JavaScript Example

A simple HTML/JavaScript example application demonstrating the Verbex Client JS SDK. This application allows you to test voice AI calling features using a session token.

## Prerequisites

- Node.js 18+ installed
- A Verbex session token (obtained from your backend)
- A modern web browser with WebRTC support

## Setup

1. Install dependencies:

   ```bash
   # Using pnpm (recommended)
   pnpm install

   # Or using npm
   npm install
   ```

## Running the App

Start the development server using Vite:

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

Then open your browser and navigate to:

```
http://localhost:8000
```

## Usage

1. **Enter Session Token:**

   - Obtain a session token from your backend API
   - Paste the token in the "Session Token" field

2. **Configure Audio Settings:**

   - Set the audio sample rate (default: 24000)

3. **Connect:**

   - Click the "Connect" button
   - Grant microphone permissions when prompted
   - The status will update to "Connected" when ready

4. **During the Call:**

   - Use the "Mute" button to toggle your microphone
   - View real-time transcription as the conversation progresses
   - Monitor SDK events in the Event Log section

5. **Disconnect:**
   - Click the "Disconnect" button when done
   - The session will be terminated

## Features

- **Session Token Authentication**: Secure connection using pre-obtained session tokens
- **Real-time Transcription**: Live transcription display during conversations
- **Real-time Event Logging**: See all SDK events with timestamps
- **Mute/Unmute Control**: Toggle microphone during active calls
- **Connection Status**: Real-time status updates (Disconnected/Connecting/Connected)
- **Error Handling**: Clear error messages for connection issues

## Troubleshooting

### "Failed to fetch" or CORS errors

- Make sure you're running the app through the Vite dev server (`pnpm dev`)
- Do not open the HTML file directly in the browser

### Connection errors

- Verify your session token is valid and not expired
- Check your internet connection
- Ensure microphone permissions are granted in your browser

### No audio

- Check browser permissions for microphone access
- Verify your audio devices are working
- Try refreshing the page and granting permissions again

## Browser Support

- Chrome/Edge 74+
- Firefox 78+
- Safari 14.1+
- Opera 62+

Requires WebRTC and Web Audio API support.
