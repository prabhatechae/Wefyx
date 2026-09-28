# Wefyx reference UI

## Scope and architecture

React/Vite, Tailwind, Lucide icons, pathname routing, and the existing API authentication/request helpers remain in use. Existing public services, support requests, registration, customer requirements/quotations, employee workspaces, and administration pages remain available. This continuation preserves the pre-existing working-tree changes, including the booking backend, and does not modify backend contracts or database logic.

## Frontend implementation

- Green/navy theme, responsive white cards, labeled fields, service selection, progress indicators and existing image assets.
- Existing email/password registration, review/edit data retention, success screen with service links, and login styling. Login returns to supported booking/task deep links. No prefilled administrator email.
- Home support cards select the corresponding booking service; prices come from `/bookings/catalog`.
- `/book-support`: details, attachments, live availability calendar, location, payment summary, and confirmation view. Booking fields retain their API names and validation. The existing IndexedDB file helper now accepts a separate booking key, preserving requirement attachments independently. Files survive login navigation.
- `/my-tickets` and `/my-tickets/:id`: real customer bookings, status filters, detail cards, timestamped progress, attachment downloads and service reports.
- `/service-tasks` and `/service-tasks/:id`: assigned work, start-service action, report submission, checked actions, optional photo previews/removal before upload, and completion display.
- `/support-updates/:id`: customer notification with a link to the actual report. Booking notification links are connected from the existing customer/employee portals.
- Shared `BookingUI.jsx`, `booking.css`, and `ServiceTickets.jsx` implement the booking/report visual language; existing portal workflows stay available.

## Backend-dependent limits

The current booking catalog returns `checkoutAvailable: false`, and its checkout endpoint rejects payment. The UI therefore disables payment methods and confirmation payment, offers saving an awaiting-payment request, and never claims that saving reserves an appointment. Confirmed/assigned/completed screens read actual server status; they do not manufacture payment or ticket data.

The existing registration contract supports name, organization, email, phone, password and role. It has no mobile OTP, social login, password recovery, or onboarding address/trade-license/industry persistence. These are not simulated or submitted as unsupported fields. Registration keeps its supported business/account and review steps rather than presenting a nonfunctional OTP/address workflow. Separate React Native apps were not changed in this continuation.

## Verification (25 September 2026)

- Vite production build passes.
- Browser layout checks passed at 320, 768, 1024 and 1440px for home, registration, login, booking details and unauthenticated customer/employee routes: no horizontal overflow or broken images.
- Calendar and customer ticket detail checked at 320, 768 and 1440px. Desktop/mobile booking screenshots and mobile engineer report visually inspected.
- Real API tests used an isolated in-memory H2 database, mail disabled, and a test-only local CORS origin. Registration, review/back data retention, automatic login, service selection, availability, booking save, customer listing/filtering, login return, attachment restoration and upload passed. No runtime exceptions or HTTP errors in the successful runs. No application database was used.
- Engineer start/report API calls, checked action payload, completed report display and notification navigation passed controlled browser API-fixture tests, including 320/768/1440px report layouts. This does not verify live assignment/payment-to-completion integration; live checkout is unavailable.
- Changed tracked frontend files pass whitespace checking with Windows CRLF treated as line endings.
- Browser test scripts and review screenshots are local artifacts under `.tools/`. Existing full ESLint configuration is absent; lint is not claimed as passing.

## Remaining integration verification

Live paid confirmation, engineer assignment and completion, actual notification delivery, and OTP/social/password-recovery flows require their corresponding backend/provider support. They cannot be verified as working end to end from the current implementation.
