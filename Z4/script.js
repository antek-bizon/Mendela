let started = false

function generateGameArray (row, col) {
  const arr = []
  for (let i = 0; i < row; i++) {
    arr[i] = []
    for (let j = 0; j < col; j++) {
      arr[i][j] = 0
    }
  }
  return arr
}

function generateBombs (game, reservedX, reservedY) {
  let numBombs = game.numBombs
  const arr = game.arr
  while (numBombs > 0) {
    const x = Math.floor(Math.random() * game.rows)
    const y = Math.floor(Math.random() * game.cols)

    if (x === reservedX && y === reservedY) continue

    if (arr[x][y] !== -1) {
      arr[x][y] = -1
      numBombs--
      for (let i = (x - 1); i <= (x + 1); i++) {
        for (let j = (y - 1); j <= (y + 1); j++) {
          if (i < 0 || i >= game.rows) continue
          if (j < 0 || j >= game.cols) continue

          if (arr[i][j] !== -1) arr[i][j]++
        }
      }
    }
  }
  return arr
}

function bombsLeftInfo (game, x) {
  const mineNumDiv = document.getElementById('mineNum')
  game.bombsLeft += x
  mineNumDiv.innerText = `Bombs: ${game.bombsLeft}`
}

function searchBlank (game, x, y) {
  const toCheck = []
  let row = x
  let col = y
  let exit = false
  do {
    for (let i = (row - 1); i <= (row + 1); i++) {
      for (let j = (col - 1); j <= (col + 1); j++) {
        if (i < 0 || i >= game.rows) continue
        if (j < 0 || j >= game.cols) continue

        const td = document.getElementById(`row${i}col${j}`)

        if (td.classList.contains('unclicked')) {
          if (td.classList.contains('flag1')) {
            bombsLeftInfo(game, 1)
          }
          td.className = ''
          td.classList.add('clicked')

          if (game.arr[i][j] === 0) {
            let push = true
            toCheck.forEach(e => {
              if (e.x === i && e.y === j) {
                push = false
              }
            })
            if (push) {
              toCheck.push({ x: i, y: j })
            }
          } else {
            td.innerText = game.arr[i][j]
          }
        }
      }
    }

    if (toCheck.length > 0) {
      row = toCheck[0].x
      col = toCheck[0].y
      toCheck.shift()
    } else {
      exit = true
    }
  } while (!exit)
}

function cookies (game) {
  const size = `${game.rows}x${game.cols}`
  const delta = Date.now() - game.startTime
  const nick = window.prompt('Podaj swój nick:')
  const decodedCookie = decodeURIComponent(document.cookie).split('; ')
  let nicksTimes = []
  for (let i = 0; i < decodedCookie.length; i++) {
    const key = decodedCookie[i].split('=')[0]
    if (key === size) {
      const temp = decodedCookie[i].split('=')[1]
      nicksTimes = temp.split(',')
      break
    }
  }

  let pushed = false
  for (let i = 0; i < nicksTimes.length; i++) {
    if (delta < parseInt(nicksTimes[i].split(':')[1])) {
      nicksTimes.splice(i, 0, `${nick}:${delta}`)
      pushed = true
      break
    }
  }

  if (nicksTimes.length >= 10) {
    nicksTimes.length = 10
  } else if (!pushed) {
    nicksTimes.push(`${nick}:${delta}`)
  }

  const cookie = `${size}=${nicksTimes.join(',')}`
  document.cookie = cookie
}

function endGameBox (game, win) {
  const div = document.createElement('div')
  if (win === true) {
    div.classList.add('end-game-box')
    div.classList.add('win')
    div.innerText = '(: You win! Bravo! :)'

    cookies(game)
  } else {
    div.classList.add('end-game-box')
    div.classList.add('defeat')
    div.innerText = '): You lost! :('
  }
  const main = document.getElementsByClassName('main')[0]
  main.appendChild(div)
}

function gameOver (game, win) {
  started = false

  for (let i = 0; i < game.rows; i++) {
    for (let j = 0; j < game.cols; j++) {
      const td = document.getElementById(`row${i}col${j}`)
      td.onclick = null
      td.oncontextmenu = null
      if (game.arr[i][j] === -1 && !td.classList.contains('bomb-explode')) {
        td.className = 'bomb'
      }
    }
  }

  endGameBox(game, win)
}

function checkWin (game) {
  const numOfLeft = document.getElementsByClassName('unclicked').length
  if (numOfLeft <= game.numBombs) {
    const numOfBombsLeft = document.getElementsByClassName('flag1').length
    if (numOfBombsLeft >= game.numBombs) {
      gameOver(game, true)
    }
  }
}

