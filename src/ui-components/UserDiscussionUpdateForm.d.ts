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
export declare type UserDiscussionUpdateFormInputValues = {
    createdAt?: string;
    updatedAt?: string;
};
export declare type UserDiscussionUpdateFormValidationValues = {
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type UserDiscussionUpdateFormOverridesProps = {
    UserDiscussionUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type UserDiscussionUpdateFormProps = React.PropsWithChildren<{
    overrides?: UserDiscussionUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    userDiscussion?: any;
    onSubmit?: (fields: UserDiscussionUpdateFormInputValues) => UserDiscussionUpdateFormInputValues;
    onSuccess?: (fields: UserDiscussionUpdateFormInputValues) => void;
    onError?: (fields: UserDiscussionUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: UserDiscussionUpdateFormInputValues) => UserDiscussionUpdateFormInputValues;
    onValidate?: UserDiscussionUpdateFormValidationValues;
} & React.CSSProperties>;
export default function UserDiscussionUpdateForm(props: UserDiscussionUpdateFormProps): React.ReactElement;
