import * as THREE from 'three';
import { buildLightingRig, LIGHTING } from './scene/SceneManager';
import { buildShelf } from './scene/ShelfBuilder';

let stats: import('stats-gl').default | null = null;

const DEBUG = true;

const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
if (!canvas) throw new Error('Canvas element not found in DOM');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const sizes = { width: window.innerWidth, height: window.innerHeight };

const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 1, 1000);
const CAMERA_STATIC = new THREE.Vector3(0, 100, 230);
camera.position.copy(CAMERA_STATIC);
camera.lookAt(0, 100, 0);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

if (DEBUG) {
  scene.add(new THREE.AxesHelper(100));
  scene.add(new THREE.GridHelper(500, 50, 0x444466, 0x333355));

  const { default: Stats } = await import('stats-gl');
  stats = new Stats({ minimal: false, mode: 0 });
  document.body.appendChild(stats.dom);
}

const rig = buildLightingRig(LIGHTING);
rig.addToScene(scene);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9, metalness: 0.0 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

const wireframesVisible = false;
const shelfGroup = buildShelf({}, wireframesVisible);
shelfGroup.traverse((node) => {
  if (node instanceof THREE.Mesh) {
    node.castShadow = true;
    node.receiveShadow = true;
  }
});
scene.add(shelfGroup);

renderer.render(scene, camera);

const timer = new THREE.Timer();
const isOrbiting = true;

function animate(): void {
  requestAnimationFrame(animate);
  timer.update();

  if (isOrbiting) {
    const t = timer.getElapsed();
    const radius = 280;
    camera.position.x = Math.sin(t * 0.12) * radius;
    camera.position.z = Math.cos(t * 0.12) * radius;
    camera.position.y = 80 + Math.sin(t * 0.08) * 40;
    camera.lookAt(0, 100, 0);
  }

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
