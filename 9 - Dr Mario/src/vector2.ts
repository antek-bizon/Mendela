/**
 * Interface for holding x and y
 */
interface IVector2 {
  x: number
  y: number
}

/**
 * Class implementing IVector2.
 *
 * It contains helper functions for calculating.
 */

export default class Vector2 implements IVector2 {
  x: number
  y: number
  constructor (x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  /**
   * Vector pointing downwards.
   *
   * @returns Vector2{ x: 0, y: 1 }.
   */
  static down (): Vector2 {
    return new Vector2(0, 1)
  }

  /**
   * Vector pointing right.
   *
   * @returns Vector2{ x: 1, y: 0 }.
   */
  static right (): Vector2 {
    return new Vector2(1, 0)
  }

  /**
   * Vector pointing left.
   *
   * @returns Vector2{ x: -1, y: 0 }.
   */
  static left (): Vector2 {
    return new Vector2(-1, 0)
  }

  /**
   * Add two vectors together.
   *
   * @param vec1 first vector.
   * @param vec2 second vector.
   * @returns sum of vectors.
   */
  static addVec (vec1: Vector2, vec2: Vector2): Vector2 {
    return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y)
  }

  /**
   * Adds x and y to exisiting vector.
   *
   * @param x value to add to the x field of a vector.
   * @param y value to add to the y field of a vector.
   */
  add (x: number, y: number): void {
    this.x += x
    this.y += y
  }

  /**
   * Adds passed vector to exisiting vector.
   *
   * @param vector vector to add to existing vector.
   */
  addVec (vector: Vector2): void {
    this.x += vector.x
    this.y += vector.y
  }

  /**
   * Subtracts x and y from exisiting vector.
   *
   * @param x value to subtract from x field of a vector.
   * @param y value to subtract from y field of a vector.
   */
  subtract (x: number, y: number): void {
    this.x -= x
    this.y -= y
  }

  /**
   * Subtract exisiting vector from the given vector
   *
   * @param vector vector from with you want to take values
   */
  subtractVec (vector: Vector2): void {
    this.x -= vector.x
    this.y -= vector.y
  }

  /**
   * Check if the vector is outside a board.
   *
   * @param width width of a board.
   * @returns true if is out of a board and false if is inside it.
   */
  outOfBoard (width: number): boolean {
    if (this.x < 0 || this.x >= width) {
      return true
    }

    return false
  }
}
