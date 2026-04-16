# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 12                   |
| Phase名    | ドキュメント更新     |
| 対象機能   | TASK-SW-STRUCT-001   |
| 前提Phase  | Phase 11: 手動テスト |
| 次Phase    | Phase 13: PR作成     |
| ステータス | 未実施               |
| 作成日     | 2026-04-15           |

## 目的

本タスクの実装内容を中学生レベルの概念説明と技術者向けの実装ガイドとして記録する。
system spec への反映と未タスクの検出を行い、後続の TASK-SW-STRUCT-002 への引き継ぎ情報を整備する。

## 実行タスク

### Task 1: 中学生レベルの概念説明

**何を直したか（誰でもわかる説明）**:

このタスクでは、スキル作成アプリの「作成モード」で動く部品（`runCreateWorkflow`）が
間違った情報を返していた問題を直しました。

具体的には、「スキルの目的（purpose）」という欄に、本来入るべき「スキルの説明文」ではなく、
AIへの長い命令文（プロンプト）が入っていました。これは「名前欄に住所を書く」のと同じような間違いです。

修正後は:

- 「スキルの目的」欄 → スキルの説明文（`options.description`）が入る
- 「使うエージェント」欄 → エージェントの名前リスト（`["extract-purpose", "plan-structure"]`）が入る

この修正により、次のタスク（TASK-SW-STRUCT-002）でスキル設計書（SKILL.md）を正しく生成できるようになります。

### Task 2: 技術者向け実装ガイド

**修正ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**修正箇所**: `runCreateWorkflow` メソッド（行 630-653）

**変更内容**:

- `purpose` フィールド: `extractPurposeAgent`（プロンプト文字列）→ `options.description`
- `agents` フィールド: `[extractPurposeAgent, planStructureAgent]`（プロンプト文字列）→ `["extract-purpose", "plan-structure"]`（エージェント名リスト）
- `loadAgent` 呼び出し: 削除（戻り値が不要になったため）

**後続タスクへの引き継ぎ**:

- TASK-SW-STRUCT-002 は本タスク完了後に着手できる
- TASK-SW-STRUCT-002 では `void structurePlan`（行 126）を削除し、`structurePlan` を `generate_skill_md.js` に渡す接続を行う

### Task 3: system spec 反映確認

本タスクの変更は `SkillCreatorService` 内部メソッドの修正であり、
外部仕様（IPC 契約・API）に変更はない。system spec への反映は最小限。

### Task 4: 未タスク検出

本タスクの実施中に判明した未タスク候補:

| 未タスクID | 内容                                        | 優先度 |
| ---------- | ------------------------------------------- | ------ |
| FUTURE-001 | LLM によるスキル目的（purpose）の実際の抽出 | Medium |
| FUTURE-002 | LLM による機能リスト（features）の自動生成  | Medium |

これらは LLM 統合タスクとして別途実施する。

## 参照資料

- `outputs/phase-11/manual-test-result.md` — 手動テスト結果
- `outputs/phase-10/final-review-result.md` — 最終レビュー結果

## 統合テスト連携

- 本フェーズはドキュメント作成のみ。統合テストの変更は不要。

## 成果物

| 成果物                        | パス                                             |
| ----------------------------- | ------------------------------------------------ |
| implementation-guide.md       | `outputs/phase-12/implementation-guide.md`       |
| system-spec-update-summary.md | `outputs/phase-12/system-spec-update-summary.md` |
| documentation-changelog.md    | `outputs/phase-12/documentation-changelog.md`    |
| unassigned-task-detection.md  | `outputs/phase-12/unassigned-task-detection.md`  |

## 完了条件

- [ ] 中学生レベルの概念説明が記述されている
- [ ] 技術者向け実装ガイドが完成している
- [ ] system spec 反映確認が完了している
- [ ] 未タスク検出が記録されている
- [ ] TASK-SW-STRUCT-002 への引き継ぎ情報が整備されている

## タスク100%実行確認【必須】

- [ ] Task 1（中学生レベルの概念説明）を100%実行した
- [ ] Task 2（技術者向け実装ガイド）を100%実行した
- [ ] Task 3（system spec 反映確認）を100%実行した
- [ ] Task 4（未タスク検出）を100%実行した
- [ ] 全成果物が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
