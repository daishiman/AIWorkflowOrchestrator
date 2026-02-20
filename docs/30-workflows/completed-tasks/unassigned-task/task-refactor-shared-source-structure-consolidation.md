# @repo/shared ソース構造二重性の統一（types/ と src/types/ の整理）

## メタ情報

```yaml
issue_number: 847
```

| 項目         | 値                                               |
| ------------ | ------------------------------------------------ |
| タスク ID    | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001        |
| 分類         | リファクタリング                                 |
| 対象機能     | `packages/shared` パッケージ構造                 |
| 優先度       | 中                                               |
| 見積もり規模 | 中規模（影響ファイル: 30+）                      |
| 発見元       | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 5 |
| 発見日       | 2026-02-20                                       |
| 前提タスク   | なし                                             |
| ブロック対象 | なし                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 の実装中に判明した構造的問題。`packages/shared` には以下の2つの型定義ディレクトリが並存している:

| ディレクトリ | 配置ファイル                                                                  | exports 参照先                          | 役割               |
| ------------ | ----------------------------------------------------------------------------- | --------------------------------------- | ------------------ |
| `types/`     | auth.ts, api-keys.ts, common.ts, file-selection.ts, workflow.ts               | `dist/types/auth.js` 等（直接）         | 遺産（レガシー）型 |
| `src/types/` | agent.ts, skill.ts, auth-mode.ts, chat-session.ts, rag/, llm/ 等 (16ファイル) | `dist/src/types/index.js` 等（src経由） | 新規型定義         |

`package.json` の `exports` フィールドでは:

- `"./types"` → `dist/src/types/index.js`（**src 配下**を正本として参照）
- `"./types/auth"` → `dist/types/auth.js`（**ルート直下**の types/ を参照）
- `"./types/api-keys"` → `dist/types/api-keys.js`（**ルート直下**の types/ を参照）
- `"./types/agent"` → `dist/src/types/agent.js`（**src 配下**を参照）

同じ `./types/*` という公開パスが、物理的に異なるディレクトリ（`types/` と `src/types/`）のファイルを混在して参照している。

### 1.2 問題点

#### 問題1: ソースディレクトリの二重構造

`types/`（ルート直下）と `src/types/`（src 内）の2箇所に型定義が分散している。`package.json` の `exports` 定義でも `dist/types/` と `dist/src/types/` の2つのパス体系が混在しており、パス解決の一貫性がない。

#### 問題2: 新規ファイル配置先の曖昧性

新しい型定義ファイルを追加する際に、`types/` と `src/types/` のどちらに配置するか判断基準がない。結果として開発者ごとに配置先が異なり、構造の不統一が拡大する。

#### 問題3: exports/typesVersions の冗長性

`typesVersions` フィールドでも同様の二重参照が存在する:

- `"types/auth"` → `"./types/auth.ts"`（ルート直下）
- `"types/agent"` → `"./src/types/agent.ts"`（src 配下）

exports と typesVersions の両方で2つのパス体系を維持する必要があり、メンテナンスコストが高い。

#### 問題4: tsconfig.json の rootDir 制約

`tsconfig.json` の `rootDir` が `"./"` に設定されているため、`types/` と `src/types/` の両方がコンパイル対象に含まれる。`src/` に集約した場合は `rootDir` を `"./src"` に変更できる可能性があるが、現状は `core/`, `infrastructure/`, `schemas/`, `utils/` もルート直下に存在するため、`rootDir` を狭められない。

### 1.3 放置した場合の影響

- **モジュール解決の不整合再発**: `exports`/`paths`/`alias` の三層整合性（TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 で修正済み）が新規パス追加時に再び崩れるリスクが高い
- **exports 定義の膨張**: サブパス追加のたびに `dist/types/` と `dist/src/types/` のどちらに対応するか判断が必要。37個あるエントリーポイントがさらに増加する
- **開発者の混乱**: `@repo/shared/types/auth` が `types/auth.ts`（ルート直下）を参照し、`@repo/shared/types/agent` が `src/types/agent.ts` を参照するという非直感的なマッピングが継続する
- **CI/ビルド設定の複雑化**: tsup.config.ts のエントリーポイントも2つのパス体系を含んでおり、ビルドエラーの原因になりうる

---

