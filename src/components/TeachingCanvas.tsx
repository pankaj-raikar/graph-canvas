"use client";

import { useEffect, useRef, useState } from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import * as fabric from "fabric";

import { GraphState } from "@/lib/types";

const annotationPositions = ["top", "bottom", "left", "right"] as const;
type AnnotationPosition = (typeof annotationPositions)[number];
const annotationOffsets: Record<AnnotationPosition, { x: number; y: number }> =
  {
    top: { x: 0, y: -40 },
    bottom: { x: 0, y: 60 },
    left: { x: -80, y: 0 },
    right: { x: 80, y: 0 },
  };

const isAnnotationPosition = (value: string): value is AnnotationPosition =>
  annotationPositions.includes(value as AnnotationPosition);

export function TeachingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [graph, setGraph] = useState<GraphState>({
    vertices: [],
    edges: [],
  });

  // Store fabric objects for easy lookup and updates
  const vertexObjects = useRef<
    Map<string, { circle: fabric.Circle; text: fabric.Text }>
  >(new Map());
  const edgeObjects = useRef<Map<string, fabric.Line>>(new Map());

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });
    setFabricCanvas(canvas);

    let hasDisposed = false;

    // React strict mode runs effects/cleanups twice in dev; guard so Fabric
    // dispose only executes once per instance to avoid DOM removal errors.
    return () => {
      if (hasDisposed) return;
      hasDisposed = true;
      canvas.dispose();
      setFabricCanvas((prev) => (prev === canvas ? null : prev));
    };
  }, []);

  useCopilotReadable({
    description: "Current graph state with vertices and edges",
    value: JSON.stringify(graph),
  });

  useCopilotReadable({
    description: "List of all vertex IDs and labels",
    value: graph.vertices.map((v) => `${v.id}:${v.label}`).join(", "),
  });

  useCopilotAction({
    name: "drawVertex",
    description: "Draw a vertex (node) on the canvas at specified coordinates",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Unique identifier for the vertex",
      },
      { name: "x", type: "number", description: "X coordinate position" },
      { name: "y", type: "number", description: "Y coordinate position" },
      {
        name: "label",
        type: "string",
        description: "Display label for the vertex",
      },
    ],
    handler: async ({ id, x, y, label }) => {
      if (!fabricCanvas) return "Canvas not initialized";

      // Check if vertex already exists
      if (vertexObjects.current.has(id)) {
        return `Vertex ${id} already exists`;
      }

      // Add delay based on number of existing vertices for sequential appearance
      const delayTime = graph.vertices.length * 600; // 600ms delay per existing vertex
      await new Promise((resolve) => setTimeout(resolve, delayTime));

      // Center the circle at x,y (radius is 25)
      const circle = new fabric.Circle({
        left: x - 25,
        top: y - 25,
        radius: 25,
        stroke: "#4a9eff",
        strokeWidth: 3,
        fill: "#1a3a5a",
        opacity: 0,
        selectable: false,
        originX: "left",
        originY: "top",
      });

      // Center text in the circle
      const text = new fabric.Text(label, {
        left: x,
        top: y,
        fontSize: 18,
        fill: "white",
        opacity: 0,
        selectable: false,
        originX: "center",
        originY: "center",
        fontWeight: "bold",
      });

      fabricCanvas.add(circle, text);

      // Store references
      vertexObjects.current.set(id, { circle, text });

      // Animate
      circle.animate(
        { opacity: 1 },
        {
          duration: 500,
          onChange: () => fabricCanvas.renderAll(),
        }
      );
      text.animate(
        { opacity: 1 },
        {
          duration: 500,
          onChange: () => fabricCanvas.renderAll(),
        }
      );

      // Update state
      setGraph((prev) => ({
        ...prev,
        vertices: [...prev.vertices, { id, x, y, label }],
      }));

      return `Drew vertex ${label} at (${x}, ${y})`;
    },
  });

  useCopilotAction({
    name: "drawEdge",
    description: "Draw an edge (line) connecting two vertices",
    parameters: [
      { name: "from", type: "string", description: "ID of source vertex" },
      { name: "to", type: "string", description: "ID of destination vertex" },
      {
        name: "weight",
        type: "number",
        required: false,
        description: "Optional edge weight",
      },
      {
        name: "directed",
        type: "boolean",
        required: false,
        description: "Whether edge is directed (arrow)",
      },
    ],
    handler: async ({ from, to, weight, directed = false }) => {
      if (!fabricCanvas) return "Canvas not initialized";

      const fromV = graph.vertices.find((v) => v.id === from);
      const toV = graph.vertices.find((v) => v.id === to);

      if (!fromV || !toV) {
        return `Vertices not found. Available: ${graph.vertices
          .map((v) => v.id)
          .join(", ")}`;
      }

      const edgeId = `${from}-${to}`;
      if (edgeObjects.current.has(edgeId)) {
        return `Edge from ${from} to ${to} already exists`;
      }

      // Add delay based on number of existing edges for sequential drawing
      const delayTime = graph.edges.length * 1200; // 1200ms delay per existing edge
      await new Promise((resolve) => setTimeout(resolve, delayTime));

      // Calculate angle and distance
      const dx = toV.x - fromV.x;
      const dy = toV.y - fromV.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Create line that starts at fromV and will animate to toV
      const line = new fabric.Line([fromV.x, fromV.y, fromV.x, fromV.y], {
        stroke: "#4a9eff",
        strokeWidth: 2,
        selectable: false,
        evented: false,
      });

      // Add line to canvas
      fabricCanvas.add(line);
      fabricCanvas.sendObjectToBack(line);

      edgeObjects.current.set(edgeId, line);

      // Wait for vertices to be fully rendered before drawing edge
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create pencil icon using Image
      const pencilImg = new Image();
      pencilImg.crossOrigin = "anonymous"; // Enable CORS for external images
      //   pencilImg.src = 'data:image/svg+xml,' + encodeURIComponent(`
      //     <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      //       <path d="M27 4l-3-3-17 17v3h3l17-17zm-3 0l3 3" stroke="#FFD700" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      //       <rect x="1" y="21" width="4" height="4" fill="#FFD700" stroke="#333" stroke-width="1"/>
      //     </svg>
      //   `);
      pencilImg.src = "/maths/venugopal-croped.png";

      // Wait for image to load before creating fabric object
      await new Promise((resolve) => {
        pencilImg.onload = resolve;
        // Fallback if image fails to load
        setTimeout(resolve, 100);
      });

      const pencil = new fabric.Image(pencilImg, {
        left: fromV.x,
        top: fromV.y,
        angle: 0, // Keep original image angle (no rotation)
        originX: "center",
        originY: "center",
        scaleX: 0.15,
        scaleY: 0.15,
        selectable: false,
        evented: false,
      });

      // Add pencil to canvas
      fabricCanvas.add(pencil);
      fabricCanvas.renderAll();

      // Animate the line drawing with pencil moving along
      const startTime = Date.now();
      const duration = 1000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Update line endpoint
        const currentX = fromV.x + dx * progress;
        const currentY = fromV.y + dy * progress;
        line.set({ x2: currentX, y2: currentY });

        // Update pencil position and angle
        pencil.set({
          left: currentX,
          top: currentY,
        });

        fabricCanvas.renderAll();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Remove pencil when done
          fabricCanvas.remove(pencil);

          // Add arrow if directed (after animation completes)
          if (directed) {
            const arrowAngle = Math.atan2(toV.y - fromV.y, toV.x - fromV.x);
            const arrowSize = 12;
            const arrowX = toV.x - Math.cos(arrowAngle) * 30;
            const arrowY = toV.y - Math.sin(arrowAngle) * 30;

            const arrow = new fabric.Triangle({
              left: arrowX,
              top: arrowY,
              width: arrowSize,
              height: arrowSize,
              fill: "#4a9eff",
              angle: (arrowAngle * 180) / Math.PI + 90,
              selectable: false,
              evented: false,
              originX: "center",
              originY: "center",
            });

            fabricCanvas.add(arrow);
          }

          // Add weight label if provided (after animation completes)
          if (weight !== undefined) {
            const midX = (fromV.x + toV.x) / 2;
            const midY = (fromV.y + toV.y) / 2;

            const weightText = new fabric.Text(weight.toString(), {
              left: midX,
              top: midY - 15,
              fontSize: 14,
              fill: "#ffeb3b",
              backgroundColor: "rgba(0,0,0,0.7)",
              padding: 3,
              selectable: false,
              evented: false,
              originX: "center",
              originY: "center",
            });

            fabricCanvas.add(weightText);
          }

          fabricCanvas.renderAll();
        }
      };

      animate();

      // Update state
      setGraph((prev) => ({
        ...prev,
        edges: [...prev.edges, { from, to, weight, directed }],
      }));

      return `Drew ${directed ? "directed " : ""}edge from ${from} to ${to}${
        weight ? ` with weight ${weight}` : ""
      }`;
    },
  });

  useCopilotAction({
    name: "clearCanvas",
    description: "Clear all elements from the canvas to start fresh",
    parameters: [],
    handler: async () => {
      if (!fabricCanvas) return "Canvas not initialized";

      fabricCanvas.clear();
      fabricCanvas.backgroundColor = "#ffffff";
      fabricCanvas.renderAll();

      vertexObjects.current.clear();
      edgeObjects.current.clear();

      setGraph({ vertices: [], edges: [] });

      return "Canvas cleared successfully";
    },
  });

  useCopilotAction({
    name: "annotate",
    description: "Add annotation",
    parameters: [
      { name: "target", type: "string" },
      { name: "text", type: "string" },
      { name: "position", type: "string" },
    ],
    handler: async ({
      target,
      text,
      position,
    }: {
      target: string;
      text: string;
      position: string;
    }) => {
      if (!fabricCanvas) return;
      const vertex = graph.vertices.find((v) => v.id === target);
      if (!vertex) return "Vertex not found";
      const safePosition = isAnnotationPosition(position) ? position : "top";
      const offset = annotationOffsets[safePosition];
      const annotation = new fabric.Text(text, {
        left: vertex.x + offset.x,
        top: vertex.y + offset.y,
        fontSize: 14,
        fill: "#ffeb3b",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 5,
        opacity: 0,
      });
      fabricCanvas.add(annotation);
      annotation.animate(
        { opacity: 1 },
        {
          duration: 300,
          onChange: fabricCanvas.renderAll.bind(fabricCanvas),
        }
      );
      return `Added annotation ${text} to ${target}`;
    },
  });

  useCopilotAction({
    name: "showFormula",
    description: "Display a mathematical formula on the canvas",
    parameters: [
      { name: "latex", type: "string", description: "LaTeX formula string" },
      { name: "x", type: "number", description: "X position for formula" },
      { name: "y", type: "number", description: "Y position for formula" },
    ],
    handler: async ({ latex, x, y }: any) => {
      if (!fabricCanvas) return "Canvas not initialized";

      const formulaText = new fabric.Text(latex, {
        left: x,
        top: y,
        fontSize: 18,
        fill: "#4caf50",
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 10,
        fontFamily: "Courier New",
        opacity: 0,
        selectable: false,
      });

      fabricCanvas.add(formulaText);
      formulaText.animate(
        { opacity: 1 },
        {
          duration: 400,
          onChange: () => fabricCanvas.renderAll(),
        }
      );

      return `Displayed formula: ${latex} at (${x}, ${y})`;
    },
  });

  useCopilotAction({
    name: "highlight",
    description:
      "Highlight specific vertices temporarily. Pass vertex IDs as comma-separated string.",
    parameters: [
      {
        name: "elementIds",
        type: "string",
        description: "Comma-separated vertex IDs to highlight (e.g., 'A,B,C')",
      },
      {
        name: "color",
        type: "string",
        required: false,
        description: "Highlight color",
      },
      {
        name: "duration",
        type: "number",
        required: false,
        description: "Duration in ms",
      },
    ],
    handler: async ({ elementIds, color = "yellow", duration = 2000 }: any) => {
      const elements = elementIds.split(",").map((id: string) => id.trim());
      if (!fabricCanvas) return "Canvas not initialized";

      const highlightedVertices: Array<{
        circle: fabric.Circle;
        originalStroke: string;
      }> = [];

      for (const elementId of elements) {
        const vertexObj = vertexObjects.current.get(elementId);
        if (vertexObj) {
          const originalStroke = vertexObj.circle.stroke as string;
          vertexObj.circle.set({ stroke: color, strokeWidth: 5 });
          highlightedVertices.push({
            circle: vertexObj.circle,
            originalStroke,
          });
        }
      }

      fabricCanvas.renderAll();

      // Reset after duration
      setTimeout(() => {
        highlightedVertices.forEach(({ circle, originalStroke }) => {
          circle.set({ stroke: originalStroke, strokeWidth: 3 });
        });
        fabricCanvas.renderAll();
      }, duration);

      return `Highlighted ${elements.length} vertices for ${duration}ms`;
    },
  });

  return <canvas ref={canvasRef} />;
}
