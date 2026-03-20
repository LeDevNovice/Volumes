/** biome-ignore-all lint/suspicious/noConsole: dev infrastructure */
import * as THREE from 'three';
import { loadColorTexture } from '../utils/textureLoader';

const BOOK_W = 2;
const BOOK_H = 19;
const BOOK_D = 13;

const COVER_URL = '/textures/cover_test.jpg';

export async function createTexturedBook(xPosition = 0): Promise<THREE.Mesh> {
  const geometry = new THREE.BoxGeometry(BOOK_W, BOOK_H, BOOK_D);

  const material = new THREE.MeshStandardMaterial({
    color: 0xc41e3a,
    roughness: 0.6,
    metalness: 0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'TexturedBook';
  mesh.position.set(xPosition, BOOK_H / 2, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  try {
    const coverTexture = await loadColorTexture(COVER_URL);

    material.color.set(0xffffff);
    material.map = coverTexture;

    material.needsUpdate = true;
  } catch (error) {
    console.warn('[texturedBook] Failed to load cover texture:', error);
    console.warn('[texturedBook] Rendering with fallback color instead.');
  }

  return mesh;
}

export function disposeTexturedBook(mesh: THREE.Mesh): void {
  mesh.geometry.dispose();

  const mat = mesh.material as THREE.MeshStandardMaterial;
  mat.map?.dispose();
  mat.dispose();
}
