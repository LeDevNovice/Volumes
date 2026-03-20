import * as THREE from 'three';
import type { BookFinish, BookMaterialConfig } from '../types/book';

export const BOOK_MATERIAL_PRESETS: Record<BookFinish, BookMaterialConfig> = {
  glossy: {
    color: 0xc41e3a,
    roughness: 0.2,
    metalness: 0,
    label: 'Glossy cover',
  },
  matte: {
    color: 0xc41e3a,
    roughness: 0.7,
    metalness: 0,
    label: 'Matte cover',
  },
  aged: {
    color: 0xc8a96e,
    roughness: 0.9,
    metalness: 0,
    label: 'Aged paperback',
  },
  foil: {
    color: 0x2c2c2c,
    roughness: 0.3,
    metalness: 0.8,
    label: 'Foil cover',
  },
};

export function createBookMaterial(finish: BookFinish): THREE.MeshStandardMaterial {
  const cfg = BOOK_MATERIAL_PRESETS[finish];

  return new THREE.MeshStandardMaterial({
    color: cfg.color,
    roughness: cfg.roughness,
    metalness: cfg.metalness,
  });
}
