import type { ConnectionStatus } from '../types';

/**
 * Header Component
 *
 * Displays the application title and connection status indicator.
 *
 * FEATURES:
 * - App title with gradient styling
 * - Animated status dot (green/amber/gray)
 * - Status text (Connected/Connecting/Disconnected)
 *
 * @param connectionStatus - Current connection state
 */
interface HeaderProps {
  connectionStatus: ConnectionStatus;
}

export function Header({ connectionStatus }: HeaderProps) {
  const statusColors = {
    disconnected: 'bg-gray-400',
    connected: 'bg-green-500',
    connecting: 'bg-amber-500',
  };

  const statusTexts = {
    disconnected: 'Disconnected',
    connected: 'Connected',
    connecting: 'Connecting...',
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Verbex AI</h1>
              <p className="text-xs sm:text-sm text-gray-500">Customer Agent Interface</p>
            </div>
          </div>
          {/* Connection Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100">
            <div className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]} animate-pulse`} />
            <span className="text-sm font-medium text-gray-600">{statusTexts[connectionStatus]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
