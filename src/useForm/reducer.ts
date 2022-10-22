import type { FormActions, FormState, FormDefaultValues } from "./types";

export function reducer<T extends FormDefaultValues>(
	state: FormState<T>,
	_action: FormActions<T>
): FormState<T> {
	switch (_action.type) {
		case "INPUT_FIELD": {
			return {
				...state,
				values: {
					...state.values,
					[_action.name]: _action.value,
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
			if (_action.errors) {
				s.errors = _action.errors;
			}
			return s;
		}
		case "SUBMIT_SUCCESS":
		case "RESET": {
			return {
				..._action.initialState,
			};
		}
		case "VISIT_FIELD": {
			state.visited.add(_action.field);

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
					[_action.key]: _action.message,
				},
			};
		}
		default: {
			throw new Error("Must specify action type");
		}
	}
}

export const initializer = <T extends FormDefaultValues>(values: T): FormState<T> => {
	return {
		isSubmitting: false,
		values,
		errors: {},
		visited: new Set(),
	};
};
