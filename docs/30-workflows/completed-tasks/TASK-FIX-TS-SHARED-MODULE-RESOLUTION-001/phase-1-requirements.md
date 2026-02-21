# Phase 1: 要件定義 — TypeScript `@repo/shared` モジュール解決エラー 228件の根本解決

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 1 — 要件定義                             |
| 機能名 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 作成日 | 2026-02-20                               |
| Issue  | #837                                     |
| 分類   | バグ修正                                 |
| 優先度 | 高                                       |

---

## 目的

`pnpm typecheck`（`tsc --noEmit`）実行時に発生する `Cannot find module '@repo/shared'` 系エラー **228件** を **0件** にする。Vitest の既存テスト（`resolve.alias` で回避済み）を破壊せず、TypeScript コンパイラ（`tsc`）のモジュール解決を正しく機能させる。

---

## 実行タスク

- エラー分類・影響範囲の確定: 228件のエラーを分類し根本原因を特定
- サブパスエクスポート一覧化: `@repo/shared` の全エクスポートパスを棚卸し
- アプローチ比較・選択: 3つの解決策を比較し最適解を決定
- 受入基準の定義: 完了を判定する定量的な基準を確立

| #   | タスク名                   | 目的                                        |
| --- | -------------------------- | ------------------------------------------- |
| 1   | エラー分類・影響範囲の確定 | 228件のエラーを分類し根本原因を特定         |
| 2   | サブパスエクスポート一覧化 | `@repo/shared` の全エクスポートパスを棚卸し |
| 3   | アプローチ比較・選択       | 3つの解決策を比較し最適解を決定             |
| 4   | 受入基準の定義             | 完了を判定する定量的な基準を確立            |

---

## 参照資料

| 資料                                    | パス / URL                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| GitHub Issue                            | #837                                                                         |
| packages/shared/package.json            | `packages/shared/package.json`                                               |
| packages/shared/tsconfig.json           | `packages/shared/tsconfig.json`                                              |
| packages/shared/tsup.config.ts          | `packages/shared/tsup.config.ts`                                             |
| apps/desktop/tsconfig.json              | `apps/desktop/tsconfig.json`                                                 |
| apps/desktop/vitest.config.ts           | `apps/desktop/vitest.config.ts`                                              |
| プロジェクトルート tsconfig.json        | `tsconfig.json`                                                              |
| モノレポ要件                            | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` |
| TypeScript 技術基盤                     | `.claude/skills/aiworkflow-requirements/references/technology-core.md`       |
| 品質要件（alias/検証基準）              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| 既知の落とし穴 P8（幽霊依存）           | `.claude/rules/06-known-pitfalls.md#P8`                                      |
| 既知の落とし穴 P40（テスト実行Dir依存） | `.claude/rules/06-known-pitfalls.md#P40`                                     |
| アーキテクチャルール                    | `.claude/rules/01-architecture.md`                                           |

---

## 実行手順

### Task 1: エラー分類・影響範囲の確定

#### Step 1-1: 全エラーの取得

```bash
cd apps/desktop && pnpm typecheck 2>&1 | tee /tmp/typecheck-errors.txt
```

#### Step 1-2: エラーコード別集計

現時点の集計結果（2026-02-20 取得）:

| エラーコード | 件数    | 説明                                   | 根本/派生 |
| ------------ | ------- | -------------------------------------- | --------- |
| TS2307       | 169     | モジュールまたは型宣言が見つからない   | **根本**  |
| TS7006       | 30      | パラメータが暗黙的に 'any' 型を持つ    | 派生      |
| TS2339       | 20      | プロパティが型に存在しない             | 派生      |
| TS2358       | 5       | instanceof の左辺が不正な型            | 派生      |
| TS18046      | 2       | 型が 'unknown' のため使用不可          | 派生      |
| TS2353       | 1       | オブジェクトリテラルに未知のプロパティ | 派生      |
| TS2322       | 1       | 型の代入互換性エラー                   | 派生      |
| **合計**     | **228** |                                        |           |

