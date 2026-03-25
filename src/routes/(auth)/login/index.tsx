import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBoundStore } from "@/store/client/use-store";
import { extractSessionToken, useLogin } from "@/store/server/login/mutation";
import logo from "@/assets/rms.jpg"

export const Route = createFileRoute("/(auth)/login/")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/",
  }),
  beforeLoad: ({ search }) => {
    if (useBoundStore.getState().token) {
      throw redirect({ to: search.redirect });
    }
  },
  component: RouteComponent,
});

const formSchema = z.object({
  email: z.email().min(1, "User name  must be at least 1 characters."),
  password: z.string().min(1, "Password must be needed."),
});

function RouteComponent() {
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value, {
        onSuccess: (data) => {
          const token = extractSessionToken(data);
          if (!token) return;
          useBoundStore.getState().setAuth(token);
          void navigate({ to: search.redirect });
        },
      });
    },
  });
  return (
    <div className=" grid grid-cols-2">
      <div className=" relative h-screen ">
        <img src={logo} alt="cover" className=" object-cover w-full h-full" />
        <div
          style={{
            width: "100%",
            background:
              "linear-gradient(0deg, #000 30%, rgba(0, 0, 0, 0) 100%)",
            position: "absolute",
            zIndex: 20,
            bottom: 0,
            left: 0,
          }}
          className=" h-1/4"
        >
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-lg font-semibold">KLT-RMS Automation</h2>
            <p className="text-sm opacity-80">
           Smart, Innovative, Cost Effective
            </p>
          </div>
        </div>
      </div>
      <div className=" flex justify-center items-center h-screen">
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle className=" flex justify-center">
              <img
                src={"https://staging.atom-rms.com/file/logo_200x200.png"}
                alt="Pan"
                className="h-14.25 w-auto object-contain group-data-[collapsible=icon]:hidden"
              />
            </CardTitle>
            <CardDescription className=" text-center">
             Welcome to KLT-RMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="bug-report-form"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup className=" gap-5">
                <form.Field
                  name="email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field className=" gap-2" data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Email
                        </FieldLabel>
                        <Input
                        type="email"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Text "
                          autoComplete="off"
                        />
                      </Field>
                    );
                  }}
                />
                <form.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field className=" gap-2" data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Password
                        </FieldLabel>
                        <Input
                        type="password"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Text"
                          autoComplete="off"
                        />
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className=" border-t-0 bg-transparent">
            <Field orientation="horizontal">
              <Button
                type="submit"
                className=" cursor-pointer w-full"
                form="bug-report-form"
                isPending={loginMutation.isPending}
              >
                Log In
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
