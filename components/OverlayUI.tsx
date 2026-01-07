
import React from 'react';
import { Move, RotateCw, Maximize, BrainCircuit, X, Info, Target } from 'lucide-react';
import { TransformMode, ModelTransform } from '../types.ts';

interface OverlayUIProps {
  isDetected: boolean;
  activeMode: TransformMode;
  setActiveMode: (mode: TransformMode) => void;
  transform: ModelTransform;
  onReset: () => void;
  onAnalyze: () => void;
  aiInsights: { analysis: string; suggestions: string[] } | null;
  closeInsights: () => void;
}

const OverlayUI: React.FC<OverlayUIProps> = ({
  isDetected,
  activeMode,
  setActiveMode,
  onReset,
  onAnalyze,
  aiInsights,
  closeInsights
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white shadow-xl">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            VisionAR
          </h1>
          <p className="text-xs text-gray-300">Image Tracking & Manipulation</p>
        </div>

        <button 
          onClick={onAnalyze}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <BrainCircuit className="w-6 h-6" />
        </button>
      </div>

      {/* Detection Status / Helper */}
      {!isDetected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="w-64 h-64 border-2 border-dashed border-blue-400/50 rounded-lg animate-pulse mb-4"></div>
          <p className="text-white font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
            Point camera at the target image
          </p>
          <p className="text-blue-300 text-xs mt-2">Target: Standard MindAR Card</p>
        </div>
      )}

      {/* AI Insights Modal */}
      {aiInsights && (
        <div className="absolute inset-x-6 top-1/4 pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
              AI Insights
            </h3>
            <button onClick={closeInsights} className="p-1 hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">{aiInsights.analysis}</p>
          <div className="space-y-2">
            {aiInsights.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-white/5 p-2 rounded-lg">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interaction Controls */}
      {isDetected && (
        <div className="space-y-6 pointer-events-auto">
          {/* Mode Selector */}
          <div className="flex justify-center gap-4">
            {[
              { id: 'move', icon: Move, label: 'Move' },
              { id: 'rotate', icon: RotateCw, label: 'Rotate' },
              { id: 'scale', icon: Maximize, label: 'Scale' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id as TransformMode)}
                className={`flex flex-col items-center gap-1 p-4 rounded-2xl transition-all ${
                  activeMode === mode.id 
                  ? 'bg-blue-600 text-white scale-110 shadow-blue-500/50 shadow-lg' 
                  : 'bg-black/60 text-gray-400 backdrop-blur-md'
                }`}
              >
                <mode.icon className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase">{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <div className="flex justify-center">
            <button 
              onClick={onReset}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-medium border border-white/20"
            >
              Reset Transform
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverlayUI;
