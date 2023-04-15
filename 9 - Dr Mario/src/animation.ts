import Vector2 from './vector2'

export default class Animation {
  static readonly imgSrc = '/spritesheet.png'
  private timeout: number = 0
  private readonly frequency: number = 5
  private frame: number = 0
  private readonly framesInTotal: number
  private readonly size: Vector2
  private readonly div: HTMLDivElement = document.createElement('div')
  private readonly offset: number
  private readonly nextFrameOffset: number
  private readonly positions: Vector2[]
  private positionsIndex: number = 0
  private positionTimeout: number = 0
  private readonly positionChangeFrequency: number = 3 * this.frequency

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
