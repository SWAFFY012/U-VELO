This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Hostland deployment

The public site uses `https://u-velo.ru`. To prepare an upload from this directory:

```bash
npm ci
npm run build:hostland
```

Upload `.hostland/uvelo-hostland-site.zip` to the Hostland Node.js application directory `/home/host1892387/u-velo.ru/projects/project` and extract it there, replacing the existing files. The archive contains `server.js`, `public/` and `tmp/restart.txt`; the last file triggers an application restart. Use `server.js` as the startup file and `public/` as the static directory.

This package serves a static export with a dependency-free Node.js server. Application forms are currently disabled, so `/api/leads` is intentionally omitted from the export. Its source remains available for a future server deployment. Regular `npm run build` still builds the full Next.js application.

The build uses a temporary staging directory and leaves the source unchanged. Generated uploads in `.hostland/` are ignored by Git. Tailwind is compiled through PostCSS for both regular and Hostland builds.

Domain DNS points the root and `www` to `185.26.122.71`. Nameservers are configured at Reg.ru as `ns.hostland.ru` and `ns3.hostland.ru`. DNS propagation and successful SSL issuance must be verified before enabling an HTTP-to-HTTPS redirect. Existing Reg.ru mail records should be preserved separately from the website migration.
