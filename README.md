# Kestora Blog App

A standalone Node.js Express application for displaying the Kestora University blog, powered by Supabase.

## Features

- Dynamic blog post listing with pagination
- Individual blog post pages
- Tag filtering
- Responsive design matching the main site
- Real-time content updates from shared Supabase database

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env` file and fill in your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   ```

3. Build CSS:
   ```bash
   npm run build-css
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Development

For development with auto-reload:
```bash
npm run dev
```

To watch CSS changes:
```bash
npm run build-css
```

## Database

This app reads from the same Supabase database as the main Next.js application. Blog posts are managed through the admin interface in the main app.

## Deployment to Hostinger

1. Upload the entire `blog-app/` directory to your Hostinger Node.js hosting
2. Set environment variables in Hostinger's control panel
3. Set the start command to `npm start`
4. Ensure the app runs on the assigned port

## Routes

- `GET /` - Blog listing page
- `GET /:slug` - Individual blog post
- `GET /?tag=tagname` - Filtered blog listing

## Styling

The app uses Tailwind CSS with custom styles and CKEditor5 content styles for proper rich text display.