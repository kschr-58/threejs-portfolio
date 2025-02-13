import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import gsap from 'gsap';
import Project from 'src/models/project';

@Component({
  selector: 'app-showcase-item',
  templateUrl: './showcase-item.component.html',
  styleUrl: './showcase-item.component.scss'
})
export class ShowcaseItemComponent implements AfterViewInit {
  @ViewChild('titleBanner') titleBanner!: ElementRef;
  @ViewChild('detailsBanner') detailsBanner!: ElementRef;
  @ViewChild('backgroundImage') backgroundImage!: ElementRef;
  @ViewChild('codeIcon') codeIcon!: ElementRef;

  @Input() public project!: Project;

  private animationTL: gsap.core.Timeline;

  // Animation values
  private animationDuration = .35;
  private secondaryAnimationDelay = this.animationDuration / 4;

  constructor() {
    this.animationTL = gsap.timeline({
      defaults: {
        duration: this.animationDuration,
        ease: 'power2.out'
      },
      paused: true
    });
  }

  ngAfterViewInit(): void {
    this.registerAnimations();
  }

  private registerAnimations(): void {
    this.animationTL
    .to(this.titleBanner.nativeElement, {
      height: '15%',
      top: '0%', 
      borderTopLeftRadius: '10px', 
      borderTopRightRadius: '10px',
    }, 0)
    .to(this.detailsBanner.nativeElement, {
      height: '50%',
    }, 0)
    .to(this.backgroundImage.nativeElement, {
      opacity: 1,
      height: '115%',
      width: '115%',
    }, 0)
    .to(this.codeIcon.nativeElement, {
      rotateZ: 180
    }, this.secondaryAnimationDelay);
  }

  public onHover(): void {
    this.animationTL.play();
  }

  public onMouseExit(): void {
    this.animationTL.reverse();
  }
}
