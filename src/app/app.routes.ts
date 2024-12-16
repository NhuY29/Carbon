import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './home/home.component';
import { MapComponent } from './map/map.component';
import { WalletComponent } from './wallet/wallet.component';
import { AirdropComponent } from './airdrop/airdrop.component';
import { ProjectComponent } from './project/project.component';
import { ListProjectComponent } from './list-project/list-project.component';
import { ProjectParticipantsComponent } from './project-participants/project-participants.component';
import { CommonCategoryComponent } from './common-category/common-category.component';
import { CommonParentChildComponent } from './common-parent-child/common-parent-child.component';
import { MeasurementDataComponent } from './measurement-data/measurement-data.component';
import { MeasurementDataListComponent } from './measurement-data-list/measurement-data-list.component';
import { MeasurementDataAddComponent } from './measurement-data-add/measurement-data-add.component';
import { Form1Component } from './form1/form1.component';
import { MyprojectComponent } from './myproject/myproject.component';
import { SignatureComponent } from './signature/signature.component';
import { FormXNGDComponent } from './form-xngd/form-xngd.component';
import { SampleSentComponent } from './sample-sent/sample-sent.component';
import { SampleReceivedComponent } from './sample-received/sample-received.component';
import { GDViComponent } from './gdvi/gdvi.component';
import { TokenComponent } from './token/token.component';
import { ContactComponent } from './contact/contact.component';
import { PaymentResultComponent } from './payment-result/payment-result.component';
import { SettingComponent } from './setting/setting.component';
import { CartComponent } from './cart/cart.component';
import { WithdrawMoneyComponent } from './withdraw-money/withdraw-money.component';
import { ListRequestWithdrawComponent } from './list-request-withdraw/list-request-withdraw.component';
import { MyTradingListComponent } from './my-trading-list/my-trading-list.component';
import { AuthGuard } from './guards/auth.guard';
import { BurnComponent } from './burn/burn.component';
import { NoburnComponent } from './noburn/noburn.component';
import { ProjectDenyComponent } from './project-deny/project-deny.component';

export const routes: Routes = [
  {
    path: '',
    component: GDViComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard] 
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'ggmap',
    component: MapComponent
  },
  {
    path: 'wallet',
    component: WalletComponent
  },
  {
    path: 'airdrop',
    component: AirdropComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'project',
    component: ProjectComponent
  },
  {
    path: 'setting',
    component: SettingComponent
  },
  {
    path: 'list-project',
    component: ListProjectComponent,
    canActivate: [AuthGuard]
  },
  { path: 'project/:id', component: ProjectComponent },
  { path: 'project/:projectId/participants', component: ProjectParticipantsComponent },
  { path: 'commomCategory', component: CommonCategoryComponent, canActivate: [AuthGuard] },
  { path: 'commomCategoryParentChild', component: CommonParentChildComponent, canActivate: [AuthGuard] },
  { path: 'measurementData/:id', component: MeasurementDataComponent, },
  { path: 'measurementDataList/:id', component: MeasurementDataListComponent },
  { path: 'measurementDataListAdd', component: MeasurementDataAddComponent, canActivate: [AuthGuard] },
   { path: 'measurementDataListAdd/:id', component: MeasurementDataAddComponent, canActivate: [AuthGuard] },
  { path: 'measurementDataListAdd/Add/:projectId', component: MeasurementDataAddComponent, canActivate: [AuthGuard] },
  { path: 'form1/:id', component: Form1Component },
  { path: 'myproject', component: MyprojectComponent },
  { path: 'request/:id', component: SignatureComponent },
  { path: 'form-xngd', component: FormXNGDComponent, canActivate: [AuthGuard] },
  { path: 'form-xngd/:id', component: FormXNGDComponent, canActivate: [AuthGuard] },
  { path: 'sampleSent', component: SampleSentComponent },
  { path: 'sampleReceived', component: SampleReceivedComponent, canActivate: [AuthGuard] },
  { path: 'measurementDataList/:projectId/:id', component: MeasurementDataListComponent },
  {
    path: 'project-details/:id',
    component: ProjectComponent
  },

  {
    path: 'gdvi',
    component: GDViComponent
  },
  {
    path: 'tokenSolana',
    component: TokenComponent
  },

  {
    path: 'contact',
    component: ContactComponent
  },

  {
    path: 'test',
    component: PaymentResultComponent
  },
  {
    path: 'cart',
    component: CartComponent
  },
  {
    path: 'withdrawMoney',
    component: WithdrawMoneyComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'listRequestWithdraw',
    component: ListRequestWithdrawComponent,

  },
  {
    path: 'myTradingList',
    component: MyTradingListComponent
  },
  {
    path: 'burn',
    component: BurnComponent
  },
  {
    path: 'noburn',
    component: NoburnComponent
  },
  {
    path: 'projectDeny',
    component: ProjectDenyComponent
  },
  { path: 'ggmap/:projectId', component: MapComponent },
  { path: 'measurementDataList/:id/:projectId', component: MeasurementDataListComponent },
  // { path: 'login', loadChildren: () => import('.//login/login.component').then(m => m.LoginComponent) }
];
