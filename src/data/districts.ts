export type DistrictId = 'visakhapatnam' | 'machilipatnam' | 'kakinada' | 'srikakulam' | 'vizianagaram' | 'ongole' | 'bhadrachalam' | 'kothagudem' | 'suryapet';
export type HazardType = 'FLOOD' | 'EARTHQUAKE';

export interface DistrictConfig {
  id: DistrictId;
  name: string;
  shortName: string;
  center: [number, number];
  bbox: [number, number, number, number];
  affectedZone: [number, number][];
  dispatchOrigin: [number, number];
  crisisLabel: string;
  hazard: HazardType;
}

export const DISTRICTS: DistrictConfig[] = [
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam District',
    shortName: 'Visakhapatnam',
    center: [17.6833, 83.2833],
    bbox: [17.64, 83.24, 17.75, 83.34],
    affectedZone: [[17.716, 83.282], [17.72, 83.3], [17.716, 83.32], [17.702, 83.332], [17.684, 83.33], [17.672, 83.31], [17.678, 83.292], [17.695, 83.278]],
    dispatchOrigin: [17.6975, 83.27],
    crisisLabel: 'FL-2024-0812-VZG',
    hazard: 'FLOOD',
  },
  {
    id: 'machilipatnam',
    name: 'Machilipatnam District',
    shortName: 'Machilipatnam',
    center: [16.1875, 81.1388],
    bbox: [16.12, 81.05, 16.25, 81.22],
    affectedZone: [[16.218, 81.095], [16.23, 81.14], [16.21, 81.18], [16.17, 81.19], [16.145, 81.15], [16.155, 81.1], [16.185, 81.08]],
    dispatchOrigin: [16.19, 81.11],
    crisisLabel: 'FL-2024-0812-MTM',
    hazard: 'FLOOD',
  },
  {
    id: 'kakinada',
    name: 'Kakinada District',
    shortName: 'Kakinada',
    center: [16.9891, 82.2475],
    bbox: [16.91, 82.16, 17.08, 82.34],
    affectedZone: [[17.035, 82.2], [17.045, 82.25], [17.02, 82.3], [16.98, 82.31], [16.95, 82.27], [16.955, 82.21], [16.99, 82.18]],
    dispatchOrigin: [16.99, 82.22],
    crisisLabel: 'FL-2024-0812-KKD',
    hazard: 'FLOOD',
  },
  {
    id: 'srikakulam',
    name: 'Srikakulam District',
    shortName: 'Srikakulam',
    center: [18.2949, 83.8938],
    bbox: [18.22, 83.78, 18.38, 84.02],
    affectedZone: [[18.34, 83.82], [18.37, 83.9], [18.34, 83.98], [18.29, 84.0], [18.25, 83.94], [18.26, 83.84], [18.3, 83.8]],
    dispatchOrigin: [18.3, 83.87],
    crisisLabel: 'FL-2024-0812-SKL',
    hazard: 'FLOOD',
  },
  {
    id: 'vizianagaram',
    name: 'Vizianagaram District',
    shortName: 'Vizianagaram',
    center: [18.1067, 83.3956],
    bbox: [18.02, 83.28, 18.22, 83.52],
    affectedZone: [[18.17, 83.31], [18.21, 83.38], [18.18, 83.47], [18.11, 83.49], [18.06, 83.44], [18.07, 83.34], [18.12, 83.29]],
    dispatchOrigin: [18.11, 83.35],
    crisisLabel: 'FL-2024-0812-VZM',
    hazard: 'FLOOD',
  },
  {
    id: 'ongole',
    name: 'Ongole District',
    shortName: 'Ongole',
    center: [15.5057, 80.0499],
    bbox: [15.42, 79.92, 15.62, 80.18],
    affectedZone: [[15.58, 79.96], [15.61, 80.04], [15.57, 80.13], [15.51, 80.16], [15.46, 80.1], [15.47, 79.98], [15.53, 79.93]],
    dispatchOrigin: [15.51, 80.0],
    crisisLabel: 'FL-2024-0812-ONG',
    hazard: 'FLOOD',
  },
  {
    id: 'bhadrachalam',
    name: 'Bhadrachalam Area, Telangana',
    shortName: 'Bhadrachalam',
    center: [17.6688, 80.8936],
    bbox: [17.58, 80.78, 17.76, 81.02],
    affectedZone: [[17.72, 80.83], [17.75, 80.91], [17.71, 80.98], [17.65, 80.99], [17.61, 80.94], [17.62, 80.84], [17.67, 80.8]],
    dispatchOrigin: [17.67, 80.88],
    crisisLabel: 'EQ-2024-0812-BDL',
    hazard: 'EARTHQUAKE',
  },
  {
    id: 'kothagudem',
    name: 'Bhadradri Kothagudem District',
    shortName: 'Kothagudem',
    center: [17.55, 80.62],
    bbox: [17.43, 80.48, 17.68, 80.78],
    affectedZone: [[17.63, 80.52], [17.67, 80.62], [17.62, 80.72], [17.54, 80.75], [17.47, 80.68], [17.48, 80.55], [17.55, 80.49]],
    dispatchOrigin: [17.55, 80.59],
    crisisLabel: 'EQ-2024-0812-KGM',
    hazard: 'EARTHQUAKE',
  },
  {
    id: 'suryapet',
    name: 'Suryapet District',
    shortName: 'Suryapet',
    center: [17.1405, 79.6236],
    bbox: [17.02, 79.45, 17.28, 79.82],
    affectedZone: [[17.24, 79.5], [17.28, 79.62], [17.23, 79.75], [17.14, 79.79], [17.06, 79.71], [17.07, 79.55], [17.15, 79.48]],
    dispatchOrigin: [17.14, 79.59],
    crisisLabel: 'EQ-2024-0812-SYP',
    hazard: 'EARTHQUAKE',
  },
];

export const DEFAULT_DISTRICT = DISTRICTS[0];

export function getDistrict(id: DistrictId): DistrictConfig {
  return DISTRICTS.find((district) => district.id === id) ?? DEFAULT_DISTRICT;
}
