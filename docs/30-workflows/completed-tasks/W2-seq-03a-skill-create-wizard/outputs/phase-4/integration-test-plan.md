# Phase 4: 統合テスト方針 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## 方針概要

本タスク（W0-seq-02）の実装対象 `inferSmartDefaults` は純粋関数であり、
外部 I/O・IPC・UI に依存しない。そのため統合テストは以下の方針で実施する。

## テスト分類

| テスト種別     | 対象                           | 実施方法                       |
| -------------- | ------------------------------ | ------------------------------ |
| ユニットテスト | `inferSmartDefaults` 関数単体  | Vitest（自動）                 |
| 統合確認       | barrel export 経由のインポート | Vitest + `@repo/shared` import |
| 手動確認       | REPL/CLI での動作確認          | NON_VISUAL（Phase 11）         |

## NON_VISUAL 方針

本タスクは GUI を持たないため、以下を統合確認の代替とする。

- `@repo/shared` からの named export が正常に解決されること
- TypeScript コンパイルエラーが発生しないこと（`pnpm typecheck`）
- barrel export のインポートパスが正しいこと

## 統合テスト確認内容

### barrel export 統合確認

```typescript
// @repo/shared 経由でインポートが解決されることを確認
import { inferSmartDefaults, type SkillInfoFormData } from "@repo/shared";

// テスト内でのインポート確認（smartDefaultReasoningService.test.ts 冒頭）
import { inferSmartDefaults, type SkillInfoFormData } from "@repo/shared";
```

### REPL 確認（NON_VISUAL）

```bash
# node REPL での動作確認（Phase 11 で実施）
node -e "
const { inferSmartDefaults } = require('./packages/shared/dist/index.js');
console.log(inferSmartDefaults({ skillName: 'test', purpose: 'Slack通知を送る', category: null }));
"
# 期待出力: { who: null, input: null, timing: null, output: null, tool: 'slack', format: null, inferenceLog: [...] }
```

## 統合テスト実行コマンド

```bash
# ユニットテスト（barrel import 経由）
pnpm vitest run packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts

# 型チェック（TypeScript コンパイル確認）
pnpm --filter @repo/shared typecheck

# shared パッケージビルド確認
pnpm --filter @repo/shared build
```

## 合格基準

- [x] 全ユニットテスト PASS（33件）
- [x] `@repo/shared` からの import が TypeScript エラーなしで解決される
- [x] `pnpm typecheck` が exit 0 で終了する
