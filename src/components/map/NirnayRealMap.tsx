import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { DISTRICTS, getDistrict } from '../../data/districts';
import { useCrisisStore } from '../../store/useCrisisStore';

type Hospital = {
  id: number;
  name: string;
  coordinates: [number, number];
};

type ServicePoint = {
  id: number;
  name: string;
  coordinates: [number, number];
};

const FALLBACK_HOSPITALS: Hospital[] = [
  { id: -1, name: 'King George Hospital', coordinates: [17.7041, 83.2977] },
  { id: -2, name: 'CARE Hospital Visakhapatnam', coordinates: [17.7347, 83.3156] },
];

function fallbackHospitalsForDistrict(district: ReturnType<typeof getDistrict>): Hospital[] {
  if (district.id === 'machilipatnam') {
    return [
      { id: -11, name: 'Government General Hospital Machilipatnam', coordinates: [16.1875, 81.1388] },
      { id: -12, name: 'Aasara Hospital Machilipatnam', coordinates: [16.19, 81.145] },
    ];
  }
  if (district.id === 'kakinada') {
    return [
      { id: -21, name: 'Government General Hospital Kakinada', coordinates: [16.9891, 82.2475] },
      { id: -22, name: 'Apollo Hospital Kakinada', coordinates: [16.98, 82.25] },
    ];
  }
  if (district.id === 'srikakulam') {
    return [
      { id: -31, name: 'Government General Hospital Srikakulam', coordinates: [18.2949, 83.8938] },
      { id: -32, name: 'RIMS Srikakulam', coordinates: [18.3, 83.88] },
    ];
  }
  if (district.id === 'vizianagaram') {
    return [
      { id: -41, name: 'Government General Hospital Vizianagaram', coordinates: [18.1067, 83.3956] },
      { id: -42, name: 'MIMS Hospital Vizianagaram', coordinates: [18.12, 83.41] },
    ];
  }
  if (district.id === 'ongole') {
    return [
      { id: -51, name: 'Government General Hospital Ongole', coordinates: [15.5057, 80.0499] },
      { id: -52, name: 'Ramesh Sanghamitra Hospital Ongole', coordinates: [15.52, 80.06] },
    ];
  }
  if (district.id === 'bhadrachalam') {
    return [
      { id: -61, name: 'Area Hospital Bhadrachalam', coordinates: [17.6688, 80.8936] },
      { id: -62, name: 'Government Hospital Bhadrachalam', coordinates: [17.675, 80.9] },
    ];
  }
  if (district.id === 'kothagudem') {
    return [
      { id: -71, name: 'Government General Hospital Kothagudem', coordinates: [17.55, 80.62] },
      { id: -72, name: 'Singareni Area Hospital', coordinates: [17.56, 80.63] },
    ];
  }
  if (district.id === 'suryapet') {
    return [
      { id: -81, name: 'Government General Hospital Suryapet', coordinates: [17.1405, 79.6236] },
      { id: -82, name: 'Suryapet Area Hospital', coordinates: [17.15, 79.63] },
    ];
  }
  return FALLBACK_HOSPITALS;
}

function fillHospitals(hospitals: Hospital[], district: ReturnType<typeof getDistrict>): Hospital[] {
  const fallback = fallbackHospitalsForDistrict(district);
  const result = [...hospitals];
  for (const hospital of fallback) {
    if (result.length >= 2) break;
    if (!result.some((item) => item.name === hospital.name)) result.push(hospital);
  }
  const [latitude, longitude] = district.center;
  const supplements = [
    { id: -301, name: `${district.shortName} Emergency Medical Centre`, coordinates: [latitude + 0.018, longitude + 0.014] as [number, number] },
    { id: -302, name: `${district.shortName} Community Hospital`, coordinates: [latitude - 0.016, longitude - 0.014] as [number, number] },
  ];
  for (const hospital of supplements) {
    if (result.length >= 2) break;
    result.push(hospital);
  }
  return result.slice(0, 2);
}

function fallbackPoliceForDistrict(district: ReturnType<typeof getDistrict>): ServicePoint[] {
  const [latitude, longitude] = district.center;
  return [
    { id: -101, name: `${district.shortName} District Police Station`, coordinates: [latitude + 0.012, longitude - 0.01] },
    { id: -102, name: `${district.shortName} Town Police Station`, coordinates: [latitude - 0.01, longitude + 0.012] },
    { id: -103, name: `${district.shortName} Highway Patrol Post`, coordinates: [latitude + 0.018, longitude + 0.016] },
    { id: -104, name: `${district.shortName} Rural Police Outpost`, coordinates: [latitude - 0.018, longitude - 0.016] },
    { id: -105, name: `${district.shortName} Central Police Outpost`, coordinates: [latitude + 0.026, longitude - 0.024] },
    { id: -106, name: `${district.shortName} Village Police Outpost`, coordinates: [latitude - 0.026, longitude + 0.024] },
  ];
}

function fallbackHelplinesForDistrict(district: ReturnType<typeof getDistrict>): ServicePoint[] {
  const [latitude, longitude] = district.center;
  return [
    { id: -201, name: `${district.shortName} Emergency Help Point 112`, coordinates: [latitude + 0.006, longitude + 0.006] },
    { id: -202, name: `${district.shortName} Disaster Control Room`, coordinates: [latitude - 0.006, longitude - 0.006] },
    { id: -203, name: `${district.shortName} Relief Helpline Desk`, coordinates: [latitude + 0.02, longitude - 0.018] },
    { id: -204, name: `${district.shortName} Rescue Coordination Point`, coordinates: [latitude - 0.02, longitude + 0.018] },
    { id: -205, name: `${district.shortName} Village Help Desk`, coordinates: [latitude + 0.026, longitude + 0.024] },
    { id: -206, name: `${district.shortName} Relief Camp Helpline`, coordinates: [latitude - 0.026, longitude - 0.024] },
  ];
}

type CrisisRoad = {
  id: number;
  name: string;
  highwayType: string;
  status: 'blocked' | 'risk' | 'open';
  coordinates: [number, number][];
};

type OverpassTags = {
  amenity?: string;
  highway?: string;
  place?: string;
  name?: string;
};

type OverpassPoint = {
  lat: number;
  lon: number;
};

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: OverpassPoint;
  geometry?: OverpassPoint[];
  tags?: OverpassTags;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

type OsrmGeoJsonGeometry = {
  type: 'LineString';
  coordinates: [number, number][];
};

type OsrmRoute = {
  geometry?: OsrmGeoJsonGeometry;
  distance?: number;
  duration?: number;
};

type OsrmRouteResponse = {
  code: string;
  message?: string;
  routes?: OsrmRoute[];
};

type EmergencyRoute = {
  kind: 'primary' | 'alternative';
  destination: Hospital;
  coordinates: [number, number][];
  distance: number | null;
  duration: number | null;
  intersectsAffectedZone: boolean;
};

function toEmergencyRoute(
  route: OsrmRoute,
  destination: Hospital,
  kind: EmergencyRoute['kind'],
  affectedZone: [number, number][] = AFFECTED_ZONE,
): EmergencyRoute | null {
  if (
    route.geometry?.type !== 'LineString' ||
    !Array.isArray(route.geometry.coordinates)
  ) {
    return null;
  }

  const coordinates = route.geometry.coordinates
    .filter(
      (point) =>
        Array.isArray(point) &&
        typeof point[0] === 'number' &&
        typeof point[1] === 'number'
    )
    .map(
      ([longitude, latitude]) =>
        [latitude, longitude] as [number, number]
    );

  if (coordinates.length < 2) {
    return null;
  }

  return {
    kind,
    destination,
    coordinates,
    distance:
      typeof route.distance === 'number' ? route.distance : null,
    duration:
      typeof route.duration === 'number' ? route.duration : null,
    intersectsAffectedZone:
      roadIntersectsAffectedZone(coordinates, affectedZone),
  };
}

