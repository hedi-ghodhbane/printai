export interface Palette {
  id: string
  name: string
  colors: string[]
}

/** Palettes with a print-shop temperament: inks on paper. */
export const PALETTES: Palette[] = [
  { id: 'letterpress', name: 'Letterpress', colors: ['#1a1714', '#b5382a', '#c9a24d', '#f4efe6', '#6b6259'] },
  { id: 'sidi-bou', name: 'Sidi Bou Saïd', colors: ['#1f4e79', '#f8f5ef', '#e4b04a', '#7aa6c2', '#2c2c2c'] },
  { id: 'henna', name: 'Henna night', colors: ['#5c1f1f', '#c0392b', '#d4a017', '#f7e7c6', '#3b2412'] },
  { id: 'olive', name: 'Olive grove', colors: ['#4a5a3a', '#8a9a5b', '#e8e2c8', '#c7b27a', '#2e2e2e'] },
  { id: 'majorelle', name: 'Majorelle', colors: ['#2a3fb0', '#f2c14e', '#f7f4ec', '#e0592a', '#1c1c1c'] },
  { id: 'rosewater', name: 'Rosewater', colors: ['#b56576', '#e8c1c5', '#faf3ee', '#6d597a', '#355070'] },
  { id: 'ink', name: 'Ink & paper', colors: ['#111111', '#444444', '#888888', '#dddddd', '#ffffff'] },
  { id: 'sahara', name: 'Sahara', colors: ['#c8873a', '#e9c795', '#fbf4e6', '#7c4a1e', '#3d2b1f'] },
  { id: 'medina', name: 'Medina', colors: ['#0f6b5c', '#e7d7a8', '#f5efe0', '#c2452d', '#1d1d1b'] },
  { id: 'nursery', name: 'Nursery', colors: ['#a9c7dd', '#f3e2a0', '#e7b9c2', '#bfe0cf', '#3a3a3a'] },
]

export const SWATCHES = Array.from(new Set(PALETTES.flatMap((p) => p.colors)))
