import { Editor } from "@tinymce/tinymce-react";

interface Props {
  content: string;
  handleEditorChange: (value: string) => void;
  onImageUpload?: (fileName: string) => void; // 업로드 시 파일 이름 전달
}

export default function RichTextEditorWithTinyMCE({
  content,
  handleEditorChange,
  onImageUpload,
}: Props) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Editor
        apiKey="4tz6p287sh1yemz9lybdzyiyw8uc4v6n0ogoo12cgp2q2ex1"
        value={content}
        onEditorChange={handleEditorChange}
        init={{
          height: 400,
          menubar: false,
          plugins: ["image"],
          toolbar:
            "undo redo | bold italic underline | bullist numlist | image",
          image_title: false,
          automatic_uploads: true,
          file_picker_types: "image",
          // 이미지 클릭 시 업로드만 가능하게 설정
          file_picker_callback: function (callback) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";

            input.onchange = function () {
              const file = input.files?.[0];
              if (!file) return;

              const url = URL.createObjectURL(file); // 브라우저가 읽을 수 있는 blob URL
              callback(url, { alt: file.name });

              if (onImageUpload) onImageUpload(file.name);
            };


            input.click();
          },
          images_upload_handler: function (blobInfo) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = function (e) {
                if (e.target && typeof e.target.result === "string") {
                  resolve(e.target.result); // content에 base64 HTML
                } else {
                  reject("이미지 업로드 실패");
                }
              };
              reader.readAsDataURL(blobInfo.blob());
            });
          },
        }}
      />
    </div>
  );
}
