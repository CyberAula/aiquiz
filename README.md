# AIQuiz



https://github.com/user-attachments/assets/eb8e601e-a7f7-4b3e-b1ef-d50103a9d144


## Configuration

Copy `next.config.js.template` to `next.config.js` and configure it.
Copy `models.json.example` to `models.json` and configure it.
Copy `.env.template` to `.env` and configure it (only needed to create the admin user, see below).

Node 24 (minimum Node 20).

The app is served under `/aiquiz` by default. To change it, set the `BASE_PATH` environment variable when building (see `next.config.js`); it is fixed at build time, so with Docker pass it as a build argument (`BASE_PATH=/aiquiz-2 docker compose build`, or `docker build --build-arg BASE_PATH=/aiquiz-2 .`), not only as a runtime `environment` variable. It must match the nginx `location`. In the code, never write `/aiquiz` by hand: use `withBasePath()` / `BASE_PATH` from `app/utils/basePath.js` for `fetch`, `<a href>` and URLs sent to the browser. `<Link>` and `router.push` already add it.

### Create the admin user

The manager (`/aiquiz/manager`) needs at least one user to log in. Run this once, with the database already running:

1. Copy `.env.template` to `.env` and fill in the values. `MONGODB_URI` must be the same database as `MONGODB_URI` in `next.config.js`.
2. Run the script:

   ```bash
   npm run seed:admin
   ```

   With Docker, copy the `.env` into the running container, run it there and delete it afterwards, so the credentials don't stay in the container:

   ```bash
   docker compose cp .env aiquiz-web:/app/.env
   docker compose exec -it aiquiz-web npm run seed:admin
   docker compose exec aiquiz-web rm /app/.env
   ```

The script creates the super admin (role `admin`) from the `SUPER_ADMIN_*` variables and, if `DEFAULT_PROFESSOR_EMAIL` is set, a professor from the `DEFAULT_PROFESSOR_*` variables. Then it asks whether you want to add more professors. Users that already exist are not modified.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Getting Started

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

Open [http://localhost:3000/aiquiz](http://localhost:3000/aiquiz) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
