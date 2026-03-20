import * as THREE from 'three';
import type { ShelfBuildParams } from './core/ShelfConfig';
import { defaultShelfConfig } from './core/ShelfConfig';
import { createMaterialVariantBooks } from './scene/books';
import { buildLightingRig, LIGHTING } from './scene/lighting';
import { CAMERA_STATIC, initScene, LOOK_TARGET, startLoop } from './scene/SceneManager';
import { buildShelf } from './scene/ShelfBuilder';
import { createTexturedBook } from './scene/texturedBook';
import { DEBUG, initGUI, initSceneHelpers, initStats } from './utils/debug';

async function init(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
  if (!canvas) throw new Error('Canvas element not found in DOM');

  const { scene, camera, renderer, timer, sizes } = initScene(canvas);

  initSceneHelpers(scene);
  const stats = DEBUG ? await initStats() : null;

  const rig = buildLightingRig(LIGHTING);
  rig.addToScene(scene);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9, metalness: 0.0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const shelfParams: ShelfBuildParams = {
    width: defaultShelfConfig.width,
    totalHeight: defaultShelfConfig.totalHeight,
    depth: defaultShelfConfig.depth,
    boardThickness: defaultShelfConfig.boardThickness,
    shelfCount: defaultShelfConfig.shelfCount,
    hasBack: defaultShelfConfig.hasBack,
    hasSides: defaultShelfConfig.hasSides,
    color: defaultShelfConfig.color,
    showWireframes: false,
  };

  let shelfGroup = buildShelf(shelfParams, shelfParams.showWireframes);
  scene.add(shelfGroup);

  function rebuildShelf(): void {
    scene.remove(shelfGroup);
    shelfGroup.traverse((node) => {
      if (node instanceof THREE.Mesh) node.geometry.dispose();
    });
    shelfGroup = buildShelf(shelfParams, shelfParams.showWireframes);
    scene.add(shelfGroup);
  }

  const bookVariants = createMaterialVariantBooks();
  scene.add(bookVariants);

  const texturedBook = await createTexturedBook(35);
  scene.add(texturedBook);

  let isOrbiting = true;

  if (DEBUG) {
    await initGUI({
      rig,
      LIGHTING,
      shelfParams,
      rebuildShelf,
      camera,
      CAMERA_STATIC,
      LOOK_TARGET,
      getIsOrbiting: () => isOrbiting,
      setIsOrbiting: (v) => {
        isOrbiting = v;
      },
      getShelfGroup: () => shelfGroup,
    });
  }

  startLoop({ scene, camera, renderer, timer, sizes }, (_delta, elapsed) => {
    if (isOrbiting) {
      const radius = 280;
      camera.position.x = Math.sin(elapsed * 0.12) * radius;
      camera.position.z = Math.cos(elapsed * 0.12) * radius;
      camera.position.y = 80 + Math.sin(elapsed * 0.08) * 40;
      camera.lookAt(LOOK_TARGET);
    }

    if (stats) stats.begin();
    renderer.info.reset();
    renderer.render(scene, camera);
    if (stats) {
      stats.end();
      stats.update();
    }
  });
}

// biome-ignore lint/suspicious/noConsole: dev infrastructure
init().catch(console.error);