## 2. 何を達成するか（What）

### 2.1 目的

`packages/shared` の型定義ディレクトリを統一し、`exports`/`typesVersions`/`tsup.config.ts` のパス体系を一本化する。

### 2.2 ゴール

1. `types/`（ルート直下）のファイル群を `src/types/` に移行する
2. `package.json` の `exports` で `dist/types/` パスを `dist/src/types/` パスに統一する
3. `typesVersions` で `./types/*.ts` パスを `./src/types/*.ts` パスに統一する
4. `tsup.config.ts` のエントリーポイントを統一されたパスに更新する
5. `apps/desktop` 等の import パスが変更後も正しく解決されることを確認する
6. 全テストが PASS すること

### 2.3 スコープ

#### 含むもの

- `packages/shared/types/` のファイルを `packages/shared/src/types/` に移動
- `packages/shared/package.json` の exports/typesVersions 更新
- `packages/shared/tsup.config.ts` のエントリーポイント更新
- `packages/shared/src/types/index.ts` への re-export 追加
- `apps/desktop` 等の import パス修正（必要な場合）
- `apps/desktop/vitest.config.ts` の alias 更新
- `apps/desktop/tsconfig.json` の paths 更新
- テスト通過の確認

#### 含まないもの

- `@repo/shared` 以外のパッケージ構造変更
- 型定義の内容変更（ファイル配置のみ変更）
- `core/`, `infrastructure/`, `schemas/`, `utils/` 等の他のルート直下ディレクトリの移行（別タスクとする）
- `rootDir` の変更（他ディレクトリの移行と合わせて検討）

### 2.4 成果物

| 成果物                               | 配置先                                                          |
| ------------------------------------ | --------------------------------------------------------------- |
| 移行後のソースファイル               | `packages/shared/src/types/auth.ts`, `src/types/api-keys.ts` 等 |
| 更新後の package.json                | `packages/shared/package.json`                                  |
| 更新後の tsup.config.ts              | `packages/shared/tsup.config.ts`                                |
| 更新後の tsconfig.json               | `packages/shared/tsconfig.json`（include 更新）                 |
| 更新後の vitest.config.ts（desktop） | `apps/desktop/vitest.config.ts`（alias 更新）                   |
| 更新後の tsconfig.json（desktop）    | `apps/desktop/tsconfig.json`（paths 更新）                      |
| 実装ガイド                           | `docs/30-workflows/TASK-REFACTOR-.../phase-12-documentation.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 が完了していること（exports/paths/alias の三層整合性が確保済み）
- `pnpm install` が正常に完了すること
- `pnpm --filter @repo/shared build` が正常に完了すること

### 3.2 依存関係

| 依存先タスク                              | 依存理由                  | ステータス |
| ----------------------------------------- | ------------------------- | ---------- |
| TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001  | 三層整合性の基盤          | 完了予定   |
| TASK-IMP-VITEST-ALIAS-SYNC-AUTOMATION-001 | CI ガード（並行実施可能） | 未着手     |

### 3.3 必要な知識

- TypeScript の `moduleResolution: "bundler"` におけるサブパス解決ルール
- `package.json` の `exports` / `typesVersions` フィールドの仕様
- tsup のマルチエントリーポイント設定
- モノレポにおける pnpm workspace のパッケージ参照

### 3.4 アプローチ

#### 方針: `src/types/` への集約（推奨）

**理由**:

1. `package.json` の `exports` で `"./types"` の正本は既に `dist/src/types/index.js` を指している
2. 新規型定義は全て `src/types/` に配置されている（16ファイル vs 5ファイル）
3. `src/` 配下に集約することで、将来的に `rootDir` を `"./src"` に変更する道が開ける

**移行対象ファイル（5ファイル + 1ディレクトリ）**:

| 現在のパス                | 移行先                            | 公開パス                      |
| ------------------------- | --------------------------------- | ----------------------------- |
| `types/auth.ts`           | `src/types/auth.ts`               | `@repo/shared/types/auth`     |
| `types/api-keys.ts`       | `src/types/api-keys.ts`           | `@repo/shared/types/api-keys` |
| `types/common.ts`         | `src/types/common.ts`             | （re-export 経由）            |
| `types/file-selection.ts` | `src/types/file-selection.ts`     | （re-export 経由）            |
| `types/workflow.ts`       | `src/types/workflow.ts`           | （re-export 経由）            |
| `types/index.ts`          | 削除（src/types/index.ts に統合） | -                             |
| `types/__tests__/`        | `src/types/__tests__/` に統合     | -                             |

**公開パスへの影響**:

- `@repo/shared/types/auth` → exports の参照先を `dist/types/auth.js` から `dist/src/types/auth.js` に変更
- `@repo/shared/types/api-keys` → 同上
- `@repo/shared/types` → 変更なし（既に `dist/src/types/index.js` を参照）
- アプリ側の import 文（`@repo/shared/types/auth` 等）は変更不要（exports が吸収する）

### 3.5 実装課題と解決策

TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 の実装で得られた知見を以下に記録する。本タスクで同様の課題に直面した際の解決指針として活用すること。

#### 苦戦箇所1: exports/paths/alias 三層整合の同期漏れ

- **問題**: `package.json` の `exports` フィールドにサブパスを追加（または変更）しても、`tsconfig.json` の `paths` と `vitest.config.ts` の `alias` に反映しないと、それぞれ TypeScript コンパイルまたは Vitest 実行で解決エラーが発生する
- **解決策**: 4ファイル同期チェックリストを必ず実行する

**4ファイル同期チェックリスト**:

| #   | ファイル                         | 更新内容                                   |
| --- | -------------------------------- | ------------------------------------------ |
| 1   | `packages/shared/package.json`   | `exports` + `typesVersions` のサブパス定義 |
| 2   | `apps/desktop/tsconfig.json`     | `compilerOptions.paths` のエイリアス定義   |
| 3   | `apps/desktop/vitest.config.ts`  | `resolve.alias` のテスト時パス解決定義     |
| 4   | `packages/shared/tsup.config.ts` | `entry` のビルドエントリーポイント定義     |

```typescript
// ❌ exports だけ変更して paths/alias を忘れる
// package.json: "./types/auth": "./dist/src/types/auth.js" （変更済み）
// tsconfig.json: paths に旧パスが残る → TS2307 エラー

