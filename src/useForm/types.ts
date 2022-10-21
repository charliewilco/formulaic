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

interface FormActionLoad<T, K> extends FormAction<T> {
  payload: K;
}

export type FormActions<T extends FormDefaultValues> =
  | FormActionLoad<"INPUT_FIELD", Record<keyof T, any>>
  | FormAction<"SUBMIT_START">
  | FormActionLoad<"SUBMIT_SUCCESS" | "RESET", FormState<T>>
  | FormActionLoad<
      "SET_ERROR",
      {
        key: keyof T;
        message: string;
      }
    >
  | FormActionLoad<"VISIT_FIELD", keyof T>
  | FormActionLoad<"SUBMIT_ERROR", Partial<Record<keyof T, string | undefined>>>;

export interface FormProps<T extends FormDefaultValues> {
  initialValues: T;
  validationSchema?: z.ZodObject<any, any, any, any, T>;
  onSubmit(values: T): void;
}

export interface FormOptions {
  validateOnEvent?: "blur" | "submission";
}
