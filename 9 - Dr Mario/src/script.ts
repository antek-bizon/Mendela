import Vector2 from './vector2'
import { Segment, Block, Rotation } from './block'
import Animation from './animation'

/**
 * Flag for indicating update operations.
 */
enum Update {
  ADD = 0,
  DELETE,
  ANIMATION
}

enum State {
  PLAYING,
  ANIMATION,
  ADDING
}

/**
 * Flag for indicating tuple fields.
 */
enum SegWithIdDesc {
  SEGMENT = 0,
  ID = 1,
}

/**
 * Tuple holding a block's segment value and a block's id.
 */
type SegWithId = [Segment, number]

/**
 * Main class containing game logic.
 */
class Game {
  static readonly mainDiv: HTMLDivElement = document.createElement('div')
  /** A Game's board width. */
  static boardWidth: number = 8
  /** A Game's board height. */
  static boardHeight: number = 16
  /** A two-dimentional array representing board logically. */
  private readonly board: number[][]
  /** A physical HTML board displayed on a screen. */
  private readonly boardHTML: HTMLTableElement
  /** A map containg blocks. Access to the block is via block's id. */
  private readonly blocks: Map<number, Block> = new Map()
  /** A block that is currently controlled by the player. */
  private elementInControl: Block = {
    id: -1,
    segments: [],
    angle: Rotation.DEG0,
    active: false
  } // need to init with something

  /** A main loop id */
  private loop: number = -1
  /** An id that will be given for the next added block. */
  private nextId = 1
  /** Variables for holding scores. */
  private scoreCounter: number = 0
  private recordCounter: number = 0
  /** A map containg viruses. Access to the virus is via virus's id */
  private readonly viruses: Map<number, Segment> = new Map()
  private virusCount: number = 4
  /** An array that contains all avialable colors in a game. */
  private readonly colors: string[] = ['red', 'blue', 'green']

  private readonly staticAnimations: Animation[]

  private frame = 0

  private buttonDown: boolean = false
  private state: State = State.PLAYING
  private toDelete: Map<Segment, number> = new Map()
  private readonly hand: HTMLDivElement[]
  private nextBlock: Block

  /**
   * Creates a new Game object.
   *
   * @param width sets boardWidth.
   * @param height sets boardHeight.
   */
  constructor () {
    console.log('Game start')
    this.createScoreCounter()
    const [board, boardHTML] = this.createBoard(Game.boardWidth, Game.boardHeight)
    this.board = board
    this.boardHTML = boardHTML
    Game.mainDiv.append(this.boardHTML)
    Game.mainDiv.classList.add('mainDiv', 'spritesheet')
    document.body.append(Game.mainDiv)

    this.staticAnimations = this.createStaticAnimations()
    this.hand = this.createPillHand()
    this.hand.forEach(e => Game.mainDiv.append(e))
    this.nextBlock = this.generateNewBlock()

    this.createVirusCounter()

    this.handleKeys()
  }

