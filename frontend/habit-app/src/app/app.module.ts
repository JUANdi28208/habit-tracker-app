import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HabitListComponent } from './components/habit-list/habit-list.component';
import { HabitFormComponent } from './components/habit-form/habit-form.component';
import { HabitCalendarComponent } from './components/habit-calendar/habit-calendar.component';
import { HabitStatsComponent } from './components/habit-stats/habit-stats.component';
import { AchievementsComponent } from './components/achievements/achievements.component';
import { NavbarComponent } from './components/navbar/navbar.component';

import { AuthInterceptor } from './insterceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    HabitListComponent,
    HabitFormComponent,
    HabitCalendarComponent,
    HabitStatsComponent,
    AchievementsComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
