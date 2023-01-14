const main = {
  first: function () {
    const canvas1 = document.getElementById('canvas1')
    const ctx1 = canvas1.getContext('2d')
    function draw () {
      ctx1.beginPath()
      ctx1.moveTo(100, 100)
      const r = Math.floor(Math.random() * 255)
      const g = Math.floor(Math.random() * 255)
      const b = Math.floor(Math.random() * 255)
      const positionX = Math.floor(Math.random() * 200)
      const positionY = Math.floor(Math.random() * 200)
      ctx1.lineTo(positionX, positionY)
      ctx1.strokeStyle = `rgb(${r}, ${g}, ${b})`
      ctx1.stroke()
    }
    setInterval(draw, 10)
  },
  second: function () {
    const canvas2 = document.getElementById('canvas2')
    const ctx2 = canvas2.getContext('2d')
    let x = null
    let y = null
    let isCursorOn = false
    function coor (event) {
      function draw (e) {
        x = e.pageX - e.originalTarget.offsetLeft
        y = e.pageY
      }

      canvas2.onmousemove = draw
      canvas2.onmouseenter = () => {
        isCursorOn = true
      }
      canvas2.onmouseleave = () => {
        isCursorOn = false
        console.log('halo')
      }

      if (x != null && y != null && isCursorOn) {
        const random = Math.random() * 2
        ctx2.beginPath()
        ctx2.arc(x, y, 35, random * Math.PI, (random + 0.25) * Math.PI)
        ctx2.strokeStyle = 'rgba(100, 000, 255 , 0.4)'
        ctx2.stroke()
      }
    }
    setInterval(coor, 50)
  },
  third: function () {
    const canvas3 = document.getElementById('canvas3')
    const ctx3 = canvas3.getContext('2d')
    const img = document.querySelectorAll('img')
    const speed = Math.round(Math.random() * 2 + 1) * 2
    const pos = { x: canvas3.width / 2, y: canvas3.height / 2 }
    const imgWidth = 100
    const imgHeight = 100
    const imgIndex = Math.round(Math.random() * 2)
    let angle = Math.round(Math.random() * 3) * Math.PI * 0.5 + Math.PI * 0.25
    console.log(angle, angle * 180 / Math.PI)

    setInterval(function () {
      if (pos.y <= 0) {
        pos.y = 1
        if (angle > Math.PI) {
          angle = Math.PI * 1.25
        } else {
          angle = Math.PI * 0.75
        }
      } else if (pos.y + imgHeight >= canvas3.height) {
        pos.y = canvas3.height - imgHeight - 1
        if (angle < Math.PI) {
          angle = Math.PI * 0.25
        } else {
          angle = Math.PI * 1.75
        }
      }

      if (pos.x <= 0) {
        pos.x = 1
        if (angle > Math.PI * 1.5) {
          angle = Math.PI * 0.25
        } else {
          angle = Math.PI * 0.75
        }
      } else if (pos.x + imgWidth >= canvas3.width) {
        pos.x = canvas3.width - imgWidth - 1
        if (angle < Math.PI / 2) {
          angle = Math.PI * 1.75
        } else {
          angle = Math.PI * 1.25
        }
      }

      pos.x += Math.sin(angle) * speed
      pos.y -= Math.cos(angle) * speed

      ctx3.clearRect(0, 0, canvas3.width, canvas3.height)
      ctx3.drawImage(img[imgIndex], pos.x, pos.y, imgWidth, imgHeight)
    }, 30)
  },
  all: function () {
    this.first()
    this.second()
    this.third()
  }
}

main.all()
