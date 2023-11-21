import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { PusherService } from './pusher.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),PusherService]
};
