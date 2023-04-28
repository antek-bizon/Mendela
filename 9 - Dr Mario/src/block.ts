import Vector2 from './vector2'

/**
 * Describes a current rotation of an object.
 */
export enum Rotation {
  DEG0 = 0,
  DEG90,
  DEG180,
  DEG270
}

/**
 * Interface containing position as Vector2 and color as string.
 */
export interface Segment {
  position: Vector2
  color: string
}

/**
 * Interface extending Vector2 with animation fields.
 */
export interface SegmentWithAnimation extends Segment {
  frame: number
  numOfFrames: number
}

/**
 * Interafce containg:
 * - id,
 * - array of segments,
 * - current angle,
 * - flag indicating if a block is active.
 */
export interface Block {
  id: number
  segments: SegmentWithAnimation[]
  angle: Rotation
  active: boolean
}
