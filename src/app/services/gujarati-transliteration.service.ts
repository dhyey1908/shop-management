import { Injectable } from '@angular/core';
import Sanscript from '@indic-transliteration/sanscript';

@Injectable({
  providedIn: 'root'
})
export class GujaratiTransliterationService {
  private isEnabled = true;

  constructor() { }

  toggle(status: boolean) {
    this.isEnabled = status;
  }

  getEnabled() {
    return this.isEnabled;
  }

  // Transliterate using Sanscript library (ITRANS to Gujarati)
  transliterateWord(word: string): string {
    if (!this.isEnabled || !word) return word;

    try {
      // Use ITRANS scheme for phonetic input to Gujarati output
      const result = Sanscript.t(word, 'itrans', 'gujarati');
      return result || word;
    } catch (error) {
      console.error('Transliteration error:', error);
      return word;
    }
  }

  // Get smart hints for current input
  getHints(input: string): Array<{ english: string; gujarati: string }> {
    if (!input) return [];

    const hints: Array<{ english: string; gujarati: string }> = [];
    const lowerInput = input.toLowerCase();
    const isConsonantEnding = /[bcdfghjklmnpqrstvwxyz]$/.test(lowerInput);

    const possibilities: string[] = [];

    if (isConsonantEnding) {
      // For consonant endings, show vowel completions
      possibilities.push(
        lowerInput,          // Current
        lowerInput + 'a',    // Implicit a
        lowerInput + 'aa',   // ા
        lowerInput + 'i',    // િ
        lowerInput + 'ii',   // ી
        lowerInput + 'u',    // ુ
        lowerInput + 'uu',   // ૂ
        lowerInput + 'e',    // ે
        lowerInput + 'ai',   // ૈ
        lowerInput + 'o',    // ો
        lowerInput + 'au'    // ૌ
      );
    } else {
      // For vowel endings
      possibilities.push(
        lowerInput,
        lowerInput + 'a',
        lowerInput + 'h',
        lowerInput + 'r',
        lowerInput + 'n',
        lowerInput + 'm'
      );
    }

    const seen = new Set<string>();

    for (const possibility of possibilities) {
      const result = this.transliterateWord(possibility);
      if (result !== possibility && !seen.has(result)) {
        hints.push({
          english: possibility,
          gujarati: result
        });
        seen.add(result);

        if (hints.length >= 8) break;
      }
    }

    return hints;
  }
}
