import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import gsap from 'gsap';

@Component({
  selector: 'app-theme-button',
  templateUrl: './theme-button.component.html',
  styleUrl: './theme-button.component.scss'
})
export class ThemeButtonComponent implements OnInit {
  public isDarkTheme: boolean;
  public isThemeTransitioning: boolean = false;
  
  private animationTimeline: gsap.core.Timeline;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme = themeService.isDarkThemeEnabled();

    this.animationTimeline = gsap.timeline({paused: true});

    themeService.themeChangeEvent.subscribe(darkThemeEnabled => {
      this.isDarkTheme = darkThemeEnabled;
      this.isThemeTransitioning = false;
    });
  }

  public ngOnInit(): void {
    this.registerAnimations();
  }

  public onClick(): void {
    if (this.isThemeTransitioning) return;

    this.isThemeTransitioning = true;
    this.themeService.themeChangeRequestEvent.next();
    this.playAnimation();
  }

  private registerAnimations(): void {
    this.animationTimeline
    .to('#border', {
      '--rotation': 180,
      '--transparency-degrees': 110,
      duration: 0.5
    }, 0)
    .set('#border', {'--rotation': 0 }, 0);
  }

  private playAnimation(): void {
    this.animationTimeline.restart();
  }
}
