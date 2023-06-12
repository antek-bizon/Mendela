import { Component, OnInit } from '@angular/core'
import { MagazineService, Magazine } from './magazine.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = '11-gazetki'
  inputValue: number = 0
  correctValue: number = 333.333
  magazines: Magazine[] = []
  currentTime: number = Date.now()
  clock: NodeJS.Timer
  selectedMagazine: number = -1
  selectedYear: string = ''

  constructor (private readonly _magazineSerive: MagazineService) {
    console.log(this.title)
    this.clock = setInterval(() => {
      this.currentTime = Date.now()
    }, 500)
  }

  ngOnInit (): void {
    this._magazineSerive.fetchData()
      .then((data) => {
        this.magazines = data
        console.log(this.magazines)
      })
      .catch(e => console.log(e))
  }

  numberOnly (e: any): void {
    if (/^[1-9]([0-9]+)?[.]?([0-9]+)?$/.test(e.target.value)) {
      this.inputValue = parseFloat(e.target.value)
    } else if (e.target.value === '') {
      this.inputValue = 0
    } else if (e.target.value.length === 1) {
      e.target.value = ''
    } else {
      e.target.value = this.inputValue.toString()
    }
  }

  selectMagazine (index: number): void {
    this.selectedMagazine = index
    this.selectYear('')
  }

  selectYear (year: string): void {
    console.log(year)
    this.selectedYear = year
  }
}