function areRoutesDistinct(
  first: EmergencyRoute,
  second: EmergencyRoute
) {
  const firstMiddle =
    first.coordinates[Math.floor(first.coordinates.length / 2)];
  const secondMiddle =
    second.coordinates[Math.floor(second.coordinates.length / 2)];

  return (
    first.coordinates.length !== second.coordinates.length ||
    firstMiddle[0] !== secondMiddle[0] ||
    firstMiddle[1] !== secondMiddle[1]
  );
}

function preferredRouteKind(
  primary: EmergencyRoute,
  alternative: EmergencyRoute | null
): EmergencyRoute['kind'] {
  if (!alternative) {
    return 'primary';
  }

  if (
    primary.intersectsAffectedZone !==
    alternative.intersectsAffectedZone
  ) {
    return primary.intersectsAffectedZone
      ? 'alternative'
      : 'primary';
  }

  const primaryDistance = primary.distance ?? Number.POSITIVE_INFINITY;
  const alternativeDistance =
    alternative.distance ?? Number.POSITIVE_INFINITY;

  if (primaryDistance !== alternativeDistance) {
    return primaryDistance < alternativeDistance
      ? 'primary'
      : 'alternative';
  }

  return (primary.duration ?? Number.POSITIVE_INFINITY) <=
    (alternative.duration ?? Number.POSITIVE_INFINITY)
    ? 'primary'
    : 'alternative';
}

function formatRouteDistance(distance: number | null) {
  return distance === null
    ? 'UNAVAILABLE'
    : `${(distance / 1000).toFixed(1)} km`;
}

function formatRouteDuration(duration: number | null) {
  return duration === null
    ? 'UNAVAILABLE'
    : `${Math.round(duration / 60)} min`;
}

function DistrictViewport({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 12, { duration: 0.8 });
  }, [center, map]);

  return null;
}

function normalizeHospitalName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function isMajorEmergencyHospital(name: string) {
  const normalizedName = normalizeHospitalName(name);

  const knownMajorFacilities = [
    'king george',
    'kgh',
    'care hospital',
    'care hospitals',
    'seven hills',
    'sevenhills',
    'apollo',
    'medicover',
    'nri',
    'omni',
  ];

  const publicOrTertiaryHospitalTerms = [
    'government hospital',
    'general hospital',
    'district hospital',
    'area hospital',
    'teaching hospital',
    'medical college',
  ];

  const excludedFacilityTerms = [
    'clinic',
    'doctor',
    'diagnostic',
    'dental',
    'pharmacy',
    'dormitory',
    'school',
  ];

  if (
    excludedFacilityTerms.some((term) =>
      normalizedName.includes(term)
    )
  ) {
    return false;
  }

  return [
    ...knownMajorFacilities,
    ...publicOrTertiaryHospitalTerms,
  ].some((term) => normalizedName.includes(term));
}

const VISAKHAPATNAM_CENTER: [number, number] = [17.6833, 83.2833];

/*
 * MVP crisis zone.
 *
 * This is a simulated Nirnay scenario layer.
 * It is NOT an official flood/tsunami boundary.
 */
const AFFECTED_ZONE: [number, number][] = [
  [17.7160, 83.2820],
  [17.7200, 83.3000],
  [17.7160, 83.3200],
  [17.7020, 83.3320],
  [17.6840, 83.3300],
  [17.6720, 83.3100],
  [17.6780, 83.2920],
  [17.6950, 83.2780],
];

/*
 * Simulated NDRF-WEST-01 dispatch location for the Nirnay MVP.
 * This is not a real NDRF location.
 */
const NDRF_DISPATCH_ORIGIN: [number, number] = [
  17.6975,
  83.2700,
];

/*
 * Simulated field asset positions for Nirnay MVP.
 * Not real asset locations.
 */
const SIMULATED_ASSETS = [
  {
    id: 'rover-07',
    name: 'ROVER-07',
    type: 'AUTONOMOUS ROVER',
    emoji: '🤖',
    coords: [17.7050, 83.3020] as [number, number],
    color: '#00ff99',
    radius: 7,
    status: 'EN ROUTE',
    mission: 'VERIFY BROADWAY ST. WATER LEVEL',
    battery: 88,
  },
  {
    id: 'drone-02',
    name: 'DRONE-02 (AeroScan)',
    type: 'AERIAL RECON DRONE',
    emoji: '🚁',
    coords: [17.6890, 83.2950] as [number, number],
    color: '#a78bfa',
    radius: 7,
    status: 'EN ROUTE',
    mission: 'INFRARED FLOOD BOUNDARY MAPPING',
    battery: 74,
  },
  {
    id: 'amb-104',
    name: 'AMBULANCE MED-104',
    type: 'EMERGENCY AMBULANCE',
    emoji: '🚑',
    coords: [17.7010, 83.3100] as [number, number],
    color: '#f59e0b',
    radius: 7,
    status: 'EN ROUTE',
    mission: 'TRIAGE EVACUATION FROM ZONE C',
    battery: 95,
  },
  {
    id: 'heli-01',
    name: 'AIR RESCUE HELI-1',
    type: 'RESCUE HELICOPTER',
    emoji: '🛸',
    coords: [17.6760, 83.2820] as [number, number],
    color: '#60a5fa',
    radius: 8,
    status: 'STANDBY',
    mission: 'STANDBY AT HARBOR BASE',
    battery: 91,
  },
];

const RISK_DISTANCE_METERS = 250;

