import {
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
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

type Hospital = {
  id: number;
  name: string;
  coordinates: [number, number];
};

const FALLBACK_HOSPITALS: Hospital[] = [
  {
    id: -1,
    name: 'King George Hospital',
    coordinates: [17.7041, 83.2977],
  },
  {
    id: -2,
    name: 'CARE Hospital Visakhapatnam',
    coordinates: [17.7347, 83.3156],
  },
];

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
  kind: EmergencyRoute['kind']
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
      roadIntersectsAffectedZone(coordinates),
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

const VISAKHAPATNAM_CENTER: [number, number] = [
  17.6833,
  83.2833,
];

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
  coordinates: [number, number][]
) {
  if (
    coordinates.some((point) =>
      isPointInsidePolygon(point, AFFECTED_ZONE)
    )
  ) {
    return true;
  }

  return coordinates.some((point, index) => {
    if (index === 0) {
      return false;
    }

    const roadStart = coordinates[index - 1];

    return AFFECTED_ZONE.some((zonePoint, zoneIndex) => {
      const zoneStart =
        AFFECTED_ZONE[
          (zoneIndex + AFFECTED_ZONE.length - 1) %
            AFFECTED_ZONE.length
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
  coordinates: [number, number][]
) {
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let roadIndex = 1; roadIndex < coordinates.length; roadIndex++) {
    const roadStart = coordinates[roadIndex - 1];
    const roadEnd = coordinates[roadIndex];

    for (
      let zoneIndex = 0;
      zoneIndex < AFFECTED_ZONE.length;
      zoneIndex++
    ) {
      const zoneStart = AFFECTED_ZONE[zoneIndex];
      const zoneEnd =
        AFFECTED_ZONE[
          (zoneIndex + 1) % AFFECTED_ZONE.length
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
  coordinates: [number, number][]
): CrisisRoad['status'] {
  if (roadIntersectsAffectedZone(coordinates)) {
    return 'blocked';
  }

  if (
    roadDistanceToAffectedZoneMeters(coordinates) <=
    RISK_DISTANCE_METERS
  ) {
    return 'risk';
  }

  return 'open';
}

/*
 * Load hospitals from OpenStreetMap.
 */
async function loadHospitals(): Promise<Hospital[]> {
  const query = `
[out:json][timeout:25];

(
  node["amenity"="hospital"]["name"](17.64,83.24,17.75,83.34);
  way["amenity"="hospital"]["name"](17.64,83.24,17.75,83.34);
  relation["amenity"="hospital"]["name"](17.64,83.24,17.75,83.34);
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
     * Only keep hospitals that look like major
     * emergency/medical facilities.
     */
    if (!isMajorEmergencyHospital(name)) {
      continue;
    }

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
  return Array.from(
    hospitalsByName.values()
  )
    .sort((first, second) =>
      first.name.localeCompare(second.name)
    )
    .slice(0, 12);
}

/*
 * Load actual road geometry from OpenStreetMap.
 *
 * IMPORTANT:
 * We are requesting the geometry of the roads themselves.
 * We are NOT manually creating latitude/longitude lines.
 */
async function loadCrisisRoads(): Promise<CrisisRoad[]> {
  const query = `
[out:json][timeout:30];

(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"]
    (17.64,83.24,17.75,83.34);
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
      status: classifyRoad(coordinates),
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
  const [hospitals, setHospitals] =
    useState<Hospital[]>(FALLBACK_HOSPITALS);

  const [roads, setRoads] =
    useState<CrisisRoad[]>([]);

  const [loadingHospitals, setLoadingHospitals] =
    useState(true);

  const [loadingRoads, setLoadingRoads] =
    useState(true);

  const [selectedHospital, setSelectedHospital] =
    useState<Hospital | null>(null);

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

    const [originLatitude, originLongitude] =
      NDRF_DISPATCH_ORIGIN;
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
        'primary'
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
            'alternative'
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

        const [
          hospitalResult,
          roadResult,
        ] = await Promise.allSettled([
          loadHospitals(),
          loadCrisisRoads(),
        ]);

        if (cancelled) {
          return;
        }

        if (hospitalResult.status === 'fulfilled') {
          setHospitals(
            hospitalResult.value.length > 0
              ? hospitalResult.value
              : FALLBACK_HOSPITALS
          );
        } else {
          console.error(
            'Nirnay hospital data loading failed:',
            hospitalResult.reason
          );
          setHospitals(FALLBACK_HOSPITALS);
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
  }, []);

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
        center={VISAKHAPATNAM_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px',
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ============================================= */}
        {/* SIMULATED FLOOD / AFFECTED ZONE               */}
        {/* ============================================= */}

        <Polygon
          positions={AFFECTED_ZONE}
          pathOptions={{
            color: '#ff3b30',
            weight: 2,
            fillColor: '#ff3b30',
            fillOpacity: 0.15,
          }}
        >
          <Tooltip sticky>
            Nirnay simulated flood / affected
            zone
          </Tooltip>

          <Popup>
            <strong>
              Nirnay Affected Zone
            </strong>

            <br />
            <br />

            Scenario layer for the MVP.

            <br />

            This is not an official
            government flood boundary.
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
          center={NDRF_DISPATCH_ORIGIN}
          radius={8}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#00d9ff',
            fillOpacity: 1,
            weight: 2,
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
        {/* REAL OSM HOSPITALS                            */}
        {/* ============================================= */}

        {hospitals.map((hospital) => {
        const isSelected = selectedHospital?.id === hospital.id;

        return (
          <CircleMarker
            key={hospital.id}
            center={hospital.coordinates}
            radius={isSelected ? 10 : 7}
            eventHandlers={{
              click: () => {
                console.log('Nirnay hospital selected:', hospital.name);
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
              <strong>
                🏥 {hospital.name}
              </strong>

              <br />

              {isSelected
                ? 'SELECTED FOR EMERGENCY DISPATCH'
                : 'CLICK TO SELECT'}
            </Tooltip>

            <Popup>
              <div
                style={{
                  minWidth: '220px',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                <strong>
                  🏥 {hospital.name}
                </strong>

                <br />
                <br />

                <strong>Emergency Resource</strong>

                <br />

                Operational status:{' '}
                <strong>UNVERIFIED</strong>

                <br />

                Source: OpenStreetMap

                <hr />

                <strong style={{ color: '#0099cc' }}>
                  RESPONSE UNIT
                </strong>

                <br />
                <br />

                Unit:{' '}
                <strong>NDRF-WEST-01</strong>

                <br />

                Status:{' '}
                <strong>READY</strong>

                <br />

                Dispatch origin:{' '}
                <strong>SIMULATED</strong>

                <br />
                <br />

                <button
                  type="button"
                  onClick={() => {
                    selectHospital(hospital);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #00a8cc',
                    borderRadius: '4px',
                    background: '#00d9ff',
                    color: '#061014',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  SELECT FOR DISPATCH
                </button>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      </MapContainer>

      {selectedHospital && (
        <div
          style={{
            position: 'absolute',
            right: 20,
            bottom: 80,
            zIndex: 2000,
            width: 260,
            background: 'rgba(10,10,12,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            padding: '14px 16px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
            color: '#ffffff',
            fontFamily: 'monospace',
          }}
        >
          <div
            style={{
              color: '#00d9ff',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            RESPONSE UNIT
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            NDRF-WEST-01
          </div>

          <div
            style={{
              color: '#bbbbbb',
              fontSize: 10,
              lineHeight: 1.5,
              marginTop: 6,
            }}
          >
            Simulated emergency-response position
          </div>

          <div
            style={{
              color: '#00d9ff',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginTop: 14,
            }}
          >
            DESTINATION
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.4,
              marginTop: 4,
            }}
          >
            {selectedHospital.name}
          </div>

          <div
            style={{
              color: '#bbbbbb',
              fontSize: 10,
              lineHeight: 1.5,
              marginTop: 6,
            }}
          >
            {selectedHospital.coordinates[0].toFixed(5)},
            {' '}
            {selectedHospital.coordinates[1].toFixed(5)}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 14,
            }}
          >
            <button
              type="button"
              onClick={calculateRoute}
              disabled={routeState === 'loading'}
              style={{
                flex: 1,
                border: '1px solid #00d9ff',
                borderRadius: 4,
                background: '#00d9ff',
                color: '#061014',
                cursor:
                  routeState === 'loading'
                    ? 'wait'
                    : 'pointer',
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 700,
                padding: '8px 6px',
              }}
            >
              CALCULATE ROUTE
            </button>

            <button
              type="button"
              onClick={clearRoute}
              style={{
                flex: 1,
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 4,
                background: 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 700,
                padding: '8px 6px',
              }}
            >
              CLEAR ROUTE
            </button>
          </div>

          {routeState === 'loading' && (
            <div
              style={{
                color: '#00d9ff',
                fontSize: 10,
                marginTop: 12,
              }}
            >
              CALCULATING ROUTE...
            </div>
          )}

          {routeState === 'error' && (
            <div
              style={{
                color: '#ff3b30',
                fontSize: 10,
                marginTop: 12,
              }}
            >
              ROUTE CALCULATION FAILED
            </div>
          )}

          

          <div
            style={{
              color: '#888888',
              fontSize: 9,
              lineHeight: 1.5,
              marginTop: 12,
            }}
          >
            Routing engine does not include Nirnay
            simulated road-status data.
          </div>
        </div>
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
          Visakhapatnam
        </div>

        <div
          style={{
            color: '#00ff99',
            fontSize: 10,
            fontFamily: 'monospace',
            marginTop: 4,
          }}
        >
          REAL-TIME GEOGRAPHIC MAP
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
            Flood / Affected Zone
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
    <div
      style={{
        marginTop: 12,
      }}
    >
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
