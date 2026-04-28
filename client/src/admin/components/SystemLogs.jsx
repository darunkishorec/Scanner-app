import { useState, useEffect, useRef } from 'react';
import { Trash2, Terminal } from 'lucide-react';
import { toast } from 'sonner';

const LogLevelBadge = ({ level }) => {
  const levelConfig = {
    INFO: { bg: 'bg-blue-100', text: 'text-blue-800' },
    WARN: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    ERROR: { bg: 'bg-red-100', text: 'text-red-800' }
  };

  const config = levelConfig[level] || levelConfig.INFO;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {level}
    </span>
  );
};

export default function SystemLogs({ logs, onClearLogs }) {
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const logsContainerRef = useRef(null);
  const prevLogsLength = useRef(logs.length);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive, but only if user hasn't manually scrolled
    if (logs.length > prevLogsLength.current && !isUserScrolled && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
    prevLogsLength.current = logs.length;
  }, [logs, isUserScrolled]);

  const handleScroll = () => {
    if (!logsContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    
    setIsUserScrolled(!isAtBottom);
  };

  const handleClearLogs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/logs/clear', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Cleared ${data.deletedCount} log entries`);
        onClearLogs();
      } else {
        toast.error('Failed to clear logs');
      }
    } catch (error) {
      toast.error('Network error occurred');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
      <div className="px-5 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center">
          <Terminal className="w-5 h-5 text-green-400 mr-2" />
          <h3 className="text-base font-semibold text-white">System Logs</h3>
          <span className="ml-3 text-sm text-gray-400">({logs.length} entries)</span>
        </div>
        <button
          onClick={handleClearLogs}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-md transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Clear Logs
        </button>
      </div>
      
      <div 
        ref={logsContainerRef}
        onScroll={handleScroll}
        className="overflow-y-auto bg-gray-900 p-4 font-mono text-xs"
        style={{ height: '320px' }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-12">
            <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No logs available. System events will appear here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start space-x-3 text-gray-300 hover:bg-gray-800 px-2 py-1.5 rounded transition-colors">
                <span className="text-gray-500 text-xs whitespace-nowrap font-medium">
                  {formatTimestamp(log.timestamp)}
                </span>
                <LogLevelBadge level={log.level} />
                <span className="flex-1 break-words leading-relaxed">
                  {log.message}
                  {log.cartId && (
                    <span className="text-blue-400 ml-2 font-semibold">[{log.cartId}]</span>
                  )}
                  {log.adminAction && (
                    <span className="text-purple-400 ml-2 font-semibold">[ADMIN]</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {!isUserScrolled && logs.length > 0 && (
          <div className="text-green-400 text-xs mt-3 opacity-60 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Live - Auto-scrolling
          </div>
        )}
      </div>
    </div>
  );
}