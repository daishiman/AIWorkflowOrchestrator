# Phase 5: 実装

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 5                                             |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | Phase 4                                       |
| 後続Phase  | Phase 6                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

`void structurePlan` を削除し、`structurePlan` の内容を `plan` オブジェクトに接続する
配線実装を行う（TDD Red → Green 移行）。
TASK-SW-STRUCT-001 の完了を確認してから実装を開始する。

## 前提条件確認（実装開始前に必須）

```bash
# TASK-SW-STRUCT-001 の完了確認（purpose フィールドが options.description ベースか確認）
grep -n "purpose\|extractPurposeAgent" apps/desktop/src/main/services/skill/SkillCreatorService.ts
# 期待: purpose に options.description が設定されていること（extractPurposeAgent の直接代入ではない）
```

**TASK-SW-STRUCT-001 が未完了の場合、Phase 5 の実装を開始してはならない。**

## 実行タスク

- 既存テスト回帰確認（実装前 baseline 確認）
- TASK-SW-STRUCT-001 完了確認
- `void structurePlan` の削除実装
- `plan` オブジェクト生成ロジックの分岐実装
- Green 確認: Phase 4 で作成したテストが全 PASS することを確認
- 型チェック・lint 確認

## 参照資料

| 資料名                 | パス                                                          | 用途             |
| ---------------------- | ------------------------------------------------------------- | ---------------- |
| Phase 4 テスト設計書   | `outputs/phase-4/test-design.md`                              | テストケース参照 |
| Phase 2 設計書         | `outputs/phase-2/design.md`                                   | 実装設計参照     |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 修正対象ファイル |

## 実行手順

### 0. 既存テスト回帰確認（baseline 確認）【必須】

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
# 期待: 全 PASS（変更前の状態）
```

### 1. TASK-SW-STRUCT-001 完了確認

```bash
grep -n "structurePlan\|purpose\|runCreateWorkflow" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

`structurePlan.purpose` に `options.description` が設定されていることを確認してから実装に進む。

### 2. `void structurePlan` の削除

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` の行 126 を削除する:

```typescript
// 削除対象
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

この1行を削除することで `structurePlan` 変数が後続コードから参照可能になる。

### 3. `plan` オブジェクト生成ロジックの分岐実装

行 180-194 付近の `plan` オブジェクト生成を以下の分岐ロジックに変更する:

```typescript
const plan =
  structurePlan !== null
    ? {
        skillName: structurePlan.skillName,
        workflow: {
          summary: structurePlan.description,
          anchors: structurePlan.anchors ?? [],
          trigger: {
            description: structurePlan.purpose,
            keywords: [structurePlan.skillName],
          },
          phases: [],
          tasks: [],
        },
        directories: {},
        files: [],
      }
    : {
        skillName: options.name,
        workflow: {
          summary: options.description,
          anchors: [],
          trigger: {
            description: `Use when ${options.name} is requested`,
            keywords: [options.name],
          },
          phases: [],
          tasks: [],
        },
        directories: {},
        files: [],
      };
```

### 4. Green 確認コマンド

```bash
# Phase 4 テストが PASS することを確認（Green 状態）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts
# 期待: PASS（TC-01〜TC-07）

# 既存テストが引き続き PASS することを確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
# 期待: PASS（collaborative モード回帰なし）
```

### 5. 型チェック・lint 確認

```bash
pnpm --filter @repo/desktop typecheck
# 期待: 0 error

pnpm --filter @repo/desktop lint
# 期待: 0 error
```

## 統合テスト連携【必須】

`void structurePlan` 削除・接続配線の実装とテスト支援コード整備。

| 判定項目            | 基準                             | 結果    |
| ------------------- | -------------------------------- | ------- |
| STRUCT-001 完了確認 | purpose が正しい値であること     | pending |
| Green 確認          | Phase 4 テストが全 PASS すること | pending |
| 既存テスト回帰      | collaborative モード回帰なし     | pending |
| 型チェック          | `pnpm typecheck` が 0 error      | pending |

## 多角的チェック観点

| 観点               | チェック内容                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------- |
| 前提条件確認       | TASK-SW-STRUCT-001 完了（purpose フィールドの正しい値）を実装前に確認済みか              |
| null 安全性        | `structurePlan !== null` の条件分岐が TypeScript で正しく型ガードとして機能するか        |
| フォールバック動作 | `collaborative` モードが `structurePlan === null` でフォールバックを使うことを確認済みか |
| `anchors ?? []`    | `anchors` が undefined のとき `[]` にフォールバックすることを確認済みか                  |

## 成果物

| 成果物           | パス                                                          | 説明                                     |
| ---------------- | ------------------------------------------------------------- | ---------------------------------------- |
| 実装ファイル     | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | `void structurePlan` 削除・plan 接続配線 |
| 実装ステップ記録 | `outputs/phase-5/implementation-plan.md`                      | 実装手順・変更内容・テスト結果の記録     |

## 完了条件

- [ ] TASK-SW-STRUCT-001 完了確認済み
- [ ] 既存テスト回帰確認（baseline）が完了
- [ ] `void structurePlan` が削除されている
- [ ] `plan` オブジェクト生成ロジックが分岐実装済み
- [ ] Phase 4 テスト（TC-01〜TC-07）が全 PASS している（Green）
- [ ] 既存テストが回帰なしで PASS している
- [ ] `pnpm typecheck` が 0 error
- [ ] `pnpm lint` が 0 error
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 既存テスト回帰確認（baseline）
2. TASK-SW-STRUCT-001 完了確認
3. `void structurePlan` 削除実装
4. `plan` オブジェクト生成分岐実装
5. Green 確認（Phase 4 テスト PASS）
6. 既存テスト回帰確認（PASS）
7. 型チェック・lint 確認
8. 実装ステップ記録の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 6: テスト拡充
