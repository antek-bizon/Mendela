import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = '10-OX'
  rows: number = 3
  cols: number = 3
  tableData: string[][] = []
  player = 'O'
  computer = (this.player === 'O') ? 'X' : 'O'
  howManyToWin = 3
  playerWins = 0
  computerWins = 0

  ngOnInit (): void {
    const inputRows = document.getElementById('rows') as HTMLInputElement
    if (inputRows !== null) {
      inputRows.value = this.rows.toString()
    }
    const inputCols = document.getElementById('cols') as HTMLInputElement
    if (inputCols !== null) {
      inputCols.value = this.rows.toString()
    }
    const inputWin = document.getElementById('win') as HTMLInputElement
    if (inputWin !== null) {
      inputWin.value = this.howManyToWin.toString()
    }
  }

  startGame (rows: string, cols: string, win: string): void {
    this.rows = parseInt(rows) ?? 0
    this.cols = parseInt(cols) ?? 0
    this.howManyToWin = parseInt(win) ?? 3
    this.generateTable()
  }

  generateTable (): void {
    this.tableData = new Array(this.rows)
    for (let i = 0; i < this.rows; i++) {
      const row = new Array(this.cols)
      for (let j = 0; j < this.cols; j++) {
        row[j] = ''
      }
      this.tableData[i] = row
    }
  }

  makeAMove (row: number, col: number): void {
    if (this.tableData[row][col] !== '') {
      return
    }
    this.tableData[row][col] = this.player
    this.computerMove()
  }

  searchRow (row: number, symbol: string): Move[] {
    const strikes = []
    let currectIndex = -1
    let previes = this.tableData[row][0]

    if (previes === symbol) {
      currectIndex++
      strikes.push({ name: 'row', symbol, size: 1, x: 0, y: row })
    }

    for (let i = 1; i < this.cols; i++) {
      if (this.tableData[row][i] === symbol) {
        console.log('Player')
        if (this.tableData[row][i] === previes) {
          strikes[currectIndex].size++
        } else {
          currectIndex++
          strikes.push({ name: 'row', symbol, size: 1, x: i, y: row })
        }
      }
      previes = this.tableData[row][i]
    }

    return strikes
  }

  searchCol (col: number, symbol: string): Move[] {
    const strikes = []
    let currectIndex = -1
    let previes = this.tableData[0][col]

    if (previes === symbol) {
      currectIndex++
      strikes.push({ name: 'col', symbol, size: 1, x: col, y: 0 })
    }

    for (let i = 1; i < this.rows; i++) {
      if (this.tableData[i][col] === symbol) {
        if (this.tableData[i][col] === previes) {
          strikes[currectIndex].size++
        } else {
          currectIndex++
          strikes.push({ name: 'col', symbol, size: 1, x: col, y: i })
        }
      }
      previes = this.tableData[i][col]
    }

    return strikes
  }

  searchDiagonally (symbol: string = this.player): Move[] {
    const allStrikes = []
    for (let i = this.tableData[0].length - this.howManyToWin; i >= 0; i--) {
      const previes = ''
      const strikes = []
      let currectIndex = -1
      for (let j = 0; j < this.tableData.length && i + j < this.tableData[0].length; j++) {
        if (this.tableData[j][i + j] === symbol) {
          if (previes === symbol) {
            strikes[currectIndex].size++
          } else {
            currectIndex++
            strikes.push({ name: 'dial', symbol, size: 1, x: i + j, y: j })
          }
        }
      }
      allStrikes.push(...strikes)
    }

    for (let i = 1; i < this.tableData.length - this.howManyToWin; i++) {
      const previes = ''
      const strikes = []
      let currectIndex = -1
      for (let j = 0; j < this.tableData[0].length && i + j < this.tableData.length; j++) {
        if (this.tableData[j][i + j] === symbol) {
          if (previes === symbol) {
            strikes[currectIndex].size++
          } else {
            currectIndex++
            strikes.push({ name: 'dial', symbol, size: 1, x: j, y: i + j })
          }
        }
      }
      allStrikes.push(...strikes)
    }

    for (let i = this.howManyToWin; i < this.rows; i++) {
      const previes = ''
      const strikes = []
      let currectIndex = -1
      for (let j = 0; j < this.cols && i - j >= 0; j++) {
        if (this.tableData[i - j][j] === symbol) {
          if (previes === symbol) {
            strikes[currectIndex].size++
          } else {
            currectIndex++
            strikes.push({ name: 'dial', symbol, size: 1, x: j, y: i - j })
          }
        }
      }
      allStrikes.push(...strikes)
    }

    for (let i = 1; i < this.cols; i++) {
      const previes = ''
      const strikes = []
      let currectIndex = -1
      for (let j = this.rows - 1; j >= 0 && this.tableData[0].length - j - 1 + i < this.cols; j--) {
        const colIndex = this.tableData[0].length - j - 1 + i
        if (this.tableData[j][colIndex] === symbol) {
          if (previes === symbol) {
            strikes[currectIndex].size++
          } else {
            currectIndex++
            strikes.push({ name: 'dial', symbol, size: 1, x: colIndex, y: j })
          }
        }
      }
      allStrikes.push(...strikes)
    }

    console.log(allStrikes)

    return allStrikes
  }

  computerMove (): void {
    const moves = new Array<Move>()
    let i = 0
    // Player's moves
    for (let j = 0; j < this.rows; i++, j++) {
      moves.push(...this.searchRow(j, this.player))
    }

    for (let j = 0; j < this.cols; i++, j++) {
      moves.push(...this.searchCol(j, this.player))
    }

    // Computer's moves
    for (let j = 0; j < this.rows; i++, j++) {
      moves.push(...this.searchRow(j, this.computer))
    }

    for (let j = 0; j < this.cols; i++, j++) {
      moves.push(...this.searchCol(j, this.computer))
    }

    moves.push(...this.searchDiagonally())
    moves.push(...this.searchDiagonally(this.computer))

    moves.sort((a, b) => b.size - a.size)

    this.playerWins = 0
    this.computerWins = 0
    for (const bestMove of moves) {
      if (bestMove.size < this.howManyToWin) break
      if (bestMove.symbol === this.player) {
        this.playerWins++
      } else {
        this.computerWins++
      }
    }

    for (const bestMove of moves) {
      switch (bestMove.name) {
        case 'row':
          if (bestMove.size + bestMove.x < this.cols &&
            this.tableData[bestMove.y][bestMove.x + bestMove.size] === '') {
            this.tableData[bestMove.y][bestMove.x + bestMove.size] = this.computer
            return
          } else if (bestMove.x - 1 >= 0 &&
            this.tableData[bestMove.y][bestMove.x - 1] === '') {
            this.tableData[bestMove.y][bestMove.x - 1] = this.computer
            return
          }
          break
        case 'col':
          if (bestMove.size + bestMove.y < this.rows &&
            this.tableData[bestMove.y + bestMove.size][bestMove.x] === '') {
            this.tableData[bestMove.y + bestMove.size][bestMove.x] = this.computer
            return
          } else if (bestMove.y - 1 >= 0 &&
            this.tableData[bestMove.y - 1][bestMove.x] === '') {
            this.tableData[bestMove.y - 1][bestMove.x] = this.computer
            return
          }
          break
      }
    }

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.tableData[i][j] === '') {
          this.tableData[i][j] = this.computer
          return
        }
      }
    }
    console.log('Game over')
  }
}

interface Move {
  name: string
  symbol: string
  size: number
  x: number
  y: number
}
