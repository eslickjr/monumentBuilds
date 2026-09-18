import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
  website: string = '';
  email: string = '';
  phone: string = '';
  description: string = '';
  /** Honeypot — real people leave it blank; bots fill it. */
  botField: string = '';
  /** Pre-selected on arrival from a Services "Let's get started" link (?type=...). */
  contractType: string = '';

  submitting = false;
  submitted = false;
  submitError = false;

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

  /** After the tall form is replaced by the short confirmation panel, the page
   *  collapses and the panel can land off-screen (below where the Submit button
   *  was) — so it looks like nothing happened. Bring it into view once Angular
   *  has rendered it. */
  private scrollToConfirmation(): void {
    setTimeout(() => {
      const panel = document.querySelector('.form-success') as HTMLElement | null;
      panel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  /** Submit the form to Netlify Forms. Netlify captures the POST and emails the
   *  submission to whichever address is configured in the site's form
   *  notifications (set to monumentbuilds@gmail.com in the Netlify dashboard).
   *  The static detection form lives in index.html so Netlify's build bot
   *  registers the "contact" form even though this SPA renders client-side. */
  async onSubmit(form: NgForm): Promise<void> {
    if (this.submitting) return;
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    // Honeypot tripped — silently pretend success, drop the submission.
    if (this.botField) {
      this.submitted = true;
      this.scrollToConfirmation();
      return;
    }

    this.submitting = true;
    this.submitError = false;

    const data = new URLSearchParams();
    data.set('form-name', 'contact');
    data.set('businessName', this.businessName);
    data.set('website', this.website);
    data.set('email', this.email);
    data.set('phone', this.phone);
    data.set('contractType', this.contractType);
    data.set('description', this.description);

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      });
      if (!res.ok) throw new Error(`Submit failed with status ${res.status}`);
      this.submitted = true;
      this.scrollToConfirmation();
    } catch {
      // Most common in local `ng serve` (no Netlify backend to accept the POST).
      this.submitError = true;
    } finally {
      this.submitting = false;
    }
  }
}
