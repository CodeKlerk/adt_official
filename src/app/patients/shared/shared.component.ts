import { Component, OnInit, Input, DoCheck, ViewChild, AfterViewChecked, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientsService } from '../patients.service';
import { Patient, Service, Status, Regimen, Prophylaxis, Who_stage, Source, Illness, Allergies, FamilyPlanning, Locations } from '../patients';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect/src/multiselect-dropdown';
import { Observable } from 'rxjs/Observable';

declare var $: any;

@Component({
    selector: 'patient-form',
    templateUrl: './shared-form.component.html',
    providers: [DatePipe]
})

// TODO: Handle error catching in all subscriptions

export class SharedComponent implements OnInit, DoCheck, OnChanges {

    @Input() formType: string;
    // Determine the controls to be displayed.
    form: string;
    patientForm: FormGroup;

    // Define properties first.
    @Input() patient = new Patient;
    @Input() edit: boolean;
    source = new Source;
    service = new Service
    regimen = new Regimen;
    who_stage = new Who_stage;
    prophylaxis = new Prophylaxis;
    errorMessage: string;
    patientServices: Service[];
    patientSources: Source[];
    patientRegimen: Observable<Regimen[]>;
    patientWhostage: Observable<Who_stage[]>;
    patientProphylaxis: Observable<IMultiSelectOption[]>;
    familyPlanning: Observable<FamilyPlanning[]>;
    birth_place: Observable<Locations[]>;
    // Variables to multiselect controls
    family_planning_list: string[];
    chronic_illness_list: string[];
    allergies_list: string[];
    prophylaxis_list: string[];

    private selectedOptions: string[]; // Default selection

    private chronicIllness: Observable<IMultiSelectOption[]>;

    private allergiesList: Observable<IMultiSelectOption[]>;

    private mySettings: IMultiSelectSettings = {
        pullRight: false,
        enableSearch: true,
        checkedStyle: 'checkboxes',
        buttonClasses: 'btn btn-default',
        selectionLimit: 0,
        closeOnSelect: false,
        showCheckAll: true,
        showUncheckAll: true,
        dynamicTitleMaxItems: 3,
        maxHeight: '300px',
    };

    private myTexts: IMultiSelectTexts = {
        checkAll: 'Check all',
        uncheckAll: 'Uncheck all',
        checked: 'checked',
        checkedPlural: 'checked',
        searchPlaceholder: 'Search...',
        defaultTitle: 'Select',
    };

    // Methods section: The constructor comes first!
    constructor(
        private _datePipe: DatePipe,
        private router: Router,
        private _patientService: PatientsService,
        private fb: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.birth_place = this._patientService.getLocation();
        this.familyPlanning = this._patientService.getFamilyPlan();
        this.chronicIllness = this._patientService.getIllness();
        this.allergiesList = this._patientService.getAllergies();
        this._patientService.getSource().subscribe(source => this.patientSources = source);
        this._patientService.getServices().subscribe(service => { this.patientServices = service });
        this.patientRegimen = this._patientService.getRegimen();
        this.patientWhostage = this._patientService.getWho_stage();
        this.patientProphylaxis = this._patientService.getProphylaxis();
        // Form Builder Logic
        const form = this.patientForm;
        this.patientForm = this.fb.group({
            id: [''],
            ccc_number: ['', Validators.required],
            first_name: ['', Validators.required],
            last_name: [''],
            other_name: [''],
            birth_date: ['', Validators.required],
            place_of_birth: [''],
            age_in_years: [''],
            age_in_months: [''],
            current_weight: ['', Validators.required],
            current_height: ['', Validators.required],
            bsa: [''],
            phone_number: ['', [Validators.required, Validators.maxLength(10)]],
            physical_address: [''],
            gender: ['', Validators.required],
            is_pregnant: [''],
            is_tb: [''],
            is_tb_tested: [''],
            is_sms: ['0'],
            is_smoke: [''],
            is_alcohol: [''],
            current_status: [''],
            enrollment_date: [this.today(), Validators.required],
            regimen_start_date: [this.today(), Validators.required],
            regimen_id: ['', Validators.required],
            service_id: ['', Validators.required],
            facility_id: ['1'],
            supporter_id: ['1'],
            who_stage_id: [''],
            prophylaxis: [''],
            source_id: [''],
            status: [''],
            disclosure: [''],
            spouse_ccc: [''],
            patient_status: '',
            family_planning: [''],
            support_group: [{ value: '', disabled: true }],
            alternate_contact: [''],
            other_drugs: [{ value: '', disabled: true }],
            other_illness: [{ value: '', disabled: true }],
            other_allergies: [{ value: '', disabled: true }],
            illnesses: [''],
            drug_allergies: [''],
            tb_category: [''],
            tb_phase: [''],
            start_tb_phase: [''],
            end_tb_phase: [''],
            pep_reason: [''],
            isoniazid_start: [''],
            isoniazid_end: [''],
            is_support: '',
            is_illness: '',
            is_drugs: '',
            is_allergies: '',
        });
        this.patientForm.get('patient_status').valueChanges.subscribe(
            value => {
                if (value == 'concordant') {
                    form.patchValue({
                        disclosure: '1'
                    });
                }
                else {
                    form.patchValue({
                        disclosure: '0'
                    });
                }
            }
        );

        this.patientForm.get('start_tb_phase').valueChanges.subscribe(
            value => {
                this.tbEndCalculator(value);
            }
        );

        this.patientForm.get('isoniazid_start').valueChanges.subscribe(
            value => {
                this.patientForm.patchValue({
                    isoniazid_end: this.dateCalc(value, 168)
                })
            }
        );
    }

