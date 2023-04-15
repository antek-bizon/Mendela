const size = 20
const snake = [{ x: size / 2, y: size / 2 }, { x: size / 2 - 1, y: size / 2 - 2 }]
const heading = { x: 1, y: 0 }
let gameOver = false
let genApple = true
let lock = false

function createTable () {
  const main = document.createElement('div')
  main.classList.add('main')
  const table = document.createElement('table')
  for (let i = 0; i < size; i++) {
    const tr = document.createElement('tr')
    for (let j = 0; j < size; j++) {
      const td = document.createElement('td')
      td.id = `${j}_${i}`
      if (i === 0 || j === 0 || i === size - 1 || j === size - 1) {
        td.className = 'wall'
      }
      tr.append(td)
    }
    table.append(tr)
  }
  main.append(table)
  document.body.append(main)
}

function keysHandler () {
  document.body.onkeydown = function (e) {
    // console.log(e.key)
    if (!lock) {
      switch (e.keyCode) {
        case 37: // Key left
          heading.x = -1
          heading.y = 0
          break
        case 38: // Key up
          heading.x = 0
          heading.y = -1
          break
        case 39: // Key right
          heading.x = 1
          heading.y = 0
          break
        case 40: // Key down
          heading.x = 0
          heading.y = 1
          break
      }
    }
  }
}

function setRotation (td, heading) {
  if (heading.x < 0) {
    td.classList.add('rot180')
  } else if (heading.x > 0) {
    td.classList.add('rot0')
  } else if (heading.y > 0) {
    td.classList.add('rot90')
  } else {
    td.classList.add('rot270')
  }
}

function checkPrevPos (snake, heading) {
  if (snake[0].x < snake[2].x && snake[0].y < snake[2].y) {
    if (heading.x < 0) {
      return { x: -1, y: 0 }
    }
    return { x: 1, y: 0 }
  }

  if (snake[0].x > snake[2].x && snake[0].y < snake[2].y) {
    if (heading.y < 0) {
      return { x: 0, y: -1 }
    }
    return { x: 0, y: 1 }
  }

  if (snake[0].x > snake[2].x && snake[0].y > snake[2].y) {
    if (heading.x > 0) {
      return { x: 1, y: 0 }
    }
    return { x: -1, y: 0 }
  }

  if (heading.y > 0) {
    return { x: 0, y: 1 }
  }
  return { x: 0, y: -1 }
}

function updateSnake (snake, heading) {
  const nextPos = { x: snake[0].x + heading.x, y: snake[0].y + heading.y }
  let toDelete = null

  let td = document.getElementById(`${nextPos.x}_${nextPos.y}`)
  if (td.classList.contains('apple')) {
    td.classList.remove('apple')
    genApple = true
  } else if (td.className !== '') {
    gameOver = true
  } else {
    toDelete = snake.pop()
  }

  snake.unshift(nextPos)
  for (let i = 0; i < snake.length; i++) {
    td = document.getElementById(`${snake[i].x}_${snake[i].y}`)
    if (td.innerText === 'X') {
      gameOver = true
    }

    if (i === 0) {
      td.classList.add('snake-head')
      setRotation(td, heading)
    } else if (snake.length > 2 && i === 1) {
      td.className = ''
      if (snake[0].x !== snake[2].x && snake[0].y !== snake[2].y) {
        td.classList.add('snake-rounded')
        const newHeading = checkPrevPos(snake, heading)
        setRotation(td, newHeading)
      } else {
        td.classList.add('snake-straight')
        setRotation(td, heading)
      }
    } else if (i === snake.length - 1) {
      td.className = 'snake-tail'
      const nextElement = { x: snake[snake.length - 2].x - snake[snake.length - 1].x, y: snake[snake.length - 2].y - snake[snake.length - 1].y }
      setRotation(td, nextElement)
    }
  }

  if (toDelete != null) {
    td = document.getElementById(`${toDelete.x}_${toDelete.y}`)
    td.className = ''
  }
}

function generateApple () {
  while (genApple) {
    const x = 1 + Math.round(Math.random() * (size - 3))
    const y = 1 + Math.round(Math.random() * (size - 3))
    const td = document.getElementById(`${x}_${y}`)
    if (!td.classList.contains('snake') && !td.classList.contains('wall')) {
      td.classList.add('apple')
      genApple = false
    }
  }
}

createTable()
keysHandler()
const game = setInterval(function () {
  lock = true
  updateSnake(snake, heading)
  lock = false
  generateApple()
  if (gameOver) {
    clearInterval(game)
    window.alert('Game over')
  }
}, 300)
