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
- **Web Speech API** - Audio pronunciation

## Usage

1. **Study Mode**: Click on a flash card to reveal the English translation. Click "Play Audio" to hear the Vietnamese pronunciation.
2. **Browse Mode**: View all flash cards at once with their translations.
3. **Filtering**: Click on category tags to filter cards by topic. Click "Clear filters" to show all cards again.
4. **Next Card**: In Study Mode, click "Next Card" to get a random flash card.
