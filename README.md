# CV Maker
A browser-side CV / resume builder by **Rami Mizyed**. Build, customize and export professional CVs in English, Arabic (RTL) and Turkish — no server required.

![CV Maker preview](https://github.com/RamiMizyed/cv-maker/blob/master/public/assets/PreviewCV.png)


## Features

- Live preview while editing
- Multilingual (en, ar, tr) with RTL support for Arabic
- Choose Google or local fonts
- Manage personal info, experience, education, projects and skills
- Export to print-ready PDF (client-side)
- Minimal, accessible UI using shadcn/ui + Tailwind

## Quickstart

Clone and install:

```bash
git clone https://github.com/RamiMizyed/cv-maker.git
cd cv-maker
npm install
# or
yarn
```

Run in development:

```bash
npm run dev
# or
yarn dev
```

Open http://localhost:3000

Build for production:

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Usage

- Select language (EN / TR / AR)
- Fill personal info, add experience/education/projects
- Choose a font and layout options
- Export as PDF with page format & orientation options

## Deployment

Optimized for Vercel. Push to a Git remote and import the repo into Vercel, or:

```bash
vercel --prod
```

## Contributing

PRs, issues and feature requests welcome. Please follow the existing code style (TypeScript + Tailwind + shadcn/ui). For changes to translations or fonts, update files under `src/lib` and add tests where appropriate.

## Credits

Built by Rami Mizyed — https://ramimizyed.dev

## License

MIT © Rami Mizyed
