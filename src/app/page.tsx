'use client';

import ColorSchemeToggler from '@/components/ColorSchemeToggler';
import MapPathManager from '@/components/map/MapPathManager';
import Grid from '@mui/material/Unstable_Grid2';

export default function RootPage() {
  return (
    <main>
      <Grid container rowGap={2} flex={1} flexDirection={'column'}>
        <Grid xs={12} id='nav-bar'>
          <ColorSchemeToggler />
        </Grid>

        <Grid xs={12} flex={1} id='main-content'>
          <MapPathManager />
        </Grid>
      </Grid>
    </main>
  );
}
