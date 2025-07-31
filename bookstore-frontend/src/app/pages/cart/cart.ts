import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { CartItemService } from '../../services/cartItem-service/cartItem.service';
import { Observable } from 'rxjs';
import { CartItem } from '../../models/cartItem';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, Navbar],
})
export class Cart {
  cart!: Observable<CartItem[]>;

  constructor(private cartItemService: CartItemService) {}

  ngOnInit(): void {
    //const userId = Number(localStorage.getItem('userId'));
    const userId = 1;
    this.cart = this.cartItemService.getAllByUserId(userId);
  }
}
