import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ThemeButtonComponent } from './theme-button/theme-button.component';
import { HomeComponent } from './home/home.component';
import { SkillsComponent } from './skills/skills.component';
import { ShowcaseItemComponent } from './showcase-item/showcase-item.component';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';
import { ContactComponent } from './contact/contact.component';
import { FormsModule } from '@angular/forms';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestcomponentComponent } from './testcomponent/testcomponent.component';
import { ThreeJSComponent } from './threejs/threejs.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ThreeJSComponent,
    ThemeButtonComponent,
    HomeComponent,
    SkillsComponent,
    ShowcaseItemComponent,
    LoadingOverlayComponent,
    ContactComponent,
    TestcomponentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [AppComponent]
})
export class AppModule { }
