/**
 * SkillDetailPanel Component
 *
 * スキル詳細パネル。
 * - デスクトップ: 右スライドイン（450px, 250ms）
 * - モバイル: ボトムシート（85vh, 300ms）
 * - 権限バッジ表示
 * - 削除ゾーン
 *
 * @module SkillCenterView/components/SkillDetailPanel/SkillDetailPanel
 */

import React, { memo, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillSubResource,
} from "@repo/shared/types/skill";
import { Icon } from "../../../../components/atoms/Icon";
import { Button } from "../../../../components/atoms/Button";
import { Badge } from "../../../../components/atoms/Badge";

/** 権限ラベルとカラーのマッピング（P47 対策: モジュールスコープ export） */
export const PERMISSION_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  Bash: {
    label: "コマンドを実行",
    color: "bg-[var(--status-warning-subtle)]",
  },
  Read: {
    label: "ファイルを読む",
    color: "bg-[var(--status-info-subtle)]",
  },
  Write: {
    label: "ファイルに書き込む",
    color: "bg-[var(--status-warning-subtle)]",
  },
  Edit: {
    label: "ファイルを編集する",
    color: "bg-[var(--status-warning-subtle)]",
  },
  WebSearch: {
    label: "ウェブを検索する",
    color: "bg-[var(--status-info-subtle)]",
  },
  WebFetch: {
    label: "ウェブから情報を取得",
    color: "bg-[var(--status-info-subtle)]",
  },
};

export interface SkillDetailPanelProps {
  /** 表示中のスキル名 */
  skillName: string | null;
  /** パネル開閉状態 */
  isOpen: boolean;
  /** 閉じるハンドラ */
  onClose: () => void;
  /** 削除リクエストハンドラ */
  onDelete: (skillName: string) => void;
  /** インポート済みフラグ */
  isImported: boolean;
  /** スキルデータ */
  skill?: SkillMetadata | ImportedSkill;
  /** 編集ボタンクリック時のハンドラ（インポート済みスキルのみ有効） */
  onEdit?: (skillName: string) => void;
  /** 分析ボタンクリック時のハンドラ（インポート済みスキルのみ有効） */
  onAnalyze?: (skillName: string) => void;
}

/** パネルスタイル定義 */
export const panelStyles = {
  overlay: clsx(
    "fixed inset-0 z-40",
    "bg-black/20 backdrop-blur-sm",
    "transition-opacity duration-250 ease-out",
  ),
  panel: {
    desktop: clsx(
      "fixed top-0 right-0 z-50 h-full w-[450px]",
      "bg-[var(--bg-primary)] border-l border-[var(--border-primary)]",
      "shadow-2xl overflow-y-auto",
      "transition-transform duration-250 ease-out",
    ),
    mobile: clsx(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-[var(--bg-primary)] border-t border-[var(--border-primary)]",
      "rounded-t-2xl shadow-2xl overflow-y-auto",
      "max-h-[85vh]",
      "transition-transform duration-300 ease-out",
    ),
  },
  header: clsx(
    "sticky top-0 z-10",
    "flex items-center justify-between p-4",
    "bg-[var(--bg-primary)] border-b border-[var(--border-primary)]",
  ),
  body: "p-6 space-y-6",
  section: "space-y-3",
  sectionTitle: "text-sm font-semibold text-[var(--text-primary)]",
  dangerZone: clsx(
    "mt-8 p-4 rounded-xl",
    "border border-[var(--status-error)]/20",
    "bg-[var(--status-error)]/5",
  ),
  dangerTitle: "text-sm font-semibold text-[var(--status-error)] mb-2",
  dangerDescription: "text-xs text-[var(--text-secondary)] mb-3",
} as const;

/**
 * サブリソース一覧を表示するセクション。
 */
