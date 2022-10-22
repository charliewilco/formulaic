import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import App from "../basic";

describe("Basic forms", () => {
	test("setup", async () => {
		render(<App />);

		expect(screen.queryAllByTestId(/test-/)).toHaveLength(2);
	});

	test("can type in an input", async () => {
		render(<App />);

		const input = screen.getByRole<HTMLInputElement>("textbox");
		await userEvent.type(input, "Hello World");

		expect(input).toBeInTheDocument();

		expect(input.value).toBe("Hello World");
	});

	test("can run validations", async () => {
		render(<App />);

		const input = screen.getByRole<HTMLInputElement>("textbox");
		await userEvent.type(input, "Hello World");

		expect(input).toBeInTheDocument();

		expect(input.value).toBe("Hello World");

		await userEvent.tab();

		expect(screen.getByText("Invalid email address")).toBeInTheDocument();
	});

	test.todo("track visited inputs", async () => {
		render(<App />);
	});
});
