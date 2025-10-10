import { FileItem } from "./file-item";
import type { FileListProps } from "../types";

export function FileList({
  files,
  onRemove,
  onMarkForDeletion,
  onRestore,
  onClick,
}: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 items-center p-2">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onRemove={onRemove ? () => onRemove(file.id) : undefined}
          onMarkForDeletion={
            onMarkForDeletion ? () => onMarkForDeletion(file.id) : undefined
          }
          onRestore={onRestore ? () => onRestore(file.id) : undefined}
          onClick={onClick ? () => onClick(file) : undefined}
        />
      ))}
    </div>
  );
}
