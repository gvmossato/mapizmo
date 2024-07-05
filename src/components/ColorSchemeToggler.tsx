import { DarkMode, LightMode } from '@mui/icons-material';
import { Button } from '@mui/material';
import { amber, deepPurple } from '@mui/material/colors';
import { useColorScheme } from '@mui/material/styles';

export default function ColorSchemeToggler() {
  const { mode: colorScheme, setMode: setColorScheme } = useColorScheme();

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      id='color-mode-toggler'
      onClick={toggleColorScheme}
      sx={{
        backgroundColor:
          colorScheme === 'dark' ? `${amber[900]}20 !important` : `${deepPurple[900]}30 !important`,
      }}
    >
      {colorScheme === 'dark' ? (
        <LightMode sx={{ color: amber[500] }} />
      ) : (
        <DarkMode sx={{ color: deepPurple[500] }} />
      )}
    </Button>
  );
}