  /**
   * Sets control keys.
   */
  private handleKeys (): void {
    document.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyD':
          if (this.buttonDown || this.state !== State.PLAYING) break
          if (this.canMove(this.elementInControl, Vector2.right())) {
            this.move(this.elementInControl, Vector2.right())
          }
          break
        case 'KeyA':
          if (this.buttonDown || this.state !== State.PLAYING) break
          if (this.canMove(this.elementInControl, Vector2.left())) {
            this.move(this.elementInControl, Vector2.left())
          }
          break
        case 'KeyS':
          this.buttonDown = true
          break
        case 'KeyW':
          if (this.buttonDown || this.state !== State.PLAYING) break
          this.rotate(this.elementInControl)
          break
        case 'KeyE':
          if (this.buttonDown || this.state !== State.PLAYING) break
          this.rotate(this.elementInControl, true)
          break
        case 'KeyP':
          clearInterval(this.loop)
          break
        default:
          break
      }
    })
  }

  /**
   * Creates row for a logical board and a physical board.
   *
   * @param width number of cells in the row.
   * @param rowNr which row is created.
   * @returns row for a board and HTML row for a HTML board.
   */
  private createRow (width: number, rowNr: number): [number[], HTMLTableRowElement] {
    const row = new Array(width)
    const rowHTML = document.createElement('tr')
    for (let i = 0; i < width; i++) {
      row[i] = 0
      const cell = document.createElement('td')
      cell.classList.add('cell')
      cell.id = `${i}_${rowNr}`
      rowHTML.append(cell)
    }
    return [row, rowHTML]
  }

  /**
   * Creates a logical and physical board.
   *
   * @param width number of cells in rows.
   * @param height number of rows.
   * @returns a logical and a physical board.
   */
  private createBoard (width: number, height: number): [number[][], HTMLTableElement] {
    const board = new Array(height)
    const boardHTML = document.createElement('table')

    for (let i = 0; i < height; i++) {
      const [row, rowHTML] = this.createRow(width, i)
      board[i] = (row)
      boardHTML.append(rowHTML)
    }

    return [board, boardHTML]
  }

  private createPillHand (): HTMLDivElement[] {
    return [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div')
    ]
  }

  /**
   * Creates a score counter.
   */
  private createScoreCounter (): void {
    const mainDiv = document.createElement('div')

    this.recordCounter = parseInt(window.localStorage.getItem('record') ?? '0')
    this.scoreCounter = 0

    const recordImgs = document.createElement('div')
    recordImgs.id = 'recordImgs'
    const scoreImgs = document.createElement('div')
    scoreImgs.id = 'scoreImgs'

    this.updateScoreDiv(recordImgs, this.recordCounter)
    this.updateScoreDiv(scoreImgs, this.scoreCounter)

    mainDiv.append(recordImgs)
    mainDiv.append(scoreImgs)
    Game.mainDiv.append(mainDiv)
  }

  /**
   * Add zeros before the score for prettier look.
   * @param score the string to with you want to add 0s.
   * @returns score with added zeros.
   */
  private addZerosToScore (score: string, length: number = 7): string {
    const zeros = Array(length - score.length).fill(0).join('') ?? ''
    return zeros + score
  }

  private convertToImages (score: string): HTMLDivElement[] {
    const images = [] as HTMLDivElement[]
    for (let i = 0; i < score.length; i++) {
      const image = document.createElement('div')
      image.style.backgroundPositionX = `${-1155 - parseInt(score[i]) * 24}px`
      image.classList.add('spritesheet', 'letter')
      images.push(image)
    }
    return images
  }

  private updateScoreDiv (div: HTMLDivElement, score: number): void {
    div.innerHTML = ''
    this.convertToImages(this.addZerosToScore(
      score.toString())).forEach(e => {
      div.append(e)
    })
  }

  private createVirusCounter (): void {
    const virusCounter = document.createElement('div')
    virusCounter.id = 'virusCounter'
    this.convertToImages(this.addZerosToScore(this.virusCount.toString(), 2))
      .forEach(e => virusCounter.append(e))

    Game.mainDiv.append(virusCounter)
  }

  private updateVirusCounter (): void {
    this.virusCount--
    const virusCounter = document.getElementById('virusCounter')
    if (virusCounter !== null) {
      virusCounter.innerHTML = ''
      this.convertToImages(this.addZerosToScore(this.virusCount.toString(), 2))
        .forEach(e => virusCounter.append(e))
    }
    if (this.virusCount === 0) {
      this.stageComplete()
    }
  }

  private createStaticAnimations (): Animation[] {
    const animations: Animation[] = [
      {
        size: new Vector2(96, 73),
        offset: 0,
        framesInTotal: 2,
        nextFrameOffset: 96,
        positions: [
          new Vector2(30, 220),
          new Vector2(70, 295),
          new Vector2(120, 230)
        ]
      },
      {
        size: new Vector2(96, 73),
        offset: 384,
        framesInTotal: 2,
        nextFrameOffset: 96,
        positions: [
          new Vector2(120, 230),
          new Vector2(30, 220),
          new Vector2(70, 295)
        ]
      },
      {
        size: new Vector2(96, 73),
        offset: 768,
        framesInTotal: 2,
        nextFrameOffset: 96,
        positions: [
          new Vector2(70, 295),
          new Vector2(120, 230),
          new Vector2(30, 220)
        ]
      }
    ].map((e) => {
      return new Animation(
        Game.mainDiv,
        e.size,
        e.offset,
        e.framesInTotal,
        e.positions,
        e.nextFrameOffset)
    })

    return animations
  }

  /**
   * Choises a random color from a colors array.
   * @returns a string of a random color.
   */
  private randomColor (): string {
    const choice = Math.round(Math.random() * 1000) % 3
    if (choice >= 0 && choice < this.colors.length) {
      return this.colors[choice]
    }

    return 'violet' // It signals something went wrong
  }

  private generateNewBlock (): Block {
    const segments: Segment[] = [
      {
        position: new Vector2(Math.floor(Game.boardWidth / 2) - 1, 0),
        color: this.randomColor(),
        frame: 0,
        frequency: 5,
        numOfFrames: 4
      },
      {
        position: new Vector2(Math.floor(Game.boardWidth / 2), 0),
        color: this.randomColor(),
        frame: 0,
        frequency: 5,
        numOfFrames: 4
      }
    ]

    for (let i = 0; i < segments.length; i++) {
      this.hand[i].className = 'cell'
      this.hand[i].classList.add('spritesheet')
      this.hand[i].classList.add(`pill-hand-${i + 1}`)
      this.hand[i].classList.add(`${segments[i].color}-`)
    }

    this.hand[2].className = 'hand'

    return {
      id: this.nextId,
      segments,
      angle: Rotation.DEG0,
      active: true
    }
  }

  /**
   * Spawns a new block.
   */
  private spawnNewBlock (): void {
    this.buttonDown = false

    this.elementInControl = this.nextBlock

    for (const segment of this.elementInControl.segments) {
      if (this.isCellOccupied(segment.position, 0)) {
        this.gameOver()
        return
      }
    }

    this.blocks.set(this.nextId++, this.elementInControl)
    for (let i = 0; i < this.elementInControl.segments.length; i++) {
      this.hand[i].classList.add(`pill-animation-${i + 1}`)
    }

    this.hand[2].classList.add('hand-animation')

    this.state = State.ADDING

    setTimeout(() => {
      this.state = State.PLAYING
      for (let i = 0; i < this.elementInControl.segments.length; i++) {
        this.updateBoard(Update.ADD,
          this.elementInControl.id,
          this.elementInControl.segments[i].position.x,
          this.elementInControl.segments[i].position.y,
          this.elementInControl.segments[i].color)
        this.nextBlock = this.generateNewBlock()
      }
    }, 1800)
  }

  /**
   * Checks if a cell is occupied.
   *
   * @param nextPos position of a cell to check.
   * @param id id of a block.
   * @returns true if is occupied | false is is free.
   */
  private isCellOccupied (nextPos: Vector2, id: number): boolean {
    const isOccupied = (this.board[nextPos.y][nextPos.x] !== 0 && this.board[nextPos.y][nextPos.x] !== id)
    return isOccupied
  }

  /**
   * Checks if a block is able to move by a given vector.
   *
   * @param e block to check.
   * @param vector vector to which we want to move a block.
   * @returns true if is is possible to move | false if it isn't possible.
   */
  private canMove (e: Block, vector: Vector2): boolean {
    for (const segment of e.segments) {
      const nextPos = Vector2.addVec(segment.position, vector)
      if (nextPos.y >= Game.boardHeight) {
        return false
      }

      if (nextPos.x < 0 || nextPos.x >= Game.boardWidth) {
        return false
      }

      if (this.isCellOccupied(nextPos, e.id)) {
        return false
      }
    }

    return true
  }

  private move (e: Block, vector: Vector2): void {
    for (let i = 0; i < e.segments.length; i++) {
      this.updateBoard(Update.DELETE, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color)
    }

    for (let i = 0; i < e.segments.length; i++) {
      e.segments[i].position.addVec(vector)
      this.updateBoard(Update.ADD, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color)
    }
  }

  private canRotate (e: Block): boolean {
    let freeSpace = true
    for (let i = 0; i < e.segments.length; i++) {
      if (e.segments[i].position.outOfBoard(Game.boardWidth) || this.isCellOccupied(e.segments[i].position, e.id)) {
        freeSpace = false
        break
      }
    }
    if (!freeSpace) {
      const vector = Vector2.left()
      if (this.canMove(e, vector)) {
        for (let i = 0; i < e.segments.length; i++) {
          e.segments[i].position.addVec(vector)
        }
        return true
      } else {
        return false
      }
    }
    return true
  }

  private rotateVector (angle: Rotation, reversed = false): Vector2[] {
    switch (angle) {
      case Rotation.DEG0:
        if (reversed) return [new Vector2(), new Vector2(-1, -1)]

        return [new Vector2(0, -1), new Vector2(-1, 0)]
      case Rotation.DEG90:
        if (reversed) return [new Vector2(0, 1), new Vector2(1, 0)]

        return [new Vector2(1, 1), new Vector2()]
      case Rotation.DEG180:
        if (reversed) return [new Vector2(-1, -1), new Vector2()]

        return [new Vector2(-1, 0), new Vector2(0, -1)]
      case Rotation.DEG270:
        if (reversed) return [new Vector2(1, 0), new Vector2(0, 1)]

        return [new Vector2(), new Vector2(1, 1)]
      default:
        console.error('Incorrect angle: ', angle)
    }
    return [new Vector2(), new Vector2()]
  }

  private nextAngle (angle: Rotation, reversed: boolean): Rotation {
    if (reversed) {
      if (angle === Rotation.DEG0) {
        return Rotation.DEG270
      }
      return angle - 1
    }
    if (angle === Rotation.DEG270) {
      return Rotation.DEG0
    }
    return angle + 1
  }

  private rotate (e: Block, reversed: boolean = false): void {
    for (let i = 0; i < e.segments.length; i++) {
      this.updateBoard(Update.DELETE, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color)
    }

    const moveBy = this.rotateVector(e.angle, reversed)
    const prevAngle = e.angle

    if (e.segments[0].position.y !== 0 /* && e.segments[1].position.y !== 0 */) {
      e.angle = this.nextAngle(e.angle, reversed)
      for (let i = 0; i < e.segments.length; i++) {
        e.segments[i].position.addVec(moveBy[i])
      }
      if (!this.canRotate(e)) {
        e.angle = prevAngle
        for (let i = 0; i < e.segments.length; i++) {
          e.segments[i].position.subtractVec(moveBy[i])
        }
      }
    }

    for (let i = 0; i < e.segments.length; i++) {
      this.updateBoard(Update.ADD, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color)
    }
  }

  private updateBoard (operation: Update, id: number, x: number, y: number, color: string = '', kind: string = ''): void {
    switch (operation) {
      case Update.ADD:
        this.board[y][x] = id
        this.boardHTML.rows[y].cells[x].classList.add('spritesheet')
        if (id > 0) {
          this.boardHTML.rows[y].cells[x].classList.add(`${color}-${kind}`)
        } else {
          this.boardHTML.rows[y].cells[x].classList.add(`virus-${color}`)
        }
        break
      case Update.DELETE:
        this.board[y][x] = 0
        this.boardHTML.rows[y].cells[x].className = 'cell'
        // this.boardHTML.rows[y].cells[x].innerText = ''
        break
      case Update.ANIMATION:
        this.boardHTML.rows[y].cells[x].className = 'cell'
        if (id > 0) {
          this.boardHTML.rows[y].cells[x].classList.add('spritesheet')
          this.boardHTML.rows[y].cells[x].classList.add(`${color}-${kind}`)
        } else {
          this.boardHTML.rows[y].cells[x].classList.add(`virus-${color}`)
        }
        break
      default:
        console.error('Unknown update operation:', operation)
    }
  }

  private eliminateToSmall (toDelete: SegWithId[][]): void {
    for (let i = 0; i < toDelete.length; i++) {
      if (toDelete[i].length < 4) {
        toDelete[i].length = 0
      }
    }
  }

  private resetForNextCheck (toDelete: SegWithId[][], index: number): number {
    if (toDelete[index].length >= 4) {
      toDelete.push([])
      index++
    } else {
      toDelete[index].length = 0
    }
    return index
  }

  private checkRow (y: number): SegWithId[][] {
    const toDelete: SegWithId[][] = []
    toDelete.push([])
    let index = 0

    for (let i = 0; i < Game.boardWidth; i++) {
      if (this.board[y][i] > 0) {
        const block = this.blocks.get(this.board[y][i])
        if (typeof block === 'undefined') continue
        const segIndex = (block.segments[0].position.x === i && block.segments[0].position.y === y) ? 0 : 1
        if (toDelete[index].length > 0 && toDelete[index][0][SegWithIdDesc.SEGMENT].color !== block.segments[segIndex].color) {
          index = this.resetForNextCheck(toDelete, index)
        }
        toDelete[index].push([block.segments[segIndex], block.id])
      } else {
        index = this.resetForNextCheck(toDelete, index)
      }
    }

    this.eliminateToSmall(toDelete)

    return toDelete
  }

  private checkColumn (x: number): SegWithId[][] {
    const toDelete: SegWithId[][] = []
    toDelete.push([])
    let index = 0

    for (let i = 0; i < Game.boardHeight; i++) {
      const id = this.board[i][x]
      if (id > 0) {
        const block = this.blocks.get(id)
        if (typeof block === 'undefined') continue
        const segIndex = (block.segments[0].position.x === x && block.segments[0].position.y === i) ? 0 : 1
        if (toDelete[index].length > 0 && toDelete[index][0][SegWithIdDesc.SEGMENT].color !== block.segments[segIndex].color) {
          index = this.resetForNextCheck(toDelete, index)
        }
        toDelete[index].push([block.segments[segIndex], block.id])
      } else if (id < 0) {
        const virus = this.viruses.get(id)
        if (typeof virus === 'undefined') continue
        if (toDelete[index].length > 0 && toDelete[index][0][SegWithIdDesc.SEGMENT].color !== virus.color) {
          index = this.resetForNextCheck(toDelete, index)
        }
        toDelete[index].push([virus, id])
      } else {
        index = this.resetForNextCheck(toDelete, index)
      }
    }

    this.eliminateToSmall(toDelete)

    return toDelete
  }

  private tryToDestroy (elementToCheck: Block): boolean {
    const toDeleteMap = new Map() as Map<Segment, number>
    for (const segment of elementToCheck.segments) {
      for (const row of this.checkRow(segment.position.y)) {
        for (const [segment, id] of row) {
          toDeleteMap.set(segment, id)
        }
      }
      for (const column of this.checkColumn(segment.position.x)) {
        for (const [segment, id] of column) {
          toDeleteMap.set(segment, id)
        }
      }
    }

    this.toDelete = toDeleteMap

    return toDeleteMap.size > 3
  }

  private destroy (): void {
    const clearMap: Segment[] = []
    this.toDelete.forEach((v, k) => {
      const block = this.blocks.get(v)
      if (typeof block !== 'undefined') {
        const segIndex = (block.segments[0].position.x === k.position.x && block.segments[0].position.y === k.position.y) ? 0 : 1
        const segment = block.segments[segIndex]
        // Animation
        if (segment.frame < segment.numOfFrames * segment.frequency) {
          const frameName = `explosion-${Math.floor(segment.frame / (segment.numOfFrames * segment.frequency))}`
          this.updateBoard(Update.ANIMATION, block.id,
            segment.position.x,
            segment.position.y,
            segment.color,
            frameName
          )
          segment.frame++
        } else { // Delete
          this.updateBoard(Update.DELETE, block.id,
            segment.position.x,
            segment.position.y,
            segment.color)

          block.segments.splice(segIndex, 1)
          clearMap.push(k)
        }
      } else {
        const virus = this.viruses.get(v)
        if (typeof virus !== 'undefined') {
          // Animation
          if (virus.frame < virus.numOfFrames * virus.frequency) {
            virus.frame++
          } else { // Delete
            this.updateBoard(Update.DELETE, v, virus.position.x,
              virus.position.y)
            this.setScore(100)
            this.viruses.delete(v)
            clearMap.push(k)
          }
        }
      }
    })

    clearMap.forEach((e) => {
      if (this.toDelete.get(e) === this.elementInControl.id) {
        this.spawnNewBlock()
      }
      this.toDelete.delete(e)
    })
  }

  private setScore (delta: number): void {
    this.scoreCounter += delta
    const scoreImgs = document.getElementById('scoreImgs') as HTMLDivElement
    this.updateScoreDiv(scoreImgs, this.scoreCounter)
    this.updateVirusCounter()

    if (this.recordCounter < this.scoreCounter) {
      const recordImgs = document.getElementById('recordImgs') as HTMLDivElement
      if (recordImgs !== null) {
        this.recordCounter = this.scoreCounter
        this.updateScoreDiv(recordImgs, this.recordCounter)
      }
      window.localStorage.setItem('record', this.recordCounter.toString())
    }
  }

  private findFreeSpace (): [number, number] {
    const yStart = Math.floor(Math.random() * (Game.boardHeight - 8)) + 5
    const xStart = Math.floor(Math.random() * (Game.boardWidth - 1))

    for (let y = yStart; y >= 0; y--) {
      for (let x = xStart; x >= 0; x--) {
        if (this.board[y][x] === 0) {
          let isSurroundingClear = true
          for (let i = -1; i < 2 && isSurroundingClear; i++) {
            for (let j = -1; j < 2 && isSurroundingClear; j++) {
              if (y + i < 0 || y + i >= Game.boardHeight ||
                x + j < 0 || x + j >= Game.boardWidth) {
                continue
              }
              if (this.board[y + i][x + j] !== 0) {
                isSurroundingClear = false
              }
            }
          }
          if (isSurroundingClear) {
            return [x, y]
          }
        }
      }
    }
    return [-1, -1]
  }

  private spawnVirus (x: number, y: number, virusIndex: number, color: string): void {
    const virusId = (virusIndex + 1) * -1
    const segment: Segment = {
      position: new Vector2(x, y),
      color,
      frame: 0,
      frequency: 5,
      numOfFrames: 4
    }
    this.updateBoard(Update.ADD, virusId, x, y, color)
    this.viruses.set(virusId, segment)
  }

  private generateViruses (): void {
    console.log(this.virusCount)
    for (let i = 0; i < this.virusCount; i++) {
      const [x, y] = this.findFreeSpace()
      const color = this.randomColor()
      if (x > -1 && y > -1) {
        this.spawnVirus(x, y, i, color)
      }
    }
  }

  private stageComplete (): void {
    console.log('stage complete')
    clearInterval(this.loop)
    const dialog = document.createElement('dialog')
    dialog.classList.add('spritesheet')
    dialog.classList.add('dialog')
    dialog.classList.add('stage-complete')
    Game.mainDiv.appendChild(dialog)
    // // @ts-expect-error
    dialog.open = true
  }

  private gameOver (): void {
    console.log('game over')
    clearInterval(this.loop)
    const dialog = document.createElement('dialog')
    dialog.classList.add('spritesheet')
    dialog.classList.add('dialog')
    dialog.classList.add('game-over')
    Game.mainDiv.appendChild(dialog)
    // // @ts-expect-error
    dialog.open = true
  }

  debugPrintBoard (): void {
    for (let i = 0; i < Game.boardHeight; i++) {
      let row = ''
      for (let j = 0; j < Game.boardWidth; j++) {
        row += '|' + this.board[i][j].toString()
      }
      console.log(row)
    }
  }

  mainLoop (): void {
    if (this.loop !== -1) {
      clearInterval(this.loop)
    }

    if (this.elementInControl.id === -1) {
      this.spawnNewBlock()
    }

    this.generateViruses()

    this.loop = setInterval(() => {
      let blockAdded = false

      this.staticAnimations.forEach(e => e.update())

      const keys = this.blocks.keys()
      for (const key of keys) {
        const blockToMove = this.blocks.get(key)
        if (typeof blockToMove === 'undefined') continue
        if (blockToMove.segments.length === 0) {
          this.blocks.delete(key)
          continue
        }

        switch (this.state) {
          case State.PLAYING:
            if (blockToMove.active) {
              if (this.canMove(blockToMove, Vector2.down())) {
                if (blockToMove.id !== this.elementInControl.id || this.frame === 0) {
                  this.move(blockToMove, Vector2.down())
                } else if (blockToMove.id === this.elementInControl.id && this.buttonDown) {
                  this.move(this.elementInControl, Vector2.down())
                }
              } else {
                if (this.tryToDestroy(blockToMove)) {
                  this.state = State.ANIMATION
                  for (const [_, value] of this.blocks) {
                    value.active = true
                  }
                } else {
                  blockToMove.active = false
                  if (blockToMove.id === this.elementInControl.id && !blockAdded) {
                    this.spawnNewBlock()
                    blockAdded = true
                  }
                }
              }
            } else if (blockToMove.id === this.elementInControl.id && !blockAdded) {
              this.spawnNewBlock()
              blockAdded = true
            }
            break
          case State.ANIMATION:
            this.destroy()
            if (this.toDelete.size === 0) {
              this.state = State.PLAYING
            }
            break
          default:
            break
        }
      }
      this.frame = (this.frame + 1) % 5
    }, 100)
  }
}

const game = new Game()
game.mainLoop()