function drawGame (game) {
  const div = document.createElement('div')
  div.className = 'saper'

  const infoDiv = document.createElement('div')
  infoDiv.classList.add('info')

  const mineNumDiv = document.createElement('div')
  mineNumDiv.setAttribute('id', 'mineNum')
  mineNumDiv.innerText = `Bombs: ${game.numBombs}`

  const time = document.createElement('div')
  time.setAttribute('id', 'clock')
  time.innerText = 'Time: 0s'

  infoDiv.appendChild(mineNumDiv)
  infoDiv.appendChild(time)

  const tab = document.createElement('table')
  game.arr.forEach((e, i) => {
    const tr = document.createElement('tr')
    e.forEach((f, j) => {
      const td = document.createElement('td')
      td.setAttribute('id', `row${i}col${j}`)
      td.classList.add('unclicked', 'flag0')
      td.onclick = function () {
        if (!started) {
          game.arr = generateBombs(game, i, j)
          started = true

          game.startTime = Date.now()
          const timer = setInterval(function () {
            if (!started) {
              clearInterval(timer)
            } else {
              const time = document.getElementById('clock')
              const delta = Date.now() - game.startTime
              time.innerText = `Time: ${Math.floor(delta / 1000)}s`
            }
          }, 1000)
        }
        if (this.classList.contains('unclicked')) {
          if (td.classList.contains('flag1')) {
            bombsLeftInfo(game, 1)
          }
          this.className = ''
          this.classList.add('clicked')

          if (game.arr[i][j] === -1) {
            this.classList.add('bomb-explode')
            gameOver(game, false)
          } else {
            if (game.arr[i][j] !== 0) { this.innerText = game.arr[i][j] } else { searchBlank(game, i, j) }

            checkWin(game)
          }
        }
      }
      td.oncontextmenu = function (e) {
        e.preventDefault()
        if (this.classList.contains('flag0')) {
          this.classList.replace('flag0', 'flag1')
          bombsLeftInfo(game, -1)
          if (game.bombsLeft === 0) {
            checkWin(game)
          }
        } else if (this.classList.contains('flag1')) {
          this.classList.replace('flag1', 'flag2')
          bombsLeftInfo(game, 1)
        } else {
          this.classList.replace('flag2', 'flag0')
        }
      }
      tr.appendChild(td)
    })
    tab.appendChild(tr)
  })

  div.append(infoDiv)
  div.append(tab)
  document.body.appendChild(div)
}

function removeOldGame () {
  const endGameBox = document.getElementsByClassName('end-game-box')[0]
  if (endGameBox) {
    document.getElementsByClassName('main')[0].removeChild(endGameBox)
  }
}

function generateBtnOnClick () {
  const width = parseInt(document.getElementsByName('width')[0].value)
  const height = parseInt(document.getElementsByName('height')[0].value)
  const mines = parseInt(document.getElementsByName('mines')[0].value)

  removeOldGame()

  const checkWidth = isNaN(width)
  const checkHeight = isNaN(height)
  const checkMines = isNaN(mines)

  if (!checkWidth && !checkHeight && !checkMines) {
    if (width > 1 && width <= 200 && height > 1 && height <= 200 && mines > 0 && mines <= width * height - 1) {
      const table = document.getElementsByClassName('saper')[0]
      if (table) document.body.removeChild(table)
      const game = {
        arr: generateGameArray(height, width),
        rows: height,
        cols: width,
        numBombs: mines,
        bombsLeft: mines,
        startTime: 0
      }
      started = false
      drawGame(game)
    } else if (width <= 1) {
      window.alert('Width is too small')
    } else if (height <= 1) {
      window.alert('Heigth is too small')
    } else if (mines < 1) {
      window.alert('Too little mines')
    } else if (mines > width * height - 1) {
      window.alert('Too much mines')
    } else if (width > 200) {
      window.alert('Width is to big')
    } else if (height > 200) {
      window.alert('Height is too big')
    }
  } else if (checkWidth) {
    window.alert('Invalid width')
  } else if (checkHeight) {
    window.alert('Invalid height')
  } else if (checkMines) {
    window.alert('Invalid mines')
  }
}

function addPattern () {
  const pattern = document.createElement('div')
  pattern.className = 'pattern'
  const container = document.createElement('div')
  container.className = 'container'
  const patternInner = document.createElement('div')
  patternInner.className = 'pattern-inner'

  container.appendChild(patternInner)
  pattern.appendChild(container)
  document.body.appendChild(pattern)
}

function drawForm () {
  addPattern()
  const mainDiv = document.createElement('div')
  mainDiv.className = 'main'
  const text = ['Height', 'Width', 'Mines']
  text.forEach((e, i) => {
    const div = document.createElement('div')
    div.append(e)
    const input = document.createElement('input')
    input.setAttribute('name', e.toLowerCase())
    div.append(input)
    mainDiv.append(div)
  })

  const btn = document.createElement('button')
  btn.innerText = 'Generate'
  btn.onclick = generateBtnOnClick
  mainDiv.append(btn)
  document.body.appendChild(mainDiv)
}

drawForm()