**結論**: TS2307（169件）が根本原因。残り59件は全てモジュール解決失敗の派生エラー。TS2307 を解消すれば 228件全てが解消する見込み。

#### Step 1-3: TS2307 のインポートパス別内訳

| インポートパス                                    | 件数    |
| ------------------------------------------------- | ------- |
| `@repo/shared`（ルート）                          | 56      |
| `@repo/shared/types/llm/schemas`                  | 17      |
| `@repo/shared/types/agent`                        | 17      |
| `@repo/shared/types`                              | 15      |
| `@repo/shared/types/skill`                        | 13      |
| `@repo/shared/types/auth`                         | 13      |
| `@repo/shared/types/api-keys`                     | 5       |
| `@repo/shared/agent`                              | 5       |
| `@repo/shared/infrastructure/auth`                | 4       |
| `@repo/shared/types/llm`                          | 3       |
| `@repo/shared/schemas`                            | 3       |
| `@repo/shared/types/replace`                      | 2       |
| `@repo/shared/types/rag`                          | 2       |
| `@repo/shared/types/rag/result`                   | 2       |
| `@repo/shared/types/auth-mode`                    | 2       |
| `@repo/shared/constants`                          | 2       |
| `@repo/shared/repositories`                       | 2       |
| `@repo/shared/src/ipc/channels`                   | 2       |
| `@repo/shared/services/history/types`             | 1       |
| `@repo/shared/services/history/history-service`   | 1       |
| `@repo/shared/services/logging/types`             | 1       |
| `@repo/shared/services/logging/conversion-logger` | 1       |
| `@repo/shared/infrastructure/ai/apiKeyValidator`  | 1       |
| **合計**                                          | **169** |

**全169件が `@repo/shared` 関連**。他パッケージのモジュール解決エラーはゼロ。

#### Step 1-4: 根本原因の特定

| 原因                                         | 説明                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `typesVersions` 未設定                       | `package.json` に `typesVersions` フィールドがなく、TypeScript が `exports` マップの `types` 条件を解決できない |
| `dist/` ディレクトリ未生成                   | `packages/shared` のビルド出力 `dist/` が存在しない場合、`exports` の `types` パスが無効                        |
| `exports` パスの不整合                       | 一部エントリが `dist/types/` を指し、他が `dist/src/types/` を指す（ソース構造の二重性）                        |
| `apps/desktop/tsconfig.json` に paths 未設定 | `@repo/shared` への paths マッピングがない（`@renderer/*` と `@/*` のみ）                                       |

### Task 2: サブパスエクスポート一覧化

#### packages/shared/package.json の exports フィールド（29エントリ）

