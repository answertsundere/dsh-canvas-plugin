import type { FC } from 'react'
import { theme } from '../theme.ts'
export const CanvasTab: FC = () => (
  <div style={{ height: '100%', background: theme.bg, color: theme.text }} data-canvas-root />
)