# Phase 4 成果物: テストコマンドスイート

## タスク情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |
| 作成日   | 2026-04-11                                            |

## テスト実行コマンド

### 対象テストのみ実行（targeted run）

```bash
# SmartDefault関連テストのみ実行
cd /path/to/repo
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm vitest run \
  packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts \
  --reporter=verbose
```

### TC-FB03 新規テストのみ実行

```bash
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm vitest run \
  packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts \
  --reporter=verbose \
  --grep "TC-FB03"
```

### 全テスト実行（回帰確認）

```bash
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm --filter @repo/shared vitest run --reporter=verbose
```

### 事前確認（依存関係整合）

```bash
pnpm install
pnpm --filter @repo/shared build
```

## TDD Red確認手順

1. Phase 5（実装）前にTC-FB03-01〜04 の Red状態を確認する
   → テストケース追加後、SKILL.md/phase-template-execution.md更新前に一度実行
   → ただし本タスクは docs-only のため、テスト自体はすでに Greenになると予想される
   → なぜなら: `inferSmartDefaults` の実装はすでにフィールド独立推論を行っているため

## 予想テスト実行結果（Phase 4時点）

| テストケース | Phase 4時点の予想 | 理由                                     |
| ------------ | ----------------- | ---------------------------------------- |
| TC-FB03-01   | GREEN（PASS）     | 実装はすでにcategoryからformatを独立推論 |
| TC-FB03-02   | GREEN（PASS）     | category=null→format=nullは既存動作      |
| TC-FB03-03   | GREEN（PASS）     | purposeはformatに影響しない（既存動作）  |
| TC-FB03-04   | GREEN（PASS）     | 全フィールド有効→全推論（既存動作）      |

> **注**: このタスクはdocs-onlyのため、「TDD Red段階」は
> 「テストが存在しない（=テストが追加される前）」状態を指す。
> テスト追加後はすぐにGreenになる（実装は正しい）。
