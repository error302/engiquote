// DXF Parser Service for plan extraction
// Uses pattern matching to extract dimensions from DXF files

export interface ExtractedDimensions {
  floorAreas: number[];
  totalFloorArea: number;
  wallPerimeter: number;
  openings: number;
  storeys: number;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

const FLOOR_LAYERS = ['FLOOR', 'SLAB', 'GF-FLOOR', 'FF-FLOOR', 'GROUND-FLOOR', 'FLOOR1', 'FLOOR2'];
const WALL_LAYERS = ['WALL', 'EXT-WALL', 'EXTERNAL-WALL', 'EXT_WALL', 'WALLS'];
const OPENING_NAMES = ['DOOR', 'WINDOW', 'D1', 'W1', 'WIN', 'DR', 'DOOR-', 'WINDOW-'];

export function parseDXFContent(content: string): ExtractedDimensions {
  const lines = content.split('\n');
  const floorAreas: number[] = [];
  let wallPerimeter = 0;
  let openings = 0;
  const warnings: string[] = [];

  let currentEntity: any = null;
  let currentLayer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '0') {
      currentEntity = null;
    }
    
    if (line === '8') {
      currentLayer = lines[i + 1]?.trim() || '';
    }
    
    if (line === 'LWPOLYLINE' || line === 'POLYLINE') {
      currentEntity = { type: 'polyline', layer: currentLayer };
    }
    
    if (line === 'INSERT') {
      const nameLine = lines[i + 1];
      if (nameLine && OPENING_NAMES.some(n => nameLine.includes(n))) {
        openings++;
      }
    }
    
    if (line === 'CIRCLE' || line === 'ARC') {
      const radiusLine = lines[i + 1];
      if (radiusLine === '40') {
        const radius = parseFloat(lines[i + 2]);
        if (currentLayer && FLOOR_LAYERS.some(l => currentLayer.includes(l))) {
          floorAreas.push(Math.PI * radius * radius);
        }
      }
    }
  }

  if (floorAreas.length === 0) {
    warnings.push('No floor areas detected. Check layer naming.');
  }

  const totalFloorArea = floorAreas.reduce((sum, a) => sum + a, 0);
  const storeys = Math.max(1, floorAreas.length);

  return {
    floorAreas,
    totalFloorArea: Math.round(totalFloorArea * 100) / 100,
    wallPerimeter: Math.round(wallPerimeter * 100) / 100,
    openings,
    storeys,
    confidence: floorAreas.length > 0 ? 'high' : 'low',
    warnings,
  };
}

export function extractFromDXFFile(filepath: string): ExtractedDimensions {
  try {
    const fs = require('fs');
    const content = fs.readFileSync(filepath, 'utf-8');
    return parseDXFContent(content);
  } catch (error) {
    return {
      floorAreas: [],
      totalFloorArea: 0,
      wallPerimeter: 0,
      openings: 0,
      storeys: 1,
      confidence: 'low',
      warnings: ['Failed to read file'],
    };
  }
}

export function extractFromManualInput(data: {
  floorAreaSqm?: number;
  wallPerimeterLm?: number;
  openingsCount?: number;
  storeys?: number;
}): ExtractedDimensions {
  return {
    floorAreas: data.floorAreaSqm ? [data.floorAreaSqm] : [],
    totalFloorArea: data.floorAreaSqm || 0,
    wallPerimeter: data.wallPerimeterLm || 0,
    openings: data.openingsCount || 0,
    storeys: data.storeys || 1,
    confidence: 'high',
    warnings: [],
  };
}

export function extractFromPDFInput(data: {
  dimensions: { length: number; width: number; height: number };
  floors: number;
  openings: { doors: number; windows: number };
}): ExtractedDimensions {
  const { length, width, height, floors, openings } = data;
  const floorArea = length * width;
  
  return {
    floorAreas: Array(floors).fill(floorArea),
    totalFloorArea: floorArea * floors,
    wallPerimeter: 2 * (length + width) * floors,
    openings: openings.doors + openings.windows,
    storeys: floors,
    confidence: 'medium',
    warnings: ['Manual input - verify dimensions'],
  };
}