import { Component, HostBinding } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { ThemeService } from 'src/app/services/theme.service';
import { ScrollService } from './services/scroll.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public homeComponent = HomeComponent;

  constructor(
    private themeService: ThemeService,
    private scrollService: ScrollService
  ) {
    const darkThemeEnabled = themeService.isDarkThemeEnabled();

    document.documentElement.className = darkThemeEnabled ? 'theme-dark' : 'theme-light';

    themeService.themeChangeEvent.subscribe(enabled => {
      document.documentElement.className = enabled ? 'theme-dark' : 'theme-light';
    });
  }
}
