# Vitest alias 設定と shared export 整合の自動検証

## メタ情報

```yaml
issue_number: 836
```

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | task-imp-vitest-alias-sync-automation-001                     |
| タスク名     | Vitest alias 設定と `@repo/shared` エクスポート整合の自動検証 |
| 分類         | 改善                                                          |
| 対象機能     | テスト基盤（Vitest / モノレポモジュール解決）                 |
| 優先度       | 中                                                            |
| 見積もり規模 | 小規模                                                        |
| ステータス   | 未実施                                                        |
| 発見元       | TASK-FIX-10-1-VITEST-ERROR-HANDLING Phase 8（スコープ外項目） |
| 発見日       | 2026-02-19                                                    |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-FIX-10-1 で `apps/desktop/vitest.config.ts` に `@repo/shared` サブパス alias を18件追加し、モジュール解決エラーを解消した。
ただし、alias 追加は手動運用のため、`packages/shared` 側の export 変更時に追従漏れが再発するリスクが残る。

### 問題点・課題

- `packages/shared` の export 変更と `vitest.config.ts` の alias 設定に同期保証がない
- エイリアス漏れはテスト実行時に初めて発覚し、原因切り分けコストが高い
- 既存の仕組みでは「不足 alias の事前検知」ができない

### 放置した場合の影響

| 影響領域     | 影響                                                            |
| ------------ | --------------------------------------------------------------- |
| テスト安定性 | `Failed to resolve entry for package "@repo/shared"` が再発する |
| 開発速度     | テスト失敗時の調査時間が増加する                                |
| 保守性       | alias の追加/削除が都度手作業になり、レビュー観点が増える       |

## 2. 何を達成するか（What）

### 目的

`packages/shared` の公開エントリと `apps/desktop/vitest.config.ts` の alias を比較し、差分をCI/ローカルで機械検出できる状態を作る。

### 最終ゴール

- alias 整合チェック用スクリプトが作成されている
- CIで整合チェックが自動実行される
- 差分発生時に不足/過剰 alias を明確に出力できる

### スコープ

**含むもの**:

- `@repo/shared` export と Vitest alias の比較ロジック実装
- チェック結果のCLI出力（不足一覧/不要一覧）
- CI実行への組み込み（既存チェックジョブに追加）

**含まないもの**:

- alias の自動書き換え（自動修正）
- Web/Backend 側の Vitest 設定最適化

### 成果物

| 種別 | 成果物                       | 配置先                                                                      |
| ---- | ---------------------------- | --------------------------------------------------------------------------- |
| 実装 | alias 整合チェックスクリプト | `scripts/` 配下                                                             |
| 設定 | npm script / CI連携          | `package.json`, `.github/workflows/`                                        |
| 文書 | 運用ルール追記               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

## 3. どのように実行するか（How）

### 前提条件

- TASK-FIX-10-1-VITEST-ERROR-HANDLING が完了していること

### 3.4 推奨アプローチ

1. `packages/shared` の export 一覧取得方法を定義する
2. `apps/desktop/vitest.config.ts` の alias 一覧を抽出する
3. 差分比較ロジック（不足/過剰）を実装する
4. `pnpm` スクリプトとして実行可能にする
5. CI でチェックを実行し、差分時に失敗させる

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                | 発見経緯                                                                                                                                                                         | 解決策                                                                         | 教訓                                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| alias 追加後の追従漏れを事前検知できない            | TASK-FIX-10-1で手動追加した18件は解消できたが、将来の export 追加に機械検知がなかった                                                                                            | `packages/shared` export と `vitest.config.ts` alias の差分検出をCI化する      | 「エラーが出た後に直す」運用ではなく、設定差分を先に検出する運用へ移行する |
| 検出対象を変更ファイルだけに限定しがち              | Phase 12再監査で、Phase 8成果物のスコープ外項目を初回判定で見落とした                                                                                                            | Phase成果物まで含めた未タスク検出を明示し、検出結果を task-workflow に登録する | 未タスク検出はコード差分だけでなく成果物の将来課題を必ず横断確認する       |
| alias 配置順序の重要性（具体的パス→汎用パスの順序） | TASK-FIX-10-1 Phase 5 で18個のalias追加時に順序間違いで一部テストが失敗。`@repo/shared/agent/types` より先に `@repo/shared/agent` が解決されると意図しないモジュールにマッチする | スクリプトで自動的にパス長降順（具体的パス優先）でソートする                   | 手動管理ではソート順の維持が困難。CI自動検証に順序チェックも含めるべき     |
| `packages/shared` の export 変更検知が困難          | `packages/shared/package.json` の exports フィールド変更時に Vitest テストが壊れるが、エラーメッセージ（`Failed to resolve entry`）からaliasの問題と判断するまでに時間がかかった | export追加/削除のdiff検知スクリプトを実装し、必要なalias更新を提案する         | モジュール解決エラーの原因特定には「export一覧の変更追跡」が最も効率的     |

