import { Directive, ElementRef, HostListener, Renderer2, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { GujaratiTransliterationService } from '../services/gujarati-transliteration.service';
import { GujaratiHintComponent } from '../components/gujarati-hint/gujarati-hint.component';

@Directive({
    selector: 'input[appGujaratiInput], textarea[appGujaratiInput]',
    standalone: true
})
export class GujaratiInputDirective {
    private buffer = '';
    private startPos = 0;
    private lastInsertedLength = 0;
    private hintComponentRef: ComponentRef<GujaratiHintComponent> | null = null;
    private isSelectingHint = false;

    constructor(
        private el: ElementRef,
        private service: GujaratiTransliterationService,
        private renderer: Renderer2,
        private appRef: ApplicationRef,
        private injector: EnvironmentInjector
    ) { }

    ngOnDestroy() {
        this.hideHints();
    }

    @HostListener('focus')
    @HostListener('click')
    onFocus() {
        if (!this.isSelectingHint) {
            this.reset();
        }
    }

    @HostListener('blur')
    onBlur() {
        // Short delay to check if we're selecting a hint
        setTimeout(() => {
            if (!this.isSelectingHint) {
                this.reset();
                this.hideHints();
            }
        }, 150);
    }

    @HostListener('document:mousedown', ['$event'])
    onDocumentClick(event: MouseEvent) {
        // Check if click is outside the input and hints
        const clickedElement = event.target as HTMLElement;
        const input = this.el.nativeElement;

        // If clicking outside input and not on hints, just hide hints (don't insert)
        if (!input.contains(clickedElement) &&
            !clickedElement.closest('.gujarati-hints')) {
            this.hideHints();
        }
    }

    @HostListener('keydown', ['$event'])
    onKeydown(event: KeyboardEvent) {
        if (!this.service.getEnabled()) {
            this.hideHints();
            return;
        }

        // Handle navigation keys when hints are visible
        if (this.hintComponentRef) {
            if (event.key === 'ArrowDown' || event.key === 'PageDown') {
                event.preventDefault();
                this.hintComponentRef.instance.moveSelection('down');
                return;
            }
            if (event.key === 'ArrowUp' || event.key === 'PageUp') {
                event.preventDefault();
                this.hintComponentRef.instance.moveSelection('up');
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                this.hintComponentRef.instance.selectCurrent();
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.hideHints();
                return;
            }
        }

        // Allow control combinations
        if (event.ctrlKey || event.altKey || event.metaKey) return;

        const key = event.key;

        // Handle Backspace
        if (key === 'Backspace') {
            if (this.buffer.length > 0) {
                this.buffer = this.buffer.slice(0, -1);
                if (this.buffer.length === 0) {
                    this.reset();
                    this.hideHints();
                } else {
                    this.updateTransliteration();
                    this.showHints();
                }
            }
            return;
        }

        // Handle Space or punctuation - commit word
        if (key === ' ' || /^[.,!?;:]$/.test(key)) {
            this.reset();
            this.hideHints();
            return;
        }

        // Handle alphabetic input
        if (/^[a-zA-Z]$/.test(key)) {
            event.preventDefault();

            if (this.buffer.length === 0) {
                const input = this.el.nativeElement;
                this.startPos = input.selectionStart || 0;
                this.lastInsertedLength = 0;
            }

            this.buffer += key;
            this.updateTransliteration();
            this.showHints();
        }
    }

    private updateTransliteration() {
        const input = this.el.nativeElement;
        const gujaratiText = this.service.transliterateWord(this.buffer);

        const value = input.value;
        const before = value.substring(0, this.startPos);
        const after = value.substring(this.startPos + this.lastInsertedLength);

        const newValue = before + gujaratiText + after;
        input.value = newValue;

        // Update cursor position
        const newPos = this.startPos + gujaratiText.length;
        input.setSelectionRange(newPos, newPos);

        // Update tracking
        this.lastInsertedLength = gujaratiText.length;

        // Trigger input event
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    private showHints() {
        if (!this.buffer) {
            this.hideHints();
            return;
        }

        const hints = this.service.getHints(this.buffer);

        if (hints.length === 0) {
            this.hideHints();
            return;
        }

        if (!this.hintComponentRef) {
            this.hintComponentRef = createComponent(GujaratiHintComponent, {
                environmentInjector: this.injector
            });

            this.appRef.attachView(this.hintComponentRef.hostView);
            const domElem = (this.hintComponentRef.hostView as any).rootNodes[0] as HTMLElement;
            document.body.appendChild(domElem);

            // Subscribe to hint selection
            this.hintComponentRef.instance.hintSelected.subscribe((hint) => {
                this.selectHint(hint);
            });
        }

        // Position hints
        const input = this.el.nativeElement;
        const rect = input.getBoundingClientRect();

        this.hintComponentRef.instance.hints = hints;
        this.hintComponentRef.instance.selectedIndex = 0; // Reset to first item
        this.hintComponentRef.instance.position = {
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX
        };
    }

    private selectHint(hint: { english: string; gujarati: string }) {
        // Set flag immediately to prevent blur interference
        this.isSelectingHint = true;

        const input = this.el.nativeElement;

        // Get current value and calculate positions
        const value = input.value;
        const before = value.substring(0, this.startPos);
        const after = value.substring(this.startPos + this.lastInsertedLength);

        // Replace with selected Gujarati text
        const newValue = before + hint.gujarati + after;
        input.value = newValue;

        // Position cursor after inserted text
        const newPos = this.startPos + hint.gujarati.length;
        input.setSelectionRange(newPos, newPos);

        // Trigger input event for Angular forms
        const inputEvent = new Event('input', { bubbles: true });
        input.dispatchEvent(inputEvent);

        // Reset state
        this.buffer = '';
        this.lastInsertedLength = 0;
        this.hideHints();

        // Restore focus and clear flag
        setTimeout(() => {
            input.focus();
            this.isSelectingHint = false;
        }, 50);
    }

    private hideHints() {
        if (this.hintComponentRef) {
            this.appRef.detachView(this.hintComponentRef.hostView);
            this.hintComponentRef.destroy();
            this.hintComponentRef = null;
        }
    }

    private reset() {
        this.buffer = '';
        this.lastInsertedLength = 0;
    }
}
