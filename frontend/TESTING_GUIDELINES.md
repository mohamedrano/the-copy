# 🚨 نظام الاختبارات الصارم والإلزامي

## المعايير الإلزامية غير القابلة للتفاوض

### حدود التغطية الدنيا المطلقة

- **Global**: Lines ≥85%, Functions ≥90%, Branches ≥85%, Statements ≥85%
- **AI Files**: Lines ≥95%, Functions ≥100%, Branches ≥95%, Statements ≥95%
- **Lib Files**: Lines ≥95%, Functions ≥95%, Branches ≥95%, Statements ≥95%
- **Components**: Lines ≥85%, Functions ≥90%, Branches ≥85%, Statements ≥85%

### قواعد صارمة

1. **كل ملف TypeScript = ملف اختبار مقابل** (بدون استثناءات)
2. **كل دالة/method = اختبارات شاملة** (Happy + Edge + Error)
3. **كل branch منطقي = اختبار منفصل**
4. **التغطية < الحد الأدنى = رفض تلقائي**

## الأوامر المتاحة

### اختبارات أساسية

```bash
npm test                    # تشغيل جميع الاختبارات مع التغطية
npm run test:coverage       # تقرير التغطية التفصيلي
npm run test:watch          # وضع المراقبة مع التغطية
npm run test:ci             # للـ CI/CD (صارم)
```

### فحص الإنفاذ

```bash
npm run enforce:coverage           # فحص حدود التغطية
npm run enforce:all-files-tested   # فحص الملفات بدون اختبارات
npm run enforce:strict             # فحص شامل (الكل)
```

### جودة الكود

```bash
npm run typecheck          # TypeScript
npm run lint               # ESLint
npm run format             # Prettier
```

## نمط الاختبار المطلوب

### مثال: اختبار شامل

```typescript
// src/utils/calculator.ts
export class Calculator {
  add(a: number, b: number): number {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("Arguments must be numbers");
    }
    return a + b;
  }

  divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  }
}

// src/utils/__tests__/calculator.test.ts
describe("Calculator", () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe("add", () => {
    // ✅ الحالة الأساسية
    it("should add two positive numbers", () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    // ✅ حالات حدية
    it("should handle negative numbers", () => {
      expect(calculator.add(-2, 3)).toBe(1);
    });

    it("should handle zero", () => {
      expect(calculator.add(0, 5)).toBe(5);
    });

    // ✅ حالات خطأ
    it("should throw error for non-number arguments", () => {
      expect(() => calculator.add("2" as any, 3)).toThrow(
        "Arguments must be numbers"
      );
    });
  });

  describe("divide", () => {
    // ✅ الحالة الأساسية
    it("should divide correctly", () => {
      expect(calculator.divide(6, 2)).toBe(3);
    });

    // ✅ حالة خطأ
    it("should throw error for division by zero", () => {
      expect(() => calculator.divide(5, 0)).toThrow("Division by zero");
    });
  });
});
```

## آلية الإنفاذ التلقائي

### Pre-Commit Hook

```bash
# يتم تنفيذه تلقائياً قبل كل commit
✓ Type Check
✓ Lint Check
✓ Tests (on staged files)
✓ Coverage Check ≥85%
✓ No Untested Files Check

# إذا فشل أي فحص → رفض Commit
```

### CI/CD Pipeline

```yaml
# GitHub Actions - فحص إلزامي
- name: 🔍 Run ALL tests with coverage
- name: 📊 Enforce mandatory coverage thresholds
- name: 🔎 Verify no untested files
- name: ⛔ Block merge if insufficient
```

## أفضل الممارسات

### 1. نمط AAA (Arrange-Act-Assert)

```typescript
it("should process payment successfully", async () => {
  // Arrange: إعداد البيانات
  const orderId = "123";
  const mockOrder = { id: orderId, amount: 100 };

  // Act: تنفيذ العملية
  const result = await service.processPayment(orderId);

  // Assert: التحقق من النتائج
  expect(result).toBe(true);
});
```

### 2. تغطية جميع الحالات

```typescript
describe("validateEmail", () => {
  // ✅ حالة صحيحة
  it("should accept valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  // ✅ حالات خطأ
  it("should reject invalid email", () => {
    expect(validateEmail("invalid")).toBe(false);
  });

  it("should reject empty email", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("should reject null email", () => {
    expect(validateEmail(null)).toBe(false);
  });
});
```

### 3. Mock الخدمات الخارجية

```typescript
// Mock API calls
jest.mock("../api/userService");
const mockUserService = userService as jest.Mocked<typeof userService>;

beforeEach(() => {
  mockUserService.getUser.mockResolvedValue(mockUser);
});
```

## التحقق من النظام

### فحص سريع

```bash
# 1. تشغيل جميع الاختبارات
npm test

# 2. فحص التغطية
npm run enforce:coverage

# 3. فحص الملفات بدون اختبارات
npm run enforce:all-files-tested

# 4. فحص شامل
npm run enforce:strict
```

### مراقبة مستمرة

- تحقق من تقارير التغطية في `reports/unit/`
- راجع فشل CI/CD في GitHub Actions
- تتبع الملفات الجديدة بدون اختبارات

## ⚠️ تحذيرات مهمة

1. **لا استثناءات**: كل ملف يحتاج اختبارات
2. **لا مساومات**: الحدود الدنيا غير قابلة للتفاوض
3. **لا تخطي**: Pre-commit hooks إلزامية
4. **لا merge**: بدون تغطية كافية

## 🎯 الهدف النهائي

**صفر عيوب في Production** من خلال اختبارات شاملة وموثوقة.

---

_هذا النظام مصمم لضمان أعلى معايير الجودة والموثوقية في الكود._
