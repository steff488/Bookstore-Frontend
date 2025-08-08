import { Component } from '@angular/core';
import { MaterialModule } from '../../material/material-module';

@Component({
  selector: 'app-sidebar',
  imports: [MaterialModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {}
