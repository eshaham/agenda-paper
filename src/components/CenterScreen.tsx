import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

const CenterScreen = ({ children, fullHeight, ...rest }: { children: ReactNode, fullHeight?: boolean, [x:string]: any }) => {
  let minHeight;
  if (fullHeight) {
    minHeight = '100vh';
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      minHeight={minHeight}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default CenterScreen;
