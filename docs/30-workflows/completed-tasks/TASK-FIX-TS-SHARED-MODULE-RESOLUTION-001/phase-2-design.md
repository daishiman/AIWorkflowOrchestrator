# Phase 2: 設計 — TypeScript `@repo/shared` モジュール解決エラー 228件の根本解決

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 2 — 設計                                 |
| 機能名 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 作成日 | 2026-02-20                               |
| Issue  | #837                                     |

---

## 目的

Phase 1 で選択した **アプローチ B（tsconfig paths 一括設定）+ A 補完（exports 整合性修正）** の詳細設計を行い、具体的な設定ファイルの差分と実装手順を確定する。

---

## 実行タスク

- tsconfig paths マッピングの設計: 全29サブパスに対応する paths 定義を設計
- Vitest alias との統合設計: paths と resolve.alias の二重管理を解消する設計
- package.json exports 整合性修正の設計: `dist/types/` と `dist/src/types/` の不整合解消を設計
- ビルドパイプラインへの影響評価: tsup ビルドとの整合性を確認

| #   | タスク名                              | 目的                                                |
| --- | ------------------------------------- | --------------------------------------------------- |
| 1   | tsconfig paths マッピングの設計       | 全29サブパスに対応する paths 定義を設計             |
| 2   | Vitest alias との統合設計             | paths と resolve.alias の二重管理を解消する設計     |
| 3   | package.json exports 整合性修正の設計 | `dist/types/` vs `dist/src/types/` 不整合の解消設計 |
| 4   | ビルドパイプラインへの影響評価        | tsup ビルドとの整合性を確認                         |

---

## 参照資料

| 資料                                    | パス                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| Phase 1 要件定義書                      | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-1-requirements.md` |
| packages/shared/package.json            | `packages/shared/package.json`                                                       |
| packages/shared/tsconfig.json           | `packages/shared/tsconfig.json`                                                      |
| packages/shared/tsup.config.ts          | `packages/shared/tsup.config.ts`                                                     |
| apps/desktop/tsconfig.json              | `apps/desktop/tsconfig.json`                                                         |
| apps/desktop/vitest.config.ts           | `apps/desktop/vitest.config.ts`                                                      |
| モノレポ要件                            | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`         |
| TypeScript 技術基盤                     | `.claude/skills/aiworkflow-requirements/references/technology-core.md`               |
| 品質要件（alias運用）                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          |
| 既知の落とし穴 P8（幽霊依存）           | `.claude/rules/06-known-pitfalls.md#P8`                                              |
| 既知の落とし穴 P40（テスト実行Dir依存） | `.claude/rules/06-known-pitfalls.md#P40`                                             |

---

## 実行手順

### Task 1: tsconfig paths マッピングの設計

#### 設計方針

`apps/desktop/tsconfig.json` に `@repo/shared` および全サブパスの paths マッピングを追加し、TypeScript コンパイラがソースファイルを直接参照できるようにする。

#### paths マッピング設計

`baseUrl: "."` が既に設定済みのため、相対パスでマッピングを定義する。

**重要**: paths のマッピングは**具体的なパスから汎用的なパスの順**で定義する（TypeScript は最初にマッチしたパスを使用するため）。

