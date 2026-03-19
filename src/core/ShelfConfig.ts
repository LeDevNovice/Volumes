/**
 * 1 Three.js unit = 1 cm.
 * The source of truth for building shelves.
 */

export interface ShelfConfig {
  width: number; // Inner width between the outer faces of the two side panels in cm.
  totalHeight: number; // Outer height from floor to top face of the top board in cm.
  depth: number; // Front to back depth of all boards and panels in cm.
  boardThickness: number; // Thickness of every horizontal board and side panel in cm.
  /*
   * Total number of horizontal boards in the model.
   * Minimum 2 (bottom and top only).
   * shelfCount = 4 = bottom + 2 internal + top = 3 book zones.
   */
  shelfCount: number;
  hasBack: boolean;
  hasSides: boolean;
  /*
   * Wood color used for all components for now.
   * Hex integer.
   */
  color: number;
}

export type PartialShelfConfig = Partial<ShelfConfig>;

// Default config shelf (80×200×30 cm).
export const defaultShelfConfig: ShelfConfig = {
  width: 80,
  totalHeight: 200,
  depth: 30,
  boardThickness: 2,
  shelfCount: 4,
  hasBack: true,
  hasSides: true,
  color: 0xc68642,
} as const;

export interface BoardPosition {
  index: number; // Zero based index.
  label: 'bottom' | `internal-${number}` | 'top';
  centerY: number; // Y coordinate of the center of this board in cm.
  bottomFaceY: number; // Y coordinate of the board bottom face in cm.
  topFaceY: number; // Y coordinate of the board top face in cm. The surface books rest on.
}

//   Y = 0 : floor (bottom face of bottom board).
//   Y = totalHeight : ceiling (top face of top board).
//   X = 0 : horizontal centre.
export function computeBoardPositions(config: ShelfConfig): BoardPosition[] {
  const { totalHeight, boardThickness, shelfCount } = config;

  const half = boardThickness / 2; // used to convert from center Y to face Y in both directions.
  const internalCount = shelfCount - 2; // every board that is not the bottom or the top

  // This is the space that books and internal boards share.
  const usableBottom = boardThickness;
  const usableTop = totalHeight - boardThickness;
  const usableHeight = usableTop - usableBottom; // cm available for books + internal.

  const zoneCount = internalCount + 1;

  const positions: BoardPosition[] = [];

  // Bottom board
  // Bottom face at Y=0 (the floor), so its center is at half the thickness.
  positions.push({
    index: 0,
    label: 'bottom',
    centerY: half,
    bottomFaceY: 0,
    topFaceY: boardThickness, // where books rest.
  });

  // Internal boards
  // Each board center is placed at an evenly spaced fraction of the usable height
  // Position the center of the board, not its face.
  // Three.js draws half the thickness above and half below the centerY.
  for (let i = 1; i <= internalCount; i++) {
    const centerY = usableBottom + (i / zoneCount) * usableHeight;

    positions.push({
      index: i,
      label: `internal-${i}`,
      centerY,
      bottomFaceY: centerY - half,
      topFaceY: centerY + half, // where books rest.
    });
  }

  // Top board
  // Top face sits at Y = totalHeight, so its center is half thickness below.
  positions.push({
    index: shelfCount - 1,
    label: 'top',
    centerY: totalHeight - half,
    bottomFaceY: totalHeight - boardThickness,
    topFaceY: totalHeight, // the ceiling
  });

  return positions;
}

// The usable book height of each zone (floor of zone to bottom of board above).
// Used for book placement calculations.
export function computeZoneHeight(config: ShelfConfig): number {
  const { totalHeight, boardThickness, shelfCount } = config;

  const usableHeight = totalHeight - 2 * boardThickness; // Vertical space between the top face of the bottom board and the bottom face of the top board
  const internalCount = shelfCount - 2;
  const zoneCount = internalCount + 1; // Number of book zones

  return (usableHeight - internalCount * boardThickness) / zoneCount;
}
