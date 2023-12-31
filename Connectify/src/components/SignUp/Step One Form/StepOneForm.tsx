import { Grid } from "@chakra-ui/react";
import { FormField } from "../Form Field/FormField";
import PasswordValidationPopup from "../../Password Popup/PasswordPopup";
import { SignUpData } from "../../../types/interfaces";
import { PasswordField } from "../../Password Field/PasswordField";
// import usePasswordValidation from "../../../Authentification/Password Hook/usePassValid";

interface ValidationErrors {
    firstNameError: string | undefined;
    lastNameError: string | undefined;
    emailError: string | undefined;
    phoneNumberError: string | undefined;
    usernameError: string | undefined;
    passwordError: string | undefined;
    confirmPasswordError: string | undefined;
}

interface TouchedFields {
    firstName: boolean;
    lastName: boolean;
    uid: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
    username: boolean;
    phoneNumber: boolean;
    photoURL: boolean;
}

export interface PasswordValidationStates {
    isLengthValid: boolean;
    isUpperAndLowerCaseValid: boolean;
    isNumberValid: boolean;
    isSpecialCharValid: boolean;
}

interface SignUpStepOneFormProps {
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    signupData: SignUpData;
    validationErrors: ValidationErrors;
    touchedFields: TouchedFields;
    passwordValidationStates: PasswordValidationStates; 
}

export const SignUpStepOneForm: React.FC<SignUpStepOneFormProps> = ({ handleChange, signupData, validationErrors, touchedFields, passwordValidationStates }) => {
    return (
        <>
            <Grid templateColumns="1fr" gap={6} >
                <FormField
                    label="First Name"
                    placeholder="Enter your first name"
                    type="text"
                    name="firstName"
                    value={signupData.firstName}
                    onChange={handleChange}
                    isRequired
                    isInvalid={touchedFields.firstName && !!validationErrors.firstNameError}
                    errorMessage={validationErrors.firstNameError}
                />
                <FormField
                    label="Last Name"
                    placeholder="Enter your last name"
                    type="text"
                    name="lastName"
                    value={signupData.lastName}
                    onChange={handleChange}
                    isRequired
                    isInvalid={touchedFields.lastName && !!validationErrors.lastNameError}
                    errorMessage={validationErrors.lastNameError}
                />
                <PasswordValidationPopup
                    passwordValidationStates={passwordValidationStates}
                >
                    <PasswordField
                        label="Password"
                        placeholder="Enter your password"
                        name="password"
                        onChange={handleChange}
                        value={signupData.password}
                        isRequired
                        isInvalid={touchedFields.password && !!validationErrors.passwordError}
                        errorMessage={validationErrors.passwordError}
                    />
                </PasswordValidationPopup>
                <PasswordField
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    name="confirmPassword"
                    onChange={handleChange}
                    value={signupData.confirmPassword}
                    isRequired
                    isInvalid={touchedFields.confirmPassword && !!validationErrors.confirmPasswordError}
                    errorMessage={validationErrors.confirmPasswordError}
                />
            </Grid>
        </>
    );
}
