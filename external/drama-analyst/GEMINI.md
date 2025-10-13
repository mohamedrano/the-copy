# GEMINI.md

## Project Overview

This project is a web-based application called "Drama Analyst and Creative Mimic". It allows users to upload text files and analyze them using the Gemini API. The application is built with React and Vite, and it uses TypeScript.

The user can select from a variety of analysis tasks, such as:

*   **Analysis:** General analysis of the text.
*   **Creative:** Creative writing based on the text.
*   **Integrated:** A combination of analysis and creative writing.
*   **Completion:** Completing the text.
*   **And many more advanced modules.**

The application is well-structured, with a clear separation of concerns between the UI, orchestration, and services. The UI is built with React and Tailwind CSS, and it provides a user-friendly interface for uploading files, selecting tasks, and viewing the results. The orchestration layer is responsible for managing the workflow of the application, from reading the files to calling the Gemini API. The services layer provides the core functionality of the application, such as reading files and calling the Gemini API.

## Building and Running

To build and run the project, you need to have Node.js installed.

1.  Install the dependencies:

```bash
npm install
```

2.  Set the `GEMINI_API_KEY` in a `.env` file.

3.  Run the development server:

```bash
npm run dev
```

This will start the application on `http://localhost:5173`.

## Development Conventions

*   **Code Style:** The project uses Prettier for code formatting.
*   **Testing:** There are no testing practices evident in the project.
*   **Commits:** There are no commit conventions evident in the project.
*   **Branching:** There are no branching conventions evident in the project.

**TODO:**

*   Implement the `invokeGemini` function in `services/geminiService.ts` to make real calls to the Gemini API.
*   Add a testing framework and write tests for the application.
*   Establish commit and branching conventions.
