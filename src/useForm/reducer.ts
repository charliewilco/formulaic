import type { FormActions, FormState, FormDefaultValues, FormProps } from "./types";

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
          ..._action.payload,
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
      if (_action.payload) {
        s.errors = _action.payload;
      }
      return s;
    }
    case "SUBMIT_SUCCESS":
    case "RESET": {
      return {
        ..._action.payload,
      };
    }
    case "VISIT_FIELD": {
      state.visited.add(_action.payload);

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
          [_action.payload.key]: _action.payload.message,
        },
      };
    }
    default: {
      throw new Error("Must specify action type");
    }
  }
}

export const formStateInitializer = <T extends FormDefaultValues>(
  props: FormProps<T>
): FormState<T> => {
  return {
    isSubmitting: false,
    values: props.initialValues,
    errors: {},
    visited: new Set(),
  };
};
