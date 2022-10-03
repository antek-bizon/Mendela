function br () {
  document.write('<br>')
}

function getInput () {
  return 'acccgataggcccttgagtgggaagcagcagtcttgggagatattagttctttccctggagcagccccaaattggcatctatcagacaagactactgcagcagacttcaggcacgaggggtccgggagcacccacaccgtcggtgtattatttcggctcctgggggtaagtacccggaccagacgaaagtctggtaacctaatctcgtctccacttttgtgatggagcgtaccgacgctacagggcatagagatgagaccgcgccacagttcttatcttactcttaattcgtgcgcctataattgtccttcgccgagtgagttgtgctgacagccaccaagtgggtgcgcgacctagcaggtcgaccagtaacatatgagtattcgccctgcacccgggcatatgaacccatcacggtaaccgtgcttcactgcactgtctatgcgcacgccatatcttccggcgcatatccacgcccagcttgttgtcggttagtagctccatataccggtgccaaaaaggctaccagtgttcccgatgcgctcgttataagttcagtagggaggcataatagtaaccgacgcatacagcaccctgagcttatgcttcgttaacaccgttgaaagtctagggaataggcataaaatgttgttgagattgccctatattggtcttgcgttgttagttaacaggatagaggcgcgtccttgagcctctagagtagcgggttcagagtccatgaactacgcaacacgattgactacttcactgtaccagattcgtgagccagggagctagcacgcttggtcgtatatcttcaggtccggccaggacagtcagtacttgtggcggatattcgccatccccttgtccgggtagatcggtccaactgtgctagtctaccagaagcggcggatatgcgtaggcatttaaaggtaccaacgagttcctatcactgtttttcttcgatcggaccccagcagtccattttccggctctttcgcaggtgcctccctacgtcgcgtcgcgaacaaatacctacaggtcctctacgtaatctgtacccacggatgcaatagtttcgttaaccctttagcctacatagtaataactctgacaaaagaaggggttaagtccatgataaatatgtgtatgccaacgcacggcgcaacttttttccgccgagagtactgtttgactatagtgattatgagcgctgcctgacgccatcagatcttttaggtcagggtgtcaaccactggttccagcagttaatgattttaggcgagcgtccgttgcagatgctcccacttggacgggctgcagtgtcggagcggctggggggtcgtccacagagcgacctgtcggcagtataagtaatttctcccaaatacgcagctccttctccccttggtctctaaagctgtcttagcgactttatttcattggagtttagtcagggagtgtaactcgcagtactagacgcgagcctgcgtataagccatcaaactggagagctagctaagggcatctagcgacgcagccattcatctgttccacctcttctggagctaaacaaatattgatccgaacggccctggagactcctactgcgttttttagcttaattgctcgctgtgtgtaacccaattaaatattcagaatacaaccctgtcgacaatgaatcgaccagtaaattcgtaaaaggggatgggatgacgtacctggtcgcttatatagtctccttgccggcttcacggctctctccatctccgttcttaatatcgggtatcggggggccggctgtagagtagacgtgcagagaggcagtgagatgatcatgagaggtagtgtgcaatctagggcctacccgcaccttttgctagtgctaattatgacaacgaaaatggcgacaaaagatctgtggcaggggcctcaaagcggaagcggctagtgaaatctacgactgtgccattataagtcaaactcctcgagcctttagtaacacgtaacaatcattcgggaattccagacgctccatcctgtcttatctttttgagcatatcgctgcctaatacgaatacgtcgtgaatgtcgttg'
  //return prompt('Wprowadź DNA')
}

function makePretty (input) {
  let upperCase = input.toUpperCase()

  let tryglet = []
  for (let i = 0; i < upperCase.length; i += 3) {
    tryglet.push(upperCase.substring(i, i + 3))
  }

  return tryglet
}

function findATGIndexes (tryglet) {
  let atgColor = []

  for (let i = 0; i < tryglet.length; i++) {
    if (tryglet[i] === 'ATG') {
      atgColor.push(i)
    }
  }

  return atgColor
}

function markCodon (tryglet) {
  let indexes = []

  for (let i = 0; i < tryglet.length; i++) {
    const colorString = ['TAA', 'TAG', 'TGA']
    for (let j = 0; j < colorString.length; j++) {
      if (tryglet[i] === colorString[j]) {
        indexes.push(i)
        break
      }
    }
  }

  return indexes
}

function drawPretty (tryglet) {
  let atgIndexes = findATGIndexes(tryglet)
  let indexesOfCodons = markCodon(tryglet)

  for (let i = 0; i < tryglet.length; i++) {
    if (i === indexesOfCodons[0]) {
      indexesOfCodons.shift()
      document.write(
        '<span style="background-color: yellow;">' +
          tryglet[i] +
          '</span>&nbsp;'
      )
    } else if (i === atgIndexes[0]) {
      atgIndexes.shift()
      document.write(
        '<span style="color: green;">' + tryglet[i].bold() + '</span>&nbsp;'
      )
    } else {
      document.write(tryglet[i] + '&nbsp;')
    }
  }
  br()
  br()
}

function getNicKomp (input) {
  let nicKomp = ''

  for (let i = 0; i < input.length; i++) {
    if (input.charAt(i) === 'a') {
      nicKomp += 't'
    } else if (input.charAt(i) === 't') {
      nicKomp += 'a'
    } else if (input.charAt(i) === 'c') {
      nicKomp += 'g'
    } else if (input.charAt(i) === 'g') {
      nicKomp += 'c'
    }
  }

  return nicKomp
}

function drawNicKomp (input) {
  let nicKomp = getNicKomp(input)
  let trygletNiciKomp = makePretty(nicKomp)

  for (let i = 0; i < trygletNiciKomp.length; i++) {
    document.write(trygletNiciKomp[i] + '&nbsp;')
  }
  br()
  document.write(nicKomp)
  br()
  br()
}

function pushToArr (arr, codonName) {
  arr.push(codonName)
  return 1
}

function getColor () {
  let color = ['', '', '']
  color[0] = Math.floor(Math.random() * 256).toString(16)
  color[1] = Math.floor(Math.random() * 256).toString(16)
  color[2] = Math.floor(Math.random() * 256).toString(16)

  let strColor = color[0] + color[1] + color[2]

  for (let j = strColor.length; j < 6; j++) {
    strColor += '0'
  }

  return strColor
}

function drawStats (tryglet) {
  let mapCodons = {}
  let codonNames = []
  tryglet.forEach(e => {
    mapCodons[e] = mapCodons[e] ? mapCodons[e] + 1 : pushToArr(codonNames, e)
  })

  let strColor
  for (let i = 0; codonNames.length > 0; i++) {
    if (i % 5 === 0) {
      strColor = getColor()
    }
    let max = 0
    let str
    codonNames.forEach(e => {
      if (max < mapCodons[e]) {
        max = mapCodons[e]
        str = e
      } else if (max === mapCodons[e]) {
        if (str > e) {
          str = e
        }
      }
    })
    document.write(
      `<span style=\"background-color: #${strColor};\">` +
        str +
        ' - ' +
        mapCodons[str] +
        '</span><br>'
    )
    codonNames = codonNames.filter(name => name != str)
  }
}

function drawStats2 (tryglet) {
  let array = []
  for (let i = 0; i < tryglet.length; i++) {
    let index = -1
    for (let j = 0; j < array.length; j++) {
      if (array[j].name == tryglet[i]) {
        index = j
        break
      }
    }
    if (index > -1) {
      array[index].val++
    } else {
      array.push({ name: tryglet[i], val: 1 })
    }
  }
  console.log(array)
}
