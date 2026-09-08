# Discord OAuth Setup Guide

This guide will help you set up Discord OAuth2 authentication for Glimpse's leaderboard system.

## Overview

The leaderboard system tracks player statistics across games using Discord login. Players who login with Discord will:
- Have their scores tracked globally across all games
- Appear on the public leaderboard
- See their personal stats and ranking
- Have their Discord avatar displayed

Guest players (without Discord login) can still play but won't appear on the leaderboard.

## Step 1: Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Give your application a name (e.g., "Glimpse Game")
4. Click **Create**

## Step 2: Get Your Client ID and Secret

1. In your application page, go to the **OAuth2** section
2. Copy your **Client ID** - you'll need this for `DISCORD_CLIENT_ID`
3. Click **Reset Secret** to generate a new client secret
4. Copy the secret immediately - you'll need this for `DISCORD_CLIENT_SECRET`
   - ⚠️ **Important**: The secret will only be shown once. Store it securely!

## Step 3: Configure OAuth2 Redirects

1. Still in the **OAuth2** section, scroll to **Redirects**
2. Click **Add Redirect**
3. Add your redirect URI(s):
   - For local development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
4. Click **Save Changes**

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```env
   DISCORD_CLIENT_ID=your_client_id_from_step_2
   DISCORD_CLIENT_SECRET=your_client_secret_from_step_2
   DISCORD_REDIRECT_URI=http://localhost:3000
   SESSION_SECRET=generate_a_random_string_here
   ```

3. Generate a secure `SESSION_SECRET`:
   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Or using openssl
   openssl rand -hex 32
   ```

## Step 5: Test Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. Click the **Login with Discord** button

4. You should be redirected to Discord to authorize the application

5. After authorizing, you'll be redirected back to Glimpse logged in

## Production Deployment

### Environment Variables

Make sure to set these environment variables in your production environment:

```env
DISCORD_CLIENT_ID=<your_production_client_id>
DISCORD_CLIENT_SECRET=<your_production_client_secret>
DISCORD_REDIRECT_URI=https://yourdomain.com
SESSION_SECRET=<secure_random_string>
```

### Security Notes

- ✅ **DO**: Store secrets in your deployment platform's secret management system
- ✅ **DO**: Use HTTPS in production (required for cookies and OAuth)
- ✅ **DO**: Generate a unique, secure `SESSION_SECRET` for production
- ❌ **DON'T**: Commit `.env` or any secrets to version control
- ❌ **DON'T**: Reuse the same `SESSION_SECRET` across different environments
- ❌ **DON'T**: Share your `DISCORD_CLIENT_SECRET` publicly

### Discord Application Settings for Production

1. Add your production domain to **OAuth2 Redirects** in Discord Developer Portal
2. Consider adding a bot user if you want to integrate Discord notifications (optional)
3. Update your application's branding (icon, description) in the **General Information** section

## Troubleshooting

### "Discord login is not configured" error

- Make sure `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are set in `.env`
- Restart your development server after adding environment variables

### OAuth redirect fails

- Check that your `DISCORD_REDIRECT_URI` exactly matches what's configured in Discord Developer Portal
- Ensure the redirect URI includes the protocol (`http://` or `https://`)
- For local dev, use `http://localhost:3000` (not `127.0.0.1`)

### "Invalid OAuth2 redirect_uri" error

- Go to Discord Developer Portal → Your App → OAuth2 → Redirects
- Make sure your redirect URI is added there exactly as it appears in your `.env`

### Session not persisting

- Check that cookies are enabled in your browser
- Ensure `SESSION_SECRET` is set
- For production, make sure your site uses HTTPS

## Optional: Database Configuration

By default, Glimpse uses SQLite for local development (stored in `/tmp/glimpse-dev-state/glimpse.db`).

### Using PostgreSQL (Production)

To use PostgreSQL instead of SQLite:

1. Install the PostgreSQL driver:
   ```bash
   npm install pg
   ```

2. Update `src/lib/db.ts` to use PostgreSQL connection instead of SQLite

3. Set database connection environment variables:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

The current database schema is designed to be portable and will work with PostgreSQL with minimal changes to the connection layer.

## Features

### For Players

- **Login with Discord**: One-click authentication
- **Global Leaderboard**: See top players across all games
- **Personal Stats**: View your total points, games played, wins, and average score
- **Discord Integration**: Your Discord avatar and username are displayed
- **Guest Mode**: Can still play without logging in (won't appear on leaderboard)

### For Developers

- **Persistent Storage**: SQLite for dev, PostgreSQL-ready for production
- **Session Management**: Secure cookie-based sessions (7-day expiry)
- **Privacy**: Only stores Discord ID, username, and avatar
- **Modular**: Easy to extend with additional OAuth providers

## Support

For issues or questions:
1. Check this guide for common setup problems
2. Verify your Discord app configuration
3. Check server logs for detailed error messages
