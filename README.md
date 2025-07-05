# doc-doc.

doc-doc is a powerful, open-source platform designed to bring all your medical information together in one place.

![doc-doc.](/apps/web/public/og.png)

**How does it help you?**

- **If you're a patient:** It brings all your medical records—from every doctor and lab—into a single, organized timeline. Your entire health history, always with you.
- **If you're a doctor:** It saves you critical time by presenting a smart summary of a patient's records the moment you need it.

**The most powerful part?** Both patients and doctors can chat with the records to find specific information instantly. Need to know the date of the last blood test or a specific dosage? Just ask.

**doc-doc: All your medical data, organized and instantly searchable.**

Read [the launch article](https://www.adeshgg.in/blog/doc-doc) for know more about how and why this was build.

⭐ Please star this repo if you find it useful!

## Tech?

- [Turborepo](https://turborepo.com/)
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [tRPC](https://trpc.io/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Better Auth](https://better-auth.vercel.app/)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [Inngest](https://www.inngest.com/)
- [TanStack Table](https://tanstack.com/table/latest)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon](https://neon.tech/)
- [Motion](https://motion.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [LangChain](https://www.langchain.com/)
- [Zod](https://zod.dev/)

## Setting up locally

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```shell
git clone https://github.com/your-username/doc-doc.git
```

### Create a new Branch

```shell
git checkout -b my-new-branch
```

### Install dependencies

```shell
pnpm install
```

### Set Up Environment Variables

Copy the sample environment files and configure them:

```shell
cp apps/web/.env.sample apps/web/.env
cp packages/api/.env.sample packages/api/.env
cp packages/db/.env.sample packages/db/.env
```

Add your secret keys in the `.env` files

### Spin Up your database

Run the docker image

```shell
docker compose up -d
```

Alternatively, if you prefer not to use Docker, you can set up and run a new database instance of your choice. Remember to update the DATABASE_URL in your .env files accordingly to reflect your new database configuration.

### Apply changes to the database

Navigate to the `db` package

```shell
cd packages/db
```

Generate migrations

```shell
pnpm db:generate
```

Apply migrations

```shell
pnpm db:migrate
```

That's it! This should setup your local environment.

### Build the project

To verify you don't have any error, build the project

Make sure to be on the root of the project

```shell
turbo run build
```

### Run the project locally

```shell
pnpm run dev
```

To run a specific package say api:

```shell
pnpm --filter @workspace/api dev
```
