import { Component, OnInit, Input, DoCheck } from '@angular/core';
// import { PatientsService } from '../patients.service';
import { Patient, Service, Status, Regimen, Prophylaxis, Who_stage, Source, Illness } from '../patients';

@Component({
  selector: 'app-patient-add',
  templateUrl: './patient-add.component.html',
  styleUrls: ['./patient-add.component.css'],
  // providers: [PatientsService]
})

export class PatientAddComponent implements OnInit, DoCheck {

  // Define properties first.
  date_of_birth: any;
  age_in_years: any;
  age_in_months: any;
  gender: string;
  weight: any;
  height: any;
  bsa: any;
  ctrl: any;
  model = new Patient;
  source = new Source;
  service = new Service
  regimen = new Regimen;
  who_stage = new Who_stage;
  prophylaxis = new Prophylaxis;

  // Methods section: The constructor comes first!
  ngOnInit(): void {
    console.log('Patient add module intialized ...');
  }

  ngDoCheck(): void {
    let bsa = Math.sqrt((this.weight * this.height) / 3600);
    this.bsa = bsa;
    console.log(this.ctrl);
  }

  getDate(value: any) {
    let dob: any = new Date(value);
    let today: any = new Date();
    this.age_in_years = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
    var yearDiff = today.getFullYear() - dob.getFullYear();
    var y1 = today.getFullYear();
    var y2 = dob.getFullYear();
    this.age_in_months = (today.getMonth() + y1 * 12) - (dob.getMonth() + y2 * 12);
  }

  // TODO: Remove this when we're done

  get diagnostic() {
    return JSON.stringify(this.model);
  }

  onSubmit(): void {
    
  }
}
