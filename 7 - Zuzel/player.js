export class Player {
  static width = Math.min(window.innerWidth, 1000)
  static height = Player.width * (400 / 700)
  static imgWidth = 50
  static imgHeight = 30
  static angleSpeed = Math.PI * 0.03
  static laps = 5
  static dialog = document.querySelector('dialog')
  static currentControl = 0

  laps = 0
  turn = 0
  inRace = true
  image = new Image(Player.imgWidth, Player.imgHeight)

  speedVector = {
    val: 5,
    angle: Math.PI * 0.5
  }

  constructor (loop, posX, posY, color, nr) {
    this.loop = loop
    this.nr = nr
    this.pos = {
      x: posX,
      y: posY
    }

    this.lastPost = {
      x: [posX],
      y: [posY]
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
      if (Player.currentControl === this.nr * -1) {
        if (this.keyLeft === e.code) {
          window.alert('Przycisk zajęty!')
        } else {
          this.keyRight = e.code
          this.controlRight.innerText = e.code
          this.controlRight.parentNode.classList.remove('pressed')
          Player.currentControl = 0
        }
      } else if (Player.currentControl === this.nr) {
        if (this.keyRight === e.code) {
          window.alert('Przycisk zajęty!')
        } else {
          this.keyLeft = e.code
          this.controlLeft.innerText = e.code
          this.controlLeft.parentNode.classList.remove('pressed')
          Player.currentControl = 0
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
            clearInterval(this.loop)
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
    this.lapCounter.innerText = `${Player.laps}`

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
    this.lastPost.x.unshift(this.pos.x)
    this.lastPost.y.unshift(this.pos.y)

    if (this.lastPost.x.length > 50) {
      this.lastPost.x.length = 50
    }

    if (this.lastPost.y.length > 50) {
      this.lastPost.y.length = 50
    }

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
    // Line
    ctx.strokeStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.pos.x, this.pos.y)
    for (let i = 0; i < this.lastPost.x.length; i++) {
      ctx.lineTo(this.lastPost.x[i], this.lastPost.y[i])
      const alpha = (this.lastPost.x.length - i) / this.lastPost.x.length
      ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`
      ctx.stroke()
    }
    ctx.closePath()

    // Image
    ctx.save()
    ctx.translate(this.pos.x, this.pos.y)
    ctx.rotate(-this.speedVector.angle + Math.PI / 2)
    ctx.translate(0, 0)
    ctx.drawImage(this.image, Player.imgWidth / -2, Player.imgHeight / -2, Player.imgWidth, Player.imgHeight)
    ctx.restore()
  }

  isCollision () {
    if (this.pos.y < 0 || this.pos.y > Player.height || this.pos.x < 0 || this.pos.x > Player.width) {
      return true
    }

    const recX = this.pos.x > Player.height / 2 && this.pos.x < (Player.width - Player.height / 2)

    if (recX && (this.pos.y < Player.height * 0.6 && this.pos.y > Player.height * 0.4)) {
      return true
    }

    const x1 = Math.abs(this.pos.x - Player.height / 2) ** 2
    const x2 = Math.abs(this.pos.x - (Player.width - Player.height / 2)) ** 2
    const y = Math.abs(this.pos.y - Player.height / 2) ** 2

    const pit1 = Math.sqrt(x1 + y)
    const pit2 = Math.sqrt(x2 + y)

    if (pit1 < Player.height / 10 || pit2 < Player.height / 10) {
      return true
    }

    if (pit1 > Player.height / 2 && pit2 > Player.height / 2) {
      if (recX) {
        if ((this.pos.y > 0 && this.pos.y < Player.height * 0.4) || (this.pos.y > 0.6 * Player.height && this.pos.y < Player.height)) { return false }
      }
      return true
    }
  }

  checkLap () {
    const pointX = Player.width / 2
    const pointY = Player.height / 2
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
          this.lapCounter.innerText = Player.laps - (this.laps / 4)
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
          this.lapCounter.innerText = Player.laps - (this.laps / 4)
        }
        break
    }

    if (Player.laps - (this.laps / 4) <= 0) {
      clearInterval(this.loop)
      Player.dialog.children[1].innerText = `Player ${this.nr} wins`
      Player.dialog.show()
      this.destroy()
      Player.players.length = 0
    }
  }

  destroy () {
    document.getElementById(`p${this.nr}`)
      .innerText = ''
    this.controlLeft.remove()
    this.controlRight.remove()
    this.lapCounter.innerText = ''
  }

  mainLoop (ctx) {
    this.move()
    this.checkLap()
    this.draw(ctx)
  }
}
