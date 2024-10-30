import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSliderModule, NzInputNumberModule, NzGridModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  host: { 'ngSkipHydration': '' }
})
export class CartComponent {

}
