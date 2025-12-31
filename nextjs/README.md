# Verbex AI - Next.js App Router Example

A complete Next.js App Router implementation demonstrating the Verbex JS SDK integration for real-time voice AI communication.

## Features

This example showcases all capabilities of the Verbex JS SDK:

- ✅ **Real-time voice communication** with AI agents
- ✅ **Audio waveform visualization** using Canvas API
- ✅ **Volume level monitoring** with gradient meter
- ✅ **Live transcription** with user/agent message distinction
- ✅ **Session metadata display** for debugging
- ✅ **Audio device selection** (microphone and speaker)
- ✅ **Mute/unmute controls** for privacy
- ✅ **All 11 SDK events** properly handled
- ✅ **Connection state management** with visual indicators
- ✅ **Error handling** with user-friendly messages
- ✅ **Responsive design** with Tailwind CSS
- ✅ **TypeScript** for type safety

## Architecture

This example follows Next.js App Router best practices:

### Next.js App Router Structure

```
nextjs/
├── src/
│   ├── app/                  # App Router directory
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main page (client component)
│   │   └── globals.css       # Global styles with Tailwind
│   ├── components/           # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── ConfigPanel.tsx
│   │   ├── AudioVisualizer.tsx
│   │   ├── Transcription.tsx
│   │   ├── SessionMetadata.tsx
│   │   └── EventLog.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useVerbexClient.ts    # Main SDK integration
│   │   ├── useAudioDevices.ts    # Device enumeration
│   │   ├── useEventLog.ts        # Event logging
│   │   └── useAudioVisualizer.ts # Audio visualization
│   ├── utils/                # Utility functions
│   │   └── canvas.ts         # Waveform drawing
│   └── types/                # TypeScript type definitions
│       └── index.ts
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

### Key Architectural Patterns

1. **Client Components**: All interactive components use `'use client'` directive
2. **Custom Hooks**: Logic separation for SDK client, devices, events, and visualization
3. **Component Composition**: Small, focused components for maintainability
4. **TypeScript**: Full type safety with SDK types
5. **Tailwind CSS**: Utility-first styling with custom animations

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm installed
- A Verbex AI session token (get one from [Verbex Dashboard](https://dashboard.verbex.ai))
- Microphone access in your browser

### Installation

1. Navigate to the Next.js example directory:

```bash
cd verbex-js-sdk-examples/nextjs
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Start the development server:

```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Enter Session Token**: Paste your Verbex session token in the input field
2. **Configure Audio** (optional):
   - Select your preferred microphone from the input device dropdown
   - Select your preferred speaker from the output device dropdown
   - Adjust audio sample rate if needed (default: 24000 Hz)
3. **Connect**: Click the "Connect to Verbex" button
4. **Grant Microphone Permission**: Allow microphone access when prompted by your browser
5. **Start Talking**: Once connected, speak naturally with the AI agent
6. **Monitor Activity**:
   - Watch the audio waveform visualize your voice
   - See live transcription of the conversation
   - Track SDK events in the event log
7. **Mute/Unmute**: Use the mute button to control your microphone
8. **Disconnect**: Click "Disconnect" when you're done

## SDK Integration Guide

This example demonstrates how to integrate the Verbex JS SDK with Next.js App Router:

### 1. Client Component Setup

Since the SDK requires browser APIs, all components using it must be client components:

```tsx
'use client';

import { VerbexWebClient } from '@verbex-ai/verbex-js-sdk';
```

### 2. Custom Hook Pattern

The `useVerbexClient` hook encapsulates all SDK logic:

```tsx
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
```

### 3. Event Handling

All 11 SDK events are handled in the `useVerbexClient` hook:

```tsx
client.on('session_connected', handleConnected);
client.on('session_disconnected', handleDisconnected);
client.on('session_error', handleError);
client.on('microphone_permission_denied', handleMicPermissionDenied);
client.on('agent_speech_started', handleAgentSpeechStarted);
client.on('agent_speech_ended', handleAgentSpeechEnded);
client.on('transcript_updated', handleTranscriptUpdated);
client.on('session_metadata', handleMetadata);
client.on('audio_stream', handleAudioStream);
client.on('connection_lost', handleConnectionLost);
client.on('connection_restored', handleConnectionRestored);
```

### 4. Audio Visualization

The `useAudioVisualizer` hook manages the animation loop:

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);
const volume = useAudioVisualizer(client?.audioAnalyzer, isConnected, canvasRef);
```

### 5. Device Selection

The `useAudioDevices` hook handles device enumeration:

```tsx
const {
  inputDevices,
  outputDevices,
  selectedInput,
  selectedOutput,
  setSelectedInput,
  setSelectedOutput,
} = useAudioDevices();
```

## Next.js App Router Specifics

This example is optimized for Next.js 15+ with the App Router:

- **Server Components**: Layout uses server components for better performance
- **Client Components**: Interactive components marked with `'use client'`
- **Metadata API**: SEO-friendly metadata in `layout.tsx`
- **CSS Modules**: Global CSS with Tailwind in `app/globals.css`
- **Type Safety**: Full TypeScript support with Next.js types

## Building for Production

Build the application for production:

```bash
npm run build
# or
pnpm build
```

Start the production server:

```bash
npm start
# or
pnpm start
```

## Customization

### Styling

- Edit `src/app/globals.css` for custom styles
- Modify `tailwind.config.ts` for theme customization
- Update component classes for different designs

### Layout

- Change the grid layout in `src/app/page.tsx`
- Reorder or hide components as needed
- Adjust responsive breakpoints

### Features

- Add new event handlers in `useVerbexClient`
- Create additional visualization modes
- Implement custom audio processing
- Add conversation history persistence

## Troubleshooting

### Microphone Permission Issues

If microphone permission is denied:

1. Check your browser's site settings
2. Ensure HTTPS or localhost is being used
3. Try a different browser (Chrome/Edge recommended)

### Connection Errors

If connection fails:

1. Verify your session token is valid
2. Check your network connection
3. Look at the event log for detailed error messages
4. Ensure WebSocket connections are not blocked by firewall

### Audio Issues

If audio isn't working:

1. Test your microphone in other applications
2. Try selecting a different input device
3. Check your browser's audio settings
4. Ensure the sample rate matches your device capabilities

## Learn More

- [Verbex JS SDK Documentation](https://docs.verbex.ai/sdk/javascript)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Guide](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Support

For issues or questions:

- 📧 Email: support@verbex.ai
- 📖 Docs: https://docs.verbex.ai
- 💬 Discord: https://discord.gg/verbex

## License

This example is part of the Verbex JS SDK and is licensed under the same terms.
