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

  outOfBoard (): boolean {
    if (this.x < 0 || this.x >= Game.boardWidth) {
      return true
    }

    return false
  }
}

interface Segment {
  position: Vector2
  color: string
}

interface Block {
  id: number
  segments: Segment[]
  angle: Rotation
}

enum SegWithIdDesc {
  SEGMENT = 0,
  ID = 1
}

type SegWithId = [Segment, number]

class Game {
  static boardWidth
  static boardHeight
  private readonly board: number[]
  private readonly boardHTML: HTMLTableElement
  private readonly blocks: Map<number, Block> = new Map()
  private elementInControl: Block
  private loop: number
  private nextId = 1

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

  private randomColor (): string {
    const choice = Math.round(Math.random() * 1000) % 3
    switch (choice) {
      case 0:
        return 'blue'
      case 1:
        return 'red'
      case 2:
        return 'green'
      default:
        return 'violet' // It signals something went wrong
    }
  }

  private spawnNewBlock (): void {
    console.log('spawning new block')
    const segments: Segment[] = [
      { position: new Vector2(Game.boardWidth / 2, 0), color: this.randomColor() },
      { position: new Vector2(Game.boardWidth / 2 + 1, 0), color: this.randomColor() }
    ]
    for (const segment of segments) {
      if (this.isCellOccupied(segment.position, 0)) {
        window.alert('game over')
        clearInterval(this.loop)
        return
      }
    }
    const block: Block = { id: this.nextId, segments, angle: Rotation.DEG0 }
    this.elementInControl = block
    this.blocks.set(this.nextId++, block)
    for (let i = 0; i < block.segments.length; i++) {
      this.updateBoard(Update.ADD, block.id, block.segments[i].position.x, block.segments[i].position.y, block.segments[i].color)
    }
  }

  private isCellOccupied (nextPos: Vector2, id: number): boolean {
    const isOccupied = (this.board[nextPos.y][nextPos.x] !== 0 && this.board[nextPos.y][nextPos.x] !== id)
    return isOccupied
  }

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
        if (e.segments[0].position.outOfBoard() || this.isCellOccupied(e.segments[0].position, e.id)) {
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
        if (e.segments[1].position.outOfBoard() || this.isCellOccupied(e.segments[1].position, e.id)) {
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
        break
      case Update.DELETE:
        this.board[y][x] = 0
        this.boardHTML.rows[y].cells[x].style.backgroundColor = ''
        break
      default:
        console.error('Unknown update operation')
    }
  }

  eliminateToSmall (toDelete: SegWithId[][]): void {
    for (let i = 0; i < toDelete.length; i++) {
      if (toDelete[i].length < 4) {
        toDelete[i].length = 0
      }
    }
  }

  resetForNextCheck (toDelete: SegWithId[][], index: number): number {
    if (toDelete[index].length >= 4) {
      toDelete.push([])
      index++
    } else {
      console.log('lenght =', toDelete[index].length, index)
      toDelete.forEach((e) => {
        e.forEach((_e) => {
          console.log(_e[0], _e[1])
        })
      })
      toDelete[index].length = 0
    }
    return index
  }

  checkRow (y: number): SegWithId[][] {
    const toDelete: SegWithId[][] = []
    toDelete.push([])
    let index = 0

    for (let i = 0; i < Game.boardWidth; i++) {
      if (this.board[y][i] > 0) {
        const block = this.blocks.get(this.board[y][i])
        if (typeof block === 'undefined') break
        const segIndex = (block.segments[0].position.x === i && block.segments[0].position.y === y) ? 0 : 1
        // console.log(i, y, block, segIndex)
        if (toDelete[index].length > 0 && toDelete[index][0][SegWithIdDesc.SEGMENT].color !== block.segments[segIndex].color) {
          index = this.resetForNextCheck(toDelete, index)
        }
        toDelete[index].push([block.segments[segIndex], block.id])
      } else {
        index = this.resetForNextCheck(toDelete, index)
      }
    }

    console.log('checkRow')
    toDelete.forEach((e) => {
      e.forEach((_e) => {
        console.log(_e[0], _e[1])
      })
    })
    this.eliminateToSmall(toDelete)
    // console.log(toDelete)

    return toDelete
  }

  checkColumn (x: number): SegWithId[][] {
    const toDelete: SegWithId[][] = []
    toDelete.push([])
    let index = 0

    for (let i = 0; i < Game.boardHeight; i++) {
      if (this.board[i][x] > 0) {
        const block = this.blocks.get(this.board[i][x])
        if (typeof block === 'undefined') break
        const segIndex = (block.segments[0].position.x === x && block.segments[0].position.y === i) ? 0 : 1
        if (toDelete[index].length > 0 && toDelete[index][0][SegWithIdDesc.SEGMENT].color !== block.segments[segIndex].color) {
          index = this.resetForNextCheck(toDelete, index)
        }
        toDelete[index].push([block.segments[segIndex], block.id])
      } else {
        index = this.resetForNextCheck(toDelete, index)
      }
    }

    // console.log('checkColumn')
    // toDelete.forEach((e) => {
    //   e.forEach((_e) => {
    //     console.log(_e[0], _e[1])
    //   })
    // })
    this.eliminateToSmall(toDelete)

    return toDelete
  }

  tryToDestroy (): void {
    const toDeleteMap = new Map() as Map<Segment, number>
    for (const segment of this.elementInControl.segments) {
      for (const row of this.checkRow(segment.position.y)) {
        for (const item of row) {
          toDeleteMap.set(item[SegWithIdDesc.SEGMENT], item[SegWithIdDesc.ID])
        }
      }
      for (const column of this.checkColumn(segment.position.x)) {
        for (const item of column) {
          toDeleteMap.set(item[SegWithIdDesc.SEGMENT], item[SegWithIdDesc.ID])
        }
      }
    }

    console.log(toDeleteMap)

    toDeleteMap.forEach((v, k) => {
      const block = this.blocks.get(v)
      if (typeof block !== 'undefined') {
        const segIndex = (block.segments[0].position.x === k.position.x && block.segments[0].position.y === k.position.y) ? 0 : 1
        this.updateBoard(Update.DELETE, block.id,
          block.segments[segIndex].position.x,
          block.segments[segIndex].position.y,
          block.segments[segIndex].color)

        block.segments.splice(segIndex, 1)
      }
    })
  }

  mainLoop (): void {
    if (this.loop != null) {
      clearInterval(this.loop)
    }

    if (this.elementInControl == null) {
      this.spawnNewBlock()
    }

    this.loop = setInterval(() => {
      if (this.blocks.size > 100) {
        clearInterval(this.loop)
      }

      let blockAdded = false

      const keys = this.blocks.keys()
      for (const key of keys) {
        const blockToMove = this.blocks.get(key)
        if (typeof blockToMove === 'undefined') break
        if (blockToMove.segments.length === 0) {
          this.blocks.delete(key)
          break
        }

        if (this.canMove(blockToMove, Vector2.down())) {
          this.move(blockToMove, Vector2.down())
        } else {
          if (blockToMove.id === this.elementInControl.id && !blockAdded) {
            this.tryToDestroy()
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

// Reasumując kwintesencje tematu, dochodzę do fundamentalnej konkluzji:
// Walić OOP, najgorsze ścierwo