// ✅ 4ファイル同時更新
// 1. package.json exports + typesVersions → 新パスに更新
// 2. tsconfig.json paths → 新パスに更新
// 3. vitest.config.ts alias → 新パスに更新
// 4. tsup.config.ts entry → 新エントリーポイントに更新
```

#### 苦戦箇所2: TypeScript paths の定義順序

- **問題**: `tsconfig.json` の `paths` は定義順序で優先度が決まる。汎用パス（`@repo/shared/*`）を先に書くと、具体的なサブパス（`@repo/shared/types/auth`）がマッチしなくなる
- **解決策**: 具体的なパス → 汎用パスの順（最長一致優先）で定義する

```json
// ❌ 汎用パスが先 → 具体的パスが無視される
{
  "paths": {
    "@repo/shared/*": ["../../packages/shared/*"],
    "@repo/shared/types/auth": ["../../packages/shared/src/types/auth.ts"]
  }
}

// ✅ 具体的パスが先 → 最長一致で正しく解決
{
  "paths": {
    "@repo/shared/types/auth": ["../../packages/shared/src/types/auth.ts"],
    "@repo/shared/types/api-keys": ["../../packages/shared/src/types/api-keys.ts"],
    "@repo/shared/*": ["../../packages/shared/*"]
  }
}
```

#### 苦戦箇所3: source 直接参照時の補助型宣言取り込み漏れ

- **問題**: `@repo/shared` をビルド成果物（`dist/`）ではなくソースファイル（`src/`）直接参照する構成では、`tsconfig.json` の `include` で `.d.ts` ファイルを取り込まないと型が見えない
- **解決策**: `tsconfig.json` に `"include": ["src", "types"]` を追加し、補助型宣言を含める。本タスクで `types/` を `src/types/` に移行した後は `"include": ["src"]` で十分になる

```json
// 移行前: types/ が残っている間は both を include
{
  "include": ["index.ts", "core/**/*.ts", "types/**/*.ts", "src/**/*.ts", ...]
}

