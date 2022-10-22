import { useForm } from "./useForm";
import z from "zod";

interface LoginForm {
	email: string;
	password: string;
}

const initialValues = {
	email: "",
	password: "",
};

export function useLoginForm() {
	return useForm<LoginForm>(initialValues, {
		onSubmit(values) {
			console.log(values);
		},
		schema: z.object({
			email: z.string().email("Invalid email address"),
			password: z.string().min(8),
		}),
		validateOnEvent: "blur",
	});
}
