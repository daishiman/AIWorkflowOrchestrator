# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 5                                        |
| 機能名 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 作成日 | 2026-02-20                               |

## 目的

`packages/shared/package.json` の `exports` フィールドと TypeScript モジュール解決の不整合を修正し、`pnpm typecheck` のエラー 228 件を 0 件にする。Phase 4 で作成した Red テストを Green 状態にする。

## 実行タスク

- `package.json` exports パスの正規化: `dist/types/` と `dist/src/types/` の混在を解消する
- `typesVersions` フィールド追加（アプローチ A 選択時）: TypeScript がビルド前のソースファイルを直接解決できるようにする
- `tsconfig.json` paths 追加（アプローチ B 選択時）: ワイルドカード paths で全サブパスを一括解決する
- Vitest alias 整理: `typesVersions` または `paths` 導入後、冗長な alias を削減する
- 全テスト Green 確認: Phase 4 テストおよび既存テストの全 PASS を確認する

## 参照資料

| 資料名                   | パス                                                                                  | 説明                                        |
| ------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 4 テスト仕様       | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-4-test-creation.md` | テストケース設計                            |
| ベースラインエラー記録   | `outputs/phase-4/typecheck-baseline.md`                                               | 修正前エラー件数                            |
| shared package.json      | `packages/shared/package.json`                                                        | 修正対象: exports フィールド                |
| shared tsconfig.json     | `packages/shared/tsconfig.json`                                                       | 修正対象: TypeScript 設定                   |
| desktop tsconfig.json    | `apps/desktop/tsconfig.json`                                                          | 修正対象: paths 設定（アプローチ B の場合） |
| desktop vitest.config.ts | `apps/desktop/vitest.config.ts`                                                       | 修正対象: resolve.alias 整理                |
| shared tsup.config.ts    | `packages/shared/tsup.config.ts`                                                      | ビルド設定（エントリポイント確認用）        |
| モノレポ要件             | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`          | workspace依存と公開境界                     |
| 開発ガイドライン         | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`         | 実装時チェックリスト                        |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`           | typecheck/alias 運用基準                    |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                  | P8, P40 対策                                |

## 実行手順

### ステップ 1: 修正アプローチの選択と適用

Phase 2 設計書で選択されたアプローチに基づき実装する。以下に各アプローチの具体的な修正手順を記載する。

#### アプローチ A（推奨）: `exports` + `typesVersions` による正規化

##### 1-A-1. exports パスの不整合修正

`packages/shared/package.json` の `exports` フィールドで、`dist/types/` と `dist/src/types/` が混在しているパスを統一する。

**修正対象**: 以下のサブパスで `types` パスが `dist/types/` を参照しているが、対応するソースが `src/types/` に存在しないものを修正する。

```diff
# packages/shared/package.json の exports フィールド修正例

# ケース1: ルート types/ のソースを参照するサブパス（そのまま維持）
"./types/auth": {
  "types": "./dist/types/auth.d.ts",
  "import": "./dist/types/auth.js"
}

# ケース2: src/types/ のソースを参照するサブパス（パス統一）
"./types": {
  "types": "./dist/src/types/index.d.ts",
  "import": "./dist/src/types/index.js"
}
```

**確認ポイント**: 各 exports サブパスの `types` パスが、対応する `tsup.config.ts` エントリの出力先と一致すること。

##### 1-A-2. `typesVersions` フィールドの追加

`package.json` に `typesVersions` を追加し、TypeScript がビルド済み `dist/` ではなくソースファイルを直接参照できるようにする。

```diff
# packages/shared/package.json に追加

+ "typesVersions": {
+   "*": {
+     "core": ["core/index.ts"],
+     "infrastructure": ["infrastructure/index.ts"],
+     "infrastructure/auth": ["infrastructure/auth/index.ts"],
+     "infrastructure/database": ["infrastructure/database/index.ts"],
+     "infrastructure/ai/apiKeyValidator": ["infrastructure/ai/apiKeyValidator.ts"],
+     "types": ["src/types/index.ts"],
+     "types/auth": ["types/auth.ts"],
+     "types/api-keys": ["types/api-keys.ts"],
+     "types/replace": ["src/types/replace.ts"],
+     "types/rag": ["src/types/rag/index.ts"],
+     "types/rag/result": ["src/types/rag/result.ts"],
+     "types/llm": ["src/types/llm/schemas/index.ts"],
+     "types/llm/schemas": ["src/types/llm/schemas/index.ts"],
+     "types/skill": ["src/types/skill.ts"],
+     "types/agent": ["src/types/agent.ts"],
+     "types/auth-mode": ["src/types/auth-mode.ts"],
+     "agent": ["src/agent/index.ts"],
+     "schemas": ["schemas/index.ts"],
+     "schemas/auth": ["schemas/auth.ts"],
+     "constants": ["src/constants/index.ts"],
+     "repositories": ["src/repositories/index.ts"],
+     "src/ipc/channels": ["src/ipc/channels.ts"],
+     "services/history/types": ["src/services/history/types.ts"],
+     "services/history/history-service": ["src/services/history/history-service.ts"],
+     "services/logging/types": ["src/services/logging/types.ts"],
+     "services/logging/conversion-logger": ["src/services/logging/conversion-logger.ts"]
+   }
+ }
```

