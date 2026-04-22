# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 6                                                   |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| 前提Phase  | Phase 5                                             |
| 後続Phase  | Phase 7                                             |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

Phase 5 の実装に対して、fail path・回帰 guard・補助コマンドのテストを追加する。
既存3テストが「中身を期待しない」契約から変更された際の回帰漏れを防ぐとともに、
EVALS.json バリデーションの境界条件を網羅する。

## 追加テストケース

### 異常系テストケース

| テストケース名                  | 入力条件                                       | 期待結果                                                                          | 優先度 |
| ------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------- | ------ |
| 部分破損JSON（閉じ括弧なし）    | `{"cases": [{"id": "t1"` のような不完全な JSON | `evalsValidation.valid === false`、`error` にパースエラーメッセージが含まれる     | 高     |
| 空オブジェクト `{}`             | `{}` のみの EVALS.json                         | `evalsValidation.valid === false`、`error` に「必須キー欠落」メッセージが含まれる | 高     |
| 必須キー欠落（`cases` なし）    | `{"description": "test"}`                      | `evalsValidation.valid === false`、`missingKeys` に `cases` が含まれる            | 高     |
| camelCase キー（`testCases`）   | `{"testCases": [...]}`                         | `evalsValidation.valid === true`（camelCase 許容ポリシー適用）                    | 中     |
| snake_case キー（`test_cases`） | `{"test_cases": [...]}`                        | `evalsValidation.valid === true`（snake_case 許容ポリシー適用）                   | 中     |
| 大容量ファイル（1MB 超）        | ファイルサイズ > 1,048,576 バイトの EVALS.json | `evalsValidation.skipped === true`、スキャン自体は完了する                        | 中     |
| 権限エラー（読み取り不可）      | EVALS.json が存在するが読み取り権限なし        | `evalsValidation.valid === false`、`error` に権限エラーが含まれる                 | 低     |

### バリデーション警告 vs 失敗の境界

| ケース                             | 期待する状態                                                             | 備考                                 |
| ---------------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| `cases` が空配列 `[]`              | `evalsValidation.valid === true`、`warnings` に「テストケースが0件」警告 | 空配列は有効な EVALS.json として扱う |
| `cases` に `id` なしのケースが混在 | `evalsValidation.valid === true`、`warnings` に不完全ケース一覧          | 部分的な問題は警告扱い               |
| JSON 構文エラー                    | `evalsValidation.valid === false`                                        | 構文エラーは失敗扱い（警告ではない） |
| 必須キー完全欠落                   | `evalsValidation.valid === false`                                        | 必須キー欠落は失敗扱い               |

## 回帰テスト設計

既存 SkillScanner の動作が壊れていないことを確認する。

### 確認対象の既存テスト

| テスト名           | 確認内容                                       | 期待状態                          |
| ------------------ | ---------------------------------------------- | --------------------------------- |
| `with-evals`       | EVALS.json ありのスキルがリストに載る          | Phase 5 の型変更後も GREEN を維持 |
| `with-all-others`  | 各種ファイルを持つスキルが正しくスキャンされる | Phase 5 の型変更後も GREEN を維持 |
| `with-sized-evals` | 一定サイズ以上の EVALS.json が検出される       | Phase 5 の型変更後も GREEN を維持 |

### 回帰テスト実行コマンド

```bash
# 全テスト実行（回帰確認）
pnpm --filter @repo/desktop test -- --reporter=verbose

# SkillScanner 関連テストのみ実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillScanner
```

## テストコマンド

```bash
# 拡張テストケースのみ実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillScanner

# ウォッチモードで開発しながら確認
pnpm --filter @repo/desktop test -- --watch SkillScanner
```

## 成果物

| 成果物           | パス                                        | 説明                                           |
| ---------------- | ------------------------------------------- | ---------------------------------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加したテストケースの一覧と期待結果           |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 既存3テストの通過確認結果                      |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | 部分破損JSON・大容量・権限エラーの各テスト結果 |

## 完了条件

- [ ] 部分破損JSON の異常系テストが追加され GREEN である
- [ ] 空オブジェクト `{}` の異常系テストが追加され GREEN である
- [ ] 必須キー欠落の異常系テストが追加され GREEN である
- [ ] camelCase/snake_case 両許容の境界テストが追加され GREEN である
- [ ] 大容量ファイルのスキップテストが追加され GREEN である
- [ ] バリデーション警告 vs 失敗の境界ケースが追加され GREEN である
- [ ] 既存3テスト（with-evals / with-all-others / with-sized-evals）が GREEN を維持している
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 7: テストカバレッジ確認
