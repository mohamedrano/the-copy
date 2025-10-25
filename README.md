# The Copy - النسخة

منصة شاملة لتحليل النصوص الدرامية بالذكاء الاصطناعي

## 🏗️ هيكل المشروع

```
the-copy-/
├── frontend/            # Frontend (Next.js)
│   ├── src/
│   ├── package.json
│   └── README.md
├── backend/             # Backend API (Express.js)
│   ├── src/
│   ├── package.json
│   └── README.md
└── README.md           # هذا الملف
```

## 🚀 البدء السريع

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# يعمل على http://localhost:9002
```

### Backend (Express.js)
```bash
cd backend
npm install
cp .env.example .env
# أضف مفتاح Google AI في .env
npm run dev
# يعمل على http://localhost:3001
```

## 🔗 الربط بين Frontend و Backend

Frontend يتصل بـ Backend عبر:
- `http://localhost:3001/api/health`
- `http://localhost:3001/api/analysis/pipeline`
- `http://localhost:3001/api/analysis/review-screenplay`

## 📚 التوثيق

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)