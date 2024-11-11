export interface CartDTO {
  cartId: string;
  tradeId: string;
  projectId: string;
  projectName: string;
  field: string;
  companyName: string;
  quantity: number;
  price: number;  
  mintToken: string;
  standardId: string;
  typeId: string;
  projectDescription: string;
  typeName: string;
  standardName: string;
  imageUrls: string[];
  userId: string;
  tokenAddress: string;
  amount: number;
  checked?: boolean;      
  isChecked: boolean;  
  balance?: string; 
}
