import React, { FC } from "react";
import { useForm, FormProvider, Form, FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import BasicForm from "../BasicForm";

const ContextForm: FC<
  Omit<
    React.ComponentPropsWithRef<"form">,
    "onSubmit" | "method"
  > & {
    onSubmit: SubmitHandler<FieldValues>;
    formOptions?: UseFormProps;
    onAfterSubmitSuccessful: ({ reset: UseFormReturn["reset"], submitCount: number, defaultValues: FieldValues }) => void;
    method?: "post" | "put" | "delete";
    headers?: Record<string, string>;
  }
> = <F extends FieldValues>({
  children,
  onSubmit,
  action,
  headers,
  method = "post",
  className,
  formOptions,
  ...props
}) => {
  const { control, ...methods } = useForm<F>(formOptions);
  const { formState } = methods;

  useEffect(() => {
    if (formState.isSubmitted && formState.isSubmitSuccessful) {
      if (!formOptions.progressive) {
        onAfterSubmitSuccessful({
          reset: formState.reset,
          submitCount: formState.submitCount,
          defaultValues: formState.defaultValues
        });
      }
    }
  }, [formState, formOptions.progressive]);

  return (
    <>
      {formOptions.progressive ? (
        <Form
          control={control}
          action={action}
          method={method}
          onSubmit={onSubmit}
          onSuccess={() => {
            onAfterSubmitSuccessful({
              reset: formState.reset,
              submitCount: formState.submitCount,
              defaultValues: formState.defaultValues
            });
          }}
          headers={headers}
        >
          <div role="form" className={className}>{children}</div>
        </Form>
      ) : (
        <FormProvider control={control} {...methods}>
          <BasicForm
            onSubmit={methods.handleSubmit(onSubmit)}
            className={className}
            {...props}
          >
            {children}
          </BasicForm>
        </FormProvider>
      )}
    </>
  );
};

type ContextFormProps = React.ComponentProps<typeof ContextForm>;

export type { ContextFormProps };

export default ContextForm;
