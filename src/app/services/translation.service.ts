import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { translations } from '../i18n/translations';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private currentLangSubject = new BehaviorSubject<string>('en');
    currentLang$ = this.currentLangSubject.asObservable();

    constructor() {
        // Load saved language from localStorage if available
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            this.setLanguage(savedLang);
        }
    }

    setLanguage(lang: string) {
        this.currentLangSubject.next(lang);
        localStorage.setItem('language', lang);

        // Add or remove lang-gu class on body element for Gujarati-specific styling
        if (typeof document !== 'undefined') {
            if (lang === 'gu') {
                document.body.classList.add('lang-gu');
            } else {
                document.body.classList.remove('lang-gu');
            }
        }
    }

    getCurrentLanguage(): string {
        return this.currentLangSubject.value;
    }

    translate(key: string): string {
        const lang = this.currentLangSubject.value;
        return translations[lang]?.[key] || key;
    }
}
