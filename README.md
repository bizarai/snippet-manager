# Snippet Manager

A simple web application for saving and managing text snippets from the web.

## Features

- Drag and drop text snippets from any website
- Persistent storage using IndexedDB (more robust than localStorage)
- Export and import snippets as JSON files
- Add comments to any snippet
- Search through your snippets
- Pagination for better organization
- Links to source URLs

## Storage Options

The application offers two storage methods:

1. **IndexedDB (Default)** - More persistent storage that usually survives browser history clearing
2. **localStorage** - Traditional web storage (may be cleared when clearing browser history)

## How to Use

1. Drag text from any webpage to the drop area
2. View your snippets by expanding them
3. Add comments to any snippet
4. Export your snippets to back them up
5. Import snippets on any device

## Development

This project is built with:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Export static site
npm run build
```

## Deployment

The application is configured to deploy to GitHub Pages automatically via GitHub Actions. Simply push to the main branch, and the action will build and deploy the site.

## License

MIT
