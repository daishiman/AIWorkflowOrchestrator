import { StateCreator } from "zustand";
import type { FileNode } from "../types";

export interface EditorSlice {
  // State
  selectedFile: FileNode | null;
  fileTree: FileNode[];
  expandedFolders: Set<string>;
  editorContent: string;
  hasUnsavedChanges: boolean;
  pendingOpenFilePath: string | null;

  // Actions
  setSelectedFile: (file: FileNode | null) => void;
  setFileTree: (tree: FileNode[]) => void;
  toggleFolder: (folderId: string) => void;
  setExpandedFolders: (folders: Set<string>) => void;
  setEditorContent: (content: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  markAsSaved: () => void;
  requestOpenFile: (filePath: string) => void;
  clearPendingOpenFile: () => void;
}

export const createEditorSlice: StateCreator<
  EditorSlice,
  [],
  [],
  EditorSlice
> = (set, _get) => ({
  // Initial state
  selectedFile: null,
  fileTree: [],
  expandedFolders: new Set<string>(),
  editorContent: "",
  hasUnsavedChanges: false,
  pendingOpenFilePath: null,

  // Actions
  setSelectedFile: (file) => {
    set({
      selectedFile: file,
      editorContent: "",
      hasUnsavedChanges: false,
    });
  },

  setFileTree: (tree) => {
    set({ fileTree: tree });
  },

  toggleFolder: (folderId) => {
    set((state) => {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return { expandedFolders: newExpanded };
    });
  },

  setExpandedFolders: (folders) => {
    set({ expandedFolders: folders });
  },

  setEditorContent: (content) => {
    set({
      editorContent: content,
      hasUnsavedChanges: true,
    });
  },

  setHasUnsavedChanges: (hasChanges) => {
    set({ hasUnsavedChanges: hasChanges });
  },

  markAsSaved: () => {
    set({ hasUnsavedChanges: false });
  },

  requestOpenFile: (filePath) => {
    set({ pendingOpenFilePath: filePath });
  },

  clearPendingOpenFile: () => {
    set({ pendingOpenFilePath: null });
  },
});