| #   | エクスポートパス                       | types パス                                           | ソースパス基点      |
| --- | -------------------------------------- | ---------------------------------------------------- | ------------------- |
| 1   | `.`                                    | `./dist/index.d.ts`                                  | `./`                |
| 2   | `./core`                               | `./dist/core/index.d.ts`                             | `core/`             |
| 3   | `./infrastructure`                     | `./dist/infrastructure/index.d.ts`                   | `infrastructure/`   |
| 4   | `./infrastructure/auth`                | `./dist/infrastructure/auth/index.d.ts`              | `infrastructure/`   |
| 5   | `./infrastructure/database`            | `./dist/infrastructure/database/index.d.ts`          | `infrastructure/`   |
| 6   | `./types`                              | `./dist/src/types/index.d.ts`                        | `src/types/`        |
| 7   | `./types/auth`                         | `./dist/types/auth.d.ts`                             | `types/`            |
| 8   | `./types/api-keys`                     | `./dist/types/api-keys.d.ts`                         | `types/`            |
| 9   | `./infrastructure/ai/apiKeyValidator`  | `./dist/infrastructure/ai/apiKeyValidator.d.ts`      | `infrastructure/`   |
| 10  | `./schemas`                            | `./dist/schemas/index.d.ts`                          | `schemas/`          |
| 11  | `./schemas/auth`                       | `./dist/schemas/auth.d.ts`                           | `schemas/`          |
| 12  | `./types/replace`                      | `./dist/src/types/replace.d.ts`                      | `src/types/`        |
| 13  | `./types/rag`                          | `./dist/src/types/rag/index.d.ts`                    | `src/types/`        |
| 14  | `./agent`                              | `./dist/src/agent/index.d.ts`                        | `src/agent/`        |
| 15  | `./types/llm/schemas`                  | `./dist/src/types/llm/schemas/index.d.ts`            | `src/types/`        |
| 16  | `./types/llm`                          | `./dist/src/types/llm/schemas/index.d.ts`            | `src/types/`        |
| 17  | `./types/skill`                        | `./dist/src/types/skill.d.ts`                        | `src/types/`        |
| 18  | `./services/history/types`             | `./dist/src/services/history/types.d.ts`             | `src/services/`     |
| 19  | `./services/history/history-service`   | `./dist/src/services/history/history-service.d.ts`   | `src/services/`     |
| 20  | `./types/rag/result`                   | `./dist/src/types/rag/result.d.ts`                   | `src/types/`        |
| 21  | `./services/logging/types`             | `./dist/src/services/logging/types.d.ts`             | `src/services/`     |
| 22  | `./services/logging/conversion-logger` | `./dist/src/services/logging/conversion-logger.d.ts` | `src/services/`     |
| 23  | `./types/agent`                        | `./dist/src/types/agent.d.ts`                        | `src/types/`        |
| 24  | `./repositories`                       | `./dist/src/repositories/index.d.ts`                 | `src/repositories/` |
| 25  | `./constants`                          | `./dist/src/constants/index.d.ts`                    | `src/constants/`    |
| 26  | `./src/ipc/channels`                   | `./dist/src/ipc/channels.d.ts`                       | `src/ipc/`          |
| 27  | `./types/auth-mode`                    | `./dist/src/types/auth-mode.d.ts`                    | `src/types/`        |

**不整合の検出**: ソースパス基点が `types/`（ルートレベル）と `src/types/`（src 配下）の2系統に分かれている。

- `./types/auth` → `dist/types/auth.d.ts`（ルートレベル `types/`）
- `./types` → `dist/src/types/index.d.ts`（`src/types/`）

#### tsup.config.ts のエントリーポイント（37個）

tsup は 37 個のエントリーポイントをビルドする。`exports` の 29 エントリとの差分は、tsup 側に追加エントリがあることを示す（`src/types/agent-execution.ts`、`src/slide/index.ts`、`src/claude-cli/index.ts`、`utils/index.ts` 等）。

### Task 3: アプローチ比較・選択

#### 3つのアプローチ比較表

| 観点                     | A: exports + typesVersions    | B: tsconfig paths 一括設定        | C: moduleResolution 調査・修正      |
| ------------------------ | ----------------------------- | --------------------------------- | ----------------------------------- |
| **変更範囲**             | `package.json` のみ           | `apps/desktop/tsconfig.json`      | 複数の tsconfig + package.json      |
| **対象ファイル数**       | 1                             | 1                                 | 3-5                                 |
| **dist/ ビルド依存**     | 必要（`dist/` に .d.ts 必須） | 不要（ソースを直接参照可能）      | 必要                                |
| **Vitest 互換性**        | 影響なし                      | 影響なし                          | 要検証                              |
| **将来の保守性**         | 高（npm 標準準拠）            | 中（新サブパス追加時に2箇所更新） | 高（標準準拠）                      |
| **他パッケージへの波及** | なし                          | `apps/desktop` のみ               | `apps/web`, `apps/backend` にも波及 |
| **Node.js 互換性**       | 高（exports は Node.js 標準） | TypeScript のみ                   | 高                                  |
| **実装の複雑性**         | 低                            | 低                                | 高（根本原因調査が必要）            |
| **既知の成功事例**       | 多数（npm エコシステム標準）  | モノレポでは一般的                | 事例少ない                          |

