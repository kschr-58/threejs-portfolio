import { Component, OnInit } from '@angular/core';
import { Experience } from '../modular/experience';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-theme-button',
  templateUrl: './theme-button.component.html',
  styleUrl: './theme-button.component.scss'
})
export class ThemeButtonComponent {
  public isDarkTheme: boolean;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme = themeService.isDarkThemeEnabled();

    themeService.themeChangeEvent.subscribe(darkThemeEnabled => {
      this.isDarkTheme = darkThemeEnabled; // TODO disable button while theme transition in progress
    });
  }

  public onClick(): void {
    this.themeService.themeChangeRequestEvent.next();
  }
}
