"use client";

import "./styles.css";

import { memo, useMemo, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";

import Nodes from "./nodes/TextEditorNodes";
import theme from "./theme";
import CustomOnChangePlugin from "./plugins/CustomOnChangePlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import TableCellActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import TableCellResizer from "./plugins/TableCellResizer";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";
import clsx from "clsx";

type TextEditorType = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isSimpleEditor?: boolean;
};

export const TextEditor: React.FC<TextEditorType> = memo(function TextEditor({
  name,
  value,
  onChange,
  isSimpleEditor = false,
}) {
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const initialConfig = useMemo(
    () => ({
      namespace: name,
      theme,
      onError: () => {},
      nodes: [...Nodes],
    }),
    [name]
  );

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-shell relative border rounded-xl">
          <div className="w-[calc(100%-2px)] mx-auto sticky top-0 z-10">
            <ToolbarPlugin
              setIsLinkEditMode={setIsLinkEditMode}
              isSimpleEditor={isSimpleEditor}
            />
          </div>
          <div className="editor-container relative z-0">
            <RichTextPlugin
              contentEditable={
                <div className="editor resize-none relative" ref={onRef}>
                  <ContentEditable
                    className={clsx({ "!min-h-32": isSimpleEditor })}
                  />
                </div>
              }
              placeholder={<Placeholder>Start typing...</Placeholder>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <AutoFocusPlugin />
            <HistoryPlugin />
            <CustomOnChangePlugin value={value} onChange={onChange} />
            <CheckListPlugin />
            <ListPlugin />
            <LinkPlugin />
            <AutoLinkPlugin />
            <HashtagPlugin />
            <TablePlugin />
            <TableCellResizer />
            <ImagesPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <ClickableLinkPlugin />
            {floatingAnchorElem && (
              <>
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin
                  anchorElem={floatingAnchorElem}
                  cellMerge={true}
                />
              </>
            )}
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
});
