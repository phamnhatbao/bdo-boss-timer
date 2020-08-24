import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BossService } from './core/data/boss.service';
import { ScheduleService } from './core/data/schedule.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [BossService, ScheduleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
