
# 🎓 StudBud - High-Performance AI Study Partner

**StudBud** is a modern, high-fidelity web application designed to transform your study materials into interactive flashcards and practice quizzes in seconds. Powered by the **Cerebras LPU (Language Processing Unit)**, it offers the world's fastest inference for intelligent, context-aware content generation.

![StudBud Dark Mode](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-cyan)
![Powered by Cerebras](https://img.shields.io/badge/AI-Cerebras%20LPU-blue)
![React 19](https://img.shields.io/badge/React-19.0-61dafb)

## ✨ Features

- **🚀 Instant Generation**: Leverages Cerebras LPU technology for record-breaking inference speeds (tokens per second).
- **📇 Dual Study Modes**: 
  - **Flashcards**: Interactive cards with a sleek 3D flip animation for concept mastery.
  - **Practice Quizzes**: Multiple-choice questions with real-time feedback and grading.
- **📄 Multimodal Input**: Support for raw text pasting, topic generation, and file uploads.
- **🌗 Sleek UI/UX**: A minimalist design featuring neon cyan accents, custom animations, and a seamless toggle between Dark and Light modes.
- **📥 PDF Export**: Save your generated study sets locally for offline review.

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Inference**: [Cerebras Cloud API](https://cerebras.ai/) (Llama 3.3 70B)
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

## 📄 License

Distributed under the MIT License.

---

*Happy Studying! Built with ⚡ by the StudBud Team.*
