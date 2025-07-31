import { Component, OnInit, HostListener } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user-service/user.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.html',
  styleUrl: './my-account.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, Navbar],
})
export class MyAccount {
  user!: Observable<User>;
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    //const userId = Number(localStorage.getItem('userId'));
    const userId = 1;
    this.user = this.userService.getUserById(userId);
  }
}