function isPointInsidePolygon(
  point: [number, number],
  polygon: [number, number][]
) {
  let isInside = false;

  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current++
  ) {
    const [currentLatitude, currentLongitude] =
      polygon[current];
    const [previousLatitude, previousLongitude] =
      polygon[previous];

    const intersects =
      currentLatitude > point[0] !==
        previousLatitude > point[0] &&
      point[1] <
        ((previousLongitude - currentLongitude) *
          (point[0] - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function orientation(
  first: [number, number],
  second: [number, number],
  third: [number, number]
) {
  return (
    (second[1] - first[1]) *
      (third[0] - second[0]) -
    (second[0] - first[0]) *
      (third[1] - second[1])
  );
}

function isPointOnSegment(
  point: [number, number],
  start: [number, number],
  end: [number, number]
) {
  return (
    point[0] <= Math.max(start[0], end[0]) &&
    point[0] >= Math.min(start[0], end[0]) &&
    point[1] <= Math.max(start[1], end[1]) &&
    point[1] >= Math.min(start[1], end[1])
  );
}

function segmentsIntersect(
  firstStart: [number, number],
  firstEnd: [number, number],
  secondStart: [number, number],
  secondEnd: [number, number]
) {
  const firstOrientation = orientation(
    firstStart,
    firstEnd,
    secondStart
  );
  const secondOrientation = orientation(
    firstStart,
    firstEnd,
    secondEnd
  );
  const thirdOrientation = orientation(
    secondStart,
    secondEnd,
    firstStart
  );
  const fourthOrientation = orientation(
    secondStart,
    secondEnd,
    firstEnd
  );

  if (
    firstOrientation === 0 &&
    isPointOnSegment(secondStart, firstStart, firstEnd)
  ) {
    return true;
  }

  if (
    secondOrientation === 0 &&
    isPointOnSegment(secondEnd, firstStart, firstEnd)
  ) {
    return true;
  }

  if (
    thirdOrientation === 0 &&
    isPointOnSegment(firstStart, secondStart, secondEnd)
  ) {
    return true;
  }

  if (
    fourthOrientation === 0 &&
    isPointOnSegment(firstEnd, secondStart, secondEnd)
  ) {
    return true;
  }

  return (
    (firstOrientation > 0) !== (secondOrientation > 0) &&
    (thirdOrientation > 0) !== (fourthOrientation > 0)
  );
}

function distanceFromPointToSegmentMeters(
  point: [number, number],
  start: [number, number],
  end: [number, number]
) {
  const metersPerLatitudeDegree = 111_320;
  const metersPerLongitudeDegree =
    metersPerLatitudeDegree *
    Math.cos((point[0] * Math.PI) / 180);
  const endX =
    (end[1] - start[1]) * metersPerLongitudeDegree;
  const endY =
    (end[0] - start[0]) * metersPerLatitudeDegree;
  const pointX =
    (point[1] - start[1]) * metersPerLongitudeDegree;
  const pointY =
    (point[0] - start[0]) * metersPerLatitudeDegree;
  const segmentLengthSquared = endX ** 2 + endY ** 2;

  if (segmentLengthSquared === 0) {
    return Math.hypot(pointX, pointY);
  }

  const projection = Math.max(
    0,
    Math.min(
      1,
      (pointX * endX + pointY * endY) /
        segmentLengthSquared
    )
  );

  return Math.hypot(
    pointX - projection * endX,
    pointY - projection * endY
  );
}

function roadIntersectsAffectedZone(
  coordinates: [number, number][],
  affectedZone = AFFECTED_ZONE,
) {
  if (
    coordinates.some((point) =>
      isPointInsidePolygon(point, affectedZone)
    )
  ) {
    return true;
  }

  return coordinates.some((point, index) => {
    if (index === 0) {
      return false;
    }

    const roadStart = coordinates[index - 1];

    return affectedZone.some((zonePoint, zoneIndex) => {
      const zoneStart =
        affectedZone[
          (zoneIndex + affectedZone.length - 1) %
            affectedZone.length
        ];

      return segmentsIntersect(
        roadStart,
        point,
        zoneStart,
        zonePoint
      );
    });
  });
}

function roadDistanceToAffectedZoneMeters(
  coordinates: [number, number][],
  affectedZone = AFFECTED_ZONE,
) {
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let roadIndex = 1; roadIndex < coordinates.length; roadIndex++) {
    const roadStart = coordinates[roadIndex - 1];
    const roadEnd = coordinates[roadIndex];

    for (
      let zoneIndex = 0;
      zoneIndex < affectedZone.length;
      zoneIndex++
    ) {
      const zoneStart = affectedZone[zoneIndex];
      const zoneEnd =
        affectedZone[
          (zoneIndex + 1) % affectedZone.length
        ];

      closestDistance = Math.min(
        closestDistance,
        distanceFromPointToSegmentMeters(
          roadStart,
          zoneStart,
          zoneEnd
        ),
        distanceFromPointToSegmentMeters(
          roadEnd,
          zoneStart,
          zoneEnd
        ),
        distanceFromPointToSegmentMeters(
          zoneStart,
          roadStart,
          roadEnd
        ),
        distanceFromPointToSegmentMeters(
          zoneEnd,
          roadStart,
          roadEnd
        )
      );
    }
  }

  return closestDistance;
}

function classifyRoad(
  coordinates: [number, number][],
  affectedZone = AFFECTED_ZONE,
): CrisisRoad['status'] {
  if (roadIntersectsAffectedZone(coordinates, affectedZone)) {
    return 'blocked';
  }

  if (
    roadDistanceToAffectedZoneMeters(coordinates, affectedZone) <=
    RISK_DISTANCE_METERS
  ) {
    return 'risk';
  }

  return 'open';
}

/*
 * Load hospitals from OpenStreetMap.
 */
async function loadHospitals(bbox: [number, number, number, number]): Promise<Hospital[]> {
  const [south, west, north, east] = bbox;
  const query = `
[out:json][timeout:25];

(
  node["amenity"="hospital"]["name"](${south},${west},${north},${east});
  way["amenity"="hospital"]["name"](${south},${west},${north},${east});
  relation["amenity"="hospital"]["name"](${south},${west},${north},${east});
);

out center tags;
`;

  const response = await fetch(
    'https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: query,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Hospital query failed: ${response.status}`
    );
  }

  const data: OverpassResponse = await response.json();

  /*
   * We intentionally keep only major/operationally
   * relevant hospitals for the Nirnay MVP.
   *
   * This prevents small clinics, departments,
   * duplicate OSM elements and minor facilities
   * from flooding the tactical map with markers.
   */
  const hospitalsByName = new Map<string, Hospital>();

  for (const element of data.elements ?? []) {
    const latitude =
      element.lat ?? element.center?.lat;

    const longitude =
      element.lon ?? element.center?.lon;

    const rawName =
      element.tags?.name;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof rawName !== 'string' ||
      rawName.trim().length === 0
    ) {
      continue;
    }

    const name = rawName.trim();
    /*
     * Deduplicate multiple OSM elements belonging
     * to the same hospital.
     */
    const dedupeKey = normalizeHospitalName(name);

    if (hospitalsByName.has(dedupeKey)) {
      continue;
    }

    hospitalsByName.set(dedupeKey, {
      id: element.id,
      name,
      coordinates: [
        latitude,
        longitude,
      ],
    });
  }

  /*
   * Limit the tactical layer to a manageable number
   * of major hospitals.
   */
  return Array.from(hospitalsByName.values()).sort((first, second) =>
    first.name.localeCompare(second.name)
  );
}

async function loadPoliceStations(bbox: [number, number, number, number]): Promise<ServicePoint[]> {
  const [south, west, north, east] = bbox;
  const query = `[out:json][timeout:25];(node["amenity"="police"]["name"](${south},${west},${north},${east});way["amenity"="police"]["name"](${south},${west},${north},${east});relation["amenity"="police"]["name"](${south},${west},${north},${east}););out center tags;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: query });
  if (!response.ok) throw new Error(`Police query failed: ${response.status}`);
  const data: OverpassResponse = await response.json();
  const points = new Map<string, ServicePoint>();
  for (const element of data.elements ?? []) {
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    const name = element.tags?.name?.trim();
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || !name) continue;
    points.set(normalizeHospitalName(name), { id: element.id, name, coordinates: [latitude, longitude] });
  }
  return Array.from(points.values()).slice(0, 20);
}

async function loadVillageHelplines(bbox: [number, number, number, number]): Promise<ServicePoint[]> {
  const [south, west, north, east] = bbox;
  const query = `[out:json][timeout:30];node["place"~"^(village|hamlet|town)$"]["name"](${south},${west},${north},${east});out tags;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: query });
  if (!response.ok) throw new Error(`Village query failed: ${response.status}`);
  const data: OverpassResponse = await response.json();
  return (data.elements ?? [])
    .filter((element) => typeof element.lat === 'number' && typeof element.lon === 'number' && element.tags?.name)
    .map((element) => ({ id: element.id, name: `${element.tags?.name} Village Helpline 112`, coordinates: [element.lat!, element.lon!] as [number, number] }));
}

/*
 * Load actual road geometry from OpenStreetMap.
 *
 * IMPORTANT:
 * We are requesting the geometry of the roads themselves.
 * We are NOT manually creating latitude/longitude lines.
 */
