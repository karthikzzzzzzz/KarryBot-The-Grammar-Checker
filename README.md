
# The Grammar Check

A React + FastAPI application for managing and processing grammar check-related tasks. This project features a frontend built with React and a backend powered by FastAPI.

You can see the UI at - https://karrygrammer-check.netlify.app/

![Screenshot 2024-12-25 141404](https://github.com/user-attachments/assets/f467500e-edc1-445a-a3a7-2687118e920a)





For detailed instructions and step-by-step guidance to build this application, visit the Medium article at - https://medium.com/@karthikrajan025/building-a-real-time-grammar-correction-web-application-with-fastapi-react-and-websocket-6d65f5f99b6b


## Features

- Frontend built with React for a responsive user interface.
- Backend API built with FastAPI for fast and asynchronous communication.
- Integration of various libraries like Quill, React Quill, and TinyMCE for rich text editing.
- PDF generation with `jspdf` and math rendering with `katex`.

## Technologies

- **Frontend**: React, React Quill, TinyMCE, Highlight.js, Quill, etc.
- **Backend**: FastAPI (for APIs)
- **Styling**: CSS, React-Scripts
- **Libraries**: 
  - `jspdf`: For generating PDF documents
  - `highlight.js`: For syntax highlighting
  - `katex`: For rendering math formulas

## Installation

### Prerequisites

- Node.js and npm installed on your machine.
- Python 3.x and FastAPI installed for the backend.

### Setup Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/thesis.git
   cd thesis
   ```

2. **Install Frontend Dependencies**
   Navigate to the frontend directory (if separate from the root directory), or use the root directory if the frontend and backend are in the same folder.

   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Run the frontend**

   To run the React development server, execute:

   ```bash
   npm start
   ```
   The frontend will be available at http://localhost:3000.

5. **Run the backend**

   To start the FastAPI server, use:

   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at http://localhost:8000.

## Folder Structure

- /src: Contains React components, state management, and UI files.
- /public: Contains public assets like images, icons, etc.
- /backend: Contains FastAPI backend code (if separate).
- /node_modules: Directory for npm packages.
- package.json: Project's npm dependencies and scripts.
