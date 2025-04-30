"use client";

import { useEffect, useRef, useState } from "react";
import "./statsChart.css";

interface StatsChartProps {
  stats?: {
    stability: number;
    speed: number;
    code: number;
    creativity: number;
    risk: number;
  };
}

export default function StatsChart({
  stats = {
    stability: 7,
    speed: 8,
    code: 6,
    creativity: 9,
    risk: 5,
  },
}: StatsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Handle resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const width = container.clientWidth;
          const height = container.clientHeight;
          setDimensions({ width, height });
          setIsSmallScreen(width < 400);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions with higher resolution for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Set canvas display size
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Configuration
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    const sides = 5; // Pentagon

    // Full and short labels
    const fullLabels = ["STABILITY", "SPEED", "CODE", "CREATIVITY", "RISK"];
    const shortLabels = ["STAB", "SPD", "CODE", "CRTV", "RISK"];
    const labels = isSmallScreen ? shortLabels : fullLabels;

    const statValues = [
      stats.stability / 10,
      stats.speed / 10,
      stats.code / 10,
      stats.creativity / 10,
      stats.risk / 10,
    ];

    // Draw grid lines (multiple pentagons)
    const gridLevels = 5; // 0, 2, 4, 6, 8, 10
    for (let level = 1; level <= gridLevels; level++) {
      const levelRadius = (radius / gridLevels) * level;

      ctx.beginPath();
      ctx.strokeStyle = level === gridLevels ? "#555" : "#333";
      ctx.lineWidth = level === gridLevels ? 1.5 : 1;

      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.stroke();
    }

    // Draw connecting lines from center to vertices
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw data pentagon
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const statRadius = radius * statValues[i];
      const x = centerX + statRadius * Math.cos(angle);
      const y = centerY + statRadius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    // Fill with semi-transparent color
    ctx.fillStyle = "rgba(201, 183, 60, 0.2)";
    ctx.fill();

    // Stroke with gradient
    const gradient = ctx.createLinearGradient(
      centerX - radius,
      centerY - radius,
      centerX + radius,
      centerY + radius
    );
    gradient.addColorStop(0, "#c9b73c");
    gradient.addColorStop(1, "#e2c94f");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const statRadius = radius * statValues[i];
      const x = centerX + statRadius * Math.cos(angle);
      const y = centerY + statRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#e2c94f";
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Calculate font size based on canvas size
    const fontSize = Math.max(10, Math.min(14, dimensions.width / 25));
    const labelPadding = 8;

    // Draw labels with background for better readability
    ctx.font = `${fontSize}px 'Cascadia Code', monospace`;

    for (let i = 0; i < labels.length; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;

      // Position labels further out based on screen size
      const labelDistance = isSmallScreen ? 1.2 : 1.15;
      const labelRadius = radius * labelDistance;

      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      // Measure text for background
      const textWidth = ctx.measureText(labels[i]).width;
      const textHeight = fontSize;

      // Adjust text alignment and position based on angle
      let textAlign = "center";
      let textBaseline = "middle";
      let rectX = x - textWidth / 2;
      let rectY = y - textHeight / 2;

      if (angle === -Math.PI / 2) {
        // Top
        textAlign = "center";
        textBaseline = "bottom";
        rectY = y - textHeight;
      } else if (Math.abs(angle - Math.PI / 2) < 0.1) {
        // Bottom
        textAlign = "center";
        textBaseline = "top";
      } else if (angle < 0 || angle > Math.PI) {
        // Right side
        textAlign = "left";
        textBaseline = "middle";
        rectX = x;
      } else {
        // Left side
        textAlign = "right";
        textBaseline = "middle";
        rectX = x - textWidth;
      }

      // Draw text background
      ctx.fillStyle = "rgba(37, 37, 37, 0.85)";
      ctx.fillRect(
        rectX - labelPadding,
        rectY - labelPadding / 2,
        textWidth + labelPadding * 2,
        textHeight + labelPadding
      );

      // Draw text
      ctx.fillStyle = "#e0e0e0";
      ctx.textAlign = textAlign as CanvasTextAlign;
      ctx.textBaseline = textBaseline as CanvasTextBaseline;
      ctx.fillText(labels[i], x, y);

      // Draw stat value near each point
      const statValueRadius = radius * statValues[i] * 0.85;
      const statX = centerX + statValueRadius * Math.cos(angle);
      const statY = centerY + statValueRadius * Math.sin(angle);

      // Draw value background
      const valueText = (statValues[i] * 10).toString();
      const valueWidth = ctx.measureText(valueText).width;

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.arc(statX, statY, valueWidth + 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw value text
      ctx.font = `bold ${fontSize - 2}px 'Cascadia Code', monospace`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(valueText, statX, statY);
    }
  }, [dimensions, stats, isSmallScreen]);

  return (
    <div className="stats-chart">
      <canvas ref={canvasRef} />
    </div>
  );
}
