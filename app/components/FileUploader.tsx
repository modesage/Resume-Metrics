import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const maxFileSize = 20 * 1024 * 1024; // 20MB

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileSelect?.(acceptedFiles[0] || null);
    },
    [onFileSelect]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: maxFileSize,
  });

  const file = acceptedFiles[0] || null;

  return (
    <div className="w-full gradient-border rounded-xl p-4">
      <div
        {...getRootProps()}
        role="button"
        tabIndex={0}
        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition 
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />

        <div className="space-y-4 text-center">
          {file ? (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <img src="/images/pdf.png" alt="PDF file" className="size-10" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                </div>
              </div>
              <button
                aria-label="Remove file"
                className="p-2 hover:bg-gray-200 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect?.(null);
                }}
              >
                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                <img
                  src="/icons/upload-cloud-doc.svg"
                  alt="Upload"
                  className="size-20"
                />
              </div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-sm text-gray-400">
                PDF (max {formatSize(maxFileSize)})
              </p>
            </div>
          )}

          {/* Show errors */}
          {fileRejections.length > 0 && (
            <p className="text-sm text-red-500">
              {fileRejections[0].errors[0].message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
