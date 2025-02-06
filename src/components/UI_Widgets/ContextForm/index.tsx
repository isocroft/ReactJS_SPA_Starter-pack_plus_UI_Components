import React, { useEffect } from "react";
import { useForm, FormProvider, FieldValues, Form, SubmitHandler, UseFormProps, UseFormReturn } from "react-hook-form";
import BasicForm from "../Form";

interface ContextFormPresetProps<V extends FieldValues>
  extends Omit<
    React.ComponentPropsWithRef<"form">,
    "onSubmit" | "method"
  > {
  onSubmit: SubmitHandler<V>;
  formOptions: UseFormProps<V>;
  onAfterSubmitFailure?: (options: {
    response?: Response
  }) => void;
  onAfterSubmitSuccessful: (options: {
    response?: Response,
    reset: UseFormReturn<V>["reset"],
    submitCount: number,
    defaultValues: UseFormProps<V>["defaultValues"]
  }) => void;
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
  const { control, ...methods } = useForm<F>(
    Object.assign({ mode: "onChange" as const }, formOptions)
  );
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
          onError={({ response }: { response?: Response }) => {
            if (typeof onAfterSubmitFailure === "function") {
              onAfterSubmitFailure({ response });
            }
          }}
          onSuccess={({ response }: { response?: Response }) => {
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
        <FormProvider {...methods} control={control}>
          <BasicForm
            onSubmit={methods.handleSubmit(onSubmit)}
            className={className}
            {...props}
            method={formOptions.mode === "all" ? undefined : "post"}
          >
            {children}
          </BasicForm>
        </FormProvider>
      )}
    </>
  );
};

/*
  import React, { useMemo } from "react";

  const formOptions = useMemo(() => {
    return {
      defaultValues: {
        texty: "",
        switchy: "off"
      },
      mode: "all" as const
    }
  }, []);
  
  <ContextForm<Record<string, unknown>>
   formOptions={formOptions}
   onSubmit={(data, event) => console.log(data, " >>> ", event)}
   onAfterSubmitSuccessful={() => undefined}>
    <ContextTextBox
      as="textarea"
      name="texty"
      maxLength={140}
      labelPosition="afterInput"
      className=""
    >
      <span>Text Input:</span>
    </ContextTextBox>
    <ContextCheckBox
      className=""
      labelPosition="afterInput"
    >
      <span>Rate:</span>
    </ContextCheckBox>
    <ContextFormItem>
      <label className="">
        <span>Okay Go:</span>
      </label>
      <ContextComboBox
        id="gender"
        className=""
      >
        <ContextComboBox.Trigger
          className=""
          type="panel">
          <p>Select Gender:</p>
        </<ContextComboBox.Trigger>
        <<ContextComboBox.List className="">
          <li>Male</li>
          <li>Female</li>
        </<ContextComboBox.List>
      </ContextComboBox>
    </ContextFormItem>
    <ContextFileBox
      name="filey"
      accept="image/png, image/jpeg"
      labelPosition="afterInput"
      className=""
    >
      <span>Text Input:</span>
    </ContextFileBox>
    <ContextSwitchBox
      id={"myswitch"}
      name={"switchy"}
      switchWidgetSize={SwitchWidget.WidgetSizes.MID}
      switchActiveText={"Yes"}
      switchInactiveText={"No"}
      labelPosition={"beforeInput"}
    >
      <span>Switchy:</span>
    </ContextSwitchBox>
    <ContextCalendarBox>
      <ContextCalendarBox.DateInput>
        <span>Date of Birth:</span>
      </ContextCalendarBox.DateInput>
    </ContextCalendarBox>
    <ContextFormItem>
      
    </ContextFormItem>
 </ContextForm>

*/

type ContextFormProps = React.ComponentProps<typeof ContextForm>;

export type { ContextFormProps };

export default ContextForm;
