import type z from "zod";

export interface FormState<T> {
	isSubmitting: boolean;
	values: T;
	errors: Partial<Record<keyof T, string | undefined>>;
	visited: Set<keyof T>;
}

export type FormDefaultValues = Record<string, any>;

interface FormAction<T> {
	type: T;
}

type FormActionLoad<T, K> = FormAction<T> & K;

export type FormActions<T extends FormDefaultValues> =
	| FormActionLoad<"INPUT_FIELD", { name: keyof T; value: any }>
	| FormAction<"SUBMIT_START">
	| FormActionLoad<
			"SUBMIT_SUCCESS" | "RESET",
			{
				initialState: FormState<T>;
			}
	  >
	| FormActionLoad<
			"SET_ERROR",
			{
				key: keyof T;
				message: string;
			}
	  >
	| FormActionLoad<"VISIT_FIELD", { field: keyof T }>
	| FormActionLoad<
			"SUBMIT_ERROR",
			{
				errors: Partial<Record<keyof T, string | undefined>>;
			}
	  >;

export interface FormHandlers<T> {
	onSubmit?(values: T): void;
	onReset?(values: T): void;
}

export interface FormValidations<T> {
	schema?: z.ZodObject<any, any, any, any, T>;
	validateOnEvent?: "blur" | "submission";
}
