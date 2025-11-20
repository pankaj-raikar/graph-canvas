# Graph Canvas Improvements

## Summary

Improved the agent and canvas fabric logic to properly connect graph edges, sync state, and add memory support for conversation history.

## Key Improvements

### 1. **TeachingCanvas Component (`src/components/TeachingCanvas.tsx`)**

#### Edge Connection Fix

- **Problem**: Edges were not properly connecting to vertices
- **Solution**:
  - Vertices now use center coordinates (x, y) for positioning
  - Circles are positioned with `left: x - 25, top: y - 25` to center at (x, y)
  - Text labels use `originX: 'center', originY: 'center'` for proper centering
  - Edges connect using vertex center points directly
  - Lines are sent to back layer so they appear behind vertices

#### State Management

- Added `useRef` maps to track fabric objects:
  ```typescript
  const vertexObjects = useRef<
    Map<string, { circle: fabric.Circle; text: fabric.Text }>
  >(new Map());
  const edgeObjects = useRef<Map<string, fabric.Line>>(new Map());
  ```
- Prevents duplicate vertices/edges
- Allows easy lookup for highlighting and updates

#### Improved State Sync

- Enhanced `useCopilotReadable` to expose both full graph state and vertex IDs
- Agent can now see available vertices before drawing edges
- State updates are synchronous with visual rendering

#### New Features

- **Directed Edges**: Support for arrows on directed graphs
- **Edge Weights**: Display numeric weights on edges
- **Clear Canvas**: New action to reset the canvas
- **Show Formula**: Display LaTeX-like formulas on canvas
- **Highlight**: Temporarily highlight vertices with color changes

#### Better Visual Design

- Vertices have filled backgrounds (`fill: "#1a3a5a"`)
- Edges have proper layering (behind vertices)
- Animations for smooth rendering
- Bold labels for better visibility
- Proper color scheme (#4a9eff for vertices, #888 for edges)

### 2. **Graph Teacher Agent (`src/mastra/agents/index.ts`)**

#### Enhanced Instructions

- **Critical Workflow**: Step-by-step guidance to draw vertices before edges
- **Context Awareness**: Agent checks "List of all vertex IDs" from readable context
- **Canvas Layout Tips**: Specific coordinate recommendations for different graph types
- **Teaching Approach**: Progressive, visual step-by-step explanations

#### Memory Integration

- Added Mastra Memory with LibSQL storage
- Conversation history persists across sessions
- Agent remembers previous graph states and builds on them
- File-based memory for persistence: `file::memory:`

#### Better Error Prevention

- Instructions emphasize checking vertex existence before drawing edges
- Provides clear examples of proper teaching sequences
- Suggests coordinate layouts for common graph types (triangle, square, pentagon)

### 3. **Tool Definitions (`src/mastra/tools/index.ts`)**

#### Enhanced Descriptions

- **drawVertexTool**: Now explains canvas dimensions (800x600) and coordinate ranges
- **drawEdgeTool**: CRITICAL warning that vertices must exist first
- **annotateTool**: Explains use cases (degree, distance, properties)
- **showFormulaTool**: Examples of graph theory formulas
- **highlightTool**: Describes use for algorithm visualization

#### Better Schema Validation

- Added `.min()` and `.max()` constraints on coordinates (50-750, 50-550)
- Descriptive `.describe()` on all fields for better LLM understanding
- Clear examples in descriptions (e.g., "A, B, C, v1, v2" for vertex IDs)

## Technical Details

### State Synchronization Flow

1. User asks agent to draw a graph
2. Agent checks `useCopilotReadable` context for existing vertices
3. Agent calls `drawVertex` actions sequentially
4. Each vertex updates both:
   - React state: `setGraph(prev => ...)`
   - Fabric canvas: Objects stored in `vertexObjects.current`
5. Agent calls `drawEdge` actions, which:
   - Validate both vertices exist
   - Create animated line between center points
   - Update both state and fabric objects
6. Canvas re-renders with proper layering

### Memory Architecture

```typescript
memory: new Memory({
  storage: new LibSQLStore({ url: "file::memory:" }),
});
```

- Stores conversation threads in SQLite
- Persists across sessions
- Agent can reference previous graphs and concepts
- Enables progressive teaching

### Coordinate System

- Canvas: 800x600 pixels
- Safe zone: 50-750 (x), 50-550 (y)
- Vertex radius: 25 pixels
- Center positioning for accurate edge connections

## Example Usage

```typescript
// Agent teaches a simple triangle graph:
1. drawVertex(id="A", x=300, y=150, label="A")
2. drawVertex(id="B", x=500, y=150, label="B")
3. drawVertex(id="C", x=400, y=350, label="C")
4. drawEdge(from="A", to="B")
5. drawEdge(from="B", to="C")
6. drawEdge(from="C", to="A")
7. annotate(target="A", text="degree=2", position="top")
```

## Benefits

1. **Edges Connect Properly**: Fixed coordinate calculations ensure edges align with vertex centers
2. **No Duplicate Elements**: Map-based tracking prevents redrawing existing vertices/edges
3. **Better State Sync**: CopilotKit readable context keeps agent and canvas in sync
4. **Memory Support**: Agent remembers context and builds progressive lessons
5. **Error Prevention**: Clear instructions and validation reduce agent mistakes
6. **Visual Polish**: Professional appearance with proper layering and animations
7. **Feature Complete**: All actions (draw, annotate, highlight, formula, clear) implemented

## Testing Recommendations

1. **Simple Graph**: Ask agent to "draw a simple triangle graph"
2. **Directed Graph**: Ask for "directed graph with 4 vertices"
3. **Weighted Graph**: Request "weighted graph showing shortest path"
4. **Clear & Redraw**: Test "clear the canvas and draw a pentagon"
5. **Highlight**: Try "highlight the vertices in the cycle"

## Next Steps (Optional Enhancements)

- [ ] Add curved edges for multi-edges
- [ ] Support for graph coloring visualization
- [ ] Animation of graph algorithms (BFS, DFS, Dijkstra)
- [ ] Export graph to image/JSON
- [ ] Interactive vertex dragging
- [ ] Undo/redo functionality
