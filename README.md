# AI Arch

AI Arch is an experimental tool that lets you generate architectural room layouts from simple text descriptions. Instead of manually placing furniture, you just describe what you want (e.g., "A room with a bed, a TV across from it, and a small workspace") and it uses AI to automatically position the objects in a 3D space.

The goal is to provide a quick way to conceptualize room layouts without needing complex 3D software or heavy computing power.

## Stack
- **Frontend**: React, Three.js, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: Google Generative AI (Gemini Pro)

## How to use locally

To run this project on your machine, you'll need to start both the frontend and the backend servers.

### Prerequisites
- Node.js installed
- A Google Gemini API key

### 1. Backend Setup
First, start the backend server which handles the AI generation.
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:4000`.

### 2. Frontend Setup
Next, start the frontend app.
1. Open a new terminal and make sure you are in the root directory of the project (`AI_Arch`).
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` URL in your browser to start generating layouts!