import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GujaratiHint {
  english: string;
  gujarati: string;
}

@Component({
  selector: 'app-gujarati-hint',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gujarati-hints" [style.top.px]="position.top" [style.left.px]="position.left">
      <div class="hint-item" 
           *ngFor="let hint of hints; let i = index" 
           [class.selected]="i === selectedIndex"
           (mousedown)="onHintClick($event, hint)"
           (mouseenter)="selectedIndex = i">
        <span class="hint-english">{{ hint.english }}</span>
        <span class="hint-arrow">→</span>
        <span class="hint-gujarati">{{ hint.gujarati }}</span>
      </div>
    </div>
  `,
  styles: [`
    .gujarati-hints {
      position: absolute;
      background: white;
      border: 2px solid #6366f1;
      border-radius: 8px;
      padding: 8px 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-size: 14px;
      min-width: 150px;
      user-select: none;
    }

    .hint-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      white-space: nowrap;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.15s;
    }

    .hint-item:hover {
      background-color: #eff6ff;
    }

    .hint-item.selected {
      background-color: #dbeafe;
      outline: 2px solid #6366f1;
    }

    .hint-item:active {
      background-color: #bfdbfe;
    }

    .hint-english {
      color: #6b7280;
      font-family: monospace;
      font-weight: 600;
    }

    .hint-arrow {
      color: #6366f1;
      font-weight: bold;
    }

    .hint-gujarati {
      color: #1f2937;
      font-weight: 700;
      font-size: 16px;
    }

    .hint-item:not(:last-child) {
      border-bottom: 1px solid #f3f4f6;
    }
  `]
})
export class GujaratiHintComponent {
  @Input() hints: GujaratiHint[] = [];
  @Input() position = { top: 0, left: 0 };
  @Output() hintSelected = new EventEmitter<GujaratiHint>();
  @Output() navigationKey = new EventEmitter<string>();

  selectedIndex = 0;

  onHintClick(event: MouseEvent, hint: GujaratiHint) {
    event.preventDefault();
    event.stopPropagation();
    this.hintSelected.emit(hint);
  }

  selectCurrent() {
    if (this.hints.length > 0 && this.selectedIndex >= 0 && this.selectedIndex < this.hints.length) {
      this.hintSelected.emit(this.hints[this.selectedIndex]);
    }
  }

  moveSelection(direction: 'up' | 'down') {
    if (direction === 'down') {
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.hints.length - 1);
    } else {
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    }
  }
}
