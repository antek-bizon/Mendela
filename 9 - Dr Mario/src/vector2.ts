export default class Vector2 {
  x: number
  y: number
  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  static down (): Vector2 {
    return new Vector2(0, 1)
  }

  static right (): Vector2 {
    return new Vector2(1, 0)
  }

  static left (): Vector2 {
    return new Vector2(-1, 0)
  }

  static addVec (vec1: Vector2, vec2: Vector2): Vector2 {
    return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y)
  }

  add (x: number, y: number): void {
    this.x += x
    this.y += y
  }

  addVec (vector: Vector2): void {
    this.x += vector.x
    this.y += vector.y
  }

  subtract (x: number, y: number): void {
    this.x -= x
    this.y -= y
  }

  outOfBoard (width: number): boolean {
    if (this.x < 0 || this.x >= width) {
      return true
    }

    return false
  }
}
