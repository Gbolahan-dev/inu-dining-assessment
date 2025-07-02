🚀 Next.js Project Setup

This is a [Next.js](https://nextjs.org/) project.

## 🛠️ Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/thejuggernaut01/inu-dining-assessment
cd inu-dining-assessment
```

### 2. **Install Dependencies**

Using npm:

```bash
npm install

```

### 3. **Environment Variables**

Create a `.env.local` file in the root directory of the project:

```bash

touch .env.local

```

Add your environment variables to `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://inu-dining-backend.onrender.com
```

> ✅ `NEXT_PUBLIC_` prefix is required for any variable that needs to be exposed to the browser.

> 🔒 Never commit `.env.local` to version control.

### 4. **Run the Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### 5. **Build for Production**

```bash
npm run build
npm start
```
