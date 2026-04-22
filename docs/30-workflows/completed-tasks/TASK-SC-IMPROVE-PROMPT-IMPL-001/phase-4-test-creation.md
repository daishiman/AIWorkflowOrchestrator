# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | pending                         |
| 作成日     | 2026-04-21                      |

## 目的

`runImprovePromptWorkflow()` 用の targeted test を設計し、正常系、異常系、回帰ケースを TDD Red 前提で固定する。

## 実行タスク

### Task 1: 前提確認

- 依存関係整合を確認する
- 既存テスト命名規則と private method テスト方針を確認する

### Task 2: テストケース定義

- 正常系: LLM あり
- 正常系: LLM なし fallback
- 異常系: file read/write failure
- 異常系: abort
- 回帰: 他モードに影響しないこと

### Task 3: 実行コマンド固定

- targeted run コマンド
- 既存回帰テストコマンド

## 参照資料

- [Phase 1: 要件定義](phase-1-requirements.md)
- [Phase 2: 設計](phase-2-design.md)
- [Phase 3: 設計レビュー](phase-3-design-review.md)

## 実行手順

1. 前提条件を確認する
2. テストケースを列挙する
3. 実行順と期待結果を定義する

## 統合テスト連携

Phase 4 では unit test で自動観測できる項目を固定し、Phase 11 の manual test へはアプリ経由でしか見えない部分だけを残す。

## 成果物

- `outputs/phase-4/test-case-matrix.md`
- `outputs/phase-4/red-test-commands.md`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.improve-prompt.test.ts`

## 完了条件

- [ ] 正常系、異常系、回帰ケースが整理されていること
- [ ] targeted run コマンドが固定されていること
- [ ] 新規テストファイル名と命名規則が整合していること
- [ ] Phase 5 に渡す期待結果が明確であること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-4/` に出力されていること
- [ ] Phase 5 の Green 条件が固定されていること

## 次 Phase

[Phase 5: 実装](phase-5-implementation.md) へ進む。
