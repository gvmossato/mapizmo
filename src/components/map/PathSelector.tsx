'use client';

import { BuildingMap, Place } from '@/classes/BuildingMap';
import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';

type PathSelectorProperties = {
  buildingMap: BuildingMap;
  pathSetter: React.Dispatch<React.SetStateAction<string[]>>;
};

interface PlaceOption extends Place {
  nodeId: string;
}

export default function PathSelector({ buildingMap, pathSetter: setPath }: PathSelectorProperties) {
  const [sourceNodeId, setSourceNodeId] = useState<string>('ground,228.41,526.27');
  const [targetNodeId, setTargetNodeId] = useState<string>('');
  const [placeOptions, setPlaceOptions] = useState<PlaceOption[]>([]);

  useEffect(() => {
    const getPlaceOptionsFromMap = () =>
      buildingMap.placeNodes.map((node) => ({ nodeId: node.id, ...node.place })) as PlaceOption[];

    setPlaceOptions(getPlaceOptionsFromMap());
  }, [buildingMap]);

  useEffect(() => {
    const updateSelectedPath = () => {
      const path = buildingMap.findBestPath(sourceNodeId, targetNodeId);
      setPath(path);
    };
    updateSelectedPath();
  }, [sourceNodeId, targetNodeId, buildingMap, setPath]);

  const selectors = [
    {
      label: 'De',
      id: 'source',
      value: sourceNodeId,
      setter: setSourceNodeId,
    },
    {
      label: 'Até',
      id: 'target',
      value: targetNodeId,
      setter: setTargetNodeId,
    },
  ];

  const placeSelectorOptions = placeOptions.map((place) => (
    <MenuItem key={place.id} value={place.nodeId}>
      {place.label ?? place.id}
    </MenuItem>
  ));

  return (
    <Grid container spacing={2} id='path-selector'>
      {selectors.map(({ label, id, value, setter }) => (
        <Grid item key={id} xs={6} id={'path-selector-' + id}>
          <FormControl fullWidth>
            <InputLabel id={id + '-select-label'}>{label}</InputLabel>
            <Select
              labelId={id + '-select-label'}
              id={id + '-select'}
              value={value}
              label={label}
              onChange={(event) => setter(event.target.value)}
            >
              {placeSelectorOptions}
            </Select>
          </FormControl>
        </Grid>
      ))}
    </Grid>
  );
}
