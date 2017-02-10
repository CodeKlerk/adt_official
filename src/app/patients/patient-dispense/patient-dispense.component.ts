import { Component, OnInit, DoCheck } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Patient, Regimen } from '../patients';
import { PatientsService } from '../patients.service';
import { DispenseService } from './dispense.service';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { DrugsTable } from './dispense';
import 'rxjs/add/operator/switchMap';

declare var $: any;

@Component({
  selector: 'app-dispense',
  templateUrl: './patient-dispense.component.html',
  styleUrls: ['./patient-dispense.component.css'],
  providers: [DatePipe]
})
export class PatientDispenseComponent implements OnInit, DoCheck {

  patient = new Patient();

  // Datepicker properties
  date_options: Object = {
    dateFormat: 'mm/dd/yy',
    changeMonth: true,
    changeYear: true,
    beforeShowDay: $.datepicker.noWeekends // Disables weekends in the calendar
  }

  setdate: Date;

  regimenDrugs: Regimen[];
  regimen: any;
  current_regimen: number;
  dispenseForm: FormGroup;

  get rows(): FormArray {
    return <FormArray>this.dispenseForm.get('drugs');
  }


  constructor(
    private _datePipe: DatePipe,
    private _route: ActivatedRoute,
    private _router: Router,
    private _patientService: PatientsService,
    private _dispenseService: DispenseService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    // Passing an id to a router
    this._route.params
      .switchMap((params: Params) => this._patientService.getPatient(+params['id']))
      .subscribe(patient => this.patient = patient);
    this._dispenseService.getRegimenDrugs().subscribe(
      regimen => this.regimenDrugs = regimen,
      error => console.error(error)
    );
    this.dispenseForm = this.fb.group({
      dispense_point: ['', Validators.required],
      ccc_number: [{ value: this.patient.ccc_number, disabled: true }],
      patient_name: [{ value: this.patient.first_name, disabled: true }],
      purpose_id: '',
      visit_date: ['', Validators.required],
      appointment_date: ['', Validators.required],
      current_height: '',
      current_weight: ['', Validators.required],
      days_to: ['', Validators.required],
      current_regimen: ['', Validators.required],
      last_regimen_id: [{ value: '', disabled: true }],
      appointment_adherance: '',
      non_adherance_reason_id: '',
      patient_id: '',
      drugs: this.fb.array([this.buildRow()])
    });

    const regimenControl = this.dispenseForm.get('current_regimen');
    regimenControl.valueChanges.subscribe(value => this.setDrug(value)); // checks for changes in value

    let appointmentCtrl = this.dispenseForm.get('appointment_date');
    this.dispenseForm.get('days_to').valueChanges.subscribe(value => {
      if (value == '') {
        // if null clear the appointment date and reset the validity of the form
        this.dispenseForm.patchValue({ appointment_date: '' });
        appointmentCtrl.setValidators(Validators.required);
        appointmentCtrl.updateValueAndValidity();
      }
      else {
        this.nextAppointment(value);
        console.log('I got: ' + value);
        appointmentCtrl.clearValidators();
        appointmentCtrl.updateValueAndValidity();
      }
    });
  }

  ngDoCheck() {
    // Checks if the patient info has been asynchronously loaded
    this.dispenseForm.patchValue({
      ccc_number: this.patient.ccc_number,
      patient_name: this.patient.first_name,
      patient_id: this.patient.id
    })
  }

  setDispenseDate(val) {
    this.dispenseForm.patchValue({
      visit_date: val
    });
  }
  populateTestData(value: number): void {
    this.dispenseForm.patchValue({
      days_to: value,
    });
  }

  buildRow(): FormGroup {
    return this.fb.group({
      drug_id: '',
      unit: '',
      batch_no: '',
      expiry_date: '',
      dose_id: '',
      expected_pill_count: '',
      actual_pill_count: '',
      duration: '',
      dispensed_qty: '',
      stock_id: '',
      indication: '',
      comment: '',
      missed_pills: '',
      facility_id: 1,
      appointment_id: 1,
      user_id: 1 // TODO: Remove
    });
  }

  addRow() {
    this.rows.push(this.buildRow());
  }

  removeRow(i: number) {
    // remove address from the list
    const control = <FormArray>this.dispenseForm.controls['drugs'];
    control.removeAt(i);
  }

  /**
   * Get users input, add the number of days and
   * set date picker to use the current date
   * Refer to this article: 
   * http://www.htmlgoodies.com/html5/javascript/calculating-the-difference-between-two-dates-in-javascript.html#fbid=2-vGKw3DAdn
   */
  nextAppointment(val) {
    let date = new Date();
    this.setdate = new Date(date.setTime(date.getTime() + Number(val) * 86400000)); // sets the next appointment based using milliseconds.
    this._datePipe.transform(this.setdate, 'MM/dd/y'); // using angular's built in date pipe to format date object.
  }
  /**
   * Calculates the days to an appointment
   */
  dateDiff(todate) {
    let fromdate: any = new Date();
    let to: any = new Date(todate)
    var diff = to - fromdate;
    var divideBy = {
      w: 604800000,
      d: 86400000,
      h: 3600000,
      n: 60000,
      s: 1000
    };

    let ctrl = Math.floor(diff / divideBy['d']);
    // Activate the function that sets the days remaining field
    this.populateTestData(ctrl);
    this.dispenseForm.patchValue({
      appointment_date: todate
    });
    console.log(ctrl);
  }

  /**
   * Dynamically set the drugs based on regimen selection
   */

  setDrug(value) {
    this._dispenseService.getRegimen(+[value]).subscribe(
      regimen => this.regimen = regimen,
      error => console.log(error)
    )
  }

  save() {
    this._dispenseService.saveDispenseDetails(this.dispenseForm.value).subscribe(
      () => { this.notification('dispensed') },
      error => console.log(error)
    )
  }


  notification(value: string) {
    $.smallBox({
      title: `You have successfully ${value} drugs to the patient`,
      content: "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
      color: "#296191",
      iconSmall: "fa fa-thumbs-up bounce animated",
      timeout: 4000
    });
  }

}
