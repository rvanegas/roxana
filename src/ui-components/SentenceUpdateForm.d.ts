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
export declare type SentenceUpdateFormInputValues = {
    content?: string;
    searchable?: string;
};
export declare type SentenceUpdateFormValidationValues = {
    content?: ValidationFunction<string>;
    searchable?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type SentenceUpdateFormOverridesProps = {
    SentenceUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    content?: PrimitiveOverrideProps<TextFieldProps>;
    searchable?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type SentenceUpdateFormProps = React.PropsWithChildren<{
    overrides?: SentenceUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    sentence?: any;
    onSubmit?: (fields: SentenceUpdateFormInputValues) => SentenceUpdateFormInputValues;
    onSuccess?: (fields: SentenceUpdateFormInputValues) => void;
    onError?: (fields: SentenceUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: SentenceUpdateFormInputValues) => SentenceUpdateFormInputValues;
    onValidate?: SentenceUpdateFormValidationValues;
} & React.CSSProperties>;
export default function SentenceUpdateForm(props: SentenceUpdateFormProps): React.ReactElement;
