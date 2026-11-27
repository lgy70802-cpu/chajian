import React, { useEffect, useRef, useState } from 'react';

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  finColor: string;
  tailPhase: number;
  speed: number;
  direction: 1 | -1;
  species: 'tang' | 'clown' | 'tetra' | 'guppy';
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  vy: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
}

interface FoodPellet {
  x: number;
  y: number;
  vy: number;
}

interface AquariumCanvasProps {
  fishCount?: number;
  causticsIntensity?: number;
  bubbleSpeed?: number;
  waterTint?: string;
  showClock?: boolean;
  className?: string;
}

export const AquariumCanvas: React.FC<AquariumCanvasProps> = ({
  fishCount = 7,
  causticsIntensity = 0.6,
  bubbleSpeed = 1.0,
  waterTint = '#041728',
  showClock = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 960);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 320);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palettes for fish species
    const speciesList: Array<{
      species: Fish['species'];
      color: string;
      finColor: string;
      size: number;
      speed: number;
    }> = [
      { species: 'clown', color: '#F97316', finColor: '#FFFFFF', size: 24, speed: 1.2 },
      { species: 'tang', color: '#3B82F6', finColor: '#FACC15', size: 28, speed: 1.0 },
      { species: 'tetra', color: '#06B6D4', finColor: '#EF4444', size: 18, speed: 1.5 },
      { species: 'guppy', color: '#EC4899', finColor: '#A855F7', size: 20, speed: 1.3 },
    ];

    // Initialize fish
    const fishes: Fish[] = [];
    for (let i = 0; i < fishCount; i++) {
      const spec = speciesList[i % speciesList.length];
      const dir = Math.random() > 0.5 ? 1 : -1;
      fishes.push({
        x: Math.random() * width,
        y: 40 + Math.random() * (height - 80),
        vx: dir * (spec.speed * (0.8 + Math.random() * 0.4)),
        vy: (Math.random() - 0.5) * 0.4,
        size: spec.size,
        color: spec.color,
        finColor: spec.finColor,
        tailPhase: Math.random() * Math.PI * 2,
        speed: spec.speed,
        direction: dir,
        species: spec.species,
      });
    }

    // Initialize bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 28; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 4,
        vy: (0.6 + Math.random() * 1.4) * bubbleSpeed,
        wobbleSpeed: 0.03 + Math.random() * 0.04,
        wobbleAmp: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const foodPellets: FoodPellet[] = [];

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      // Drop 3 food pellets
      for (let i = -1; i <= 1; i++) {
        foodPellets.push({
          x: clickX + i * 12,
          y: clickY,
          vy: 0.6 + Math.random() * 0.4,
        });
      }
    };
    canvas.addEventListener('click', handleCanvasClick);

    let time = 0;

    const render = () => {
      time += 0.02;

      // 1. Water Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#062644');
      bgGrad.addColorStop(0.4, waterTint);
      bgGrad.addColorStop(1, '#020b14');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Light Rays / Water Caustics from surface
      if (causticsIntensity > 0.05) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const numRays = 7;
        for (let i = 0; i < numRays; i++) {
          const rayX = (width / (numRays + 1)) * (i + 1) + Math.sin(time * 0.6 + i * 1.2) * 40;
          const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + (i % 2 === 0 ? 60 : -60), height);
          rayGrad.addColorStop(0, `rgba(56, 189, 248, ${0.12 * causticsIntensity})`);
          rayGrad.addColorStop(0.5, `rgba(14, 165, 233, ${0.05 * causticsIntensity})`);
          rayGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(rayX - 35, 0);
          ctx.lineTo(rayX + 35, 0);
          ctx.lineTo(rayX + (i % 2 === 0 ? 140 : -140), height);
          ctx.lineTo(rayX + (i % 2 === 0 ? 40 : -240), height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Update & Draw Food Pellets
      for (let i = foodPellets.length - 1; i >= 0; i--) {
        const p = foodPellets[i];
        p.y += p.vy;
        p.x += Math.sin(p.y * 0.08) * 0.3;

        ctx.fillStyle = '#F59E0B';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.y > height) {
          foodPellets.splice(i, 1);
        }
      }

      // 4. Update & Draw Bubbles
      ctx.save();
      for (let b of bubbles) {
        b.phase += b.wobbleSpeed;
        b.y -= b.vy;
        const currentX = b.x + Math.sin(b.phase) * b.wobbleAmp;

        if (b.y < -10) {
          b.y = height + 10;
          b.x = Math.random() * width;
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(186, 230, 253, 0.15)';
        ctx.beginPath();
        ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bubble highlight reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(currentX - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 5. Update & Draw Fishes
      for (let fish of fishes) {
        // Attract toward food if nearby
        if (foodPellets.length > 0) {
          let closestDist = Infinity;
          let targetFood: FoodPellet | null = null;
          for (let f of foodPellets) {
            const dist = Math.hypot(f.x - fish.x, f.y - fish.y);
            if (dist < closestDist && dist < 220) {
              closestDist = dist;
              targetFood = f;
            }
          }
          if (targetFood) {
            const angle = Math.atan2(targetFood.y - fish.y, targetFood.x - fish.x);
            fish.vx += Math.cos(angle) * 0.05;
            fish.vy += Math.sin(angle) * 0.05;
            fish.direction = fish.vx >= 0 ? 1 : -1;
            // Eat food pellet
            if (closestDist < 12) {
              const idx = foodPellets.indexOf(targetFood);
              if (idx !== -1) foodPellets.splice(idx, 1);
            }
          }
        }

        // Clamp speed
        const speed = Math.hypot(fish.vx, fish.vy);
        const maxSpeed = fish.speed * 1.4;
        if (speed > maxSpeed) {
          fish.vx = (fish.vx / speed) * maxSpeed;
          fish.vy = (fish.vy / speed) * maxSpeed;
        }

        // Move fish
        fish.x += fish.vx;
        fish.y += fish.vy;
        fish.tailPhase += 0.18 * (speed + 0.5);

        // Gentle vertical wave drift
        fish.vy += Math.sin(time + fish.tailPhase * 0.5) * 0.02;

        // Bounce / turn around at boundaries
        if (fish.x > width + 40 && fish.direction === 1) {
          fish.x = -40;
          fish.y = 40 + Math.random() * (height - 80);
        } else if (fish.x < -40 && fish.direction === -1) {
          fish.x = width + 40;
          fish.y = 40 + Math.random() * (height - 80);
        }

        if (fish.y < 30) fish.vy += 0.08;
        if (fish.y > height - 40) fish.vy -= 0.08;

        // Draw individual fish
        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.scale(fish.direction, 1);

        const tailAngle = Math.sin(fish.tailPhase) * 0.35;

        // Tail fin
        ctx.save();
        ctx.translate(-fish.size * 0.8, 0);
        ctx.rotate(tailAngle);
        ctx.fillStyle = fish.finColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-fish.size * 0.6, -fish.size * 0.45);
        ctx.quadraticCurveTo(-fish.size * 0.4, 0, -fish.size * 0.6, fish.size * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Fish Body (Smooth ellipse/teardrop)
        ctx.fillStyle = fish.color;
        ctx.beginPath();
        ctx.moveTo(fish.size, 0);
        ctx.quadraticCurveTo(0, -fish.size * 0.55, -fish.size * 0.8, 0);
        ctx.quadraticCurveTo(0, fish.size * 0.55, fish.size, 0);
        ctx.closePath();
        ctx.fill();

        // Distinctive white stripes if clown fish
        if (fish.species === 'clown') {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(0, 0, fish.size * 0.18, fish.size * 0.48, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(-fish.size * 0.45, 0, fish.size * 0.12, fish.size * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Top dorsal fin
        ctx.fillStyle = fish.finColor;
        ctx.beginPath();
        ctx.moveTo(-fish.size * 0.2, -fish.size * 0.42);
        ctx.quadraticCurveTo(fish.size * 0.1, -fish.size * 0.75, fish.size * 0.3, -fish.size * 0.25);
        ctx.closePath();
        ctx.fill();

        // Pectoral fin
        const finAngle = Math.sin(fish.tailPhase * 1.2) * 0.3;
        ctx.save();
        ctx.translate(fish.size * 0.1, fish.size * 0.1);
        ctx.rotate(finAngle);
        ctx.fillStyle = fish.finColor;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.3, fish.size * 0.14, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Eye
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(fish.size * 0.6, -fish.size * 0.12, fish.size * 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(fish.size * 0.64, -fish.size * 0.12, fish.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [fishCount, causticsIntensity, bubbleSpeed, waterTint]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none cursor-pointer group ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Surface caustic shimmer overlay */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-sky-400/20 via-sky-300/5 to-transparent pointer-events-none" />

      {/* Sandy Bottom Silhouette */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent pointer-events-none flex items-end px-6 pb-1">
        <div className="text-[10px] text-sky-400/50 font-mono tracking-wider">
          点击水面投喂鱼食 · CRAFT 原生动态水族箱 V1.2
        </div>
      </div>

      {/* Floating Clock Overlay (If enabled) */}
      {showClock && (
        <div className="absolute top-4 right-5 text-right pointer-events-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          <div className="text-2xl font-mono font-bold tracking-tight text-white/95 tabular-nums">
            {timeStr || '12:00:00'}
          </div>
          <div className="text-xs font-medium text-sky-200/70 tracking-wider uppercase">
            {dateStr || 'Oct 29'}
          </div>
        </div>
      )}
    </div>
  );
};
