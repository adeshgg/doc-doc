# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Setup

```bash
pnpm dlx shadcn@canary init
```

This would give a framework not recognized error.
The workaround it to create a `.next.config.ts` file, and then run the command.
After the new project is generated you can delete the mock config file.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@canary add input
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button"
```

### Roadmap

- [x] Add trpc
- [ ] Add drizzle postgres
- [ ] Add redis for queue or use ingest

### Docs use UI

Updated docs app to use the UI package.

Key changes in `layout.tsx`, `components.json`, `eslint.config.mjs`, `next.config.ts`, `package.json` and `tsconfig.json`.

### Got DB, API, auth to work

Here are the issues that I ran into:

1. Package pg can't be external

Solution: add the following to the `.npmrc` file

`public-hoist-pattern[]=*pg*`

2. `./node_modules/.pnpm/pg@8.14.1/node_modules/pg/lib/connection-parameters.js:3:11
Module not found: Can't resolve 'dns'`

Similar error for `tls`, `net`, `fs`

Reason: The `db` package was getting used in a client component, hence its dependencies were added to the client bundle. And since these are node specific packages, it did not work in the browser environment.

After debugging I found that the auth export from `api` package, was export both
signIn, signOut, ... methods (client-side methods) and the `auth` object which uses the db from the same export. Creating a separate export path for each solved this issue.

```json
"exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./src/index.ts"
    },
    "./auth": {
      "types": "./dist/auth/index.d.ts",
      "default": "./src/auth/index.ts"
    },
    "./auth/client": {
      "types": "./dist/auth/auth-client.d.ts",
      "default": "./src/auth/auth-client.ts"
    }
  },
```

3. Error: Cannot find module './user.js'

While generating migrations, reason we are importing js files. Need to import tsx files

Solution Update the package.json:

```json
    "db:generate": "NODE_OPTIONS='--import tsx' drizzle-kit generate",
    "db:migrate": "NODE_OPTIONS='--import tsx' drizzle-kit migrate"
```

And run `pnpm run db:generate`

Tip: If there is an error of incorrect migration, delete the migration folder (drizzle in our case). And generate the migration again.

**Updated Base `tsconfig` to use `bundler`**

Now using `bundler` for `moduleResolution`
Now we can use module imports instead of the .js imports

## To run the database

```shell
docker compose up -d
```
