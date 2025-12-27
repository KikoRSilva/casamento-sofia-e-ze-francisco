# Wedding RSVP Website

A multi-step RSVP form for a wedding event. Built with React and TypeScript, it collects guest information, attendance confirmation, and dietary restrictions, then submits data to Google Sheets via a Google Apps Script endpoint.

## Techniques

- **Multi-step form state management**: Uses React state and a step enum to control form flow
- **[URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)**: Encodes form data for submission
- **[Fetch API with no-cors mode](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)**: Submits to Google Apps Script without CORS preflight
- **Honeypot field**: Hidden input for bot detection
- **Client-side rate limiting**: Uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to limit submissions per email within a time window
- **Form completion time tracking**: Uses [useRef](https://react.dev/reference/react/useRef) to detect automated submissions
- **Input sanitization**: Removes angle brackets to reduce XSS risk
- **[AnimatePresence](https://www.framer.com/motion/animate-presence/)**: Handles exit animations between form steps
- **[Structured data (JSON-LD)](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/application/ld+json)**: Event schema for SEO
- **Environment variables**: Uses Vite's `import.meta.env` for configuration
- **Responsive design**: Mobile-first with Tailwind CSS breakpoints

## Technologies & Libraries

- **[React 19.2.3](https://react.dev/)** - UI library
- **[TypeScript 5.7.2](https://www.typescriptlang.org/)** - Type safety
- **[Vite 6.0.5](https://vitejs.dev/)** - Build tool and dev server
- **[Framer Motion 12.23.26](https://www.framer.com/motion/)** - Animation library
- **[Lucide React 0.562.0](https://lucide.dev/)** - Icon components
- **[Tailwind CSS 4.1.18](https://tailwindcss.com/)** - Utility-first CSS (via [@tailwindcss/vite](https://tailwindcss.com/docs/installation/vite))
- **Google Fonts**:
  - [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) - Serif headings
  - [Lato](https://fonts.google.com/specimen/Lato) - Sans-serif body text
  - [Caveat](https://fonts.google.com/specimen/Caveat) - Decorative cursive text

## Project Structure

```
casamento-sofia-ze-francisco/
├── public/
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   ├── logo.png
│   ├── og.jpeg
│   └── site.webmanifest
├── src/
│   └── index.css
├── dist/
├── App.tsx
├── index.html
├── index.tsx
├── types.ts
├── vite.config.ts
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

**Directory Notes:**

- `public/` - Static assets served at the root. Includes favicons, the wedding logo, Open Graph image, and web app manifest.
- `src/` - Contains global CSS imports for Tailwind.
- `dist/` - Production build output (generated, not committed).

The main application logic is in [App.tsx](App.tsx), which implements the multi-step form, validation, security checks, and submission logic. [types.ts](types.ts) defines the TypeScript interfaces and enums used throughout the application.

