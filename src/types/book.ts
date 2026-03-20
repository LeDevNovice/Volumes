export type BookFinish = 'glossy' | 'matte' | 'aged' | 'foil';

export interface BookMaterialConfig {
  color: number;
  roughness: number;
  metalness: number;
  label: string;
}

export interface BookDimensions {
  widthCm: number;
  heightCm: number;
  depthCm: number;
}

export interface BookData {
  id: string;
  title: string;
  author: string;
  dimensions: BookDimensions;
  finish: BookFinish;
  color?: number;
}
