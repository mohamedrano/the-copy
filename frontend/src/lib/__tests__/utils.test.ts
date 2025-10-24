import { cn } from "../utils";

describe("utils", () => {
  describe("cn function", () => {
    // ✅ الحالة الأساسية
    it("should merge class names correctly", () => {
      const result = cn("px-4", "py-2", "bg-blue-500");
      expect(result).toBe("px-4 py-2 bg-blue-500");
    });

    // ✅ حالة دمج classes متضاربة
    it("should handle conflicting Tailwind classes", () => {
      const result = cn("px-4", "px-6"); // px-6 should override px-4
      expect(result).toBe("px-6");
    });

    // ✅ حالة conditional classes
    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toBe("base-class active-class");
    });

    // ✅ حالة conditional classes false
    it("should ignore false conditional classes", () => {
      const isActive = false;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toBe("base-class");
    });

    // ✅ حالة arrays
    it("should handle arrays of classes", () => {
      const result = cn(["px-4", "py-2"], "bg-blue-500");
      expect(result).toBe("px-4 py-2 bg-blue-500");
    });

    // ✅ حالة objects
    it("should handle object notation", () => {
      const result = cn({
        "px-4": true,
        "py-2": true,
        "bg-red-500": false,
        "bg-blue-500": true,
      });
      expect(result).toBe("px-4 py-2 bg-blue-500");
    });

    // ✅ حالة empty/undefined/null
    it("should handle empty, undefined, and null values", () => {
      const result = cn("", undefined, null, "px-4");
      expect(result).toBe("px-4");
    });

    // ✅ حالة no arguments
    it("should return empty string when no arguments provided", () => {
      const result = cn();
      expect(result).toBe("");
    });

    // ✅ حالة complex merging
    it("should handle complex class merging scenarios", () => {
      const result = cn(
        "px-4 py-2",
        "bg-blue-500 hover:bg-blue-600",
        "px-6", // should override px-4
        { "text-white": true, "text-black": false }
      );
      expect(result).toBe("py-2 bg-blue-500 hover:bg-blue-600 px-6 text-white");
    });

    // ✅ حالة whitespace handling
    it("should handle extra whitespace correctly", () => {
      const result = cn("  px-4  ", "  py-2  ");
      expect(result).toBe("px-4 py-2");
    });
  });
});

// ✅ تغطية متوقعة: 100% على جميع المقاييس
