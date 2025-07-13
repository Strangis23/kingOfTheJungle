import React from 'react';

interface MiniLogProps {
  logs: string[];
}

const MiniLog: React.FC<MiniLogProps> = ({ logs }) => {
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="w-64 h-48 bg-black/60 p-2 rounded-lg border border-gray-600/50 flex flex-col justify-end">
      <div className="overflow-hidden h-full flex flex-col justify-end">
        {recentLogs.map((log, index) => (
          <p
            key={logs.length - 1 - index}
            className={`font-mono text-xs text-gray-300 truncate mini-log-entry ${index > 0 ? 'opacity-70' : 'opacity-100 text-white'}`}
          >
            {`> ${log}`}
          </p>
        ))}
      </div>
    </div>
  );
};

export default MiniLog;
