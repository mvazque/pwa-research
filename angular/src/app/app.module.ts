import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { TodoComponent } from './components/todo/todo.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NotificationsButtonComponent } from './components/notifications-button/notifications-button.component';
import { HelpComponent } from './components/help/help.component';
import { LegacyIncompatibilityBannerComponent } from './components/legacy-incompatibility-banner/legacy-incompatibility-banner.component';

@NgModule({
  declarations: [
    AppComponent,
    HelpComponent,
    LegacyIncompatibilityBannerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TodoComponent,
    TodoListComponent,
    NotificationsButtonComponent,
    CommonModule,
    HttpClientModule,
    ServiceWorkerModule.register('../service-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
