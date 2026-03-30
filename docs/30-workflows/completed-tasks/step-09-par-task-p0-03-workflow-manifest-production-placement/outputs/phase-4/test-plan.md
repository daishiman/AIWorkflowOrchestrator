# Phase 4 — テスト計画 (TASK-P0-03)

## 概要

Production workflow-manifest.json の構造的正当性・ファイル参照整合性・hook 一貫性を検証するテスト計画。

## テストファイル

```
apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts
```

## テストフレームワーク

- **フレームワーク**: Vitest
- **ランナー**: Node.js (Electron main process 互換)
- **アサーション**: Vitest built-in (`expect`)

## 実行コマンド

```bash
# production manifest テストのみ実行
pnpm --filter @repo/desktop vitest run ManifestLoader.production-manifest

# watch モードで実行
pnpm --filter @repo/desktop vitest watch ManifestLoader.production-manifest

# 既存 ManifestLoader テストと合わせて実行
pnpm --filter @repo/desktop vitest run ManifestLoader
```

## テスト構成

```
describe('ManifestLoader — production manifest')
  ├── TC-01: canonical manifest を loadManifest() でエラーなく読み込む
  ├── TC-02: schemaVersion が 1 である
  ├── TC-03: 全 resource descriptor の path が実在ファイルを指す
  ├── TC-04: phases が 5 phase を含む
  ├── TC-05: entry/exit hooks が定義されている
  ├── TC-06: 全 phase の entryHookId が entry[] に存在する
  ├── TC-07: 全 phase の exitHookId が exit[] に存在する
  ├── TC-08: canonical と mirror の manifest が同一内容である
  ├── TC-09: 全 resource の kind が有効値である
  └── TC-10: phase の dependsOn が正しい依存順序を形成する
```

## 前提条件

- `workflow-manifest.json` が canonical パス (`.claude/skills/skill-creator/`) に配置済みであること
- mirror パス (`.agents/skills/skill-creator/`) にも同一ファイルが配置済みであること
- manifest 内の全 resource path が実在すること

## 合格基準

全 10 テストケースが PASS であること。詳細は `test-matrix.md` を参照。
