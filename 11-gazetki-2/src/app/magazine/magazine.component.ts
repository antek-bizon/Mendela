import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Magazine, MagazineService } from '../magazine.service'

@Component({
  selector: 'app-magazine',
  templateUrl: './magazine.component.html',
  styleUrls: ['./magazine.component.css']
})
export class MagazineComponent implements OnInit {
  magazine: Magazine | null = null
  selectedYear: string = ''

  constructor (private readonly _magazineSerive: MagazineService, private readonly router: Router, private readonly route: ActivatedRoute) {}

  ngOnInit (): void {
    this._magazineSerive.fetchData()
      .then((data) => {
        this.route.paramMap.subscribe(params => {
          const name = params.get('name') ?? ''
          this.magazine = data.find(m => m.name === name) ?? null
          if (this.magazine === null) {
            this.goBack()
            return
          }
          this.selectedYear = params.get('year') ?? ''
          if (this.selectedYear !== '' && this.selectedYear !== 'all' &&
          !this.magazine.years.includes(this.selectedYear)) {
            this.goBack()
          }
        })
      })
      .catch(e => console.log(e))
  }

  selectYear (year: string): void {
    this.router.navigate([this.magazine?.name, year])
      .then()
      .catch(e => console.log(e))
  }

  goBack (): void {
    this.router.navigate(['/'])
      .then()
      .catch(e => console.log(e))
  }
}
