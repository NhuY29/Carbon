import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { SolanaService } from '../../solanaApi.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule
  ],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent {
  transactionForm: FormGroup;

  private fb = inject(FormBuilder);
  private solanaService = inject(SolanaService);

  constructor() {
    this.transactionForm = this.fb.group({
      sourceAccount: ['', [Validators.required]],
      recipientAddress: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  submitTransaction(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      const senderSecretKeyBase58 = formValue.sourceAccount;
      const receiverPublicKey = formValue.recipientAddress;
      const amount = parseFloat(formValue.amount) * 1e9;

      this.solanaService.sendTransaction(senderSecretKeyBase58, receiverPublicKey, amount)
        .subscribe(
          response => {
            console.log('Transaction successful:', response);
          },
          error => {
            console.error('Transaction failed:', error);
          }
        );
    }
  }
}
