import type { FormActions, FormState, FormDefaultValues } from "./types";

export function reducer<T extends FormDefaultValues>(
	state: FormState<T>,
	action: FormActions<T>
): FormState<T> {
	switch (action.type) {
		case "INPUT_FIELD": {
			return {
				...state,
				values: {
					...state.values,
					[action.name]: action.value,
				},
			};
		}
		case "SUBMIT_START": {
			return {
				...state,
				isSubmitting: true,
			};
		}
		case "SUBMIT_ERROR": {
			const s = Object.assign({ isSubmitting: false }, state);
			if (action.errors) {
				s.errors = action.errors;
			}
			return s;
		}
		case "SUBMIT_SUCCESS":
		case "RESET": {
			return {
				...action.initialState,
			};
		}
		case "VISIT_FIELD": {
			state.visited.add(action.field);

			return {
				...state,
				visited: state.visited,
			};
		}
		case "SET_ERROR": {
			return {
				...state,
				errors: {
					...state.errors,
					[action.key]: action.message,
				},
			};
		}
		default: {
			throw new Error("Must specify action type");
		}
	}
}

export function initializer<T extends FormDefaultValues>(values: T): FormState<T> {
	return {
		isSubmitting: false,
		values,
		errors: {},
		visited: new Set(),
	};
}
