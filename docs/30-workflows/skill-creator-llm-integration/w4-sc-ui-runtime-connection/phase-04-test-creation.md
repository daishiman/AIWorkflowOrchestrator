# Phase 4: テスト作成

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 4                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

DescribeStep の自然言語入力テスト、handleCreate→planSkill 呼び出しテスト、TerminalHandoff 表示テスト、既存フロー非破壊テスト（AC-7）を作成する。

## 実行タスク

1. テストファイル作成（TDD: テストファースト）
   - `apps/desktop/src/renderer/components/skill/__tests__/DescribeStep.test.tsx`
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm.test.tsx`
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm.test.tsx`
2. DescribeStep テストケース
   - U-1: 「何を自動化したいですか？」テキストエリアがレンダリングされる
   - U-2: 自然言語入力後に「LLM で生成」ボタンをクリックすると handleCreate が呼ばれる
   - U-3: テキストエリアが空の場合は「LLM で生成」ボタンが無効化される
3. SkillCreateWizard/SkillLifecyclePanel テストケース
   - U-4: handleCreate → planSkill が呼ばれる（window.electronAPI.skillCreator.planSkill のモック確認）
   - U-5: planSkill 成功後に GenerateStep に遷移する
   - U-6: TerminalHandoff 中は isGenerating=true で UI がロック状態になる
   - U-7: planSkill エラー時に generationError が設定されエラー UI が表示される
4. 既存フロー非破壊テスト（AC-7）
   - U-8: 「テンプレートから作成」を選択した場合は skill:create が呼ばれる（LLM は呼ばれない）
5. テスト環境の確認
   - happy-dom 環境では `fireEvent` を使用（P39対策）
   - 既存テストファイルのインポートパスを参照してから記述（P63対策）

## 参照資料

- Phase 2 設計書（フロー設計、Zustand 状態設計）
- Phase 3 設計レビュー報告書
- `apps/desktop/src/renderer/components/skill/__tests__/` 配下の既存テスト
- `.claude/rules/06-known-pitfalls.md`（P39: happy-dom、P63: インポートパス）
- `.claude/rules/02-code-quality.md`（TDD 原則）

## 成果物

- `DescribeStep.test.tsx`（U-1〜U-3）
- `SkillCreateWizard.llm.test.tsx`（U-4〜U-7）
- `SkillLifecyclePanel.llm.test.tsx`（U-8）

## 完了条件

- [ ] U-1（テキストエリアのレンダリング）テストを実装した
- [ ] U-2（LLM 生成ボタンクリック）テストを実装した
- [ ] U-3（空入力ボタン無効化）テストを実装した
- [ ] U-4（planSkill 呼び出し確認）テストを実装した
- [ ] U-5（GenerateStep 遷移）テストを実装した
- [ ] U-6（TerminalHandoff ローディング表示）テストを実装した
- [ ] U-7（planSkill エラー UI）テストを実装した
- [ ] U-8（既存フロー非破壊）テストを実装した（AC-7）
- [ ] `fireEvent` を使用した（P39対策）
- [ ] インポートパスを既存テストから確認して記述した（P63対策）
- [ ] テストが Red 状態であることを確認した

## 次のPhase

Phase 5: 実装
