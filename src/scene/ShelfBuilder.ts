import * as THREE from 'three';
import {
  computeBoardPositions,
  computeZoneHeight,
  defaultShelfConfig,
  type PartialShelfConfig,
  type ShelfConfig,
} from '../core/ShelfConfig';

const debugMaterials = {
  board: new THREE.MeshBasicMaterial({ color: 0xc68642, side: THREE.DoubleSide }),
  side: new THREE.MeshBasicMaterial({ color: 0x1d9e75, side: THREE.DoubleSide }),
  back: new THREE.MeshBasicMaterial({
    color: 0x378add,
    side: THREE.DoubleSide,
    opacity: 0.7,
    transparent: true,
  }),
  wire: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    opacity: 0.15,
    transparent: true,
  }),
} as const;

export function buildSingleBoard(config: ShelfConfig): THREE.Group {
  const cfg = { ...defaultShelfConfig, ...config };
  const { width, depth, boardThickness } = cfg;

  const group = new THREE.Group();
  group.name = 'ShelfUnit';
  const boardGeo = new THREE.BoxGeometry(width, boardThickness, depth);

  const bottomBoard = new THREE.Mesh(boardGeo, debugMaterials.board);
  bottomBoard.position.y = boardThickness / 2;

  const bottomWire = new THREE.Mesh(boardGeo, debugMaterials.wire);
  bottomWire.position.y = boardThickness / 2;

  bottomBoard.userData = {
    type: 'board',
    boardIndex: 0,
    label: 'bottom',
  };

  group.add(bottomBoard, bottomWire);

  return group;
}

export function buildShelf(partialConfig: PartialShelfConfig = {}): THREE.Group {
  const cfg: ShelfConfig = { ...defaultShelfConfig, ...partialConfig };
  return buildSingleBoard(cfg);
}

export { computeBoardPositions, computeZoneHeight, defaultShelfConfig };
export type { PartialShelfConfig, ShelfConfig };
