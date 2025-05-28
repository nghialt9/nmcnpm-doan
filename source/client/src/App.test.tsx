import React from "react";
import { render, screen } from "@testing-library/react";

test("renders learn react link", () => {
  render(<h2>sdf</h2>);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
