# Phase 2: 設計 検証レポート

## メタ情報

| 項目           | 内容                                    |
| -------------- | --------------------------------------- |
| Phase          | 2                                       |
| 機能名         | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| 検証日         | 2026-02-22                              |
| 検証対象       | phase-2-design.md                       |
| 検証ステータス | PASS                                    |

## 1. 関数構成の妥当性検証

### 1.1 パーサー関数（4関数）

| 関数名               | 責務                                                      | 妥当性                                   |
| -------------------- | --------------------------------------------------------- | ---------------------------------------- |
| `parseExports`       | package.json の exports を Map に変換                     | 妥当 -- JSON.parse で正確にパース可能    |
| `parsePaths`         | tsconfig.json の paths を Map に変換（@repo/shared のみ） | 妥当 -- JSON.parse + フィルタリング      |
| `parseAliases`       | vitest.config.ts の alias を正規表現で抽出                | 妥当 -- AST パースは過剰、正規表現で十分 |
| `parseTypesVersions` | package.json の typesVersions を Map に変換               | 妥当 -- JSON.parse で正確にパース可能    |

**検証結果**: 4パーサーの分離は単一責務原則に準拠しており、テスト容易性が高い。各パーサーが独立してテスト可能。

### 1.2 チェッカー関数（5関数）

| 関数名                        | 対応チェック# | Phase 1 要件との対応    |
| ----------------------------- | ------------- | ----------------------- |
| `checkExportsVsPaths`         | チェック1     | exports → paths         |
| `checkPathsVsExports`         | チェック2     | paths → exports         |
| `checkExportsVsAliases`       | チェック3     | exports → alias         |
| `checkAliasesVsExports`       | チェック4     | alias → exports         |
| `checkExportsVsTypesVersions` | チェック5     | exports → typesVersions |

**検証結果**: Phase 1 の5段階チェック要件と1対1で対応しており、漏れなし。

### 1.3 レポーター関数（2関数）

| 関数名         | 責務                     | 妥当性                              |
| -------------- | ------------------------ | ----------------------------------- |
| `formatReport` | 不整合の詳細フォーマット | 妥当 -- MISSING/MISMATCH の種別分け |
| `printSummary` | サマリーと修正ガイダンス | 妥当 -- 受入基準 2.3 に対応         |

### 1.4 エントリポイント

| 関数名 | 責務                                | 妥当性               |
| ------ | ----------------------------------- | -------------------- |
| `main` | パース → チェック → レポート → exit | 妥当 -- 明確なフロー |

**総合評価**: 4パーサー + 5チェッカー + 2レポーター + main = 12関数構成は適切。各関数の責務が明確で、テスト容易性が高い。

## 2. 型定義の妥当性検証

### 2.1 ExportEntry

```typescript
interface ExportEntry {
  types: string; // "./dist/core/index.d.ts"
  import: string; // "./dist/core/index.js"
}
```

**検証**: `packages/shared/package.json` の exports 各エントリは全て `{ types, import }` 形式であることを確認。型定義は実データに一致。

### 2.2 CheckIssue

```typescript
interface CheckIssue {
  type: "MISSING" | "MISMATCH";
  source: string;
  expected: string;
  actual?: string;
  expectedPath?: string;
  actualPath?: string;
}
```

**検証**: MISSING（エントリ不在）と MISMATCH（パス不一致）の2種類で不整合を分類。Phase 5 では MISSING のみ実装し、MISMATCH は Phase 6 で拡張する設計は段階的実装として妥当。

### 2.3 CheckResult

```typescript
interface CheckResult {
  checkName: string;
  checkNumber: number;
  issues: CheckIssue[];
  isPass: boolean;
}
```

**検証**: チェック名と番号を保持し、レポート出力時の識別に利用。`isPass` は `issues.length === 0` で導出。妥当。

### 2.4 SyncCheckSummary

```typescript
interface SyncCheckSummary {
  exportsCount: number;
  pathsCount: number;
  aliasesCount: number;
  typesVersionsCount: number;
  totalIssues: number;
  isAllPass: boolean;
}
```

**検証**: サマリーレポートに必要な全項目を含む。妥当。

## 3. vitest.config.ts 正規表現パターンの検証

### 3.1 設計で指定された正規表現

```typescript
const ALIAS_PATTERN =
  /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g;
```

### 3.2 既存テストとの一致確認

`apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` の34行目で使用されている正規表現:

```typescript
const regex =
  /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g;
```

