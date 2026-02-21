# Phase 3 成果物: 設計レビュー結果

## メタ情報

| 項目      | 値                                       |
| --------- | ---------------------------------------- |
| タスク ID | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Phase     | 3 — 設計レビュー                         |
| 作成日    | 2026-02-20                               |
| Issue     | #837                                     |

---

## 1. 要件充足性レビュー

### 定量的基準の充足

| #   | 受入基準                                           | 設計での対応                                                              | 判定 |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------- | ---- |
| 1   | `cd apps/desktop && pnpm typecheck` エラー 0件     | tsconfig paths で全169 TS2307エラーのインポートパス（24パターン）をカバー | PASS |
| 2   | `cd apps/desktop && pnpm vitest run` 全テスト PASS | Vitest alias を変更しないため既存テストに影響なし                         | PASS |
| 3   | `cd packages/shared && pnpm typecheck` エラー 0件  | shared の tsconfig は変更しないため現状維持                               | PASS |
| 4   | `pnpm --filter @repo/shared build` 成功            | tsup 設定を変更しないため現状維持                                         | PASS |
| 5   | `pnpm lint` PASS                                   | tsconfig.json の paths 追加は lint に影響なし                             | PASS |

**全5件 PASS**

### 定性的基準の充足

| #   | 受入基準                           | 設計での対応                                                                    | 判定  |
| --- | ---------------------------------- | ------------------------------------------------------------------------------- | ----- |
| 1   | サブパス追加時の更新箇所 2箇所以内 | tsconfig paths + vitest alias の 2箇所（package.json exports も含めると 3箇所） | MINOR |
| 2   | Vitest alias 削減または維持        | 変更なし（維持）                                                                | PASS  |
| 3   | 既存 import 文の変更ゼロ           | 設計で明示的に「コード変更なし」を確認                                          | PASS  |
| 4   | P8（幽霊依存）の新規導入なし       | 新パッケージの追加なし                                                          | PASS  |

**3件 PASS、1件 MINOR**

### MINOR 指摘

サブパス追加時の更新箇所が実質 **3箇所**（`package.json exports` + `tsconfig paths` + `vitest alias`）になる。将来的に `vitest-tsconfig-paths` プラグイン導入で 2箇所に削減可能だが、本タスクのスコープ外として未タスク化する。

---

## 2. 技術的妥当性レビュー

### 6つのチェック観点

| #   | 観点                              | 確認事項                                                      | 判定 |
| --- | --------------------------------- | ------------------------------------------------------------- | ---- |
| 1   | paths マッピングの完全性          | 全24インポートパス（TS2307対象）が paths でカバーされているか | PASS |
| 2   | paths 定義順序の正当性            | 具体的パス → 汎用パスの順が正しく守られているか               | PASS |
| 3   | ソースファイルパスの正確性        | 各 paths のターゲットパスが実在するファイルを指しているか     | PASS |
| 4   | typesVersions と exports の整合性 | typesVersions の全エントリが exports のエントリと一致するか   | PASS |
| 5   | baseUrl との互換性                | `baseUrl: "."` が既に設定済みで paths の相対パスが正しいか    | PASS |
| 6   | moduleResolution との互換性       | `bundler` モードで paths が正しく解決されるか                 | PASS |

**全6件 PASS**

### paths マッピング完全性の詳細照合

Phase 1 の TS2307 インポートパス一覧（24パターン）と Phase 2 の paths マッピング（27エントリ）を照合:

| #   | TS2307 インポートパス                             | paths エントリ | ステータス |
| --- | ------------------------------------------------- | -------------- | ---------- |
| 1   | `@repo/shared`                                    | あり           | ✓          |
| 2   | `@repo/shared/types/llm/schemas`                  | あり           | ✓          |
| 3   | `@repo/shared/types/agent`                        | あり           | ✓          |
| 4   | `@repo/shared/types`                              | あり           | ✓          |
| 5   | `@repo/shared/types/skill`                        | あり           | ✓          |
| 6   | `@repo/shared/types/auth`                         | あり           | ✓          |
| 7   | `@repo/shared/types/api-keys`                     | あり           | ✓          |
| 8   | `@repo/shared/agent`                              | あり           | ✓          |
| 9   | `@repo/shared/infrastructure/auth`                | あり           | ✓          |
| 10  | `@repo/shared/types/llm`                          | あり           | ✓          |
| 11  | `@repo/shared/schemas`                            | あり           | ✓          |
| 12  | `@repo/shared/types/rag`                          | あり           | ✓          |
| 13  | `@repo/shared/types/auth-mode`                    | あり           | ✓          |
| 14  | `@repo/shared/services/logging/types`             | あり           | ✓          |
| 15  | `@repo/shared/services/history/types`             | あり           | ✓          |
| 16  | `@repo/shared/repositories`                       | あり           | ✓          |
| 17  | `@repo/shared/types/replace`                      | あり           | ✓          |
| 18  | `@repo/shared/types/rag/result`                   | あり           | ✓          |
| 19  | `@repo/shared/src/ipc/channels`                   | あり           | ✓          |
| 20  | `@repo/shared/services/logging/conversion-logger` | あり           | ✓          |
| 21  | `@repo/shared/services/history/history-service`   | あり           | ✓          |
| 22  | `@repo/shared/schemas/auth`                       | あり           | ✓          |
| 23  | `@repo/shared/infrastructure/ai/apiKeyValidator`  | あり           | ✓          |
| 24  | `@repo/shared/constants`                          | あり           | ✓          |

