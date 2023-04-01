import Vector2 from './vector2'

export enum Rotation {
  DEG0 = 0,
  DEG90,
  DEG180,
  DEG270
}

export interface Segment {
  position: Vector2
  color: string
}

export interface Block {
  id: number
  segments: Segment[]
  angle: Rotation
  active: boolean
}
