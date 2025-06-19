import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export const RichTextEditor = ({ value, setValue, language }: any) => {
  const [images, setImages] = useState<File[]>([]);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .ql-editor {
        min-height: 200px;
        padding: 12px;
        font-size: 16px;
        line-height: 1.5;
        direction: ltr;
        text-align: left;
      }
      .ql-editor.rtl {
        direction: rtl;
        text-align: right;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleChange = (rawHtml: string, delta: any, source: string, editor: any) => {
    if (source === "user") {
      // Now handle the HTML transformation (same as before)
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, "text/html");
  
      const alignments: Record<string, string> = {
        "ql-align-center": "center",
        "ql-align-right": "flex-end",
        "ql-align-left": "flex-start",
        "ql-align-justify": "space-between"
      };
  
      doc.querySelectorAll("p").forEach((p: HTMLElement) => {
        for (const cls of Array.from(p.classList)) {
          if (alignments[cls]) {
            p.style.textAlign = alignments[cls];
            break;
          }
        }
      });
  
      const modifiedHtml = doc.body.innerHTML;
      console.log(modifiedHtml);
      
      setValue(modifiedHtml); // Update value with modified HTML
    }
  };

  // Add or remove RTL class based on language
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const editorElement = editor.root;
      if (language === "ar") {
        editorElement.classList.add("rtl");
      } else {
        editorElement.classList.remove("rtl");
      }
    }
  }, [language]);

  const imageHandler = () => {
    const input: any = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        setImages((prev) => [...prev, file]);
        const imageUrl = URL.createObjectURL(file);

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertText(range.index, imageUrl + "\n");
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ 'align': [] }],
          ["image", "link"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  );

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={handleChange}
      style={{ borderRadius: "8px", border: "1px solid #ccc" }}
      modules={modules}
    />
  );
};
