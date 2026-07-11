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
export declare type UserDiscussionCreateFormInputValues = {
    createdAt?: string;
    updatedAt?: string;
};
export declare type UserDiscussionCreateFormValidationValues = {
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type UserDiscussionCreateFormOverridesProps = {
    UserDiscussionCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type UserDiscussionCreateFormProps = React.PropsWithChildren<{
    overrides?: UserDiscussionCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: UserDiscussionCreateFormInputValues) => UserDiscussionCreateFormInputValues;
    onSuccess?: (fields: UserDiscussionCreateFormInputValues) => void;
    onError?: (fields: UserDiscussionCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: UserDiscussionCreateFormInputValues) => UserDiscussionCreateFormInputValues;
    onValidate?: UserDiscussionCreateFormValidationValues;
} & React.CSSProperties>;
export default function UserDiscussionCreateForm(props: UserDiscussionCreateFormProps): React.ReactElement;
