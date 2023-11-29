import React from "react";
import { FbFormModelField, FbFormStep } from "~/types";
import { FormStepRow } from "./FormStepWithFields/FormStepRow";

export interface FormStepWithFieldsProps {
    fields: FbFormModelField[][];
    formStep: FbFormStep;
}

export const FormStepWithFields: React.FC<FormStepWithFieldsProps> = ({ fields, formStep }) => {
    return (
        <>
            {fields.map((row, rowIndex) => (
                <FormStepRow
                    key={`row-${rowIndex}`}
                    row={row}
                    rowIndex={rowIndex}
                    formStep={formStep}
                    isLastRow={rowIndex === fields.length - 1}
                />
            ))}
        </>
    );
};
