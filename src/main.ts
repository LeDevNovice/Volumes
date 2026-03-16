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

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(5, 3, 8);
camera.lookAt(3, 0, 0);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(20, 20, 0x444466, 0x333355);
scene.add(gridHelper);

const group = new THREE.Group();
scene.add(group);

const material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x88aaff });

const meshA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
meshA.position.x = -1.5;
group.add(meshA);

const meshB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
meshB.position.x = 0;
group.add(meshB);

const meshC = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
meshC.position.x = 1.5;
group.add(meshC);

group.position.x = 3;
group.rotation.y = Math.PI / 4;

const timer = new THREE.Timer();

function animate(): void {
  requestAnimationFrame(animate);

  timer.update();
  group.rotation.y = timer.getElapsed() * 0.5;

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
