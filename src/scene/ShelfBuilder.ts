import * as THREE from 'three';
import {
  computeBoardPositions,
  computeZoneHeight,
  defaultShelfConfig,
  type PartialShelfConfig,
  type ShelfConfig,
} from '../core/ShelfConfig';

function makeMesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  name: string,
  position: THREE.Vector3,
  showWire: boolean,
  wireMat: THREE.Material
): THREE.Mesh[] {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.matrixAutoUpdate = false; // This tells Three.js not to recompute the local matrix every frame
  mesh.updateMatrix();

  const wire = new THREE.Mesh(geo, wireMat);
  wire.name = `${name}-wire`;
  wire.position.copy(position);
  wire.visible = showWire;
  wire.matrixAutoUpdate = false; // This tells Three.js not to recompute the local matrix every frame
  wire.updateMatrix();

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

  const mat = new THREE.MeshStandardMaterial({
    color: cfg.color,
    roughness: 0.8,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    opacity: 0.12,
    transparent: true,
  });

  const boardGeo = new THREE.BoxGeometry(width, boardThickness, depth);
  const sideGeo = new THREE.BoxGeometry(boardThickness, totalHeight, depth);
  const backGeo = new THREE.BoxGeometry(width, totalHeight, boardThickness);

  if (hasSides) {
    const sideY = totalHeight / 2;
    const sideX = width / 2 + half;

    const [lm, lw] = makeMesh(
      sideGeo,
      mat,
      'side-left',
      new THREE.Vector3(-sideX, sideY, 0),
      showWireframes,
      wireMat
    );
    const [rm, rw] = makeMesh(
      sideGeo,
      mat,
      'side-right',
      new THREE.Vector3(sideX, sideY, 0),
      showWireframes,
      wireMat
    );

    lm.userData = { type: 'side', side: 'left' };
    rm.userData = { type: 'side', side: 'right' };

    group.add(lm, lw, rm, rw);
  }

  if (hasBack) {
    const backZ = -(depth / 2) - half;
    const backY = totalHeight / 2;

    const [bm, bw] = makeMesh(
      backGeo,
      mat,
      'back',
      new THREE.Vector3(0, backY, backZ),
      showWireframes,
      wireMat
    );
    bm.userData = { type: 'back' };

    group.add(bm, bw);
  }

  const boardPositions = computeBoardPositions(cfg);

  for (const pos of boardPositions) {
    const [bm, bw] = makeMesh(
      boardGeo,
      mat,
      `board-${pos.label}`,
      new THREE.Vector3(0, pos.centerY, 0),
      showWireframes,
      wireMat
    );

    bm.userData = {
      type: 'board',
      label: pos.label,
      index: pos.index,
      bottomFaceY: pos.bottomFaceY,
      topFaceY: pos.topFaceY,
    };

    group.add(bm, bw);
  }

  group.traverse((node) => {
    if (node instanceof THREE.Mesh && !node.name.endsWith('-wire')) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return group;
}

export { computeBoardPositions, computeZoneHeight, defaultShelfConfig };
export type { PartialShelfConfig, ShelfConfig };
