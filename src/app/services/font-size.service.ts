import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

@Injectable({
    providedIn: 'root'
})
export class FontSizeService {
    private currentSizeSubject = new BehaviorSubject<FontSize>('medium');
    public currentSize$ = this.currentSizeSubject.asObservable();

    constructor() {
        // Load saved font size from localStorage if available
        const savedSize = localStorage.getItem('fontSize') as FontSize;
        if (savedSize) {
            this.setFontSize(savedSize);
        }
    }

    setFontSize(size: FontSize) {
        this.currentSizeSubject.next(size);
        localStorage.setItem('fontSize', size);

        // Apply font size class to body element
        if (typeof document !== 'undefined') {
            // Remove all font size classes
            document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');

            // Add the selected font size class
            document.body.classList.add(`font-${size}`);
        }
    }

    getCurrentSize(): FontSize {
        return this.currentSizeSubject.value;
    }

    increaseFontSize() {
        const sizes: FontSize[] = ['small', 'medium', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(this.currentSizeSubject.value);
        if (currentIndex < sizes.length - 1) {
            this.setFontSize(sizes[currentIndex + 1]);
        }
    }

    decreaseFontSize() {
        const sizes: FontSize[] = ['small', 'medium', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(this.currentSizeSubject.value);
        if (currentIndex > 0) {
            this.setFontSize(sizes[currentIndex - 1]);
        }
    }
}