```jsonc
// apps/desktop/tsconfig.json の paths に追加
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // 既存のマッピング
      "@renderer/*": ["src/renderer/*"],
      "@/*": ["src/*"],

      // --- @repo/shared サブパスマッピング（具体的→汎用の順） ---

      // infrastructure 系（最も深いパスから）
      "@repo/shared/infrastructure/ai/apiKeyValidator": [
        "../../packages/shared/infrastructure/ai/apiKeyValidator.ts",
      ],
      "@repo/shared/infrastructure/auth": [
        "../../packages/shared/infrastructure/auth/index.ts",
      ],
      "@repo/shared/infrastructure/database": [
        "../../packages/shared/infrastructure/database/index.ts",
      ],
      "@repo/shared/infrastructure": [
        "../../packages/shared/infrastructure/index.ts",
      ],

      // services 系
      "@repo/shared/services/history/history-service": [
        "../../packages/shared/src/services/history/history-service.ts",
      ],
      "@repo/shared/services/history/types": [
        "../../packages/shared/src/services/history/types.ts",
      ],
      "@repo/shared/services/logging/conversion-logger": [
        "../../packages/shared/src/services/logging/conversion-logger.ts",
      ],
      "@repo/shared/services/logging/types": [
        "../../packages/shared/src/services/logging/types.ts",
      ],

      // types 系（最も深いパスから）
      "@repo/shared/types/llm/schemas": [
        "../../packages/shared/src/types/llm/schemas/index.ts",
      ],
      "@repo/shared/types/llm": [
        "../../packages/shared/src/types/llm/schemas/index.ts",
      ],
      "@repo/shared/types/rag/result": [
        "../../packages/shared/src/types/rag/result.ts",
      ],
      "@repo/shared/types/rag": [
        "../../packages/shared/src/types/rag/index.ts",
      ],
      "@repo/shared/types/auth": ["../../packages/shared/types/auth.ts"],
      "@repo/shared/types/auth-mode": [
        "../../packages/shared/src/types/auth-mode.ts",
      ],
      "@repo/shared/types/api-keys": [
        "../../packages/shared/types/api-keys.ts",
      ],
      "@repo/shared/types/agent": ["../../packages/shared/src/types/agent.ts"],
      "@repo/shared/types/skill": ["../../packages/shared/src/types/skill.ts"],
      "@repo/shared/types/replace": [
        "../../packages/shared/src/types/replace.ts",
      ],
      "@repo/shared/types": ["../../packages/shared/src/types/index.ts"],

      // schemas 系
      "@repo/shared/schemas/auth": ["../../packages/shared/schemas/auth.ts"],
      "@repo/shared/schemas": ["../../packages/shared/schemas/index.ts"],

      // agent, repositories, constants, ipc, core
      "@repo/shared/agent": ["../../packages/shared/src/agent/index.ts"],
      "@repo/shared/repositories": [
        "../../packages/shared/src/repositories/index.ts",
      ],
      "@repo/shared/constants": [
        "../../packages/shared/src/constants/index.ts",
      ],
      "@repo/shared/src/ipc/channels": [
        "../../packages/shared/src/ipc/channels.ts",
      ],
      "@repo/shared/core": ["../../packages/shared/core/index.ts"],

      // ルートエクスポート（最後に配置）
      "@repo/shared": ["../../packages/shared/index.ts"],
    },
  },
}
```

#### パスマッピングの対応表