const ResourceList: React.FC<{
  title: string;
  resources: SkillSubResource[];
}> = memo(({ title, resources }) => {
  if (resources.length === 0) return null;

  return (
    <div className={panelStyles.section} data-testid={`resource-${title}`}>
      <h4 className={panelStyles.sectionTitle}>{title}</h4>
      <ul className="space-y-1">
        {resources.map((res) => (
          <li
            key={res.relativePath}
            className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
          >
            <Icon name="file-text" size={14} />
            <span className="truncate" title={res.relativePath}>
              {res.filename}
            </span>
            {res.description && (
              <span className="text-[var(--text-muted)] truncate">
                - {res.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});

ResourceList.displayName = "ResourceList";

function safeSubResources(value: unknown): SkillSubResource[] {
  return Array.isArray(value) ? value : [];
}

function safeOtherFiles(
  value: unknown,
): Array<{ filename: string; size: number; type: string }> {
  return Array.isArray(value) ? value : [];
}

/**
 * スキル詳細パネルコンポーネント。
 */
export const SkillDetailPanel: React.FC<SkillDetailPanelProps> = memo(
  ({
    skillName,
    isOpen,
    onClose,
    onDelete,
    isImported,
    skill,
    onEdit,
    onAnalyze,
  }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    // Escape キーでパネルを閉じる
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // パネル外クリックでパネルを閉じる
    const handleOverlayClick = useCallback(
      (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      },
      [onClose],
    );

    const handleDeleteClick = useCallback(() => {
      if (skillName) {
        onDelete(skillName);
      }
    }, [skillName, onDelete]);

    if (!isOpen || !skillName || !skill) return null;

    const displayName = String(skill.name);
    const allowedTools = skill.allowedTools ?? [];

    return (
      <>
        {/* オーバーレイ */}
        <div
          className={panelStyles.overlay}
          onClick={handleOverlayClick}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          role="presentation"
          data-testid="detail-overlay"
        />

        {/* パネル（デスクトップ） */}
        <div
          ref={panelRef}
          className={clsx(
            panelStyles.panel.desktop,
            "hidden md:block",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-label={`${displayName} の詳細`}
          data-testid="skill-detail-panel"
        >
          <PanelContent
            skill={skill}
            displayName={displayName}
            skillName={skillName}
            allowedTools={allowedTools}
            isImported={isImported}
            onClose={onClose}
            onDelete={handleDeleteClick}
            onEdit={onEdit}
            onAnalyze={onAnalyze}
          />
        </div>

        {/* パネル（モバイル） */}
        <div
          className={clsx(
            panelStyles.panel.mobile,
            "md:hidden",
            isOpen ? "translate-y-0" : "translate-y-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-label={`${displayName} の詳細`}
          data-testid="skill-detail-panel-mobile"
        >
          {/* ドラッグハンドル */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--border-primary)]" />
          </div>
          <PanelContent
            skill={skill}
            displayName={displayName}
            skillName={skillName}
            allowedTools={allowedTools}
            isImported={isImported}
            onClose={onClose}
            onDelete={handleDeleteClick}
            onEdit={onEdit}
            onAnalyze={onAnalyze}
          />
        </div>
      </>
    );
  },
);

SkillDetailPanel.displayName = "SkillDetailPanel";

// --- 内部コンポーネント ---

interface PanelContentProps {
  skill: SkillMetadata | ImportedSkill;
  displayName: string;
  skillName: string;
  allowedTools: string[];
  isImported: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit?: (skillName: string) => void;
  onAnalyze?: (skillName: string) => void;
}

const PanelContent: React.FC<PanelContentProps> = memo(
  ({
    skill,
    displayName,
    skillName,
    allowedTools,
    isImported,
    onClose,
    onDelete,
    onEdit,
    onAnalyze,
  }) => {
    const description = String(skill.description ?? "");
    const agents = safeSubResources(skill.agents);
    const references = safeSubResources(skill.references);
    const indexes = safeSubResources(skill.indexes);
    const scripts = safeSubResources(
      isSkillMetadata(skill) ? skill.scripts : undefined,
    );
    const otherFiles = safeOtherFiles(skill.otherFiles);

    return (
      <>
        {/* ヘッダー */}
        <div className={panelStyles.header}>
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                "bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
              )}
            >
              <span className="text-lg font-bold" aria-hidden="true">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {displayName}
              </h2>
              {isImported && (
                <Badge variant="success" size="sm">
                  追加済み
                </Badge>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              "p-2 rounded-lg",
              "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              "hover:bg-[var(--bg-secondary)]",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
            )}
            aria-label="パネルを閉じる"
            data-testid="close-detail-button"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* ボディ */}
        <div className={panelStyles.body}>
          {/* 説明 */}
          <div className={panelStyles.section}>
            <h3 className={panelStyles.sectionTitle}>説明</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {description}
            </p>
          </div>

          {/* 権限バッジ */}
          {allowedTools.length > 0 && (
            <div
              className={panelStyles.section}
              data-testid="permissions-section"
            >
              <h3 className={panelStyles.sectionTitle}>使用する権限</h3>
              <div className="flex flex-wrap gap-2">
                {allowedTools.map((tool) => {
                  const permission = PERMISSION_LABELS[tool];
                  return (
                    <span
                      key={tool}
                      className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                        "text-xs font-medium",
                        permission
                          ? permission.color
                          : "bg-[var(--bg-tertiary)]",
                        "text-[var(--text-primary)]",
                      )}
                      data-testid={`permission-badge-${tool}`}
                    >
                      <Icon name="shield" size={12} />
                      {permission ? permission.label : tool}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* サブリソース一覧 */}
          <ResourceList title="エージェント" resources={agents} />
          <ResourceList title="リファレンス" resources={references} />
          <ResourceList title="インデックス" resources={indexes} />

          {/* スクリプト */}
          {isSkillMetadata(skill) && (
            <ResourceList title="スクリプト" resources={scripts} />
          )}

          {/* その他のファイル */}
          {otherFiles.length > 0 && (
            <div
              className={panelStyles.section}
              data-testid="other-files-section"
            >
              <h3 className={panelStyles.sectionTitle}>その他のファイル</h3>
              <ul className="space-y-1">
                {otherFiles.map((file) => (
                  <li
                    key={file.filename}
                    className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                  >
                    <Icon name="file" size={14} />
                    <span>{file.filename}</span>
                    <span className="text-[var(--text-muted)]">
                      ({formatFileSize(file.size)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* アクションボタンゾーン（インポート済みスキルのみ） */}
          {isImported && onEdit && onAnalyze && (
            <div className="flex gap-3" data-testid="action-buttons-zone">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => skillName && onEdit(skillName)}
                leftIcon="pencil"
                data-testid="edit-skill-button"
                className="flex-1"
              >
                エディタで開く
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => skillName && onAnalyze(skillName)}
                leftIcon="eye"
                data-testid="analyze-skill-button"
                className="flex-1"
              >
                分析する
              </Button>
            </div>
          )}

          {/* 削除ゾーン（インポート済みの場合のみ） */}
          {isImported && (
            <div className={panelStyles.dangerZone} data-testid="danger-zone">
              <h3 className={panelStyles.dangerTitle}>危険な操作</h3>
              <p className={panelStyles.dangerDescription}>
                このツールを削除すると、関連するすべての設定が失われます。
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={onDelete}
                leftIcon="trash-2"
                data-testid="delete-skill-button"
              >
                ツールを削除
              </Button>
            </div>
          )}
        </div>
      </>
    );
  },
);

PanelContent.displayName = "PanelContent";

/**
 * スキルが SkillMetadata であるかを判定するタイプガード。
 */
function isSkillMetadata(
  skill: SkillMetadata | ImportedSkill,
): skill is SkillMetadata {
  return "scripts" in skill;
}

/**
 * ファイルサイズを人間が読める形式に変換する。
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
