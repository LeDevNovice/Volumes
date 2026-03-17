import * as THREE from 'three';
import type { Sizes } from './types';

const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
if (!canvas) throw new Error('Canvas element canvas.webgl not found in DOM');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const sizes: Sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 60, 120);
camera.lookAt(0, 0, 0);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.add(new THREE.AxesHelper(10));
scene.add(new THREE.GridHelper(200, 20, 0x444466, 0x333355));

const BOARD_W = 80;
const BOARD_H = 2;
const BOARD_D = 30;

const boardGeo = new THREE.BoxGeometry(BOARD_W, BOARD_H, BOARD_D);

const boardMesh = new THREE.Mesh(
  boardGeo,
  new THREE.MeshBasicMaterial({ color: 0xc68642, wireframe: false })
);

boardMesh.position.y = BOARD_H / 2;
scene.add(boardMesh);

const wireframeMesh = new THREE.Mesh(
  boardGeo,
  new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, opacity: 0.2, transparent: true })
);
wireframeMesh.position.y = BOARD_H / 2;
scene.add(wireframeMesh);

const timer = new THREE.Timer();

function animate(): void {
  requestAnimationFrame(animate);
  timer.update();

  boardMesh.rotation.y = timer.getElapsed() * 0.3;
  wireframeMesh.rotation.y = boardMesh.rotation.y;

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
