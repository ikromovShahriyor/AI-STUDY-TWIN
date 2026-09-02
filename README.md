# 🎓 AI STUDY TWIN — Next-Gen AI Education Startup Platform

<div align="center">
  <h3>Har bir o'quvchi uchun shaxsiy AI o'qituvchi va repetitor platformasi</h3>
  <p>Personal AI Study Tutor & Adaptive Learning Companion</p>
  <p>
    <b>🇺🇿 O'zbekcha</b> • <b>🇬🇧 English</b> • <b>🇷🇺 Русский</b>
  </p>
</div>

---

## 🌟 Loyiha Haqida / Overview

**AI STUDY TWIN** — bu o'quvchilarning bilim darajasini aniqlovchi (diagnostic assessment), shaxsiy o'quv rejasini tuzuvchi, ovozli va matnli savol-javob repetitori bo'lib xizmat qiluvchi, testlar yaratuvchi va xatolarni sun'iy intellekt orqali qadamma-qadam tushuntirib beruvchi xalqaro darajadagi ta'lim platformasidir.

---

## 🚀 Asosiy Imkoniyatlar (Key Features)

### 1. 🔐 Mukammal Autentifikatsiya (Authentication & Security)
- Register, Login, Refresh Token rotatsiyasi, Forgot & Reset Password
- JWT Bearer (Access + Refresh Token)
- BCrypt parol xesh lash (xavfsiz saqlash)
- Role-based Access Control (Student, Teacher, Admin)

### 2. 🧠 AI Study Twin & Knowledge Assessment
- **Boshlang'ich Diagnostika**: Beginner, Elementary, Intermediate, Advanced darajalarga ajratish
- **Kuchli va Zaif tomonlar tahlili**: Real vaqt rejimida bilim kamchiliklarini aniqlash
- **AI Tavsiyalar**: O'quvchini rivojlantirishga qaratilgan shaxsiy pedagogik tavsiyalar
- **Next Lesson Recommendations**: Muhimlik darajasi (Priority) asosida darslar taklif qilish

### 3. 💬 AI Chat & Ovozli Repetitor (Voice AI)
- O'quvchi bilan tabiiy muloqot qiluvchi aqlli repetitor
- **Ovozli muloqot (STT / TTS)**: Brauzer Web Audio & Speech API hamda backend transkripsiyasi
- **Web Search Grounding**: Eng yangi ma'lumotlar uchun manbalar va havolalar (citations)
- **Fan konteksti**: Matematika, Dasturlash, Ingliz tili, Fizika bo'yicha maxsus modellar

### 4. 📝 Testlar va Xatolar Tahlili (Adaptive Quiz System)
- Tayyor fan va diagnostik testlar
- Jonli teskari sanagich (Countdown Timer)
- Dasturlash kodlari va sintaksis ranglari
- Avtomatik tekshirish va **AI Xatolar Tahlili (Explain Error with AI)**

### 5. 📅 Shaxsiy O'quv Reja (Interactive Study Planner)
- AI tomonidan 7, 14 yoki 30 kunlik moslashtirilgan reja generatsiyasi
- Vazifalar holati: *Kutilmoqda (Pending)*, *Jarayonda (In Progress)*, *Bajarildi (Completed)*, *O'tkazib yuborildi (Skipped)*
- Vazifalar yakunlanganda XP va streak oshishi

### 6. 🏆 Gamifikatsiya & Streak Tizimi
- XP ballar va Darajalar (Level 1, 2, 3...)
- Nishonlar (Badges & Achievements: Bronze, Silver, Gold)
- Kunlik missiyalar (Daily Challenges) va mukofotlarni yig'ish (Claim XP)
- O'quvchilar Reytingi (Leaderboard)

### 7. 🎨 Premium Glassmorphism Dark/Light UI
- To'q ko'k / qora fon, neon binafsha (`#8b5cf6`) va moviy (`#06b6d4`) gradientlar
- Desktop Sidebar va Mobil versiya uchun qulay **Bottom Navigation Bar** + Markaziy chaqiruv tugmasi
- 3 tilda bir zumda almashtirish (UZ / EN / RU)

---

## 🛠 Texnologiyalar (Tech Stack)

### Backend:
- **ASP.NET Core (.NET 10)** (Clean Architecture)
- **Entity Framework Core**
- **PostgreSQL 16**
- **JWT Bearer + BCrypt**
- **Multi-Provider AI Service** (Gemini / OpenAI / Smart Pedagogical Engine Fallback + Web Search)
- **Swagger / OpenAPI**

### Frontend:
- **Next.js 15 (App Router)**
- **TypeScript**
- **Custom Modular Glassmorphism Design System** (Vanilla CSS)
- **Lucide Icons & Canvas Confetti**
- **Web Audio & Speech API**

---

## 📂 Loyiha Strukturasi (Folder Structure)

```
AI Study Twin/
├── backend/
│   ├── AiStudyTwin.slnx
│   ├── AiStudyTwin.Domain/          # BaseEntity, User, StudentProfile, Subject, Topic, StudyPlan, Test, Chat...
│   ├── AiStudyTwin.Application/     # Interfaces, DTOs, Services (Auth, Profile, StudyPlan, Test, Chat, Gamification...)
│   ├── AiStudyTwin.Infrastructure/  # AppDbContext, Seeder, AI Providers, WebSearch, Voice, JWT
│   └── AiStudyTwin.Api/             # Controllers, Middlewares, Program.cs, appsettings.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                     # Landing, Auth, Dashboard, AI Twin, Chat, Tests, Plan, Gamification, Profile
│   │   ├── components/              # Navbar, Sidebar, MobileBottomNav, Footer, UI components
│   │   ├── lib/                     # api.ts, auth-context, theme-context, types, i18n (uz, en, ru)
│   │   └── styles/                  # globals.css
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Ishga Tushirish (How to Run)

### 1-Usul: Docker Compose Orqali (Tavsiya etiladi)

```bash
# 1. Repozitoriyaga o'ting
cd "AI Study Twin"

# 2. .env faylni sozlang
cp .env.example .env

# 3. Barcha servislarni ishga tushiring (PostgreSQL + Backend + Frontend)
docker-compose up -d --build
```
- **Frontend**: `http://localhost:3000`
- **Backend Swagger API**: `http://localhost:5000/swagger`
- **PostgreSQL**: `localhost:5432`

---

### 2-Usul: Mahalliy Ishga Tushirish (Local Development)

#### Backendni ishga tushirish:
```bash
cd backend/AiStudyTwin.Api
dotnet run
```
*Backend avtomatik tarzda ma'lumotlar bazasini yaratadi va boshlang'ich fanlar, testlar hamda namunaviy hisoblarni joylaydi.*

#### Frontendni ishga tushirish:
```bash
cd frontend
npm install
npm run dev
```
Brauzerda `http://localhost:3000` manzilini oching.

---

## 👤 Test Uchun Demo Foydalanuvchi

- **Email**: `student@aistudytwin.uz`
- **Parol**: `Password123!`

---

## 📄 Litsenziya

Ushbu loyiha MIT litsenziyasi asosida taqdim etiladi.
