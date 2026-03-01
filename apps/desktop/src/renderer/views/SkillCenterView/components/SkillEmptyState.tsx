/**
 * SkillEmptyState Component
 *
 * ツール一覧が空の場合の表示コンポーネント。
 * - variant="no-skills": ツール未追加時
 * - variant="no-results": 検索結果0件時
 *
 * @module SkillCenterView/components/SkillEmptyState
 */

import React, { memo } from "react";
import { EmptyState } from "../../../components/atoms/EmptyState";
import { Button } from "../../../components/atoms/Button";

export interface SkillEmptyStateProps {
  /** 表示バリアント */
  variant: "no-skills" | "no-results";
  /** 検索キーワード（no-results 時に使用） */
  keyword?: string;
  /** フィルタクリアハンドラ */
  onClearFilter?: () => void;
}

/**
 * ツール一覧の空状態表示コンポーネント。
 */
export const SkillEmptyState: React.FC<SkillEmptyStateProps> = memo(
  ({ variant, keyword, onClearFilter }) => {
    if (variant === "no-results") {
      return (
        <EmptyState
          title={
            keyword
              ? `「${keyword}」に一致するツールが見つかりませんでした`
              : "一致するツールが見つかりませんでした"
          }
          description="検索条件を変更してお試しください"
          icon="search"
          mood="encouraging"
          action={
            onClearFilter ? (
              <Button
                variant="secondary"
                onClick={onClearFilter}
                data-testid="clear-filter-button"
              >
                フィルタをクリア
              </Button>
            ) : undefined
          }
        />
      );
    }

    // variant === "no-skills"
    return (
      <EmptyState
        title="ツールがまだありません"
        description="ツールを追加して、AIワークフローを強化しましょう"
        icon="sparkles"
        mood="welcoming"
      />
    );
  },
);

SkillEmptyState.displayName = "SkillEmptyState";
