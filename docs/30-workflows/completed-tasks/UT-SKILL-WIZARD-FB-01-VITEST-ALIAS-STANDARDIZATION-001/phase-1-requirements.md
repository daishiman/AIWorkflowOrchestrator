# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 1                                                                     |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | -                                                                     |
| 後続Phase  | Phase 2                                                               |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了                                                                  |

## 目的

`packages/shared/vitest.config.ts` に `resolve.alias` 設定を追加し、ESLint post-tool-use フックによる
import パス自動変換後もテストが解決可能な状態を標準化する。

## 背景

UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 11 フィードバック（FB-01）にて検出。
ESLint post-tool-use フックが `../smartDefaultReasoningService` → `@repo/shared` へ import パスを
自動変換した結果、vitest が `@repo/shared` を解決できず全テストが失敗した。

## P50チェック（Step 0）

```bash
# vitest.config.ts の現行状態確認
cat packages/shared/vitest.config.ts

# resolve.alias 設定の有無確認
grep -n "resolve" packages/shared/vitest.config.ts
grep -n "@repo/shared" packages/shared/vitest.config.ts
```

**確認結果**: 実装完了済み。`resolve.alias` に `@repo/shared` → `./index.ts` が設定済み。

## タスク分類

**type**: improvement（既存設定ファイルへの標準設定追加）
**UI task**: NO（設定ファイル変更のみ）
**docs-only task**: NO（vitest.config.ts 変更を伴う）

## 実行タスク

- 要件抽出: ESLint フック動作と vitest alias 未設定の因果関係を明確化する
- 受け入れ基準化: 4つの完了条件を AC として定義する
- 影響範囲確認: packages/shared 配下の全テストファイルに対する影響を確認する

## 参照資料

### 実装・コード

| 資料名               | パス                                                                                          | 用途                           |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------------ |
| vitest設定ファイル   | `packages/shared/vitest.config.ts`                                                            | 現行設定の確認                 |
| sharedパッケージ入口 | `packages/shared/index.ts`                                                                    | @repo/shared エイリアス解決先  |
| sharedパッケージ設定 | `packages/shared/package.json`                                                                | パッケージ名・エクスポート確認 |
| ESLintフック         | `.claude/hooks/auto-lint.sh`                                                                  | 自動import変換フックの動作確認 |
| 検出元タスク仕様書   | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001.md` | 問題の詳細                     |

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                                        | 用途               |
| -------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト品質基準     |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | vitest設定パターン |
| 教訓           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | フックとの衝突事例 |
| リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止       |

## 受け入れ基準（Acceptance Criteria）

| ID   | 基準                                                                  | 検証方法                                                |
| ---- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| AC-1 | `packages/shared/vitest.config.ts` に `resolve.alias` 設定が含まれる  | `grep "resolve.alias" packages/shared/vitest.config.ts` |
| AC-2 | `@repo/shared` インポートを含むテストが vitest で解決できる           | `pnpm --filter @repo/shared test` が PASS               |
| AC-3 | 既存の全テストが PASS する                                            | `pnpm --filter @repo/shared test` 全件PASS              |
| AC-4 | 新規パッケージ作成時のテンプレートに `resolve.alias` が標準で含まれる | テンプレートファイル確認                                |

## 機能要件

| ID    | 要件                                                                       |
| ----- | -------------------------------------------------------------------------- |
| FR-01 | vitest.config.ts の `resolve.alias` に `"@repo/shared"` エントリが存在する |
| FR-02 | エイリアスは `path.resolve(__dirname, "./index.ts")` を指す                |
| FR-03 | `import { X } from "@repo/shared"` 構文がテスト内で正常解決される          |

## 非機能要件

| ID     | 要件                                                 |
| ------ | ---------------------------------------------------- |
| NFR-01 | 変更による既存テストへの回帰がないこと               |
| NFR-02 | vitest の並列実行設定（pool: forks）に影響しないこと |
| NFR-03 | CI/CD パイプラインで問題なく動作すること             |

## 因果ループ分析

**強化ループ（問題発生ループ）**:
ESLint フックが import 変換 → vitest alias 未設定 → テスト解決不可 → 全件失敗
→ 開発者が原因を特定しにくい → フックの挙動が不透明に見える

**バランスループ（修正ループ）**:
resolve.alias 設定追加 → @repo/shared が解決可能 → テスト PASS
→ フックによる変換後も安全 → 開発体験が改善

## 実行手順

1. `packages/shared/vitest.config.ts` の現行設定を確認する
2. ESLint フックの import 変換ルールを確認する
3. `@repo/shared` を使用しているテストファイルを列挙する
4. 受け入れ基準を AC-1〜AC-4 として文書化する

## 統合テスト連携

- `pnpm --filter @repo/shared test` で全テストが PASS することを確認
- ESLint フック実行後もテストが通ることをシミュレート確認

## 多角的チェック観点

| 観点         | 確認内容                                                     |
| ------------ | ------------------------------------------------------------ |
| システム思考 | ESLint フック → vitest の連鎖障害を因果ループで把握する      |
| 改善思考     | 再発防止として標準テンプレートへの組み込みも必要             |
| 影響範囲思考 | packages/shared 以外のパッケージに同様の問題がないか確認する |
| 逆説思考     | alias を設定しないとどのような状況で再発するかを考える       |

## 成果物

| 成果物       | パス                                                    | 説明                   |
| ------------ | ------------------------------------------------------- | ---------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`            | 機能要件と非機能要件   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                | AC-1〜AC-4 の詳細      |
| 仕様抽出結果 | `outputs/phase-1/aiworkflow-requirements-extraction.md` | aiworkflow仕様抽出結果 |

## 完了条件

- [x] 実行タスクで定義した成果物を全件作成
- [x] 矛盾がないことを確認
- [x] 漏れがないことを確認
- [x] 整合性が取れていることを確認
- [x] 依存関係が取れていることを確認
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. vitest.config.ts 現行状態確認（完了）
2. ESLint フックの変換ルール確認（完了）
3. 受け入れ基準 AC-1〜AC-4 定義（完了）
4. 影響範囲確認（完了）
5. 成果物出力（完了）

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001
```

## 次のPhase

Phase 2: 設計
