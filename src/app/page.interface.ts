export interface Page<T> {
    content: T[];
    pageIndex: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    size: number;     
    number: number;    
}
