# JAPANITEM readability and quotation improvements — 2026-10-09

Status: deployed to production on 2026-10-20 together with WeChat contact `ks75995`.
Deployment: `dpl_5bYfEzJ3kX3Vmx74bKyfhcCh49dM` (`https://www.japanitem.com`).
No Git push was performed as part of this deployment.

## Delivered

- Homepage search by product name, brand or JAN; responsive brand-card lettering.
- Homepage category/product/brand counts derive from the deduplicated catalog.
- Product cards show JAN and an explicit Add to quote action.
- Product detail pages support quote-list additions and direct single-product requests.
- Guest quote flow uses the existing inquiry form and notification service; no account, payment or unpublished spend threshold is needed to inquire.
- Inquiry form shows the exact reviewed product/quantity snapshot. Failure preserves form and cart. Success removes only submitted quantities, preserving concurrent additions.
- The inquiry API returns a request reference only after notification acceptance and database commit. The reference appears in the email, database notes and browser confirmation.
- Newsletter HTTP failures no longer display success or clear the email field.
- Unverified inventory badges/filtering no longer imply actual stock. Missing photos use an explicitly labeled placeholder, including generated static pages.
- EN/ZH/JA legal dictionaries restored to their intended languages; chatbot returns policy reads the same published policy string.
- Brand search, clearer catalog labels, useful bulk-inquiry preparation notes, and mobile support-button footprint reduction.

## Verification

- `npm run test:inquiry`: mocked database/mail integration; no external email sent.
- `node tools/test-readability-browser.js`: Playwright/Edge, local static server and intercepted inquiry responses; no external inquiry sent. Checks 320/375/414/768/1280px, guest quote review, failed/malformed responses, request reference, concurrent cart preservation and policy translations.
- `npm run audit:seo`: 2,348 products, six categories, 77 brands, 2,436 sitemap URLs; no audit failures.
- `npm run test:specs`: 1,048 enriched source-backed product records.

The browser test requires Playwright to be available through the configured Node runtime or NODE_PATH.

## Remaining work

- Verify product-specific English names and actual packaging photos, prioritizing the main brands. Category labels are not a substitute for verified product-name translation.
- Confirm business-approved order minimums and transaction terms; this change does not invent a new purchase minimum or rewrite the underlying commercial policy.
- Test real notification delivery after deployment with an explicitly authorized test inquiry. Mail-service acceptance is not proof of inbox delivery.
- Further accessibility and typography audit beyond the scoped responsive regression. No claim of full WCAG compliance or objective superiority over a competitor is made.
