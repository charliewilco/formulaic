import { useCallback, useDebugValue, useId, useMemo, useReducer, useRef } from "react";
import type { ZodSchema } from "zod";
import type {
	FormState,
	FormActions,
	FormHandlers,
	FormDefaultValues,
	FormValidations,
} from "./types";
import { reducer, initializer } from "./reducer";

export function useForm<T extends FormDefaultValues>(
	initialValues: T,
	options: FormHandlers<T> & FormValidations<T> = {
		validateOnEvent: "submission",
	}
) {
	const [state, dispatch] = useReducer<React.Reducer<FormState<T>, FormActions<T>>, T>(
		reducer,
		initialValues,
		initializer
	);
	const formID = useId();
	const initialPropsRef = useRef(initialValues);

	const hasErrors = useMemo(() => {
		for (let error in state.errors) {
			if (!!error) {
				return true;
			}
		}
	}, [state.errors]);

	const getErrorProps = useCallback(
		(key: keyof T) => {
			const path = key.toString();

			return {
				["id"]: `err-${formID}-${path}`,
			} as const;
		},
		[formID]
	);

	const getFieldProps = useCallback(
		(key: keyof T) => {
			const path = key.toString();
			return {
				name: path,
				value: state.values[key] as string | number | string[],
				onChange(event: React.ChangeEvent<HTMLInputElement>) {
					dispatch({
						type: "INPUT_FIELD",
						name: key,
						value: event.target.value,
					});
				},
				onFocus(event: React.FocusEvent<HTMLInputElement>) {
					dispatch({ type: "VISIT_FIELD", field: event.target.name });
				},
				onBlur(event: React.FocusEvent<HTMLInputElement>) {
					if (options.schema && options.validateOnEvent === "blur") {
						const schema: ZodSchema = options.schema.shape[path];
						const result = schema.safeParse(event.target.value);

						if (!result.success) {
							dispatch({
								type: "SET_ERROR",
								key,
								message: result.error.errors[0].message,
							});
						}
					}
				},
				["aria-invalid"]: !!state.errors[key],
				["aria-errormessage"]: `err-${formID}-${path}`,
			} as const;
		},
		[state, dispatch, formID, initialValues, options.validateOnEvent]
	);

	const getFormProps = useCallback(() => {
		return {
			id: formID,
			onSubmit(event: React.FormEvent<HTMLFormElement>) {
				if (event) {
					event.preventDefault();
				}

				dispatch({ type: "SUBMIT_START" });

				if (options.schema && options.validateOnEvent === "submission") {
					const result = options.schema.safeParse(state.values);

					if (!result.success) {
						let errors: Partial<Record<keyof T, string | undefined>> = {};

						for (let err of result.error.errors) {
							errors[err.path[0] as keyof T] = err.message;
						}

						return dispatch({ type: "SUBMIT_ERROR", errors });
					}
				} else if (hasErrors && options.schema && options.validateOnEvent === "blur") {
					return dispatch({ type: "SUBMIT_ERROR", errors: {} });
				}

				try {
					options?.onSubmit?.(state.values);
					dispatch({
						type: "SUBMIT_SUCCESS",
						initialState: initializer(initialPropsRef.current),
					});
				} catch (error: any) {
					console.error(error);
				}
			},

			onReset(event: React.FormEvent<HTMLFormElement>) {
				if (event) {
					event.preventDefault();
				}

				if (options?.onReset) {
					options?.onReset(state.values);
				}

				dispatch({
					type: "RESET",
					initialState: initializer(initialPropsRef.current),
				});
			},
		} as const;
	}, [formID, state.values, hasErrors, options.validateOnEvent, initialValues]);

	const setField = useCallback(
		(name: keyof T, value: any) => {
			dispatch({
				type: "INPUT_FIELD",
				name,
				value,
			});
		},
		[dispatch]
	);

	useDebugValue(state.values);

	return {
		getErrorProps,
		getFieldProps,
		getFormProps,
		hasErrors,
		setField,
		...state,
	};
}
