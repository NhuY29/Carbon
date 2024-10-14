import { User } from "./app/user2.interface";
import { BuyerDTO } from "./buyer.interface";
export interface RegisterRequest {
    userDTO: User;
    buyerDTO: BuyerDTO | null;
    sellerDTO: any | null; 
  }