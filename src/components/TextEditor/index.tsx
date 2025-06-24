import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

export const RichTextEditor = ({ value, setValue, language }: any) => {
  const editorRef = useRef(null);

  // Get the language code from the field name (e.g., news_title__ar -> ar)
  const fieldLang = language;

  const isRTL = fieldLang === "ar";

  const settingValue = (e: any) => {
    setValue(e);
  };

  return (
    <div className="as-form-field">
      <style jsx global>{`
        .rtl-editor .tox-tinymce {
          direction: rtl !important;
        }
        .rtl-editor .tox-menubar {
          flex-direction: row-reverse !important;
          justify-content: flex-end !important;
          padding-right: 0 !important;
          padding-left: 8px !important;
        }
        .rtl-editor .tox-toolbar__primary {
          flex-direction: row-reverse !important;
          justify-content: flex-end !important;
          padding-right: 0 !important;
          padding-left: 8px !important;
        }
        .rtl-editor .tox-toolbar__group {
          flex-direction: row-reverse !important;
        }
        .rtl-editor .tox-toolbar__group:not(:last-of-type) {
          margin-right: 0 !important;
          margin-left: 8px !important;
        }
        .rtl-editor .tox-tbtn {
          margin-right: 0 !important;
          margin-left: 2px !important;
        }
        .rtl-editor .tox-tbtn:last-child {
          margin-left: 0 !important;
        }
      `}</style>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={value}
        onInit={(evt: any, editor: any) => (editorRef.current = editor)}
        onEditorChange={(newContent: any) => settingValue(newContent)}
        init={{
          license_key: "gpl",
          height: 400,
          menubar: true,
          readonly: false,
          directionality: isRTL ? "rtl" : "ltr",
          rtl_ui: isRTL,
          content_style: isRTL
            ? "body { direction: rtl; }"
            : "body { direction: ltr; }",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
            "directionality",
          ],
          toolbar:
            "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code preview | rtl ltr",
          skin_url: "/tinymce/skins/ui/oxide",
          content_css: "/tinymce/skins/content/default/content.css",
          image_title: true,
          image_class_list: [
            { title: "None", value: "" },
            { title: "Responsive", value: "img-fluid" },
            { title: "Rounded", value: "rounded" },
          ],
          extended_valid_elements:
            "img[class|src|alt|width|height|style|title]",
          image_advtab: true,
          automatic_uploads: true,
          images_upload_handler: async (
            blobInfo: any,
            success: any,
            failure: any
          ) => {
            try {
              const formData = new FormData();
              formData.append("file", blobInfo.blob());

              const res = await fetch(
                "https://inspectionapiuat.gogomotor.com/api/v1/oci/upload",
                {
                  method: "POST",
                  headers: {
                    Authorization: "Bearer <your-token-here>",
                  },
                  body: formData,
                }
              );

              const json = await res.json();
              success(
                `https://inpstore.gogomotor.com/download/${json.fileName}`
              );
            } catch (err) {
              console.error("Image upload failed", err);
              failure("Image upload failed");
            }
          },
          file_picker_types: "image",
          file_picker_callback: function (
            callback: any,
            value: any,
            meta: any
          ) {
            if (meta.filetype === "image") {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");

              input.onchange = async function () {
                // @ts-ignore
                const file = input.files[0];
                const formData = new FormData();
                formData.append("file", file);

                try {
                  const res = await fetch(
                    "https://inspectionapiuat.gogomotor.com/api/v1/oci/upload",
                    {
                      method: "POST",
                      headers: {
                        Authorization: "Bearer <your-token-here>",
                      },
                      body: formData,
                    }
                  );

                  const json = await res.json();
                  const imageUrl = `https://inpstore.gogomotor.com/download/${json.fileName}`;
                  callback(imageUrl, { alt: file.name });
                } catch (err) {
                  console.error("Upload failed", err);
                }
              };

              input.click();
            }
          },
        }}
      />
    </div>
  );
};

