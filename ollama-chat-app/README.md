# Simple Vue 3 Chat App

This is a simple chat application built with Vue 3, TypeScript, Vite, Bootstrap 5, and Axios. The app allows users to chat with a bot via a backend call to OLLAMA.

## Project Structure

```
simple-vue3-chat-app
├── public
│   └── index.html          # Main HTML file
├── src
│   ├── assets              # Static assets (images, fonts, styles)
│   ├── components
│   │   └── ChatBot.vue     # ChatBot component
│   ├── services
│   │   └── ollamaApi.ts    # API calls to OLLAMA
│   ├── types
│   │   └── index.ts        # TypeScript interfaces and types
│   ├── App.vue             # Root component
│   └── main.ts             # Entry point of the application
├── package.json            # npm configuration file
├── tsconfig.json           # TypeScript configuration file
├── vite.config.ts          # Vite configuration file
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd simple-vue3-chat-app
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Run the application:**
   ```bash
   yarn dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Usage

- Type your message in the chat input and press enter to send it to the bot.
- The bot will respond based on the backend logic defined in the OLLAMA service.

## Technologies Used

- **Vue 3**: JavaScript framework for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Vite**: A build tool that provides a fast development environment.
- **Bootstrap 5**: CSS framework for responsive design.
- **Axios**: Promise-based HTTP client for making API requests.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.