interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
}

interface Window {
  showDirectoryPicker(options?: { mode?: "read" | "readwrite" }): Promise<FileSystemDirectoryHandle>;
}