export const RichTextEditorAr = ({ valueAr, setValueAr, language }: any) => {
  const editorRef = useRef(null);
  // Get the language code from the field name (e.g., news_title__ar -> ar)
  const fieldLang = language;

  const isRTL = fieldLang === "ar";

  const settingValue = (e: any) => {
    setValueAr(e);
  };

  return (
    <div className="as-form-field">
      <style jsx global>{`
        .rtl-editor .tox-tinymce {
          direction: rtl !important;
        }
        .rtl-editor .tox-menubar {
          flex-direction: row-reverse !important;
          justify-content: flex-end !important;
          padding-right: 0 !important;
          padding-left: 8px !important;
        }
        .rtl-editor .tox-toolbar__primary {
          flex-direction: row-reverse !important;
          justify-content: flex-end !important;
          padding-right: 0 !important;
          padding-left: 8px !important;
        }
        .rtl-editor .tox-toolbar__group {
          flex-direction: row-reverse !important;
        }
        .rtl-editor .tox-toolbar__group:not(:last-of-type) {
          margin-right: 0 !important;
          margin-left: 8px !important;
        }
        .rtl-editor .tox-tbtn {
          margin-right: 0 !important;
          margin-left: 2px !important;
        }
        .rtl-editor .tox-tbtn:last-child {
          margin-left: 0 !important;
        }
      `}</style>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={valueAr}
        onInit={(evt: any, editor: any) => (editorRef.current = editor)}
        onEditorChange={(newContent: any) => settingValue(newContent)}
        init={{
          license_key: "gpl",
          height: 400,
          menubar: true,
          readonly: false,
          directionality: isRTL ? "rtl" : "ltr",
          rtl_ui: isRTL,
          content_style: isRTL
            ? "body { direction: rtl; }"
            : "body { direction: ltr; }",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
            "directionality",
          ],
          toolbar:
            "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code preview | rtl ltr",
          skin_url: "/tinymce/skins/ui/oxide",
          content_css: "/tinymce/skins/content/default/content.css",
          image_title: true,
          image_class_list: [
            { title: "None", value: "" },
            { title: "Responsive", value: "img-fluid" },
            { title: "Rounded", value: "rounded" },
          ],
          extended_valid_elements:
            "img[class|src|alt|width|height|style|title]",
          image_advtab: true,
          automatic_uploads: true,
          images_upload_handler: async (
            blobInfo: any,
            success: any,
            failure: any
          ) => {
            try {
              const formData = new FormData();
              formData.append("file", blobInfo.blob());

              const res = await fetch(
                "https://inspectionapiuat.gogomotor.com/api/v1/oci/upload",
                {
                  method: "POST",
                  headers: {
                    Authorization: "Bearer <your-token-here>",
                  },
                  body: formData,
                }
              );

              const json = await res.json();
              success(
                `https://inpstore.gogomotor.com/download/${json.fileName}`
              );
            } catch (err) {
              console.error("Image upload failed", err);
              failure("Image upload failed");
            }
          },
          file_picker_types: "image",
          file_picker_callback: function (
            callback: any,
            value: any,
            meta: any
          ) {
            if (meta.filetype === "image") {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");

              input.onchange = async function () {
                // @ts-ignore
                const file = input.files[0];
                const formData = new FormData();
                formData.append("file", file);

                try {
                  const res = await fetch(
                    "https://inspectionapiuat.gogomotor.com/api/v1/oci/upload",
                    {
                      method: "POST",
                      headers: {
                        Authorization: "Bearer <your-token-here>",
                      },
                      body: formData,
                    }
                  );

                  const json = await res.json();
                  const imageUrl = `https://inpstore.gogomotor.com/download/${json.fileName}`;
                  callback(imageUrl, { alt: file.name });
                } catch (err) {
                  console.error("Upload failed", err);
                }
              };

              input.click();
            }
          },
        }}
      />
    </div>
  );
};