**一致確認**: Phase 2 設計の正規表現と既存テストの正規表現は完全に一致。

### 3.3 実ファイルマッチテスト結果

正規表現を `apps/desktop/vitest.config.ts` に対して実行した結果:

| #   | マッチしたエイリアス                              | マッチしたパス                                                    |
| --- | ------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | `@repo/shared/infrastructure/ai/apiKeyValidator`  | `../../packages/shared/infrastructure/ai/apiKeyValidator.ts`      |
| 2   | `@repo/shared/infrastructure/database`            | `../../packages/shared/infrastructure/database/index.ts`          |
| 3   | `@repo/shared/infrastructure/auth`                | `../../packages/shared/infrastructure/auth/index.ts`              |
| 4   | `@repo/shared/services/history/history-service`   | `../../packages/shared/src/services/history/history-service.ts`   |
| 5   | `@repo/shared/services/history/types`             | `../../packages/shared/src/services/history/types.ts`             |
| 6   | `@repo/shared/services/logging/conversion-logger` | `../../packages/shared/src/services/logging/conversion-logger.ts` |
| 7   | `@repo/shared/services/logging/types`             | `../../packages/shared/src/services/logging/types.ts`             |
| 8   | `@repo/shared/schemas/auth`                       | `../../packages/shared/schemas/auth.ts`                           |
| 9   | `@repo/shared/schemas`                            | `../../packages/shared/schemas/index.ts`                          |
| 10  | `@repo/shared/agent`                              | `../../packages/shared/src/agent/index.ts`                        |
| 11  | `@repo/shared/constants`                          | `../../packages/shared/src/constants/index.ts`                    |
| 12  | `@repo/shared/src/ipc/channels`                   | `../../packages/shared/src/ipc/channels.ts`                       |
| 13  | `@repo/shared/types/llm/schemas`                  | `../../packages/shared/src/types/llm/schemas/index.ts`            |
| 14  | `@repo/shared/types/llm`                          | `../../packages/shared/src/types/llm/schemas/index.ts`            |
| 15  | `@repo/shared/types/rag/result`                   | `../../packages/shared/src/types/rag/result.ts`                   |
| 16  | `@repo/shared/types/rag`                          | `../../packages/shared/src/types/rag/index.ts`                    |
| 17  | `@repo/shared/types/auth-mode`                    | `../../packages/shared/src/types/auth-mode.ts`                    |
| 18  | `@repo/shared/types/api-keys`                     | `../../packages/shared/types/api-keys.ts`                         |
| 19  | `@repo/shared/types/auth`                         | `../../packages/shared/types/auth.ts`                             |
| 20  | `@repo/shared/types/agent`                        | `../../packages/shared/src/types/agent.ts`                        |
| 21  | `@repo/shared/types/skill`                        | `../../packages/shared/src/types/skill.ts`                        |
| 22  | `@repo/shared/types/replace`                      | `../../packages/shared/src/types/replace.ts`                      |
| 23  | `@repo/shared/types`                              | `../../packages/shared/src/types/index.ts`                        |
| 24  | `@repo/shared/repositories`                       | `../../packages/shared/src/repositories/index.ts`                 |
| 25  | `@repo/shared/infrastructure`                     | `../../packages/shared/infrastructure/index.ts`                   |
| 26  | `@repo/shared/core`                               | `../../packages/shared/core/index.ts`                             |
| 27  | `@repo/shared`                                    | `../../packages/shared/index.ts`                                  |

**合計マッチ数**: 27（@repo/shared 関連エントリ全件にマッチ）

### 3.4 非マッチエントリの確認

| エントリ                                         | マッチ結果 | 理由                              |
| ------------------------------------------------ | ---------- | --------------------------------- |
| `"@": resolve(__dirname, "src")`                 | 非マッチ   | `@repo/shared` プレフィックスなし |
| `"@renderer": resolve(...)`                      | 非マッチ   | `@repo/shared` プレフィックスなし |
| `"@main": resolve(...)`                          | 非マッチ   | `@repo/shared` プレフィックスなし |
| `"@anthropic-ai/claude-agent-sdk": resolve(...)` | 非マッチ   | `@repo/shared` プレフィックスなし |

**検証結果**: 正規表現は @repo/shared エントリのみを正確に抽出し、非対象エントリはマッチしない。

### 3.5 複数行 resolve() への対応確認

