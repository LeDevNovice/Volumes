import * as THREE from 'three';
import { loadColorTexture } from '../utils/textureLoader';

export interface HardcoverBookConfig {
  spineThicknessCm: number;
  bookHeightCm: number;
  bookDepthCm: number;
  position: THREE.Vector3Like;
  color: number;
  roughness: number;
  metalness: number;
  coverUrl?: string;
}

export const DEFAULT_HARDCOVER_CONFIG: HardcoverBookConfig = {
  spineThicknessCm: 3.5,
  bookHeightCm: 24,
  bookDepthCm: 17,
  position: { x: 0, y: 2, z: 0 }, // top of bottom shelf panel
  color: 0x1a3a6b,
  roughness: 0.45,
  metalness: 0,
  coverUrl: '/textures/cover_test.jpg',
};

export async function createHardcoverBook(
  config: HardcoverBookConfig = DEFAULT_HARDCOVER_CONFIG
): Promise<THREE.Mesh> {
  const geometry = new THREE.BoxGeometry(
    config.spineThicknessCm,
    config.bookHeightCm,
    config.bookDepthCm
  );

  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    roughness: config.roughness,
    metalness: config.metalness,
  });

  const mesh = new THREE.Mesh(geometry, material);
  const { x, y, z } = config.position;
  mesh.name = `book_hardcover_${x}_${y}_${z}`;

  mesh.position.set(x, y + config.bookHeightCm / 2, z);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  if (config.coverUrl) {
    const coverTexture = await loadColorTexture(config.coverUrl);

    material.color.set(0xffffff);
    material.map = coverTexture;
    material.needsUpdate = true;
  }

  return mesh;
}
