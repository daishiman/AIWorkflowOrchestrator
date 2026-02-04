# TASK-FIX-1-1-TYPE-ALIGNMENT: スキル型定義の統一（仕様書準拠）

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-1-1-TYPE-ALIGNMENT        |
| タスク名     | スキル型定義の統一（仕様書準拠）   |
| 分類         | リファクタリング                   |
| 対象機能     | スキル管理・実行機能全体           |
| 優先度       | 高                                 |
| 見積もり規模 | 中規模                             |
| ステータス   | 未実施                             |
| 発見元       | 無限ループ問題調査（Phase 12相当） |
| 発見日       | 2026-02-03                         |
| 関連Phase    | Phase 1（TASK-1-1の前提修正）      |
| 作成日       | 2026-02-04                         |

---

## 1. 背景と目的

### 1.1 問題の概要

無限ループ問題の調査中に、スキル関連の型定義が複数箇所で重複・矛盾していることが発見された。

**発見された型定義の矛盾**:

| 型名                    | 定義箇所                    | 内容                                                                                      |
| ----------------------- | --------------------------- | ----------------------------------------------------------------------------------------- |
| `SkillStreamMessage`    | `skill.ts` L354-463         | `"assistant" \| "tool_use" \| "tool_result" \| "status" \| "error"` (Discriminated Union) |
| `SkillStreamMessage`    | `skill-execution.ts` L63-82 | `"text" \| "tool_use" \| "error" \| "complete"` (Interface)                               |
| `SkillExecutionRequest` | `skill.ts` L307-319         | `skillName`, `prompt`, `workingDirectory`                                                 |
| `SkillExecutionRequest` | `skill-execution.ts` L20-31 | `prompt`, `skillId`, `skillName`, `timeout`, `sessionId`                                  |

### 1.2 目的

仕様書（`specification.md §4-5`）に準拠した単一の型定義体系を確立する。

### 1.3 達成目標

1. `@repo/shared/src/types/skill.ts` に全スキル型を集約
2. `SkillStreamMessage` の定義を単一化
3. 重複型定義ファイル（`skill-execution.ts`）の削除または統合
4. 呼び出し元の import 文修正

---

## 2. スコープ

### 2.1 含むもの

- `Skill`, `ImportedSkill`, `SkillMetadata` の整理
- `SkillStreamMessage` の定義統一
- `SkillExecutionRequest`, `SkillExecutionResponse` の整理
- `skill-execution.ts` の型を `skill.ts` へ統合
- 呼び出し元の型参照（import）修正

### 2.2 含まないもの

- 新しい型の追加（それは TASK-1-1 で実施）
- ビジネスロジックの変更
- UI/UX の変更
- 新機能の追加

---

## 3. 技術詳細

### 3.1 正となる型定義（仕様書 §5.1 準拠）

`@repo/shared/src/types/skill.ts` を正とする。

**SkillStreamMessage（正）**:

```typescript
export type SkillStreamMessageType =
  | "assistant"
  | "tool_use"
  | "tool_result"
  | "status"
  | "error";

export type SkillStreamMessage = /* Discriminated Union */
```

### 3.2 削除対象

| ファイル                                       | 対応                                 |
| ---------------------------------------------- | ------------------------------------ |
| `packages/shared/src/types/skill-execution.ts` | 必要な型を `skill.ts` へ移行後、削除 |

### 3.3 影響範囲

- `packages/shared/src/types/` - 型定義
- `apps/desktop/src/main/services/skill/` - スキル実行サービス
- `apps/desktop/src/renderer/` - UI コンポーネント
- `apps/desktop/src/main/ipc/` - IPC ハンドラー

---

## 4. Phase 構成

