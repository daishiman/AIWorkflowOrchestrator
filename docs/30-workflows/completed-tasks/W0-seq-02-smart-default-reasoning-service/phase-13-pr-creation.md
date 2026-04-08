# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 13                                             |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 12                                       |
| 後続Phase  | -                                              |
| 作成日     | 2026-04-08                                     |
| ステータス | blocked                                        |

## 目的

提出準備を完了し、ユーザー承認後のみ PR 作成へ進む。

> **重要**: PR 作成はユーザーの明示的な承認後のみ実施する。承認なしは blocked 状態を維持する。

## 実行タスク

1. Phase 12 成果物と変更ファイルを突き合わせる。
2. PR 作成可否を承認条件で判定する。
3. 承認なしなら preparation のみ出力する。

## 統合テスト連携

- Phase 10 の最終レビューと Phase 11 の manual-test-result を前提にする。
- Phase 12 の完了条件が PASS するまで PR 作成には進まない。
- user 承認がない限り blocked を維持する。

## PR 提出差分サマリー

### 変更ファイル

| ファイル                                                                                   | 変更種別 | 概要                                           |
| ------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------- |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`                | 新規     | 推論サービス本体                               |
| `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 新規     | ユニットテスト（全推論ルール・フォールバック） |
| `packages/shared/src/services/skillCreator/index.ts`                                       | 変更     | サービス barrel に `inferSmartDefaults` 追加   |
| `packages/shared/index.ts`                                                                 | 変更     | `@repo/shared` root からの再 export 追加       |

### 変更概要

1. `inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult` 関数を新規実装
2. ツール推論（slack/github/notion）・タイミング推論（scheduled/realtime）・フォーマット推論（code/structured）を実装
3. フォールバック挙動を実装（推論不能フィールドは `null`・inferenceLog は空配列 `[]`）
4. `packages/shared/` の barrel にエクスポートを追加し、W2-seq-03a 等からインポート可能にした
5. ユニットテスト（全受け入れ基準 AC-1〜AC-4 をカバー）を追加

### レビュー観点

| 観点             | 確認内容                                                                           |
| ---------------- | ---------------------------------------------------------------------------------- |
| 機能要件         | AC-1〜AC-4 の全受け入れ基準が充足されていること                                    |
| 型安全性         | W0-seq-01 型定義との整合・`any` 型未使用                                           |
| テストカバレッジ | 全推論ルール分岐・フォールバックパス・inferenceLog・組み合わせテストが 90%+ カバー |
| barrel 整合      | `packages/shared/` からのインポートパスが解決できること                            |
| 後続タスク       | W2-seq-03a が `inferSmartDefaults` をインポートして利用できること                  |

## 承認条件

| 条件                                                | 確認状況              |
| --------------------------------------------------- | --------------------- |
| Phase 12 の canonical 6 成果物が全て揃っていること  | [ ]                   |
| `pnpm lint` がエラーなし                            | [ ]                   |
| `pnpm --filter @repo/shared test:run` が全件 PASS   | [ ]                   |
| `pnpm --filter @repo/shared typecheck` がエラーなし | [ ]                   |
| ユーザーの明示的な PR 作成承認                      | [ ] 未承認（blocked） |

## PR テンプレート

```markdown
## 概要

`inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult` 推論サービスを実装した。

関連 Issue: #2003

## 変更内容

- 推論サービス本体（`smartDefaultReasoningService.ts`）の新規実装
- ツール推論・タイミング推論・フォーマット推論・フォールバック処理
- `inferenceLog` による推論根拠の記録
- `@repo/shared` からの barrel export 追加

## テスト

- ユニットテスト: TC-01〜TC-20 全件 PASS
- typecheck: エラーなし
- lint: エラーなし
- coverage: Line 90%+, Branch 80%+, Function 100%
```

## 参照資料

| 資料名                     | パス                                                     | 用途            |
| -------------------------- | -------------------------------------------------------- | --------------- |
| Phase12 準拠チェック       | `outputs/phase-12/phase12-task-spec-compliance-check.md` | PR 提出前確認   |
| リリース準備チェックリスト | `outputs/phase-10/release-readiness-checklist.md`        | Phase 10 成果物 |

## 実行手順

1. Phase 12 の成果物（canonical 6件）が全て揃っていることを確認する。
2. PR 準備サマリーを作成する。
3. ユーザー承認を待つ（承認なしの場合は blocked 維持）。
4. ユーザー承認後: ブランチ・コミット・PR 作成を実施する。

## 成果物

| 成果物             | パス                                     | 説明                   |
| ------------------ | ---------------------------------------- | ---------------------- |
| PR 準備サマリー    | `outputs/phase-13/pr-preparation.md`     | PR 本文・変更サマリー  |
| 引き継ぎサマリー   | `outputs/phase-13/handoff-summary.md`    | 後続タスクへの引き継ぎ |
| 承認チェックリスト | `outputs/phase-13/approval-checklist.md` | PR 作成条件確認        |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] PR 準備サマリーが作成されていること
- [ ] ユーザーの承認待ち状態（blocked）であることが明記されていること
- [ ] 承認後に実施する手順が記録されていること

## タスク100%実行確認【必須】

- [ ] PR作成はユーザー明示承認後のみ実施
- [ ] 承認なしは blocked 状態を維持
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## ステータス

**blocked** - ユーザーの明示的な PR 作成承認を待機中
