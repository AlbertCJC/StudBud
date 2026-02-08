
# 🎓 StudBud - Ultra-Fast AI Study Partner

**StudBud** is a modern, high-fidelity web application designed to transform your study materials into interactive flashcards and practice quizzes in seconds. Powered by the **Cerebras Cloud LPU (Language Processing Unit)**, it offers near-instantaneous content generation that leaves traditional AI providers in the dust.

![StudBud Dark Mode](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-cyan)
![Powered by Cerebras](https://img.shields.io/badge/AI-Cerebras%20Llama%203.3-blue)
![React 19](https://img.shields.io/badge/React-19.0-61dafb)

## ✨ Features

- **🚀 Instant Generation**: Leverages Cerebras Cloud's LPU inference for ultra-fast Llama-3.3-70b processing.
- **📇 Dual Study Modes**: 
  - **Flashcards**: Interactive cards with a sleek 3D flip animation for concept mastery.
  - **Practice Quizzes**: Multiple-choice questions with real-time feedback and grading.
- **📄 Multimodal Input**: Support for raw text pasting and file uploads (PDF, Text).
- **🌗 Sleek UI/UX**: A minimalist design featuring neon cyan accents, custom animations, and a seamless toggle between Dark and Light modes.
- **📥 PDF Export**: Save your generated study sets locally for offline review.
- **📱 Fully Responsive**: Study on the go with an interface optimized for mobile, tablet, and desktop.

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Inference**: [Cerebras Cloud API](https://cerebras.ai/) (Llama-3.3-70b)
- **PDF Engine**: [jsPDF](https://github.com/parallax/jsPDF)
- **Build Tool**: [Vite](https://vitejs.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A Cerebras Cloud API Key (Get one at [cloud.cerebras.ai](https://cloud.cerebras.ai/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/studbud.git
   cd studbud
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_cerebras_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

The application is built with a modular architecture for scalability and clean code:

- `/components`: Specialized UI components (`Header`, `Flashcard`, `QuizCard`, `FileUpload`, `ModeSelector`).
- `/services`: API integration logic (Cerebras Cloud implementation).
- `/types`: TypeScript interfaces and enums for consistent state management.
- `App.tsx`: The central orchestrator for application state and navigation.

## 💡 Why Cerebras?

StudBud was originally built on Gemini but migrated to Cerebras to solve common "Resource Exhausted" (429) errors found in free-tier cloud APIs. Cerebras provides:
- **Higher Quotas**: More tokens per minute for free-tier users.
- **Unmatched Speed**: Generation happens in milliseconds, not seconds.
- **Reliable JSON Mode**: Perfect for structured educational data.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Happy Studying! Built with 💙 by the StudBud Team.*
