import * as THREE from 'three';
import {
  computeBoardPositions,
  computeZoneHeight,
  defaultShelfConfig,
  type PartialShelfConfig,
  type ShelfConfig,
} from '../core/ShelfConfig';

const MAT = {
  board: new THREE.MeshStandardMaterial({
    color: 0xc68642,
    roughness: 0.8,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }),
  side: new THREE.MeshStandardMaterial({
    color: 0xc68642,
    roughness: 0.8,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }),
  back: new THREE.MeshStandardMaterial({
    color: 0x8b5e3c,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }),
  wire: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    opacity: 0.12,
    transparent: true,
  }),
} as const;

function makeMesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  name: string,
  showWire = false
): THREE.Mesh[] {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;

  const wire = new THREE.Mesh(geo, MAT.wire);
  wire.name = `${name}-wire`;
  wire.visible = showWire;

  return [mesh, wire];
}

export function buildShelf(
  partialConfig: PartialShelfConfig = {},
  showWireframes = false
): THREE.Group {
  const cfg: ShelfConfig = { ...defaultShelfConfig, ...partialConfig };
  const { width, totalHeight, depth, boardThickness, hasBack, hasSides } = cfg;
  const half = boardThickness / 2;

  const group = new THREE.Group();
  group.name = 'ShelfUnit';

  const boardGeo = new THREE.BoxGeometry(width, boardThickness, depth);
  const sideGeo = new THREE.BoxGeometry(boardThickness, totalHeight, depth);
  const backGeo = new THREE.BoxGeometry(width, totalHeight, boardThickness);

  if (hasSides) {
    const sideY = totalHeight / 2;
    const sideX = width / 2 + half;

    const [lm, lw] = makeMesh(sideGeo, MAT.side, 'side-left', showWireframes);
    lm.position.set(-sideX, sideY, 0);
    lw.position.set(-sideX, sideY, 0);
    lm.userData = { type: 'side', side: 'left' };

    const [rm, rw] = makeMesh(sideGeo, MAT.side, 'side-right', showWireframes);
    rm.position.set(sideX, sideY, 0);
    rw.position.set(sideX, sideY, 0);
    rm.userData = { type: 'side', side: 'right' };

    group.add(lm, lw, rm, rw);
  }

  if (hasBack) {
    const backZ = -(depth / 2) - half;
    const backY = totalHeight / 2;
    const [bm, bw] = makeMesh(backGeo, MAT.back, 'back', showWireframes);
    bm.position.set(0, backY, backZ);
    bw.position.set(0, backY, backZ);
    bm.userData = { type: 'back' };
    group.add(bm, bw);
  }

  const boardPositions = computeBoardPositions(cfg);
  for (const pos of boardPositions) {
    const [bm, bw] = makeMesh(boardGeo, MAT.board, `board-${pos.label}`, showWireframes);
    bm.position.set(0, pos.centerY, 0);
    bw.position.set(0, pos.centerY, 0);
    bm.userData = {
      type: 'board',
      label: pos.label,
      index: pos.index,
      bottomFaceY: pos.bottomFaceY,
      topFaceY: pos.topFaceY,
    };
    group.add(bm, bw);
  }

  return group;
}

export { computeBoardPositions, computeZoneHeight, defaultShelfConfig };
export type { PartialShelfConfig, ShelfConfig };
