import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "@/app/page";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("Home page", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    (global.URL.createObjectURL as jest.Mock).mockClear();
  });

  it("renders the prompt form", () => {
    render(<Home />);
    expect(screen.getByText("aspen")).toBeInTheDocument();
    expect(screen.getByText("Document Generator")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/what would you like to create/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate pdf/i })
    ).toBeInTheDocument();
  });

  it("shows client context card with Susie's info", () => {
    render(<Home />);
    expect(screen.getByText("Susie Hartman")).toBeInTheDocument();
    expect(screen.getByText(/retired school principal/i)).toBeInTheDocument();
    expect(screen.getByText("$1,200,000")).toBeInTheDocument();
  });

  it("disables button when prompt is empty", () => {
    render(<Home />);
    const button = screen.getByRole("button", { name: /generate pdf/i });
    expect(button).toBeDisabled();
  });

  it("enables button when prompt has text", () => {
    render(<Home />);
    const textarea = screen.getByLabelText(/what would you like to create/i);
    fireEvent.change(textarea, {
      target: { value: "Create a PDF about deferred sales trust" },
    });
    const button = screen.getByRole("button", { name: /generate pdf/i });
    expect(button).toBeEnabled();
  });

  it("shows progress messages during generation", async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                blob: () => Promise.resolve(new Blob(["pdf"])),
                headers: new Headers(),
              }),
            100
          )
        )
    );

    render(<Home />);
    const textarea = screen.getByLabelText(/what would you like to create/i);
    fireEvent.change(textarea, { target: { value: "test prompt" } });

    const button = screen.getByRole("button", { name: /generate pdf/i });
    fireEvent.click(button);

    // Should show the first progress message
    expect(
      await screen.findByText("Analyzing client profile...")
    ).toBeInTheDocument();
  });

  it("clears prompt after clicking generate", async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                blob: () => Promise.resolve(new Blob(["pdf"])),
                headers: new Headers(),
              }),
            100
          )
        )
    );

    render(<Home />);
    const textarea = screen.getByLabelText(/what would you like to create/i);
    fireEvent.change(textarea, { target: { value: "test prompt" } });
    fireEvent.click(screen.getByRole("button", { name: /generate pdf/i }));

    // Prompt should be cleared immediately
    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });

  it("shows success banner after PDF downloads", async () => {
    const mockBlob = new Blob(["pdf-content"], { type: "application/pdf" });
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
      headers: new Headers({ "Content-Disposition": 'attachment; filename="susie-hartman-test.pdf"' }),
    });

    const mockClick = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") {
        el.click = mockClick;
      }
      return el;
    });

    render(<Home />);
    const textarea = screen.getByLabelText(/what would you like to create/i);
    fireEvent.change(textarea, { target: { value: "test prompt" } });
    fireEvent.click(screen.getByRole("button", { name: /generate pdf/i }));

    expect(
      await screen.findByText("PDF generated successfully")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/your document has been downloaded/i)
    ).toBeInTheDocument();

    jest.restoreAllMocks();
  });

  it("shows error banner on API failure with dismiss button", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Something went wrong" }),
    });

    render(<Home />);
    const textarea = screen.getByLabelText(/what would you like to create/i);
    fireEvent.change(textarea, { target: { value: "test prompt" } });
    fireEvent.click(screen.getByRole("button", { name: /generate pdf/i }));

    expect(await screen.findByText("Generation failed")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Prompt should be restored on error
    expect(textarea).toHaveValue("test prompt");
  });

  it("sends correct request body to API", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["pdf"])),
      headers: new Headers(),
    });

    render(<Home />);
    const textarea = screen.getByLabelText(/what would you like to create/i);
    fireEvent.change(textarea, {
      target: { value: "Create a PDF about estate planning" },
    });
    fireEvent.click(screen.getByRole("button", { name: /generate pdf/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Create a PDF about estate planning",
        }),
      });
    });
  });
});
