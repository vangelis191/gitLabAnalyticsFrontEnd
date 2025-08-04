import React from 'react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import {
    ColorModeProvider,
    type ColorModeProviderProps,
  } from "./color-mode"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}



export function Provider(props: ColorModeProviderProps) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ChakraProvider value={defaultSystem}>
        <BrowserRouter>
          <ColorModeProvider {...props} />
        </BrowserRouter>
      </ChakraProvider>
    </ClerkProvider>
  );
}; 