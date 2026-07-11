/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type SentenceCreateFormInputValues = {
    content?: string;
    searchable?: string;
};
export declare type SentenceCreateFormValidationValues = {
    content?: ValidationFunction<string>;
    searchable?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type SentenceCreateFormOverridesProps = {
    SentenceCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    content?: PrimitiveOverrideProps<TextFieldProps>;
    searchable?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type SentenceCreateFormProps = React.PropsWithChildren<{
    overrides?: SentenceCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: SentenceCreateFormInputValues) => SentenceCreateFormInputValues;
    onSuccess?: (fields: SentenceCreateFormInputValues) => void;
    onError?: (fields: SentenceCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: SentenceCreateFormInputValues) => SentenceCreateFormInputValues;
    onValidate?: SentenceCreateFormValidationValues;
} & React.CSSProperties>;
export default function SentenceCreateForm(props: SentenceCreateFormProps): React.ReactElement;