// 移行後: src/ に集約すれば types/ の include が不要
{
  "include": ["index.ts", "core/**/*.ts", "src/**/*.ts", ...]
}
```

#### 苦戦箇所4: 移行時の import パス影響範囲の特定

- **問題**: `types/auth.ts` を `src/types/auth.ts` に移動する際、アプリ側の import パス（`@repo/shared/types/auth`）が変更されるかどうかの判断が難しい
- **解決策**: 公開パス（`@repo/shared/types/auth`）は変更しない。`exports` フィールドの参照先（`dist/types/auth.js` → `dist/src/types/auth.js`）のみ変更する。アプリ側の import 文は一切変更不要

```typescript
// アプリ側の import は変更不要
import { AUTH_ERROR_CODES } from "@repo/shared/types/auth";
// ↑ このパスは exports が吸収するため、物理パスの変更に影響されない

// 変更が必要なのは package.json の exports のみ
// Before: "./types/auth" → "dist/types/auth.js"
// After:  "./types/auth" → "dist/src/types/auth.js"
```

**ただし注意**: `typesVersions` でソース直接参照している場合は、そちらも更新が必要:

```json
// Before
"types/auth": ["./types/auth.ts"]
// After
"types/auth": ["./src/types/auth.ts"]
```

---

## 4. 実行手順

### Phase 1: 要件定義

1. 本仕様書の内容を確認し、スコープとゴールが明確であることを確認する
2. `packages/shared/types/` の全ファイルと `src/types/` の全ファイルをリストアップし、名前衝突がないことを確認する

**名前衝突の確認（2026-02-20時点）**:

| ファイル名        | `types/` に存在 | `src/types/` に存在 | 衝突     |
| ----------------- | --------------- | ------------------- | -------- |
| auth.ts           | ✅              | ❌                  | なし     |
| api-keys.ts       | ✅              | ❌                  | なし     |
| common.ts         | ✅              | ❌                  | なし     |
| file-selection.ts | ✅              | ❌                  | なし     |
| workflow.ts       | ✅              | ❌                  | なし     |
| index.ts          | ✅              | ✅                  | **あり** |

`index.ts` のみ衝突する。`types/index.ts` の re-export 内容を `src/types/index.ts` に統合する必要がある。

### Phase 2: 設計

1. 移行計画を詳細化する（ファイル単位の移行順序）
2. `src/types/index.ts` の統合方法を設計する
3. `package.json` exports/typesVersions の変更差分を設計する

### Phase 3: 設計レビュー

1. 移行計画と影響範囲の妥当性を検証する
2. 名前衝突の解決方法を検証する

### Phase 4: テスト作成

1. 移行前の既存テストが全て PASS することを確認（ベースライン）
2. 移行後の公開パス（`@repo/shared/types/auth` 等）が正しく解決されることを検証するテストを追加
3. `src/types/index.ts` から旧 `types/` のエクスポートが全て参照可能であることを検証するテストを追加

### Phase 5: 実装

#### Step 1: ファイル移動

```bash
# types/ のファイルを src/types/ に移動
mv packages/shared/types/auth.ts packages/shared/src/types/auth.ts
mv packages/shared/types/api-keys.ts packages/shared/src/types/api-keys.ts
mv packages/shared/types/common.ts packages/shared/src/types/common.ts
mv packages/shared/types/file-selection.ts packages/shared/src/types/file-selection.ts
mv packages/shared/types/workflow.ts packages/shared/src/types/workflow.ts

# テストファイルも移動
mv packages/shared/types/__tests__/* packages/shared/src/types/__tests__/
```

#### Step 2: src/types/index.ts の更新

`types/index.ts` の re-export 内容を `src/types/index.ts` に追加する:

```typescript
// src/types/index.ts に以下を追加
export * from "./workflow";
export * from "./common";
export * from "./auth";
export * from "./api-keys";
export * from "./file-selection";
```

#### Step 3: package.json の更新

```json
// Before
"./types/auth": {
  "types": "./dist/types/auth.d.ts",
  "import": "./dist/types/auth.js"
},
"./types/api-keys": {
  "types": "./dist/types/api-keys.d.ts",
  "import": "./dist/types/api-keys.js"
},

// After
"./types/auth": {
  "types": "./dist/src/types/auth.d.ts",
  "import": "./dist/src/types/auth.js"
},
"./types/api-keys": {
  "types": "./dist/src/types/api-keys.d.ts",
  "import": "./dist/src/types/api-keys.js"
},
```

#### Step 4: typesVersions の更新

```json
// Before
"types/auth": ["./types/auth.ts"],
"types/api-keys": ["./types/api-keys.ts"],

// After
"types/auth": ["./src/types/auth.ts"],
"types/api-keys": ["./src/types/api-keys.ts"],
```

#### Step 5: tsup.config.ts の更新

エントリーポイントの `types/auth.ts` → `src/types/auth.ts` への変更。

#### Step 6: tsconfig.json の更新

`include` から `"types/**/*.ts"` を削除可能か確認。`types/` ディレクトリが空になった後に削除する。

