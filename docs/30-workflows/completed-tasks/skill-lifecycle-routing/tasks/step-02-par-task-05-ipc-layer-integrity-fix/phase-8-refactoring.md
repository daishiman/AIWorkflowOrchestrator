# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| Phase    | 8                                                      |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001                   |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix      |
| 作成日   | 2026-03-17                                             |
| 前Phase  | [Phase 7: カバレッジ確認](./phase-7-coverage-check.md) |

## 目的

Phase 5 の実装コードを品質改善する。機能的な変更を加えず、コードの可読性・保守性・一貫性を向上させる。

## 参照資料

| 資料名           | パス                                         | 説明                                |
| ---------------- | -------------------------------------------- | ----------------------------------- |
| コード品質ルール | `.claude/rules/02-code-quality.md`           | TypeScript 型安全・コーディング規約 |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`         | P42/P45 の詳細                      |
| skillHandlers.ts | `apps/desktop/src/main/ipc/skillHandlers.ts` | リファクタリング対象                |
| skill-api.ts     | `apps/desktop/src/preload/skill-api.ts`      | リファクタリング対象                |

## 実行タスク

### タスク 1: バリデーション共通関数化の検討

`skillHandlers.ts` L800付近には既に `validateStringArg()` 関数が実装されている（TASK-9G で追加されたスケジュールハンドラ用）。この共通関数を SKILL_UPDATE ハンドラにも適用できるか評価する。

```bash
# 既存の validateStringArg 関数を確認
grep -n "validateStringArg\|function validateStringArg" \
  apps/desktop/src/main/ipc/skillHandlers.ts | head -20
```

#### 評価基準

| 適用条件                                               | 判断     |
| ------------------------------------------------------ | -------- |
| `validateStringArg` がファイルスコープで定義されている | 適用可能 |
| 関数シグネチャが SKILL_UPDATE のユースケースに合致する | 適用可能 |
| 適用後も `throw` のセマンティクスが維持される          | 適用可能 |

既存の `validateStringArg` が以下のシグネチャの場合:

```typescript
function validateStringArg(
  value: unknown,
  argName: string,
): { code: string; message: string } | null;
```

SKILL_UPDATE ハンドラへの適用パターン:

```typescript
// リファクタリング後（既存 validateStringArg を活用）
const skillNameError = validateStringArg(skillName, "skillName");
if (skillNameError) throw skillNameError;
```

**重要**: リファクタリング後もテストが全件 PASS することを確認する。

### タスク 2: updates バリデーションの統一検討

`updates` オブジェクトのバリデーションロジック（null チェック・配列チェック）を共通関数化することを検討する。ただし現時点では SKILL_UPDATE のみの使用のため、共通化のコストが便益を上回る場合はインライン維持を選択する。

#### 判断基準

| 条件                                  | 判断             |
| ------------------------------------- | ---------------- |
| 同一パターンが3箇所以上に重複している | 共通関数化を推奨 |
| 同一パターンが1-2箇所のみ             | インライン維持   |

現状（Phase 5 実装後）は SKILL_UPDATE の1箇所のみのため、インライン維持を推奨する。

### タスク 3: コメント・ドキュメントの整備

#### 3-1: skillHandlers.ts の SKILL_UPDATE ハンドラにコメント追加

```typescript
// skill:update - スキルを更新（TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001）
// P45準拠: skillName（セマンティクスに一致、skillId ではない）
// P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
ipcMain.handle(
  IPC_CHANNELS.SKILL_UPDATE,
  ...
```

#### 3-2: skill-api.ts の getDetail / update にコメント追加

既存メソッドと同じスタイルで JSDoc コメントを整備する:

```typescript
/**
 * スキル詳細を取得する
 * @param skillId - スキルID（非空文字列必須）
 * @returns スキル詳細オブジェクト（見つからない場合は null）
 * @throws {{ code: "VALIDATION_ERROR" }} skillId が不正な場合
 */
getDetail: (skillId: string): Promise<unknown> => { ... }

/**
 * スキルを更新する
 * @param skillName - スキル名（非空文字列必須、P45準拠）
 * @param updates - 更新内容（非null オブジェクト必須）
 * @throws {{ code: "VALIDATION_ERROR" }} 引数が不正な場合
 */
update: (skillName: string, updates: Record<string, unknown>): Promise<void> => { ... }
```

### タスク 4: 型定義の精緻化

Phase 5 で `getDetail` の戻り値型を `unknown` として実装した場合、ここで具体的な型に変更する。

```bash
# skillHandlers.ts L260 の getSkillById の戻り値型を確認
grep -n "getSkillById\|Skill\|SkillMetadata\|SkillDetail" \
  apps/desktop/src/main/services/skill/SkillService.ts | head -15
```

既存ハンドラ（L260-263）の戻り値が `Skill | null` 型の場合:

```typescript
// skill-api.ts の型定義更新（unknown → 具体的な型）
import type { Skill } from "@repo/shared/types/skill"; // または既存の型

getDetail: (skillId: string): Promise<Skill | null> => { ... }
```

**P23準拠**: 型変更後は `pnpm typecheck` を実行して型整合を確認する。

### タスク 5: リファクタリング後の品質確認

```bash
# テストが全件 PASS することを確認
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.update.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.getDetail-update.test.ts

# 型チェック
cd apps/desktop && pnpm typecheck

# カバレッジが維持されていることを確認
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.update.test.ts \
  --coverage --coverage.include="src/main/ipc/skillHandlers.ts"
```

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                   | パス                                         | 説明                                   |
| ------------------------ | -------------------------------------------- | -------------------------------------- |
| skillHandlers.ts（更新） | `apps/desktop/src/main/ipc/skillHandlers.ts` | コメント整備・必要に応じて共通関数適用 |
| skill-api.ts（更新）     | `apps/desktop/src/preload/skill-api.ts`      | JSDoc コメント整備・型定義精緻化       |
| リファクタリング報告     | `outputs/phase-8/refactoring-report.md`      | 変更内容・判断根拠の記録               |

## 完了条件

- [ ] `validateStringArg` の適用可否を評価し、判断根拠を記録した
- [ ] updates バリデーションの共通化可否を評価し、インライン維持またはリファクタリングを決定した
- [ ] SKILL_UPDATE ハンドラに適切なコメントが追加されている（P45・P42準拠の明示）
- [ ] `getDetail` / `update` に JSDoc コメントが追加されている
- [ ] `getDetail` の戻り値型が `unknown` から具体的な型に変更されている（可能な場合）
- [ ] リファクタリング後も全テストが PASS している
- [ ] `pnpm typecheck` でエラーが 0 件
- [ ] カバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）が維持されている
- [ ] `outputs/phase-8/refactoring-report.md` が作成済み
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 8
```

## 次Phase

Phase 9: 品質検証（[phase-9-quality-assurance.md](./phase-9-quality-assurance.md)）
