import React from 'react';
import { Loader2, CheckCircle2, Sparkles, X } from 'lucide-react';
import { InstructionProgressState } from '../types';

interface InstructionProgressBarProps {
  progress: InstructionProgressState | null;
  onDismiss?: () => void;
}

export const InstructionProgressBar: React.FC<InstructionProgressBarProps> = ({
  progress,
  onDismiss,
}) => {
  if (!progress) return null;

  const isComplete = progress.status === 'completed' || progress.percent >= 100;

  return (
    <div
      id="instructionProgressContainer"
      className="w-full mb-4 p-3.5 sm:p-4 rounded-xl border transition-all duration-300 shadow-sm bg-gradient-to-r from-blue-50/95 via-indigo-50/95 to-slate-50 dark:from-blue-950/80 dark:via-indigo-950/80 dark:to-slate-900/80 border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 shrink-0">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="truncate">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
              <span>{progress.title}</span>
              {isComplete && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Completed
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {progress.detail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/70 px-2 py-0.5 rounded-md">
            {Math.min(100, Math.max(0, Math.round(progress.percent)))}%
          </span>
          {onDismiss && isComplete && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-md transition"
              title="Dismiss progress"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden relative">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
          }`}
          style={{ width: `${Math.min(100, Math.max(5, progress.percent))}%` }}
        />
      </div>

      {progress.totalSteps > 1 && (
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span>Processing instruction...</span>
          <span>
            Step {progress.step} of {progress.totalSteps}
          </span>
        </div>
      )}
    </div>
  );
};
