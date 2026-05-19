import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MiniRpgPlayground } from "./features/mini-rpg-playground/mini-rpg-playground";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MiniRpgPlayground],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
