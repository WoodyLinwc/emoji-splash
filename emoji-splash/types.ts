import Matter from 'matter-js';

// Extending Matter.js Body to include our custom emoji property
export interface EmojiBody extends Matter.Body {
  emoji?: string;
  circleRadius?: number; // Available on circular bodies
}

export type EmojiCategory = 'FACES' | 'FOOD' | 'ANIMALS' | 'ACTIVITIES' | 'RANDOM';