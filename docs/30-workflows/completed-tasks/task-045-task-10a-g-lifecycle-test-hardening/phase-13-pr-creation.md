# Phase 13: PR作成 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 13 - PR作成                         |
| 機能名     | task-10a-g-lifecycle-test-hardening |
| タスクID   | TASK-10A-G                          |
| 作成日     | 2026-03-10                          |
| 前Phase    | Phase 12 - ドキュメント             |
| ステータス | pending                             |

## 目的

成果物の最終確認と PR 準備を行う。PR 作成そのものはユーザーの明示許可がある場合のみ実施し、本仕様では許可前提の確認項目とテンプレートを定義する。

## 実行タスク

- Task 1: 成果物の最終確認を行う
- Task 2: 品質ゲートの最終確認を行う
- Task 3: 受け入れ基準の充足を確認する
- Task 4: PR本文テンプレートと事前確認項目を整備する
- Task 5: `artifacts.json` と Phase 13 の実行境界を確認する

### Task 1: 成果物最終確認

全 Phase の成果物が生成されていることを確認する。

#### テストコード成果物

| #   | 成果物                           | パス                                                                                       | SubAgent | 種別 |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------ | -------- | ---- |
| A-1 | Main IPC skill:create 契約テスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | G1       | 新規 |
| A-2 | Renderer統合テスト               | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | G2       | 新規 |
| A-3 | ChatPanel既存テスト整合          | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | G3       | 修正 |

#### ドキュメント成果物

| #   | 成果物               | パス                                            | Phase    |
| --- | -------------------- | ----------------------------------------------- | -------- |
| D-1 | 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Phase 12 |
| D-2 | 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Phase 12 |
| D-3 | ドキュメント変更記録 | `outputs/phase-12/documentation-changelog.md`   | Phase 12 |
| D-4 | 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | Phase 12 |
| D-5 | スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | Phase 12 |

#### 成果物存在チェック

- [ ] A-1: skillHandlers.create.test.ts が作成されている
- [ ] A-2: SkillLifecycle.integration.test.tsx が作成されている
- [ ] A-3: ChatPanel.skill-management.test.tsx が修正されている
- [ ] D-1: implementation-guide.md が作成されている
- [ ] D-2: spec-update-summary.md が作成されている
- [ ] D-3: documentation-changelog.md が作成されている
- [ ] D-4: unassigned-task-detection.md が作成されている
- [ ] D-5: skill-feedback-report.md が作成されている

### Task 2: 品質ゲート最終確認

全品質基準を満たしていることを確認する。

| #     | 品質ゲート              | 実行コマンド                                                                                                     | 基準               |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------ |
| QG-1  | TypeScript型チェック    | `pnpm --filter @repo/desktop typecheck`                                                                          | PASS               |
| QG-2  | ESLint                  | `pnpm --filter @repo/desktop lint`                                                                               | PASS               |
| QG-3  | G1テスト（14ケース）    | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | 全PASS             |
| QG-4  | G2テスト（12ケース）    | `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 全PASS             |
| QG-5  | G3テスト（5ケース追加） | `cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | 全PASS             |
| QG-6  | 全体回帰テスト          | `cd apps/desktop && pnpm vitest run`                                                                             | 既存テスト回帰ゼロ |
| QG-7  | Line Coverage           | カバレッジレポート                                                                                               | 80%以上            |
| QG-8  | Branch Coverage         | カバレッジレポート                                                                                               | 60%以上            |
| QG-9  | Function Coverage       | カバレッジレポート                                                                                               | 80%以上            |
| QG-10 | テスト合計ケース数      | G1(14) + G2(12) + G3(5)                                                                                          | 31ケース           |

#### 品質ゲートチェック

- [ ] QG-1: TypeScript型チェック PASS
- [ ] QG-2: ESLint PASS
- [ ] QG-3: G1テスト 14ケース全PASS
- [ ] QG-4: G2テスト 12ケース全PASS
- [ ] QG-5: G3テスト 5ケース追加分含め全PASS
- [ ] QG-6: 既存テスト回帰ゼロ
- [ ] QG-7: Line Coverage 80%以上
- [ ] QG-8: Branch Coverage 60%以上
- [ ] QG-9: Function Coverage 80%以上
- [ ] QG-10: テスト合計52ケース確認

