"use client";

import "./styles.css";

import { memo, useMemo, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Nodes from "./nodes/TextEditorNodes";
import Theme from "./Theme";
import CustomOnChangePlugin from "./plugins/CustomOnChangePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import ClickableLinkPlugin from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import useLexicalEditable from "@lexical/react/useLexicalEditable";
import { $generateHtmlFromNodes } from "@lexical/html";

import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import TableCellActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import TableCellResizer from "./plugins/TableCellResizer";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TwitterPlugin from "./plugins/TwitterPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";
import { EditorState } from "lexical";

type TextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name: string;
};

export const TextEditor: React.FC<TextEditorProps> = memo(function TextEditor({
  value,
  onChange,
  placeholder,
  name,
}) {
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const initialConfig = useMemo(
    () => ({
      namespace: name,
      theme: Theme,
      onError: () => {},
      nodes: [...Nodes],
    }),
    [name]
  );

  return (
    <div>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-shell relative border">
          <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <div className="editor resize-none relative">
                  <ContentEditable />
                </div>
              }
              placeholder={<Placeholder>Start typing...</Placeholder>}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <div className="editor-container rounded-xl relative z-0 bg-white">
            <AutoFocusPlugin />
            <HistoryPlugin />
            <CustomOnChangePlugin value={value} onChange={onChange} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
});
