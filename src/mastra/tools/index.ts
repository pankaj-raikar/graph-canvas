import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface GeocodingResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}
interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

export type WeatherToolResult = z.infer<typeof WeatherToolResultSchema>;

const WeatherToolResultSchema = z.object({
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  windGust: z.number(),
  conditions: z.string(),
  location: z.string(),
});

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: WeatherToolResultSchema,
  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});

const getWeather = async (location: string) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as WeatherResponse;

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || 'Unknown';
}

// Draw canvs tools can be added here in the future

export const drawVertexTool = createTool({
  id: "draw-vertex",
  description: "Draw a vertex (node) on the canvas at specified coordinates. Vertices are the fundamental building blocks of graphs. Canvas dimensions are 800x600 pixels.",
  inputSchema: z.object({
    id: z.string().describe('Unique identifier for the vertex (e.g., A, B, C, v1, v2). Must be unique.'),
    x: z.number().min(50).max(750).describe('X coordinate position (50-750 recommended for visibility)'),
    y: z.number().min(50).max(550).describe('Y coordinate position (50-550 recommended for visibility)'),
    label: z.string().describe('Display label for the vertex (typically same as id)'),
  }),
  outputSchema: z.object({
    action: z.literal("drawVertex"),
    data: z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      label: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    const { id, x, y, label } = context;
    return {
      action: "drawVertex" as const,
      data: { id, x, y, label },
    };
  },
});


export const drawEdgeTool = createTool({
  id: "draw-edge",
  description: "Draw an edge (connection line) between two existing vertices. CRITICAL: Both vertices must already exist on the canvas before drawing an edge between them.",
  inputSchema: z.object({
    from: z.string().describe('ID of source vertex (must exist on canvas)'),
    to: z.string().describe('ID of destination vertex (must exist on canvas)'),
    weight: z.number().optional().describe('Optional numeric weight/cost for weighted graphs'),
    directed: z.boolean().optional().describe('Set true for directed edge (with arrow), false for undirected'),
  }),
  outputSchema: z.object({
    action: z.literal("drawEdge"),
    data: z.object({
      from: z.string(),
      to: z.string(),
      weight: z.number().optional(),
      directed: z.boolean().optional(),
    }),
  }),
  execute: async ({ context }) => {
    const { from, to, weight, directed = false } = context;
    return {
      action: "drawEdge" as const,
      data: { from, to, weight, directed },
    };
  },
});

export const annotateTool = createTool({
  id: 'annotate',
  description: 'Add text annotation near a vertex to explain concepts, show properties (degree, distance, color), or highlight important information',
  inputSchema: z.object({
    target: z.string().describe('ID of vertex to annotate'),
    text: z.string().describe('Annotation text to display'),
    position: z.enum(['top', 'bottom', 'left', 'right']).describe('Position relative to vertex'),
  }),
  outputSchema: z.object({
    action: z.literal('annotate'),
    data: z.object({
      target: z.string(),
      text: z.string(),
      position: z.enum(['top', 'bottom', 'left', 'right']),
    }),
  }),
  execute: async ({ context }) => {
    const { target, text, position } = context;
    return {
      action: 'annotate' as const,
      data: { target, text, position },
    };
  },
});

export const showFormulaTool = createTool({
  id: 'show-formula',
  description: 'Display mathematical formula on canvas using LaTeX notation. Useful for showing graph theorems, algorithms, or complexity formulas.',
  inputSchema: z.object({
    latex: z.string().describe('LaTeX formula string (e.g., "V - E + F = 2" for Euler formula)'),
    x: z.number().describe('X coordinate for formula position'),
    y: z.number().describe('Y coordinate for formula position'),
  }),
  outputSchema: z.object({
    action: z.literal('showFormula'),
    data: z.object({
      latex: z.string(),
      x: z.number(),
      y: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    const { latex, x, y } = context;
    return {
      action: 'showFormula' as const,
      data: { latex, x, y },
    };
  },
});

export const highlightTool = createTool({
  id: 'highlight',
  description: 'Temporarily highlight specific vertices to draw attention during explanations or show algorithm progression step-by-step. Provide vertex IDs as comma-separated string.',
  inputSchema: z.object({
    elementIds: z.string().describe('Comma-separated vertex IDs to highlight (e.g., "A,B,C")'),
    color: z.string().optional().describe('Highlight color (yellow, red, green, etc.)'),
    duration: z.number().optional().describe('Duration in milliseconds (default 2000ms)'),
  }),
  outputSchema: z.object({
    action: z.literal('highlight'),
    data: z.object({
      elementIds: z.string(),
      color: z.string().optional(),
      duration: z.number().optional(),
    }),
  }),
  execute: async ({ context }) => {
    const { elementIds, color = 'yellow', duration = 2000 } = context;
    return {
    action: 'highlight' as const,
    data: { elementIds, color, duration },
  };
  },
});