### Task 3: 受け入れ基準の充足確認

Phase 1 で定義した受け入れ基準（AC-1〜AC-8）が全て満たされていることを確認する。

| AC   | 基準                                                                                    | 充足状況 | 検証方法                           |
| ---- | --------------------------------------------------------------------------------------- | -------- | ---------------------------------- |
| AC-1 | `skill:create` の入力バリデーションテストが P42準拠3段バリデーションを検証する          | -        | G1テストコードに3パターン確認      |
| AC-2 | `skill:create` の正常系テストが `skillService.createSkillFromWizard` への委譲を検証する | -        | G1テストのモック呼び出し引数確認   |
| AC-3 | `skill:create` のエラー系テストが `sanitizeErrorMessage` 経由のエラー返却を検証する     | -        | G1テストのエラーコード確認         |
| AC-4 | ChatPanel起点で create -> list 遷移が統合テストで検証される                             | -        | G2テストのStore状態遷移確認        |
| AC-5 | ChatPanel起点で list -> analyze 遷移が統合テストで検証される                            | -        | G2テストのコンポーネント表示確認   |
| AC-6 | ChatPanel起点で analyze -> improve 遷移が統合テストで検証される                         | -        | G2テストのライフサイクル全遷移確認 |
| AC-7 | 既存テストとの整合性が確認され、回帰がゼロである                                        | -        | QG-6の結果                         |
| AC-8 | テストカバレッジが Line 80%以上、Branch 60%以上を達成する                               | -        | QG-7〜QG-9の結果                   |

### Task 4: PR準備

#### ブランチ情報

| 項目           | 値                                                           |
| -------------- | ------------------------------------------------------------ |
| ブランチ名     | `feature/task-10a-g-lifecycle-test-hardening`                |
| ベースブランチ | `main`                                                       |
| PRタイトル     | `test(skill): TASK-10A-G スキルライフサイクル統合テスト強化` |

#### PR本文テンプレート

```markdown
## Summary

- Main IPC `skill:create` ハンドラの契約テスト（14ケース）を追加
- ChatPanel起点のスキルライフサイクル遷移統合テスト（12ケース）を追加
- 既存 ChatPanel テストとの整合性確認・ゲート統合テスト（5ケース）を追加

## Test Plan

### 自動テスト

- G1: `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts`（14ケース）
- G2: `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`（12ケース）
- G3: `cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`（5ケース追加）
- 全体回帰: `cd apps/desktop && pnpm vitest run`（回帰ゼロ確認済み）

### 品質ゲート

- TypeScript型チェック: PASS
- ESLint: PASS
- カバレッジ: Line ≥80%, Branch ≥60%, Function ≥80%

### 関連タスク

- TASK-10A-E: SkillManagementPanel利用可能スキル表示・インポート統合
- TASK-10A-F: スキルライフサイクルUIのStore駆動統合
```

#### PR準備チェック

- [ ] ブランチ名が規約に従っている（`feature/` プレフィックス）
- [ ] PRタイトルが70文字以内である
- [ ] PR本文に Summary + Test Plan が含まれている
- [ ] コミットメッセージが Conventional Commits 形式である

> **注意**: 本タスクでは実装・コミット・PR作成自体は行わない。ユーザーが明示的に許可するまでは PR準備（テンプレート作成とローカル確認項目整理）のみ実施する。

### Task 5: artifacts.json と実行境界の確認

Phase 13 は外部副作用を伴うため、**ユーザーの明示許可がある場合のみ** コミット/PR作成/最終ステータス更新を実施する。

- [ ] `artifacts.json` の Phase 1〜12 が妥当な状態で同期されている
- [ ] ユーザー許可がない場合、Phase 13 は準備状態のまま扱い、コミット/PR/外部更新を実行していない
- [ ] ユーザー許可がある場合のみ、Phase 13 の完了処理と最終ステータス更新を行う

## 成果物

