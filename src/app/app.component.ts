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
  @HostBinding('class.dark-theme') public isDarkTheme: boolean;
  public homeComponent = HomeComponent;

  constructor(
    private themeService: ThemeService,
    private scrollService: ScrollService
  ) {
    this.isDarkTheme = themeService.isDarkThemeEnabled();

    themeService.themeChangeEvent.subscribe(enabled => {
      this.isDarkTheme = enabled;
    });
  }
}
