# Phase 8: リファクタリング（TDD: Refactor） — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 8（リファクタリング）                    |
| 機能名   | IPCハンドラ単位カバレッジ測定基盤構築    |
| タスクID | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
| 作成日   | 2026-02-28                               |
| Issue    | #854                                     |

## 目的

Phase 5（実装）および Phase 6-7（テスト拡充・カバレッジ確認）で完成したコードの品質を、動作を変えずに改善する。TDDサイクルの Refactor ステップとして、既存テストが全てPASSし続けることを各変更後に確認しながらリファクタリングを実施する。

## 背景

Phase 5 で `coverage-by-handler.ts` と `coverage-by-handler.test.ts` を実装し、Phase 6-7 でカバレッジ基準を達成した。実装を優先した結果、以下のコードスメルが残存している可能性がある:

- 関数の責務が混在している（AST解析とカバレッジ計算が同一関数内）
- 型定義が関数内にインラインで存在する
- テストコード内の重複セットアップロジック
- 自明なコメントや命名の改善余地

## 実行タスク

### タスク1: コードスメル検出

- **目的**: リファクタリング対象を特定する
- **実行手順**:
  1. `coverage-by-handler.ts` を読み込み、以下の観点でスメルを検出:
     - 20行を超える関数
     - 3つ以上の責務を持つ関数（AST解析・カバレッジ計算・レポート生成の混在）
     - ネストが3階層以上の条件分岐
     - 重複コードブロック
     - `any` 型や型アサーション（`as`）の使用
  2. `coverage-by-handler.test.ts` で以下を検出:
     - 重複するモック/スタブセットアップ
     - 複数テストで繰り返されるアサーションパターン
     - テストデータのハードコード重複
  3. 検出結果を `outputs/phase-8/code-smell-report.md` に記録
- **期待される成果物**: コードスメルレポート（修正対象の一覧と優先度）

### タスク2: プロダクションコードのリファクタリング

- **目的**: `coverage-by-handler.ts` のコード品質を改善する
- **実行手順**:
  1. **関数の単一責務化**: 以下のモジュール分離を確認・改善
     - `HandlerDetector`: AST解析によるハンドラ境界検出のみ
     - `CoverageParser`: v8カバレッジJSONの解析のみ
     - `CoverageCalculator`: ハンドラ単位カバレッジの算出のみ
     - `Phase7Judge`: 判定ルールの適用のみ
     - `ReportFormatter`: レポート出力のみ
  2. **型定義の整理**: インターフェース定義をファイル先頭に集約
     - `HandlerInfo`: チャンネル名・開始行・終了行
     - `CoverageResult`: ハンドラごとのLine/Branch/Functionカバレッジ
     - `Phase7Judgment`: PASS/FAIL判定結果
     - `CoverageByHandlerOptions`: CLIオプション
  3. **エラーハンドリングの一貫性確認**:
     - 全てのエラーが明確なエラーメッセージを持つことを確認
     - エラーの種類（入力エラー・解析エラー・ファイルエラー）ごとに区別可能にする
  4. **各変更後に全テストを実行して回帰がないことを確認**:
     ```bash
     cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts
     ```
- **期待される成果物**: リファクタリング済みの `coverage-by-handler.ts`

### タスク3: テストコードのリファクタリング

- **目的**: `coverage-by-handler.test.ts` のメンテナンス性を向上させる
- **実行手順**:
  1. **テストヘルパー関数の抽出**:
     - `createMockHandlerInfo(overrides?)`: テスト用ハンドラ情報を生成するファクトリ
     - `createMockCoverageData(overrides?)`: テスト用カバレッジデータを生成するファクトリ
     - `createMockV8CoverageJson(handlers, coverageMap)`: v8カバレッジJSON構造を生成するヘルパー
  2. **テストデータファクトリの作成**:
     - `skillHandlers` 相当のテストフィクスチャ（23ハンドラ分のモックデータ）
     - エッジケース用のフィクスチャ（0ハンドラ、1ハンドラ、ネストハンドラ）
  3. **テスト構造の改善**:
     - `describe` ブロックの適切なグルーピング（モジュール単位）
     - `beforeEach` でのモックリセットの統一
  4. **各変更後にテストが全てPASSすることを確認**:
     ```bash
     cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts
     ```
- **期待される成果物**: リファクタリング済みの `coverage-by-handler.test.ts`

### タスク4: 命名改善

