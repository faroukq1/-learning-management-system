'use client';
import { useMemo } from 'react';
import { JSONContent } from '@tiptap/react';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import parse from 'html-react-parser';
export default function RenderDescription({ json }: { json: JSONContent }) {
  const output = useMemo(() => {
    return generateHTML(json, [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ]);
  }, [json]);

  return (
    <div className="prose dark:prose-invert prose-li:market:text-primary">
      {parse(output)}
    </div>
  );
}
