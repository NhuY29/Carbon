import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { UserDTO } from './user.interface';
import { HttpHeaders } from '@angular/common/http';
import { Page } from './app/page.interface';
import { RegisterRequest } from './register.interface';
import { CommonCategoryDTO } from './app/CommonCategory.interface';
import { ProjectDTO } from './app/ProjectDTO';
import { CommonCategoryRequest } from './app/CommonCategoryRequest';
import { CategoryParentChild } from './app/category-parent-child';
import { SignatureResponse } from './app/SignatureResponse .interface';
import { MeasurementDetailsDTO } from './app/MeasurementDetailsDTO';
import { SampleSentDTO } from './app/SampleSentDTO';
import { MeasurementDataRequest } from './app/MeasurementDataRequest';
import { catchError } from 'rxjs/operators';
import { Contact } from './app/contact/contact.modal';
import { TradeDTO } from './app/sample-sent/tradeDTO';
import { WalletResponse } from './app/wallet/WalletResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { CartDTO } from './app/cart/cart.dto';
import { CoordinateDTO } from './app/CoordinateDTO';
import { WithdrawalDTO } from './app/withdraw-money/WithdrawalDTO';
import { Trade2DTO } from './app/my-trading-list/Trade2DTO';
import { ProjectOfTrade2 } from './app/my-trading-list/ProjectOfTrade2';
interface WithdrawalResponse {
  message: string;
  status: string;
}
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  register(userData: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/user/register`, userData);
  }
  getAllTrue(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/user/getAll`);
  }
  getAllFalse(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/user/getAll2`);
  }
  delete(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.delete(`${this.apiUrl}/user/delete/${id}`, { headers });
  }

  updateStatus(userId: string, status: boolean): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });


    return this.http.put(`${this.apiUrl}/user/${userId}?status=${status}`, { headers });
  }
  sendUpdateEmail(email: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/client/sendmail`, { email }, { headers });
  }
  getEmailByUsername(userId: string): Observable<string> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<string>(`${this.apiUrl}/user/getEmail/${userId}`, { headers, responseType: 'text' as 'json' });
  }
  pagination(pageIndex: number, pageSize: number): Observable<Page<UserDTO>> {
    return this.http.get<Page<UserDTO>>(`${this.apiUrl}/user/pagination?pageNo=${pageIndex}&pageSize=${pageSize}`);
  }

  searchUsers(query: string, pageIndex: number, pageSize: number): Observable<Page<UserDTO>> {
    return this.http.get<Page<UserDTO>>(`${this.apiUrl}/user/pagination2?term=${query}&page=${pageIndex}&size=${pageSize}`);
  }
  registerUser(payload: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/register`, payload);
  }
  getWalletInfo(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });


    return this.http.get<any>(`${this.apiUrl}/wallet/info`, { headers });
  }
  getTransactionHistory(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.apiUrl}/wallet/transactions`, { headers });
  }
  getTokenSolana(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.apiUrl}/wallet/token`, { headers });
  }
  getUsername(token: string): Observable<string> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<string>(`${this.apiUrl}/user/getusername`, { headers, responseType: 'text' as 'json' });
  }
  airdropFunds(recipientPubkey: string, amount: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/wallet/airdrop`, null, {
      params: {
        recipientPubkey,
        amount: amount.toString()
      }
    });
  }
  createProject(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/project/create`, formData, { headers });
  }

  getProjects(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/project/list`);
  }
  getCategoriesByCategoryLoaiHinh(): Observable<CommonCategoryDTO[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<CommonCategoryDTO[]>(`${this.apiUrl}/common-categories/by-category-loai-hinh`, { headers });
  }

  getCategoriesByCategoryTieuChuan(): Observable<CommonCategoryDTO[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<CommonCategoryDTO[]>(`${this.apiUrl}/common-categories/by-category-tieu-chuan`, { headers });
  }

  getCategoriesByCategoryChat(): Observable<any[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any[]>(`${this.apiUrl}/common-categories/by-category-chat`, { headers });
  }


  getImagesByProjectId(projectId: string, width: number, height: number): Observable<string[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<string[]>(`${this.apiUrl}/image/get-images/${projectId}?width=${width}&height=${height}`, { headers });
  }
  getImageByUrl(imageUrl: string, width: number, height: number): Observable<Blob> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.apiUrl}/image/get-by-url?imageUrl=${encodeURIComponent(imageUrl)}&width=${width}&height=${height}`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  downloadProjectFile(projectId: string): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `http://localhost:8080/project/download/${projectId}`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  deleteProject(projectId: string): Observable<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/project/delete/${projectId}`, { headers });
  }
  updateProject(projectId: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/project/update/${projectId}`, formData, { headers });
  }
  getProjectById(projectId: string): Observable<ProjectDTO> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ProjectDTO>(`${this.apiUrl}/project/${projectId}`, { headers });
  }
  joinProject(token: string, projectId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/participant/join?projectId=${projectId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'text' as 'json'
    });
  }
  checkProjectParticipation(token: string, projectId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/participant/check?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  getParticipantsByProjectId(projectId: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get(`${this.apiUrl}/participant/project/${projectId}`, { headers });
  }
  createCategory(categoryDTO: CommonCategoryRequest): Observable<CommonCategoryRequest> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<CommonCategoryRequest>(`${this.apiUrl}/common-categories`, categoryDTO, { headers });
  }
  getAllCategories(): Observable<CommonCategoryRequest[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<CommonCategoryRequest[]>(`${this.apiUrl}/common-categories`, { headers });
  }
  deleteCategory(id: string): Observable<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.delete<void>(`${this.apiUrl}/common-categories/${id}`, { headers });
  }
  updateCategory(id: string, category: CommonCategoryRequest): Observable<CommonCategoryRequest> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<CommonCategoryRequest>(`${this.apiUrl}/common-categories/${id}`, category, { headers });
  }
  getCategoryById2(id: string): Observable<CommonCategoryDTO> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<CommonCategoryDTO>(`${this.apiUrl}/common-categories/${id}`, { headers });
  }

  getAllParentCategories(): Observable<CategoryParentChild[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<CategoryParentChild[]>(`${this.apiUrl}/commonParentChild/parents`, { headers });
  }

  getAllCategoriesParentChild(): Observable<CategoryParentChild[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<CategoryParentChild[]>(`${this.apiUrl}/commonParentChild/all`, { headers });
  }

  getCategoryById(id: string): Observable<CategoryParentChild> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<CategoryParentChild>(`${this.apiUrl}/commonParentChild/${id}`, { headers });
  }

  updateCategoryParentChild(id: string, category: CategoryParentChild): Observable<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put<void>(`${this.apiUrl}/commonParentChild/${id}`, category, { headers });
  }

  createCategoryParentChild(category: CategoryParentChild): Observable<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post<void>(`${this.apiUrl}/commonParentChild`, category, { headers });
  }

  deleteCategoryParentChild(id: string): Observable<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.delete<void>(`${this.apiUrl}/commonParentChild/${id}`, { headers });
  }

  getAllChildCategories(parentId: string): Observable<CategoryParentChild[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<CategoryParentChild[]>(`${this.apiUrl}/commonParentChild/children/${parentId}`, { headers });
  }
  addMeasurementData(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/measurementData/add`, data, { headers });
  }
  getMeasurementData(measurementId: string): Observable<any[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<any[]>(`${this.apiUrl}/measurementData/${measurementId}/details`, { headers });
  }
  getProjectMeasurementData(projectId: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.apiUrl}/measurementData/project/${projectId}`, { headers });
  }
  searchCategories(name: string, category: string): Observable<CommonCategoryRequest[]> {
    let params = new HttpParams();
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    if (name) {
      params = params.set('name', name);
    }
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<CommonCategoryRequest[]>(`${this.apiUrl}/common-categories/search`, { headers, params });
  }
  getProjectsByUser(): Observable<ProjectDTO[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<ProjectDTO[]>(`${this.apiUrl}/project/projects`, { headers });
  }
  getProjectByProjectId(projectId: string): Observable<ProjectDTO> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<ProjectDTO>(`${this.apiUrl}/project/${projectId}`, { headers });
  }
  getInfoSellerByToken(): Observable<ProjectDTO> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<ProjectDTO>(`${this.apiUrl}/user/seller`, { headers });
  }
  getSellerByProjectId(projectId: string): Observable<ProjectDTO> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<ProjectDTO>(`${this.apiUrl}/project/project/${projectId}`, { headers });
  }
  saveSignature(projectId: string, signatureDataUrl: string, numberOfProposals: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const payload = new URLSearchParams();
    payload.set('projectId', projectId);
    payload.set('signatureDataUrl', signatureDataUrl);
    payload.set('numberOfProposals', numberOfProposals.toString());

    return this.http.post(`${this.apiUrl}/signature/save`, payload.toString(), { headers });
  }


  getSignature(projectId: string): Observable<SignatureResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<SignatureResponse>(`${this.apiUrl}/signature/get?projectId=${projectId}`, { headers });
  }
  getMeasurementDetailsByProjectId(projectId: string): Observable<MeasurementDetailsDTO[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<MeasurementDetailsDTO[]>(`${this.apiUrl}/measurementData/project/${projectId}/details`, { headers });
  }
  uploadPdf(projectId: string, file: File): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/sampleSent/upload`, formData, { headers });
  }

  getPdfByProjectIdAndId(projectId: string, id: string): Observable<Blob> {
    const token = localStorage.getItem('token');


    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });


    return this.http.get(`${this.apiUrl}/sampleSent/getPdf`, {
      headers,
      params: { projectId, id },
      responseType: 'blob'
    });
  }

  uploadReplyPdf(projectId: string, id: string, file: File, quantity: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('id', id);
    formData.append('file', file);
    formData.append('quantity', quantity.toString());

    return this.http.post(`${this.apiUrl}/sampleSent/uploadReceived`, formData, { headers });
  }


  private getToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }
    return token;
  }
  getPdfReceived(projectId: string, id: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get(`${this.apiUrl}/sampleSent/getPdfReceived?projectId=${projectId}&id=${id}`, {
      headers,
      responseType: 'blob'
    });
  }



  getAllProjectsPending(): Observable<SampleSentDTO[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get<SampleSentDTO[]>(`${this.apiUrl}/sampleSent/getProjectsWithoutPdfReceived`, { headers });
  }

  getAllProjectsDone(): Observable<SampleSentDTO[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get<SampleSentDTO[]>(`${this.apiUrl}/sampleSent/getProjectsWithPdfReceived`, { headers });
  }

  getAllProjectsSentToday(): Observable<SampleSentDTO[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get<SampleSentDTO[]>(`${this.apiUrl}/sampleSent/getProjectsSentToday`, { headers });
  }
  getAllProjectIds(): Observable<{ id: string; projectId: string; sendDate: string }[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<{ id: string; projectId: string; sendDate: string }[]>(`${this.apiUrl}/sampleSent/getAll`, { headers });
  }
  deleteMeasurementData(id: string): Observable<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<void>(`${this.apiUrl}/measurementData/${id}`, { headers });
  }
  updateMeasurementData(id: string, data: MeasurementDataRequest): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<MeasurementDataRequest>(`${this.apiUrl}/measurementData/update/${id}`, data, { headers });
  }
  getMeasurementDataById(id: string): Observable<MeasurementDataRequest> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<MeasurementDataRequest>(`${this.apiUrl}/measurementData/measurementDataRequest/${id}`, { headers });
  }
  supplyToken(projectId: string, quantity: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams()
      .set('projectId', projectId)
      .set('quantity', quantity.toString());

    return this.http.post<any>(`${this.apiUrl}/sampleSent/TokenSupply`, null, { headers, params })
      .pipe(
        catchError((error) => {
          console.error('Lỗi khi lấy secretKey:', error);
          return throwError(() => new Error('Đã xảy ra lỗi khi lấy secretKey.'));
        })
      );
  }



  sendTransaction(senderSecretKeyBase58: string, receiverPublicKey: string, amount: number, content?: string): Observable<string> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const params = new HttpParams()
      .set('senderSecretKeyBase58', senderSecretKeyBase58)
      .set('receiverPublicKey', receiverPublicKey)
      .set('amount', amount.toString())
      .set('content', content || '');
    const options = {
      headers: headers,
      params: params,
    };
    return this.http.post<string>(`${this.apiUrl}/wallet/transfer`, null, options);
  }
  getWalletSecret(): Observable<string> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Token không tồn tại.');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<string>(`${this.apiUrl}/wallet/secretKey`, { headers, responseType: 'text' as 'json' });
  }
  getUsernameFromPublicKey(publicKey: string): Observable<string> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<string>(`${this.apiUrl}/wallet/username/${publicKey}`, { headers, responseType: 'text' as 'json' });
  }
  getContacts(secretKey: string): Observable<Contact[]> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<Contact[]>(`${this.apiUrl}/contacts/wallet/secret/${secretKey}`, { headers });
  }

  addContact(publicKey: string, contact: Contact): Observable<any> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.apiUrl}/contacts/${publicKey}`, contact, { headers });
  }


  updateContact(id: string, contact: Contact): Observable<Contact> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put<Contact>(`${this.apiUrl}/contacts/${id}`, contact, { headers });
  }
  deleteContact(id: string): Observable<{ message: string }> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.delete<{ message: string }>(`${this.apiUrl}/contacts/${id}`, { headers });
  }

  searchContacts(username: string): Observable<Contact[]> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<Contact[]>(`${this.apiUrl}/contacts/search?username=${username}`, { headers });
  }
  getPaymentResult(
    vnp_Amount: string,
    vnp_TxnRef: string,
    vnp_PayDate: string,
    vnp_ResponseCode: string,
    vnp_SecureHash: string,
    vnp_OrderInfo: string,
    vnp_BankCode: string,
    vnp_BankTranNo: string,
    vnp_CardType: string,
    vnp_TmnCode: string,
    responseCode: string,
  ): Observable<any> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.apiUrl}/payment_infor?vnp_Amount=${vnp_Amount}&vnp_TxnRef=${vnp_TxnRef}&vnp_PayDate=${vnp_PayDate}&vnp_ResponseCode=${vnp_ResponseCode}&vnp_SecureHash=${vnp_SecureHash}&vnp_OrderInfo=${vnp_OrderInfo}&vnp_BankCode=${vnp_BankCode}&vnp_BankTranNo=${vnp_BankTranNo}&vnp_CardType=${vnp_CardType}&vnp_TmnCode=${vnp_TmnCode}&responseCode=${responseCode}`, { headers });
  }

  startPayment(amount: number, username: string): Observable<string> {
    const token = localStorage.getItem('token');

    if (!token) {
      return throwError(new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = { amount, username };
    return this.http.get<string>(`${this.apiUrl}/pay`, { headers, params, responseType: 'text' as 'json' });
  }
  getAllTrades(): Observable<TradeDTO[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<TradeDTO[]>(`${this.apiUrl}/trade`, { headers })
      .pipe(
        catchError(error => {
          console.error('Có lỗi xảy ra khi lấy danh sách giao dịch:', error);
          return throwError(() => new Error('Lỗi khi lấy danh sách giao dịch.'));
        })
      );
  }
  transferToken(
    senderSecretKeyBase58: string,
    toAddressBase58: string,
    mintAddressBase58: string,
    amount: number,
    solAmount: number,
    receiverSecretKeyBase58: string
  ): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams()
      .set('senderSecretKeyBase58', senderSecretKeyBase58)
      .set('toAddressBase58', toAddressBase58)
      .set('mintAddressBase58', mintAddressBase58)
      .set('amount', amount.toString())
      .set('solAmount', solAmount.toString())
      .set('receiverSecretKeyBase58', receiverSecretKeyBase58);

    return this.http.post(`${this.apiUrl}/wallet/transferToken`, null, { params, headers });
  }

  getWalletByUserId(userId: string): Observable<WalletResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<WalletResponse>(`${this.apiUrl}/wallet/${userId}`, { headers });
  }
  getTokenBalance(mintAddress: string, tokenAccountAddress: string): Observable<{ balance: string; message: string }> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });


    return this.http.get<{ balance: string; message: string }>(
      `${this.apiUrl}/wallet/balance?mintAddress=${mintAddress}&tokenAccountAddress=${tokenAccountAddress}`,
      { headers }
    );
  }
  addToCart(userId: string, tradeId: string, amount: number): Observable<string> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token không tồn tại.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });


    return this.http.post<string>(`${this.apiUrl}/cart/add`, null, {
      params: {
        userId,
        tradeId,
        amount: amount.toString()
      },
      headers
    });
  }

  getAllCartItemsByUserId(userId: string): Observable<CartDTO[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<CartDTO[]>(`${this.apiUrl}/cart/user/${userId}`, {
      headers
    });
  }
  getUserIdFromToken(): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<string>(`${this.apiUrl}/user/getuserid`, { headers });
  }
  deleteCartItem(cartId: string): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.delete<string>(`${this.apiUrl}/cart/delete/${cartId}`, { headers });
  }
  deactivateTrade(tradeId: string): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<string>(`${this.apiUrl}/trade/${tradeId}`, null, { headers, responseType: 'text' as 'json' });
  }
  getCoordinatesByProjectId(projectId: string): Observable<CoordinateDTO[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<CoordinateDTO[]>(`${this.apiUrl}/project/${projectId}/coordinates`, { headers });
  }
  requestWithdrawal(
    amount: number,
    bankName: string,
    bankAccountNumber: string,
    accountHolderName: string
  ): Observable<WithdrawalResponse> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token ?? ''}`,
      'Content-Type': 'application/json'
    });
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('bankName', bankName)
      .set('bankAccountNumber', bankAccountNumber)
      .set('accountHolderName', accountHolderName);
    return this.http.post<WithdrawalResponse>(`${this.apiUrl}/withdrawal/request`, null, { headers, params });
  }

  getTransactionHistoryAddressToken(tokenAddress: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams().set('tokenAddress', tokenAddress);

    return this.http.get<any>(`${this.apiUrl}/wallet/transaction-historyAdressToken`, { headers, params });
  }
  getAllWithdrawals(): Observable<WithdrawalDTO[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<WithdrawalDTO[]>(`${this.apiUrl}/withdrawal/all`, { headers });
  }
  updateWithdrawalStatus(withdrawalId: string, status: string): Observable<any> {
    const url = `${this.apiUrl}/withdrawal/update-status/${withdrawalId}?newStatus=${status}`;
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('jwt_token'));

    return this.http.put(url, {}, { headers });
  }
  getWithdrawalsByUserId(userId: string): Observable<WithdrawalDTO[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<WithdrawalDTO[]>(`${this.apiUrl}/withdrawal/user/${userId}`, { headers });
  }
  getTradesByUserIdAndMintToken(userId: string, mintToken: string): Observable<TradeDTO[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Gửi userId và mintToken dưới dạng query params
    const params = new HttpParams()
      .set('userId', userId)
      .set('mintToken', mintToken);  // Thay đổi từ projectId thành mintToken

    return this.http.get<TradeDTO[]>(`${this.apiUrl}/trade/user`, { headers, params });
  }

  updateTradeApproval(
    tradeId: string,
    newPrice: number,
    newApprovalStatus: string,
    newQuantity: number,
    newStatus: string
  ): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Cập nhật URL để bao gồm tham số newStatus
    const url = `http://localhost:8080/trade/updateApproval/${tradeId}?newPrice=${newPrice}&newApprovalStatus=${newApprovalStatus}&newQuantity=${newQuantity}&newStatus=${newStatus}`;

    return this.http.put<any>(url, {}, { headers });
  }

  updateTradeQuantity(tradeId: string, quantity: number): Observable<void> {

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Token không tồn tại!');
      return new Observable();
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const url = `${this.apiUrl}/trade/${tradeId}/quantity?quantity=${quantity}`;
    return this.http.put<void>(url, {}, { headers });
  }
  getTradeById(tradeId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.apiUrl}/trade/${tradeId}`, { headers });
  }
  deleteTrade(tradeId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.delete(`${this.apiUrl}/trade/${tradeId}`, { headers });
  }
  createTrade(tradeRequest: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.apiUrl}/trade/create`, tradeRequest, { headers });
  }
  getTokenAddress(publicKey: string, mintAddress: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams()
      .set('publicKey', publicKey)
      .set('mintAddress', mintAddress);
    return this.http.get<any>(`${this.apiUrl}/wallet/address`, { headers, params });
  }
  updateTradeTokenAddress(tradeId: string, newTokenAddress: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${this.apiUrl}/trade/${tradeId}/updateTokenAddress?newTokenAddress=${encodeURIComponent(newTokenAddress)}`;

    return this.http.put<any>(url, {}, { headers });
  }
  getmint(userId: string, projectId: string): Observable<Trade2DTO[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${this.apiUrl}/trade2/user/${userId}/project/${projectId}`;
    return this.http.get<Trade2DTO[]>(url, { headers });
  }
  getProjectsOfTradeByUserId(userId: string): Observable<ProjectOfTrade2[]> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Người dùng chưa đăng nhập. Token không tồn tại.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<ProjectOfTrade2[]>(`${this.apiUrl}/trade2/user/${userId}/projects`, { headers });
  }

}


