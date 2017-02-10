import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SmartadminModule } from './shared/smartadmin.module'
import { AppComponent } from './app.component';

import { routing } from './app.routing';
import { BrowserModule } from "@angular/platform-browser";
import { UserModule } from "./shared/user/user.module";
import { UserService } from "./shared/user/user.service";

import { HttpModule, JsonpModule } from '@angular/http';

import { FormsModule } from '@angular/forms';
import { FaqComponent } from "./faq/faq.component";

@NgModule({
  declarations: [
    AppComponent,
    FaqComponent
  ],
  imports: [

    BrowserModule,

    routing,

    HttpModule,
    JsonpModule,

    SmartadminModule.forRoot(),
    UserModule.forRoot(),

    FormsModule
  ],
  providers: [UserService],
  // entryComponents: [AppComponent],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {

}
