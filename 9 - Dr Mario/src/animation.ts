import Vector2 from './vector2'

/**
 * Class for virus' animations.
 */
export default class Animation {
  /** Image source of the animation. */
  static readonly imgSrc = '/spritesheet.png'
  /** Timeout for the animation. */
  private timeout: number = 0
  /** A number of frames to pass for changing the animation. */
  private readonly frequency: number = 7
  /** A current frame. */
  private frame: number = 0
  /** A total number of frames. */
  private readonly framesInTotal: number
  /** A size of the image. */
  private readonly size: Vector2
  /** A div to display animation to. */
  private readonly div: HTMLDivElement = document.createElement('div')
  /** An offset of the image in the spritesheet. */
  private readonly offset: number
  /** An offset of the next frame in the spritesheet. */
  private readonly nextFrameOffset: number
  /** A list of positions to move the div to. */
  private readonly positions: Vector2[]
  /** An index of the position list. */
  private positionsIndex: number = 0
  /** Timeout for changing the position of the div. */
  private positionTimeout: number = 0
  /** A number of frames to pass for changing the animation */
  private readonly positionChangeFrequency: number = 3 * this.frequency

  /**
   * Creates an instance of Animation.
   *
   * @param mainDiv div to append the animation div.
   * @param size a size of the image.
   * @param offset an offset of the image in the spritesheet.
   * @param framesInTotal a total number of frames.
   * @param positions a list of positions to move the div to.
   * @param nextFrameOffset an offset of the next frame in the spritesheet.
   */
  constructor (mainDiv: HTMLDivElement, size: Vector2, offset: number, framesInTotal: number, positions: Vector2[], nextFrameOffset: number = 0) {
    this.size = size
    this.positions = positions
    this.offset = offset
    this.nextFrameOffset = nextFrameOffset
    this.framesInTotal = framesInTotal
    this.div.classList.add('spritesheet')
    this.div.style.width = `${size.x}px`
    this.div.style.height = `${size.y}px`
    this.div.style.backgroundPositionX = `${-offset}px`
    this.div.style.position = 'absolute'
    this.div.style.left = `${positions[0].x}px`
    this.div.style.top = `${positions[0].y}px`
    mainDiv.appendChild(this.div)
  }

  /**
   * Updates the animation.
   */
  update (): void {
    this.timeout = (this.timeout + 1) % this.frequency
    if (this.timeout === 0) {
      if (++this.frame >= this.framesInTotal) {
        this.frame = 0
      }
      const newOffset = this.offset + (this.size.x + this.nextFrameOffset) * this.frame

      this.div.style.backgroundPositionX = `${-newOffset}px`
    }

    this.positionTimeout = (this.positionTimeout + 1) % this.positionChangeFrequency
    if (this.positionTimeout === 0) {
      this.positionsIndex = (this.positionsIndex + 1) % this.positions.length
      this.div.style.left = `${this.positions[this.positionsIndex].x}px`
      this.div.style.top = `${this.positions[this.positionsIndex].y}px`
    }
  }
}
