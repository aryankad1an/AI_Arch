import { useEffect, useRef } from 'react';

const GridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spacing = 40;
    const baseRadius = 1;
    const maxRadius = 3;
    const influenceRadius = 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;
      const { x: mx, y: my } = mouseRef.current;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let radius = baseRadius;
          let alpha = 0.12;

          if (dist < influenceRadius) {
            const t = 1 - dist / influenceRadius;
            const ease = t * t * (3 - 2 * t); // smoothstep
            radius = baseRadius + (maxRadius - baseRadius) * ease;
            alpha = 0.12 + 0.5 * ease;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
      }

      // Draw subtle lines near cursor
      if (mx > 0 && my > 0) {
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const x = i * spacing;
            const y = j * spacing;
            const dx = x - mx;
            const dy = y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < influenceRadius * 0.7) {
              // Connect to neighboring dots
              const neighbors = [
                [(i + 1) * spacing, j * spacing],
                [i * spacing, (j + 1) * spacing],
              ];

              neighbors.forEach(([nx, ny]) => {
                const ndx = nx - mx;
                const ndy = ny - my;
                const ndist = Math.sqrt(ndx * ndx + ndy * ndy);

                if (ndist < influenceRadius * 0.7 && nx <= canvas.width && ny <= canvas.height) {
                  const t = 1 - Math.max(dist, ndist) / (influenceRadius * 0.7);
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  ctx.lineTo(nx, ny);
                  ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * t})`;
                  ctx.lineWidth = 0.5;
                  ctx.stroke();
                }
              });
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default GridBackground;
