import { useRef } from "react";
import type { FileUploadTriggerProps } from "../types";

export const FileUploadTrigger = ({
  onFilesSelect,
  accept,
  multiple = true,
  disabled = false,
  children,
}: FileUploadTriggerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
      <div onClick={handleClick} role="button" tabIndex={disabled ? -1 : 0}>
        {children}
      </div>
    </>
  );
};
