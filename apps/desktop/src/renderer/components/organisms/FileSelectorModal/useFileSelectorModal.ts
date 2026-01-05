/**
 * useFileSelectorModal フック
 *
 * FileSelectorModalの開閉状態とファイル選択状態を管理するカスタムフック。
 *
 * @see docs/30-workflows/file-selector-integration/step01-design.md
 */

import { useState, useCallback } from "react";
import type { SelectedFile } from "@repo/shared/types";
import { useSelectedFiles, useClearFiles } from "../../../store";

// =============================================================================
// Types
// =============================================================================

export interface UseFileSelectorModalReturn {
  /** モーダルの開閉状態 */
  isOpen: boolean;

  /** モーダルを開く */
  openModal: () => void;

  /** モーダルを閉じる */
  closeModal: () => void;

  /** 選択されたファイル */
  selectedFiles: SelectedFile[];

  /** ファイル選択の有無 */
  hasSelectedFiles: boolean;

  /** ファイル選択を確定して返す */
  confirmSelection: () => SelectedFile[];

  /** 選択をリセット */
  resetSelection: () => void;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * FileSelectorModalの状態管理フック
 *
 * @example
 * ```tsx
 * const {
 *   isOpen,
 *   openModal,
 *   closeModal,
 *   selectedFiles,
 *   confirmSelection,
 * } = useFileSelectorModal();
 *
 * const handleConfirm = () => {
 *   const files = confirmSelection();
 *   console.log('Selected files:', files);
 * };
 *
 * return (
 *   <>
 *     <button onClick={openModal}>ファイルを選択</button>
 *     <FileSelectorModal
 *       open={isOpen}
 *       onClose={closeModal}
 *       onConfirm={handleConfirm}
 *     />
 *   </>
 * );
 * ```
 */
export function useFileSelectorModal(): UseFileSelectorModalReturn {
  const [isOpen, setIsOpen] = useState(false);

  // 既存のファイル選択ストアから取得
  const selectedFiles = useSelectedFiles();
  const clearFiles = useClearFiles();

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirmSelection = useCallback(() => {
    const files = [...selectedFiles];
    setIsOpen(false);
    return files;
  }, [selectedFiles]);

  const resetSelection = useCallback(() => {
    clearFiles();
  }, [clearFiles]);

  const hasSelectedFiles = selectedFiles.length > 0;

  return {
    isOpen,
    openModal,
    closeModal,
    selectedFiles,
    hasSelectedFiles,
    confirmSelection,
    resetSelection,
  };
}