vitest.config.ts には `resolve()` の引数が複数行にまたがるエントリが多数存在する（例: `@repo/shared/infrastructure/ai/apiKeyValidator`）。正規表現の `\s*` が改行を含む空白にマッチするため、これらのエントリも正しくパースされている。

実際のフォーマット例:

```typescript
"@repo/shared/infrastructure/ai/apiKeyValidator": resolve(
  __dirname,
  "../../packages/shared/infrastructure/ai/apiKeyValidator.ts",
),
```

正規表現マッチ結果: グループ1 = `@repo/shared/infrastructure/ai/apiKeyValidator`、グループ2 = `../../packages/shared/infrastructure/ai/apiKeyValidator.ts` -- 正確にマッチ。

## 4. CIワークフロー変更設計の検証

### 4.1 現在の ci.yml ジョブ依存構造

`.github/workflows/ci.yml` の現状（実ファイルから確認）:

| ジョブ名     | needs                                                        | 独立実行   |
| ------------ | ------------------------------------------------------------ | ---------- |
| lint         | なし                                                         | 独立       |
| build-shared | なし                                                         | 独立       |
| typecheck    | `[build-shared]`                                             | 依存       |
| test-shared  | `[build-shared]`                                             | 依存       |
| test-desktop | `[build-shared]`                                             | 依存       |
| security     | なし                                                         | 独立       |
| coverage     | `[test-shared, test-desktop]`（main push のみ）              | 依存       |
| build        | `[lint, typecheck, test-shared, test-desktop, build-shared]` | 最終ゲート |

Phase 2 仕様書の「現在のジョブ依存構造」(Task 3.1) と一致していることを確認。

### 4.2 設計された変更内容

1. **新規ジョブ `check-module-sync`**: `needs` なし（独立実行）
2. **`build` ジョブの `needs` 更新**: `check-module-sync` を追加

変更後の `build.needs`:

```yaml
needs:
  [lint, typecheck, test-shared, test-desktop, build-shared, check-module-sync]
```

### 4.3 設計判断の妥当性

| 判断項目                         | 設計の決定                  | 妥当性評価                                         |
| -------------------------------- | --------------------------- | -------------------------------------------------- |
| `build-shared` に依存しない      | `needs` なし                | 妥当 -- チェックスクリプトはソースファイルのみ参照 |
| `lint` と並列実行                | 両方とも独立ジョブ          | 妥当 -- CI 最速フィードバック                      |
| `build` の `needs` に追加        | 必須                        | 妥当 -- 不整合 PR のマージ防止                     |
| timeout 2分                      | ファイル読み取り + チェック | 妥当 -- pnpm install + tsx 実行で十分              |
| `pnpm install --frozen-lockfile` | tsx 使用のため必要          | 妥当 -- devDependencies が必要                     |

### 4.4 ジョブ定義の検証

Phase 2 仕様書の `check-module-sync` ジョブ定義を確認:

- **runs-on**: `ubuntu-latest` -- 他のジョブと統一
- **timeout-minutes**: 2 -- ファイル読み取り処理として十分
- **steps**: Checkout → Setup pnpm → Setup Node.js → git config → Install → Check -- 他ジョブと一貫したセットアップ手順
- **Node.js バージョン**: 22 -- 他ジョブと統一
- **cache**: pnpm -- 他ジョブと統一

### 4.5 ワークフロートリガーの確認

ci.yml の `on` セクション（実ファイルより）:

- `push.branches: [main]`
- `pull_request.branches: [main]`
- `paths-ignore`: `docs/**`, `**/*.md`, `.github/ISSUE_TEMPLATE/**`, `.github/PULL_REQUEST_TEMPLATE/**`, `LICENSE`, `.gitignore`

`check-module-sync` が検証するファイル:

- `packages/shared/package.json` -- `paths-ignore` に含まれない
- `apps/desktop/tsconfig.json` -- `paths-ignore` に含まれない
- `apps/desktop/vitest.config.ts` -- `paths-ignore` に含まれない

**検証結果**: 検証対象ファイルは `paths-ignore` に含まれておらず、変更時に CI が実行される。

## 5. 苦戦箇所への対策設計の検証

### 5.1 苦戦箇所1: 三層正本曖昧性

| 対策項目             | 設計内容                                    | 妥当性 |
| -------------------- | ------------------------------------------- | ------ |
| 正本の明示           | レポートヘッダーに「正本: exports」明記     | 妥当   |
| チェック方向の一貫性 | チェック1,3,5 は exports 起点               | 妥当   |
| 修正ガイダンスの順序 | exports確認 → paths → alias → typesVersions | 妥当   |