| 成果物               | パス                                  | 説明                                     |
| -------------------- | ------------------------------------- | ---------------------------------------- |
| PR本文テンプレート   | `outputs/phase-13/pr-body.md`         | Summary/Test Plan/関連タスクの雛形       |
| 最終確認チェック記録 | `outputs/phase-13/final-checklist.md` | Task 1〜5 の実施記録                     |
| 台帳同期メモ         | `outputs/phase-13/artifacts-sync.md`  | `artifacts.json` と Phase 12成果物の突合 |

## 統合テスト連携

| #    | 確認項目                                                         | 確認方法                  | 期待結果                              |
| ---- | ---------------------------------------------------------------- | ------------------------- | ------------------------------------- |
| FC-1 | G1/G2/G3 の3層構造が受け入れ基準 AC-1〜AC-8 を網羅している       | AC テーブルとの突合       | 全 AC が1つ以上のテストケースでカバー |
| FC-2 | Phase 11 手動テスト結果レポートが作成済み                        | ファイル存在確認          | レポート存在                          |
| FC-3 | Phase 12 ドキュメント成果物が全て作成済み                        | ファイル存在確認          | D-1〜D-5 全て存在                     |
| FC-4 | ユーザー許可なしにコミット・PR・外部更新を行っていないことの確認 | git status / 実行ログ確認 | Phase 13 内で副作用なし               |

## 多角的チェック観点

| 観点               | 確認内容                                                               | 状態 |
| ------------------ | ---------------------------------------------------------------------- | ---- |
| 機能的正当性       | 31テストケースが AC-1〜AC-8 を網羅                                     | -    |
| 非機能的品質       | カバレッジ基準（Line≥80%, Branch≥60%, Function≥80%）                   | -    |
| 回帰安全性         | 既存テスト全PASS、テスト間依存なし                                     | -    |
| ドキュメント完全性 | 実装ガイド・仕様更新サマリー・変更記録・未タスク・フィードバックが存在 | -    |
| プロセス遵守       | Phase 1-12 完了 + Phase 13 はユーザー制御前提で準備されている          | -    |

## 参照資料

| 参照資料                     | パス                                                                   | 使用目的                 |
| ---------------------------- | ---------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件定義             | `phase-1-requirements.md`                                              | 受け入れ基準の充足確認   |
| Phase 10 最終レビュー        | `phase-10-final-review.md`                                             | レビュー結果の最終確認   |
| Phase 11 手動テスト          | `phase-11-manual-test.md`                                              | 手動テスト結果の参照     |
| Phase 12 ドキュメント        | `phase-12-documentation.md`                                            | ドキュメント成果物の確認 |
| Phase 2 設計検証             | `outputs/phase-2/design-verification.md`                               | PR本文の設計要約確認     |
| Phase 5 Green レポート       | `outputs/phase-5/g1-g2-g3-green-report.md`                             | 実装完了の根拠           |
| Phase 6 カバレッジレポート   | `outputs/phase-6/coverage-report.md`                                   | 補強テスト内容の根拠     |
| Phase 7 最終カバレッジ       | `outputs/phase-7/coverage-final-report.md`                             | coverage 要約            |
| Phase 8 refactoring レポート | `outputs/phase-8/refactoring-report.md`                                | 変更点の整理             |
| Phase 9 品質検証レポート     | `outputs/phase-9/quality-verification-report.md`                       | quality gate の根拠      |
| タスク運用台帳               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了判定基準             |
| 教訓                         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | PR前最終確認の再発防止   |

## 完了条件

- [ ] Task 1: 全成果物（A-1〜A-3, D-1〜D-5）が生成されている
- [ ] Task 2: 品質ゲート全項目（QG-1〜QG-10）PASS
- [ ] Task 3: 受け入れ基準（AC-1〜AC-8）全て充足
- [ ] Task 4: PR準備が完了している（コミット・PR作成自体は行わない）
- [ ] Task 5: artifacts.json と Phase 13 の実行境界が確認されている
- [ ] 本タスクでは実装・コミット・PR を行わないことが確認されている
- [ ] 本 Phase 内の全タスク（Task 1〜Task 5）を100%実行完了
