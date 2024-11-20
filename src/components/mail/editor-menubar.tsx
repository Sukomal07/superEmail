import React, { useCallback } from 'react'
import { type Editor } from '@tiptap/react'
import { Button } from '../ui/button'
import { Bold, Code, Heading1, Heading2, Heading3, Heading4, Heading5, ImageIcon, Italic, List, ListOrdered, Quote, Redo, Strikethrough, UnderlineIcon, Undo } from 'lucide-react'

type Props = {
    editor: Editor
}

export default function EditorMenubar({ editor }: Props) {

    const addImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = () => {
            if (input.files?.[0]) {
                const file = input.files[0];

                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageUrl = event.target?.result as string | null;

                    if (imageUrl) {
                        editor.chain().focus().setImage({ src: imageUrl }).run();
                    } else {
                        console.error('Failed to read file');
                    }
                };

                reader.readAsDataURL(file);
            } else {
                console.error('No file selected');
            }
        };

        input.click();
    }, [editor])
    return (
        <div className="flex flex-wrap gap-2 px-2">
            <Button
                onClick={addImage}
                variant={"ghost"}
                size={"icon"}
            >
                <ImageIcon className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Bold className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Italic className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                className={editor.isActive("underline") ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <UnderlineIcon className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Strikethrough className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={editor.isActive("code") ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Code className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Heading1 className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Heading2 className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Heading3 className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                disabled={!editor.can().chain().focus().toggleHeading({ level: 4 }).run()}
                className={editor.isActive("heading", { level: 4 }) ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Heading4 className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                disabled={!editor.can().chain().focus().toggleHeading({ level: 5 }).run()}
                className={editor.isActive("heading", { level: 5 }) ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Heading5 className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={!editor.can().chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <List className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={!editor.can().chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <ListOrdered className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                disabled={!editor.can().chain().focus().toggleBlockquote().run()}
                className={editor.isActive("blockquote") ? "is-active" : ""}
                variant={"ghost"}
                size={"icon"}
            >
                <Quote className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                variant={"ghost"}
                size={"icon"}
            >
                <Undo className="size-4 text-secondary-foreground" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                variant={"ghost"}
                size={"icon"}
            >
                <Redo className="size-4 text-secondary-foreground" />
            </Button>
        </div>
    )
}