# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 8                                                |
| 機能名 | SkillExecutor env オプション全環境変数上書き修正 |
| 作成日 | 2026-04-01                                       |

## 目的

1 行修正を崩さず、コメントだけを最小限に整える。変数抽出は行わない。

## 採用する変更

```typescript
env: { ...process.env, ANTHROPIC_API_KEY: apiKey }, // TASK-FIX-ENV-STRIPPING: process.env を展開し PATH 等を保持
```

### 変更方針

- 旧タスク ID `TASK-FIX-16-1` の文言は残さない
- `process.env` を展開する意図を 1 文で明示する
- `sdkEnv` のような中間変数は作らない

## 採用しない変更

| 項目                      | 理由                                 |
| ------------------------- | ------------------------------------ |
| `sdkEnv` 変数への抽出     | 1 行修正の複雑性を上げるだけ         |
| `AgentExecutor.ts` の追随 | 独立して正常動作しているため変更不要 |
| env 型の再定義            | SDK の既存型で十分                   |

## リファクタリング後の確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillExecutor.auth.test.ts

pnpm --filter @repo/desktop typecheck
```

## 参照資料

| 資料名 | パス                          | 説明           |
| ------ | ----------------------------- | -------------- |
| 実装   | `./phase-5-implementation.md` | 1 行修正の本体 |
| テスト | `./phase-4-test-creation.md`  | 回帰ケース     |

## 成果物

| 成果物         | パス                                     | 説明               |
| -------------- | ---------------------------------------- | ------------------ |
| リファクタ方針 | `phase-8-refactoring.md`                 | 本ファイル         |
| リファクタ出力 | `outputs/phase-8/refactoring-summary.md` | コメント整理の結果 |

## 完了条件

- [ ] `TASK-FIX-ENV-STRIPPING` のコメントだけが残っている
- [ ] `sdkEnv` 変数の抽出をしない判断が明記されている
- [ ] `AgentExecutor.ts` に変更を入れないことが明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
