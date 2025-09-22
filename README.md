# CV Maker

A web-based CV/Resume builder built with **Next.js**, **TypeScript**, and **Tailwind CSS**.  
It provides a simple way to create, customize, and export a professional CV directly in the browser.

---

## Features

- **Live Preview** – Update your CV in real time while editing.
- **Multi-Language Support** – English, Turkish, and Arabic (with RTL support).
- **Font Options** – Choose between Google Fonts and locally hosted fonts.
- **Customizable Sections** – Manage personal info, experience, education, projects, and skills.
- **PDF Export** – Generate a print-ready PDF version of your CV.
- **Minimal UI** – Built with [shadcn/ui](https://ui.shadcn.com/) components for a clean design.

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/cvmaker.git
cd cvmaker
npm install
```

npm run dev

# or

yarn dev
Open http://localhost:3000
in your browser.

Tech Stack

Next.js 14+
– App Router

TypeScript
– Static typing

Tailwind CSS
– Styling

shadcn/ui
– UI components

jsPDF
– PDF export

Project Structure
src/
├── app/ # Next.js app router
├── components/ # Reusable UI components
│ └── cv-maker/ # CV builder components
├── lib/ # Helpers (fonts, translations, etc.)
├── icons/ # Custom icons
├── types/ # TypeScript types
└── public/ # Static assets (images, fonts)

Deployment

This project is optimized for deployment on Vercel
:

vercel

More details: Next.js Deployment Docs
.

License

MIT ©

---
