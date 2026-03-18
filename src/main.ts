import * as THREE from 'three';
import { buildShelf } from './scene/ShelfBuilder';

const DEBUG = true;

const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
if (!canvas) throw new Error('Canvas element not found in DOM');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const sizes = { width: window.innerWidth, height: window.innerHeight };

const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 1, 1000);
camera.position.set(0, 100, 230);
camera.lookAt(0, 100, 0);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

if (DEBUG) {
  scene.add(new THREE.AxesHelper(100));
  scene.add(new THREE.GridHelper(500, 50, 0x444466, 0x333355));
}

const ambientLight = new THREE.AmbientLight(0xfff4e0, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.5);
dirLight.position.set(1, 2, 1);
dirLight.castShadow = true;

dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -100;
dirLight.shadow.camera.right = 100;
dirLight.shadow.camera.top = 250;
dirLight.shadow.camera.bottom = -10;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 600;
scene.add(dirLight);

const floorGeo = new THREE.PlaneGeometry(400, 400);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x2a2a3a,
  roughness: 0.9,
  metalness: 0.0,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

const shelfGroup = buildShelf();
shelfGroup.traverse((node) => {
  if (node instanceof THREE.Mesh) {
    node.castShadow = true;
    node.receiveShadow = true;
  }
});
scene.add(shelfGroup);

renderer.render(scene, camera);

const timer = new THREE.Timer();

function animate(): void {
  requestAnimationFrame(animate);

  timer.update();
  const t = timer.getElapsed();

  const radius = 280;
  camera.position.x = Math.sin(t * 0.12) * radius;
  camera.position.z = Math.cos(t * 0.12) * radius;
  camera.position.y = 80 + Math.sin(t * 0.08) * 40;
  camera.lookAt(0, 100, 0);

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
