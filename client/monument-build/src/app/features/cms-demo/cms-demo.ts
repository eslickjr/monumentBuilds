import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Content, fetchOneEntry, type BuilderContent } from '@builder.io/sdk-angular';

/**
 * Builder.io public API key for the Monument Builds space. This is a *public*
 * read key — it's meant to ship in the front-end bundle and only grants read
 * access to published content, so it is safe to commit.
 */
const BUILDER_API_KEY = 'bf7d3f3e67cd4898abebc7ae7552cfb0';

/**
 * Live CMS demo. Renders whatever is published in Builder.io for the "page"
 * model targeting the URL path /cms-demo. Editors change it visually in
 * Builder and publish — no code change, no redeploy — and it updates here.
 */
@Component({
  selector: 'app-cms-demo',
  standalone: true,
  imports: [CommonModule, Content],
  templateUrl: './cms-demo.html',
  styleUrl: './cms-demo.css',
})
export class CmsDemo {
  readonly apiKey = BUILDER_API_KEY;
  readonly model = 'page';

  content: BuilderContent | null = null;
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      this.content = await fetchOneEntry({
        model: this.model,
        apiKey: this.apiKey,
        userAttributes: { urlPath: '/cms-demo' },
      });
    } catch {
      this.content = null;
    } finally {
      this.loading.set(false);
    }
  }
}
