import * as THREE from 'three';
import { buildShelf } from './scene/ShelfBuilder';

const DEBUG = true;

const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
if (!canvas) throw new Error('Canvas element not found in DOM');

const scene = new THREE.Scene();
scene.background = new THREE.Color(1, 1, 1);

const sizes = { width: window.innerWidth, height: window.innerHeight };

const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 2000);
camera.position.set(0, 40, 150);
camera.lookAt(0, 1, 0);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

if (DEBUG) {
  scene.add(new THREE.AxesHelper(50));
  scene.add(new THREE.GridHelper(300, 30, 0x444466, 0x333355));
}

const shelfGroup = buildShelf();
scene.add(shelfGroup);

renderer.render(scene, camera);

function animate(): void {
  requestAnimationFrame(animate);

  camera.lookAt(0, 1, 0);

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
