import { render, screen } from "@testing-library/react";
import Home from "./page";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("Home Page", () => {
  it("renders the main heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders all feature cards", () => {
    render(<Home />);
    expect(screen.getByText("كتابة")).toBeInTheDocument();
    expect(screen.getByText("تحليل")).toBeInTheDocument();
    expect(screen.getByText("تطوير")).toBeInTheDocument();
    expect(screen.getByText("الورشة")).toBeInTheDocument();
  });

  it("renders the start writing button", () => {
    render(<Home />);
    expect(
      screen.getByRole("link", { name: /ابدأ الكتابة/ })
    ).toBeInTheDocument();
  });

  it("renders footer with copyright", () => {
    render(<Home />);
    expect(screen.getByText(/جميع الحقوق محفوظة/)).toBeInTheDocument();
  });
});
