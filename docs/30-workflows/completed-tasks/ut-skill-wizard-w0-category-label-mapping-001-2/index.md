# UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001: skill-wizard-category-display-label-mapping

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                            |
| タスク名     | skill-wizard-category-display-label-mapping                              |
| 種別         | unassigned-task / improvement                                            |
| 優先度       | medium                                                                   |
| スケール     | small                                                                    |
| 依存タスク   | UT-SKILL-WIZARD-W0-seq-01                                                |
| 発見元       | Phase 12（W0-seq-01-types-skill-info-form unassigned-task-detection）    |
| GitHub Issue | [#2001](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2001) |
| 作成日       | 2026-04-11                                                               |
| ステータス   | pending                                                                  |

## 概要

スキルウィザードの `SkillCategory`（英語識別子）をUI表示用の日本語ラベルにマッピングする定数・関数を実装する。
カテゴリ選択ドロップダウン等でユーザーフレンドリーな日本語ラベルを表示するために必要。

## 背景

W0-seq-01 では `SkillCategory`（`"automation"` | `"external-integration"` | `"data-analysis"` | `"code-support"` | `"other"`）が型定義されたが、
UI表示用の日本語ラベルのマッピングが未実装。現状では `"automation"` 等の英語識別子がそのままUI上に表示される状態。

## 対象ファイル

| ファイル                                                          | 操作 | 説明                                                         |
| ----------------------------------------------------------------- | ---- | ------------------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                       | 追加 | `SKILL_CATEGORY_LABELS` 定数・`getSkillCategoryLabel()` 関数 |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | 追加 | マッピングユニットテスト                                     |

## SkillCategoryマッピング定義

| SkillCategory          | 日本語ラベル   |
| ---------------------- | -------------- |
| `automation`           | 自動化         |
| `external-integration` | 外部連携       |
| `data-analysis`        | データ分析     |
| `code-support`         | コードサポート |
| `other`                | その他         |

## スコープ

### 含む

- `SkillCategory` → 日本語ラベルのマッピング定義（`SKILL_CATEGORY_LABELS` 定数）
- マッピング関数 `getSkillCategoryLabel()` の実装
- マッピングのユニットテスト（全カテゴリのラベルが定義されているか）

### 含まない

- UIコンポーネント自体の実装（後続コンポーネントタスク）
- `SkillCategory` 型定義の変更

## 受入基準

| ID   | 受入基準                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-1 | 全 `SkillCategory` 値（5件）に対応する日本語ラベルが定義されている                                                                                     |
| AC-2 | `SKILL_CATEGORY_LABELS` 定数と `getSkillCategoryLabel()` 関数が `@repo/shared/types/skillCreator` 経由でエクスポートされ、UIコンポーネントから参照可能 |
| AC-3 | 新しい `SkillCategory` 値が追加された場合にTypeScriptの型チェックでラベル未定義を検出できる（`Record<SkillCategory, string>` 型を活用）                |

## Phaseリスト

| Phase | 名前         | 概要                                                                   |
| ----- | ------------ | ---------------------------------------------------------------------- |
| 1     | 要件定義     | SkillCategory型・既存コード確認・AC固定                                |
| 2     | 設計         | 定数/関数のインターフェース設計                                        |
| 3     | 設計レビュー | 設計の矛盾・漏れチェック                                               |
| 4     | テスト作成   | TDD Red段階テスト定義（全5カテゴリ）                                   |
| 5     | 実装         | SKILL_CATEGORY_LABELS + getSkillCategoryLabel実装                      |
| 6     | テスト拡充   | エッジケース・型安全性テスト追加                                       |
| 7     | カバレッジ   | カバレッジ計測・未到達分析                                             |
| 8     | リファクタ   | コード品質改善                                                         |
| 9     | 品質保証     | 静的解析・リスク評価                                                   |
| 10    | 最終レビュー | Phase 1-9 の成果物統合レビュー                                         |
| 11    | 手動テスト   | ビルド確認・型チェック・エクスポート確認                               |
| 12    | ドキュメント | 実装ガイド・仕様更新・更新履歴・未タスク・フィードバック・準拠チェック |
| 13    | PR作成       | blocked / 承認待ち（本タスクでは実行しない）                           |

## 関連

- 依存元仕様書: `docs/30-workflows/completed-tasks/W0-seq-01-types-skill-info-form/index.md`
- 発見元タスク: W0-seq-01-types-skill-info-form
