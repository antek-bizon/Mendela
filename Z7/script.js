const speedway = document.getElementById('speedway')
const width = 700
const height = 400
let loop

class Player {
  static angleSpeed = Math.PI * 0.05

  constructor (posX, posY, color) {
    this.pos = {
      x: posX,
      y: posY
    }

    this.lastPost = {
      x: posX,
      y: posY
    }

    this.speedVector = {
      val: 7,
      angle: 0
    }

    this.turn = 0

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
      clearInterval(loop)
      window.alert('Game over')
    }
  }

  draw (ctx) {
    ctx.beginPath()
    ctx.moveTo(player.lastPost.x, player.lastPost.y)
    ctx.lineTo(player.pos.x, player.pos.y)
    ctx.strokeStyle = `rgb(${player.color.r}, ${player.color.g}, ${player.color.b})`
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

  mainLoop (ctx) {
    this.move()
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

const player = new Player(100, height / 2, { r: 100, g: 200, b: 150 })

if (speedway.getContext) {
  const ctx = speedway.getContext('2d')

  initGame(ctx)

  loop = setInterval(() => {
    // Draw
    player.mainLoop(ctx)
    drawRoad(ctx, true)
  }, 50)
}
