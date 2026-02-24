# 現状分析結果 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Phase      | 1                                   |
| 分析実施日 | 2026-02-24                          |

## 1. チェックスクリプト実行結果

### 実行コマンド

```bash
pnpm tsx scripts/check-shared-module-sync.ts
```

### 実行結果

```
  Check 1: exports -> paths (PASSED)
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (PASSED)
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (PASSED)

  ALL CHECKS PASSED
```

**終了コード**: 0（全チェック PASS）

### チェック内容の説明

| チェック番号 | チェック名              | 内容                                             | 結果   |
| ------------ | ----------------------- | ------------------------------------------------ | ------ |
| 1            | exports → paths         | exports の全エントリが tsconfig paths に存在する | PASSED |
| 2            | paths → exports         | tsconfig paths の全エントリが exports に存在する | PASSED |
| 3            | exports → aliases       | exports の全エントリが vitest alias に存在する   | PASSED |
| 4            | aliases → exports       | vitest alias の全エントリが exports に存在する   | PASSED |
| 5            | exports → typesVersions | exports の全サブパスが typesVersions に存在する  | PASSED |

## 2. 四層エントリ数の定量比較

| 層                            | エントリ数 | 備考                              |
| ----------------------------- | ---------- | --------------------------------- |
| exports（package.json）       | 27         | "." を含む全サブパス              |
| typesVersions（package.json） | 26         | "." を除いた全サブパス            |
| tsconfig paths（desktop）     | 27 (+2)    | @repo/shared 27件 + wildcard 2件  |
| vitest alias（desktop）       | 27 (+4)    | @repo/shared 27件 + 内部/mock 4件 |

### 内部/mock alias（チェック対象外）

- `@` → `src/`
- `@renderer` → `src/renderer/`
- `@main` → `src/main/`
- `@anthropic-ai/claude-agent-sdk` → テスト用モック

### wildcard paths（チェック対象外）

- `@renderer/*`
- `@/*`

## 3. 余剰エントリ分析

### 分析方法

vitest alias の全 `@repo/shared` エントリを exports のサブパスに変換し、exports に存在しないエントリを余剰として検出する。

### 分析結果

| 指標                                  | 件数 |
| ------------------------------------- | ---- |
| 余剰（aliases にあり exports にない） | 0    |
| 欠落（exports にあり aliases にない） | 0    |

**結論**: 現時点で exports / tsconfig paths / vitest alias / typesVersions の四層は完全に同期している。

### `types/auth` と `types/api-keys` の状態

仕様書では余剰エントリ候補として `types/auth` と `types/api-keys` が挙げられていたが、分析の結果、両エントリは四層全てに存在し整合している：

| エントリ         | exports | typesVersions | tsconfig paths | vitest alias |
| ---------------- | ------- | ------------- | -------------- | ------------ |
| `types/auth`     | ✅      | ✅            | ✅             | ✅           |
| `types/api-keys` | ✅      | ✅            | ✅             | ✅           |

#### ファイル実体

- `packages/shared/types/auth.ts` — 491行、認証関連型定義（PKCEPair, OAuthCallbackResult等）
- `packages/shared/types/api-keys.ts` — 440行、APIキー管理型定義（AIプロバイダー、Zodスキーマ等）

**注意**: これらのファイルは `packages/shared/types/`（ルート直下）に配置されており、他の大部分の型定義が `packages/shared/src/types/` に配置されているパターンとは異なる。この配置の不統一は別途アーキテクチャ改善タスクとして検討する余地がある。

## 4. 三層アーキテクチャの現状評価

### 運用上の課題

| 課題                                 | 影響度 | 現状                                       |
| ------------------------------------ | ------ | ------------------------------------------ |
| vitest alias の手動管理コスト        | 中     | 27エントリを手動で vitest.config.ts に定義 |
| サブパス追加時の4ファイル同時変更    | 中     | 変更漏れリスクがある（CI で検出は可能）    |
| pnpm スクリプトが未定義              | 低     | `pnpm tsx scripts/...` の直接実行が必要    |
| 運用手順がドキュメント化されていない | 低     | 開発者が暗黙知に依存                       |

### vitest-tsconfig-paths プラグイン導入の動機

1. **手動管理の排除**: 27エントリの vitest alias 手動定義を tsconfig paths からの自動生成に置き換える
2. **変更箇所の削減**: サブパス追加時に変更が必要なファイル数を 4 → 2 に削減（exports + typesVersions のみ）
3. **ドリフト防止**: vitest alias と tsconfig paths の不整合を構造的に排除する

## 5. CI 連携の現状

### check-module-sync ジョブ

- **定義場所**: `.github/workflows/ci.yml` L220-244
- **実行コマンド**: `pnpm tsx scripts/check-shared-module-sync.ts`
- **タイムアウト**: 2分
- **結果ゲート**: 必須（最終 summary ジョブの依存先）

### ローカル実行

- **現状**: `pnpm tsx scripts/check-shared-module-sync.ts` を手動実行
- **課題**: root `package.json` に `check:module-sync` スクリプトが未定義
