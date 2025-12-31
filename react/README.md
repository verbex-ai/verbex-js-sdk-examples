# Verbex AI - React Example

A complete React implementation demonstrating the Verbex JS SDK integration with modern React patterns, custom hooks, and TypeScript.

## Features

✅ **All SDK Features Implemented:**
- Real-time voice communication with AI agents
- Audio waveform visualization
- Volume level monitoring
- Live transcription display
- Session metadata display
- Audio device selection (microphone/speaker)
- Mute/unmute controls
- All 11 SDK events handled
- Connection state management
- Error handling

✅ **React Best Practices:**
- Custom hooks for logic separation
- Component composition
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Proper cleanup and memory management

## Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **@verbex-ai/verbex-js-sdk** - Voice AI SDK

## Project Structure

```
react/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # App header with status
│   │   ├── ConfigPanel.tsx  # Session config & controls
│   │   ├── AudioVisualizer.tsx  # Waveform & volume
│   │   ├── Transcription.tsx    # Transcript display
│   │   ├── EventLog.tsx     # Event log sidebar
│   │   └── SessionMetadata.tsx  # Metadata display
│   ├── hooks/               # Custom React hooks
│   │   ├── useVerbexClient.ts   # Main SDK integration
│   │   ├── useAudioDevices.ts   # Device enumeration
│   │   ├── useAudioVisualizer.ts # Audio visualization
│   │   └── useEventLog.ts   # Event logging
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── utils/
│   │   └── canvas.ts        # Canvas drawing utilities
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Installation

### 1. Install Dependencies

```bash
cd react
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Usage

### 1. Get a Session Token

Obtain a JWT session token from your server-side API that calls the Verbex create-web-session endpoint.

### 2. Configure Session

- Paste the JWT token into the "Session Token" input field
- (Optional) Select audio sample rate (16000, 24000, or 48000 Hz)
- (Optional) Select specific microphone and speaker devices

### 3. Connect

Click the "Connect to Verbex" button to initiate the voice session.

### 4. Start Talking

Once connected:
- Speak into your microphone
- See real-time waveform visualization
- View live transcription of your conversation
- Monitor volume levels
- Use the "Mute" button to toggle your microphone

### 5. Disconnect

Click the "Disconnect" button to end the session.

## Custom Hooks Architecture

### `useVerbexClient`

Main hook for SDK integration. Manages:
- VerbexWebClient instance
- Connection state
- All 11 SDK event listeners
- Mute/unmute functionality
- Transcript and metadata state

**Usage:**
```typescript
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

### `useAudioDevices`

Manages audio device enumeration and selection.

**Usage:**
```typescript
const {
  inputDevices,
  outputDevices,
  selectedInput,
  selectedOutput,
  setSelectedInput,
  setSelectedOutput,
  refreshDevices,
} = useAudioDevices();
```

### `useAudioVisualizer`

Handles audio visualization animation loop (~60fps).

**Usage:**
```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
const volume = useAudioVisualizer(
  client?.audioAnalyzer,
  isConnected,
  canvasRef
);
```

### `useEventLog`

Simple event logging with timestamps.

**Usage:**
```typescript
const { events, logEvent, clearEvents } = useEventLog();
logEvent('session_connected');
logEvent('transcript_updated', { transcript: [...] });
```

## Component Tree

```
App
├── Header (connection status)
├── ConfigPanel (left sidebar)
│   ├── Session token input
│   ├── Sample rate selector
│   ├── Device selectors
│   ├── Connect/Disconnect/Mute buttons
│   └── Status indicators
├── AudioVisualizer (center top)
│   ├── Waveform canvas
│   └── Volume meter
├── Transcription (center bottom)
│   └── Transcript entries
├── SessionMetadata (conditional)
│   └── Metadata key-value pairs
└── EventLog (right sidebar)
    └── Event items
```

## SDK Events Handled

All 11 SDK events are handled in `useVerbexClient`:

1. **session_connected** - Session established
2. **session_disconnected** - Session ended
3. **session_error** - Error occurred
4. **microphone_permission_denied** - Mic access denied
5. **agent_speech_started** - Agent began speaking
6. **agent_speech_ended** - Agent stopped speaking
7. **transcript_updated** - New transcript data
8. **session_metadata** - Session metadata received
9. **audio_stream** - Raw PCM audio data
10. **connection_lost** - Connection lost
11. **connection_restored** - Connection restored

## Key React Patterns

### 1. Custom Hooks for SDK Logic

Separates SDK integration from UI components for better testability and reusability.

### 2. useEffect for Event Listeners

```typescript
useEffect(() => {
  if (!client) return;

  const handleConnected = () => setIsConnected(true);
  client.on('session_connected', handleConnected);

  return () => {
    client.off('session_connected', handleConnected);
  };
}, [client]);
```

### 3. useRef for Canvas

Canvas element managed with useRef to avoid re-renders:

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
```

### 4. Controlled Components

All form inputs are controlled components with React state:

```typescript
<input
  value={sessionToken}
  onChange={(e) => setSessionToken(e.target.value)}
/>
```

### 5. Component Composition

Large components broken down into smaller, focused components with clear responsibilities.

## Responsive Design

The layout adapts to different screen sizes:

- **Desktop (lg+)**: 3-column grid (Config | Audio/Transcript | Events)
- **Tablet (md)**: 2-column grid, events stack below
- **Mobile (sm)**: Single column, all stacked

## Troubleshooting

### Microphone Permission Denied

1. Check browser permissions in settings
2. Ensure you're using HTTPS (or localhost)
3. Try refreshing the page

### Canvas Not Showing Waveform

1. Ensure `enableRawAudio: true` in session config
2. Check that `audioAnalyzer` is available
3. Verify canvas ref is attached correctly

### Connection Errors

1. Verify JWT token is valid and not expired
2. Check console for detailed error messages
3. Ensure server-side API is accessible

## Development

### Code Structure

- **Components**: Pure UI components with props
- **Hooks**: Business logic and SDK integration
- **Types**: TypeScript type definitions
- **Utils**: Utility functions (canvas drawing, etc.)

### Adding New Features

1. Create custom hook for logic (if needed)
2. Create component for UI
3. Wire together in `App.tsx`
4. Update types in `types/index.ts`

### Best Practices

- Keep components small and focused
- Use TypeScript for type safety
- Clean up effects and event listeners
- Use `useCallback` for event handlers
- Use `useMemo` for computed values
- Document all hooks and components

## Learn More

- [Verbex JS SDK Documentation](https://docs.verbex.ai)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## License

ISC

## Support

For issues and questions:
- GitHub Issues: [verbex-js-sdk/issues](https://github.com/verbex-ai/verbex-js-sdk/issues)
- Documentation: [https://docs.verbex.ai](https://docs.verbex.ai)
- Email: support@verbex.ai