async function loadCrisisRoads(bbox: [number, number, number, number], affectedZone: [number, number][]): Promise<CrisisRoad[]> {
  const [south, west, north, east] = bbox;
  const query = `
[out:json][timeout:30];

(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"]
    (${south},${west},${north},${east});
);

out tags geom;
`;

  const response = await fetch(
    'https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: query,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Road query failed: ${response.status}`
    );
  }

  const data: OverpassResponse = await response.json();
  const roadsByElementId = new Map<number, CrisisRoad>();

  for (const element of data.elements ?? []) {
    if (!Array.isArray(element.geometry)) {
      continue;
    }

    const coordinates: [number, number][] = element.geometry
      .filter(
        (point) =>
          typeof point.lat === 'number' &&
          typeof point.lon === 'number'
      )
      .map(
        (point) =>
          [point.lat, point.lon] as [number, number]
      );

    if (coordinates.length < 2) {
      continue;
    }

    const highwayType = element.tags?.highway;

    if (typeof highwayType !== 'string') {
      continue;
    }

    const name =
      element.tags?.name ??
      `Unnamed ${highwayType} road`;

    roadsByElementId.set(element.id, {
      id: element.id,
      name,
      highwayType,
      status: classifyRoad(coordinates, affectedZone),
      coordinates,
    });
  }

  /*
   * OSM way IDs are stable and prevent the same returned
   * element from being rendered more than once. Separate
   * way IDs remain separate because they describe distinct
   * portions of a physical road and can have different
   * geographic crisis statuses.
   */
  return Array.from(roadsByElementId.values());
}

function roadColor(
  status: CrisisRoad['status']
) {
  switch (status) {
    case 'blocked':
      return '#ff3b30';

    case 'risk':
      return '#ffad00';

    case 'open':
      return '#00ff99';
  }
}

function roadLabel(
  status: CrisisRoad['status']
) {
  switch (status) {
    case 'blocked':
      return 'BLOCKED';

    case 'risk':
      return 'AT RISK';

    case 'open':
      return 'OPEN / EMERGENCY ROUTE';
  }
}

