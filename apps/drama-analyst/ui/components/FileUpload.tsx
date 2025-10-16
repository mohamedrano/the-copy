
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, DocumentTextIcon } from '@ui/icons';
import { MIN_FILES_REQUIRED, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, SUPPORTED_MIME_TYPES } from '@core/constants';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  uploadedFiles: File[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded, uploadedFiles }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    let currentError = "";
    if (rejectedFiles && rejectedFiles.length > 0) {
        rejectedFiles.forEach(rejectedFile => {
            rejectedFile.errors.forEach((err: any) => {
                if (err.code === "file-too-large") {
                    currentError += `الملف "${rejectedFile.file.name}" كبير جدًا (الحد الأقصى ${MAX_FILE_SIZE_MB} ميجابايت). `;
                } else if (err.code === "file-invalid-type") {
                    currentError += `نوع الملف "${rejectedFile.file.name}" غير مدعوم. `;
                } else {
                    currentError += `خطأ في الملف "${rejectedFile.file.name}": ${err.message}. `;
                }
            });
        });
    }
    
    if (acceptedFiles.length > 0) {
      onFilesUploaded(acceptedFiles);
    } else if (rejectedFiles.length > 0 && acceptedFiles.length === 0) {
      // Only set error if no files were accepted
       if (currentError) setError(currentError.trim());
       else setError(`لم يتم قبول أي ملفات. يرجى التحقق من نوع الملف وحجمه.`);
       return;
    }
     if (currentError) setError(currentError.trim());

  }, [onFilesUploaded, MAX_FILE_SIZE_MB]); // Added MAX_FILE_SIZE_MB as it's used in error message construction from onDrop scope. setError is stable.

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_MIME_TYPES,
    minSize: 1, // 1 byte
    maxSize: MAX_FILE_SIZE_BYTES,
  } as any);

  const removeFile = useCallback((fileName: string) => {
    const newFiles = uploadedFiles.filter(file => file.name !== fileName);
    onFilesUploaded(newFiles);
     // The local error state (setError) is used here.
     // The logic to set/clear error based on file count should ideally
     // consider the state *after* `onFilesUploaded` has propagated.
     // For now, keeping existing logic but wrapped in useCallback.
     if (newFiles.length < MIN_FILES_REQUIRED) {
        // setError(`يرجى تحميل ${MIN_FILES_REQUIRED} ملف (ملفات) على الأقل للمتابعة.`); // This was commented out
     } else {
        setError(null); // Clear error if condition met
     }
  }, [onFilesUploaded, uploadedFiles, setError, MIN_FILES_REQUIRED]); // onFilesUploaded & uploadedFiles are props. setError is local state setter (stable). MIN_FILES_REQUIRED is constant.
  
  const acceptedFileTypesString = Object.values(SUPPORTED_MIME_TYPES).flat().join(', ');


  return (
    <div className="w-full p-6 bg-slate-800 rounded-xl shadow-xl border border-panel-border backdrop-blur-xs bg-panel" data-testid="file-upload">
      <h3 className="text-2xl font-semibold mb-4 text-primary-light flex items-center">
        <UploadIcon className="w-7 h-7 me-2" /> تحميل النصوص والمستندات والصور
      </h3>
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-primary bg-slate-700' : 'border-slate-600 hover:border-primary-dark'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <UploadIcon className="w-12 h-12 text-slate-400 mb-3" />
          {isDragActive ? (
            <p className="text-lg text-primary-light">أفلت الملفات هنا ...</p>
          ) : (
            <p className="text-lg text-slate-300">اسحب وأفلت الملفات هنا، أو انقر لتحديد الملفات</p>
          )}
          <p className="text-sm text-slate-400 mt-1">
            (الأنواع المدعومة: {acceptedFileTypesString}. {MIN_FILES_REQUIRED} ملف كحد أدنى، {MAX_FILE_SIZE_MB} ميجابايت كحد أقصى لكل ملف)
          </p>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-slate-200 mb-2">الملفات المرفوعة ({uploadedFiles.length}):</h4>
          <ul className="space-y-2 max-h-60 overflow-y-auto ps-2">
            {uploadedFiles.map((file) => (
              <li
                key={file.name + '-' + file.size} // Added size to key for more uniqueness if names collide
                className="flex items-center justify-between p-3 bg-slate-700 rounded-md shadow"
              > 
                <div className="flex items-center overflow-hidden">
                  <DocumentTextIcon className="w-5 h-5 text-primary-light me-3 flex-shrink-0" />
                  <span className="text-sm text-slate-100 truncate" title={file.name}>{file.name}</span>
                  <span className="ms-2 text-xs text-slate-400 flex-shrink-0">({(file.size / 1024).toFixed(2)} كيلوبايت)</span>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="ms-4 text-red-400 hover:text-red-300 text-xs font-semibold p-1 rounded hover:bg-slate-600"
                  aria-label={`إزالة ${file.name}`}
                >
                  إزالة
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
       {uploadedFiles.length > 0 && uploadedFiles.length < MIN_FILES_REQUIRED && (
        <p className="mt-3 text-sm text-yellow-400">
          يرجى تحميل {MIN_FILES_REQUIRED} ملف(ات) على الأقل للمتابعة.
        </p>
      )}
    </div>
  );
};
