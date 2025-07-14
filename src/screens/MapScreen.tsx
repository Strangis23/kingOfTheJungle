import React, { useState } from 'react';
import { MapNode, MapNodeType, Team } from '../types.ts';

interface MapScreenProps {
  mapNodes: MapNode[];
  onStartGame: (opponent: Team) => void;
  onOpenPack: (nodeId: string) => void;
  onResetRun: () => void;
}

const NodeIcon: React.FC<{ type: MapNodeType }> = ({ type }) => {
  switch (type) {
    case MapNodeType.Game: return <span title="Game">🏀</span>;
    case MapNodeType.EliteGame: return <span title="Elite Game">🏀✨</span>;
    case MapNodeType.Trainer: return <span title="Trainer">🏋️</span>;
    case MapNodeType.Rival: return <span title="Rival">⚔️</span>;
    case MapNodeType.Pack: return <span title="Card Pack">🎁</span>;
    default: return <span>?</span>;
  }
};

const MapScreen: React.FC<MapScreenProps> = ({ mapNodes, onStartGame, onOpenPack, onResetRun }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleNodeClick = (node: MapNode) => {
    if (node.completed) return;

    if (node.type === MapNodeType.Pack) {
      onOpenPack(node.id);
    } else if (node.opponent) {
      onStartGame(node.opponent);
    } else {
      alert(`Node type "${MapNodeType[node.type]}" logic not implemented yet.`);
    }
  };

  return (
    <div className="w-full h-full bg-gray-800 text-white flex flex-col items-center justify-center p-4 sm:p-8">
      <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-4 text-center" style={{ fontFamily: 'monospace' }}>ASPHALT ASCENDANTS</h1>
      <p className="text-base md:text-lg text-gray-400 mb-8 text-center">Choose your next challenge.</p>
      <div className="relative w-full max-w-4xl h-[60vh] md:h-96 bg-black/20 rounded-lg border-2 border-gray-600 p-4" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/crissxcross.png")' }}>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="absolute top-4 right-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition-colors z-20"
        >
          Reset Run
        </button>

        {mapNodes.map((node, index) => (
          <React.Fragment key={node.id}>
            {index > 0 && mapNodes[index-1] && <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
              <line 
                x1={`${mapNodes[index - 1].position.x}%`} 
                y1={`${mapNodes[index - 1].position.y}%`} 
                x2={`${node.position.x}%`} 
                y2={`${node.position.y}%`} 
                stroke="#4A5568" 
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>}
          </React.Fragment>
        ))}

        {mapNodes.map(node => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.position.x}%`, top: `${node.position.y}%`, zIndex: 1 }}
          >
            <button
              onClick={() => handleNodeClick(node)}
              className={`w-16 h-16 sm:w-20 sm:h-20 bg-gray-700 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-4  transition-all duration-200 transform ${node.completed ? 'border-gray-600 opacity-50 cursor-not-allowed' : 'border-gray-500 hover:border-yellow-400 hover:scale-110'}`}
              disabled={node.completed}
            >
              <NodeIcon type={node.type} />
            </button>
            <p className="text-center mt-2 font-semibold text-sm sm:text-base">{node.opponent?.name || MapNodeType[node.type]}</p>
          </div>
        ))}

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center border-2 border-red-500">
              <h2 className="text-2xl font-bold text-white mb-4">
                End Current Run?
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                All progress on this run will be lost.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    onResetRun();
                  }}
                  className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreen;
