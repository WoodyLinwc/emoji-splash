import Matter from "matter-js";

// Extending Matter.js Body to include our custom emoji property and missing type definitions
export interface EmojiBody extends Matter.Body {
  emoji?: string;
  circleRadius?: number; // Available on circular bodies
  label: string; // Matter.Body has label but it's not in the type definition
  position: Matter.Vector; // Position of the body
  angle: number; // Rotation angle in radians
  isStatic: boolean; // Whether the body is static or dynamic
  mass: number; // Mass of the body
}

export type EmojiCategory =
  | "FACES"
  | "FOOD"
  | "ANIMALS"
  | "ACTIVITIES"
  | "RANDOM";

export type PhysicsMode = "ACCUMULATE" | "RAIN";