| Phase | 名称               | 説明                              |
| ----- | ------------------ | --------------------------------- |
| 1     | 要件定義           | 型統一の要件を明確化              |
| 2     | 設計               | 型統合方針を設計                  |
| 3     | 設計レビューゲート | 設計の妥当性検証                  |
| 4     | テスト作成         | 型チェック・既存テスト確認（Red） |
| 5     | 実装               | 型統合・import 修正（Green）      |
| 6     | テスト拡充         | 型安全性テスト追加                |
| 7     | カバレッジ確認     | テストカバレッジ検証              |
| 8     | リファクタリング   | コード整理                        |
| 9     | 品質保証           | 型チェック・Lint 確認             |
| 10    | 最終レビューゲート | 全体品質検証                      |
| 11    | 手動テスト検証     | 実環境での動作確認                |
| 12    | ドキュメント更新   | 実装ガイド・仕様書更新            |
| 13    | PR作成             | Pull Request 作成                 |

---

## 5. 成果物一覧

| Phase | 成果物             | パス                                            |
| ----- | ------------------ | ----------------------------------------------- |
| 1     | 要件定義書         | `outputs/phase-1/requirements-definition.md`    |
| 2     | 型統合設計書       | `outputs/phase-2/type-integration-design.md`    |
| 3     | 設計レビュー結果   | `outputs/phase-3/design-review-result.md`       |
| 4     | 型チェック仕様     | `outputs/phase-4/type-check-specification.md`   |
| 5     | 統合済み型定義     | `packages/shared/src/types/skill.ts`            |
| 6     | 型安全性テスト     | `packages/shared/src/types/__tests__/*.test.ts` |
| 7     | カバレッジレポート | `outputs/phase-7/coverage-report.md`            |
| 9     | 品質レポート       | `outputs/phase-9/quality-report.md`             |
| 10    | 最終レビュー結果   | `outputs/phase-10/final-review-result.md`       |
| 11    | 手動テスト結果     | `outputs/phase-11/manual-test-result.md`        |
| 12    | 実装ガイド         | `outputs/phase-12/implementation-guide.md`      |
| 13    | PR 情報            | `outputs/phase-13/pr-info.md`                   |

---

## 6. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                                           |
| -------------------- | ------ | -------- | ---------------------------------------------- |
| 型の互換性破壊       | 高     | 中       | 段階的に移行、テストで検証                     |
| import 漏れ          | 中     | 中       | grep で全使用箇所を特定、TypeScript エラー検出 |
| 既存テストの破壊     | 中     | 低       | 型変更後にテスト実行で早期検出                 |
| ランタイムエラー発生 | 高     | 低       | 型ガードの追加、実行時検証                     |

---

## 7. 参照情報

### 7.1 仕様書

- `docs/30-workflows/skill-import-agent-system/specification.md` §4-5（型定義）
- `docs/30-workflows/skill-import-agent-system/tasks/task-fix-1-1-type-alignment.md`（元タスク指示書）

### 7.2 型定義ファイル

- `packages/shared/src/types/skill.ts`（正）
- `packages/shared/src/types/skill-execution.ts`（統合対象）

### 7.3 aiworkflow-requirements 参照

| 観点           | 仕様ファイル                              |
| -------------- | ----------------------------------------- |
| アーキテクチャ | `architecture-implementation-patterns.md` |
| 型設計         | `interfaces-agent-sdk-skill.md`           |
| IPC 通信       | `api-ipc-agent.md`                        |
| テスト戦略     | `quality-requirements.md`                 |

---

## 8. Phase 仕様書

各 Phase の詳細仕様は `phases/` ディレクトリを参照:

- [Phase 1: 要件定義](phases/phase-01.md)
- [Phase 2: 設計](phases/phase-02.md)
- [Phase 3: 設計レビューゲート](phases/phase-03.md)
- [Phase 4: テスト作成](phases/phase-04.md)
- [Phase 5: 実装](phases/phase-05.md)
- [Phase 6: テスト拡充](phases/phase-06.md)
- [Phase 7: テストカバレッジ確認](phases/phase-07.md)
- [Phase 8: リファクタリング](phases/phase-08.md)
- [Phase 9: 品質保証](phases/phase-09.md)
- [Phase 10: 最終レビューゲート](phases/phase-10.md)
- [Phase 11: 手動テスト検証](phases/phase-11.md)
- [Phase 12: ドキュメント更新](phases/phase-12.md)
- [Phase 13: PR作成](phases/phase-13.md)
