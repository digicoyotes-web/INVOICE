/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function D3Sparkline({ 
  data, 
  width = 140, 
  height = 40, 
  color = "#f59e0b" 
}: D3SparklineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    const padding = 4;
    const w = width;
    const h = height;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([padding, w - padding]);

    const yMin = d3.min(data) ?? 0;
    const yMax = d3.max(data) ?? 1;
    // Prevent flat line issues if max === min
    const yRange = yMax === yMin ? 1 : (yMax - yMin);

    const yScale = d3.scaleLinear()
      .domain([yMin - 0.1 * yRange, yMax + 0.1 * yRange])
      .range([h - padding, padding]);

    // Line generator with smooth cardinal spline
    const lineGenerator = d3.line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    // Area generator for visual volume under the sparkline
    const areaGenerator = d3.area<number>()
      .x((_, i) => xScale(i))
      .y0(h)
      .y1((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    // Render unique linear gradient for area fill
    const gradId = `spark-glow-${Math.random().toString(36).substring(2, 9)}`;
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", gradId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.3);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0);

    // Render area path
    svg.append("path")
      .datum(data)
      .attr("fill", `url(#${gradId})`)
      .attr("d", areaGenerator);

    // Render line path
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", lineGenerator);

    // Pulsing end indicator dot
    const lastIdx = data.length - 1;
    const dotX = xScale(lastIdx);
    const dotY = yScale(data[lastIdx]);

    svg.append("circle")
      .attr("cx", dotX)
      .attr("cy", dotY)
      .attr("r", 3)
      .attr("fill", color);

    svg.append("circle")
      .attr("cx", dotX)
      .attr("cy", dotY)
      .attr("r", 6)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1)
      .attr("class", "animate-ping")
      .style("transform-origin", `${dotX}px ${dotY}px`);

  }, [data, width, height, color]);

  return (
    <svg 
      id="recent-activity-sparkline"
      ref={svgRef} 
      width={width} 
      height={height} 
      className="overflow-visible"
    />
  );
}
