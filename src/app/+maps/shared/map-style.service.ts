import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx'
import {JsonApiService} from "../../shared/api/json-api.service";


@Injectable()
export class MapStyleService {


  constructor(private jsonApiService:JsonApiService) {  }


  fetchStyle(style):Observable<any> {
    return this.jsonApiService.fetch(style.url)
  }

}
