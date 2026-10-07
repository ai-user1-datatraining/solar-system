import { useState, useRef, useEffect, useCallback } from 'react';
import { planets, sunData, PlanetData } from './data/planets';

interface PlanetPosition {
  x: number;
  y: number;
  angle: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const anglesRef = useRef<number[]>(planets.map(() => Math.random() * Math.PI * 2));
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showSunInfo, setShowSunInfo] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const planetPositionsRef = useRef<PlanetPosition[]>([]);
  const canvasSizeRef = useRef({ width: 800, height: 600 });
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const hoveredRef = useRef(hoveredPlanet);
  const selectedRef = useRef(selectedPlanet);

  // Keep refs in sync
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { hoveredRef.current = hoveredPlanet; }, [hoveredPlanet]);
  useEffect(() => { selectedRef.current = selectedPlanet; }, [selectedPlanet]);

  const getScale = useCallback(() => {
    const { width, height } = canvasSizeRef.current;
    const minDim = Math.min(width, height);
    return minDim / 850;
  }, []);

  const getCenter = useCallback(() => {
    return { x: canvasSizeRef.current.width / 2, y: canvasSizeRef.current.height / 2 };
  }, []);

  const drawStars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const starCount = 250;
    for (let i = 0; i < starCount; i++) {
      const x = Math.abs((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1) * width;
      const y = Math.abs((Math.sin(i * 78.233 + 12.9898) * 43758.5453) % 1) * height;
      const size = Math.abs((Math.sin(i * 43.23) * 1.2));
      const alpha = 0.2 + Math.abs(Math.sin(i * 17.3)) * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.3, size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }
  }, []);

  const drawSun = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    const r = sunData.radius * scale;
    
    // Outer glow
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    outerGlow.addColorStop(0, 'rgba(255, 200, 50, 0.15)');
    outerGlow.addColorStop(0.5, 'rgba(255, 140, 0, 0.05)');
    outerGlow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fillStyle = outerGlow;
    ctx.fill();

    // Sun glow
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
    glowGradient.addColorStop(0, '#ffd700');
    glowGradient.addColorStop(0.4, '#ff8c00');
    glowGradient.addColorStop(0.7, 'rgba(255, 69, 0, 0.4)');
    glowGradient.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x, y, r * 2, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Sun body
    const sunGradient = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r);
    sunGradient.addColorStop(0, '#fff7e0');
    sunGradient.addColorStop(0.3, '#ffee80');
    sunGradient.addColorStop(0.7, '#ffd700');
    sunGradient.addColorStop(1, '#ff8c00');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // Sun label
    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
    ctx.font = `bold ${Math.max(10, 12 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('太陽', x, y + r + Math.max(12, 16 * scale));
  }, []);

  const drawSolarSystem = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSizeRef.current;
    const center = getCenter();
    const scale = getScale();
    const hovered = hoveredRef.current;
    const selected = selectedRef.current;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    drawStars(ctx, width, height);

    // Draw orbit paths
    planets.forEach((planet) => {
      const orbitR = planet.orbitRadius * scale;
      ctx.beginPath();
      ctx.arc(center.x, center.y, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw sun
    drawSun(ctx, center.x, center.y, scale);

    // Draw planets
    const positions: PlanetPosition[] = [];
    planets.forEach((planet, index) => {
      const angle = anglesRef.current[index];
      const orbitR = planet.orbitRadius * scale;
      const x = center.x + Math.cos(angle) * orbitR;
      const y = center.y + Math.sin(angle) * orbitR;
      const r = Math.max(3, planet.radius * scale);
      positions.push({ x, y, angle });

      // Draw planet glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
      gradient.addColorStop(0, planet.glowColor + '40');
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw planet body
      const planetGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      planetGrad.addColorStop(0, lightenColor(planet.color, 30));
      planetGrad.addColorStop(1, planet.color);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = planetGrad;
      ctx.fill();

      // Highlight if hovered or selected
      if (hovered === planet.id || selected?.id === planet.id) {
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(x, y, r + 7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Saturn's ring
      if (planet.id === 'saturn') {
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.8, r * 0.5, Math.PI * 0.1, 0, Math.PI * 2);
        ctx.strokeStyle = '#f0d58c99';
        ctx.lineWidth = Math.max(2, 3 * scale);
        ctx.stroke();
        
        // Inner ring
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.4, r * 0.35, Math.PI * 0.1, 0, Math.PI * 2);
        ctx.strokeStyle = '#f0d58c55';
        ctx.lineWidth = Math.max(1, 2 * scale);
        ctx.stroke();
      }

      // Draw Earth's moon
      if (planet.id === 'earth') {
        const moonAngle = angle * 13;
        const moonDist = r * 2.2;
        const moonX = x + Math.cos(moonAngle) * moonDist;
        const moonY = y + Math.sin(moonAngle) * moonDist;
        ctx.beginPath();
        ctx.arc(moonX, moonY, Math.max(1.5, 2 * scale), 0, Math.PI * 2);
        ctx.fillStyle = '#cccccc';
        ctx.fill();
      }

      // Draw planet name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = `${Math.max(9, 11 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, x, y + r + Math.max(10, 14 * scale));
    });

    planetPositionsRef.current = positions;
  }, [getCenter, getScale, drawStars, drawSun]);

  const animate = useCallback(() => {
    if (isPlayingRef.current) {
      anglesRef.current = anglesRef.current.map((angle, index) => {
        return angle + planets[index].speed * speedRef.current * 0.008;
      });
    }
    drawSolarSystem();
    animationRef.current = requestAnimationFrame(animate);
  }, [drawSolarSystem]);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      canvasSizeRef.current = { width, height };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const center = getCenter();
    const scale = getScale();

    // Check sun click
    const distToSun = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
    if (distToSun <= sunData.radius * scale + 5) {
      setShowSunInfo(true);
      setSelectedPlanet(null);
      return;
    }

    // Check planet clicks
    for (let i = 0; i < planets.length; i++) {
      const pos = planetPositionsRef.current[i];
      if (!pos) continue;
      const r = Math.max(3, planets[i].radius * scale);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist <= r + 10) {
        setSelectedPlanet(planets[i]);
        setShowSunInfo(false);
        return;
      }
    }

    // Click on empty space
    setSelectedPlanet(null);
    setShowSunInfo(false);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e);
    const center = getCenter();
    const scale = getScale();

    // Check sun hover
    const distToSun = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
    if (distToSun <= sunData.radius * scale + 5) {
      canvas.style.cursor = 'pointer';
      return;
    }

    // Check planet hovers
    for (let i = 0; i < planets.length; i++) {
      const pos = planetPositionsRef.current[i];
      if (!pos) continue;
      const r = Math.max(3, planets[i].radius * scale);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist <= r + 10) {
        canvas.style.cursor = 'pointer';
        setHoveredPlanet(planets[i].id);
        return;
      }
    }

    canvas.style.cursor = 'default';
    setHoveredPlanet(null);
  };

  return (
    <div className="w-full h-screen bg-[#0a0a1a] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-[#0d1b2a] to-[#1b2838] border-b border-white/10 px-4 py-3 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🌌</span>
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              互動式太陽系
            </span>
          </h1>
          <p className="hidden md:block text-white/60 text-sm">
            點擊行星或太陽查看詳細資訊
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 relative min-h-0 min-w-0">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="block"
          />

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/10 shadow-xl">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white"
              title={isPlaying ? '暫停' : '播放'}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2l10 6-10 6V2z" />
                </svg>
              )}
            </button>

            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs whitespace-nowrap">速度</span>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-20 md:w-32"
              />
              <span className="text-orange-400 text-xs font-mono w-10 text-center">
                {speed.toFixed(1)}x
              </span>
            </div>

            {/* Reset Speed */}
            <button
              onClick={() => setSpeed(1)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white/70 hover:text-white text-xs"
              title="重置速度"
            >
              ↺
            </button>
          </div>

          {/* Legend */}
          <div className="absolute top-3 left-3 text-white/40 text-xs">
            軌道大小為示意比例，非實際比例
          </div>
        </div>

        {/* Info Panel */}
        <div className="flex-shrink-0 w-full md:w-80 lg:w-96 bg-[#0d1b2a]/95 border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto">
          {selectedPlanet ? (
            <PlanetInfo planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
          ) : showSunInfo ? (
            <SunInfo onClose={() => setShowSunInfo(false)} />
          ) : (
            <DefaultPanel />
          )}

          {/* Planet List */}
          <div className="p-4 border-t border-white/10">
            <h3 className="text-white/80 text-sm font-medium mb-3">🪐 行星列表</h3>
            <div className="grid grid-cols-2 gap-2">
              {planets.map((planet) => (
                <button
                  key={planet.id}
                  onClick={() => {
                    setSelectedPlanet(planet);
                    setShowSunInfo(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                    selectedPlanet?.id === planet.id
                      ? 'bg-white/15 border border-white/20'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: planet.color, boxShadow: `0 0 6px ${planet.glowColor}` }}
                  />
                  <span className="text-white/90 text-sm">{planet.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function PlanetInfo({ planet, onClose }: { planet: PlanetData; onClose: () => void }) {
  return (
    <div className="p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full shadow-lg"
            style={{
              backgroundColor: planet.color,
              boxShadow: `0 0 20px ${planet.glowColor}`,
            }}
          />
          <div>
            <h2 className="text-xl font-bold text-white">{planet.name}</h2>
            <p className="text-white/50 text-xs">{planet.nameEn}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2.5">
        <InfoRow icon="📏" label="直徑" value={planet.diameter} />
        <InfoRow icon="☀️" label="與太陽距離" value={planet.distanceFromSun} />
        <InfoRow icon="🔄" label="公轉週期" value={`${planet.orbitalPeriod.toLocaleString()} 地球日`} />
        <InfoRow
          icon="📅"
          label="約等於"
          value={`${(planet.orbitalPeriod / 365.25).toFixed(2)} 地球年`}
        />
      </div>

      <div className="mt-5 p-4 bg-white/5 rounded-xl border border-white/10">
        <h3 className="text-white/80 text-sm font-medium mb-2">📖 簡介</h3>
        <p className="text-white/60 text-sm leading-relaxed">{planet.description}</p>
      </div>
    </div>
  );
}

function SunInfo({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full"
            style={{
              backgroundColor: '#ffd700',
              boxShadow: '0 0 20px #ff8c00',
            }}
          />
          <div>
            <h2 className="text-xl font-bold text-white">太陽</h2>
            <p className="text-white/50 text-xs">Sun</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2.5">
        <InfoRow icon="📏" label="直徑" value={sunData.diameter} />
        <InfoRow icon="🌡️" label="表面溫度" value="約 5,500°C" />
        <InfoRow icon="⚡" label="類型" value="G型主序星 (黃矮星)" />
        <InfoRow icon="⏳" label="年齡" value="約 46 億年" />
        <InfoRow icon="💫" label="質量" value="太陽系的 99.86%" />
      </div>

      <div className="mt-5 p-4 bg-white/5 rounded-xl border border-white/10">
        <h3 className="text-white/80 text-sm font-medium mb-2">📖 簡介</h3>
        <p className="text-white/60 text-sm leading-relaxed">{sunData.description}</p>
      </div>
    </div>
  );
}

function DefaultPanel() {
  return (
    <div className="p-5 flex flex-col items-center justify-center h-52 text-center">
      <div className="text-6xl mb-4 animate-pulse">🪐</div>
      <h3 className="text-white/90 font-bold text-lg mb-2">歡迎來到太陽系</h3>
      <p className="text-white/50 text-sm leading-relaxed max-w-[250px]">
        點擊畫面中的太陽或行星，查看它們的詳細資訊
      </p>
      <div className="mt-4 flex gap-2">
        <span className="px-2 py-1 bg-white/5 rounded text-white/40 text-xs">🖱️ 點擊選擇</span>
        <span className="px-2 py-1 bg-white/5 rounded text-white/40 text-xs">⏯️ 播放/暫停</span>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white/50 text-xs">{label}</p>
        <p className="text-white text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

export default App;
