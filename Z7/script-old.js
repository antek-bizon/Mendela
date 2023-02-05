const width = Math.min(window.innerWidth, 1000)
const height = width * (400 / 700)
const laps = 5
const players = []
// const imgs = document.querySelectorAll('img')
const imgWidth = 50
const imgHeight = 30
const speedway = document.getElementById('speedway')
const playerCanvas = document.getElementById('player-canvas')
const ctx = speedway.getContext('2d')
const playerCtx = playerCanvas.getContext('2d')
speedway.width = width
speedway.height = height
playerCanvas.width = width
playerCanvas.height = height

let loop
let currentControl = 0

class Player {
  static angleSpeed = Math.PI * 0.03
  laps = 0
  turn = 0
  inRace = true
  image = new Image(imgWidth, imgHeight)

  speedVector = {
    val: 5,
    angle: Math.PI * 0.5
  }

  constructor (posX, posY, color, nr) {
    this.nr = nr
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

    switch (nr) {
      case 1:
        this.keyLeft = 'KeyA'
        this.keyRight = 'KeyD'
        this.image.src = './img/green.png'
        break
      case 2:
        this.keyLeft = 'ArrowLeft'
        this.keyRight = 'ArrowRight'
        this.image.src = './img/red.png'
        break
      case 3:
        this.keyLeft = 'KeyJ'
        this.keyRight = 'KeyL'
        this.image.src = './img/purple.png'
        break
      case 4:
        this.keyLeft = 'Numpad4'
        this.keyRight = 'Numpad6'
        this.image.src = './img/blue.png'
        break
    }

    document.addEventListener('keydown', (e) => {
      // jconsole.log(e.keyCode, this.keyLeft, this.keyRight)
      if (currentControl === this.nr * -1) {
        if (this.keyLeft === e.code) {
          window.alert('Przycisk zajęty!')
        } else {
          this.keyRight = e.code
          this.controlRight.innerText = e.code
          this.controlRight.parentNode.classList.remove('pressed')
          currentControl = 0
        }
      } else if (currentControl === this.nr) {
        if (this.keyRight === e.code) {
          window.alert('Przycisk zajęty!')
        } else {
          this.keyLeft = e.code
          this.controlLeft.innerText = e.code
          this.controlLeft.parentNode.classList.remove('pressed')
          currentControl = 0
        }
      } else {
        switch (e.code) {
          case this.keyLeft:
            this.turn = 1
            break
          case this.keyRight:
            this.turn = 2
            break
          case 32:
            clearInterval(loop)
            break
        }
      }
    })

    document.addEventListener('keyup', (e) => {
      switch (e.code) {
        case this.keyLeft:
          if (this.turn !== 2) {
            this.turn = 0
          }
          break
        case this.keyRight:
          if (this.turn !== 1) {
            this.turn = 0
          }
          break
      }
    })

    document.getElementById(`p${nr}`)
      .innerText = `${nr}`

    this.lapCounter = document.getElementById(`l${nr}`)
    this.lapCounter.innerText = `${laps}`

    this.controlLeft = document.createElement('div')
    this.controlLeft.innerText = this.keyLeft

    this.controlRight = document.createElement('div')
    this.controlRight.innerText = this.keyRight

    const td1 = document.getElementById(`cl${nr}`)
    td1.append(this.controlLeft)

    const td2 = document.getElementById(`cr${nr}`)
    td2.append(this.controlRight)
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
    playerCtx.save()
    playerCtx.translate(this.pos.x, this.pos.y)
    playerCtx.rotate(-this.speedVector.angle + Math.PI / 2)
    playerCtx.translate(0, 0)
    playerCtx.drawImage(this.image, imgWidth / -2, imgHeight / -2, imgWidth, imgHeight)
    console.log(this.nr, ":", this.image)
    playerCtx.restore()
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
          this.lapCounter.innerText = laps - (this.laps / 4)
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
          this.lapCounter.innerText = laps - (this.laps / 4)
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
  const color = fading ? 'rgba(256, 256, 200, 0.07)' : 'rgba(256, 256, 200, 1)'
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 3
  // Outer
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(height / 2, height / 2, height / 2 - 2, Math.PI * 0.5, Math.PI * 1.5)
  ctx.stroke()
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.arc(width - height / 2 - 1, height / 2, height / 2 - 2, Math.PI * 0.5, Math.PI * 1.5, true)
  ctx.stroke()
  ctx.closePath()
  ctx.fill()

  ctx.fillRect(height / 2 - 10, 2, width - height + 10, height - 4)

  drawBorder(ctx, height / 2, 0, width - height / 2, 0)
  drawBorder(ctx, height / 2, height, width - height / 2, height)

  // Inner
  ctx.fillStyle = 'Green'
  ctx.beginPath()
  ctx.arc(height / 2 + 1, height / 2, height / 10, Math.PI * 0.5, Math.PI * 1.5)
  ctx.stroke()
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.arc(width - height / 2 - 1, height / 2, height / 10, Math.PI * 0.5, Math.PI * 1.5, true)
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
  ctx.fillRect(0, 0, width, height)

  drawRoad(ctx, false)
}

function startGame () {
  if (players.length < 2) {
    window.alert('More players are required')
    return
  }

  loop = setInterval(() => {
    playerCtx.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
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
  }, 30)
}

function addPlayer (nr) {
  const color = {
    r: 100,
    g: 200,
    b: 150
  }
  switch (nr) {
    case 2:
      color.r = 200
      color.g = 0
      color.b = 50
      break
    case 3:
      color.r = 200
      color.g = 0
      color.b = 200
      break
    case 4:
      color.r = 0
      color.g = 200
      color.b = 200
      break
  }
  players.push(new Player(width / 2 - 10, height * 0.75, color, nr))
}

if (speedway.getContext) {
  if (playerCanvas.getContext) {
    playerCanvas.onclick = startGame
    initGame(ctx)
  }
}

function changeControls (nr, div) {
  if (currentControl === nr) {
    currentControl = 0
    div.classList.remove('pressed')
  } else if (currentControl === 0) {
    currentControl = nr
    div.classList.add('pressed')
  }
}
