import React, { useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { EMOJI_SETS, PHYSICS_CONFIG } from '../constants';
import { EmojiCategory, EmojiBody } from '../types';

interface PhysicsBoardProps {
  category: EmojiCategory;
  gravityScale: number;
  clearTrigger: number;
  onShake: number;
}

const PhysicsBoard: React.FC<PhysicsBoardProps> = ({ category, gravityScale, clearTrigger, onShake }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize Physics Engine and Custom Render Loop
  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Setup Engine & World
    const engine = Matter.Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    // 2. Setup Runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // 3. Setup Canvas & Context
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Handle High DPI and Dimensions
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      context.scale(dpr, dpr);
      
      // Update Boundaries
      const bodies = Matter.Composite.allBodies(world);
      const walls = bodies.filter(b => b.label === 'Wall');
      Matter.World.remove(world, walls);
      
      const wallThick = PHYSICS_CONFIG.WALL_THICKNESS;
      const ground = Matter.Bodies.rectangle(width / 2, height + wallThick / 2, width + 200, wallThick, { 
        isStatic: true, label: 'Wall'
      });
      const leftWall = Matter.Bodies.rectangle(0 - wallThick / 2, height / 2, wallThick, height * 2, { 
        isStatic: true, label: 'Wall'
      });
      const rightWall = Matter.Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height * 2, { 
        isStatic: true, label: 'Wall'
      });
      const ceiling = Matter.Bodies.rectangle(width / 2, -wallThick * 2, width + 200, wallThick, { 
        isStatic: true, label: 'Wall'
      });

      Matter.World.add(world, [ground, leftWall, rightWall, ceiling]);
    };

    updateDimensions();

    // 4. Setup Mouse Interaction
    const mouse = Matter.Mouse.create(canvas);
    mouse.pixelRatio = window.devicePixelRatio || 1;
    
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    mouseConstraintRef.current = mouseConstraint;
    Matter.World.add(world, mouseConstraint);

    // 5. Custom Render Loop
    let animationFrameId: number;
    
    const renderLoop = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear Canvas
      context.clearRect(0, 0, width, height);

      // Draw Bodies
      const bodies = Matter.Composite.allBodies(engine.world) as unknown as EmojiBody[];
      
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      bodies.forEach(body => {
        if (body.label === 'Emoji' && body.emoji) {
          const { x, y } = body.position;
          const angle = body.angle;
          const radius = body.circleRadius || 20;

          context.save();
          context.translate(x, y);
          context.rotate(angle);
          
          context.font = `${radius * 2}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
          context.fillStyle = '#000000';
          
          // Draw emoji centered
          context.fillText(body.emoji, 0, radius * 0.15);
          
          context.restore();
        }
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Resize Handler
    const handleResize = () => {
      updateDimensions();
      mouse.pixelRatio = window.devicePixelRatio || 1;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  // Prop Updates
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.gravity.y = gravityScale;
    }
  }, [gravityScale]);

  useEffect(() => {
    if (onShake > 0 && engineRef.current) {
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      bodies.forEach(body => {
        if (!body.isStatic) {
          const forceMagnitude = 0.05 * body.mass;
          Matter.Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * forceMagnitude,
            y: (Math.random() - 1.5) * forceMagnitude,
          });
        }
      });
    }
  }, [onShake]);

  useEffect(() => {
    if (clearTrigger > 0 && engineRef.current) {
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const emojis = bodies.filter(b => b.label === 'Emoji');
      Matter.World.remove(engineRef.current.world, emojis);
    }
  }, [clearTrigger]);

  const spawnEmoji = useCallback((x: number, y: number) => {
    if (!engineRef.current) return;

    const set = EMOJI_SETS[category] || EMOJI_SETS.RANDOM;
    const randomEmoji = set[Math.floor(Math.random() * set.length)];
    const size = Math.random() * (PHYSICS_CONFIG.MAX_EMOJI_SIZE - PHYSICS_CONFIG.MIN_EMOJI_SIZE) + PHYSICS_CONFIG.MIN_EMOJI_SIZE;

    const body = Matter.Bodies.circle(x, y, size, {
      label: 'Emoji',
      restitution: PHYSICS_CONFIG.RESTITUTION,
      friction: PHYSICS_CONFIG.FRICTION,
      angle: Math.random() * Math.PI * 2,
    }) as unknown as EmojiBody;

    body.emoji = randomEmoji;

    const velocityX = (Math.random() - 0.5) * 15;
    const velocityY = (Math.random() - 0.5) * 15;
    Matter.Body.setVelocity(body, { x: velocityX, y: velocityY });

    Matter.World.add(engineRef.current.world, body);
  }, [category]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!engineRef.current || !mouseConstraintRef.current) return;

    const { x, y } = { x: e.clientX, y: e.clientY };
    
    // Check if we are clicking on an existing body
    const bodies = Matter.Composite.allBodies(engineRef.current.world);
    // Filter for dynamic bodies under cursor (ignore walls)
    const clickedBodies = Matter.Query.point(bodies, { x, y }).filter(b => !b.isStatic);

    if (clickedBodies.length > 0) {
      // User clicked an existing emoji -> Let Matter.MouseConstraint handle the drag.
      return;
    }

    // User clicked empty space -> Start Spawning
    
    // TEMPORARILY DISABLE MOUSE CONSTRAINT GRAB
    // This prevents the newly spawned body from being immediately grabbed by the mouse
    mouseConstraintRef.current.constraint.stiffness = 0;

    spawnEmoji(x, y);
    mousePosRef.current = { x, y };

    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    spawnIntervalRef.current = window.setInterval(() => {
      if (mousePosRef.current) {
        const jitterX = (Math.random() - 0.5) * 40;
        const jitterY = (Math.random() - 0.5) * 40;
        spawnEmoji(mousePosRef.current.x + jitterX, mousePosRef.current.y + jitterY);
      }
    }, PHYSICS_CONFIG.SPAWN_RATE_MS);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    // Stop spawning
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
    mousePosRef.current = null;

    // Restore MouseConstraint stiffness so dragging works next time
    if (mouseConstraintRef.current) {
      mouseConstraintRef.current.constraint.stiffness = 0.2;
    }
  };

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 touch-none cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};

export default PhysicsBoard;