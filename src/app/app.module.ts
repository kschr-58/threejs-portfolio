import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HelloCubeComponent } from './hello-cube/hello-cube.component';
import { KennyComponent } from './kenny/kenny.component';
import { CafeComponent } from './cafe/cafe.component';
import { RoomComponent } from './room/room.component';
import { HeaderComponent } from './header/header.component';
import { ScrollerComponent } from './scroller/scroller.component';
import { PhysicsComponent } from './physics/physics.component';
import { RealisticComponent } from './realistic/realistic.component';
import { ModularComponent } from './modular/modular.component';
import { ThemeButtonComponent } from './theme-button/theme-button.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HelloCubeComponent,
    KennyComponent,
    CafeComponent,
    RoomComponent,
    HeaderComponent,
    ScrollerComponent,
    PhysicsComponent,
    RealisticComponent,
    ModularComponent,
    ThemeButtonComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