### 5.2 苦戦箇所2: typesVersions 二重管理

| 対策項目                | 設計内容                                     | 妥当性                               |
| ----------------------- | -------------------------------------------- | ------------------------------------ |
| ルートエントリの除外    | exports `.` は typesVersions チェック対象外  | 妥当 -- typesVersions にルートは不要 |
| `./` プレフィックス除去 | `exportsKeyToTypesVersionsKey` で `slice(2)` | 妥当 -- 実データで検証済み           |
| 将来の廃止対応          | 環境変数での無効化を提案                     | 妥当 -- 拡張性確保                   |

### 5.3 苦戦箇所3: alias glob パターン差異

| 対策項目                 | 設計内容                             | 妥当性                             |
| ------------------------ | ------------------------------------ | ---------------------------------- |
| ワイルドカードのスキップ | `parsePaths()` で `*` 含むキーを除外 | 妥当 -- 現時点で該当なし、将来対応 |
| 個別エントリのみ検証     | ワイルドカードではなく個別パスを検証 | 妥当                               |

## 6. キー変換ロジックの検証

### 6.1 `exportsKeyToPathsKey`

| 入力                   | 期待出力                          | 実データ検証 |
| ---------------------- | --------------------------------- | ------------ |
| `"."`                  | `"@repo/shared"`                  | 一致         |
| `"./core"`             | `"@repo/shared/core"`             | 一致         |
| `"./src/ipc/channels"` | `"@repo/shared/src/ipc/channels"` | 一致         |

### 6.2 `exportsKeyToTypesVersionsKey`

| 入力                   | 期待出力             | 実データ検証 |
| ---------------------- | -------------------- | ------------ |
| `"./core"`             | `"core"`             | 一致         |
| `"./types/auth"`       | `"types/auth"`       | 一致         |
| `"./src/ipc/channels"` | `"src/ipc/channels"` | 一致         |

### 6.3 `pathsKeyToExportsKey`

| 入力                              | 期待出力               | 実データ検証 |
| --------------------------------- | ---------------------- | ------------ |
| `"@repo/shared"`                  | `"."`                  | 一致         |
| `"@repo/shared/core"`             | `"./core"`             | 一致         |
| `"@repo/shared/src/ipc/channels"` | `"./src/ipc/channels"` | 一致         |

**検証結果**: 全変換ロジックが実データに対して正確に動作する。

## 7. Electron 固有の考慮事項の検証

| 項目                      | 設計の対応方針                | 妥当性 |
| ------------------------- | ----------------------------- | ------ |
| Main Process の型解決     | paths チェックで網羅          | 妥当   |
| Renderer Process の型解決 | 同じ tsconfig.json を参照     | 妥当   |
| Vitest テスト環境         | alias チェックで網羅          | 妥当   |
| Preload スクリプト        | tsconfig.json の paths で網羅 | 妥当   |

## 8. ハードコードパスの確認

| 設定          | ハードコードパス                       | 正確性 |
| ------------- | -------------------------------------- | ------ |
| exports       | `packages/shared/package.json`         | 正確   |
| typesVersions | `packages/shared/package.json`（同一） | 正確   |
| paths         | `apps/desktop/tsconfig.json`           | 正確   |
| alias         | `apps/desktop/vitest.config.ts`        | 正確   |

## 検証結論

Phase 2 の設計は以下の全項目を満たしている:

- [x] 関数構成（4パーサー + 5チェッカー + 2レポーター + main）が設計されている
- [x] 全関数のシグネチャが定義されている
- [x] 型定義（ExportEntry, CheckIssue, CheckResult, SyncCheckSummary）が定義されている
- [x] キー変換ロジックが定義され、実データで検証済み
- [x] 差分レポートフォーマット（正常/異常/MISMATCH）が設計されている
- [x] CIワークフロー変更箇所が設計されている
- [x] `check-module-sync` が `lint` と並列で `build-shared` に依存しない設計が確認されている
- [x] vitest.config.ts パース戦略（正規表現ベース）が設計されている
- [x] 正規表現が実ファイルで27件全てにマッチすることを確認済み
- [x] 正規表現パースの制約と対策が定義されている
- [x] 3つの苦戦箇所への対策が設計されている
- [x] Electron 固有の考慮事項が確認されている
- [x] ハードコードパスが明示されている

**Phase 2 検証ステータス: PASS**
