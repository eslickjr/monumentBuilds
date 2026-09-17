import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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
  /** Pre-selected on arrival from a Services "Let's get started" link (?type=...). */
  contractType: string = '';

  constructor(private route: ActivatedRoute) {
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type) {
      this.contractType = type;
    }
  }

  onBusinessNameChange(newValue: string): void {
    this.businessName = newValue.replace(/[^a-zA-Z0-9\s]/g, '');
    this.businessNameContent = this.businessName.length > 0;
  }
}
