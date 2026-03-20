import * as THREE from 'three';
import type { BookFinish } from '../types/book';
import { createBookMaterial } from './materialPresets';

const BOOK_W = 2;
const BOOK_H = 19;
const BOOK_D = 13;

const sharedGeometry = new THREE.BoxGeometry(BOOK_W, BOOK_H, BOOK_D);

const VARIANTS: ReadonlyArray<[BookFinish, number]> = [
  ['glossy', -15],
  ['matte', -5],
  ['aged', 5],
  ['foil', 15],
];

export function createMaterialVariantBooks(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'MaterialVariants';

  for (const [finish, xPos] of VARIANTS) {
    const material = createBookMaterial(finish);
    const mesh = new THREE.Mesh(sharedGeometry, material);

    mesh.name = `book_${finish}`;
    mesh.position.set(xPos, BOOK_H / 2, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);
  }

  return group;
}

export function disposeMaterialVariantBooks(group: THREE.Group): void {
  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const mat = obj.material;

    if (Array.isArray(mat)) {
      // biome-ignore lint/suspicious/useIterableCallbackReturn: false positive
      mat.forEach((m) => m.dispose());
    } else {
      mat.dispose();
    }
  });
}
