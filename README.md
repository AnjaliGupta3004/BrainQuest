# BrainQuest 🧠⚡

An AI-powered quiz application built with React Native CLI for Android.
Search any topic, get AI-generated MCQs instantly, and challenge
friends in real-time Battle Mode.

---

## Features

- **Mood-based Quiz** — 5 mood levels that adapt quiz difficulty and
  question count automatically
- **AI Quiz Generation** — Groq AI (LLaMA 3.3 70B) generates unique
  MCQs for any topic instantly
- **Open Library Search** — Search millions of books and topics with
  cover images
- **Real-time Battle Mode** — Challenge friends to a live quiz duel
  with Firebase sync
- **Dual Theme** — Soft Pastel (day) + Neon Dark (night) with
  persistent toggle
- **Offline History** — Last 20 quiz scores saved locally with
  AsyncStorage
- **XP System** — Speed bonus points, medals, and XP earned per quiz

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native CLI | Core framework (Android) |
| Groq AI API | MCQ generation (LLaMA 3.3 70B) |
| Open Library API | Book & topic search (free, no key) |
| Firebase Realtime DB | Battle mode live sync |
| React Navigation v6 | Screen navigation |
| AsyncStorage | Offline score history |
| react-native-dotenv | Secure API key management |
| React Context API | Global theme state |

---

## Screens

| Screen | Description |
|---|---|
| Home | Mood picker, theme toggle, battle entry |
| Search | Topic search via Open Library API |
| Quiz | MCQs, countdown timer, XP, feedback |
| Battle | Real-time quiz vs friend via Firebase |
| Result | Score, XP, medals, question review |

---

## Getting Started

### Prerequisites

- Node.js v18+
- Android Studio + Android SDK
- JDK 17
- React Native CLI

### Installation
```bash
# Clone the repo
git clone https://github.com/AnjaliGupta3004/BrainQuest.git
cd BrainQuest

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your API keys in .env
```

### Environment Variables

Create a `.env` file in root:
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_URL=https://api.groq.com/openai/v1/chat/completions
OPEN_LIBRARY_URL=https://openlibrary.org/search.json
```

Get free Groq API key from: https://console.groq.com

### Run the App
```bash
# Terminal 1 — Start Metro
npx react-native start

# Terminal 2 — Run on Android
npx react-native run-android
```

---

## Project Structure
```
BrainQuest/
├── src/
│   ├── constants/
│   │   └── colors.js          # Pastel + Neon theme colors
│   ├── context/
│   │   └── ThemeContext.jsx   # Global theme state
│   ├── services/
│   │   ├── aiService.js       # Groq AI quiz generation
│   │   ├── libraryService.js  # Open Library API
│   │   └── firebaseService.js # Battle mode Firebase
│   └── screens/
│       ├── HomeScreen.jsx     # Mood picker + navigation
│       ├── SearchScreen.jsx   # Topic search
│       ├── QuizScreen.jsx     # Main quiz screen
│       ├── BattleScreen.jsx   # Real-time battle
│       └── ResultScreen.jsx   # Score + review
├── .env                       # API keys (not committed)
├── .env.example               # Template for env vars
└── App.jsx                    # Root navigator
```

---

## API Usage

| API | Cost | Usage |
|---|---|---|
| Groq AI | Free (14,400 req/day) | Quiz generation |
| Open Library | Free (no key) | Book search |
| Firebase | Free (Spark plan) | Battle mode |

---

## Developer

**Anjali Gupta**
B.Tech 3rd Year | Android & React Native Developer
Specializing in Native Kotlin + React Native + Tailwind CSS

---

## License

MIT License — feel free to use and modify!
```

---

## `.env.example` file bhi banao

Root mein `.env.example` file banao — yeh GitHub par push hogi:
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_URL=https://api.groq.com/openai/v1/chat/completions
OPEN_LIBRARY_URL=https://openlibrary.org/search.json