import * as THREE from 'three';
import { defaultShelfConfig } from './core/ShelfConfig';
import { buildLightingRig, LIGHTING } from './scene/SceneManager';
import { buildShelf } from './scene/ShelfBuilder';

const DEBUG = true;

const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
if (!canvas) throw new Error('Canvas element not found in DOM');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const sizes = { width: window.innerWidth, height: window.innerHeight };

const LOOK_TARGET = new THREE.Vector3(0, 100, 0);
const CAMERA_STATIC = new THREE.Vector3(0, 100, 230);

const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 1, 1000);
camera.position.copy(CAMERA_STATIC);
camera.lookAt(LOOK_TARGET);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

let stats: import('stats-gl').default | null = null;

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
  new THREE.PlaneGeometry(600, 600),
  new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9, metalness: 0.0 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const shelfParams = {
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
    if (node instanceof THREE.Mesh) {
      node.geometry.dispose();
    }
  });

  shelfGroup = buildShelf(shelfParams, shelfParams.showWireframes);
  scene.add(shelfGroup);
}

let isOrbiting = true;

if (DEBUG) {
  const { default: GUI } = await import('lil-gui');
  const gui = new GUI({ title: 'Volumes Debug' });

  const ambientFolder = gui.addFolder('Ambient Light');
  ambientFolder
    .add({ intensity: rig.ambient.intensity }, 'intensity', 0, 2, 0.01)
    .onChange((v: number) => {
      rig.ambient.intensity = v;
    });
  ambientFolder
    .addColor({ color: `#${rig.ambient.color.getHexString()}` }, 'color')
    .onChange((v: string) => {
      rig.ambient.color.set(v);
    });

  const keyFolder = gui.addFolder('Key Light (DirectionalLight)');
  keyFolder.add({ intensity: rig.key.intensity }, 'intensity', 0, 3, 0.01).onChange((v: number) => {
    rig.key.intensity = v;
  });
  keyFolder
    .addColor({ color: `#${rig.key.color.getHexString()}` }, 'color')
    .onChange((v: string) => {
      rig.key.color.set(v);
    });
  keyFolder.add(rig.key.position, 'x', -200, 200, 1).name('position.x');
  keyFolder.add(rig.key.position, 'y', 0, 300, 1).name('position.y');
  keyFolder.add(rig.key.position, 'z', -200, 200, 1).name('position.z');

  const fillFolder = gui.addFolder('Fill Light (PointLight)');
  fillFolder
    .add({ intensity: rig.fill.intensity }, 'intensity', 0, 3, 0.01)
    .onChange((v: number) => {
      rig.fill.intensity = v;
    });
  fillFolder
    .addColor({ color: `#${rig.fill.color.getHexString()}` }, 'color')
    .onChange((v: string) => {
      rig.fill.color.set(v);
    });
  fillFolder
    .add({ distance: rig.fill.distance }, 'distance', 100, 800, 10)
    .onChange((v: number) => {
      rig.fill.distance = v;
    });
  fillFolder.close();

  const shelfFolder = gui.addFolder('Shelf Config');
  shelfFolder.add(shelfParams, 'width', 40, 240, 1).name('width (cm)').onChange(rebuildShelf);
  shelfFolder
    .add(shelfParams, 'totalHeight', 80, 300, 1)
    .name('height (cm)')
    .onChange(rebuildShelf);
  shelfFolder.add(shelfParams, 'depth', 15, 60, 1).name('depth (cm)').onChange(rebuildShelf);
  shelfFolder.add(shelfParams, 'shelfCount', 2, 10, 1).name('shelf count').onChange(rebuildShelf);
  shelfFolder.add(shelfParams, 'hasBack').name('back panel').onChange(rebuildShelf);
  shelfFolder.add(shelfParams, 'hasSides').name('side panels').onChange(rebuildShelf);
  shelfFolder.addColor(shelfParams, 'color').name('wood color').onChange(rebuildShelf);

  const cameraFolder = gui.addFolder('Camera');
  cameraFolder
    .add({ orbit: isOrbiting }, 'orbit')
    .name('orbit camera')
    .onChange((v: boolean) => {
      isOrbiting = v;
      if (!v) {
        camera.position.copy(CAMERA_STATIC);
        camera.lookAt(LOOK_TARGET);
      }
    });
  cameraFolder
    .add(CAMERA_STATIC, 'z', 50, 600, 1)
    .name('distance (Z)')
    .onChange(() => {
      if (!isOrbiting) {
        camera.position.copy(CAMERA_STATIC);
        camera.lookAt(LOOK_TARGET);
      }
    });

  const debugFolder = gui.addFolder('Debug');
  debugFolder
    .add(shelfParams, 'showWireframes')
    .name('wireframes')
    .onChange((v: boolean) => {
      shelfGroup.traverse((node) => {
        if (node instanceof THREE.Mesh && node.name.endsWith('-wire')) node.visible = v;
      });
    });
  debugFolder
    .add(
      {
        reset: () => {
          rig.ambient.intensity = LIGHTING.ambient.intensity;
          rig.key.intensity = LIGHTING.key.intensity;
          rig.key.position.copy(LIGHTING.key.position);
          rig.fill.intensity = LIGHTING.fill.intensity;
          gui.reset();
        },
      },
      'reset'
    )
    .name('reset all lights');
}

const timer = new THREE.Timer();

function animate(): void {
  requestAnimationFrame(animate);
  timer.update();

  if (isOrbiting) {
    const t = timer.getElapsed();
    const radius = 280;
    camera.position.x = Math.sin(t * 0.12) * radius;
    camera.position.z = Math.cos(t * 0.12) * radius;
    camera.position.y = 80 + Math.sin(t * 0.08) * 40;
    camera.lookAt(LOOK_TARGET);
  }

  if (stats) stats.begin();
  renderer.info.reset();
  renderer.render(scene, camera);
  if (stats) {
    stats.end();
    stats.update();
  }
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
