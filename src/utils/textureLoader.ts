import * as THREE from 'three';

export const textureLoader = new THREE.TextureLoader();

export async function loadColorTexture(url: string): Promise<THREE.Texture> {
  const texture = await textureLoader.loadAsync(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

export function loadColorTextureSync(
  url: string,
  onLoad: (texture: THREE.Texture) => void,
  onError?: (error: unknown) => void
): void {
  textureLoader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      onLoad(texture);
    },
    undefined,
    (error) => {
      // biome-ignore lint/suspicious/noConsole: dev infrastructure
      console.error(`[textureLoader] Failed to load: ${url}`, error);
      onError?.(error);
    }
  );
}
