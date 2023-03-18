enum Update {
  ADD = 0,
  DELETE
}

enum Rotation {
  DEG0 = 0,
  DEG90,
  DEG180,
  DEG270
}

class Vector2 {
  x: number
  y: number
  constructor (x, y) {
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

  outOfBoard (): boolean {
    if (this.x < 0 || this.x >= Game.boardWidth) {
      return true
    }

    return false
  }
}

interface Block {
  id: number
  segments: Vector2[]
  colors: string[]
  angle: Rotation
}

class Game {
  static boardWidth
  static boardHeight
  private readonly board: number[]
  private readonly boardHTML: HTMLTableElement
  private readonly blocks: Block[] = []
  private elementInControl: Block
  private loop: number

  constructor (width?: number, height?: number) {
    Game.boardWidth = (typeof width !== 'undefined') ? width : 10
    Game.boardHeight = (typeof height !== 'undefined') ? height : 20
    console.log('Game start')
    const [board, boardHTML] = this.createBoard(Game.boardWidth, Game.boardHeight)
    this.board = board
    this.boardHTML = boardHTML
    document.body.append(this.boardHTML)

    this.handleKeys()
    this.mainLoop()
  }

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

    // document.addEventListener('keyup', (e) => {
    //     switch (e.code) {
    //         case 'KeyA':
    //         case 'KeyD':
    //         case 'KeyS':
    //             this.action = Action.None
    //             break
    //     }
    // })
  }

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

  private createBoard (width: number, height: number): [number[], HTMLTableElement] {
    const board = new Array(height)
    const boardHTML = document.createElement('table')

    for (let i = 0; i < height; i++) {
      const [row, rowHTML] = this.createRow(width, i)
      board[i] = (row)
      boardHTML.append(rowHTML)
    }

    return [board, boardHTML]
  }

  private randomColors (): string[] {
    return ['red', 'blue']
  }

  private spawnNewBlock (): void {
    console.log('spawning new block')
    const segments: Vector2[] = [
      new Vector2(Game.boardWidth / 2, 0),
      new Vector2(Game.boardWidth / 2 + 1, 0)
    ]
    for (const segment of segments) {
      if (this.isCellOccupied(segment, 0)) {
        window.alert('game over')
        clearInterval(this.loop)
        return
      }
    }
    const colors = this.randomColors()
    const id = (this.blocks.length === 0) ? 1 : this.blocks[this.blocks.length - 1].id + 1
    const block: Block = { id, segments, colors, angle: Rotation.DEG0 }
    this.elementInControl = block
    this.blocks.push(block)
    for (let i = 0; i < block.segments.length; i++) {
      this.updateBoard(Update.ADD, block.id, block.segments[i].x, block.segments[i].y, block.colors[i])
    }
  }

  private isCellOccupied (nextPos: Vector2, id: number): boolean {
    const isOccupied = (this.board[nextPos.y][nextPos.x] !== 0 && this.board[nextPos.y][nextPos.x] !== id)
    return isOccupied
  }

  private canMove (e: Block, vector: Vector2): boolean {
    for (const segment of e.segments) {
      const nextPos = Vector2.addVec(segment, vector)
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
      this.updateBoard(Update.DELETE, e.id, e.segments[i].x, e.segments[i].y, e.colors[i])
    }

    for (let i = 0; i < e.segments.length; i++) {
      e.segments[i].addVec(vector)
      this.updateBoard(Update.ADD, e.id, e.segments[i].x, e.segments[i].y, e.colors[i])
    }
  }

  private rotate (e: Block): void {
    for (let i = 0; i < e.segments.length; i++) {
      this.updateBoard(Update.DELETE, e.id, e.segments[i].x, e.segments[i].y, e.colors[i])
    }

    switch (e.angle) {
      case Rotation.DEG0:
        e.angle += 1
        e.segments[0].add(0, -1)
        e.segments[1].add(-1, 0)
        break
      case Rotation.DEG90:
        e.angle += 1
        e.segments[0].add(1, 1)
        if (e.segments[0].outOfBoard() || this.isCellOccupied(e.segments[0], e.id)) {
          const vector = Vector2.left()
          if (this.canMove(e, vector)) {
            for (let i = 0; i < e.segments.length; i++) {
              e.segments[i].addVec(vector)
            }
          } else {
            e.segments[0].subtract(1, 1)
          }
        }
        break
      case Rotation.DEG180:
        e.angle += 1
        e.segments[0].add(-1, 0)
        e.segments[1].add(0, -1)

        break
      case Rotation.DEG270:
        e.angle = Rotation.DEG0
        e.segments[1].add(1, 1)
        if (e.segments[1].outOfBoard() || this.isCellOccupied(e.segments[1], e.id)) {
          const vector = Vector2.left()
          if (this.canMove(e, vector)) {
            for (let i = 0; i < e.segments.length; i++) {
              e.segments[i].addVec(vector)
            }
          } else {
            e.segments[1].subtract(1, 1)
          }
        }
        break
      default:
        console.error('Unknow rotation value')
    }

    for (let i = 0; i < e.segments.length; i++) {
      this.updateBoard(Update.ADD, e.id, e.segments[i].x, e.segments[i].y, e.colors[i])
    }
  }

  private updateBoard (operation: Update, id: number, x: number, y: number, color: string): void {
    switch (operation) {
      case Update.ADD:
        this.board[y][x] = id
        this.boardHTML.rows[y].cells[x].style.backgroundColor = color
        break
      case Update.DELETE:
        this.board[y][x] = 0
        this.boardHTML.rows[y].cells[x].style.backgroundColor = ''
        break
      default:
        console.error('Unknown update operation')
    }
  }

  mainLoop (): void {
    if (this.loop != null) {
      clearInterval(this.loop)
    }

    if (this.elementInControl == null) {
      this.spawnNewBlock()
    }

    this.loop = setInterval(() => {
      if (this.blocks.length > 100) {
        clearInterval(this.loop)
      }

      let blockAdded = false

      for (let i = 0; i < this.blocks.length; i++) {
        const blockToMove = this.blocks[i]
        if (this.canMove(blockToMove, Vector2.down())) {
          this.move(blockToMove, Vector2.down())
        } else {
          if (blockToMove.id === this.elementInControl.id && !blockAdded) {
            this.spawnNewBlock()
            blockAdded = true
          }
        }
      }
    }, 500)
  }
}

const game = new Game()
game.mainLoop()
