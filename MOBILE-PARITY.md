# Web and mobile parity review

Reviewed the current working-tree web implementation against the customer (`mobile`), employee (`employee-mobile`), and vendor (`vendor-mobile`) React Native apps. Existing web, backend, and mobile edits were preserved.

## Native changes

- Customer requirements use the web categories, priority values, quotation default, and account organization. Selected photos upload as authenticated multipart attachments. An upload retry reuses the saved requirement rather than creating another.
- Customer list filters and counts recognize requirement statuses. Lists refresh when focused; quotation details and conversations refresh periodically.
- Staff-approved quotations use the confirmation endpoint. Legacy shared quotations still use the selection endpoint. Final confirmation is displayed as awarded.
- Customer and employee notifications use account notifications instead of audit logs or hard-coded examples. Notification actions mark the item read and open the related requirement; vendor notification navigation also targets its requirement.
- Customer profiles use the current account and its notifications rather than staff-only directories and audit logs.
- Employees can accept/decline requests, review them, invite vendors, send direct quotations, and approve/reject/request revisions on individual vendor quotations. Review reasons and quotation inputs are validated.
- Vendors can accept/decline invitations and submit quotes after acceptance or revision requests. The latest quotation version supplies the form state. Declined and rejected orders appear in history.
- Employee chat displays the same multi-party conversation as the web. Employee and vendor chat refresh while details are open; lists refresh every 15 seconds. Mutation errors are visible, and busy actions are disabled.
- Employee/vendor detail sheets scroll, keeping actions reachable on small screens.
- All three development API targets now use the backend's default port 8080, with `10.0.2.2` for the Android emulator and `localhost` for iOS Simulator. Production remains `https://wefyx.pro/api`. Physical devices or custom backend ports need an appropriate host configuration.

## Browser access, not native parity

The customer app's Explore Wefyx screen links to the current website for public services, booking/report pages, shop, rentals/cart, data center, AMC, solutions, industries, company/support pages, careers, vendor registration, privacy, and the full portal. Employee and vendor profiles also link to the full portal.

Password recovery opens the web recovery flow in all three apps. The previous customer recovery screen only waited and claimed that instructions had been sent; that simulated success has been removed.

These links open the production website in a browser, require a separate browser sign-in for account functions, and depend on the deployed web version. They do **not** implement those pages as native screens or expose unpublished local web changes. Document downloads and web-only portal functionality remain available through the browser portal. Native layouts and registration screens remain different from the web, and native document selection/download parity has not been implemented.

The web itself contains demonstration UI, including the separate ServiceTickets screen's hard-coded ticket/report data. This review does not establish that every web feature is backed by a working production integration.

## Validation

Run from the repository root with Node 24 and the web Babel parser installed:

```powershell
node --test --test-isolation=none mobile/__tests__/workflow-parity.cjs
```

Nine passing handler-level regression tests cover customer confirmation (modern and legacy), upload retry behavior, employee acceptance and quotation revision validation, vendor decisions and numeric validation, notification routing, and authenticated multipart uploads. The suite executes the actual component handlers with stubbed hooks/API calls; it does not render or emulate the applications.

All modified TS/TSX files parse, and `git diff --check` passes for the mobile changes. Native dependency installation failed (missing offline cache packages; the online attempt also failed), so full TypeScript, Jest rendering, Android/iOS builds, and device verification remain outstanding. Full native parity is not certified.
