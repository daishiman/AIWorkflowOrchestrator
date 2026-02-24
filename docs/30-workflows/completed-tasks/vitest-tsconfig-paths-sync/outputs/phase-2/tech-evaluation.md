# Phase 2 成果物: 技術評価計画 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue      | #875                                |
| Phase      | 2（設計）                           |
| 作成日     | 2026-02-24                          |
| ステータス | completed                           |

## 目的

`vite-tsconfig-paths` プラグインの導入可否を判断するための評価計画を定義する。実際の評価（インストール・テスト実行）は Phase 5（実装）で実施する。

---

## 1. プラグイン概要

| 項目            | 内容                                                                            |
| --------------- | ------------------------------------------------------------------------------- |
| パッケージ名    | `vite-tsconfig-paths`                                                           |
| npm レジストリ  | https://www.npmjs.com/package/vite-tsconfig-paths                               |
| 機能            | tsconfig.json の `compilerOptions.paths` を Vite/Vitest の alias として自動解決 |
| Vitest 互換性   | Vitest は Vite ベースのため `plugins` 配列に追加するだけで動作                  |
| devDependencies | 本番ビルドには含まれない                                                        |

---

## 2. 評価基準マトリクス（6項目）

| #   | 評価項目                | 評価方法                                                          | 合否基準                                               | 結果（Phase 5 で記入） |
| --- | ----------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ | ---------------------- |
| 1   | tsconfig paths 参照機能 | `tsconfigPaths()` プラグイン追加後にテスト実行                    | `@repo/shared` 系27エントリが自動解決される            | 未実施                 |
| 2   | サブパスエイリアス対応  | `@repo/shared/types/llm` 等のネストパスのテストが PASS            | 3階層以上のサブパス（`types/llm/schemas`）も解決される | 未実施                 |
| 3   | 既存テスト互換性        | 224テスト全件実行（module-resolution 57 + shared 59 + alias 108） | 全件 PASS（0件失敗）                                   | 未実施                 |
| 4   | happy-dom 環境互換性    | テスト環境 `happy-dom` でのエラー有無確認                         | Symbol 操作エラーが発生しない                          | 未実施                 |
| 5   | monorepo 構成対応       | pnpm workspace のシンボリックリンク構成でパス解決確認             | `../../packages/shared` への参照が正しく解決される     | 未実施                 |
| 6   | パフォーマンス影響      | テスト実行時間の before/after 比較                                | 実行時間の増加が10%以内                                | 未実施                 |

---

## 3. 評価手順（Phase 5 で実施）

### Step 1: インストール

```bash
pnpm --filter @repo/desktop add -D vite-tsconfig-paths
```

### Step 2: vitest.config.ts への導入

1. `import tsconfigPaths from "vite-tsconfig-paths"` を追加
2. `plugins` 配列に `tsconfigPaths()` を追加
3. `resolve.alias` から `@repo/shared` 系の27エントリを削除
4. `@`, `@renderer`, `@main`, `@anthropic-ai/claude-agent-sdk` は残留

### Step 3: テスト実行

```bash
# before: 現行テスト実行時間を記録
cd apps/desktop && time pnpm vitest run --reporter=verbose 2>&1 | tail -5

# after: プラグイン導入後のテスト実行時間を記録
cd apps/desktop && time pnpm vitest run --reporter=verbose 2>&1 | tail -5
```

### Step 4: 評価結果の記録

- 各項目の PASS/FAIL を記録
- FAIL の場合、具体的なエラーメッセージと失敗したテスト名を記録
- パフォーマンス比較（before/after の秒数）を記録

### Step 5: フォールバック判断

- 6項目のうち1項目でも FAIL の場合:
  1. プラグインをアンインストール: `pnpm --filter @repo/desktop remove vite-tsconfig-paths`
  2. vitest.config.ts を元に戻す
  3. パターン B（既存スクリプト拡張）に移行

---

## 4. 技術的リスク評価

| リスク項目                          | 発生確率 | 影響度 | 対策                                                                  |
| ----------------------------------- | -------- | ------ | --------------------------------------------------------------------- |
| tsconfig extends 未対応             | 低       | 高     | desktop の tsconfig が extends を使用しているか事前確認               |
| resolve.alias との優先順位競合      | 低       | 中     | Vite の仕様として resolve.alias が plugins より優先されることを確認   |
| monorepo ルート tsconfig 誤読み込み | 中       | 中     | `tsconfigPaths({ projects: ['./tsconfig.json'] })` でスコープを限定   |
| パフォーマンス劣化（>10%）          | 低       | 低     | 測定後にフォールバック判断                                            |
| vitest-alias-consistency テスト破壊 | 高       | 中     | 108件のテスト内容を Phase 4 で事前分析                                |
| formatReport テスト後方互換性破壊   | 中       | 中     | テストのアサーション形式（完全一致 vs 部分一致）を Phase 4 で事前確認 |

### vitest-alias-consistency テスト（108件）の影響分析

プラグイン導入により `vitest.config.ts` から `@repo/shared` 系の alias が削除される。108件のテストが「alias エントリの存在チェック」を行っている場合、テスト自体の修正が必要になる可能性がある。

**Phase 4 での調査項目**:

- 108件のテストが `vitest.config.ts` のファイル内容をパースしてチェックしているか
- それとも、実際のモジュール解決（import が成功するか）をチェックしているか
- 前者の場合、プラグイン導入後にどのテストが FAIL するかを特定

---

## 5. 依存パッケージの信頼性評価

| 項目                   | 確認内容                                                     |
| ---------------------- | ------------------------------------------------------------ |
| 週間ダウンロード数     | Phase 5 で npm レジストリから確認                            |
| 最終更新日             | Phase 5 で npm レジストリから確認                            |
| 既知の脆弱性           | `pnpm audit` で確認                                          |
| ライセンス             | MIT（プロジェクトのライセンスと互換）                        |
| メンテナンス状況       | GitHub リポジトリの Issue/PR 活動を確認                      |
| 本番ビルドへの影響     | devDependencies のため本番バンドルに含まれない               |
| サプライチェーンリスク | devDependencies のみのため、ユーザーへの直接的なリスクは低い |

---

## 6. 結論

- 実際の評価は Phase 5 で実施する
- 評価基準6項目が全て PASS した場合のみパターン A を採用する
- 1項目でも FAIL の場合はパターン B にフォールバックする
- パターン A / B いずれの場合も、pnpm スクリプト追加（FR-3）と運用手順ドキュメント化（FR-4）は実施する
