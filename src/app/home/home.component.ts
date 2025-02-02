import { Component } from '@angular/core';
import { ThemeService } from 'src/services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  public isDarkTheme: boolean;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme = themeService.isDarkThemeEnabled();

    // Subscribe to theme change event
    themeService.themeChangeEvent.subscribe(darkThemeEnabled => {
      this.isDarkTheme = darkThemeEnabled;
    });
  }
}
