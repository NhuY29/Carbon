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
export const routes: Routes = [
  {
    path: '',
    component:HomeComponent
},
{
  path: 'register',
  component:RegisterComponent
},
{
  path: 'login',
  component:LoginComponent
},
{
  path: 'user',
  component:UserComponent
},

{
  path: 'ggmap',
  component:MapComponent
},
{
  path: 'wallet',
  component:WalletComponent
},
{
  path: 'airdrop',
  component:AirdropComponent
},
{
  path: 'project',
  component:ProjectComponent
},
{
  path: 'setting',
  component:SettingComponent
},
{
  path: 'list-project',
  component:ListProjectComponent
},
{ path: 'project/:id', component: ProjectComponent },
{ path: 'project/:projectId/participants', component: ProjectParticipantsComponent },
{ path: 'commomCategory', component: CommonCategoryComponent },
{ path: 'commomCategoryParentChild', component: CommonParentChildComponent },
{ path: 'measurementData/:id', component: MeasurementDataComponent },
{ path: 'measurementDataList/:id', component: MeasurementDataListComponent },
{ path: 'measurementDataListAdd', component: MeasurementDataAddComponent },
{ path: 'measurementDataListAdd/:id', component: MeasurementDataAddComponent },
{ path: 'form1/:id', component: Form1Component },
{ path: 'myproject', component: MyprojectComponent },
{ path: 'request/:id', component: SignatureComponent },
{ path: 'form-xngd', component: FormXNGDComponent },
{ path: 'form-xngd/:id', component: FormXNGDComponent },
{ path: 'sampleSent', component: SampleSentComponent },
{ path: 'sampleReceived', component: SampleReceivedComponent },
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
  component: WithdrawMoneyComponent
},
 { path: 'ggmap/:projectId', component: MapComponent },
{ path: 'measurementDataList/:id/:projectId', component: MeasurementDataListComponent },
  // { path: 'login', loadChildren: () => import('.//login/login.component').then(m => m.LoginComponent) }
];
