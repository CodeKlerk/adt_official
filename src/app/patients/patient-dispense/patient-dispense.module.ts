import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { patientdispenseRouting } from './patient-dispense.routing';
import { PatientDispenseComponent } from './patient-dispense.component';
import { SmartadminModule } from "../../shared/smartadmin.module";

@NgModule({
    imports: [
        CommonModule,
        patientdispenseRouting,
        SmartadminModule
    ],
    exports: [],
    declarations: [PatientDispenseComponent],
    providers: []
})
export class PatientDispenseModule { }
