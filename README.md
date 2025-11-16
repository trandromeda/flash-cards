# Vietnamese Flash Cards

A lightweight, browser-based flash card application for learning Vietnamese.

## Features

- **Study Mode**: Display random flash cards with click-to-reveal translations
- **Audio Playback**: Hear Vietnamese pronunciations using Text-to-Speech
- **Browse Mode**: View all flash cards at once
- **Tag System**: Organize cards by categories (family, food, work, etc.)
- **Filtering**: Filter cards by tags to focus on specific topics
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Installation

```bash
npm install
```

### Google Cloud Text-to-Speech Setup

This app uses Google Cloud Text-to-Speech API for high-quality Vietnamese pronunciation.

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable the Text-to-Speech API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Text-to-Speech API"
   - Click "Enable"

3. **Create an API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Add API Key to Your Project**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your API key:
     ```
     VITE_GOOGLE_CLOUD_API_KEY=your_api_key_here
     ```

5. **Restrict Your API Key (Recommended)**
   - In the API key settings, restrict the key to only "Cloud Text-to-Speech API"
   - Add HTTP referrer restrictions (e.g., `http://localhost:5173/*`)

**Note:** The app will fall back to the browser's built-in text-to-speech if no API key is provided.

### Unsplash API Setup (Optional)

This app uses the Unsplash API to display beautiful Vietnam landscape backgrounds that change every minute.

**The app works without an API key** in demo mode (50 requests/hour). To get higher rate limits:

1. **Create an Unsplash Account**
   - Go to [Unsplash Developers](https://unsplash.com/developers)
   - Register a new application

2. **Get Your Access Key**
   - Only the **Access Key** is needed (not the Secret Key)
   - Copy the Access Key from your application settings

3. **Add Access Key to Your Project**
   - Add to your `.env` file:
     ```
     VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
     ```

**Rate Limits:**
- Without API key: Demo mode (50 requests/hour)
- With API key: Production mode (5000 requests/hour)

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Adding Flash Cards

Flash cards are stored in `src/data/flashcards.json`. Each card has the following structure:

```json
{
  "id": 1,
  "vietnamese": "Xin chào",
  "english": "Hello",
  "tags": ["greetings", "basics"]
}
```

To add new cards, simply edit this file and add more entries to the array.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Google Cloud Text-to-Speech API** - High-quality Vietnamese audio pronunciation

## Usage

1. **Study Mode**: Click on a flash card to reveal the English translation. Click "Play Audio" to hear the Vietnamese pronunciation.
2. **Browse Mode**: View all flash cards at once with their translations.
3. **Filtering**: Click on category tags to filter cards by topic. Click "Clear filters" to show all cards again.
4. **Next Card**: In Study Mode, click "Next Card" to get a random flash card.
