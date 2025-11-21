import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
    value: string;
    label: string;
    subtitle?: string;
}

@Component({
    selector: 'app-searchable-dropdown',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchableDropdownComponent),
            multi: true
        }
    ],
    templateUrl: './searchable-dropdown.component.html',
    styleUrl: './searchable-dropdown.component.css'
})
export class SearchableDropdownComponent implements OnInit, ControlValueAccessor {
    @Input() options: DropdownOption[] = [];
    @Input() placeholder = 'Search...';
    @Input() label = '';
    @Output() selectionChange = new EventEmitter<string>();

    searchTerm = '';
    filteredOptions: DropdownOption[] = [];
    isOpen = false;
    selectedValue: string | null = null;
    selectedLabel = '';

    private onChange: (value: any) => void = () => { };
    private onTouched: () => void = () => { };

    ngOnInit() {
        this.filteredOptions = this.options;
    }

    writeValue(value: any): void {
        this.selectedValue = value;
        if (value) {
            const option = this.options.find(o => o.value === value);
            this.selectedLabel = option ? option.label : '';
            this.searchTerm = this.selectedLabel;
        } else {
            this.selectedLabel = '';
            this.searchTerm = '';
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    onSearchChange() {
        const searchLower = this.searchTerm.toLowerCase();
        this.filteredOptions = this.options.filter(option =>
            option.label.toLowerCase().includes(searchLower) ||
            (option.subtitle && option.subtitle.toLowerCase().includes(searchLower))
        );
        this.isOpen = true;
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.filteredOptions = this.options;
        }
    }

    selectOption(option: DropdownOption) {
        this.selectedValue = option.value;
        this.selectedLabel = option.label;
        this.searchTerm = option.label;
        this.isOpen = false;
        this.onChange(option.value);
        this.selectionChange.emit(option.value);
    }

    clearSelection() {
        this.selectedValue = null;
        this.selectedLabel = '';
        this.searchTerm = '';
        this.filteredOptions = this.options;
        this.onChange(null);
        this.selectionChange.emit('');
        this.onTouched();
    }

    onInputFocus() {
        this.isOpen = true;
        this.filteredOptions = this.options;
    }

    onInputBlur() {
        // Delay to allow click on option
        setTimeout(() => {
            if (!this.selectedValue && this.searchTerm) {
                // Auto-select first match if exists
                if (this.filteredOptions.length === 1) {
                    this.selectOption(this.filteredOptions[0]);
                }
            }
            this.isOpen = false;
        }, 200);
    }
}
