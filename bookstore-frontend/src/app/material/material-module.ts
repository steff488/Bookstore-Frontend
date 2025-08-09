import { NgModule } from '@angular/core';
import { MatButtonModule, MatMiniFabButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatDivider } from '@angular/material/divider';
import { MatSelect, MatOption } from '@angular/material/select';
import {
  MatChipGrid,
  MatChipRow,
  MatChipListbox,
  MatChip,
  MatChipSet,
  MatChipOption,
} from '@angular/material/chips';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSliderModule } from '@angular/material/slider';

const MaterialComponents = [MatButtonModule];

@NgModule({
  imports: [
    MaterialComponents,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatFormField,
    MatLabel,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatDivider,
    MatSelect,
    MatOption,
    MatChipGrid,
    MatChipRow,
    MatMenu,
    MatMenuModule,
    MatInputModule,
    MatMiniFabButton,
    MatChip,
    MatChipSet,
    MatPaginatorModule,
    MatSliderModule,
    MatChipListbox,
    MatChipOption,
  ],
  exports: [
    MaterialComponents,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatFormField,
    MatLabel,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatDivider,
    MatSelect,
    MatOption,
    MatChipGrid,
    MatChipRow,
    MatMenu,
    MatMenuModule,
    MatInputModule,
    MatMiniFabButton,
    MatChip,
    MatChipSet,
    MatPaginatorModule,
    MatSliderModule,
    MatChipListbox,
    MatChipOption,
  ],
})
export class MaterialModule {}
