// State of the agent, make sure this aligns with your agent's state.
export type AgentState = {
  proverbs: string[];
};

export type GraphVertex = {
  id: string;
  x: number;
  y: number;
  label: string;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
};

export type GraphState = {
  vertices: GraphVertex[];
  edges: GraphEdge[];
};
