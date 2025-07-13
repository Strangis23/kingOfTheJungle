
import React from 'react';

interface MomentumTrackProps {
  momentum: number; // -10 to +10
}

const MomentumTrack: React.FC<MomentumTrackProps> = ({ momentum }) => {
  const percentage = ((momentum + 10) / 20) * 100;

  const getZoneLabel = (m: number) => {
    if (m >= 8) return "ON FIRE";
    if (m >= 5) return "FLOW STATE";
    if (m <= -8) return "UNSTOPPABLE";
    if (m <= -5) return "IN THE ZONE";
    return "";
  };

  const playerZoneLabel = getZoneLabel(momentum);
  const opponentZoneLabel = getZoneLabel(-momentum);
  
  const playerPulse = momentum >= 8 ? 'momentum-pulse-player' : '';
  const opponentPulse = momentum <= -8 ? 'momentum-pulse-opponent' : '';

  return (
    <div className="w-full max-w-2xl mx-auto my-2 p-2 bg-gray-900/70 rounded-lg shadow-inner">
      <div className="flex justify-between items-center mb-1 text-sm font-bold">
        <span className={`transition-opacity duration-300 ${momentum <= -5 ? 'text-red-400 opacity-100' : 'opacity-50'}`}>
          {opponentZoneLabel || 'Opponent'}
        </span>
        <span className="text-white font-mono text-lg">MOMENTUM</span>
         <span className={`transition-opacity duration-300 ${momentum >= 5 ? 'text-cyan-400 opacity-100' : 'opacity-50'}`}>
          {playerZoneLabel || 'Player'}
        </span>
      </div>
      <div className={`relative w-full h-6 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600 ${playerPulse} ${opponentPulse} transition-shadow duration-300`}>
        <div className="absolute top-0 left-0 h-full w-full flex">
          <div className="w-1/2 h-full bg-red-800/50"></div>
          <div className="w-1/2 h-full bg-cyan-800/50"></div>
        </div>
        
        {/* Threshold markers */}
        <div className="absolute top-0 left-[25%] w-px h-full bg-red-500/50"></div>
        <div className="absolute top-0 left-[10%] w-px h-full bg-red-400/80"></div>
        <div className="absolute top-0 right-[25%] w-px h-full bg-cyan-500/50"></div>
        <div className="absolute top-0 right-[10%] w-px h-full bg-cyan-400/80"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-gray-400"></div>

        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-gray-500 to-cyan-400"
          style={{ width: `${percentage}%` }}
        ></div>
        
        <div
          className="absolute top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-full shadow-lg border-2 border-gray-800"
          style={{ left: `calc(${percentage}% - 2px)` , transition: 'left 0.5s ease-out' }}
        ></div>
      </div>
    </div>
  );
};

export default MomentumTrack;
