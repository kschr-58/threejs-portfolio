import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeJSComponent } from './threejs.component';

describe('ModularComponent', () => {
  let component: ThreeJSComponent;
  let fixture: ComponentFixture<ThreeJSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeJSComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeJSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
