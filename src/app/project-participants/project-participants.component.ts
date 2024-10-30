import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AppTranslateModule } from '../translate.module';
@Component({
  selector: 'app-project-participants',
  standalone: true,
  imports: [AppTranslateModule,CommonModule, NzCardModule, NzAvatarModule],
  templateUrl: './project-participants.component.html',
  styleUrl: './project-participants.component.scss'
})
export class ProjectParticipantsComponent {
  projectId: string = '';
  participants: any[] = [];
  isWalletActive: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private message: NzMessageService,
    public translate: TranslateService,
  ) { 
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');
    const savedState = localStorage.getItem('isWalletActive');
    this.isWalletActive = savedState === 'true'; 
    console.log(`Initial wallet state: ${this.isWalletActive ? 'ACTIVE' : 'INACTIVE'}`);
    if (this.isWalletActive) {
      this.translate.use('vi'); 
    } else {
      this.translate.use('en');
    }
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    this.loadParticipants();
  }

  loadParticipants(): void {
    this.apiService.getParticipantsByProjectId(this.projectId).subscribe(
      (participants) => {
        this.participants = participants;
        console.log('Participants:', participants);
      },
      error => {
        this.message.error('Failed to fetch participants.');
        console.error('Error:', error);
      }
    );
  }
  getAvatarText(username: string): string {
    return username ? username.charAt(0).toUpperCase() : 'U';
  }

  getDescription(participant: any): string {
    return `
      First Name: ${participant.firstname || 'N/A'}
      <br>Last Name: ${participant.lastname || 'N/A'}
      <br>Role: ${participant.roles || 'N/A'}
    `;
  }


}