| #   | エクスポートパス                                  | paths ソースパス                                                  | 備考                        |
| --- | ------------------------------------------------- | ----------------------------------------------------------------- | --------------------------- |
| 1   | `@repo/shared`                                    | `../../packages/shared/index.ts`                                  | ルート（最後に配置）        |
| 2   | `@repo/shared/core`                               | `../../packages/shared/core/index.ts`                             |                             |
| 3   | `@repo/shared/infrastructure`                     | `../../packages/shared/infrastructure/index.ts`                   |                             |
| 4   | `@repo/shared/infrastructure/auth`                | `../../packages/shared/infrastructure/auth/index.ts`              |                             |
| 5   | `@repo/shared/infrastructure/database`            | `../../packages/shared/infrastructure/database/index.ts`          |                             |
| 6   | `@repo/shared/types`                              | `../../packages/shared/src/types/index.ts`                        | src/ 配下                   |
| 7   | `@repo/shared/types/auth`                         | `../../packages/shared/types/auth.ts`                             | ルートレベル types/         |
| 8   | `@repo/shared/types/api-keys`                     | `../../packages/shared/types/api-keys.ts`                         | ルートレベル types/         |
| 9   | `@repo/shared/infrastructure/ai/apiKeyValidator`  | `../../packages/shared/infrastructure/ai/apiKeyValidator.ts`      |                             |
| 10  | `@repo/shared/schemas`                            | `../../packages/shared/schemas/index.ts`                          |                             |
| 11  | `@repo/shared/schemas/auth`                       | `../../packages/shared/schemas/auth.ts`                           |                             |
| 12  | `@repo/shared/types/replace`                      | `../../packages/shared/src/types/replace.ts`                      | src/ 配下                   |
| 13  | `@repo/shared/types/rag`                          | `../../packages/shared/src/types/rag/index.ts`                    | src/ 配下                   |
| 14  | `@repo/shared/agent`                              | `../../packages/shared/src/agent/index.ts`                        | src/ 配下                   |
| 15  | `@repo/shared/types/llm/schemas`                  | `../../packages/shared/src/types/llm/schemas/index.ts`            | src/ 配下                   |
| 16  | `@repo/shared/types/llm`                          | `../../packages/shared/src/types/llm/schemas/index.ts`            | llm と llm/schemas は同一先 |
| 17  | `@repo/shared/types/skill`                        | `../../packages/shared/src/types/skill.ts`                        | src/ 配下                   |
| 18  | `@repo/shared/services/history/types`             | `../../packages/shared/src/services/history/types.ts`             | src/ 配下                   |
| 19  | `@repo/shared/services/history/history-service`   | `../../packages/shared/src/services/history/history-service.ts`   | src/ 配下                   |
| 20  | `@repo/shared/types/rag/result`                   | `../../packages/shared/src/types/rag/result.ts`                   | src/ 配下                   |
| 21  | `@repo/shared/services/logging/types`             | `../../packages/shared/src/services/logging/types.ts`             | src/ 配下                   |
| 22  | `@repo/shared/services/logging/conversion-logger` | `../../packages/shared/src/services/logging/conversion-logger.ts` | src/ 配下                   |
| 23  | `@repo/shared/types/agent`                        | `../../packages/shared/src/types/agent.ts`                        | src/ 配下                   |
| 24  | `@repo/shared/repositories`                       | `../../packages/shared/src/repositories/index.ts`                 | src/ 配下                   |
| 25  | `@repo/shared/constants`                          | `../../packages/shared/src/constants/index.ts`                    | src/ 配下                   |
| 26  | `@repo/shared/src/ipc/channels`                   | `../../packages/shared/src/ipc/channels.ts`                       | src/ プレフィックス付き     |
| 27  | `@repo/shared/types/auth-mode`                    | `../../packages/shared/src/types/auth-mode.ts`                    | src/ 配下                   |

### Task 2: Vitest alias との統合設計

#### 現状分析

`apps/desktop/vitest.config.ts` に 28 個の `resolve.alias` が定義済み。これらは Vitest のテスト実行時にモジュール解決を行う。

#### 統合方針

**Vitest の `resolve.alias` は維持する**（変更しない）。

理由:

1. Vitest は `tsconfig.json` の `paths` を**自動的には読み取らない**（`vitest-tsconfig-paths` プラグインが必要）
2. 既存の alias は安定稼働しており、変更リスクが不要
3. P40（テスト実行ディレクトリ依存）の教訓から、テスト設定は慎重に変更すべき

#### 将来的な改善（スコープ外）

将来的に `vitest-tsconfig-paths` プラグインを導入し、tsconfig の paths から自動生成することで二重管理を解消可能。ただし本タスクのスコープ外。

#### Vitest alias と tsconfig paths の整合性検証

実装後に以下を確認する:

```bash
# tsconfig paths で TypeScript が解決できること
cd apps/desktop && pnpm typecheck

# Vitest alias でテストが通ること
cd apps/desktop && pnpm vitest run
```

両方が同一のソースファイルを参照することを、マッピングテーブルの照合で事前検証する。

### Task 3: package.json exports 整合性修正の設計

#### 不整合の分析

現在の `exports` フィールドには、ソース構造の二重性に起因するパスの不整合がある:

| パターン                   | 例             | dist パス                   |
| -------------------------- | -------------- | --------------------------- |
| パターン A（ルートレベル） | `./types/auth` | `dist/types/auth.d.ts`      |
| パターン B（src 配下）     | `./types`      | `dist/src/types/index.d.ts` |

