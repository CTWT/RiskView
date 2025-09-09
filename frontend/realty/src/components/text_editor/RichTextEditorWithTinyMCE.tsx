import { Editor } from "@tinymce/tinymce-react";

interface Props {
  content: string;
  handleEditorChange: (value: string) => void;
  onImageUpload?: (fileName: string) => void; // 업로드 시 파일 이름 전달
}

export default function RichTextEditorWithTinyMCE({ content, handleEditorChange, onImageUpload }: Props) {

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
          toolbar: "undo redo | bold italic underline | bullist numlist | image",
          image_title: false,
          automatic_uploads: true,
          file_picker_types: "image",
          // 이미지 클릭 시 업로드만 가능하게 설정
          file_picker_callback: function (callback) {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");

            input.onchange = function () {
              const file = input.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = function (e) {
                if (e.target && typeof e.target.result === "string") {
                  callback(e.target.result, { alt: file.name });
                }
              };
              reader.readAsDataURL(file);
            };

            input.click();
          },
          // Promise 기반 이미지 업로드
          images_upload_handler: function (blobInfo) {
            return new Promise((resolve, reject) => {

              const fileName = blobInfo.filename();

              // 부모에게 파일 이름 전달
              if (onImageUpload) onImageUpload(fileName);

              const reader = new FileReader();
              reader.onload = function (e) {
                if (e.target && typeof e.target.result === "string") {
                  resolve(e.target.result);
                } else {
                  reject("이미지 업로드 실패");
                }
              };
              reader.onerror = () => reject("이미지 업로드 실패");
              reader.readAsDataURL(blobInfo.blob());
            });
          },
          paste_data_images: true, // 붙여넣기 이미지 허용
        }}
      />

      <h4>미리보기</h4>
      <div
        style={{ border: "1px solid #ccc", padding: "10px", minHeight: "100px" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
