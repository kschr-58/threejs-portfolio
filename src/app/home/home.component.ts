import { Component, OnInit } from '@angular/core';
import gsap from "gsap";
import ResourceLoadingService from '../services/resource-loading.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private animationTimeline: gsap.core.Timeline;
  private headerElement!: HTMLElement;
  private subtextElement!: HTMLElement;

  private animationDuration = 0.75;
  private secondaryAnimationDelay = 0.75;

  constructor() {
    this.animationTimeline = gsap.timeline();

    ResourceLoadingService.getInstance().loadingFinishedEvent.subscribe(() => {
      this.startTextAnimation();
    });
  }

  private startTextAnimation(): void {
    gsap.set('#header', { opacity: 0 });
    gsap.set('#subtext', { opacity: 0 });

    const header = document.getElementById('header');
    const subtext = document.getElementById('subtext');

    const headerHeight = header?.offsetHeight;
    const subtextHeight = subtext?.offsetHeight;

    gsap.set('#header-overlay', { height: headerHeight });
    gsap.set('#subtext-overlay', { height: subtextHeight });

    this.animationTimeline
    .to('#header-overlay', { scaleX: 1, duration: this.animationDuration, ease: 'power2.inOut' }, 0)
    .set('#header-overlay', { transformOrigin: 'left' })
    .set(header, { opacity: 1 })
    .to('#header-overlay', { scaleX: 0, duration: this.animationDuration, ease: 'power2.inOut' })
    .to('#subtext-overlay', { scaleX: 1, duration: this.animationDuration, ease: 'power2.inOut' }, this.secondaryAnimationDelay)
    .set('#subtext-overlay', { transformOrigin: 'left' })
    .set(subtext, { opacity: 1 })
    .to('#subtext-overlay', { scaleX: 0, duration: this.animationDuration, ease: 'power2.inOut' });
  }
}
