# CV Studio

Build a polished CV and matching cover letter, then print or save them as PDFs. CV Studio is a lightweight React app with live previews and browser-based data storage.

## What you can create

- **CVs** with personal details, a professional summary, education, work experience, registrations, skills, and other relevant sections.
- **Cover letters** tailored to a role, organisation, and recipient, with an editable generated draft.
- **Different CV styles** — ATS, Modern, Executive, and Classic — with a choice of accent colours.
- **PDF-ready documents** using your browser’s Print / Save as PDF option.

Your CV and cover-letter content update in the preview as you edit. Add only the sections you need; empty entry rows are kept out of the CV preview.

## Get started

### Requirements

- Node.js (a current LTS release is recommended)
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite to use the app.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create an optimised production build in `dist/` |
| `npm run preview` | Serve the production build locally for review |

To prepare a production build:

```bash
npm run build
npm run preview
```

The contents of `dist/` can be deployed to a static web host.

## Deploy to Vercel

This project includes a [`vercel.json`](./vercel.json) with the Vite framework, install command, production build command, and `dist` output directory. No environment variables or server functions are required.

1. Push the project to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. If the repository contains multiple projects, set **Root Directory** to `nurse-cv` (or the folder containing this README and `package.json`).
4. Deploy with the detected Vite settings.

Vercel will build and publish the app, then create deployments for future pushes to the connected repository.

## Your data and privacy

CV Studio saves your form data in your browser’s local storage so it is available when you return to the app in that browser. Uploaded passport photos are saved with that browser data too. The project does not require an account or an application server.

Use a private device if your CV contains personal information. Clearing this site’s browser data will remove saved information. The app does not currently provide cloud sync or a separate export/import backup.

## Built with

- React
- Vite
- Tailwind CSS

## Project layout

```text
src/
  App.jsx       CV builder, cover-letter builder, and live previews
  main.jsx      React application entry point
  styles.css    Application and document styles
index.html      HTML entry point
vite.config.js  Vite and plugin configuration
```
