import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModularComponent } from './modular.component';

describe('ModularComponent', () => {
  let component: ModularComponent;
  let fixture: ComponentFixture<ModularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModularComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
