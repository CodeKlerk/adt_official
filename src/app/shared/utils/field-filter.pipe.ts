import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fieldFilter',
})
export class FieldFilterPipe implements PipeTransform {
  // Compares first parameter to the second one
  checkValue(p1, p2) {
    return p1 == p2;
  }

  transform(items: any[], field: string, value: string): any[] {
    if (!items) return [];
    if (!value) return items;
    if (field == 'service_id' || 'phone_number') {
      return items.filter(it => this.checkValue(it[field], value));
      // console.log(items);
    }
    return items.filter(it => it[field].toLowerCase().indexOf(value.toLowerCase()) > -1);
  }
}