import * as THREE from 'three';

export interface LightingConfig {
  ambient: {
    color: number;
    intensity: number;
  };
  key: {
    color: number;
    intensity: number;
    position: THREE.Vector3;
  };
  fill: {
    color: number;
    intensity: number;
    position: THREE.Vector3;
    distance: number;
    decay: number;
  };
  rim: {
    color: number;
    intensity: number;
    position: THREE.Vector3;
  };
}

export interface ThreePointRig {
  ambient: THREE.AmbientLight;
  key: THREE.DirectionalLight;
  fill: THREE.PointLight;
  rim: THREE.DirectionalLight;
  addToScene: (scene: THREE.Scene) => void;
}

export const LIGHTING: LightingConfig = {
  ambient: {
    color: 0xfff4e0,
    intensity: 0.3,
  },
  key: {
    color: 0xfff4e0,
    intensity: 1.5,
    position: new THREE.Vector3(1, 2, 1),
  },
  fill: {
    color: 0xe0f0ff,
    intensity: 0.8,
    position: new THREE.Vector3(-100, 100, 50),
    distance: 400,
    decay: 2,
  },
  rim: {
    color: 0xfff0e8,
    intensity: 0.5,
    position: new THREE.Vector3(0.3, 1.5, -2),
  },
} as const;

export function buildLightingRig(cfg: LightingConfig = LIGHTING): ThreePointRig {
  const ambient = new THREE.AmbientLight(cfg.ambient.color, cfg.ambient.intensity);
  ambient.name = 'ambient';

  const key = new THREE.DirectionalLight(cfg.key.color, cfg.key.intensity);
  key.name = 'key';
  key.position.copy(cfg.key.position);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -100;
  key.shadow.camera.right = 100;
  key.shadow.camera.top = 250;
  key.shadow.camera.bottom = -10;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 600;

  const fill = new THREE.PointLight(
    cfg.fill.color,
    cfg.fill.intensity,
    cfg.fill.distance,
    cfg.fill.decay
  );
  fill.name = 'fill';
  fill.position.copy(cfg.fill.position);
  fill.castShadow = false;

  const rim = new THREE.DirectionalLight(cfg.rim.color, cfg.rim.intensity);
  rim.name = 'rim';
  rim.position.copy(cfg.rim.position);
  rim.castShadow = false;

  return {
    ambient,
    key,
    fill,
    rim,
    addToScene(scene: THREE.Scene) {
      scene.add(ambient, key, fill, rim);
    },
  };
}
