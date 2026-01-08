import React, { useState } from 'react';
import PhysicsBoard from './components/PhysicsBoard';
import { Controls } from './components/Controls';
import { EmojiCategory } from './types';

const App: React.FC = () => {
  const [category, setCategory] = useState<EmojiCategory>('RANDOM');
  const [gravityScale, setGravityScale] = useState(1);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [emojiCount, setEmojiCount] = useState(0); // Optional: if we wanted to track count displayed

  const handleClear = () => {
    setClearTrigger(prev => prev + 1);
    setEmojiCount(0);
  };

  const handleShake = () => {
    setShakeTrigger(prev => prev + 1);
  };

  const handleToggleGravity = () => {
    setGravityScale(prev => (prev === 0 ? 1 : 0));
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      <PhysicsBoard 
        category={category}
        gravityScale={gravityScale}
        clearTrigger={clearTrigger}
        onShake={shakeTrigger}
      />

      <Controls 
        currentCategory={category}
        onCategoryChange={setCategory}
        onClear={handleClear}
        onShake={handleShake}
        onToggleGravity={handleToggleGravity}
        gravityEnabled={gravityScale !== 0}
        count={emojiCount}
      />
    </div>
  );
};

export default App;