import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public homeComponent = HomeComponent;
  public isDarkTheme: boolean;
  public title = 'front-end';

  constructor(private themeService: ThemeService) {
    this.isDarkTheme = themeService.isDarkThemeEnabled();

    themeService.themeChangeEvent.subscribe(enabled => {
      this.isDarkTheme = enabled;
    });
  }
}
