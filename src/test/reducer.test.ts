import { describe, test, expect, vi } from "vitest";
import { initializer, reducer } from "../useForm/reducer";

describe("Reducer", () => {
	test("should return initial state", () => {
		const initialState = initializer({
			email: "",
			password: "",
		});

		expect(initialState.isSubmitting).toBe(false);
		expect(initialState.errors).toEqual({});
		expect(initialState.values).toEqual({
			email: "",
			password: "",
		});
	});

	test("should not be okay with non-specified action type", () => {
		const initialState = initializer({
			initialValues: {
				email: "",
				password: "",
			},

			onSubmit() {},
		});
		// @ts-expect-error
		expect(() => reducer(initialState, { type: "BANANAS" })).toThrowError(
			"Must specify action type"
		);
	});
});