- **目的**: コードの可読性を向上させる
- **実行手順**:
  1. **変数・関数名の明確化**:
     - 略語の排除（`pct` → `percentage` または `coveragePercent`）
     - 動詞+目的語の命名規則（`parseV8Coverage`, `calculateHandlerCoverage`, `formatReport`）
     - boolean変数の `is`/`has` プレフィックス準拠
  2. **コメントの最適化**:
     - 自明なコメント（`// ハンドラを検出` のような説明のみのコメント）を削除
     - 「なぜ」を説明するコメントを追加（P41対策の意図、v8 JSON構造の仕様根拠）
     - JSDoc コメントの追加（公開関数のパラメータ・戻り値・例外）
  3. **各変更後にテストがPASSすることを確認**
- **期待される成果物**: 命名改善済みのコード

## 参照資料

| 参照資料             | パス                                                                                        | 内容                      |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 1 要件定義     | `phase-1-requirements.md`                                                                   | FR/NFRの再確認            |
| Phase 2 設計         | `phase-2-design.md`                                                                         | モジュール設計の基準      |
| Phase 5 実装成果物   | `apps/desktop/scripts/coverage-by-handler.ts`                                               | リファクタリング対象      |
| Phase 5 テスト成果物 | `apps/desktop/scripts/coverage-by-handler.test.ts`                                          | テストコードの改善対象    |
| Phase 6 テスト拡充   | `phase-6-test-expansion.md`                                                                 | 拡充済みテスト観点の継承  |
| Phase 7 成果物       | `outputs/phase-7/coverage-report.md`                                                        | カバレッジ基準達成状況    |
| 品質ルール           | `.claude/rules/02-code-quality.md`                                                          | コード品質基準            |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | SOLID原則・設計パターン   |
| P41 記録             | `.claude/rules/06-known-pitfalls.md#P41`                                                    | v8 インライン関数カウント |

## 統合テスト連携

### TDD検証: Green状態維持の確認

リファクタリングの各ステップ後に以下のコマンドで回帰がないことを確認する。

```bash
# リファクタリング後のテスト実行（各変更後に毎回実行）
cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts

# 既存IPCハンドラテストへの回帰確認
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

### リファクタリング前後の比較

| 検証項目              | リファクタリング前 | リファクタリング後 | 判定基準                   |
| --------------------- | ------------------ | ------------------ | -------------------------- |
| テスト成功数          | 全テストPASS       | 全テストPASS       | テスト数が減少していない   |
| カバレッジ            | Phase 7 達成値     | Phase 7 達成値以上 | カバレッジが低下していない |
| 関数の平均行数        | 記録する           | 改善される         | 20行以下が目標             |
| 型安全                | strict対応         | strict対応         | `any` 型が増えていない     |
| `pnpm lint` 結果      | PASS               | PASS               | 新規warning/errorなし      |
| `pnpm typecheck` 結果 | PASS               | PASS               | 新規エラーなし             |

## 多角的チェック観点

| 観点           | チェック項目                                                                   |
| -------------- | ------------------------------------------------------------------------------ |
| SOLID原則準拠  | 各関数が単一責務であり、インターフェースに依存していることを確認               |
| DRY原則        | プロダクションコード・テストコードの両方で重複コードが排除されていることを確認 |
| テスト回帰なし | リファクタリング前後で全テストがPASSし、テスト数が減少していないことを確認     |
| カバレッジ維持 | リファクタリング後もPhase 7で達成したカバレッジ基準を維持していることを確認    |
| 可読性向上     | 変数名・関数名が意図を明確に伝え、不要なコメントが削除されていることを確認     |
| P41対策の維持  | v8 インライン関数カウント対策がリファクタリング後も正しく動作することを確認    |

## 成果物

| 成果物                     | パス                                               | 説明                               |
| -------------------------- | -------------------------------------------------- | ---------------------------------- |
| コードスメルレポート       | `outputs/phase-8/code-smell-report.md`             | 検出されたスメルと対応状況         |
| リファクタリングログ       | `outputs/phase-8/refactoring-log.md`               | 各変更の内容とテスト結果           |
| リファクタリング済みコード | `apps/desktop/scripts/coverage-by-handler.ts`      | 品質改善済みのプロダクションコード |
| リファクタリング済みテスト | `apps/desktop/scripts/coverage-by-handler.test.ts` | 品質改善済みのテストコード         |

## 完了条件

- [ ] コードスメルレポートが作成されている
- [ ] 全テストがリファクタリング後もPASSしている
- [ ] カバレッジがPhase 7達成値を維持している
- [ ] 重複コードが排除されている
- [ ] 関数が単一責務に分割されている（各関数20行以下が目標）
- [ ] 型定義がファイル先頭に整理されている
- [ ] テストヘルパー関数が抽出されている
- [ ] 命名が意図を明確に伝える形に改善されている
- [ ] `pnpm lint` がPASSしている
- [ ] `pnpm typecheck` がPASSしている
- [ ] リファクタリングログが完成している
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
