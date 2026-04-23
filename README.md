# AAA On Time Electric

A modern, professional website for AAA On Time Electric, a Florida-based electrical contracting company.

![Website Preview](./public/hero-electrician.jpg)

## 🚀 Live Demo

Visit the live site: [aaaontimeelectric.com](https://aaaontimeelectric.com)

## ✨ Features

- **Interactive Design** - Smooth animations with Framer Motion
- **Responsive Layout** - Works on all devices (mobile, tablet, desktop)
- **Theme Switcher** - 10 different color themes
- **AI Chatbot** - "José Bot" powered by Google Gemini AI
- **PDF Estimates** - Generate professional quotes on-the-fly
- **PWA Support** - Works offline, installable as an app
- **Fast Loading** - Optimized build with Vite

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 6.x
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **AI:** Google Gemini API

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aaa-on-time-electric.git
cd aaa-on-time-electric
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your Google Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy.

## 🚀 Deployment

### GitHub Pages

1. Push to GitHub
2. Go to Settings → Pages
3. Select "GitHub Actions" as source
4. Use the included workflow (`.github/workflows/deploy.yml`)

### Netlify

1. Connect your GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`

### Vercel

1. Import project from GitHub
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

## 📁 Project Structure

```
├── public/              # Static assets
│   ├── hero-electrician.jpg
│   ├── bucket-truck.jpg
│   ├── excavator.jpg
│   └── bobcat-s650.jpg
├── src/
│   ├── components/      # React components
│   │   ├── sections/    # Page sections
│   │   └── ...          # UI components
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilities
│   ├── constants.ts     # App constants
│   ├── types.ts         # TypeScript types
│   └── main.tsx         # Entry point
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 📝 Configuration

### Environment Variables

Create `.env.local`:

```env
GEMINI_API_KEY=your_google_ai_api_key
CSRF_SECRET=your_csrf_secret_for_production
```

### Theme Customization

Themes are defined in `src/constants.ts`. Edit the `THEMES` array to add or modify themes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary to AAA On Time Electric LLC.

## 📞 Contact

- **Phone:** (786) 295-1748
- **Email:** info@aaaontimeelectric.com
- **Website:** [aaaontimeelectric.com](https://aaaontimeelectric.com)

---

Built with ⚡ by AAA On Time Electric
