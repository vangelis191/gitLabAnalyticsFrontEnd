import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import {
    ColorModeProvider,
    type ColorModeProviderProps,
  } from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter>
        <ColorModeProvider {...props} />
      </BrowserRouter>
    </ChakraProvider>
  );
}; 