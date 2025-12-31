'use client';

/**
 * Session Metadata Component
 *
 * Displays session metadata received from the SDK.
 * Only visible when metadata is available.
 *
 * SDK EVENT:
 * - client.on('session_metadata', callback) - Provides metadata object
 *
 * FEATURES:
 * - Key-value pairs display
 * - Conditional rendering (hidden when no metadata)
 * - Formatted display for objects
 *
 * @param metadata - Session metadata object from SDK
 */
interface SessionMetadataProps {
  metadata: any;
}

export function SessionMetadata({ metadata }: SessionMetadataProps) {
  // Hide component if no metadata
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }

  const entries = Object.entries(metadata);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Session Information
        </h2>
      </div>

      {/* Metadata Content */}
      <div className="p-4 bg-gray-50">
        {entries.map(([key, value]) => (
          <div key={key} className="metadata-item">
            <div className="metadata-key">{key}</div>
            <div className="metadata-value">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
