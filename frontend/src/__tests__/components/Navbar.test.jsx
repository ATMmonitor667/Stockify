import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

describe("Navbar Component", () => {
  test("renders without crashing", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Stockify")).toBeInTheDocument();
  });

  test("contains navigation links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  test("renders login and sign-up buttons", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });
});