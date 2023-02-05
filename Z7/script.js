import { Player } from './player.js'

const width = Math.min(window.innerWidth, 1000)
const height = width * (400 / 700)
Player.width = width
Player.height = height
const players = []
const speedway = document.getElementById('speedway')
const ctx = speedway.getContext('2d')
speedway.width = width
speedway.height = height
const grass = new Image()
grass.src = './img/grass.jpg'
let grassPattern = null
grass.onload = () => {
  grassPattern = ctx.createPattern(grass, 'repeat')
  if (speedway.getContext) {
    speedway.onclick = startGame
    drawRoad(ctx)
  }
}

let loop

function drawBorder (ctx, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.closePath()
}

function drawRoad (ctx, fading) {
  const color = 'rgba(256, 256, 200, 1)'
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 3
  // Outer
  ctx.fillStyle = grassPattern
  ctx.fillRect(0, 0, width, height)
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
  ctx.fillStyle = grassPattern
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

  ctx.fillStyle = grassPattern
  ctx.fillRect(height / 2, height * 0.4, width - height, height * 0.2)

  ctx.lineWidth = 2
  drawBorder(ctx, height / 2, height * 0.4 - 1, width - height / 2, height * 0.4 - 1)
  drawBorder(ctx, height / 2, height * 0.6 + 1, width - height / 2, height * 0.6 + 1)
}

function startGame () {
  if (players.length < 2) {
    window.alert('More players are required')
    return
  }
  Player.dialog.close()

  loop = setInterval(() => {
    ctx.clearRect(0, 0, speedway.width, speedway.height)
    drawRoad(ctx)
    players.forEach((e) => { e.mainLoop(ctx) })
    for (let i = 0; i < players.length; i++) {
      if (!players[i].inRace) {
        players[i].destroy()
        players.splice(i, 1)
        i--
      }
    }
    if (players.length <= 1) {
      clearInterval(loop)
      Player.dialog.children[1].innerText = `Player ${players[0].nr} wins`
      Player.dialog.show()
      players[0].destroy()
      players.length = 0
    }
  }, 30)
}
document.querySelector('button').onclick = startGame

// Add player
const plArr = ['p', 'l']
plArr.forEach((e) => {
  for (let j = 1; j <= 4; j++) {
    const td = document.getElementById(`${e}${j}`)
    td.onclick = function () {
      for (let i = 0; i < players.length; i++) {
        if (players[i].nr === j) {
          return
        }
      }
      const color = {
        r: 100,
        g: 200,
        b: 150
      }
      switch (j) {
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
      players.push(new Player(loop, width / 2 - 10, height * 0.75 + (j - 1) * 20, color, j))
    }
  }
})

// Change controls
const clcrArr = ['cl', 'cr']
clcrArr.forEach((e, i) => {
  for (let j = 1; j <= 4; j++) {
    const neg = i > 0 ? -1 : 1
    document.getElementById(`${e}${j}`).onclick = function () {
      const nr = j * neg
      if (Player.currentControl === nr) {
        Player.currentControl = 0
        this.classList.remove('pressed')
      } else if (Player.currentControl === 0) {
        for (let k = 0; k < players.length; k++) {
          if (players[k].nr === nr) {
            Player.currentControl = nr
            this.classList.add('pressed')
            break
          }
        }
      }
    }
  }
})
