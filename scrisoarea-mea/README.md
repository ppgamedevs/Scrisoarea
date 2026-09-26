This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

Copy `.env.example` to `.env` (or `.env.local`) and fill in the values.

Required for production: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_APP_URL`.
Admin account: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (used by `npm run db:seed` and `npm run db:sync-admin`).
Auth: `BETTER_AUTH_SECRET` (required — generate with `openssl rand -base64 32`), optional `BETTER_AUTH_URL` (defaults to `NEXT_PUBLIC_APP_URL`).
Email (Resend, required for verification/reset): `RESEND_API_KEY`, `EMAIL_FROM` (verified domain, e.g. `Vise pe hârtie <noreply@your-domain.ro>`).
Test Resend: `npm run email:test -- you@example.com`
Optional: `CONTACT_EMAIL`, `NEXT_PUBLIC_ASSOCIATION_CUI`, `NEXT_PUBLIC_SOCIAL_*`, `CRON_SECRET` (protects `/api/cron/*`).

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
