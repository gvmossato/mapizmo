'use client';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React from 'react';

type FloorTogglerProperties = {
  floorIds: string[];
  floorSetter: (floorId: string) => void;
};

export default function FloorToggler({ floorIds, floorSetter }: FloorTogglerProperties) {
  const [selectedFloor, setSelectedFloor] = React.useState(floorIds[0] ?? '');

  const handleChange = (event: React.MouseEvent<HTMLElement>, nextFloor: string) => {
    console.log('nextFloor', nextFloor);
    setSelectedFloor(nextFloor);
    floorSetter(nextFloor);
  };

  return (
    <ToggleButtonGroup
      exclusive
      color='primary'
      orientation='vertical'
      value={selectedFloor}
      onChange={handleChange}
    >
      {floorIds.map((floorId) => (
        <ToggleButton key={floorId} value={floorId}>
          {floorId}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
