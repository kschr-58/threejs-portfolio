import { Component } from '@angular/core';
import ResourceLoadingService from '../services/resource-loading.service';
import gsap from 'gsap';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss'
})
export class LoadingOverlayComponent {
  public progressPercentage: number = 0;
  public errorMessage: string | null = null;
  public isLoading: boolean = false;

  constructor() {

    // Subscribe to resource loading events
    ResourceLoadingService.getInstance().loadingStartedEvent.subscribe(() => {
      this.isLoading = true;
      this.progressPercentage = 0;
      document.body.classList.add('no-scroll');
    });

    ResourceLoadingService.getInstance().loadingFinishedEvent.subscribe(success => {

      if (!success) {
        this.errorMessage = 'Failed to load resources, please try refreshing the page.';
        return;
      }

      const overlay = document.getElementById('overlay-container');
      if (overlay == undefined) return;

      gsap.to(overlay, {autoAlpha: 0, duration: 1})
      .then(() => {
        this.isLoading = false;
      });
      
      document.body.classList.remove('no-scroll');
    });
    ResourceLoadingService.getInstance().loadingProgressEvent.subscribe(progress => {
      this.progressPercentage = parseFloat((progress * 100).toFixed(2));
    });
  }

}
