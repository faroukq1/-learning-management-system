'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import Menubar from './Menubar';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
export default function RichTextEditor({ field }: { field: any }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: field.value
      ? JSON.parse(field.value)
      : '<p>📝 Ready to create something awesome? Start typing here...</p>',
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      field.onChange(JSON.stringify(editor.getJSON()));
    },
    autofocus: true,
    injectCSS: true,
    parseOptions: {
      preserveWhitespace: 'full',
    },
    immediatelyRender: false,
  });

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
