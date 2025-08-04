"use client"

import type { IconButtonProps, SpanProps } from "@chakra-ui/react"
import { ClientOnly, IconButton, Skeleton, Span } from "@chakra-ui/react"
import * as React from "react"
import { LuSun } from "react-icons/lu"

export interface ColorModeProviderProps {
  children: React.ReactNode;
}

export function ColorModeProvider({ children }: ColorModeProviderProps) {
  return <>{children}</>;
}

export function ColorModeIcon() {
  // For now, we'll use a simple approach without hooks
  return <LuSun />
}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  IconButtonProps
>(function ColorModeButton(props, ref) {
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: "5",
            height: "5",
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  )
})

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    )
  },
)
