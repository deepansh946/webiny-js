import React, { FC } from "react";
import { createComponentPlugin } from "@webiny/react-composition";
import { RichTextEditor } from "~/components/Editor/RichTextEditor";

interface AddRichTextEditorProps {
    toolbar: React.ReactNode;
    placeholder?: string;
    initValue?: string;
    children?: React.ReactNode;
}

export const AddRichTextEditorPlugin: FC<AddRichTextEditorProps> = ({
    toolbar,
    placeholder,
    children
}) => {
    const RichTextEditorPlugin = React.memo(
        createComponentPlugin(RichTextEditor, Original => {
            return function RichTextEditorElem({ tag, value, onChange }): JSX.Element {
                return (
                    <Original
                        toolbar={toolbar}
                        tag={tag}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                    >
                        {children}
                    </Original>
                );
            };
        })
    );

    return <RichTextEditorPlugin />;
};
