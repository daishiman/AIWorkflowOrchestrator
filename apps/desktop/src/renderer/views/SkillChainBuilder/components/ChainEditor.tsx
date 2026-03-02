/**
 * ChainEditor コンポーネント
 *
 * チェーンの編集画面。
 * ステップの追加・削除・並べ替え、変数編集、保存・実行を提供する。
 *
 * @module ChainEditor
 */

import React, { memo, useState, useCallback } from "react";
import clsx from "clsx";
import type {
  SkillChainDefinition,
  SkillChainStep,
  SkillChainResult,
} from "@repo/shared/types/skill-chain";
import { Button } from "../../../components/atoms/Button";
import { Icon } from "../../../components/atoms/Icon";
import { Badge } from "../../../components/atoms/Badge";
import { StepList } from "./StepList";
import { AddStepDialog } from "./AddStepDialog";
import { VariableEditor } from "./VariableEditor";

export interface ChainEditorProps {
  /** 編集中のチェーン */
  chain: SkillChainDefinition;
  /** 保存中フラグ */
  isSaving: boolean;
  /** 実行中フラグ */
  isExecuting: boolean;
  /** 実行結果 */
  executionResult: SkillChainResult | null;
  /** エラーメッセージ */
  error: string | null;
  /** チェーン名更新ハンドラ */
  onUpdateName: (name: string) => void;
  /** チェーン説明更新ハンドラ */
  onUpdateDescription: (description: string) => void;
  /** ステップ追加ハンドラ */
  onAddStep: (step: SkillChainStep) => void;
  /** ステップ削除ハンドラ */
  onRemoveStep: (stepId: string) => void;
  /** ステップ移動ハンドラ */
  onMoveStep: (fromIndex: number, toIndex: number) => void;
  /** 変数更新ハンドラ */
  onUpdateVariable: (key: string, value: unknown) => void;
  /** 変数削除ハンドラ */
  onRemoveVariable: (key: string) => void;
  /** 保存ハンドラ */
  onSave: () => void;
  /** 実行ハンドラ */
  onExecute: () => void;
  /** 戻るハンドラ */
  onBack: () => void;
}

/** ChainEditor のスタイル定義 */
export const chainEditorStyles = {
  container: "flex flex-col h-full",
  header: clsx(
    "flex items-center justify-between px-6 py-4",
    "border-b border-[var(--border-primary)]",
  ),
  backButton: clsx(
    "flex items-center gap-1 text-sm",
    "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    "transition-colors duration-[var(--duration-quick)]",
  ),
  headerActions: "flex items-center gap-2",
  content: "flex-1 overflow-y-auto px-6 py-4",
  section: "mb-6",
  sectionTitle: clsx(
    "text-sm font-semibold text-[var(--text-primary)] mb-3",
    "flex items-center gap-2",
  ),
  nameInput: clsx(
    "w-full px-3 py-2 rounded-lg text-lg font-semibold",
    "bg-transparent border-none",
    "text-[var(--text-primary)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:rounded-lg",
  ),
  descriptionInput: clsx(
    "w-full px-3 py-2 rounded-lg text-sm resize-none",
    "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
    "text-[var(--text-primary)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
  ),
  errorMessage: clsx(
    "p-3 rounded-lg mb-4",
    "bg-red-500/10 border border-red-500/20",
    "text-sm text-[var(--status-error)]",
  ),
  resultContainer: clsx("p-3 rounded-lg mb-4", "border"),
  resultSuccess: "bg-green-500/10 border-green-500/20",
  resultFailure: "bg-red-500/10 border-red-500/20",
  resultText: "text-sm",
} as const;

/**
 * ChainEditor コンポーネント
 */
