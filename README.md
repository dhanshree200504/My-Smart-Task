# ✨ My Smart Tasks

**My Smart Tasks** is a sleek, glassmorphic productivity app featuring a "smart" reminder system. Built with a responsive CSS grid, it offers priority-based task tracking, real-time progress bars, and persistent data storage. It’s a lightweight tool designed to streamline workflows with pro-active notifications and a seamless light/dark mode experience.

## 🏗️ Data Structures & Algorithms (DSA)

### Data Structures
* **Dynamic Array of Objects**: The application state is managed via an array of objects. This structure allows for efficient $O(n)$ iteration during UI updates and task filtering.
* **Key-Value Mapping**: Leverages the `localStorage` API as a hash-map to store and retrieve data ($O(1)$ access) across sessions.

### Core Algorithms
1.  **Time-Differential Polling**: A 60-second polling cycle that calculates the delta between the current time and the task deadline. It triggers notifications within a 5-minute window.
2.  **Linear State Reconciliation**: A render algorithm that traverses the state array to separate "Active" and "Completed" tasks, ensuring the UI accurately reflects the data model.
3.  **XSS Sanitization**: A string replacement algorithm that escapes HTML characters to prevent malicious code injection.

## 🛠️ Features
- **Smart Reminders**: Browser notifications for upcoming deadlines.
- **Persistent Theme**: Automatic Light/Dark mode detection and storage.
- **Progress Tracking**: Real-time percentage calculation of completed tasks.
- **Glassmorphic UI**: Modern, responsive design using CSS custom properties.

## 🚀 Getting Started
1. Clone this repository.
2. Open `index.html` in your browser.
3. Enable notifications to allow the reminder algorithm to function.

## 📄 License
This project is licensed under the **MIT License**. Copyright © 2026 Dainik.
