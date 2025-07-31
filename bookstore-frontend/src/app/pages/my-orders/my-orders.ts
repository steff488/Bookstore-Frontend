import { Component, OnInit, HostListener } from '@angular/core';
import { OrderService } from '../../services/order-service/order.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { Observable } from 'rxjs';
import { Order } from '../../models/order';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, Navbar],
})
export class MyOrders {
  orders!: Observable<Order[]>;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    //const userId = Number(localStorage.getItem('userId'));
    const userId = 1;
    this.orders = this.orderService.getAllByUserId(userId);
  }
}
