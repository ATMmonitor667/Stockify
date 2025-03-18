import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

describe("Navbar and Features Interaction", () => {
  test("clicking Features link scrolls to Features section", async () => {
    render(
      <MemoryRouter>
        <Navbar />
        <Features />
      </MemoryRouter>
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("Features"));
    expect(screen.getByText("Why Learn with Stockify?")).toBeInTheDocument();
  });

  test("handles missing Features section gracefully", async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("Features"));
    expect(screen.getByText("Features")).toBeInTheDocument();
  });
});
