import { Component, OnInit } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../api.service';
import { SolanaService } from '../../solanaApi.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-token',
  standalone: true,
  imports: [NzModalModule, CommonModule, NzCardModule, NzTableModule, NzBadgeModule, NzDividerModule, NzDropDownModule],
  templateUrl: './token.component.html',
  styleUrl: './token.component.scss'
})
export class TokenComponent {
  listOfData: any[] = []; 

  constructor(private message: NzMessageService, private api: ApiService) { }

  ngOnInit(): void {
    this.getTokenData();
  }

  getTokenData() {
    this.api.getTokenSolana().subscribe(
        (data) => {
            console.log(data);
            this.listOfData = data.tokens || []; 
        },
        (error) => {
            console.error('Error fetching token data', error);
            this.listOfData = [];
        }
    );
}

  
}