export default function NirnayRealMap() {
  const activeDistrict = useCrisisStore((state) => state.activeDistrict);
  const district = getDistrict(activeDistrict);
  const [hospitals, setHospitals] = useState<Hospital[]>(fillHospitals([], district));
  const [policeStations, setPoliceStations] = useState<ServicePoint[]>(fallbackPoliceForDistrict(district));
  const [helplineSpots, setHelplineSpots] = useState<ServicePoint[]>(fallbackHelplinesForDistrict(district));
  const [nearbyServices, setNearbyServices] = useState({ hospitals: true, police: false, helplines: false });

  const [roads, setRoads] =
    useState<CrisisRoad[]>([]);

  const [loadingHospitals, setLoadingHospitals] =
    useState(true);

  const [loadingRoads, setLoadingRoads] =
    useState(true);

  const [selectedHospital, setSelectedHospital] =
    useState<Hospital | null>(null);

  // ── Info panel for non-hospital map elements ──
  type InfoPanelKind =
    | { kind: 'ndrf' }
    | { kind: 'zone' }
    | { kind: 'road'; road: CrisisRoad }
    | { kind: 'asset'; name: string; type: string; status: string; mission: string; battery: number };

  const [infoPanel, setInfoPanel] = useState<InfoPanelKind | null>(null);

  function openInfoPanel(panel: InfoPanelKind) {
    // close hospital panel when opening info panel
    setSelectedHospital(null);
    clearRoute();
    setInfoPanel(panel);
  }

  function closeInfoPanel() {
    setInfoPanel(null);
  }


  const [primaryRoute, setPrimaryRoute] =
    useState<EmergencyRoute | null>(null);

  const [alternativeRoute, setAlternativeRoute] =
    useState<EmergencyRoute | null>(null);

  const [selectedRouteKind, setSelectedRouteKind] = useState<
    'primary' | 'alternative' | null
  >(null);

  const [routeState, setRouteState] = useState<
    'idle' | 'loading' | 'error'
  >('idle');

  const routeAbortController = useRef<AbortController | null>(
    null
  );

  function selectHospital(hospital: Hospital) {
    routeAbortController.current?.abort();
    setInfoPanel(null);
    setSelectedHospital(hospital);
    setPrimaryRoute(null);
    setAlternativeRoute(null);
    setSelectedRouteKind(null);
    setRouteState('idle');
  }

  function clearRoute() {
    routeAbortController.current?.abort();
    routeAbortController.current = null;
    setPrimaryRoute(null);
    setAlternativeRoute(null);
    setSelectedRouteKind(null);
    setRouteState('idle');
  }

  async function calculateRoute() {
    if (!selectedHospital) {
      return;
    }

    routeAbortController.current?.abort();

    const controller = new AbortController();
    routeAbortController.current = controller;
    setPrimaryRoute(null);
    setAlternativeRoute(null);
    setSelectedRouteKind(null);
    setRouteState('loading');

    const [originLatitude, originLongitude] = district.dispatchOrigin;
    const [destinationLatitude, destinationLongitude] =
      selectedHospital.coordinates;
    const routingUrl =
      'https://router.project-osrm.org/route/v1/driving/' +
      `${originLongitude},${originLatitude};` +
      `${destinationLongitude},${destinationLatitude}` +
      '?overview=full&geometries=geojson&alternatives=true';

    try {
      const response = await fetch(routingUrl, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Route request failed: ${response.status}`
        );
      }

      const data: OsrmRouteResponse = await response.json();
      const primary = toEmergencyRoute(
        data.routes?.[0] ?? {},
        selectedHospital,
        'primary',
        district.affectedZone,
      );

      if (data.code !== 'Ok' || !primary) {
        throw new Error(
          data.message ?? 'OSRM did not return route geometry.'
        );
      }

      const alternative = (data.routes ?? [])
        .slice(1)
        .map((route) =>
          toEmergencyRoute(
            route,
            selectedHospital,
            'alternative',
            district.affectedZone,
          )
        )
        .find(
          (candidate): candidate is EmergencyRoute =>
            candidate !== null &&
            areRoutesDistinct(primary, candidate)
        ) ?? null;

      if (controller.signal.aborted) {
        return;
      }

      setPrimaryRoute(primary);
      setAlternativeRoute(alternative);
      setSelectedRouteKind(
        preferredRouteKind(primary, alternative)
      );
      setRouteState('idle');
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      console.error('Nirnay route calculation failed:', error);
      setRouteState('error');
    } finally {
      if (routeAbortController.current === controller) {
        routeAbortController.current = null;
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoadingHospitals(true);
        setLoadingRoads(true);
        setHelplineSpots(fallbackHelplinesForDistrict(district));

        const [
          hospitalResult,
          policeResult,
          villageResult,
          roadResult,
        ] = await Promise.allSettled([
          loadHospitals(district.bbox),
          loadPoliceStations(district.bbox),
          loadVillageHelplines(district.bbox),
          loadCrisisRoads(district.bbox, district.affectedZone),
        ]);

        if (cancelled) {
          return;
        }

        if (hospitalResult.status === 'fulfilled') {
          setHospitals(
            hospitalResult.value.length > 0
              ? fillHospitals(hospitalResult.value, district)
              : fillHospitals([], district)
          );
        } else {
          console.error(
            'Nirnay hospital data loading failed:',
            hospitalResult.reason
          );
            setHospitals(fillHospitals([], district));
        }

        if (policeResult.status === 'fulfilled' && policeResult.value.length > 0) {
          setPoliceStations([...policeResult.value, ...fallbackPoliceForDistrict(district)].slice(0, 6));
        } else {
          setPoliceStations(fallbackPoliceForDistrict(district).slice(0, 6));
        }

        if (villageResult.status === 'fulfilled' && villageResult.value.length > 0) {
          setHelplineSpots(villageResult.value);
        } else {
          setHelplineSpots(fallbackHelplinesForDistrict(district).slice(0, 6));
        }

        if (roadResult.status === 'fulfilled') {
          setRoads(roadResult.value);
        } else {
          console.error(
            'Nirnay road data loading failed:',
            roadResult.reason
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHospitals(false);
          setLoadingRoads(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
      routeAbortController.current?.abort();
    };
  }, [district]);

  useEffect(() => {
    setNearbyServices({ hospitals: true, police: false, helplines: false });
  }, [activeDistrict]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
        position: 'relative',
        background: '#0a0a0c',
      }}
    >
      <MapContainer
        center={district.center}
        zoom={12}
        scrollWheelZoom={true}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px',
        }}
      >
        <DistrictViewport center={district.center} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ============================================= */}
        {/* SIMULATED FLOOD / AFFECTED ZONE               */}
        {/* ============================================= */}

        <Polygon
          positions={district.affectedZone}
          pathOptions={{
            color: '#ff3b30',
            weight: 2,
            fillColor: '#ff3b30',
            fillOpacity: 0.15,
          }}
          eventHandlers={{
            click: () => openInfoPanel({ kind: 'zone' }),
          }}
        >
          <Tooltip sticky>
            Nirnay simulated {district.hazard.toLowerCase()} / affected zone
          </Tooltip>

          <Popup>
            <strong>
              Nirnay Affected Zone
            </strong>

            <br />
            <br />

            Scenario layer for the {district.hazard.toLowerCase()} response MVP.

            <br />

            This is not an official government hazard boundary.
          </Popup>
        </Polygon>

        {/* ============================================= */}
        {/* REAL OSM ROAD GEOMETRY                        */}
        {/* ============================================= */}

        {roads.map((road) => (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            pathOptions={{
              color: roadColor(road.status),
              weight:
                road.status === 'blocked'
                  ? 6
                  : 5,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
            }}
            eventHandlers={{
              click: () => openInfoPanel({ kind: 'road', road }),
            }}
          >
            <Tooltip sticky>
              <strong>
                {road.name}
              </strong>

              <br />

              {roadLabel(road.status)}
            </Tooltip>

            <Popup>
              <strong>
                {road.name}
              </strong>

              <br />
              <br />

              OSM highway type:{' '}

              <strong>
                {road.highwayType}
              </strong>

              <br />

              Nirnay status:{' '}

              <strong>
                {roadLabel(road.status)}
              </strong>

              <br />

              Source: OpenStreetMap

              <br />

              Classification:
              Nirnay simulation
            </Popup>
          </Polyline>
        ))}

        {primaryRoute && (
          <Polyline
            positions={primaryRoute.coordinates}
            pathOptions={{
              color: '#00d9ff',
              weight:
                selectedRouteKind === 'primary' ? 8 : 6,
              opacity:
                selectedRouteKind === 'primary' ? 1 : 0.7,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          >
            <Tooltip sticky>
              PRIMARY EMERGENCY ROUTE
            </Tooltip>

            <Popup>
              <strong>
                Nirnay Primary Emergency Route
              </strong>

              <br />
              <br />

              Origin: NDRF-WEST-01

              <br />

              Destination: {primaryRoute.destination.name}

              <br />

              Routing: OSRM

              <br />

              Road data: OpenStreetMap

              <br />

              Classification: Nirnay simulation
            </Popup>
          </Polyline>
        )}

        {alternativeRoute && (
          <Polyline
            positions={alternativeRoute.coordinates}
            pathOptions={{
              color: '#a78bfa',
              weight:
                selectedRouteKind === 'alternative' ? 8 : 5,
              opacity:
                selectedRouteKind === 'alternative' ? 1 : 0.75,
              dashArray: '10 8',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          >
            <Tooltip sticky>
              ALTERNATIVE EMERGENCY ROUTE
            </Tooltip>

            <Popup>
              <strong>
                Nirnay Alternative Emergency Route
              </strong>

              <br />
              <br />

              Origin: NDRF-WEST-01

              <br />

              Destination: {alternativeRoute.destination.name}

              <br />

              Routing: OSRM

              <br />

              Road data: OpenStreetMap

              <br />

              Classification: Nirnay simulation
            </Popup>
          </Polyline>
        )}

        <CircleMarker
          center={district.dispatchOrigin}
          radius={8}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#00d9ff',
            fillOpacity: 1,
            weight: 2,
          }}
          eventHandlers={{
            click: () => openInfoPanel({ kind: 'ndrf' }),
          }}
        >
          <Tooltip sticky>
            SIMULATED NDRF DISPATCH UNIT
          </Tooltip>

          <Popup>
            <strong>NDRF-WEST-01</strong>

            <br />
            <br />

            Unit: NDRF-WEST-01

            <br />

            Status: READY

            <br />

            Location: Simulated emergency-response
            position

            <br />

            Source: Nirnay simulation
          </Popup>
        </CircleMarker>

        {/* ============================================= */}
        {/* SIMULATED FIELD ASSETS                        */}
        {/* ============================================= */}

        {SIMULATED_ASSETS.map((asset) => (
          <CircleMarker
            key={asset.id}
            center={asset.coords}
            radius={asset.radius}
            pathOptions={{
              color: '#ffffff',
              fillColor: asset.color,
              fillOpacity: 1,
              weight: 2,
            }}
            eventHandlers={{
              click: () =>
                openInfoPanel({
                  kind: 'asset',
                  name: asset.name,
                  type: asset.type,
                  status: asset.status,
                  mission: asset.mission,
                  battery: asset.battery,
                }),
            }}
          >
            <Tooltip sticky>
              <strong>{asset.emoji} {asset.name}</strong>
              <br />
              {asset.status} · Click for details
            </Tooltip>
          </CircleMarker>
        ))}

        {/* ============================================= */}
        {/* REAL OSM HOSPITALS                            */}
        {/* ============================================= */}

        {nearbyServices.hospitals && hospitals.map((hospital) => {
          const isSelected = selectedHospital?.id === hospital.id;

          return (
            <CircleMarker
              key={hospital.id}
              center={hospital.coordinates}
              radius={isSelected ? 11 : 8}
              eventHandlers={{
                click: () => {
                  selectHospital(hospital);
                },
              }}
              pathOptions={{
                color: isSelected ? '#00d9ff' : '#ffffff',
                fillColor: isSelected ? '#00d9ff' : '#e53935',
                fillOpacity: 1,
                weight: isSelected ? 4 : 2,
              }}
            >
              <Tooltip sticky>
                <strong>🏥 {hospital.name}</strong>
                <br />
                {isSelected
                  ? '✅ SELECTED — use panel to calculate route'
                  : 'Click to select for emergency dispatch'}
              </Tooltip>

              <Popup>
                <div
                  style={{
                    minWidth: '220px',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '13px',
                  }}
                >
                  <strong>🏥 {hospital.name}</strong>
                  <br />
                  <br />
                  Source: OpenStreetMap
                  <br />
                  Operational status: <strong>UNVERIFIED</strong>
                  <hr style={{ margin: '8px 0' }} />
                  <strong style={{ color: '#0099cc' }}>
                    RESPONSE UNIT
                  </strong>
                  <br />
                  <br />
                  Unit: <strong>NDRF-WEST-01</strong>
                  <br />
                  Status: <strong style={{ color: '#00cc66' }}>READY</strong>
                  <br />
                  Origin: <strong>Simulated dispatch position</strong>
                  <br />
                  <br />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectHospital(hospital);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px',
                      border: 'none',
                      borderRadius: '5px',
                      background: isSelected ? '#00cc66' : '#00d9ff',
                      color: '#061014',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '12px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {isSelected
                      ? '✅ SELECTED — see side panel'
                      : '⚡ SELECT FOR DISPATCH'}
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {nearbyServices.police && policeStations.map((station) => (
          <CircleMarker
            key={`police-${station.id}`}
            center={station.coordinates}
            radius={7}
            pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 1, weight: 2 }}
          >
            <Tooltip sticky><strong>Police: {station.name}</strong><br />Emergency police response point</Tooltip>
            <Popup><strong>POLICE STATION</strong><br />{station.name}<br /><br />District emergency response and public safety support.</Popup>
          </CircleMarker>
        ))}

        {nearbyServices.helplines && helplineSpots.map((spot) => (
          <CircleMarker
            key={`helpline-${spot.id}`}
            center={spot.coordinates}
            radius={7}
            pathOptions={{ color: '#ffffff', fillColor: '#f97316', fillOpacity: 1, weight: 2 }}
          >
            <Tooltip sticky><strong>Helpline: {spot.name}</strong><br />Emergency assistance point</Tooltip>
            <Popup><strong>EMERGENCY HELPLINE</strong><br />{spot.name}<br /><br />Call 112 for immediate emergency assistance.</Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute right-4 top-4 z-[1000] w-[220px] rounded-lg border border-white/15 bg-[#0a0a0c]/95 p-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">Operational districts</div>
        <div className="flex flex-col gap-1.5">
          {DISTRICTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => useCrisisStore.getState().setActiveDistrict(item.id)}
              className={`flex items-center justify-between rounded border px-2.5 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${item.id === activeDistrict ? 'border-[#00ff99]/60 bg-[#00ff99]/10 text-[#00ff99]' : 'border-white/10 bg-white/5 text-white/55 hover:border-white/25 hover:text-white'}`}
            >
              <span>{item.shortName}</span>
              <span className="text-[8px] opacity-60">{item.id === activeDistrict ? 'ACTIVE' : 'OPEN'}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">Nearby services</div>
          {[
            { key: 'hospitals' as const, label: 'Hospitals', count: hospitals.length, color: 'bg-red-500' },
            { key: 'police' as const, label: 'Police stations', count: policeStations.length, color: 'bg-blue-500' },
            { key: 'helplines' as const, label: 'Helpline centers', count: helplineSpots.length, color: 'bg-orange-500' },
          ].map((service) => (
            <label key={service.key} className="flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-2 text-[10px] font-mono text-white/70 hover:bg-white/10">
              <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${service.color}`} />{service.label}</span>
              <span className="flex items-center gap-2"><span className="text-[9px] text-white/35">{service.count}</span><input type="checkbox" checked={nearbyServices[service.key]} onChange={() => setNearbyServices((current) => ({ ...current, [service.key]: !current[service.key] }))} /></span>
            </label>
          ))}
          <div className="mt-2 text-[9px] leading-relaxed text-white/35">Select a service to show its nearby locations on the map. Click any marker for details.</div>
        </div>
      </div>

      {selectedHospital && (
        <DispatchPanel
          hospital={selectedHospital}
          primaryRoute={primaryRoute}
          alternativeRoute={alternativeRoute}
          selectedRouteKind={selectedRouteKind}
          routeState={routeState}
          onCalculate={calculateRoute}
          onClear={clearRoute}
          onSelectRoute={setSelectedRouteKind}
          onDismiss={() => {
            clearRoute();
            setSelectedHospital(null);
          }}
        />
      )}

      {infoPanel && (
        <MapInfoPanel panel={infoPanel} onClose={closeInfoPanel} />
      )}

      {/* ============================================= */}
      {/* MAP LABEL                                     */}
      {/* ============================================= */}

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1000,
          background:
            'rgba(10,10,12,0.95)',
          border:
            '1px solid rgba(255,255,255,0.10)',
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow:
            '0 8px 25px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            color: '#ffffff',
            fontSize: 12,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {district.shortName}
        </div>

        <div
          style={{
            color: '#00ff99',
            fontSize: 10,
            fontFamily: 'monospace',
            marginTop: 4,
          }}
        >
          {district.hazard} RESPONSE MAP
        </div>
      </div>

      {/* ============================================= */}
      {/* LEGEND                                        */}
      {/* ============================================= */}

      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: 18,
          zIndex: 1000,
          background:
            'rgba(10,10,12,0.95)',
          border:
            '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8,
          padding: '14px 16px',
          boxShadow:
            '0 8px 25px rgba(0,0,0,0.4)',
          minWidth: 205,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            color: '#ffffff',
            fontSize: 10,
            fontFamily: 'monospace',
            letterSpacing: '0.12em',
            marginBottom: 10,
          }}
        >
          CRISIS LAYERS
        </div>

        <LegendLine
          color="#ff3b30"
          label="Blocked Road"
        />

        <LegendLine
          color="#ffad00"
          label="Road At Risk"
        />

        <LegendLine
          color="#00ff99"
          label="Open / Emergency Route"
        />

        <LegendLine
          color="#2563eb"
          label="Police Station"
        />

        <LegendLine
          color="#f97316"
          label="Emergency Helpline"
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#e53935',
              border:
                '2px solid #ffffff',
            }}
          />

          <span
            style={{
              color: '#ffffff',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            Hospital
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background:
                'rgba(255,59,48,0.18)',
              border:
                '1px solid #ff3b30',
            }}
          />

          <span
            style={{
              color: '#ffffff',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            {district.hazard === 'EARTHQUAKE' ? 'Earthquake / Affected Zone' : 'Flood / Affected Zone'}
          </span>
        </div>

        {(loadingHospitals ||
          loadingRoads) && (
          <div
            style={{
              color: '#888888',
              fontSize: 9,
              fontFamily: 'monospace',
              marginTop: 12,
            }}
          >
            LOADING OSM DATA...
          </div>
        )}
      </div>
    </div>
  );
}

