import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, MaterialModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {}
