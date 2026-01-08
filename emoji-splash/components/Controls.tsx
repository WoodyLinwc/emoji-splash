import React from "react";
import { EmojiCategory, PhysicsMode } from "../types";
import {
  Trash2,
  ArrowDown,
  Activity,
  Sparkles,
  Box,
  CloudRain,
  Layers,
} from "lucide-react";

interface ControlsProps {
  onClear: () => void;
  onShake: () => void;
  onToggleGravity: () => void;
  gravityEnabled: boolean;
  currentCategory: EmojiCategory;
  onCategoryChange: (c: EmojiCategory) => void;
  mode: PhysicsMode;
  onModeChange: (m: PhysicsMode) => void;
  count: number;
}

export const Controls: React.FC<ControlsProps> = ({
  onClear,
  onShake,
  onToggleGravity,
  gravityEnabled,
  currentCategory,
  onCategoryChange,
  mode,
  onModeChange,
  count,
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto flex flex-col md:flex-row gap-3 pointer-events-none z-10">
      {/* Main Control Group */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-2 flex items-center justify-between gap-2 pointer-events-auto ring-1 ring-black/5">
        {/* Category Selector */}
        <select
          value={currentCategory}
          onChange={(e) => onCategoryChange(e.target.value as EmojiCategory)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold py-2 px-3 rounded-xl outline-none border-none transition-colors cursor-pointer"
        >
          <option value="RANDOM">🎲 Mixed</option>
          <option value="FACES">😀 Faces</option>
          <option value="FOOD">🍔 Food</option>
          <option value="ANIMALS">🦊 Animals</option>
          <option value="ACTIVITIES">⚽ Sports</option>
        </select>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => onModeChange("ACCUMULATE")}
            className={`p-1.5 rounded-lg transition-all ${
              mode === "ACCUMULATE"
                ? "bg-white shadow-sm text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Pile Mode"
          >
            <Layers size={18} />
          </button>
          <button
            onClick={() => onModeChange("RAIN")}
            className={`p-1.5 rounded-lg transition-all ${
              mode === "RAIN"
                ? "bg-white shadow-sm text-blue-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Rain Mode"
          >
            <CloudRain size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Action Buttons */}
        <button
          onClick={onToggleGravity}
          className={`p-2 rounded-xl transition-all ${
            gravityEnabled
              ? "bg-indigo-100 text-indigo-600"
              : "bg-gray-100 text-gray-400"
          }`}
          title="Toggle Gravity"
        >
          <ArrowDown
            size={20}
            className={`transition-transform duration-300 ${
              !gravityEnabled ? "-rotate-180" : ""
            }`}
          />
        </button>

        <button
          onClick={onShake}
          className="p-2 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors active:scale-95"
          title="Shake Board"
        >
          <Activity size={20} />
        </button>

        <button
          onClick={onClear}
          className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors active:scale-95"
          title="Clear Board"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Info / Count Tag */}
      <div className="bg-white/90 backdrop-blur-md shadow-md rounded-2xl px-4 py-2 flex items-center justify-center gap-2 pointer-events-auto ring-1 ring-black/5 self-start md:self-auto min-w-[140px] transition-all duration-300">
        {count > 0 ? (
          <>
            <Box size={16} className="text-indigo-500" />
            <span className="text-sm font-bold text-indigo-600 tabular-nums">
              {count.toLocaleString()} Emojis
            </span>
          </>
        ) : (
          <>
            <Sparkles size={16} className="text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">
              Click to Splash
            </span>
          </>
        )}
      </div>
    </div>
  );
};
