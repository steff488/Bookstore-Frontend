import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../material/material-module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, RouterModule],
})
export class Navbar {
  @Input() showSearch = false;

  searchOpened = true;
  searchQuery = '';

  constructor(private searchService: SearchService) {}

  toggleSearch() {
    this.searchOpened = !this.searchOpened;
  }

  onSearch(event: any) {
    if (this.showSearch) {
      this.searchService.updateSearchQuery(event.target.value);
    }
  }
}
