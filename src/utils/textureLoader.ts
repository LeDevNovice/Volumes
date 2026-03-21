import * as THREE from 'three';

export const textureLoader = new THREE.TextureLoader();

export async function loadColorTexture(url: string): Promise<THREE.Texture> {
  const texture = await textureLoader.loadAsync(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}