**注意**: `typesVersions` のキーにはパッケージ名プレフィックス (`@repo/shared/`) を含めない。TypeScript がパッケージ解決後のサブパスとマッチングする。

#### アプローチ B（代替）: `tsconfig.json` の `paths` ワイルドカード

##### 1-B-1. desktop tsconfig.json に paths 追加

```diff
# apps/desktop/tsconfig.json

  "compilerOptions": {
+   "baseUrl": ".",
    "paths": {
      "@renderer/*": ["src/renderer/*"],
-     "@/*": ["src/*"]
+     "@/*": ["src/*"],
+     "@repo/shared": ["../../packages/shared/index.ts"],
+     "@repo/shared/*": ["../../packages/shared/*", "../../packages/shared/src/*"]
    }
  }
```

**注意**: ワイルドカード `*` は最初にマッチしたパスを使用する。`packages/shared/*` を先に指定することで、ルートレベルのファイル（`types/auth.ts`）が優先解決される。`src/*` は `src/types/index.ts` 等のフォールバック。

#### アプローチ C（代替）: `moduleResolution: "bundler"` で exports 直接解決

##### 1-C-1. exports パスの修正のみ

`moduleResolution: "bundler"` は `exports` フィールドを直接参照するため、exports の `types` パスがビルド済みファイルを正しく指していれば解決する。ただし、ビルド前（`dist/` 未生成時）には解決できないため、`pnpm --filter @repo/shared build` を先行実行する必要がある。

```bash
# ビルド実行（dist/ 生成）
pnpm --filter @repo/shared build

# typecheck 実行
pnpm typecheck
```

### ステップ 2: Vitest alias の整理

修正後、冗長な Vitest alias を削減する。

#### 2-1. 不要になる alias の特定

`typesVersions`（アプローチ A）または `paths`（アプローチ B）の導入により、以下の alias が不要になる可能性がある:

```typescript
// apps/desktop/vitest.config.ts の resolve.alias から削減候補

// TypeScript 型解決は typesVersions/paths で対応するため、
// Vitest ランタイム用にはソースファイルへの直接参照を維持する。
// ただし、@repo/shared パッケージのエントリポイントは alias 必須。
```

#### 2-2. alias 削減の判断基準

| 判断基準                          | alias 維持 | alias 削除可能                     |
| --------------------------------- | ---------- | ---------------------------------- |
| Vitest ランタイムでの import 解決 | 必要       | -                                  |
| TypeScript 型チェックのみ         | -          | 可能（typesVersions/paths で解決） |
| ソースファイルへの直接参照        | 必要       | -                                  |

**重要**: Vitest の `resolve.alias` は TypeScript の型解決とは別にランタイムのモジュール解決を行う。typecheck エラーが解消しても Vitest の alias を安易に削除するとテスト実行時のモジュール解決が壊れるため、段階的に検証する。

#### 2-3. 段階的 alias 削減手順

1. **Phase 5 では alias を維持**: まず typecheck エラー 0 件を達成する
2. **alias 削減は Phase 8（リファクタリング）で実施**: 安全に削減可能な alias を特定し、テスト実行で検証しながら削減する

### ステップ 3: typecheck 検証

```bash
# shared パッケージのビルド（exports の dist パス解決に必要）
pnpm --filter @repo/shared build

# ルートからの typecheck
pnpm typecheck

# desktop 単体の typecheck
cd apps/desktop && pnpm typecheck

# エラー件数の確認
pnpm typecheck 2>&1 | grep "error TS" | wc -l
```

期待結果: `Cannot find module '@repo/shared'` 系エラー **0 件**

### ステップ 4: Phase 4 テストの Green 確認

```bash
# packages/shared のテスト
cd packages/shared && pnpm vitest run src/__tests__/module-resolution.test.ts

# apps/desktop のテスト（P40 対策: 対象ディレクトリで実行）
cd apps/desktop && pnpm vitest run src/__tests__/shared-module-resolution.test.ts
cd apps/desktop && pnpm vitest run src/__tests__/vitest-alias-consistency.test.ts
```

期待結果: 全テスト **PASS**（Green 状態）

### ステップ 5: 既存テストの回帰確認

```bash
# desktop 全テスト実行
cd apps/desktop && pnpm vitest run

# shared 全テスト実行
cd packages/shared && pnpm vitest run
```

期待結果: 既存テスト全 **PASS**（回帰なし）

### ステップ 6: 設計変更記録（該当する場合）

実装中に Phase 2 設計書から乖離した場合、変更内容と理由を記録する。

