import { Component } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  template: '<ng-content />',
  styleUrl: './icon.scss',
  host: {
    class: 'material-symbols-outlined',
  },
})
export class Icon {}
