export class TradeDTO {
  projectId: string;
  projectName: string;
  field: string;
  type: string;
  standard: string;
  companyName: string;
  quantity: number;
  price: string;
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
  status: boolean;

  constructor(
    projectId: string,
    projectName: string,
    field: string,
    type: string,
    standard: string,
    companyName: string,
    quantity: number,
    price: string,
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
    status?: boolean
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
    this.status = status || false;
  }
}