## 統合テスト連携【必須】

| 実装項目                  | 内容                                                                              |
| ------------------------- | --------------------------------------------------------------------------------- |
| TypeScript モジュール解決 | `pnpm typecheck` でエラー 0 件（全パッケージ横断）                                |
| Vitest ランタイム解決     | `cd apps/desktop && pnpm vitest run` で全テスト PASS                              |
| shared パッケージビルド   | `pnpm --filter @repo/shared build` が成功し、dist/ に期待するファイルが出力される |
| Vitest alias との無矛盾   | alias 変更後もテスト実行結果に変化がないこと                                      |

## アーキテクチャ層別実装

| 層                | 修正観点                                              | 修正ファイル                    |
| ----------------- | ----------------------------------------------------- | ------------------------------- |
| Shared パッケージ | `package.json` exports/typesVersions 修正             | `packages/shared/package.json`  |
| Shared パッケージ | `tsconfig.json` 設定調整（該当する場合）              | `packages/shared/tsconfig.json` |
| Desktop アプリ    | `tsconfig.json` paths 追加（アプローチ B の場合）     | `apps/desktop/tsconfig.json`    |
| Desktop アプリ    | Vitest alias 整理（Phase 8 で実施、Phase 5 では維持） | `apps/desktop/vitest.config.ts` |

## 実装時の注意事項（既知の Pitfall 対策）

| Pitfall ID | 注意事項                           | 対策                                                                            |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| P8         | 幽霊依存                           | `@repo/shared` の依存は各パッケージの `package.json` に宣言されていることを確認 |
| P11        | PostToolUse フックによる Edit 失敗 | Prettier/ESLint の自動修正後に `git diff --stat` で変更数を検証                 |
| P32        | 型定義の二箇所同時更新             | `package.json` の exports と `typesVersions` の両方が整合していることを検証     |
| P40        | テスト実行ディレクトリ依存         | テスト実行は `cd apps/desktop && pnpm vitest run` で行う                        |

## 設計変更記録

実装中に設計変更が発生した場合、以下に記録する:

| 変更対象ファイル | 変更内容         | 変更理由         |
| ---------------- | ---------------- | ---------------- |
| （実装時に記入） | （実装時に記入） | （実装時に記入） |

- [ ] 乖離内容と理由を `outputs/phase-5/design-changes.md` に記録（該当する場合）
- [ ] Phase 2 設計書への影響を評価し、Phase 10 レビューで検証できるようにする（該当する場合）

## 成果物

| 成果物                 | パス                                                | 説明                                        |
| ---------------------- | --------------------------------------------------- | ------------------------------------------- |
| 修正済 package.json    | `packages/shared/package.json`                      | exports/typesVersions が修正された設定      |
| 修正済 tsconfig.json   | `apps/desktop/tsconfig.json`（アプローチ B の場合） | paths が追加された設定                      |
| typecheck 結果レポート | `outputs/phase-5/typecheck-result.md`               | 修正後の typecheck エラー件数（0 件を確認） |
| テスト実行結果         | `outputs/phase-5/test-result.md`                    | Phase 4 テスト + 既存テストの全 PASS 確認   |
| 設計変更記録           | `outputs/phase-5/design-changes.md`（該当する場合） | Phase 2 設計からの乖離記録                  |

## 完了条件

- [ ] `pnpm typecheck` のエラーが 0 件である（`Cannot find module '@repo/shared'` 系が全て解消）
- [ ] `cd apps/desktop && pnpm vitest run` で全テストが PASS する
- [ ] `cd packages/shared && pnpm vitest run` で全テストが PASS する
- [ ] Phase 4 テスト（T-MR-_, T-TSR-_, T-VAC-\*）が全て Green 状態である
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] typecheck 結果レポート（`outputs/phase-5/typecheck-result.md`）が作成されている
- [ ] 設計変更がある場合、設計変更記録が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2 設計書、Phase 4 テスト仕様）
2. ステップ 1: 修正アプローチの適用（exports/typesVersions/paths 修正）
3. ステップ 2: Vitest alias の整理方針決定
4. ステップ 3: typecheck 検証（エラー 0 件確認）
5. ステップ 4: Phase 4 テストの Green 確認
6. ステップ 5: 既存テストの回帰確認
7. ステップ 6: 設計変更記録（該当する場合）
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## TDD 検証

```bash
# テスト実行コマンド
cd packages/shared && pnpm vitest run src/__tests__/module-resolution.test.ts
cd apps/desktop && pnpm vitest run src/__tests__/shared-module-resolution.test.ts
cd apps/desktop && pnpm vitest run src/__tests__/vitest-alias-consistency.test.ts

# typecheck 実行
pnpm typecheck

# 確認項目
# - [ ] 全テストが PASS することを確認（Green 状態）
# - [ ] typecheck エラーが 0 件であること
# - [ ] 既存テストに回帰がないこと
```

## 次の Phase

Phase 6: テスト拡充
