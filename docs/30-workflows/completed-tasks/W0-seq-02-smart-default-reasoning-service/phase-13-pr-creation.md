# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 13                                             |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 12                                       |
| 後続Phase  | -                                              |
| 作成日     | 2026-04-07                                     |
| ステータス | pending                                        |

## 目的

提出準備を完了し、ユーザー承認後のみ PR 作成へ進む。

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

| 観点             | 確認内容                                                                            |
| ---------------- | ----------------------------------------------------------------------------------- |
| 機能要件         | AC-1〜AC-4 の全受け入れ基準が充足されていること                                     |
| 型安全性         | W0-seq-01 型定義との整合・`any` 型未使用                                            |
| テストカバレッジ | 全推論ルール分岐・フォールバックパス・inferenceLog・組み合わせテストが90%以上カバー |
| barrel 整合      | `packages/shared/` からのインポートパスが解決できること                             |
| 後続タスク       | W2-seq-03a が `inferSmartDefaults` をインポートして利用できること                   |

## 承認条件

**ユーザーの明示承認がある場合のみ PR 作成へ進む。**

承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する。

## PR タイトル案

```
feat(skill-wizard): スマートデフォルト推論サービス実装（W0-seq-02）
```

## PR 本文テンプレート

```markdown
## 概要

スキルウィザードのスマートデフォルト推論サービスを `packages/shared/` に独立実装。
ユーザー入力（スキル名を含むフォーム入力。主に目的・カテゴリを使用）から推奨設定を自動提案する `inferSmartDefaults` 関数を追加。

closes #1998

## 変更内容

- `smartDefaultReasoningService.ts` を新規作成
  - ツール推論: purpose テキストから slack/github/notion を推論（先勝ちルール）
  - タイミング推論: 定期実行キーワード → scheduled、リアルタイムキーワード → realtime
  - フォーマット推論: category から code/structured を推論
  - フォールバック: 推論不能フィールドは null・inferenceLog は空配列 []
- ユニットテストを追加（全 AC-1〜AC-4 をカバー）
- barrel へのエクスポートを追加

## 依存タスク

- W0-seq-01（型定義）: 完了済み（SmartDefaultResult / SkillInfoFormData）

## 後続タスク

- W2-seq-03a（SkillCreateWizard 更新）: 本サービスをインポートして利用可能

## テスト

- `pnpm --filter @repo/shared test` で全テスト Green
- カバレッジ: `smartDefaultReasoningService.ts` 90% 以上
- 全推論ルール（slack/github/notion/scheduled/realtime/code/structured）をテスト
- フォールバック（null/undefined/空文字入力）をテスト
```

## 参照資料

| 資料名                   | パス                                                     | 用途            |
| ------------------------ | -------------------------------------------------------- | --------------- |
| API 設計                 | `outputs/phase-2/api-design.md`                          | Phase 2 成果物  |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`              | Phase 5 成果物  |
| 回帰テスト結果           | `outputs/phase-6/regression-test-result.md`              | Phase 6 成果物  |
| 網羅率レポート           | `outputs/phase-7/traceability-coverage-report.md`        | Phase 7 成果物  |
| 責務境界マップ           | `outputs/phase-8/responsibility-boundary-map.md`         | Phase 8 成果物  |
| 品質レポート             | `outputs/phase-9/quality-report.md`                      | Phase 9 成果物  |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物 |

## 実行手順

1. Phase 12 成果物を確認する。
2. 差分要約とレビュー観点を整理する。
3. 承認条件チェックでユーザー明示承認の有無を確認する。
4. 承認がない場合は `outputs/phase-13/pr-preparation.md` のみ作成して終了する。
5. 承認がある場合は `gh pr create` で PR を作成する。

## 成果物

| 成果物           | パス                                     | 説明                                 |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| PR 準備メモ      | `outputs/phase-13/pr-preparation.md`     | 提出準備情報                         |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | 後続タスク（W2-seq-03a）への引き継ぎ |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認                     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] PR 準備メモが作成されていること
- [ ] 引き継ぎサマリーに W2-seq-03a への引き継ぎ情報が記載されていること
- [ ] 承認チェックが記録されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 差分要約の整理
3. 承認条件チェック
4. PR 作成（承認時のみ）
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## PR 作成制約

- ユーザーの明示承認がある場合だけ PR 作成へ進む。
- 明示承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する。

## 次のPhase

Phase -:（W2-seq-03a へ引き継ぎ）
