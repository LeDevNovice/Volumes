import * as THREE from 'three';
import type { LightingConfig, ThreePointRig } from '../scene/lighting';

export const DEBUG = true;

export interface ShelfBuildParams {
  width: number;
  totalHeight: number;
  depth: number;
  boardThickness: number;
  shelfCount: number;
  hasBack: boolean;
  hasSides: boolean;
  color: number;
  showWireframes: boolean;
}

export interface GUIContext {
  rig: ThreePointRig;
  LIGHTING: LightingConfig;
  shelfParams: ShelfBuildParams;
  rebuildShelf: () => void;
  camera: THREE.PerspectiveCamera;
  CAMERA_STATIC: THREE.Vector3;
  LOOK_TARGET: THREE.Vector3;
  getIsOrbiting: () => boolean;
  setIsOrbiting: (v: boolean) => void;
  getShelfGroup: () => THREE.Group;
}

export function initSceneHelpers(scene: THREE.Scene): void {
  if (!DEBUG) return;
  scene.add(new THREE.AxesHelper(100));
  scene.add(new THREE.GridHelper(500, 50, 0x444466, 0x333355));
}

export async function initStats(): Promise<import('stats-gl').default | null> {
  if (!DEBUG) return null;

  const { default: Stats } = await import('stats-gl');
  const stats = new Stats({ minimal: false, mode: 0 });
  document.body.appendChild(stats.dom);
  return stats;
}

export async function initGUI(ctx: GUIContext): Promise<void> {
  if (!DEBUG) return;

  const { default: GUI } = await import('lil-gui');
  const gui = new GUI({ title: 'Volumes Debug' });

  const ambientFolder = gui.addFolder('Ambient Light');
  ambientFolder
    .add({ intensity: ctx.rig.ambient.intensity }, 'intensity', 0, 2, 0.01)
    .onChange((v: number) => {
      ctx.rig.ambient.intensity = v;
    });
  ambientFolder
    .addColor({ color: `#${ctx.rig.ambient.color.getHexString()}` }, 'color')
    .onChange((v: string) => {
      ctx.rig.ambient.color.set(v);
    });

  const keyFolder = gui.addFolder('Key Light (DirectionalLight)');
  keyFolder
    .add({ intensity: ctx.rig.key.intensity }, 'intensity', 0, 3, 0.01)
    .onChange((v: number) => {
      ctx.rig.key.intensity = v;
    });
  keyFolder
    .addColor({ color: `#${ctx.rig.key.color.getHexString()}` }, 'color')
    .onChange((v: string) => {
      ctx.rig.key.color.set(v);
    });
  keyFolder.add(ctx.rig.key.position, 'x', -200, 200, 1).name('position.x');
  keyFolder.add(ctx.rig.key.position, 'y', 0, 300, 1).name('position.y');
  keyFolder.add(ctx.rig.key.position, 'z', -200, 200, 1).name('position.z');

  const fillFolder = gui.addFolder('Fill Light (PointLight)');
  fillFolder
    .add({ intensity: ctx.rig.fill.intensity }, 'intensity', 0, 3, 0.01)
    .onChange((v: number) => {
      ctx.rig.fill.intensity = v;
    });
  fillFolder
    .addColor({ color: `#${ctx.rig.fill.color.getHexString()}` }, 'color')
    .onChange((v: string) => {
      ctx.rig.fill.color.set(v);
    });
  fillFolder
    .add({ distance: ctx.rig.fill.distance }, 'distance', 100, 800, 10)
    .onChange((v: number) => {
      ctx.rig.fill.distance = v;
    });
  fillFolder.close();

  const shelfFolder = gui.addFolder('Shelf Config');
  shelfFolder
    .add(ctx.shelfParams, 'width', 40, 240, 1)
    .name('width (cm)')
    .onChange(ctx.rebuildShelf);
  shelfFolder
    .add(ctx.shelfParams, 'totalHeight', 80, 300, 1)
    .name('height (cm)')
    .onChange(ctx.rebuildShelf);
  shelfFolder
    .add(ctx.shelfParams, 'depth', 15, 60, 1)
    .name('depth (cm)')
    .onChange(ctx.rebuildShelf);
  shelfFolder
    .add(ctx.shelfParams, 'shelfCount', 2, 10, 1)
    .name('shelf count')
    .onChange(ctx.rebuildShelf);
  shelfFolder.add(ctx.shelfParams, 'hasBack').name('back panel').onChange(ctx.rebuildShelf);
  shelfFolder.add(ctx.shelfParams, 'hasSides').name('side panels').onChange(ctx.rebuildShelf);
  shelfFolder.addColor(ctx.shelfParams, 'color').name('wood color').onChange(ctx.rebuildShelf);

  const cameraFolder = gui.addFolder('Camera');
  cameraFolder
    .add({ orbit: ctx.getIsOrbiting() }, 'orbit')
    .name('orbit camera')
    .onChange((v: boolean) => {
      ctx.setIsOrbiting(v);
      if (!v) {
        ctx.camera.position.copy(ctx.CAMERA_STATIC);
        ctx.camera.lookAt(ctx.LOOK_TARGET);
      }
    });
  cameraFolder
    .add(ctx.CAMERA_STATIC, 'z', 50, 600, 1)
    .name('distance (Z)')
    .onChange(() => {
      if (!ctx.getIsOrbiting()) {
        ctx.camera.position.copy(ctx.CAMERA_STATIC);
        ctx.camera.lookAt(ctx.LOOK_TARGET);
      }
    });

  const debugFolder = gui.addFolder('Debug');
  debugFolder
    .add(ctx.shelfParams, 'showWireframes')
    .name('wireframes')
    .onChange((v: boolean) => {
      ctx.getShelfGroup().traverse((node) => {
        if (node instanceof THREE.Mesh && node.name.endsWith('-wire')) {
          node.visible = v;
        }
      });
    });
  debugFolder
    .add(
      {
        reset: () => {
          ctx.rig.ambient.intensity = ctx.LIGHTING.ambient.intensity;
          ctx.rig.key.intensity = ctx.LIGHTING.key.intensity;
          ctx.rig.key.position.copy(ctx.LIGHTING.key.position);
          ctx.rig.fill.intensity = ctx.LIGHTING.fill.intensity;
          gui.reset();
        },
      },
      'reset'
    )
    .name('reset all lights');
}
