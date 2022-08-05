import classNames from "classnames";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Editor, Path, Range, Transforms } from "slate";
import { useFocused, useSlate } from "slate-react";
import Button from "../components/Button";
import Select from "../components/Select";
import Tooltip from "../components/Tooltip";
import styles from "../../styles/TextEditorToolbar.module.css";
import BoldIcon from "../icons/bold.svg";
import ItalicIcon from "../icons/italic.svg";
import UnderlineIcon from "../icons/underline.svg";
import StrikethroughIcon from "../icons/strikethrough.svg";
import { toggleMark, topLevelPath } from "./utils";
import { BlockType, CustomElement, TextBlock } from "./types";

export default function Toolbar() {
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useSlate();
  const inFocus = useFocused();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !inFocus ||
      Range.includes(selection, [0]) || // If the selection overlap with the title, do not show the toolbar
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      el.removeAttribute("style");
      return;
    }

    const domSelection = window.getSelection();
    if (domSelection == null) {
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    el.style.position = "absolute";
    el.style.opacity = "1";
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  });

  const type = getSelectedElementType(editor);

  return createPortal(
    <div
      ref={ref}
      className={classNames(styles.toolbar, "toolbar")}
      onMouseDown={(e) => {
        // prevent toolbar from taking focus away from editor
        e.preventDefault();
      }}
    >
      {type && (
        <>
          <div className={styles.tag_selector}>
            <Select
              defaultValue={BlockType.Paragraph}
              value={type}
              items={[
                { label: "Normal text", value: BlockType.Paragraph },
                { label: "Heading 1", value: BlockType.H1 },
                { label: "Heading 2", value: BlockType.H2 },
                { label: "Heading 3", value: BlockType.H3 },
              ]}
              onValueChange={(value: string) => {
                if (editor.selection == null) {
                  return;
                }

                // TODO: Update Select typings to infer value type from items
                const type = value as TextBlock;
                Transforms.setNodes<CustomElement>(
                  editor,
                  {
                    type,
                  },
                  {
                    at: [editor.selection.anchor.path[0]],
                  }
                );
              }}
            />
          </div>
          <div className={styles.separator} />
        </>
      )}

      <div className={styles.group}>
        <Tooltip content="Toggle Bold">
          <Button
            appearance="ghost"
            ariaLabel="Toggle Bold"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => toggleMark(editor, "bold")}
            isSquare
          >
            <BoldIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Toggle Italic">
          <Button
            appearance="ghost"
            ariaLabel="Toggle Italic"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => toggleMark(editor, "italic")}
            isSquare
          >
            <ItalicIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Toggle Underline">
          <Button
            appearance="ghost"
            ariaLabel="Toggle Underline"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => toggleMark(editor, "underline")}
            isSquare
          >
            <UnderlineIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Toggle Strikethrough">
          <Button
            appearance="ghost"
            ariaLabel="Toggle Strikethrough"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => toggleMark(editor, "strikeThrough")}
            isSquare
          >
            <StrikethroughIcon />
          </Button>
        </Tooltip>
      </div>
    </div>,
    document.body
  );
}

function getSelectedElementType(editor: Editor): TextBlock | null {
  if (editor.selection == null) {
    return null;
  }

  // If selection overlap on multiple top element, return null
  if (
    Path.compare(
      topLevelPath(editor.selection.anchor.path),
      topLevelPath(editor.selection.focus.path)
    ) !== 0
  ) {
    return null;
  }

  const element = editor.children[
    editor.selection.anchor.path[0]
  ] as CustomElement;

  if (!isTextElementType(element.type)) {
    return null;
  }

  return element.type;
}

function isTextElementType(type: string): type is TextBlock {
  return (
    type === BlockType.H1 ||
    type === BlockType.H2 ||
    type === BlockType.H3 ||
    type === BlockType.Paragraph
  );
}