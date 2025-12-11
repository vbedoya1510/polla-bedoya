import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import { provideHttpClient, withFetch } from '@angular/common/http';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, {
    ...config,
    providers: [
      ...(config.providers || []),
      provideHttpClient(withFetch())      // <-- registra HttpClient también en SSR
    ]
  }, context);

export default bootstrap;