**全24パターンがカバー済み。** 追加の3エントリ（`core`, `infrastructure`, `infrastructure/database`）は exports に定義されているが現在 TS2307 として出ていないもの。予防的に追加。

---

## 3. リスク・Pitfall レビュー

| #   | リスク                                | 影響度 | 発生確率 | 対策状況                                          | 判定  |
| --- | ------------------------------------- | ------ | -------- | ------------------------------------------------- | ----- |
| 1   | P8: 幽霊依存の導入                    | 高     | 低       | 新パッケージ追加なし、paths はソース参照のみ      | OK    |
| 2   | P11: Prettier/ESLint による Edit 失敗 | 中     | 中       | 一括 Write で対応、hooks は JSON に適用されにくい | OK    |
| 3   | P40: テスト実行ディレクトリ依存       | 高     | 低       | Vitest 設定を変更しないため影響なし               | OK    |
| 4   | paths の漏れによるエラー残存          | 高     | 低       | 全24パターンを照合済み                            | OK    |
| 5   | dist/ 未生成時の typesVersions 無効   | 低     | 中       | typesVersions は補完目的、メイン対策は paths      | OK    |
| 6   | 将来のサブパス追加時の 3箇所更新      | 低     | 高       | MINOR 指摘として未タスク化                        | MINOR |

---

## 4. 最終判定

### 判定基準

| 判定  | 条件                                                                 |
| ----- | -------------------------------------------------------------------- |
| PASS  | 全ての要件を満たし、技術的問題がない                                 |
| MINOR | 軽微な改善点があるが、実装に影響しない。未タスク仕様書に変換して進行 |
| MAJOR | 要件未充足または技術的に重大な問題がある。Phase 1 または 2 へ戻る    |

### レビュー結果サマリー

| 観点         | 判定  | 詳細                                                       |
| ------------ | ----- | ---------------------------------------------------------- |
| 要件充足性   | PASS  | 全5定量的基準 + 3/4定性的基準を充足                        |
| 技術的妥当性 | PASS  | 全6チェック観点をクリア                                    |
| Pitfall 対策 | PASS  | 全6リスク項目に対策あり                                    |
| 保守性       | MINOR | サブパス追加時の更新箇所が3箇所（将来的に2箇所に削減可能） |

### 最終判定: **MINOR**

**指摘対応後 Phase 4 へ進行する。**

---

## 5. MINOR 指摘一覧と対応

| #   | 指摘内容                                                           | 対応方針                                                                                        |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 1   | サブパス追加時の更新箇所が 3箇所（exports + paths + vitest alias） | 未タスク仕様書 `UT-FIX-TS-VITEST-TSCONFIG-PATHS-001` を作成し、vitest-tsconfig-paths 導入を検討 |

### 未タスク化: UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

| 項目     | 値                                                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID       | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001                                                                                                                              |
| タイトル | vitest-tsconfig-paths プラグイン導入によるエイリアス二重管理の解消                                                                                               |
| 優先度   | 低                                                                                                                                                               |
| 概要     | `vitest-tsconfig-paths` プラグインを導入し、Vitest の resolve.alias を tsconfig paths から自動生成することで、サブパス追加時の更新箇所を 3箇所 → 2箇所に削減する |
| 前提     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 の完了                                                                                                                  |
| 見込み   | vitest.config.ts の resolve.alias セクションを大幅に簡素化（28エントリ → 3エントリ程度）                                                                         |

---

## 6. 次の Phase への移行条件

| 条件                                      | ステータス |
| ----------------------------------------- | ---------- |
| 要件充足性レビュー完了                    | ✓          |
| 技術的妥当性レビュー完了                  | ✓          |
| リスク・Pitfall レビュー完了              | ✓          |
| MINOR 指摘の未タスク化完了                | ✓          |
| レビュー判定: MINOR（指摘対応後 Phase 4） | ✓          |

**→ Phase 4: テスト作成 へ進行可能**