#### Step 7: 旧 types/ ディレクトリの削除

全ファイル移動後、空になった `types/` ディレクトリを削除する。

#### Step 8: vitest.config.ts（desktop）の更新

`apps/desktop/vitest.config.ts` の alias で `@repo/shared/types/auth` 等のパスが `src/types/auth.ts` を指すように更新する。

#### Step 9: tsconfig.json（desktop）の更新

`apps/desktop/tsconfig.json` の paths で `@repo/shared/types/auth` 等のパスが `src/types/auth.ts` を指すように更新する。

### Phase 6-7: テスト拡充・カバレッジ確認

1. 移行後の全テストが PASS することを確認
2. `pnpm --filter @repo/shared build` が成功することを確認
3. `pnpm --filter @repo/desktop typecheck` が成功することを確認

### Phase 8: リファクタリング

1. `src/types/index.ts` の re-export 順序を整理（アルファベット順またはドメイン順）
2. 不要になったコメントの削除

### Phase 9: 品質検証

```bash
pnpm lint
pnpm typecheck
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
```

### Phase 10: 最終レビュー

1. `exports` フィールドに `dist/types/` パス（旧パス）が残っていないことを確認
2. `typesVersions` フィールドに `./types/*.ts`（旧パス）が残っていないことを確認
3. `tsup.config.ts` に `types/` エントリー（旧パス）が残っていないことを確認
4. `types/` ディレクトリが完全に削除されていることを確認

### Phase 11: 手動テスト

1. `pnpm --filter @repo/shared build` → ビルド成功
2. `pnpm --filter @repo/desktop dev` → アプリ起動成功
3. 認証機能が正常に動作すること（`types/auth.ts` の移行影響確認）
4. API キー管理機能が正常に動作すること（`types/api-keys.ts` の移行影響確認）

### Phase 12: ドキュメント

1. 実装ガイド作成
2. システム仕様書更新（architecture-monorepo.md 等）
3. documentation-changelog.md 更新
4. 未タスク検出

### Phase 13: 完了

1. 全成果物の確認
2. PR 作成

---

## 5. 完了条件チェックリスト

- [ ] `packages/shared/types/` ディレクトリが削除されていること
- [ ] `packages/shared/src/types/` に旧 `types/` の全ファイル（auth.ts, api-keys.ts, common.ts, file-selection.ts, workflow.ts）が移行されていること
- [ ] `packages/shared/src/types/index.ts` から旧 `types/index.ts` のエクスポートが全て参照可能であること
- [ ] `package.json` の `exports` に `dist/types/` パス（src なし）が存在しないこと
- [ ] `package.json` の `typesVersions` に `./types/*.ts`（src なし）が存在しないこと
- [ ] `tsup.config.ts` のエントリーに `types/` パス（src なし）が存在しないこと
- [ ] `pnpm --filter @repo/shared build` が成功すること
- [ ] `pnpm --filter @repo/shared typecheck` が成功すること
- [ ] `pnpm --filter @repo/shared test:run` が全て PASS すること
- [ ] `pnpm --filter @repo/desktop typecheck` が成功すること
- [ ] `pnpm --filter @repo/desktop test:run` が全て PASS すること
- [ ] `apps/desktop` から `@repo/shared/types/auth` が正常に import できること
- [ ] `apps/desktop` から `@repo/shared/types/api-keys` が正常に import できること
- [ ] 4ファイル同期チェックリスト（3.5 苦戦箇所1）が全て完了していること

---

## 6. 検証方法

### 自動検証

