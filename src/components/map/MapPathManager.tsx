'use client';

import { BuildingMap, RouteNode } from '@/classes/BuildingMap';
import Map from '@/components/map/Map';
import PathSelector from '@/components/map/PathSelector';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from 'react';
import FloorToggler from './FloorToggler';

export default function MapPathManager() {
  const [buildingMap, setBuildingMap] = useState<BuildingMap>();
  const [path, setPath] = useState<string[]>([]);
  const [currentFloor, setCurrentFloor] = useState<string>('');
  const [pathNodes, setPathNodes] = useState<RouteNode[]>([]);

  function isBuildingMapLoaded(buildingMap: BuildingMap | undefined): buildingMap is BuildingMap {
    return buildingMap instanceof BuildingMap;
  }

  useEffect(() => {
    if (!isBuildingMapLoaded(buildingMap)) return;

    const getNodeById = (nodeId: string): RouteNode =>
      buildingMap.graph.getNodeAttributes(nodeId) as RouteNode;

    setPathNodes(path.map((nodeId) => getNodeById(nodeId)));
  }, [buildingMap, path]);

  return (
    <Grid container>
      <Grid>
        {isBuildingMapLoaded(buildingMap) ? (
          <PathSelector buildingMap={buildingMap} pathSetter={setPath} />
        ) : (
          <Skeleton width={800} height={100} />
        )}
      </Grid>

      <FloorToggler floorIds={buildingMap?.floorIds ?? []} floorSetter={setCurrentFloor} />

      <Grid>
        <Map buildingMapSetter={setBuildingMap} pathNodes={pathNodes} currentFloor={currentFloor} />
      </Grid>
    </Grid>
  );
}
