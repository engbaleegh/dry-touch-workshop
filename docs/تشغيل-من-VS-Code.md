# تشغيل المشروع من VS Code

## أين المشروع؟

المجلد الصحيح الذي يحتوي على كل الأكواد:

```
C:\Users\ygcFDFD\dry-touch-workshop
```

يجب أن ترى داخل المجلد:
- مجلد `src`
- مجلد `prisma`
- ملف `package.json`
- ملف `README.md`

إذا فتحت مجلداً فارغاً أو مجلد المستخدم `C:\Users\ygcFDFD` فقط، **لن تظهر أكواد المشروع**.

---

## الخطوة 1: افتح المجلد الصحيح

1. افتح **VS Code**
2. **File → Open Folder** (أو ملف → فتح مجلد)
3. الصق المسار: `C:\Users\ygcFDFD\dry-touch-workshop`
4. اضغط **Select Folder**

في الشريط الجانبي يجب أن ترى `src` و `prisma` و `package.json`.

---

## الخطوة 2: تثبيت الحزم (مرة واحدة)

**Terminal → New Terminal** ثم:

```bash
npm install
```

---

## الخطوة 3: قاعدة البيانات (مرة واحدة)

```bash
npx prisma db push
npm run db:seed
```

---

## الخطوة 4: تشغيل المشروع

### الطريقة أ — من القائمة

1. `Ctrl + Shift + P`
2. اكتب: `Tasks: Run Task`
3. اختر: **dev: تشغيل المشروع**

### الطريقة ب — F5

1. اضغط **F5** (أو Run → Start Debugging)
2. اختر: **تشغيل Dry Touch Workshop**
3. قد يفتح المتصفح تلقائياً على `http://localhost:3000`

### الطريقة ج — طرفية

```bash
npm run dev
```

---

## تسجيل الدخول

- الرابط: http://localhost:3000
- المستخدم: `admin`
- كلمة المرور: `admin123`

---

## إذا ظهر خطأ

| الخطأ | الحل |
|--------|------|
| `npm is not recognized` | ثبّت Node.js من https://nodejs.org ثم أعد تشغيل VS Code |
| `Can't reach database` | نفّذ `npx prisma db push` |
| المجلد فارغ | تأكد أنك فتحت `dry-touch-workshop` وليس مجلداً آخر |
| المنفذ 3000 مشغول | أغلق أي `npm run dev` سابق أو غيّر المنفذ |

---

## لماذا لا أرى الأكواد؟

المشروع أُنشئ في:

`C:\Users\ygcFDFD\dry-touch-workshop`

وليس داخل مجلد فارغ أنشأته يدوياً. افتح **هذا المسار بالضبط** في VS Code.
