let optionSelected = []
let selectId = null

function submitData (nr, recId) {
  console.log('submit', nr, recId)
  const xhttp = new XMLHttpRequest()
  xhttp.open('POST', 'ajax.php')

  const country = (typeof nr !== 'undefined') ? encodeURIComponent(document.getElementById(`kraje_${nr}`).value) : encodeURIComponent(document.getElementById('kraje').value)
  const alloy = (typeof nr !== 'undefined') ? encodeURIComponent(document.getElementById(`stopy_${nr}`).value) : encodeURIComponent(document.getElementById('stopy').value)
  const denomination = (typeof nr !== 'undefined') ? encodeURIComponent(document.getElementById(`nominal_${nr}`).value) : encodeURIComponent(document.getElementById('nominal').value)
  const cat = (typeof nr !== 'undefined') ? encodeURIComponent(document.getElementById(`kat_${nr}`).value) : encodeURIComponent(document.getElementById('kat').value)
  const year = (typeof nr !== 'undefined') ? encodeURIComponent(document.getElementById(`rok_${nr}`).value) : encodeURIComponent(document.getElementById('rok').value)

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      getData()
    }
  }

  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  const req = (typeof nr !== 'undefined') ? 'update' : 'add'
  xhttp.send(`req=${req}&country=${country}&alloy=${alloy}&den=${denomination}&cat=${cat}&year=${year}&id=${recId}`)
}

function getFlags () {
  const xhttp = new XMLHttpRequest()
  xhttp.open('POST', 'ajax.php')

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const json = JSON.parse(this.responseText)
      updateSelects('kraje', json)
    }
  }

  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  xhttp.send('req=getFlags')
}

function getAlloys () {
  const xhttp = new XMLHttpRequest()
  xhttp.open('POST', 'ajax.php')

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const json = JSON.parse(this.responseText)
      // console.log(json)
      updateSelects('stopy', json)
    }
  }

  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  xhttp.send('req=getAlloys')
}

function getData () {
  const xhttp = new XMLHttpRequest()
  xhttp.open('POST', 'ajax.php')

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const json = JSON.parse(this.responseText)
      updateTable(json)
    }
  }

  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  xhttp.send('req=getData')
}

function deleteData (nr) {
  const xhttp = new XMLHttpRequest()
  xhttp.open('POST', 'ajax.php')
  console.log(nr)
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  xhttp.send(`req=delete&id=${nr}`)
}

function wrapInTd (element) {
  const td = document.createElement('td')
  td.append(element)
  return td
}

function createSubmitBtn (nr, recId) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.onclick = function () {
    submitData(nr, recId)
  }
  const img = document.createElement('img')
  img.src = 'img/faja.png'
  btn.append(img)
  return btn
}

function createDeleteBtn (nr, recId) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.value = recId
  btn.onclick = function () {
    console.log(recId)
    deleteData(recId)
    document.getElementById(`tr_${nr}`).remove()
  }
  const img = document.createElement('img')
  img.src = 'img/u.gif'
  btn.append(img)
  return btn
}

function createSelect (name, id) {
  const select = document.createElement('select')
  select.name = name
  if (id) {
    select.id = id
  }
  return select
}

function updateSelects (selectName, data) {
  const selects = document.getElementsByName(selectName)
  for (let i = 0; i < selects.length; i++) {
    selects[i].innerHTML = ''
    let options = null

    if (selects[i].id !== 'kraje' && selects[i].id !== 'stopy') {
      options = createOptions(data, selectName)
    } else {
      options = createOptions(data)
    }
    options.forEach((e) => {
      selects[i].append(e)
    })
  }
}

function createOptions (data, selectName) {
  const options = []
  let set = false
  for (let i = 0; i < data.length; i++) {
    const option = document.createElement('option')
    const dot = data[i][1].lastIndexOf('.')
    if (dot > -1) {
      const text = data[i][1].substring(0, dot)
      option.innerText = text
    } else {
      option.innerText = data[i][1]
    }
    if (typeof selectName !== 'undefined' && !set) {
      // console.log(option.innerText, optionSelected)
      const nr = (selectName === 'kraje') ? 0 : 3
      if (option.innerText === optionSelected[nr]) {
        option.selected = true
        set = true
      }
    }

    options.push(option)
  }
  return options
}

