import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-settings',
  imports: [Navbar],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {}