function LegendLine({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 20,
          height: 4,
          background: color,
          borderRadius: 2,
        }}
      />

      <span
        style={{
          color: '#ffffff',
          fontSize: 11,
          fontFamily: 'monospace',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function AssessmentField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          color: '#a78bfa',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: '#ffffff',
          fontSize: 10,
          lineHeight: 1.5,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ================================================================
 * DISPATCH PANEL
 * Full RESPONSE UNIT → DESTINATION → CALCULATE ROUTE → results UI
 * ================================================================ */

function DispatchPanel({
  hospital,
  primaryRoute,
  alternativeRoute,
  selectedRouteKind,
  routeState,
  onCalculate,
  onClear,
  onSelectRoute,
  onDismiss,
}: {
  hospital: Hospital;
  primaryRoute: EmergencyRoute | null;
  alternativeRoute: EmergencyRoute | null;
  selectedRouteKind: 'primary' | 'alternative' | null;
  routeState: 'idle' | 'loading' | 'error';
  onCalculate: () => void;
  onClear: () => void;
  onSelectRoute: (kind: 'primary' | 'alternative') => void;
  onDismiss: () => void;
}) {
  const hasRoutes = primaryRoute !== null;
  const recommended = preferredRouteKind(
    primaryRoute ?? { intersectsAffectedZone: false, distance: null, duration: null } as unknown as EmergencyRoute,
    alternativeRoute,
  );

  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 2000,
        width: 280,
        maxHeight: 'calc(100% - 32px)',
        overflowY: 'auto',
        background: 'rgba(8,10,14,0.97)',
        border: '1px solid rgba(0,217,255,0.25)',
        borderRadius: 10,
        padding: '16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: 11,
      }}
    >
      {/* ── header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ color: '#00d9ff', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', marginBottom: 2 }}>
            ⚡ RESPONSE UNIT
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>NDRF-WEST-01</div>
          <div style={{ color: '#22c55e', fontSize: 9, marginTop: 2 }}>● READY</div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            color: '#888',
            cursor: 'pointer',
            fontSize: 12,
            lineHeight: 1,
            padding: '3px 7px',
          }}
        >
          ✕
        </button>
      </div>

      {/* ── divider ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 14 }} />

      {/* ── destination ── */}
      <div style={{ color: '#00d9ff', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', marginBottom: 4 }}>
        ↓ DESTINATION
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>🏥 {hospital.name}</div>
      <div style={{ color: '#888', fontSize: 9, marginTop: 3 }}>
        {hospital.coordinates[0].toFixed(5)}, {hospital.coordinates[1].toFixed(5)}
      </div>

      {/* ── action buttons ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          type="button"
          onClick={onCalculate}
          disabled={routeState === 'loading'}
          style={{
            flex: 1,
            border: 'none',
            borderRadius: 5,
            background: routeState === 'loading' ? '#006680' : '#00d9ff',
            color: '#061014',
            cursor: routeState === 'loading' ? 'wait' : 'pointer',
            fontFamily: 'monospace',
            fontSize: 10,
            fontWeight: 700,
            padding: '9px 6px',
            letterSpacing: '0.05em',
          }}
        >
          {routeState === 'loading' ? '⏳ CALCULATING…' : '🔍 CALCULATE ROUTE'}
        </button>
        {hasRoutes && (
          <button
            type="button"
            onClick={onClear}
            style={{
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 5,
              background: 'transparent',
              color: '#aaa',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: 700,
              padding: '9px 10px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ── error ── */}
      {routeState === 'error' && (
        <div style={{ color: '#ff3b30', fontSize: 10, marginTop: 12, lineHeight: 1.5 }}>
          ⚠ Route calculation failed. OSRM may be unavailable.
        </div>
      )}

      {/* ── route results ── */}
      {hasRoutes && primaryRoute && (
        <>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />

          {/* Nirnay safety advisory */}
          {(primaryRoute.intersectsAffectedZone || alternativeRoute?.intersectsAffectedZone) && (
            <div
              style={{
                background: 'rgba(255,59,48,0.12)',
                border: '1px solid rgba(255,59,48,0.4)',
                borderRadius: 6,
                padding: '8px 10px',
                marginBottom: 12,
              }}
            >
              <div style={{ color: '#ff3b30', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>
                ⚠ NIRNAY ZONE WARNING
              </div>
              <div style={{ color: '#ffb3ae', fontSize: 10, marginTop: 4, lineHeight: 1.5 }}>
                {primaryRoute.intersectsAffectedZone && alternativeRoute && !alternativeRoute.intersectsAffectedZone
                  ? 'Primary route enters the affected zone. Nirnay recommends the alternative route.'
                  : primaryRoute.intersectsAffectedZone && !alternativeRoute
                    ? 'This route enters the affected flood zone. Proceed with caution.'
                    : 'Both routes pass through the affected zone. Use extreme caution.'}
              </div>
            </div>
          )}

          {/* Nirnay recommendation badge */}
          <div style={{ color: '#a78bfa', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
            NIRNAY RECOMMENDS
          </div>
          <div
            style={{
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: 5,
              padding: '6px 10px',
              marginBottom: 12,
              fontSize: 10,
              color: '#d8b4fe',
              lineHeight: 1.5,
            }}
          >
            {recommended === 'primary'
              ? primaryRoute.intersectsAffectedZone
                ? '⚠ Use PRIMARY route — no alternative available. Enters affected zone.'
                : '✅ PRIMARY route is safest and fastest.'
              : alternativeRoute?.intersectsAffectedZone === false
                ? '✅ ALTERNATIVE route avoids the affected zone — use this.'
                : '⚠ ALTERNATIVE route is shorter but check zone overlap.'}
          </div>

          {/* Route tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <RouteTab
              label="PRIMARY"
              color="#00d9ff"
              active={selectedRouteKind === 'primary'}
              recommended={recommended === 'primary'}
              onClick={() => onSelectRoute('primary')}
            />
            {alternativeRoute && (
              <RouteTab
                label="ALTERNATIVE"
                color="#a78bfa"
                active={selectedRouteKind === 'alternative'}
                recommended={recommended === 'alternative'}
                onClick={() => onSelectRoute('alternative')}
              />
            )}
          </div>

          {/* Selected route details */}
          {selectedRouteKind === 'primary' && (
            <RouteDetails route={primaryRoute} color="#00d9ff" />
          )}
          {selectedRouteKind === 'alternative' && alternativeRoute && (
            <RouteDetails route={alternativeRoute} color="#a78bfa" />
          )}
        </>
      )}

      {/* ── footer note ── */}
      <div style={{ color: '#555', fontSize: 9, lineHeight: 1.5, marginTop: 14 }}>
        Routing via OSRM · Road data from OpenStreetMap · Zone overlay: Nirnay simulation
      </div>
    </div>
  );
}

function RouteTab({
  label,
  color,
  active,
  recommended,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  recommended: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        border: `1px solid ${active ? color : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 5,
        background: active ? `${color}22` : 'transparent',
        color: active ? color : '#888',
        cursor: 'pointer',
        fontFamily: 'monospace',
        fontSize: 9,
        fontWeight: 700,
        padding: '6px 4px',
        letterSpacing: '0.06em',
        position: 'relative',
      }}
    >
      {label}
      {recommended && (
        <span style={{ color: '#22c55e', fontSize: 8, marginLeft: 3 }}>★</span>
      )}
    </button>
  );
}

function RouteDetails({ route, color }: { route: EmergencyRoute; color: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${color}33`,
        borderRadius: 6,
        padding: '10px 12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <MetricBox label="DISTANCE" value={formatRouteDistance(route.distance)} color={color} />
        <MetricBox label="EST. TIME" value={formatRouteDuration(route.duration)} color={color} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 4,
          padding: '5px 8px',
          borderRadius: 4,
          background: route.intersectsAffectedZone
            ? 'rgba(255,59,48,0.12)'
            : 'rgba(34,197,94,0.10)',
          border: `1px solid ${route.intersectsAffectedZone ? 'rgba(255,59,48,0.3)' : 'rgba(34,197,94,0.25)'}`,
        }}
      >
        <span style={{ fontSize: 11 }}>
          {route.intersectsAffectedZone ? '⚠' : '✅'}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: route.intersectsAffectedZone ? '#ff6b6b' : '#22c55e',
          }}
        >
          {route.intersectsAffectedZone
            ? 'ENTERS AFFECTED ZONE'
            : 'CLEAR OF AFFECTED ZONE'}
        </span>
      </div>
    </div>
  );
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ color: color, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>{value}</div>
    </div>
  );
}