export const ChainEditor: React.FC<ChainEditorProps> = memo(
  ({
    chain,
    isSaving,
    isExecuting,
    executionResult,
    error,
    onUpdateName,
    onUpdateDescription,
    onAddStep,
    onRemoveStep,
    onMoveStep,
    onUpdateVariable,
    onRemoveVariable,
    onSave,
    onExecute,
    onBack,
  }) => {
    const [isAddStepOpen, setIsAddStepOpen] = useState(false);

    const handleOpenAddStep = useCallback(() => {
      setIsAddStepOpen(true);
    }, []);

    const handleCloseAddStep = useCallback(() => {
      setIsAddStepOpen(false);
    }, []);

    return (
      <div className={chainEditorStyles.container} data-testid="chain-editor">
        {/* ヘッダー */}
        <div className={chainEditorStyles.header}>
          <button
            type="button"
            className={chainEditorStyles.backButton}
            onClick={onBack}
            aria-label="一覧に戻る"
            data-testid="back-to-list"
          >
            <Icon name="arrow-up" size={16} />
            <span>戻る</span>
          </button>

          <div className={chainEditorStyles.headerActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExecute}
              loading={isExecuting}
              disabled={chain.steps.length === 0}
              leftIcon="play"
              data-testid="execute-chain-button"
            >
              実行
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              loading={isSaving}
              data-testid="save-chain-button"
            >
              保存
            </Button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className={chainEditorStyles.content}>
          {/* エラー表示 */}
          {error && (
            <div
              className={chainEditorStyles.errorMessage}
              role="alert"
              data-testid="chain-editor-error"
            >
              {error}
            </div>
          )}

          {/* 実行結果 */}
          {executionResult && (
            <div
              className={clsx(
                chainEditorStyles.resultContainer,
                executionResult.success
                  ? chainEditorStyles.resultSuccess
                  : chainEditorStyles.resultFailure,
              )}
              data-testid="execution-result"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={executionResult.success ? "success" : "error"}
                  size="sm"
                >
                  {executionResult.success ? "成功" : "失敗"}
                </Badge>
                <span className="text-xs text-[var(--text-muted)]">
                  {executionResult.totalDuration}ms
                </span>
              </div>
              <p className={chainEditorStyles.resultText}>
                {executionResult.results.length} ステップ実行完了
              </p>
            </div>
          )}

          {/* チェーン名 */}
          <div className={chainEditorStyles.section}>
            <input
              type="text"
              className={chainEditorStyles.nameInput}
              value={chain.name}
              onChange={(e) => onUpdateName(e.target.value)}
              placeholder="チェーン名"
              aria-label="チェーン名"
              data-testid="chain-name-editor"
            />
            <textarea
              className={chainEditorStyles.descriptionInput}
              value={chain.description}
              onChange={(e) => onUpdateDescription(e.target.value)}
              placeholder="チェーンの説明"
              rows={2}
              aria-label="チェーンの説明"
              data-testid="chain-description-editor"
            />
          </div>

          {/* ステップ一覧 */}
          <div className={chainEditorStyles.section}>
            <div className={chainEditorStyles.sectionTitle}>
              <Icon name="zap" size={16} />
              <span>ステップ</span>
              <Badge variant="default" size="sm" content={chain.steps.length} />
            </div>
            <StepList
              steps={chain.steps}
              onDeleteStep={onRemoveStep}
              onMoveStep={onMoveStep}
            />
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenAddStep}
                leftIcon="plus"
                data-testid="add-step-button"
              >
                ステップを追加
              </Button>
            </div>
          </div>

          {/* 変数エディタ */}
          <div className={chainEditorStyles.section}>
            <div className={chainEditorStyles.sectionTitle}>
              <Icon name="settings" size={16} />
              <span>変数</span>
            </div>
            <VariableEditor
              variables={chain.variables}
              onUpdate={onUpdateVariable}
              onRemove={onRemoveVariable}
            />
          </div>
        </div>

        {/* ステップ追加ダイアログ */}
        <AddStepDialog
          isOpen={isAddStepOpen}
          onClose={handleCloseAddStep}
          onAdd={onAddStep}
        />
      </div>
    );
  },
);

ChainEditor.displayName = "ChainEditor";
