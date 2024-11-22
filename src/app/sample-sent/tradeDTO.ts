export class TradeDTO {
  projectId: string;
  projectName: string;
  field: string;
  type: string;
  standard: string;
  companyName: string;
  quantity: number;
  price: number;
  mintToken: string;
  tradeId: string;
  standardId: string;
  typeId: string;
  projectDescription: string;
  typeName: string;
  standardName: string;
  imageUrls: string[];
  userId: string;
  tokenAddress: string;
  status: string;
  approvalStatus: string;
  balance: string;
  purchasedFrom: string;
  purchasePrice: number;

  constructor(
    projectId: string,
    projectName: string,
    field: string,
    type: string,
    standard: string,
    companyName: string,
    quantity: number,
    price: number,
    mintToken: string,
    typeName: string,
    standardName: string,
    imageUrls: string[] = [],
    tradeId?: string,
    standardId?: string,
    typeId?: string,
    projectDescription?: string,
    userId?: string,
    tokenAddress?: string,
    status?: string,
    approvalStatus?: string,
    balance?: string,
    purchasedFrom?: string,
    purchasePrice?: number
  ) {
    this.projectId = projectId;
    this.projectName = projectName;
    this.field = field;
    this.type = type;
    this.standard = standard;
    this.companyName = companyName;
    this.quantity = quantity;
    this.price = price;
    this.mintToken = mintToken;
    this.typeName = typeName;
    this.standardName = standardName;
    this.imageUrls = imageUrls;
    this.tradeId = tradeId || '';
    this.standardId = standardId || '';
    this.typeId = typeId || '';
    this.projectDescription = projectDescription || '';
    this.userId = userId || '';
    this.tokenAddress = tokenAddress || '';
    this.status = status || '';
    this.approvalStatus = approvalStatus || '';
    this.balance = balance || '';
    this.purchasedFrom = purchasedFrom || '';
    this.purchasePrice = purchasePrice || 0;
  }
}