#### アプローチ選択基準

- **即効性**: B が最も簡単に適用できる（paths ワイルドカード `@repo/shared/*` でソースを直接参照）
- **標準準拠**: A が npm/Node.js 標準に最も近い
- **保守性**: A が最も高い（エクスポートパス追加時に package.json のみ更新）
- **リスク**: C は調査範囲が広く、根本原因が複合的な場合に解決が困難

#### 推奨: アプローチ B を主軸、A を補完

**理由**:

1. `dist/` が存在しない開発時にも型チェックが通る必要がある
2. モノレポ内パッケージ間の参照はソース直接参照が最も安定する
3. `paths` 設定は `apps/desktop/tsconfig.json` のみの変更で済む
4. `typesVersions` はビルド後の `dist/` に依存するため、CI/CD やクリーンビルド時に問題が発生するリスクがある
5. 将来的に A（`typesVersions`）を追加して外部パッケージ公開にも対応可能

**ただし**、`exports` + `typesVersions` の整合性も修正する（外部からの参照のため）。

### Task 4: 受入基準

#### 定量的基準

| #   | 基準                                                      | 計測方法           |
| --- | --------------------------------------------------------- | ------------------ | ----------------------- |
| 1   | `cd apps/desktop && pnpm typecheck` が **エラー 0件**     | `tsc --noEmit 2>&1 | grep -c "error TS"` = 0 |
| 2   | `cd apps/desktop && pnpm vitest run` が **全テスト PASS** | exit code 0        |
| 3   | `cd packages/shared && pnpm typecheck` が **エラー 0件**  | `tsc --noEmit 2>&1 | grep -c "error TS"` = 0 |
| 4   | `pnpm --filter @repo/shared build` が **成功**            | exit code 0        |
| 5   | `pnpm lint` が **PASS**                                   | exit code 0        |

#### 定性的基準

| #   | 基準                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | `@repo/shared` の新しいサブパス追加時に更新が必要なファイルが **2箇所以内** |
| 2   | Vitest の `resolve.alias` が **削減または維持**（増加しない）               |
| 3   | 既存の `import` 文を **変更しない**（apps/desktop 側のコード変更ゼロ）      |
| 4   | P8（幽霊依存）に該当する新たな依存関係を **導入しない**                     |

---

## 統合テスト連携

| 連携観点         | 内容                                                                                                                       | 参照先                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 型解決の統合確認 | `pnpm --filter @repo/shared build` → `pnpm typecheck` → `pnpm --filter @repo/desktop exec vitest run` を同一手順で確認する | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| モノレポ依存整合 | `workspace:*` 利用箇所と `@repo/shared` 参照ルールの整合を確認する                                                         | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` |
| TS 設定整合      | `moduleResolution: bundler` 前提で `paths`/`exports` の整合を確認する                                                      | `.claude/skills/aiworkflow-requirements/references/technology-core.md`       |

---

## 成果物

| #   | 成果物             | パス                                                                                           |
| --- | ------------------ | ---------------------------------------------------------------------------------------------- |
| 1   | Phase 1 要件定義書 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-1-requirements.md`（本文書） |

---

## 完了条件

- [ ] 228件のエラーをエラーコード別に分類し、根本原因（TS2307: 169件）と派生エラー（59件）を特定した
- [ ] `@repo/shared` の全29サブパスエクスポートを一覧化し、パス不整合（`dist/types/` vs `dist/src/types/`）を検出した
- [ ] 3つのアプローチ（A/B/C）を比較表で評価し、アプローチ B（paths 一括設定）+ A 補完を推奨として選択した
- [ ] 定量的受入基準（typecheck 0件、テスト全 PASS、ビルド成功、lint PASS）を定義した
- [ ] 定性的受入基準（保守性、Vitest 互換性、コード変更ゼロ）を定義した

---

## 次のPhase

→ **Phase 2: 設計**（`phase-2-design.md`）
