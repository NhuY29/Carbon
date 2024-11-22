export interface WithdrawalDTO {
  withdrawalId: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  requestTime: string | Date;
  approvalTime?: string | Date; 
  remainingTime: string;
  status: string;
  transactionSignature: string;
  user: {
    userId: string;
    username: string;
    firstname: string;
    lastname: string;
    roles: string[];
    status: boolean;
    deleted: boolean;
  };
  transactionDetails?: any;
}
