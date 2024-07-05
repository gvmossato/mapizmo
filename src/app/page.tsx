'use client';

import ColorSchemeToggler from '@/components/ColorSchemeToggler';
import MapPathManager from '@/components/map/MapPathManager';
import Grid from '@mui/material/Unstable_Grid2';

export default function RootPage() {
  return (
    <main>
      <Grid container>
        <Grid>
          <ColorSchemeToggler />
        </Grid>

        <Grid>
          <MapPathManager />
        </Grid>
      </Grid>
    </main>
  );
}