```bash
# 1. shared パッケージのビルド
pnpm --filter @repo/shared build

# 2. 型チェック（shared）
pnpm --filter @repo/shared typecheck

# 3. テスト（shared）
pnpm --filter @repo/shared test:run

# 4. 型チェック（desktop）
pnpm --filter @repo/desktop typecheck

# 5. テスト（desktop）
cd apps/desktop && pnpm vitest run src/__tests__/shared-module-resolution.test.ts

# 6. 旧パスの残存チェック
grep -rn "dist/types/" packages/shared/package.json  # 0件であること
grep -rn '"./types/' packages/shared/package.json | grep -v '"./types/' | grep 'types/' # typesVersions の旧パス確認
```

### 手動検証

1. `pnpm --filter @repo/desktop dev` でアプリが正常起動すること
2. 認証画面が表示されること（auth.ts の型が正しく解決されている証拠）
3. 設定画面で API キー管理が動作すること（api-keys.ts の型が正しく解決されている証拠）

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                                                                      |
| -------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| ファイル移動時の import パス破壊                   | 高     | 低       | `exports` フィールドが公開パスを吸収するため、アプリ側の import 文は変更不要。ただし4ファイル同期チェックリストを必ず実行 |
| `src/types/index.ts` の re-export 統合時の名前衝突 | 中     | 低       | Phase 1 で名前衝突を事前調査済み。`index.ts` のみ衝突あり → 内容統合で解決                                                |
| tsup ビルドのエントリーポイント不整合              | 高     | 中       | Phase 5 Step 5 で tsup.config.ts を明示的に更新。ビルド後に `dist/` の構造を確認                                          |
| vitest alias の更新漏れ                            | 中     | 中       | 3.5 苦戦箇所1 の4ファイル同期チェックリストで防止                                                                         |
| `types/__tests__/` のテストファイル移動漏れ        | 低     | 中       | Phase 5 Step 1 で `__tests__/` ディレクトリも明示的に移動                                                                 |

---

## 8. 参照情報・備考

### 参照タスク

| タスク ID                                  | 関連内容                                    |
| ------------------------------------------ | ------------------------------------------- |
| TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001   | 発見元。三層整合性の基盤修正                |
| TASK-IMP-VITEST-ALIAS-SYNC-AUTOMATION-001  | CI ガードによる整合性の自動検証             |
| TASK-VITEST-TSCONFIG-PATHS-SYNC-AUTOMATION | tsconfig paths と vitest alias の同期自動化 |

### 参照 Pitfall

| Pitfall ID | 内容                               | 本タスクでの関連                         |
| ---------- | ---------------------------------- | ---------------------------------------- |
| P8         | 幽霊依存                           | 移行後に import が解決できなくなるリスク |
| P11        | PostToolUse フックによる Edit 失敗 | 大量ファイル編集時の注意                 |
| P23        | API 二重定義の型管理複雑性         | exports の二重パス体系                   |
| P32        | 型定義の二箇所同時更新必須         | exports + typesVersions の同時更新       |

### 影響ファイル一覧（参考）

`@repo/shared/types/auth` を参照しているファイル（2026-02-20時点、30+箇所）:

- `apps/desktop/src/main/auth/pkce.ts`
- `apps/desktop/src/main/auth/authFlowOrchestrator.ts`
- `apps/desktop/src/main/auth/authCallbackServer.ts`
- `apps/desktop/src/main/auth/oauth-error-handler.ts`
- `apps/desktop/src/main/index.ts`
- `apps/desktop/src/main/ipc/authHandlers.ts`
- `apps/desktop/src/main/ipc/profileHandlers.ts`
- `apps/desktop/src/main/ipc/avatarHandlers.ts`
- `apps/desktop/src/main/ipc/apiKeyHandlers.ts`
- `apps/desktop/src/main/infrastructure/apiKeyStorage.ts`
- `apps/desktop/src/main/infrastructure/profileCache.ts`
- `apps/desktop/vitest.config.ts`（alias 定義）
- 各テストファイル（mock 定義含む）

**注意**: 上記ファイルの import 文（`from "@repo/shared/types/auth"`）は変更不要。`exports` フィールドの参照先変更のみで対応可能。ただし `vitest.config.ts` の alias と `tsconfig.json` の paths は `typesVersions` に依存せず直接パスを指定しているため、更新が必要。
