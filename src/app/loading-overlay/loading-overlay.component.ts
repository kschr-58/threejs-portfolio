import { Component } from '@angular/core';
import ResourceLoadingService from '../services/resource-loading.service';
import gsap from 'gsap';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss'
})
export class LoadingOverlayComponent {
  public progressPercentage: number;
  private isLoading: boolean;

  constructor() {
    this.progressPercentage = 0;
    this.isLoading = true;

    document.body.classList.add('no-scroll');

    // Subscribe to resource loading events
    ResourceLoadingService.getInstance().loadingFinishedEvent.subscribe(() => {
      const overlay = document.getElementById('overlay-container');
      if (overlay == undefined) return;

      gsap.to(overlay, {autoAlpha: 0, duration: 1});
      
      document.body.classList.remove('no-scroll');
    });
    ResourceLoadingService.getInstance().loadingProgressEvent.subscribe(progress => {
      this.progressPercentage = progress * 100;
    });
  }

}
