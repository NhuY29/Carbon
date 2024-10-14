import { Category } from './Category';
export interface CommonCategoryRequest {
    id: string;
    code: string;
    category: Category; 
    name: string;
    description: string;
    unit?: string; 
    conversionPrice?: string; 
    
  }
 