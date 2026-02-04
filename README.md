# OrleansMC Website

OrleansMC Website is a custom website built for the OrleansMC Minecraft server community. It provides players with a modern,
clean interface to explore news, guides, their profiles, and more.  
The project is developed with **Next.js**, **TypeScript**, **Tailwind CSS**, and is backed by **MongoDB**, **MySQL**, **Redis**, and **Docker** technologies.

> This repository contains both the frontend and backend code for the website of OrleansMC Minecraft Server.

## 🌐 Live Website

Visit the website here: [orleansmc.com](https://orleansmc.com)

## 🖼️ Previews
![Home Page](https://i.imgur.com/Pe36mb5.png)
![Profile Page](https://i.imgur.com/bTnDue0.png)

## ✨ Features

- **Authentication** with session management
- **User profiles** and statistics
- **News and Blog** system (managed via **Strapi CMS**)
- **Guides and Tutorials** section
- **Store** integration for ranks and items
- **Discord OAuth2** account linking with automatic role synchronization
- **Secure password reset** flow via email
- **Responsive Design** for desktop and mobile
- **Admin/Server dashboard** endpoints (API level)

## ⚙️ Tech Stack

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Strapi Headless CMS](https://strapi.io/)
- [MongoDB](https://www.mongodb.com/)
- [MySQL](https://www.mysql.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)
- Email Service Integration
- Discord OAuth2 Authentication

## 📁 Project Structure (Simplified)

```
/src
  ├── components/   // UI components (Home, Profile, Store, Blogs, Guides)
  ├── layouts/      // Layouts for different pages
  ├── lib/          // Client, Server utilities and managers
  ├── pages/        // API endpoints and pages (Next.js routing)
  ├── styles/       // SCSS modules and global styles
  ├── types/        // TypeScript type definitions
/public             // Public assets
```

## 🚀 Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/OrleansMC/website.git
cd orleansmc
npm install
```

Create an `.env` file and configure your environment variables (MongoDB, MySQL, Redis, Email Service, etc.).

**Important**: Make sure to add Discord role IDs to your `.env` file for automatic role assignment:
```env
DISCORD_ROLE_OYUNCU=your_role_id
DISCORD_ROLE_CIRAK=your_role_id
DISCORD_ROLE_ASIL=your_role_id
DISCORD_ROLE_SOYLU=your_role_id
DISCORD_ROLE_SENYOR=your_role_id
```
See `.env.example` for a complete configuration template.

Run the development server:

```bash
npm run dev
```

Build and start for production:

```bash
npm run build
npm start
```

Or use Docker:

```bash
docker build -t orleansmc-web .
docker run -p 3000:3000 orleansmc-web
```

## 🚀 Vercel Serverless Deployment

This project is fully compatible with Vercel's serverless platform! The codebase automatically adapts to serverless environments with optimized database connection pooling and disabled background tasks.

For detailed Vercel deployment instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

Quick deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ivy-mc/IvyMC-Website)

## 📜 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**
license.

You are free to:

- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

**Under the following terms:**

- **Attribution** — You must give appropriate credit.
- **NonCommercial** — You may not use the material for commercial purposes.

For full details, see the [LICENSE](LICENSE) file.
