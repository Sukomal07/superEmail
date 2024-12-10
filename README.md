# SuperEmail

SuperEmail is an innovative platform designed to revolutionize how you manage your emails. With advanced features powered by AI, SuperEmail simplifies email communication, helping you save time and stay organized.

---

## Key Features

### ✉️ **Email Management Made Easy**

- Send and receive emails effortlessly.
- Organize your inbox for better productivity.

### 🤖 **AI-Powered Assistance**

- **Write Emails:** Use AI to craft professional, personalized, or creative emails quickly.
- **Quick Answers:** Ask questions like "When is my next flight?" and let AI find the answers directly from your emails.

### 🔍 **Intelligent Search**

- Search your inbox smarter and faster with AI-driven insights.

### 💬 **Integrated Chat**

- Use the built-in chat feature to collaborate or communicate seamlessly.

---

## Why SuperEmail?

1. **AI-Powered Productivity:** Automate repetitive tasks and focus on what matters.
2. **Streamlined Communication:** Access emails and chat in one platform.
3. **Quick Insights:** Let AI help you retrieve critical information from your inbox instantly.
4. **User-Friendly Interface:** Intuitive design tailored for efficiency.

## How It Works

1. **Email Sync:** Connect your Gmail account and other supported email platforms securely.
2. **AI Integration:** Leverage OpenAI-powered capabilities to write, search, and analyze emails.
3. **Collaborative Environment:** Use the chat feature to stay connected with your team.

---

# Project Setup and Installation Guide

Welcome to the project! Follow the steps below to get the application up and running.

---

## Prerequisites

1. **Node.js** and **npm** installed.
2. **Docker** installed and running.
3. Access to services: [Ngrok](https://ngrok.com/), [Clerk](https://clerk.dev/), [Aurinko.io](https://aurinko.io/), [Google Cloud Console](https://console.cloud.google.com/), and [OpenAI](https://openai.com/).

---

## Setup Steps

### 1. Clone the Repository and Install Packages

```bash
git clone https://github.com/Sukomal07/superEmail.git
cd superEmail
npm install
```

### 2. Configure Environment Variables

- Copy the `.env.example` file and create a `.env` file:

```bash
cp .env.example .env
```

### 3. Start the Database

- Run the PostgreSQL database using Docker:

```bash
./start-database.sh
```

### 4. Push Database Changes

- Push the database schema using:

```bash
npm run db:push
```

### 5. Setup Ngrok Tunneling

- Open a tunnel for port 3000 using Ngrok:

```bash
ngrok http 3000
```

- Note the `ngrok` URL for later use.

### 6. Set Up Clerk Webhooks

- Create a [Clerk](https://clerk.dev/) account.
- Configure webhooks:
  - Navigate to the **Webhook** section in Clerk.
  - Use the `ngrok` URL with `/api/clerk/webhook` (e.g., `https://<ngrok-id>.ngrok.io/api/clerk/webhook`).
  - Choose `user.created` and `session.created` events and save.

### 7. Add Clerk Keys to `.env`

- Copy the following Clerk keys to the `.env` file:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

### 8. Configure Aurinko.io

- Create an [Aurinko.io](https://aurinko.io/) account and a new application.
- Copy the following keys to the `.env` file:

```
AURINKO_CLIENT_ID=
AURINKO_CLIENT_SECRET=
AURINKO_SIGNING_SECRET=
```

### 9. Setup Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the **Gmail API**:
   - Go to **APIs & Services > Enable APIs and Services**.
   - Enable the **Gmail API**.
4. Configure OAuth Consent Screen:
   - Under **Scopes**, choose all Gmail scopes.
   - Add the following to **Authorized Redirect URIs**:
     ```
     https://api.aurinko.io/v1/auth/callback
     ```
   - Save the changes.

### 10. Configure Aurinko with Google OAuth

- Go to Aurinko settings:
  - In **Callback URL**, add:
    ```
    http://localhost:3000/api/aurinko/callback
    ```
  - Add the **Client ID** and **Client Secret** in `Google OAuth` copy from your Google Cloud project.

### 11. Add OpenAI API Key

- Obtain an API key from [OpenAI](https://platform.openai.com/).
- Add it to the `.env` file:

```
OPENAI_API_KEY=
```

### 12. Start the Project

- Run the development server:

```bash
npm run dev
```

---

## Good Luck!

If you encounter any issues, feel free to consult the documentation or reach out for support. Happy coding! 🚀
Your contributions are highly appreciated! Together, we can make this project better. 🎉
