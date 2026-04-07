# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 11                        |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

NON_VISUAL タスク（Main Process 内部変更のみ、UI変更なし）として、自動テスト結果を代替証跡とし、手動テスト結果を記録する。

> **[Feedback BEFORE-QUIT-001]**: 本タスクは NON_VISUAL タスクのため、実地 UI 操作は不要。自動テスト結果 + 既知制限リストを代替証跡として記録する。
> **[Feedback 4]**: `manual-test-result.md` のメタ情報に「証跡の主ソース（自動テスト名/件数）」と「スクリーンショットを作らない理由」を必ず明記する。

## 実行タスク

- NON_VISUAL 宣言: UI変更なしを明記し、スクリーンショット不要の理由を記録
- 自動テスト代替証跡の記録: 自動テスト実行結果を証跡として記録
- 発見課題の記録: スコープ外の発見事項・改善提案（0件でも出力必須）

## 参照資料

| 資料名            | パス                                                                                              | 説明             |
| ----------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 10 レビュー | `outputs/phase-10/final-review.md`                                                                | 最終レビュー結果 |
| テストファイル    | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | 自動テスト証跡元 |

## 実行手順

### ステップ1: NON_VISUAL 宣言

本タスクの種別を確認し、手動テスト方針を確定する：

| 分類項目           | 内容                                                        |
| ------------------ | ----------------------------------------------------------- |
| タスク種別         | NON_VISUAL（Main Process 内部変更のみ）                     |
| UI 変更            | なし                                                        |
| スクリーンショット | 不要（IPC/UI変更なし）                                      |
| 証跡の主ソース     | 自動テスト（Vitest）T-01〜T-06 + TC-T4-01〜TC-T4-04 + TC-08 |

**スクリーンショットを作らない理由**:

- 本タスクは `RuntimeSkillCreatorFacade.executeAsync()` の内部リファクタリングのみ
- Renderer/UI コンポーネントへの変更はゼロ
- IPC チャンネルの追加・変更なし

### ステップ2: 自動テスト実行（代替証跡）

```bash
# 自動テスト実行（NON_VISUAL の代替証跡として）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts

# 全体影響確認（フォーカステスト）
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

### ステップ3: 手動テスト結果の記録

`outputs/phase-11/manual-test-result.md` に以下を記録する：

| テスト種別          | 証跡                                             | 件数                                    | 結果     |
| ------------------- | ------------------------------------------------ | --------------------------------------- | -------- |
| 自動テスト (Vitest) | `RuntimeSkillCreatorFacade.executeAsync.test.ts` | T-01〜T-06 + TC-T4-01〜TC-T4-04 + TC-08 | （実測） |
| 型チェック          | `pnpm typecheck`                                 | -                                       | （記録） |
| Lint                | `pnpm lint`                                      | -                                       | （記録） |

**メタ情報（必須）**:

- 証跡の主ソース: 自動テスト（Vitest）
- 件数: T-01〜T-06（既存6件）+ TC-T4-01〜TC-T4-04（新規4件）+ TC-08（smoke test）= 計11件
- TC-09 は it.todo で別管理
- スクリーンショットを作らない理由: NON_VISUAL タスク（UI変更なし）

### ステップ4: 発見課題の記録（0件でも出力必須）

`outputs/phase-11/discovered-issues.md` を作成する（0件の場合も「0件」と明記する）。

確認ソース：

- Phase 3/10 のレビューで MINOR 判定された事項
- コードレビュー中に発見したスコープ外の改善点

## テストカテゴリ

| カテゴリ           | テスト項目                                           | 実行結果 |
| ------------------ | ---------------------------------------------------- | -------- |
| 機能テスト（自動） | T-01〜T-06: executeAsync()の既存振る舞い（回帰確認） | （記録） |
| 機能テスト（自動） | TC-T4-01〜TC-T4-04: executeAsync() の回帰確認        | （記録） |
| 機能テスト（自動） | TC-08: unknown variant の public seam smoke test     | （記録） |
| 型レベルテスト     | 仮バリアント追加時のコンパイルエラー（手動確認済み） | （記録） |
| 回帰テスト         | IPC 変更なし・Renderer 影響なし                      | N/A      |

## 成果物

| 成果物             | パス                                     | 必須 | 説明                                     |
| ------------------ | ---------------------------------------- | ---- | ---------------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | 必須 | NON_VISUAL宣言・自動テスト代替証跡       |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md`  | 必須 | 発見した課題（0件でも出力必須）          |
| スクリーンショット | `outputs/phase-11/screenshots/`          | 不要 | NON_VISUALのため不要（ディレクトリ不要） |

## 完了条件

- [ ] NON_VISUAL 宣言が `manual-test-result.md` に記録されている
- [ ] 証跡の主ソース（自動テスト名・件数）が `manual-test-result.md` に明記されている
- [ ] スクリーンショットを作らない理由が明記されている
- [ ] 自動テスト（T-01〜T-06 + TC-T4-01〜TC-T4-04 + TC-08）の実行結果が記録されている
- [ ] 発見課題一覧（`discovered-issues.md`）が作成されている（0件でも出力必須）
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

本タスクは NON_VISUAL（Main Process 内部変更のみ）であり、IPC/Renderer への変更はない。統合テスト連携の確認は自動テスト（Vitest）代替証跡で行う。

| 確認項目          | 確認内容                                        | 判定 |
| ----------------- | ----------------------------------------------- | ---- |
| 自動テスト全 PASS | T-01〜T-06 + TC-T4-01〜TC-T4-04 + TC-08 全 PASS | ✅   |
| IPC 変更なし      | `RuntimeSkillCreatorFacade.ts` 内部変更のみ     | ✅   |
| Renderer 影響なし | UI コンポーネントへの変更ゼロ                   | ✅   |

## 次のPhase

Phase 12: ドキュメント更新

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 11
```
