import { useCallback, useReducer, useId, useMemo, useRef } from "react";
import { ZodSchema } from "zod";

import type {
  FormState,
  FormActions,
  FormProps,
  FormDefaultValues,
  FormOptions,
} from "./types";
import { reducer, formStateInitializer } from "./reducer";

export function useForm<T extends FormDefaultValues>(
  props: FormProps<T>,
  options: FormOptions = {
    validateOnEvent: "submission",
  }
) {
  const [state, dispatch] = useReducer<
    React.Reducer<FormState<T>, FormActions<T>>,
    FormProps<T>
  >(reducer, props, formStateInitializer);
  const formID = useId();

  const initialPropsRef = useRef(props);

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
          const payload = {} as any;
          payload[key] = event.target.value;
          dispatch({
            type: "INPUT_FIELD",
            payload,
          });
        },
        onFocus(event: React.FocusEvent<HTMLInputElement>) {
          dispatch({ type: "VISIT_FIELD", payload: event.target.name });
        },
        onBlur(event: React.FocusEvent<HTMLInputElement>) {
          if (props.validationSchema && options.validateOnEvent === "blur") {
            const schema: ZodSchema = props.validationSchema.shape[path];
            const result = schema.safeParse(event.target.value);

            if (!result.success) {
              dispatch({
                type: "SET_ERROR",
                payload: {
                  key,
                  message: result.error.errors[0].message,
                },
              });
            }
          }
        },
        ["aria-invalid"]: !!state.errors[key],
        ["aria-errormessage"]: `err-${formID}-${path}`,
      } as const;
    },
    [state, dispatch, formID, props, options.validateOnEvent]
  );

  const getFormProps = useCallback(() => {
    return {
      id: formID,
      onSubmit(event: React.FormEvent<HTMLFormElement>) {
        if (event) {
          event.preventDefault();
        }

        dispatch({ type: "SUBMIT_START" });

        if (props.validationSchema && options.validateOnEvent === "submission") {
          const result = props.validationSchema.safeParse(state.values);

          if (!result.success) {
            let errors: Partial<Record<keyof T, string | undefined>> = {};

            for (let err of result.error.errors) {
              errors[err.path[0] as keyof T] = err.message;
            }

            return dispatch({ type: "SUBMIT_ERROR", payload: errors });
          }
        } else if (hasErrors && props.validationSchema && options.validateOnEvent === "blur") {
          return dispatch({ type: "SUBMIT_ERROR", payload: {} });
        }

        try {
          props.onSubmit(state.values);
          dispatch({
            type: "SUBMIT_SUCCESS",
            payload: formStateInitializer(initialPropsRef.current),
          });
        } catch (error: any) {
          console.error(error);
        }
      },

      onReset(event: React.FormEvent<HTMLFormElement>) {
        if (event) {
          event.preventDefault();
        }

        dispatch({
          type: "RESET",
          payload: formStateInitializer(initialPropsRef.current),
        });
      },
    } as const;
  }, [formID, state.values, hasErrors, options.validateOnEvent, props]);

  return {
    getErrorProps,
    getFieldProps,
    getFormProps,
    hasErrors,
    ...state,
  };
}
