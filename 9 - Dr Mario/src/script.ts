import Vector2 from './vector2'
import { Segment, Block, Rotation } from './block'
import Animation from './animation'

/**
 * Flag for indicating update operations.
 */
enum Update {
  ADD = 0,
  DELETE
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
  static boardHeight: number = 15
  /** A two-dimentional array representing board logically. */
  private readonly board: number[][]
  /** A physical HTML board displayed on a screen. */
  private readonly boardHTML: HTMLTableElement
  /** A map containg blocks. Access to the block is via block's id. */
  private readonly blocks: Map<number, Block> = new Map()
  /** A block that is currently controlled by the player. */
  private elementInControl: Block = { id: -1, segments: [], angle: Rotation.DEG0, active: false } // need to init with something
  /** A main loop id */
  private loop: number = -1
  /** An id that will be given for the next added block. */
  private nextId = 1
  /** Variables for holding scores. */
  private scoreCounter: number = 0
  private recordCounter: number = 0
  /** A map containg viruses. Access to the virus is via virus's color */
  private readonly viruses: Map<string, Segment> = new Map()
  /** An array that contains all avialable colors in a game. */
  private readonly colors: string[] = ['red', 'blue', 'green']

  private readonly staticAnimations: Animation[]

  private frame = 0

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

    this.handleKeys()
    this.mainLoop()
  }

  /**
   * Sets control keys.
   */
  private handleKeys (): void {
    document.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyD':
          if (this.canMove(this.elementInControl, Vector2.right())) {
            this.move(this.elementInControl, Vector2.right())
          }
          break
        case 'KeyA':
          if (this.canMove(this.elementInControl, Vector2.left())) {
            this.move(this.elementInControl, Vector2.left())
          }
          break
        case 'KeyS':
          if (this.canMove(this.elementInControl, Vector2.down())) {
            this.move(this.elementInControl, Vector2.down())
          }
          break
        case 'KeyW':
          this.rotate(this.elementInControl)
          break
        case 'KeyP':
          clearInterval(this.loop)
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

  /**
   * Creates a score counter.
   */
  private createScoreCounter (): void {
    const mainDiv = document.createElement('div')
    const recordDiv = document.createElement('div')
    recordDiv.innerText = 'Record'
    const scoreDiv = document.createElement('div')
    scoreDiv.innerText = 'Score'

    this.recordCounter = parseInt(window.localStorage.getItem('record') ?? '0')
    this.scoreCounter = 0

    const recordImgs = document.createElement('div')
    recordImgs.id = 'recordImgs'
    const scoreImgs = document.createElement('div')
    scoreImgs.id = 'scoreImgs'

    this.updateScoreDiv(recordImgs, this.recordCounter)
    this.updateScoreDiv(scoreImgs, this.scoreCounter)

    recordDiv.append(recordImgs)
    scoreDiv.append(scoreImgs)
    mainDiv.append(recordDiv)
    mainDiv.append(scoreDiv)
    Game.mainDiv.append(mainDiv)
  }

  /**
   * Add zeros before the score for prettier look.
   * @param score the string to with you want to add 0s.
   * @returns score with added zeros.
   */
  private addZerosToScore (score: string): string {
    const zeros = Array(7 - score.length).fill(0).join('') ?? ''
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

  /**
   * Spawns a new block.
   */
  private spawnNewBlock (): void {
    const segments: Segment[] = [
      { position: new Vector2(Math.floor(Game.boardWidth / 2) - 1, 0), color: this.randomColor() },
      { position: new Vector2(Math.floor(Game.boardWidth / 2), 0), color: this.randomColor() }
    ]
    for (const segment of segments) {
      if (this.isCellOccupied(segment.position, 0)) {
        console.log(segment.position)
        this.gameOver()
        return
      }
    }
    const block: Block = { id: this.nextId, segments, angle: Rotation.DEG0, active: true }
    this.elementInControl = block
    this.blocks.set(this.nextId++, block)
    for (let i = 0; i < block.segments.length; i++) {
      this.updateBoard(Update.ADD, block.id, block.segments[i].position.x, block.segments[i].position.y, block.segments[i].color)
    }
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

  private rotate (e: Block): void {
    for (let i = 0; i < e.segments.length; i++) {
      this.updateBoard(Update.DELETE, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color)
    }

    switch (e.angle) {
      case Rotation.DEG0:
        e.angle += 1
        e.segments[0].position.add(0, -1)
        e.segments[1].position.add(-1, 0)
        break
      case Rotation.DEG90:
        e.angle += 1
        e.segments[0].position.add(1, 1)
        if (e.segments[0].position.outOfBoard(Game.boardWidth) || this.isCellOccupied(e.segments[0].position, e.id)) {
          const vector = Vector2.left()
          if (this.canMove(e, vector)) {
            for (let i = 0; i < e.segments.length; i++) {
              e.segments[i].position.addVec(vector)
            }
          } else {
            e.segments[0].position.subtract(1, 1)
          }
        }
        break
      case Rotation.DEG180:
        e.angle += 1
        e.segments[0].position.add(-1, 0)
        e.segments[1].position.add(0, -1)

        break
      case Rotation.DEG270:
        e.angle = Rotation.DEG0
        e.segments[1].position.add(1, 1)
        if (e.segments[1].position.outOfBoard(Game.boardWidth) || this.isCellOccupied(e.segments[1].position, e.id)) {
          const vector = Vector2.left()
          if (this.canMove(e, vector)) {
            for (let i = 0; i < e.segments.length; i++) {
              e.segments[i].position.addVec(vector)
            }
          } else {
            e.segments[1].position.subtract(1, 1)
          }
        }
        break
      default:
        console.error('Unknow rotation value')
    }

    for (let i = 0; i < e.segments.length; i++) {
      this.updateBoard(Update.ADD, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color)
    }
  }

  private updateBoard (operation: Update, id: number, x: number, y: number, color: string): void {
    switch (operation) {
      case Update.ADD:
        this.board[y][x] = id
        this.boardHTML.rows[y].cells[x].style.backgroundColor = color
        if (id > 0) {
          this.boardHTML.rows[y].cells[x].classList.add('pill')
          this.boardHTML.rows[y].cells[x].innerText = '💊'
        } else {
          this.boardHTML.rows[y].cells[x].classList.add('virus')
          this.boardHTML.rows[y].cells[x].innerText = '🦠'
        }
        break
      case Update.DELETE:
        this.board[y][x] = 0
        this.boardHTML.rows[y].cells[x].style.backgroundColor = ''
        this.boardHTML.rows[y].cells[x].className = 'cell'
        this.boardHTML.rows[y].cells[x].innerText = ''
        break
      default:
        console.error('Unknown update operation')
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
        const color = this.getVirusColorFromId(id)
        const virus = this.viruses.get(color)
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

    toDeleteMap.forEach((v, k) => {
      const block = this.blocks.get(v)
      if (typeof block !== 'undefined') {
        const segIndex = (block.segments[0].position.x === k.position.x && block.segments[0].position.y === k.position.y) ? 0 : 1
        this.updateBoard(Update.DELETE, block.id,
          block.segments[segIndex].position.x,
          block.segments[segIndex].position.y,
          block.segments[segIndex].color)

        block.segments.splice(segIndex, 1)
      } else {
        const color = this.getVirusColorFromId(v)
        const virus = this.viruses.get(color)
        if (typeof virus !== 'undefined') {
          this.updateBoard(Update.DELETE, v, virus.position.x,
            virus.position.y, color)
          this.setScore(100)
          this.viruses.delete(color)
          this.generateViruses()
        }
      }
    })

    return toDeleteMap.size > 3
  }

  private setScore (delta: number): void {
    this.scoreCounter += delta
    const scoreImgs = document.getElementById('scoreImgs') as HTMLDivElement
    this.updateScoreDiv(scoreImgs, this.scoreCounter)

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

  private getVirusColorFromId (id: number): string {
    const index = id * -1 - 1
    return this.colors[index]
  }

  private spawnVirus (x: number, y: number, colorIndex: number): void {
    const virusId = -colorIndex - 1
    const segment: Segment = { position: new Vector2(x, y), color: this.colors[colorIndex] }
    this.updateBoard(Update.ADD, virusId, x, y, this.colors[colorIndex])
    this.viruses.set(this.colors[colorIndex], segment)
  }

  private generateViruses (): void {
    this.colors.forEach((color, i) => {
      if (!this.viruses.has(color)) {
        const [x, y] = this.findFreeSpace()
        if (x > -1 && y > -1) {
          this.spawnVirus(x, y, i)
          console.log(color)
        }
      }
    })
  }

  private gameOver (): void {
    console.log('game over')
    clearInterval(this.loop)
    const dialog = document.createElement('dialog')
    dialog.classList.add('spritesheet')
    dialog.classList.add('dialog')
    Game.mainDiv.appendChild(dialog)
    dialog.open = true
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

        if (blockToMove.active) {
          if (this.canMove(blockToMove, Vector2.down())) {
            if (blockToMove.id !== this.elementInControl.id || this.frame === 0) {
              this.move(blockToMove, Vector2.down())
            }
          } else {
            if (this.tryToDestroy(blockToMove)) {
              for (const [_, value] of this.blocks) {
                value.active = true
              }
            } else {
              blockToMove.active = false
            }
            if (blockToMove.id === this.elementInControl.id && !blockAdded) {
              this.spawnNewBlock()
              blockAdded = true
            }
          }
        } else if (blockToMove.id === this.elementInControl.id && !blockAdded) {
          this.spawnNewBlock()
          blockAdded = true
        }
      }
      this.frame = (this.frame + 1) % 5
    }, 100)
  }
}

const game = new Game()
game.mainLoop()
