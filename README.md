# CareFlow MVP

CareFlow is a responsive support-worker portal built from the client's Daily Care
Needs and Seizure Observation forms. It is designed as a fast web app/PWA that
works on phones, tablets, and desktop browsers.

## Included in the MVP

- Invite-only worker and manager accounts — there is no public sign-up
- Manager-controlled team access: create accounts and grant or revoke
  patient-by-patient access
- Searchable patient directory, and a patient profile showing recent shifts,
  care team and follow-ups — the way in to writing a note
- Patient creation with automatic care-team assignment
- Current-shift dashboard and handover summary
- Five-step daily care record with draft saving and submission locking
- Seizure observation records linked to the daily report
- Report history filtered by home, patient, support worker and date range
- Spreadsheet (CSV) export of every filtered record, ready for Excel or Sheets
- Care book: all filtered records as one printable, PDF-ready document
- Print-friendly PDF export of a single record using **Save as PDF**
- Previous/next report navigation
- Announcements with acknowledgement tracking
- Audit events for report creation, editing, submission, export, account
  creation and access changes
- Mobile navigation and an installable PWA manifest

## Demo accounts

Every account uses the password `password`.

| Email | Role |
| --- | --- |
| `worker@careflow.test` | Support worker (Aisha Rahman) — signs in to a shift that is running now |
| `manager@careflow.test` | Manager (Denise Whitlock) — sees all three homes and team access |
| `worker2@careflow.test` … `worker6@careflow.test` | Additional support workers |

`php artisan migrate --seed` builds a full demonstration service: three homes,
seven patients, four weeks of daily records across day, evening and night
shifts, seizure observations, announcements and the matching audit trail. The
data is generated from a fixed seed, so every rebuild is identical.

## Local setup

Requirements: PHP 8.3+, Composer, Node.js 22+, and SQLite (or PostgreSQL for
production).

```powershell
composer install
npm install
Copy-Item .env.example .env
php artisan key:generate
New-Item database/database.sqlite -ItemType File -Force
php artisan migrate --seed
npm run build
php artisan serve
```

Open `http://127.0.0.1:8000`. During interface development, run `npm run dev`
in a second terminal instead of rebuilding assets after each change.

On this Windows workspace, the portable PHP runtime is already configured. Run
`./preview.ps1` from the project directory to start the built MVP directly.

## Quality checks

```powershell
php artisan test
npm run types:check
npm run lint:check
npm run build
php vendor/bin/pint --test
```

## Going to production

Use PostgreSQL, HTTPS, encrypted backups, managed file storage, and a real mail
provider. The SQLite database is intended for local demonstration only.

Seed accounts only — never the sample care data:

```powershell
php artisan db:seed --class=AccountSeeder
```

Change every seeded password before the service is reachable from the internet,
and create real staff accounts from **Team access** rather than reusing the demo
logins.
