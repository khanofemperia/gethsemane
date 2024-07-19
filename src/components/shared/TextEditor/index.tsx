"use client";

import { memo, useMemo } from "react";
import Nodes from "./nodes/TextEditorNodes";

type TextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name: string;
}

const theme: EditorThemeClasses = {
  text: {
    bold: css({ fontWeight: "bold" }),
    underline: css({ textDecoration: "underline" }),
    strikethrough: css({ textDecoration: "line-through" }),
    underlineStrikethrough: css({ textDecoration: "underline line-through" }),
    italic: css({ fontStyle: "italic" }),
    code: css({
      color: "black",
      padding: 2,
      background: "#eee",
      border: "1px solid #ccc",
    }),
  },
};

export const TextEditor: React.FC<TextEditorProps> = memo(
  function TextEditor({ value, onChange, placeholder, name }) {
    const initialConfig = useMemo(
      () => ({
        namespace: name,
        theme,
        onError: () => {},
        nodes: [...Nodes],
      }),
      [name]
    );

    return (
      <Box>
        <LexicalComposer initialConfig={initialConfig}>
          <ToolbarPlugin />
          <Box pos="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={css({
                    height: 120,
                    fontSize: 12,
                    padding: 8,
                    overflow: "auto",
                    outline: "none",
                    border: "1px solid black",
                    borderRadius: "4px",
                  })}
                />
              }
              placeholder={
                <Box
                  className={css({
                    position: "absolute",
                    color: "#999",
                    top: 8,
                    left: 10,
                    fontSize: 12,
                  })}
                >
                  {placeholder}
                </Box>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </Box>
          <AutoFocusPlugin />
          <HistoryPlugin />
          <CustomOnChangePlugin value={value} onChange={onChange} />
        </LexicalComposer>
      </Box>
    );
  }
);