## 4. 実行手順

### 概要ステップ

1. `packages/shared` の export 一覧取得方法を定義する
2. `apps/desktop/vitest.config.ts` の alias 一覧を抽出する
3. 差分比較ロジック（不足/過剰）を実装する
4. `pnpm` スクリプトとして実行可能にする
5. CI でチェックを実行し、差分時に失敗させる

### Phase 構成

| Phase | 名称                     | 内容                                                                              |
| ----- | ------------------------ | --------------------------------------------------------------------------------- |
| 1-3   | 要件定義・設計・レビュー | export 取得方法・diff ロジック・CI 統合方式の設計と妥当性検証                     |
| 4     | テスト作成               | チェックスクリプトのユニットテスト（不足検出・過剰検出・順序検証・非ゼロ終了）    |
| 5     | 実装                     | 差分検出スクリプト + npm script（`check:vitest-alias-sync`）+ CI ワークフロー統合 |
| 6-7   | テスト拡充・カバレッジ   | エッジケース（空 export、ワイルドカード export）のテスト追加とカバレッジ確認      |
| 8     | リファクタリング         | スクリプトの可読性・保守性改善                                                    |
| 9     | 品質検証                 | Lint・型チェック・全テスト実行                                                    |
| 10    | 最終レビュー             | 多角的品質・整合性検証                                                            |
| 11    | 手動テスト               | ローカル実行確認・意図的な alias 不足/過剰状態での動作確認                        |
| 12    | ドキュメント             | 実装ガイド・運用ルール・仕様書更新                                                |
| 13    | 完了                     | 成果物最終確認・PR 準備                                                           |

## 5. 完了条件チェックリスト

- [ ] alias 整合チェックがローカルで実行できる
- [ ] 不足 alias がある場合に非ゼロ終了する
- [ ] CIで自動実行される
- [ ] 運用ルールが仕様書に反映される

## 6. 検証方法

### 実行コマンド

```bash
pnpm run check:vitest-alias-sync
```

### テストケース

| #   | テストケース                                         | 入力条件                                                                                                                | 期待結果                                                              |
| --- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | export 追加時に不足 alias を検出できること           | `packages/shared/package.json` に新規 export（例: `./newmodule`）を追加し、`vitest.config.ts` に対応 alias を追加しない | 不足 alias として `@repo/shared/newmodule` が報告され、非ゼロ終了する |
| 2   | 不要 alias が残っている場合に警告を出力すること      | `vitest.config.ts` に `packages/shared` に存在しない export 向けの alias を残す                                         | 過剰 alias として該当エントリが警告出力される                         |
| 3   | alias 順序（パス長降順）が正しいことを検証できること | `vitest.config.ts` の alias を意図的にパス長昇順（汎用→具体的）に並べ替える                                             | 順序違反として検出され、正しい順序（具体的→汎用）が提案される         |
| 4   | CI で非ゼロ終了すること                              | テストケース 1-3 のいずれかの不整合がある状態で CI 実行                                                                 | exit code が 0 以外で終了し、CI ジョブが失敗する                      |

## 7. リスクと対策

| リスク              | 影響度 | 発生確率 | 対策                                           |
| ------------------- | ------ | -------- | ---------------------------------------------- |
| export 解釈の誤検知 | 中     | 中       | 比較対象を `@repo/shared` の利用実態に限定する |
| CI実行時間増加      | 低     | 低       | 差分抽出のみの軽量処理で実装する               |

## 8. 参照情報

### ソースコード・設定

- `apps/desktop/vitest.config.ts` — alias 定義の正本
- `packages/shared/package.json` — exports フィールド（alias 同期元）

### 親タスク成果物

- `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/outputs/phase-8/refactoring-report.md` — スコープ外項目として本タスクを検出

### 仕様書・ルール

- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` — Vitest alias 管理ルール（TASK-FIX-10-1 で追加した仕様）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — TASK-FIX-10-1 教訓（v1.15.0: 同種課題向け簡潔解決手順5ステップ）
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` — テストパターン集
- `.claude/rules/06-known-pitfalls.md` — P8（幽霊依存）、P40（テスト実行ディレクトリ依存）
- `.claude/skills/skill-creator/references/patterns.md` — テストドメイン成功/失敗パターン
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` — 未タスク仕様書ガイドライン

## 9. 備考

### 補足事項

- 本タスクは「不足 alias の検知自動化」が目的であり、alias の自動修正はスコープ外。
- 実装時は `pnpm --filter @repo/desktop exec vitest run ...` で Desktop パッケージ設定を使って検証する。
