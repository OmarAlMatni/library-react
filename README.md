# Ledger — School Library Frontend

A React + Vite web app for the Laravel school-library backend. Built for librarians to
manage libraries, catalogue books, track borrows and reservations, and look up students.

## Stack

- React 18 + React Router (client-side routing, protected routes)
- Vite 6
- Tailwind CSS v4 (CSS-first theme in `src/index.css`)
- axios for API calls
- lucide-react for icons

No state-management library — auth lives in a small context, everything else is fetched
per-page with `useState`/`useEffect`.

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL if your backend isn't on the default port
npm run dev
```

The app expects the Laravel backend at `VITE_API_URL` (default
`http://127.0.0.1:8000/api`, i.e. `php artisan serve`'s default address with `/api`
appended).

### Backend checklist

From the `library` Laravel project:

```bash
composer install
php artisan migrate --seed
php artisan serve
```

The seeder creates one librarian you can sign in with:

- **Email:** `librarian@example.com`
- **Password:** `password`

Laravel's default CORS config (Laravel 11+) already allows all origins on `api/*`
routes, so no CORS changes should be needed for local dev. Auth is token-based
(Sanctum personal access tokens sent as `Authorization: Bearer <token>`) — not
cookie/session based — so there's no CSRF cookie step required.

## Two backend behaviors worth knowing about

**1. Student lookups depend on an external service.** `student_id` fields aren't
validated against a local table — `BorrowService`/`ReservationService` confirm the
student exists by calling out to a Spring Boot "school-core" service at
`SCHOOL_API_URL` (unset by default, falls back to `http://localhost:8080`). If that
service isn't running, the **Students** search page, and creating any borrow or
reservation, will fail — you'll see "student not found" even for a valid ID. Listing
existing borrows/reservations still works fine either way, since resolving student
names there fails soft (shows `Student #<id>`) instead of erroring. To develop
against this locally, point `SCHOOL_API_URL` at a small mock server that responds to:

- `GET /api/students/search?query=...` → `[{ id, registrationNumber, fullName, className }, ...]`
- `GET /api/students/{id}` → `{ id, registrationNumber, fullName, className }`

**2. Uploaded cover images don't come back on later requests.** The upload endpoint
works and returns the file's URL, which this app shows immediately after upload. But
`BookController`/`BookRepository` never eager-load the `coverImage` relation on
subsequent `index`/`show` calls, so the `cover` field is simply absent from the API
response once you reload the book list. The frontend keeps uploaded covers in local
state for the current session so they don't disappear right away, but a full page
reload will lose them until the backend eager-loads `coverImage` (e.g.
`$query->with('coverImage')` in `BookRepository::searchAndPaginate`/`find`).

## Project structure

```
src/
  api/          one file per backend resource (auth, books, libraries, students,
                reservations, borrows, reports) — thin wrappers around axios
  lib/api.js    axios instance, token storage, 401 handling, error-message helper
  lib/toast.jsx lightweight toast notifications
  context/      AuthContext (session state, login/logout)
  components/   shared UI: Layout, Modal, ConfirmDialog, Pagination, StatusBadge,
                StudentPicker / BookPicker (search-to-select), etc.
  pages/        one page per route (Dashboard, Libraries, Books, Students,
                Reservations, Borrows, Reports, Login)
```

## Design notes

The visual language is a "library ledger / card catalog" theme: navy ink on a cool
paper background, a serif display face (Source Serif 4) for headings, IBM Plex Sans
for body text, and IBM Plex Mono for ISBNs, dates, and IDs. Status values (borrow
state, reservation state) render as a rotated "stamp" badge, echoing a library due-date
stamp — the one repeated signature element across the app.

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```
