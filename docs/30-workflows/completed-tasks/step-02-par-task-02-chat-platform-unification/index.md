# TASK-SKILL-LIFECYCLE-02: 会話基盤・セッション統合

## 概要

通常チャット、Workspace 文脈付きチャット、Skill 作成/改善チャットを、共通セッション・ストリーミング・履歴基盤上に統合する設計タスク。

## メタ情報

| 項目         | 内容                    |
| ------------ | ----------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-02 |
| タスク種別   | 設計                    |
| 優先度       | 高                      |
| ステータス   | in_progress             |
| 依存タスク   | TASK-SKILL-LIFECYCLE-01 |
| ブロック対象 | TASK-SKILL-LIFECYCLE-03 |

## 受入基準

| ID   | 基準                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| AC-1 | 通常会話 / Workspace 会話 / Skill 作成会話を共通基盤上のモード差分で表現できる |
| AC-2 | ストリーミング、履歴、途中停止、再開、文脈注入の共通契約が定義されている       |
| AC-3 | 現行 chatSlice と useStreamingChat の役割整理が完了している                    |
| AC-4 | Workspace 文脈注入と会話永続化の整合が取れている                               |
| AC-5 | Task03 が会話基盤を利用できる API/状態契約が定義されている                     |

## 現ブランチ差分との関係

- 現在の `HEAD` 差分は Task01 の一次導線基盤が中心で、`App.tsx` `SkillCenterView` `skillLifecycleJourney.ts` までは追加済み。
- `chatSlice` / `useStreamingChat` / `WorkspaceView` をまたぐ共通セッション化、履歴永続化、mode adapter 統合は未着手であり、本タスクで新規に設計・実装する。
- したがって本タスクは「Task01 既存基盤を前提にした新規設計」であり、Phase 1 冒頭で P50 判定と現行差分監査を必須とする。

## aiworkflow-requirements 抽出起点

1. `indexes/resource-map.md` の「会話基盤統合 / チャットプラットフォーム統合」を確認する
2. `indexes/quick-reference.md` の Task02 向け検索語と読む順番に従う
3. `references/interfaces-llm.md` `llm-streaming.md` `interfaces-chat-history.md` `llm-workspace-chat-edit.md` を基盤仕様として読む
4. `references/arch-state-management.md` `ui-ux-feature-components.md` `ui-ux-navigation.md` で Renderer 側責務境界を補完する
5. 実装アンカーとして `ChatView` `chatSlice` `useStreamingChat` `WorkspaceView` `skillLifecycleJourney.ts` を照合する

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed   |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed   |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed   |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed   |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed   |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed   |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed   |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed   |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed   |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed   |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed   |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed   |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## スコープ

**含む**:

- 共通チャットドメインモデル
- ストリーミングと履歴永続化の整理
- Workspace 文脈注入と通常チャットのモード整理

**含まない**:

- Skill Creator の具体 UI 導線
- スキル実行/改善の orchestration 詳細

## 実装アンカー

- `apps/desktop/src/renderer/views/ChatView/index.tsx`
- `apps/desktop/src/renderer/store/slices/chatSlice.ts`
- `apps/desktop/src/renderer/hooks/useStreamingChat.ts`
- `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`
- `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`
- `docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/spec-extraction-map.md`