これは `packages/shared` のソース構造が以下の2系統に分かれていることに起因する:

- `types/auth.ts`（ルートレベル）→ tsup で `dist/types/auth.js` にビルド
- `src/types/index.ts`（src 配下）→ tsup で `dist/src/types/index.js` にビルド

#### 修正方針

**exports フィールドは現状のまま維持する**。

理由:

1. tsup のエントリーポイントがソースの実パスに基づいてビルドするため、`exports` のパスは tsup の出力構造に合わせる必要がある
2. `exports` を変更すると tsup の設定も変更する必要があり、変更範囲が拡大する
3. TypeScript 側は `paths` でソースを直接参照するため、`exports` の不整合は `tsc` には影響しない

#### typesVersions の追加（補完）

外部からの参照（npm パッケージとして利用する場合）のために `typesVersions` を追加する。ただし、モノレポ内の開発時は `paths` が優先される。

```jsonc
// packages/shared/package.json に追加
{
  "typesVersions": {
    "*": {
      "core": ["./dist/core/index.d.ts"],
      "infrastructure": ["./dist/infrastructure/index.d.ts"],
      "infrastructure/auth": ["./dist/infrastructure/auth/index.d.ts"],
      "infrastructure/database": ["./dist/infrastructure/database/index.d.ts"],
      "infrastructure/ai/apiKeyValidator": [
        "./dist/infrastructure/ai/apiKeyValidator.d.ts",
      ],
      "types": ["./dist/src/types/index.d.ts"],
      "types/auth": ["./dist/types/auth.d.ts"],
      "types/api-keys": ["./dist/types/api-keys.d.ts"],
      "types/replace": ["./dist/src/types/replace.d.ts"],
      "types/rag": ["./dist/src/types/rag/index.d.ts"],
      "types/rag/result": ["./dist/src/types/rag/result.d.ts"],
      "types/llm/schemas": ["./dist/src/types/llm/schemas/index.d.ts"],
      "types/llm": ["./dist/src/types/llm/schemas/index.d.ts"],
      "types/skill": ["./dist/src/types/skill.d.ts"],
      "types/agent": ["./dist/src/types/agent.d.ts"],
      "types/auth-mode": ["./dist/src/types/auth-mode.d.ts"],
      "agent": ["./dist/src/agent/index.d.ts"],
      "schemas": ["./dist/schemas/index.d.ts"],
      "schemas/auth": ["./dist/schemas/auth.d.ts"],
      "services/history/types": ["./dist/src/services/history/types.d.ts"],
      "services/history/history-service": [
        "./dist/src/services/history/history-service.d.ts",
      ],
      "services/logging/types": ["./dist/src/services/logging/types.d.ts"],
      "services/logging/conversion-logger": [
        "./dist/src/services/logging/conversion-logger.d.ts",
      ],
      "repositories": ["./dist/src/repositories/index.d.ts"],
      "constants": ["./dist/src/constants/index.d.ts"],
      "src/ipc/channels": ["./dist/src/ipc/channels.d.ts"],
    },
  },
}
```

**注意**: `typesVersions` のキーには `@repo/shared/` プレフィックスを含めない。TypeScript は自動的にパッケージ名を除いたサブパスとマッチングする。

### Task 4: ビルドパイプラインへの影響評価

#### 変更対象ファイル一覧

| #   | ファイル                       | 変更内容                       | リスク |
| --- | ------------------------------ | ------------------------------ | ------ |
| 1   | `apps/desktop/tsconfig.json`   | `paths` に 27 エントリ追加     | 低     |
| 2   | `packages/shared/package.json` | `typesVersions` フィールド追加 | 低     |

#### 変更しないファイル

| ファイル                         | 理由                                          |
| -------------------------------- | --------------------------------------------- |
| `apps/desktop/vitest.config.ts`  | 既存の alias が安定稼働中、変更不要           |
| `packages/shared/tsconfig.json`  | shared パッケージ自体の型チェックには影響なし |
| `packages/shared/tsup.config.ts` | ビルド設定の変更は不要                        |
| `tsconfig.json`（ルート）        | project references 構成は変更不要             |
| `apps/desktop/src/**/*.ts`       | import 文の変更は不要（受入基準）             |