    today(): string {
        let date = new Date();
        return this._datePipe.transform(date, 'y/MM/dd'); // using angular's built in date pipe to format date object.
    }

    ngDoCheck(): void {
        // Dynamically sets the multiselect values to the form.
        console.log(this.chronic_illness_list)
        let height = this.patientForm.get('current_height').value;
        let weight = this.patientForm.get('current_weight').value;
        this.patientForm.patchValue({
            family_planning: this.family_planning_list,
            illnesses: this.chronic_illness_list,
            drug_allergies: this.allergies_list,
            prophylaxis: this.prophylaxis_list,
            bsa: Math.sqrt((height * weight) / 3600)
        });
        
    }

    /**
     * Calculates the end dates of the tb_phases based on
     * tb_category and tb_phase
     */
    tbEndCalculator(val) {
        const tb_category = this.patientForm.get('tb_category').value;
        const tb_phase = this.patientForm.get('tb_phase').value;
        let tbRange: number;

        if (tb_category == 1) {
            if (tb_phase == 'intensive') {
                tbRange = 90
            }
            else if (tb_phase == 'continuation') {
                tbRange = 112
            }
        }
        else if (tb_category == 2) {
            if (tb_phase == 'intensive') {
                tbRange = 90
            }
            else if (tb_phase == 'continuation') {
                tbRange = 150
            }
        }
        this.patientForm.patchValue({
            end_tb_phase: this.dateCalc(val, tbRange)
        })
    }

    /**
     * Date Calculator
     */
    dateCalc(value, days_to_add) {
        let new_date = new Date(value);
        let start_date = new Date(new_date.getFullYear(), new_date.getMonth(), new_date.getDate()).getTime();
        let expected_end_date = new Date((1000 * 60 * 60 * 24 * days_to_add) + start_date);
        return this._datePipe.transform(expected_end_date, 'y/MM/dd');
    }
    /**
     * Methods prefixed with set... modify the property values of
     * the patient's patient.
     */
    setDate(value: any, val: string) {
        if (val == 'birthday') {
            this.patientForm.patchValue({
                birth_date: value
            });
            this.getAge(value);
        }
        if (val == 'tb_start') {
            this.patientForm.patchValue({
                start_tb_phase: value
            })
        }
        if (val == 'tb_end') {
            this.patientForm.patchValue({
                end_tb_phase: value
            })
        }
        if (val == 'enrollment') {
            this.patientForm.patchValue({
                enrollment_date: value
            })
        }
        if (val == 'regimen') {
            this.patientForm.patchValue({
                regimen_start_date: value
            })
        }
        if (val == 'isoniazid_start') {
            this.patientForm.patchValue({
                isoniazid_start: value
            })
        }
        if (val == 'isoniazid_end') {
            this.patientForm.patchValue({
                isoniazid_end: value
            })
        }
    }

    getAge(value: any): any {
        let dob: any = new Date(value);
        let today: any = new Date();
        let age_in_years: number;
        let age_in_months: number;

        age_in_years = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
        var y1 = today.getFullYear();
        var y2 = dob.getFullYear();
        age_in_months = (today.getMonth() + y1 * 12) - (dob.getMonth() + y2 * 12);

        this.patientForm.patchValue({
            age_in_years: age_in_years,
            age_in_months: age_in_months
        });
    }

    setService(value) {
        this._patientService.getService(+[value]).subscribe(regimen => this.regimen = regimen);
    }

    /**
     * Submit form data to the back-end server
     */
    onSubmit(): void {
        if (this.formType == 'addPatient') {
            this._patientService.addPatient(this.patientForm.value).subscribe(
                () => this.onSaveComplete(),
                (error) => { console.log("Error happened" + error) }
            );
        }
        else {
            this._patientService.updatePatient(this.patientForm.value).subscribe(
                (response) => this.onUpdateComplete(response),
                (error) => { console.log("Error happened" + error) },
                () => { console.log("the subscription is completed") }
            );
        }
    }

    onSaveComplete() {
        console.log('Created a new patient...');
        this.patientForm.reset();
        this.notification('created');
        this.router.navigateByUrl('/patients/list');
    }

    onUpdateComplete(val) {
        this.patientForm.reset();
        this.notification('updated');
        this.router.navigateByUrl('/patients/list');
    }

    notification(value: string) {
        $.smallBox({
            title: `You have successfully ${value} the patient`,
            content: "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
            color: "#296191",
            iconSmall: "fa fa-thumbs-up bounce animated",
            timeout: 4000
        });
    }

    ngOnChanges() {
        this.form = this.formType;
    }

    onChange(value: any): void {
        console.log(value);
    }

    // TODO: Remove this when done
    get diagnostic() {
        return JSON.stringify(this.patient);
    }

}