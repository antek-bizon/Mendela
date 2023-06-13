import { Component, OnInit } from '@angular/core'
import { MagazineService, Magazine } from '../magazine.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-input-earning',
  templateUrl: './input-earning.component.html',
  styleUrls: ['./input-earning.component.css']
})
export class InputEarningComponent implements OnInit {
  inputValue: string = ''
  correctValue: number = 333.333
  numberValue: number = 0
  magazines: Magazine[] = []

  constructor (private readonly _magazineSerive: MagazineService, private readonly router: Router) {}

  ngOnInit (): void {
    this._magazineSerive.fetchData()
      .then((data) => {
        this.magazines = data
      })
      .catch(e => console.log(e))
  }

  numberOnly (e: any): void {
    if (/^[1-9]([0-9]+)?[.]?([0-9]+)?$/.test(e.target.value)) {
      this.numberValue = parseFloat(e.target.value)
    } else if (e.target.value === '') {
      this.numberValue = 0
    } else if (e.target.value.length === 1) {
      e.target.value = ''
    } else {
      e.target.value = this.numberValue.toString()
    }
  }

  displayMagazine (i: number): void {
    console.log(i)
    this.router.navigate([this.magazines[i].name])
      .then()
      .catch(() => console.log('error'))
  }
}
