# Phase 8: リファクタリング

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 8              |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

動作を変えずにコード品質を改善する。テストが継続的に PASS することを確認しながらリファクタリングを行う。

## 実行タスク

### Task 1: ModifierResponse 型定義の一元化

- `modifier-skill.ts` のローカル `ModifierResponse` 定義を `packages/shared/src/slide/types.ts` からの import に置換（MINOR-2 対応）
- ローカル定義を削除し、import 文を追加
- 全テストが PASS することを確認

### Task 2: agent-client.ts のコード品質改善

- 直接 SDK 呼び出しコードの残存確認（`import Anthropic from "@anthropic-ai/sdk"` の直接参照が残っていないか）
- `safeStorage.decryptString()` の直接呼び出しを `IAuthKeyService` 経由に完全移行
- `process.env.ANTHROPIC_API_KEY` の直接参照を排除（P62 対策の徹底）

### Task 3: DI パターンの一貫性確認

- `AgentClientDependencies` の全フィールドがインターフェース型であることを確認（P61）
- `createModifierAgentAPI` の引数・戻り値が明示的に型付けされていることを確認
- 不要な `any` 型や `as` キャストが残存していないことを確認

### Task 4: コード重複の排除

- IPC handler 内のバリデーションロジックが既存の P42 パターンと重複していないか確認
- 共通化可能なバリデーションヘルパーがあれば抽出を検討（ただし過度な抽象化は避ける）

## 参照資料

| 資料名   | パス                               | 内容             |
| -------- | ---------------------------------- | ---------------- |
| 品質基準 | `.claude/rules/02-code-quality.md` | コーディング規約 |
| 設計原則 | `.claude/rules/01-architecture.md` | SOLID原則・DIP   |

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
cd apps/desktop && pnpm vitest run src/main/slide/__tests__/ --reporter verbose
```

## TDD検証

```bash
# テスト実行コマンド
cd apps/desktop && pnpm vitest run src/main/slide/__tests__/

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## 成果物

| 成果物               | パス                                            | 説明                    |
| -------------------- | ----------------------------------------------- | ----------------------- |
| リファクタリング対象 | `packages/shared/src/slide/types.ts`            | ModifierResponse 一元化 |
| リファクタリング対象 | `apps/desktop/src/main/slide/agent-client.ts`   | SDK 直接参照排除        |
| リファクタリング対象 | `apps/desktop/src/main/slide/modifier-skill.ts` | ローカル型定義削除      |

## 完了条件

- [x] `modifier-skill.ts` のローカル ModifierResponse 定義が shared import に置換されている
- [x] `agent-client.ts` から直接 SDK 呼び出しが排除されている
- [x] P61 準拠: 全 DI 引数がインターフェース型
- [x] `any` 型・`as` キャスト・non-null assertion が残存していない
- [x] 全テストが継続 PASS
- [x] 統合テストが継続成功
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 9: 品質検証
