import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { FavoriteItemService } from '../../services/favoriteItem-service/favorite-item.service';
import { Observable } from 'rxjs';
import { FavoriteItem } from '../../models/favoriteItem';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, Navbar],
})
export class Favorites {
  favorites!: Observable<FavoriteItem[]>;

  constructor(private favoriteItemService: FavoriteItemService) {}

  ngOnInit(): void {
    //const userId = Number(localStorage.getItem('userId'));
    const userId = 1;
    this.favorites = this.favoriteItemService.getAllByUserId(userId);
  }
}