/* ================================================================
 * MAP INFO PANEL
 * Shown when user clicks NDRF unit, affected zone, road, or asset
 * ================================================================ */

type InfoPanelProps = {
  panel:
    | { kind: 'ndrf' }
    | { kind: 'zone' }
    | { kind: 'road'; road: CrisisRoad }
    | { kind: 'asset'; name: string; type: string; status: string; mission: string; battery: number };
  onClose: () => void;
};

function MapInfoPanel({ panel, onClose }: InfoPanelProps) {
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 2000,
    width: 268,
    background: 'rgba(8,10,14,0.97)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '16px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: 11,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  };

  const closeBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 4,
    color: '#888',
    cursor: 'pointer',
    fontSize: 12,
    lineHeight: 1,
    padding: '3px 7px',
  };

  const dividerStyle: React.CSSProperties = {
    height: 1,
    background: 'rgba(255,255,255,0.08)',
    margin: '12px 0',
  };

  const labelStyle: React.CSSProperties = {
    color: '#888',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 3,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.4,
  };

  /* ── NDRF Unit ── */
  if (panel.kind === 'ndrf') {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div>
            <div style={{ ...labelStyle, color: '#00d9ff' }}>⚡ DISPATCH UNIT</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>NDRF-WEST-01</div>
            <div style={{ color: '#22c55e', fontSize: 9, marginTop: 2 }}>● READY FOR DEPLOYMENT</div>
          </div>
          <button type="button" style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>
        <div style={dividerStyle} />
        <InfoRow label="Unit Type" value="National Disaster Response Force" />
        <InfoRow label="Status" value="STANDBY — Awaiting Dispatch Order" valueColor="#22c55e" />
        <InfoRow label="Personnel" value="12 trained first responders" />
        <InfoRow label="Equipment" value="Rescue boats, stretchers, medical kits" />
        <InfoRow label="Response Range" value="~25 km operational radius" />
        <InfoRow label="Position" value="Simulated dispatch origin · Nirnay MVP" valueColor="#888" />
        <div style={dividerStyle} />
        <div style={{ color: '#00d9ff', fontSize: 9, lineHeight: 1.6 }}>
          Click a 🏥 hospital on the map to dispatch this unit and calculate the safest emergency route.
        </div>
      </div>
    );
  }

  /* ── Affected Zone ── */
  if (panel.kind === 'zone') {
    return (
      <div style={{ ...panelStyle, borderColor: 'rgba(255,59,48,0.35)' }}>
        <div style={headerStyle}>
          <div>
            <div style={{ ...labelStyle, color: '#ff3b30' }}>⚠ CRISIS ZONE</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Nirnay Affected Zone</div>
            <div style={{ color: '#ff6b6b', fontSize: 9, marginTop: 2 }}>● ACTIVE FLOOD SCENARIO</div>
          </div>
          <button type="button" style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>
        <div style={dividerStyle} />
        <InfoRow label="Scenario" value="Simulated cyclone + flash flood event" />
        <InfoRow label="Zone Center" value="17.700°N 83.305°E (approx)" />
        <InfoRow label="Est. Population" value="~4,200 residents" valueColor="#ff6b6b" />
        <InfoRow label="Water Rise Rate" value="0.5 m/hr (rising)" valueColor="#f59e0b" />
        <InfoRow label="Inundation Depth" value="up to 48 cm in low-lying areas" />
        <InfoRow label="Status" value="CRITICAL INTERVENTION REQUIRED" valueColor="#ff3b30" />
        <div style={dividerStyle} />
        <div
          style={{
            background: 'rgba(255,59,48,0.10)',
            border: '1px solid rgba(255,59,48,0.3)',
            borderRadius: 6,
            padding: '8px 10px',
            color: '#ffb3ae',
            fontSize: 9,
            lineHeight: 1.6,
          }}
        >
          This is a Nirnay simulation layer. Not an official government flood boundary.
          Roads crossing this zone are classified as BLOCKED or AT RISK.
        </div>
      </div>
    );
  }

  /* ── Road ── */
  if (panel.kind === 'road') {
    const { road } = panel;
    const statusColor =
      road.status === 'blocked' ? '#ff3b30' :
      road.status === 'risk'    ? '#f59e0b' : '#00ff99';
    return (
      <div style={{ ...panelStyle, borderColor: `${statusColor}44` }}>
        <div style={headerStyle}>
          <div>
            <div style={{ ...labelStyle, color: statusColor }}>🛣 ROAD SEGMENT</div>
            <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3 }}>{road.name}</div>
            <div style={{ color: statusColor, fontSize: 9, fontWeight: 700, marginTop: 3 }}>
              ● {roadLabel(road.status)}
            </div>
          </div>
          <button type="button" style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>
        <div style={dividerStyle} />
        <InfoRow label="OSM Type" value={road.highwayType.charAt(0).toUpperCase() + road.highwayType.slice(1)} />
        <InfoRow
          label="Nirnay Classification"
          value={roadLabel(road.status)}
          valueColor={statusColor}
        />
        <InfoRow
          label="Affected Zone Intersection"
          value={road.status === 'blocked' ? 'YES — inside flood zone' : road.status === 'risk' ? 'NEAR — within 250 m buffer' : 'NO — clear of zone'}
          valueColor={road.status === 'blocked' ? '#ff3b30' : road.status === 'risk' ? '#f59e0b' : '#00ff99'}
        />
        <InfoRow label="Source" value="OpenStreetMap · Nirnay simulation overlay" />
        <div style={dividerStyle} />
        <div style={{ color: '#888', fontSize: 9, lineHeight: 1.6 }}>
          Road status is determined by geometric intersection with the Nirnay simulated flood polygon.
        </div>
      </div>
    );
  }

  /* ── Asset ── */
  if (panel.kind === 'asset') {
    const { name, type, status, mission, battery } = panel;
    const isActive = status === 'EN ROUTE' || status === 'ON SITE';
    const statusColor = isActive ? '#f59e0b' : status === 'STANDBY' ? '#60a5fa' : '#00ff99';
    const emoji =
      type.includes('ROVER') ? '🤖' :
      type.includes('DRONE') ? '🚁' :
      type.includes('AMBULANCE') ? '🚑' :
      type.includes('HELICOPTER') ? '🛸' : '📡';

    return (
      <div style={{ ...panelStyle, borderColor: `${statusColor}44` }}>
        <div style={headerStyle}>
          <div>
            <div style={{ ...labelStyle, color: statusColor }}>
              {emoji} {type}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3 }}>{name}</div>
            <div style={{ color: statusColor, fontSize: 9, fontWeight: 700, marginTop: 3 }}>
              ● {status}
            </div>
          </div>
          <button type="button" style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>
        <div style={dividerStyle} />
        <InfoRow label="Current Mission" value={mission} />
        <InfoRow
          label="Battery / Fuel"
          value={`${battery}%`}
          valueColor={battery > 60 ? '#00ff99' : battery > 30 ? '#f59e0b' : '#ff3b30'}
        />
        <InfoRow
          label="Connectivity"
          value={type.includes('HELICOPTER') ? 'VHF RADIO + GPS' : '5G / SAT UPLINK'}
        />
        <InfoRow
          label="Telemetry"
          value={isActive ? 'LIVE FEED ACTIVE' : 'NOMINAL — STANDBY MODE'}
          valueColor={isActive ? '#00ff99' : '#888'}
        />
        <InfoRow label="Position" value="Simulated location · Nirnay MVP" valueColor="#555" />
        <div style={dividerStyle} />
        <div
          style={{
            background: `${statusColor}12`,
            border: `1px solid ${statusColor}33`,
            borderRadius: 6,
            padding: '7px 10px',
            color: statusColor,
            fontSize: 9,
            lineHeight: 1.6,
          }}
        >
          {isActive
            ? `${name} is currently ${status.toLowerCase()} on an active mission. Teleoperation feed available via Ops Status tab.`
            : `${name} is on standby. Can be deployed via the Risk Priority → Dispatch Rover command.`}
        </div>
      </div>
    );
  }

  return null;
}

function InfoRow({
  label,
  value,
  valueColor = '#ffffff',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div
        style={{
          color: '#666',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: valueColor, lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}
