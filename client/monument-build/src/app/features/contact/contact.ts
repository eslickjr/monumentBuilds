import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {
  businessName: string = '';
  businessNameContent: boolean = false;

  onBusinessNameChange(newValue: string): void {
    this.businessName = newValue.replace(/[^a-zA-Z0-9\s]/g, '');
    this.businessNameContent = this.businessName.length > 0;
  }
}
