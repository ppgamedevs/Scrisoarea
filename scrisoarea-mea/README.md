This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

Copy `.env.example` to `.env` (or `.env.local`) and fill in the values.

Required for production: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_APP_URL`.
Admin account: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (used by `npm run db:seed` and `npm run db:sync-admin`).
Auth: `BETTER_AUTH_SECRET` (required — generate with `openssl rand -base64 32`), optional `BETTER_AUTH_URL` (defaults to `NEXT_PUBLIC_APP_URL`).
Email (Resend, required for verification/reset): `RESEND_API_KEY`, `EMAIL_FROM` (verified domain, e.g. `Visuri pe hartie <noreply@your-domain.ro>`).
Test Resend: `npm run email:test -- you@example.com`
Optional: `CONTACT_EMAIL`, `NEXT_PUBLIC_ASSOCIATION_CUI`, `ASSOCIATION_LEGAL_NAME`, `ASSOCIATION_IBAN` (Form 230 destination), `FORM_230_FISCAL_YEAR` / `NEXT_PUBLIC_FORM_230_FISCAL_YEAR` (income year on Form 230, e.g. `2025`), `FORM_230_DEFAULT_PERCENT`, `NEXT_PUBLIC_SOCIAL_*`, `CRON_SECRET` (protects `/api/cron/*`).

Form 230 PDF uses the official ANAF template at `private/forms/formular-230-OPANAF-103-2025.pdf` (OPANAF 103/2025), filled server-side with `pdf-lib`.

Company sponsorship (`/directioneaza-20`) supports two separate flows: direct sponsorship contract (Law 32/1994) and Draft Form 177 (OPANAF 3562/2024). Configure `SPONSORSHIP_BENEFICIARY_*` and `BENEFICIARY_ANAF_REGISTRY_CONFIRMED`.

## Database (Turso / libSQL)

The app uses [Turso](https://turso.tech) (hosted libSQL). Prisma talks to it through `@prisma/adapter-libsql`.

Locally, Prisma CLI uses a SQLite file at `prisma/dev.db`:

```bash
npx prisma generate
npx prisma db push
```

On Turso (after `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set):

```bash
npm run db:push-turso
npm run db:seed
```

Images and videos are stored in [Vercel Blob](https://vercel.com/docs/vercel-blob).


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
