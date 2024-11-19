import React, { useEffect } from "react";
import { useForm, FormProvider, FieldValues, Form, SubmitHandler, UseFormProps, UseFormReturn } from "react-hook-form";
import BasicForm from "../Form";

interface ContextFormPresetProps<V = FieldValues>
  extends Omit<
    React.ComponentPropsWithRef<"form">,
    "onSubmit" | "method"
  > {
  onSubmit: SubmitHandler<V>;
  formOptions: UseFormProps<V>;
  onAfterSubmitFailure?: (options: { response?: Response }) => void;
  onAfterSubmitSuccessful: (options: { response?: Response, reset: UseFormReturn<V>["reset"], submitCount: number, defaultValues: UseFormProps<V>["defaultValues"] }) => void;
  method?: "post" | "put" | "delete";
  headers?: Record<string, string>;
}

const ContextForm = <F extends FieldValues>({
  children,
  onSubmit,
  action,
  headers,
  method = "post",
  className,
  formOptions,
  onAfterSubmitFailure,
  onAfterSubmitSuccessful,
  ...props
}: ContextFormPresetProps<F>) => {
  const { control, ...methods } = useForm<F>(formOptions);
  const { formState } = methods;

  useEffect(() => {
    if (formState.isSubmitted && formState.isSubmitSuccessful) {
      if (!formOptions.progressive) {
        onAfterSubmitSuccessful({
          reset: methods.reset,
          submitCount: formState.submitCount,
          defaultValues: formOptions.defaultValues
        });
      }
    }
  }, [formState, formOptions.progressive]);

  return (
    <>
      {formOptions.progressive ? (
        <Form<F>
          control={control}
          action={action}
          method={method}
          onSubmit={({ data, event }) => onSubmit(data, event)}
          onError={({ response }) => {
            if (typeof onAfterSubmitFailure === "function") {
              onAfterSubmitFailure({ response });
            }
          }}
          onSuccess={({ response }) => {
            onAfterSubmitSuccessful({
              response,
              reset: methods.reset,
              submitCount: formState.submitCount,
              defaultValues: formOptions.defaultValues
            });
          }}
          headers={headers}
        >
          <div className={className}>{children}</div>
        </Form>
      ) : (
        <FormProvider children={null} {...methods} control={control}>
          <BasicForm
            onSubmit={methods.handleSubmit(onSubmit)}
            className={className}
            {...props}
            method={"post"}
          >
            {children}
          </BasicForm>
        </FormProvider>
      )}
    </>
  );
};

// <ContextForm
//   formOptions={{ defaultValues: {} }}
//   onSubmit={() => undefined}
//   onAfterSubmitSuccessful={() => undefined}>
//    <ContextTextBox as="textarea" />
// </ContextForm>

type ContextFormProps = React.ComponentProps<typeof ContextForm>;

export type { ContextFormProps };

export default ContextForm;
