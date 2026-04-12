# Phase 2 成果物: 変更対象ファイル一覧

## タスク情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |
| 作成日   | 2026-04-11                                            |

## 変更対象ファイル

### 1. SKILL.md（docs修正）

| 項目     | 詳細                                                                     |
| -------- | ------------------------------------------------------------------------ |
| パス     | `.claude/skills/task-specification-creator/SKILL.md`                     |
| 変更種別 | 修正（テキスト追記）                                                     |
| 変更箇所 | 「Phase 12 重要仕様」→「よくある漏れ」テーブルの [Feedback FB-03] 行直後 |
| 変更概要 | SmartDefault AC-4 フィールド独立推論性セクションを新規追加               |
| 影響範囲 | task-specification-creator スキルを参照する全タスク実行者                |

**追記箇所の特定**:

- SKILL.md の「よくある漏れ」テーブル（Line 297付近）
- `[Feedback FB-03]` エントリの後に新しい行として追加

### 2. phase-template-execution.md（テンプレート修正）

| 項目     | 詳細                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| パス     | `.claude/skills/task-specification-creator/references/phase-template-execution.md` |
| 変更種別 | 修正（セクション追加）                                                             |
| 変更箇所 | Phase 4（テスト作成）テンプレートのテスト設計ガイドラインセクション                |
| 変更概要 | 「フィールド間独立性」専用ノートを追加                                             |
| 影響範囲 | SmartDefault関連タスクのPhase 4 テスト設計時                                       |

### 3. smartDefaultReasoningService.test.ts（テスト追加）

| 項目     | 詳細                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| パス     | `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` |
| 変更種別 | 修正（テストケース追加）                                                                   |
| 変更箇所 | 既存の describe("inferSmartDefaults") ブロック内に新規 describe を追加                     |
| 変更概要 | TC-FB03-01〜09 の9件のテストケースを新規 describe ブロックとして追加                       |
| 影響範囲 | SmartDefault推論テストの品質保証                                                           |

## 変更なしファイル

| ファイル                          | 理由                                |
| --------------------------------- | ----------------------------------- |
| `smartDefaultReasoningService.ts` | docs-onlyタスクのためコード変更なし |
| その他UIコンポーネント            | 変更スコープ外                      |

## mirror parity 対象

SKILL.md 更新後は以下のmirrorも同期が必要:

- `.agents/skills/task-specification-creator/SKILL.md`
- `.agents/skills/task-specification-creator/references/phase-template-execution.md`
