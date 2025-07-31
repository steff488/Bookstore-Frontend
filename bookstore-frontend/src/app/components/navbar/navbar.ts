import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../material/material-module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, RouterModule],
})
export class Navbar {
  searchOpened = true;
  searchQuery = '';

  toggleSearch() {
    this.searchOpened = !this.searchOpened;
  }
}
