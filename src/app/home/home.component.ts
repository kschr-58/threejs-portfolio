import { Component, OnInit } from '@angular/core';
import gsap from "gsap";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private animationTimeline: gsap.core.Timeline;
  private headerElement!: HTMLElement;
  private subtextElement!: HTMLElement;
  private overlayBars!: Element[];

  constructor() {
    this.animationTimeline = gsap.timeline().add('start');
  }

  public ngOnInit(): void {
    const header = document.getElementById('header') || undefined;
    const subtext = document.getElementById('subtext') || undefined;
    this.overlayBars = Array.from(document.getElementsByClassName('overlay-bar'));

    if (header == undefined || subtext == undefined) throw new Error('Could not get document elements');

    this.headerElement = header;
    this.subtextElement = subtext;

    this.startTextAnimation();
  }

  private startTextAnimation(): void {
    this.animationTimeline
    .fromTo(this.headerElement, {autoAlpha: 1, yPercent: -100}, {autoAlpha: 1, yPercent: 0, duration: 1, delay: .5, ease: 'circ.out'}, 'start')
    .fromTo(this.subtextElement, {autoAlpha: 1, yPercent: 100}, {autoAlpha: 1, yPercent: 0, duration: 1, delay: 1.2, ease: 'circ.out'}, 'start')
    .then(() => {
      for (let bar of this.overlayBars) {
        if (bar instanceof HTMLElement) bar.style.visibility = 'hidden';
      }
    });
  }
}
