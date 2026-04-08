"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Lora } from "next/font/google";

const lora = Lora({
  weight: "700",
  subsets: ["latin"],
});

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        // This class is added to the first empty paragraph
        emptyEditorClass: "is-editor-empty",
        placeholder: "Write your story...",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // Ensure "tiptap" class is present for CSS targeting
        class: "prose max-w-none focus:outline-none min-h-[300px] tiptap",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={`rounded-xl ${lora.className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
