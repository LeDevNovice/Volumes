export interface ShelfConfig {
  width: number;
  totalHeight: number;
  depth: number;
  boardThickness: number;
  shelfCount: number;
  hasBack: boolean;
  hasSides: boolean;
  color: number;
}

export type PartialShelfConfig = Partial<ShelfConfig>;

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
  index: number;
  label: 'bottom' | `internal-${number}` | 'top';
  centerY: number;
  bottomFaceY: number;
  topFaceY: number;
}

export function computeBoardPositions(config: ShelfConfig): BoardPosition[] {
  const { totalHeight, boardThickness, shelfCount } = config;

  const half = boardThickness / 2;

  const usableBottom = boardThickness;
  const usableTop = totalHeight - boardThickness;
  const usableHeight = usableTop - usableBottom;

  const internalCount = shelfCount - 2;
  const zoneCount = internalCount + 1;

  const positions: BoardPosition[] = [];

  positions.push({
    index: 0,
    label: 'bottom',
    centerY: half,
    bottomFaceY: 0,
    topFaceY: boardThickness,
  });

  for (let i = 1; i <= internalCount; i++) {
    const centerY = usableBottom + (i / zoneCount) * usableHeight;

    positions.push({
      index: i,
      label: `internal-${i}`,
      centerY,
      bottomFaceY: centerY - half,
      topFaceY: centerY + half,
    });
  }

  positions.push({
    index: shelfCount - 1,
    label: 'top',
    centerY: totalHeight - half,
    bottomFaceY: totalHeight - boardThickness,
    topFaceY: totalHeight,
  });

  return positions;
}

export function computeZoneHeight(config: ShelfConfig): number {
  const { totalHeight, boardThickness, shelfCount } = config;

  const usableHeight = totalHeight - 2 * boardThickness;
  const internalCount = shelfCount - 2;
  const zoneCount = internalCount + 1;

  return (usableHeight - internalCount * boardThickness) / zoneCount;
}
