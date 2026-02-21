"use client";
import { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Each band has its own personality — varied thickness, speed, and motion
    const bands = [
      { yRatio: 0.18, amplitude: 90,  freq: 0.0020, speed: 0.40, freq2: 0.0038, speed2: 0.28, count: 280, maxThick: 22, alpha: 0.32, coreSize: 1.6, layers: 7 },
      { yRatio: 0.38, amplitude: 70,  freq: 0.0032, speed: 0.55, freq2: 0.0018, speed2: 0.38, count: 240, maxThick: 12, alpha: 0.22, coreSize: 1.2, layers: 5 },
      { yRatio: 0.58, amplitude: 110, freq: 0.0016, speed: 0.35, freq2: 0.0042, speed2: 0.48, count: 260, maxThick: 28, alpha: 0.26, coreSize: 1.8, layers: 8 },
      { yRatio: 0.78, amplitude: 55,  freq: 0.0038, speed: 0.65, freq2: 0.0022, speed2: 0.30, count: 200, maxThick: 10, alpha: 0.16, coreSize: 1.0, layers: 4 },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bands.forEach((band) => {
        const baseY = canvas.height * band.yRatio;

        for (let i = 0; i < band.count; i++) {
          const xProgress = i / band.count;
          const x = xProgress * canvas.width;

          // Organic motion: two overlapping waves per band
          const centerY =
            baseY +
            Math.sin(x * band.freq + t * band.speed * 0.016) * band.amplitude +
            Math.sin(x * band.freq2 + t * band.speed2 * 0.016) * (band.amplitude * 0.38) +
            Math.cos(x * band.freq * 0.5 + t * band.speed * 0.009) * (band.amplitude * 0.18);

          // Edge fade — band fades in/out from left and right
          const edgeFade = Math.pow(Math.sin(xProgress * Math.PI), 0.7);

          // Thickness varies along the band — not uniform
          const thickVariation = 0.5 + 0.5 * Math.abs(Math.sin(x * 0.004 + t * 0.008));
          const thickness = band.maxThick * thickVariation;

          const flicker = 0.85 + 0.15 * Math.sin(i * 0.25 + t * 0.025);

          for (let l = 0; l < band.layers; l++) {
            const layerNorm = l / (band.layers - 1); // 0 to 1
            const layerOffset = (layerNorm - 0.5) * thickness;
            const y = centerY + layerOffset;

            // Gaussian-like falloff from center
            const distFromCenter = Math.abs(layerNorm - 0.5) * 2; // 0 at center, 1 at edge
            const layerAlpha = band.alpha * edgeFade * flicker * Math.exp(-distFromCenter * 2.5);

            // Soft diffuse glow — bigger, softer
            const glowR = band.coreSize * (3 + (1 - distFromCenter) * 3);
            const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
            g.addColorStop(0, `rgba(94,234,212,${layerAlpha * 0.3})`);
            g.addColorStop(1, `rgba(94,234,212,0)`);
            ctx.beginPath();
            ctx.arc(x, y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();

            // Core dot only near the center layers
            if (distFromCenter < 0.35) {
              ctx.beginPath();
              ctx.arc(x, y, band.coreSize * (1 - distFromCenter), 0, Math.PI * 2);
              ctx.fillStyle = `rgba(94,234,212,${Math.min(layerAlpha * 1.1, 0.45)})`;
              ctx.fill();
            }
          }
        }
      });

      // Very subtle ambient star field
      for (let i = 0; i < 45; i++) {
        const x = (Math.sin(i * 1.618 + t * 0.004) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 1.13 + t * 0.003) * 0.5 + 0.5) * canvas.height;
        const a = 0.06 + 0.08 * Math.sin(i + t * 0.03);
        ctx.beginPath();
        ctx.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94,234,212,${a})`;
        ctx.fill();
      }

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.65 }}
    />
  );
}