function createInput (name, id, type, val) {
  const input = document.createElement('input')
  if (!type) {
    input.type = 'text'
  } else {
    input.type = type
  }
  if (id) {
    input.id = id
  }
  if (val) {
    input.value = val
  }
  input.name = name
  return input
}

function modifyRow (nr) {
  // console.log(selectId, nr)
  if (selectId !== null && selectId !== nr) {
    restoreRow(selectId)
  }

  selectId = nr

  const tr = document.getElementById(`tr_${nr}`)
  const vals = []
  for (let i = 0; i < tr.cells.length; i++) {
    const td = tr.cells[i]
    if (i === 0) {
      let src = td.firstChild.attributes.src.value
      src = src.slice(6, src.lastIndexOf('.'))
      vals.push(src)
    } else if (i === tr.cells.length - 1) {
      vals.push(td.cloneNode(true))
    } else {
      vals.push(td.innerText)
    }
  }
  // console.log(vals)
  tr.innerHTML = ''
  optionSelected = vals
  tr.append(wrapInTd(createSelect('kraje', `kraje_${nr}`)))
  tr.append(wrapInTd(createInput('nominal', `nominal_${nr}`, 'text', vals[1])))
  tr.append(wrapInTd(createInput('nr. kat', `kat_${nr}`, 'text', vals[2])))
  tr.append(wrapInTd(createSelect('stopy', `stopy_${nr}`)))
  tr.append(wrapInTd(createInput('rok', `rok_${nr}`, 'number', vals[4])))
  tr.append(wrapInTd(createSubmitBtn(nr, vals[5].firstChild.value)))
  getFlags()
  getAlloys()
}

function restoreRow (nr) {
  const tr = document.getElementById(`tr_${nr}`)
  for (let i = 0; i < tr.cells.length; i++) {
    const td = tr.cells[i]
    td.innerHTML = ''
    if (i === 0) {
      const img = document.createElement('img')
      img.src = `./img/${optionSelected[i]}.jpg`
      img.onclick = function () {
        modifyRow(nr)
      }
      // console.log(img)
      td.append(img)
    } else if (i === tr.cells.length - 1) {
      td.remove()
      // console.log(optionSelected[i])
      tr.append(optionSelected[i])
    } else {
      td.innerText = optionSelected[i]
    }
  }
}

function updateTable (data) {
  const table = document.querySelector('table')
  // console.log(table.rows)
  while (table.rows.length > 1) {
    table.removeChild(table.rows[1])
  }

  for (let i = 0; i < data.length; i++) {
    const tr = document.createElement('tr')
    tr.id = `tr_${i}`

    for (let j = 0; j < data[i].length; j++) {
      const td = document.createElement('td')
      if (j === 0) {
        const img = document.createElement('img')
        img.src = `./img/${data[i][0]}`
        img.onclick = function () {
          modifyRow(i)
        }
        td.append(img)
      } else if (j === data[i].length - 1) {
        td.append(createDeleteBtn(i, data[i][j]))
      } else {
        td.innerText = data[i][j]
      }
      tr.append(td)
    }
    table.append(tr)
  }
}

function init () {
  getFlags()
  getAlloys()
  getData()
  const adding = document.getElementById('add-table')

  adding.append(wrapInTd(createSelect('kraje', 'kraje')))
  adding.append(wrapInTd(createInput('nominal', 'nominal')))
  adding.append(wrapInTd(createInput('nr. kat', 'kat')))
  adding.append(wrapInTd(createSelect('stopy', 'stopy')))
  adding.append(wrapInTd(createInput('rok', 'rok', 'number')))
  adding.append(wrapInTd(createSubmitBtn()))
}
