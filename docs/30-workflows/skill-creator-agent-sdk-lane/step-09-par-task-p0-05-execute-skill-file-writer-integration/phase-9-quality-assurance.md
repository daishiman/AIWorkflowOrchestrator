# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目      | 内容     |
| --------- | -------- |
| Phase     | 9        |
| Phase名   | 品質保証 |
| カテゴリ  | 品質     |
| 前提Phase | Phase 8  |
| 後続Phase | Phase 10 |

## 目的

型チェック・Lint・（可能なら）mirror parity を含む品質基準を満たしていることを確認し、Phase 10 のレビューを通せる状態にする。

## 実行タスク

### タスク1: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### タスク2: ESLint

```bash
pnpm --filter @repo/desktop lint
```

### タスク3: 全関連テスト（証跡）

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="persist-integration|SkillFileWriter|parseLlmResponseToContent"
```

## Current Facts（証跡に書くべき数字）

- persist-integration: 22件（`F-01〜F-06`, `E-10〜E-16`, `E-21〜E-29`）
- SkillFileWriter: 28件
- parseLlmResponseToContent: 14件
- 合計: 64件