#### 既知の Pitfall への対策

| Pitfall | 内容                               | 対策                                                     |
| ------- | ---------------------------------- | -------------------------------------------------------- |
| P8      | 幽霊依存                           | 新たな依存パッケージは追加しない。paths はソース参照のみ |
| P40     | テスト実行ディレクトリ依存         | Vitest 設定を変更しないため影響なし                      |
| P11     | PostToolUse フックによる Edit 失敗 | 大量の paths 追加は一括 Write で実施                     |

#### 実装順序

```
Step 1: apps/desktop/tsconfig.json に paths マッピングを追加
Step 2: packages/shared/package.json に typesVersions を追加
Step 3: typecheck を実行してエラー 0件を確認
Step 4: vitest run を実行して全テスト PASS を確認
Step 5: pnpm --filter @repo/shared build を実行してビルド成功を確認
Step 6: pnpm lint を実行して PASS を確認
```

---

## アーキテクチャ層別設計

### モジュール解決のフロー（変更後）

```
┌──────────────────────────────────────────────────────────┐
│                    apps/desktop                          │
│                                                          │
│  import { Foo } from "@repo/shared/types/agent"          │
│                        │                                 │
│          ┌─────────────┼─────────────┐                   │
│          │             │             │                   │
│     [TypeScript]  [Vitest]    [Runtime/Electron]         │
│          │             │             │                   │
│   tsconfig paths  resolve.alias  package.json exports    │
│          │             │             │                   │
│          ▼             ▼             ▼                   │
│   ソースファイル   ソースファイル  dist/ ビルド出力      │
│   (.ts 直接参照)  (.ts 直接参照) (.js + .d.ts)          │
│                                                          │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  packages/shared                         │
│                                                          │
│  ../../packages/shared/src/types/agent.ts                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**3つのモジュール解決パス**:

1. **TypeScript（tsc）**: `tsconfig.json` の `paths` → ソース `.ts` ファイルを直接参照
2. **Vitest**: `vitest.config.ts` の `resolve.alias` → ソース `.ts` ファイルを直接参照
3. **Runtime（Electron）**: `package.json` の `exports` → `dist/` のビルド出力を参照

---

## 統合テスト連携

| 連携観点                 | 内容                                                                                     | 参照先                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| モジュール解決の三面検証 | TypeScript (`paths`)、Vitest (`alias`)、Runtime (`exports`) を同時に満たす設計か確認する | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` |
| TS コンパイル前提の明示  | `moduleResolution: bundler` を前提に設計していることを確認する                           | `.claude/skills/aiworkflow-requirements/references/technology-core.md`       |
| alias運用の継続性        | `@repo/shared` サブパス追加時の運用ルールを設計に取り込む                                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

---

## 成果物

| #   | 成果物         | パス                                                                                     |
| --- | -------------- | ---------------------------------------------------------------------------------------- |
| 1   | Phase 2 設計書 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-2-design.md`（本文書） |

---

## 完了条件

- [ ] 全29サブパスエクスポートに対応する `tsconfig paths` マッピングを設計した
- [ ] paths の定義順序（具体的→汎用）を確定した
- [ ] Vitest alias との統合方針（既存維持）を決定し、理由を文書化した
- [ ] `package.json` の `exports` 不整合の分析と `typesVersions` 追加設計を完了した
- [ ] 変更対象ファイル（2ファイル）と変更しないファイルを明確に区別した
- [ ] 既知の Pitfall（P8, P11, P40）への対策を設計に組み込んだ
- [ ] 実装順序（Step 1-6）を確定した
- [ ] モジュール解決の 3 つのパス（tsc / Vitest / Runtime）のアーキテクチャ図を作成した

---

## 次のPhase

→ **Phase 3: 設計レビュー**（`phase-3-design-review.md`）
