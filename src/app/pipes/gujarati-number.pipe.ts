import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
    name: 'gujaratiNumber',
    standalone: true,
    pure: false
})
export class GujaratiNumberPipe implements PipeTransform {

    // English to Gujarati numeral mapping
    private gujaratiNumerals: { [key: string]: string } = {
        '0': '૦',
        '1': '૧',
        '2': '૨',
        '3': '૩',
        '4': '૪',
        '5': '૫',
        '6': '૬',
        '7': '૭',
        '8': '૮',
        '9': '૯'
    };

    constructor(private translationService: TranslationService) { }

    transform(value: any): string {
        if (value === null || value === undefined || value === '') return '';

        // Check if current language is Gujarati
        const currentLang = this.translationService.getCurrentLanguage();
        if (currentLang !== 'gu') {
            return value.toString();
        }

        // Convert to string and replace each digit
        const strValue = value.toString();
        let result = '';

        for (let char of strValue) {
            if (this.gujaratiNumerals[char]) {
                result += this.gujaratiNumerals[char];
            } else {
                result += char; // Keep non-numeric characters as-is
            }
        }

        return result;
    }
}
