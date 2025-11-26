import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-buttons.html',
  styleUrls: ['./action-buttons.css']
})
export class ActionButtonsComponent {
  @Input() item!: any;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  editar() {
    this.edit.emit(this.item);
  }

  eliminar() {
    this.delete.emit(this.item);
  }
}