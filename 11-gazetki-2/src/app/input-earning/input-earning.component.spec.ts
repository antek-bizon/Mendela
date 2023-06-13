import { ComponentFixture, TestBed } from '@angular/core/testing'

import { InputEarningComponent } from './input-earning.component'

describe('InputEarningComponent', () => {
  let component: InputEarningComponent
  let fixture: ComponentFixture<InputEarningComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputEarningComponent]
    })
    fixture = TestBed.createComponent(InputEarningComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
