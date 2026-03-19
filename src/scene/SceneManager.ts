import * as THREE from 'three';
export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  timer: THREE.Timer;
  sizes: { width: number; height: number };
}

export const CAMERA_FOV = 60;
export const CAMERA_NEAR = 1;
export const CAMERA_FAR = 1000;
export const LOOK_TARGET = new THREE.Vector3(0, 100, 0);
export const CAMERA_STATIC = new THREE.Vector3(0, 100, 230);

export function initScene(canvas: HTMLCanvasElement): SceneContext {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const sizes = { width: window.innerWidth, height: window.innerHeight };

  const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    sizes.width / sizes.height,
    CAMERA_NEAR,
    CAMERA_FAR
  );
  camera.position.copy(CAMERA_STATIC);
  camera.lookAt(LOOK_TARGET);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const timer = new THREE.Timer();

  function onResize(): void {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', onResize);

  canvas.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
      renderer.domElement.requestFullscreen().catch((err) => {
        // biome-ignore lint/suspicious/noConsole: dev infrastructure
        console.warn('Fullscreen request rejected:', err);
      });
    } else {
      document.exitFullscreen();
    }
    onResize();
  });

  return { scene, camera, renderer, timer, sizes };
}

export function startLoop(
  ctx: SceneContext,
  onFrame: (delta: number, elapsed: number) => void
): void {
  function animate(): void {
    requestAnimationFrame(animate);

    ctx.timer.update();
    const delta = ctx.timer.getDelta();
    const elapsed = ctx.timer.getElapsed();

    onFrame(delta, elapsed);
  }

  animate();
}
