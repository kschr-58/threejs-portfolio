import { Component, Input, OnInit } from '@angular/core';
import { Experience } from './experience';
import { ThemeService } from '../services/theme.service';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-modular',
  templateUrl: './modular.component.html',
  styleUrl: './modular.component.scss'
})
export class ModularComponent implements OnInit {
  @Input() public overlayComponent!: any;

  private experience!: Experience;

  constructor(
    private themeService: ThemeService,
    private scrollService: ScrollService
  ) { }

  public ngOnInit(): void {
    const canvasElement = document.getElementById('main_canvas');
    if (!(canvasElement instanceof HTMLCanvasElement)) throw new Error('Could not find canvas element');

    this.experience = new Experience(canvasElement);
  }
}
