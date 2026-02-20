# Phase 3: 設計レビュー — TypeScript `@repo/shared` モジュール解決エラー 228件の根本解決

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 3 — 設計レビュー                         |
| 機能名 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 作成日 | 2026-02-20                               |
| Issue  | #837                                     |

---

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的に検証し、実装に移行する前に設計の妥当性・整合性・リスクを確認する。

---

## 実行タスク

- 要件充足性レビュー: 設計が全要件を満たしているか検証
- 技術的妥当性レビュー: 設計の技術的正当性を検証
- リスク・Pitfall レビュー: 既知の問題パターンへの対策が十分か検証
- レビュー判定: PASS / MINOR / MAJOR 判定と次Phase決定

| #   | タスク名                 | 目的                                   |
| --- | ------------------------ | -------------------------------------- |
| 1   | 要件充足性レビュー       | 設計が全要件を満たしているか検証       |
| 2   | 技術的妥当性レビュー     | 設計の技術的正当性を検証               |
| 3   | リスク・Pitfall レビュー | 既知の問題パターンへの対策が十分か検証 |
| 4   | レビュー判定             | PASS / MINOR / MAJOR 判定と次Phase決定 |

---

## 参照資料

| 資料                           | パス                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Phase 1 要件定義書             | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-1-requirements.md` |
| Phase 2 設計書                 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-2-design.md`       |
| apps/desktop/tsconfig.json     | `apps/desktop/tsconfig.json`                                                         |
| apps/desktop/vitest.config.ts  | `apps/desktop/vitest.config.ts`                                                      |
| packages/shared/package.json   | `packages/shared/package.json`                                                       |
| モノレポ要件                   | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`         |
| 品質要件（alias/未処理エラー） | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          |
| 教訓集（再発防止）             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               |
| 既知の落とし穴                 | `.claude/rules/06-known-pitfalls.md`                                                 |

---

## 実行手順

### Task 1: 要件充足性レビュー

Phase 1 の受入基準に対して、Phase 2 の設計が充足するかを検証する。

#### 定量的基準の充足

| #   | 受入基準                              | 設計での対応                                                  | 判定 |
| --- | ------------------------------------- | ------------------------------------------------------------- | ---- |
| 1   | typecheck エラー 0件                  | tsconfig paths で全 169 TS2307 エラーのインポートパスをカバー | PASS |
| 2   | vitest 全テスト PASS                  | Vitest alias を変更しないため既存テストに影響なし             | PASS |
| 3   | packages/shared typecheck エラー 0件  | shared の tsconfig は変更しないため現状維持                   | PASS |
| 4   | pnpm --filter @repo/shared build 成功 | tsup 設定を変更しないため現状維持                             | PASS |
| 5   | pnpm lint PASS                        | tsconfig.json の paths 追加は lint に影響なし                 | PASS |

#### 定性的基準の充足

| #   | 受入基準                           | 設計での対応                                                                    | 判定  |
| --- | ---------------------------------- | ------------------------------------------------------------------------------- | ----- |
| 1   | サブパス追加時の更新箇所 2箇所以内 | tsconfig paths + vitest alias の 2箇所（package.json exports も含めると 3箇所） | MINOR |
| 2   | Vitest alias 削減または維持        | 変更なし（維持）                                                                | PASS  |
| 3   | 既存 import 文の変更ゼロ           | 設計で明示的に「コード変更なし」を確認                                          | PASS  |
| 4   | P8（幽霊依存）の新規導入なし       | 新パッケージの追加なし                                                          | PASS  |

**MINOR 指摘**: サブパス追加時の更新箇所が実質 3箇所（package.json exports + tsconfig paths + vitest alias）になる。将来的に `vitest-tsconfig-paths` プラグイン導入で 2箇所に削減可能だが、本タスクのスコープ外として未タスク化する。

### Task 2: 技術的妥当性レビュー

#### チェック観点

| #   | 観点                              | 確認事項                                                         | 判定 |
| --- | --------------------------------- | ---------------------------------------------------------------- | ---- |
| 1   | paths マッピングの完全性          | 全 23 インポートパス（TS2307 対象）が paths でカバーされているか | PASS |
| 2   | paths 定義順序の正当性            | 具体的パス → 汎用パスの順が正しく守られているか                  | PASS |
| 3   | ソースファイルパスの正確性        | 各 paths のターゲットパスが実在するファイルを指しているか        | PASS |
| 4   | typesVersions と exports の整合性 | typesVersions の全エントリが exports のエントリと一致するか      | PASS |
| 5   | baseUrl との互換性                | `baseUrl: "."` が既に設定済みで paths の相対パスが正しいか       | PASS |
| 6   | moduleResolution との互換性       | `bundler` モードで paths が正しく解決されるか                    | PASS |

#### paths マッピング完全性の検証

Phase 1 の TS2307 インポートパス一覧（23 パターン）と Phase 2 の paths マッピング（27 エントリ）を照合:

| インポートパス                                    | paths エントリ | ステータス |
| ------------------------------------------------- | -------------- | ---------- |
| `@repo/shared`                                    | あり           | OK         |
| `@repo/shared/types/llm/schemas`                  | あり           | OK         |
| `@repo/shared/types/agent`                        | あり           | OK         |
| `@repo/shared/types`                              | あり           | OK         |
| `@repo/shared/types/skill`                        | あり           | OK         |
| `@repo/shared/types/auth`                         | あり           | OK         |
| `@repo/shared/types/api-keys`                     | あり           | OK         |
| `@repo/shared/agent`                              | あり           | OK         |
| `@repo/shared/infrastructure/auth`                | あり           | OK         |
| `@repo/shared/types/llm`                          | あり           | OK         |
| `@repo/shared/schemas`                            | あり           | OK         |
| `@repo/shared/types/replace`                      | あり           | OK         |
| `@repo/shared/types/rag`                          | あり           | OK         |
| `@repo/shared/types/rag/result`                   | あり           | OK         |
| `@repo/shared/types/auth-mode`                    | あり           | OK         |
| `@repo/shared/constants`                          | あり           | OK         |
| `@repo/shared/repositories`                       | あり           | OK         |
| `@repo/shared/src/ipc/channels`                   | あり           | OK         |
| `@repo/shared/services/history/types`             | あり           | OK         |
| `@repo/shared/services/history/history-service`   | あり           | OK         |
| `@repo/shared/services/logging/types`             | あり           | OK         |
| `@repo/shared/services/logging/conversion-logger` | あり           | OK         |
| `@repo/shared/infrastructure/ai/apiKeyValidator`  | あり           | OK         |

**結果**: 全 23 インポートパスが paths エントリでカバーされている。追加の 4 エントリ（`core`, `infrastructure`, `infrastructure/database`, `schemas/auth`）は exports に定義されているが現在エラーとして出ていないもの。予防的に追加しており問題なし。

### Task 3: リスク・Pitfall レビュー

| #   | リスク                                | 影響度 | 発生確率 | 対策状況                                          | 判定  |
| --- | ------------------------------------- | ------ | -------- | ------------------------------------------------- | ----- |
| 1   | P8: 幽霊依存の導入                    | 高     | 低       | 新パッケージ追加なし、paths はソース参照のみ      | OK    |
| 2   | P11: Prettier/ESLint による Edit 失敗 | 中     | 中       | 一括 Write で対応、hooks は JSON に適用されにくい | OK    |
| 3   | P40: テスト実行ディレクトリ依存       | 高     | 低       | Vitest 設定を変更しないため影響なし               | OK    |
| 4   | paths の漏れによるエラー残存          | 高     | 低       | 全 23 パターンを照合済み                          | OK    |
| 5   | dist/ 未生成時の typesVersions 無効   | 低     | 中       | typesVersions は補完目的、メイン対策は paths      | OK    |
| 6   | 将来のサブパス追加時の 3箇所更新      | 低     | 高       | MINOR 指摘として未タスク化                        | MINOR |

### Task 4: レビュー判定

#### 判定基準

| 判定  | 条件                                                                 |
| ----- | -------------------------------------------------------------------- |
| PASS  | 全ての要件を満たし、技術的問題がない                                 |
| MINOR | 軽微な改善点があるが、実装に影響しない。未タスク仕様書に変換して進行 |
| MAJOR | 要件未充足または技術的に重大な問題がある。Phase 1 または 2 へ戻る    |

#### レビュー結果

| 観点         | 判定  | 詳細                                                       |
| ------------ | ----- | ---------------------------------------------------------- |
| 要件充足性   | PASS  | 全5定量的基準 + 3/4定性的基準を充足                        |
| 技術的妥当性 | PASS  | 全6チェック観点をクリア                                    |
| Pitfall 対策 | PASS  | 全6リスク項目に対策あり                                    |
| 保守性       | MINOR | サブパス追加時の更新箇所が3箇所（将来的に2箇所に削減可能） |

#### 最終判定: **MINOR**

指摘対応後 Phase 4 へ進行する。

#### MINOR 指摘一覧

| #   | 指摘内容                                                           | 対応方針                                                   |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 1   | サブパス追加時の更新箇所が 3箇所（exports + paths + vitest alias） | 未タスク仕様書を作成し、`vitest-tsconfig-paths` 導入を検討 |

**未タスク化**: `UT-FIX-TS-VITEST-TSCONFIG-PATHS-001`（vitest-tsconfig-paths プラグイン導入による二重管理解消）

---

## 統合テスト連携

| 連携観点                 | 内容                                                               | 参照先                                                                      |
| ------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| レビュー判定のテスト反映 | MINOR 指摘を未タスク化し、Phase 4 以降で再現可能な検証項目に落とす | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        |
| alias再発防止            | alias 更新漏れの再発リスクを明示し、検証対象に含める               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |
| 失敗パターン回避         | 過去のモジュール解決系課題の苦戦箇所をレビュー観点に反映する       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      |

---

## 成果物

| #   | 成果物                 | パス                                                                                            |
| --- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | Phase 3 設計レビュー書 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-3-design-review.md`（本文書） |

---

## 完了条件

- [ ] 要件充足性レビューを実施し、定量的基準5件・定性的基準4件を検証した
- [ ] 技術的妥当性レビューを実施し、6つのチェック観点を検証した
- [ ] 全23 TS2307 インポートパスが paths マッピングでカバーされていることを照合した
- [ ] リスク・Pitfall レビューを実施し、6件のリスク項目を評価した
- [ ] レビュー判定を MINOR とし、1件の MINOR 指摘を未タスク化した
- [ ] 次 Phase（Phase 4）への移行条件を確認した

---

## 次のPhase

→ **Phase 4: テスト作成**（`phase-4-test-creation.md`）

**前提条件**: MINOR 指摘1件を未タスク仕様書（`UT-FIX-TS-VITEST-TSCONFIG-PATHS-001`）に変換後、Phase 4 へ進行する。
