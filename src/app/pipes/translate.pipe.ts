import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
    name: 'translate',
    standalone: true,
    pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
    private subscription: Subscription;

    constructor(private translationService: TranslationService, private ref: ChangeDetectorRef) {
        this.subscription = this.translationService.currentLang$.subscribe(() => {
            this.ref.markForCheck();
        });
    }

    transform(key: string): string {
        return this.translationService.translate(key);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
