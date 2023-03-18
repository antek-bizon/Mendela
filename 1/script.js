function br() {
    document.write("<br>")
}

// Zadanie pierwsze
function first() {
    document.write("1.<br>")
    document.write("<strong>Witaj Javascript</strong>");
    br()
    
    for (let i = -22; i < 22; i++) {
        document.write(i + "<br>");
    }

    for (let i = 55; i > -15; i -= 5) {
        document.write(i + " ");
    }

    br()

    for (let i = 40; i >= 10; i--) {
        if(i <= 15 || i >= 25) {
            document.write(i + " ");
        }
    }
    
    br()
    br()
}

// Zadanie drugie
function second() {
    for (let i = -40; i < 40; i++) {
        if (i % 2 == 0) {
            continue
        }

        if (i < 3 || i >= 30) {
            console.log(i)
        }
    }

    for (let i = -20; i < 20; i++) {
        if (i % 2 != 0) {
            continue
        }

        if (i <= 5 || i >= 10) {
            console.log(i)
        }
    }

    for (let i = -100; i < 41; i++) {
        if (i % 7 != 0) {
            continue
        }

        if (i <= -28 || i >= 14) {
            console.log(i)
        }
    }
}

// Zadanie trzecie
function third() {
	let user_data
	do {
		user_data = (prompt("Wprowadź wartość"))
		if (user_data == null) {
			return
		}
		
		user_data = parseInt(user_data)
		
		if (isNaN(user_data) || user_data < 1) {
			window.alert("Nieprawidłowa liczba (spodziewana dodatnia liczba całkowita)")
		} else {
			 if (user_data < 1) {
				user_data = Math.ceil(user_data)
			} else {
				user_data = Math.round(user_data)
			}
			break
		}
	} while (true)

    document.write("3. <br>")
    third_a(user_data)
    third_b(user_data)
    third_c(user_data)
    third_d(user_data)
    third_e(user_data)
    third_f(user_data)
    third_g(user_data)
    third_h(user_data)
    third_i(user_data)
}

function third_a(user_data) {
    document.write("a)<br>")
    for (let i = 0; i < user_data; i++) {
        document.write("X")
    }
    br()
    br()
}

function third_b(user_data) {
    document.write("b)<br>")
    for (let i = 0; i < user_data; i++) {
        for (let j = 0; j < user_data; j++) {
            if (i == 0 || i == (user_data - 1)) {
                document.write("X ")
            } else if (j == 0 || j == (user_data - 1)) {
                document.write("X ")
            } else {
                document.write("&nbsp;&nbsp;")
            }
        }
        br()
    }
    br()
}

function third_c(user_data) {
    document.write("c)<br>")
    for (let i = 1; i < user_data; i++) {
        for (let j = user_data; j >= 1; j--) {
            if (j == 1 || j == i) {
                document.write("X")
            } else {
                document.write("&nbsp;")
            }
        }
        br()
    }

    for (let i = 0; i < user_data; i++) {
        document.write("X")
    }
    br()
    br()
}

function third_d(user_data) {
    document.write("d)<br>")
    for (let i = 1; i <= user_data; i++) {
        for (let j = 1; j <= i; j++) {
            document.write(j)
        }
        br()
    }
    br()
}

function third_e(user_data) {
    document.write("e)<br>")
    for (let i = 1; i <= user_data; i++) {
        for (let j = user_data; j >= 1; j--) {
            if (j <= i) {
                document.write(j)
            } else {
                document.write("&nbsp;")
            }
        }
        br()
    }
    br()
}

function third_f(user_data) {
    document.write("f)<br>")
    let silnia = user_data
    for (let i = 2; i < user_data; i++) {
        silnia *= i
    }
    document.write(silnia)
    br()
}

function third_g(user_data) {
    let suma = 0
    for (let i = 1; i < user_data; i++) {
        suma += i
    }
    document.write(suma)
    br()
}

function third_h(user_data = 0) {
    let is_prime = true
    if (user_data < 2) {
        is_prime = false
    } else {
        for (let i = 2; i < user_data; i++) {
            if (user_data % i == 0) {
                is_prime = false
                break;
            }
        }
    }
    if (is_prime) {
        window.confirm("Jest pierwsza")
    } else {
        window.confirm("Nie jest pierwsza")
    }
    br()
}

function third_i(user_data) {
	document.write("<table>")
    for (let i = 0; i <= 10; i++) {
		document.write("<tr>")
		for (let j = 0; j <= 10; j++) {
			if (i == 0) {
				document.write("<td style=\"background-color: cornflowerblue; color: white;\">")
				if (j != 0) {
					document.write(j)
				}
				document.write("</td>")
			} else if (j == 0) {
				document.write("<td style=\"background-color: cornflowerblue; color: white;\">" + i + "</td>")
			} else if (j == i) {
                document.write("<td>" + (i * j) + "</td>")
            } else {
				document.write("<td style=\"background-color: orange;\">" + (i * j) + "</td>")
			}
		}
		document.write("</tr>")
	}
	document.write("</table>")
}

function forth() {
    do {
		let regon_str = prompt("Podaj numer REGON")
		
		if (regon_str == null) {
			return
		}
		
		if (regon_str.length != 9 && regon_str.length != 14) {
			window.alert("Nie prawidłowa długość numeru regon")
		} else if (isNaN(parseInt(regon_str))){
			window.alert("Podana wartość nie jest liczbą")
		} else {
			break
		}
    } while (true)

    let sum = 0

    if (regon_str.length == 9) { 
        const arr = [8, 9, 2, 3, 4, 5, 6, 7]
        arr.forEach((v, i) => {
            sum += parseInt(regon_str[i]) * v
        })
    } else {
        const arr = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8]
        arr.forEach((v, i) => {
            sum += parseInt(regon_str[i]) * v
        })
    }

    sum = sum % 11

    if (sum == regon_str[regon_str.length - 1]) {
            window.confirm("Regon jest poprawny")
        } else {
            window.confirm("Regon jest niepoprawny")
    }
}