import { useEffect, useRef, useState } from "react";
import { Play, Pause, Zap, Wind, Turtle } from "lucide-react";

const App = () => {
  const canvasRef: any = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [trailLength, setTrailLength] = useState(0);
  const animationRef: any = useRef(null);
  const timeRef: any = useRef(0);
  const trailsRef: any = useRef({ moon: [], earth: [], sun: [] });

  useEffect(() => {
    const canvas: any = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawGlow = (
      ctx: any,
      x: any,
      y: any,
      radius: any,
      color: any,
      intensity = 1
    ) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.4, color.replace("1)", `${0.4 * intensity})`));
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius * 2.5, y - radius * 2.5, radius * 5, radius * 5);
    };

    const drawTrail = (trail: any, color: any) => {
      if (trail.length < 2) return;

      ctx.strokeStyle = color;
      for (let i = 1; i < trail.length; i++) {
        const alpha = i / trail.length;
        ctx.globalAlpha = alpha * 0.6;
        ctx.lineWidth = 2 * alpha;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      if (!isPaused) {
        timeRef.current += 0.005 * speed;
      }

      const time = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;

      // Clear with fade effect for trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, w, h);

      // Draw animated stars
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (let i = 0; i < 300; i++) {
        const x = (i * 127 + 50) % w;
        const y = (i * 211 + 30) % h;
        const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5;
        const size = ((i % 3) * 0.5 + 0.5) * (0.5 + twinkle * 0.5);
        ctx.globalAlpha = 0.3 + twinkle * 0.7;
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalAlpha = 1;

      // Galactic Center with pulsing effect
      const galacticX = centerX;
      const galacticY = centerY;
      const galacticPulse = Math.sin(time * 0.5) * 0.3 + 1;
      drawGlow(
        ctx,
        galacticX,
        galacticY,
        35 * galacticPulse,
        "rgba(255,100,255,1)",
        galacticPulse
      );

      const galacticGradient = ctx.createRadialGradient(
        galacticX,
        galacticY,
        0,
        galacticX,
        galacticY,
        18 * galacticPulse
      );
      galacticGradient.addColorStop(0, "#ff99ff");
      galacticGradient.addColorStop(0.5, "#ff66ff");
      galacticGradient.addColorStop(1, "#cc33cc");
      ctx.fillStyle = galacticGradient;
      ctx.beginPath();
      ctx.arc(galacticX, galacticY, 18 * galacticPulse, 0, Math.PI * 2);
      ctx.fill();

      // Sun orbit
      const sunOrbitRadius = Math.min(w, h) * 0.25;
      const sunAngle = time * 0.1;
      const sunX = galacticX + Math.cos(sunAngle) * sunOrbitRadius;
      const sunY = galacticY + Math.sin(sunAngle) * sunOrbitRadius;

      // Orbit paths
      if (showOrbits) {
        ctx.strokeStyle = "rgba(255,255,150,0.25)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(galacticX, galacticY, sunOrbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Sun trails
      trailsRef.current.sun.push({ x: sunX, y: sunY });
      if (trailsRef.current.sun.length > trailLength) {
        trailsRef.current.sun.shift();
      }
      drawTrail(trailsRef.current.sun, "rgba(255, 200, 0, 0.8)");

      // Sun with corona
      const sunPulse = Math.sin(time * 3) * 0.2 + 1;
      drawGlow(ctx, sunX, sunY, 25, "rgba(255,200,0,1)", sunPulse);

      const sunGradient = ctx.createRadialGradient(
        sunX,
        sunY,
        0,
        sunX,
        sunY,
        14
      );
      sunGradient.addColorStop(0, "#ffff99");
      sunGradient.addColorStop(0.5, "#ffcc00");
      sunGradient.addColorStop(1, "#ff9900");
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Earth orbit
      const earthOrbitRadius = 60;
      const earthAngle = time * 1.5;
      const earthX = sunX + Math.cos(earthAngle) * earthOrbitRadius;
      const earthY = sunY + Math.sin(earthAngle) * earthOrbitRadius;

      if (showOrbits) {
        ctx.strokeStyle = "rgba(100,150,255,0.35)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(sunX, sunY, earthOrbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Earth trails
      trailsRef.current.earth.push({ x: earthX, y: earthY });
      if (trailsRef.current.earth.length > trailLength) {
        trailsRef.current.earth.shift();
      }
      drawTrail(trailsRef.current.earth, "rgba(65, 105, 225, 0.8)");

      // Earth with atmosphere
      drawGlow(ctx, earthX, earthY, 12, "rgba(65,105,225,0.6)");

      const earthGradient = ctx.createRadialGradient(
        earthX - 3,
        earthY - 3,
        0,
        earthX,
        earthY,
        9
      );
      earthGradient.addColorStop(0, "#6495ed");
      earthGradient.addColorStop(0.7, "#4169e1");
      earthGradient.addColorStop(1, "#1e3a8a");
      ctx.fillStyle = earthGradient;
      ctx.beginPath();
      ctx.arc(earthX, earthY, 9, 0, Math.PI * 2);
      ctx.fill();

      // Continents
      ctx.fillStyle = "#22c55e";
      ctx.globalAlpha = 0.8;
      const rotation = time * 10;
      ctx.save();
      ctx.translate(earthX, earthY);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(2, 1, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;

      // Moon orbit
      const moonOrbitRadius = 20;
      const moonAngle = time * 5;
      const moonX = earthX + Math.cos(moonAngle) * moonOrbitRadius;
      const moonY = earthY + Math.sin(moonAngle) * moonOrbitRadius;

      if (showOrbits) {
        ctx.strokeStyle = "rgba(200,200,200,0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(earthX, earthY, moonOrbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Moon trails
      trailsRef.current.moon.push({ x: moonX, y: moonY });
      if (trailsRef.current.moon.length > trailLength) {
        trailsRef.current.moon.shift();
      }
      drawTrail(trailsRef.current.moon, "rgba(192, 192, 192, 0.6)");

      // Moon with texture
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#ffffff";
      const moonGradient = ctx.createRadialGradient(
        moonX - 1,
        moonY - 1,
        0,
        moonX,
        moonY,
        4
      );
      moonGradient.addColorStop(0, "#e0e0e0");
      moonGradient.addColorStop(1, "#a0a0a0");
      ctx.fillStyle = moonGradient;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Craters
      ctx.fillStyle = "#808080";
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(moonX - 1.5, moonY - 0.8, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(moonX + 1, moonY + 1, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Labels with better styling
      if (showLabels) {
        ctx.font = "bold 15px Arial";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;

        const labels = [
          {
            text: "Galactic Center",
            x: galacticX + 25,
            y: galacticY - 25,
            color: "#ff99ff",
          },
          { text: "Sun", x: sunX + 18, y: sunY - 18, color: "#ffcc00" },
          { text: "Earth", x: earthX + 13, y: earthY - 13, color: "#6495ed" },
          { text: "Moon", x: moonX + 6, y: moonY - 10, color: "#c0c0c0" },
        ];

        labels.forEach((label) => {
          ctx.strokeText(label.text, label.x, label.y);
          ctx.fillStyle = label.color;
          ctx.fillText(label.text, label.x, label.y);
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, speed, showOrbits, showLabels, trailLength]);

  const speedPresets = [
    { name: "Slow", value: 0.5, icon: Turtle, color: "bg-green-600" },
    { name: "Normal", value: 1, icon: Wind, color: "bg-blue-600" },
    { name: "Fast", value: 3, icon: Zap, color: "bg-yellow-600" },
    { name: "Ultra", value: 8, icon: Zap, color: "bg-red-600" },
    { name: "Ludicrous", value: 20, icon: Zap, color: "bg-purple-600" },
  ];

  return (
    <div className="w-full h-screen bg-black flex flex-col justify-center relative overflow-hidden">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-gray-900 bg-opacity-90 p-4 rounded-xl text-white shadow-2xl backdrop-blur-sm border border-gray-700">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Earth Cosmic Orbital System
        </h1>
        <p className="text-sm mb-4 text-gray-300">
          Moon → Earth → Sun → Galactic Center
        </p>

        {/* Play/Pause */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all mb-3 flex items-center justify-center gap-2 font-semibold"
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          {isPaused ? "Resume" : "Pause"}
        </button>

        {/* Speed Controls */}
        <div className="mb-3">
          <label className="text-sm font-semibold mb-2 block">
            Speed: {speed}x
          </label>
          <div className="grid grid-cols-3 gap-2">
            {speedPresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.value}
                  onClick={() => setSpeed(preset.value)}
                  className={`px-2 py-2 rounded-lg transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                    speed === preset.value
                      ? preset.color + " ring-2 ring-white"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <Icon size={16} />
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trail Length */}
        <div className="mb-3">
          <label className="text-sm font-semibold mb-2 block">
            Trail Length: {trailLength}
          </label>
          <input
            type="range"
            min="0"
            max="150"
            value={trailLength}
            onChange={(e) => setTrailLength(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Toggle Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOrbits}
              onChange={(e) => setShowOrbits(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Show Orbit Paths</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Show Labels</span>
          </label>
        </div>
      </div>

      {/* Info Badge */}
      <div className="absolute bottom-4 right-4 z-10 bg-gray-900 bg-opacity-90 px-4 py-2 rounded-lg text-white text-sm backdrop-blur-sm border border-gray-700">
        Current Speed:{" "}
        <span className="font-bold text-yellow-400">{speed}x</span>
      </div>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default App;
