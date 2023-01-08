const speedway = document.getElementById('speedway')
const ctx = speedway.getContext('2d')

const width = 700
const height = 400
const laps = 5
const players = []
let loop

class Player {
  static angleSpeed = Math.PI * 0.05
  laps = 0
  turn = 0
  inRace = true

  speedVector = {
    val: 7,
    angle: Math.PI * 0.5
  }

  constructor (posX, posY, color, nr) {
    this.pos = {
      x: posX,
      y: posY
    }

    this.lastPost = {
      x: posX,
      y: posY
    }

    this.color = {
      r: color.r,
      g: color.g,
      b: color.b
    }

    document.body.onkeydown = (e) => {
      switch (e.keyCode) {
        case 37:
          this.turn = 1
          break
        case 39:
          this.turn = 2
          break
        case 32:
          clearInterval(loop)
          break
      }
    }

    document.body.onkeyup = (e) => {
      switch (e.keyCode) {
        case 37:
          if (this.turn !== 2) {
            this.turn = 0
          }
          break
        case 39:
          if (this.turn !== 1) {
            this.turn = 0
          }
          break
      }
    }

    this.nr = nr

    document.getElementById(`p${nr}`)
      .innerText = `Player ${nr}`

    this.lapCounter = document.getElementById(`l${nr}`)
    this.lapCounter.innerText = `Laps left: ${laps}`
  }

  move () {
    this.lastPost.x = this.pos.x
    this.lastPost.y = this.pos.y

    if (this.turn === 1) {
      this.speedVector.angle += Player.angleSpeed
    } else if (this.turn === 2) {
      this.speedVector.angle -= Player.angleSpeed
    }

    this.pos.x += Math.sin(this.speedVector.angle) * this.speedVector.val
    this.pos.y += Math.cos(this.speedVector.angle) * this.speedVector.val

    if (this.isCollision()) {
      this.inRace = false
    }
  }

  draw (ctx) {
    ctx.beginPath()
    ctx.moveTo(this.lastPost.x, this.lastPost.y)
    ctx.lineTo(this.pos.x, this.pos.y)
    ctx.strokeStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`
    ctx.stroke()
    ctx.closePath()
  }

  isCollision () {
    if (this.pos.y < 0 || this.pos.y > height || this.pos.x < 0 || this.pos.x > width) {
      console.log('Wyjechanie za mapę')
      return true
    }

    const recX = this.pos.x > height / 2 && this.pos.x < (width - height / 2)

    if (recX && (this.pos.y < height * 0.6 && this.pos.y > height * 0.4)) {
      console.log('Kolizja prostokąty')
      return true
    }

    const x1 = Math.abs(this.pos.x - height / 2) ** 2
    const x2 = Math.abs(this.pos.x - (width - height / 2)) ** 2
    const y = Math.abs(this.pos.y - height / 2) ** 2

    const pit1 = Math.sqrt(x1 + y)
    const pit2 = Math.sqrt(x2 + y)

    if (pit1 < height / 10 || pit2 < height / 10) {
      console.log('Kolizja małe koła')
      return true
    }

    if (pit1 > height / 2 && pit2 > height / 2) {
      if (recX) {
        if ((this.pos.y > 0 && this.pos.y < height * 0.4) || (this.pos.y > 0.6 * height && this.pos.y < height)) { return false }
      }
      console.log('Kolizja duże koła')
      return true
    }
  }

  checkLap () {
    const pointX = width / 2
    const pointY = height / 2
    const lapCase = this.laps % 4

    switch (lapCase) {
      case 0:
        if (this.pos.y > pointY) {
          break
        }

        if (this.pos.x < pointX) {
          this.laps -= 1
        } else {
          this.laps += 1
        }
        break
      case 1:
        if (this.pos.x > pointX) {
          break
        }

        if (this.pos.y > pointY) {
          this.laps -= 1
          this.lapCounter.innerText = `Laps left: ${laps - (this.laps / 4)}`
        } else {
          this.laps += 1
        }
        break
      case 2:
        if (this.pos.y < pointY) {
          break
        }

        if (this.pos.x > pointX) {
          this.laps -= 1
        } else {
          this.laps += 1
        }
        break
      case 3:
        if (this.pos.x < pointX) {
          break
        }

        if (this.pos.y < pointY) {
          this.laps -= 1
        } else {
          this.laps += 1
          this.lapCounter.innerText = `Laps left: ${laps - (this.laps / 4)}`
        }
        break
    }

    if (laps - (this.laps / 4) <= 0) {
      clearInterval(loop)
      window.alert(`Player ${this.nr} wins`)
    }
  }

  mainLoop (ctx) {
    this.move()
    this.checkLap()
    this.draw(ctx)
  }
}

function drawBorder (ctx, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.closePath()
}

function drawRoad (ctx, fading) {
  const color = fading ? 'rgba(256, 256, 200, 0.1)' : 'rgba(256, 256, 200, 1)'
  ctx.lineWidth = 3
  // Outer
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(height / 2, height / 2, height / 2, Math.PI * 0.5, Math.PI * 1.5)
  ctx.stroke()
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.arc(width - height / 2, height / 2, height / 2, Math.PI * 0.5, Math.PI * 1.5, true)
  ctx.stroke()
  ctx.closePath()
  ctx.fill()

  ctx.fillRect(height / 2 - 10, 2, width - height + 10, height - 4)

  drawBorder(ctx, height / 2, 0, width - height / 2, 0)
  drawBorder(ctx, height / 2, height, width - height / 2, height)

  // Inner
  ctx.fillStyle = 'Green'
  ctx.beginPath()
  ctx.arc(height / 2, height / 2, height / 10, Math.PI * 0.5, Math.PI * 1.5)
  ctx.stroke()
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.arc(width - height / 2, height / 2, height / 10, Math.PI * 0.5, Math.PI * 1.5, true)
  ctx.stroke()
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'Green'
  ctx.fillRect(height / 2, height * 0.4, width - height, height * 0.2)

  ctx.lineWidth = 2
  drawBorder(ctx, height / 2, height * 0.4 - 1, width - height / 2, height * 0.4 - 1)
  drawBorder(ctx, height / 2, height * 0.6 + 1, width - height / 2, height * 0.6 + 1)
}

function initGame (ctx) {
  ctx.fillStyle = 'Green'
  ctx.fillRect(0, 0, 700, 400)

  drawRoad(ctx, false)
}

function startGame () {
  if (players.length < 1) {
    window.alert('Select players')
    return
  }

  loop = setInterval(() => {
    players.forEach((e) => { e.mainLoop(ctx) })
    for (let i = 0; i < players.length; i++) {
      if (!players[i].inRace) {
        players.splice(i, 1)
        i--
      }
    }
    if (players.length === 1) {
      window.alert(`Player ${players[0].nr} wins`)
      clearInterval(loop)
    }
    drawRoad(ctx, true)
  }, 50)
}

function addPlayer (nr) {
  players.push(new Player(width / 2 - 10, height * 0.75, { r: 100, g: 200, b: 150 }, nr))
}

if (speedway.getContext) {
  speedway.onclick = startGame
  initGame(ctx)
}
