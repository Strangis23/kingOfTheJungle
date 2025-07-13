import React from 'react';
import { Playbook } from '../types';
import { PLAYBOOK_DATA } from '../components/game-data';

interface PlaybookSelectionScreenProps {
  onSelect: (playbook: Playbook) => void;
}

const PlaybookSelectionScreen: React.FC<PlaybookSelectionScreenProps> = ({ onSelect }) => {
    const playbooks = [Playbook.PaceAndSpace, Playbook.GritAndGrind, Playbook.FastbreakKings];
    
    return (
        <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in" style={{ backgroundImage: 'url("assets/images/textures/court-texture.jpeg")', backgroundBlendMode: 'overlay', backgroundColor: '#111827' }}>
            <div className="bg-black/40 p-8 rounded-xl backdrop-blur-sm">
                <h1 className="text-3xl sm:text-5xl font-bold text-yellow-400 mb-4 text-center" style={{ fontFamily: 'monospace' }}>CHOOSE YOUR PLAYBOOK</h1>
                <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-12 text-center max-w-3xl">Your playbook defines your team's core strategy and unlocks a powerful Signature Move when your Momentum is at its peak.</p>
                <div className="flex flex-col md:flex-row gap-8">
                    {playbooks.map(p => (
                        <div 
                            key={p} 
                            onClick={() => onSelect(p)} 
                            className="w-full max-w-sm md:w-80 bg-gray-800 border-4 border-gray-600 rounded-lg p-6 flex flex-col justify-between shadow-lg text-white transform transition-all duration-300 hover:-translate-y-2 hover:border-yellow-400 hover:shadow-yellow-400/20 cursor-pointer"
                        >
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">{PLAYBOOK_DATA[p].name}</h2>
                                <p className="text-gray-300 mt-4 h-20">{PLAYBOOK_DATA[p].description}</p>
                            </div>
                            <div className="mt-6 border-t-2 border-gray-600 pt-4">
                                <h3 className="text-xl font-bold text-cyan-400">Signature Move:</h3>
                                <p className="text-lg font-semibold">{PLAYBOOK_DATA[p].signatureMoveKey.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlaybookSelectionScreen;
