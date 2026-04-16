# Phase 5: 実装

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 前提Phase  | Phase 4                                 |
| 後続Phase  | Phase 6                                 |
| 作成日     | 2026-04-15                              |
| ステータス | pending                                 |

## 目的

`SkillCreatorService.createSkill()` に `onProgress?` コールバック引数を追加し、
処理の5段階で呼び出す実装を行う（TDD の Red → Green 移行）。

## 実行タスク

- 既存テスト回帰確認（実装前 baseline 確認）
- `SkillCreatorProgressData` 型の定義追加
- `createSkill()` シグネチャへのオプショナルコールバック引数追加
- 処理の5段階での `onProgress?.()` 呼び出し実装
- Green 確認: Phase 4 で作成したテストが全 PASS することを確認
- 型チェック・lint 確認

## 参照資料

| 資料名                 | パス                                                                                  | 用途             |
| ---------------------- | ------------------------------------------------------------------------------------- | ---------------- |
| Phase 4 テスト仕様書   | `phase-4-test-creation.md`                                                            | テストケース参照 |
| Phase 2 設計書         | `outputs/phase-2/design.md`                                                           | 実装設計参照     |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         | 修正対象ファイル |
| テストファイル         | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` | Green 確認対象   |

## 実行手順

### 0. 既存テスト回帰確認（baseline 確認）【必須】

```bash
# 変更前の既存テストを実行して baseline 確認
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
# 期待: 全 PASS（変更前の状態）

# Phase 4 テストが FAIL していることを確認（Red状態）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts
# 期待: FAIL（onProgress 未実装のため）
```

### 1. `SkillCreatorProgressData` 型の定義

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` の冒頭付近（既存の型定義と同じ場所）に追加:

```typescript
// 進捗コールバック用の型定義
type SkillCreatorProgressData = {
  phase: string;
  percentage: number;
  message: string;
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;
```

### 2. `createSkill()` シグネチャへのコールバック引数追加

```typescript
// 変更前
async createSkill(options: CreateSkillOptions): Promise<string> {

// 変更後
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string> {
```

### 3. 処理の5段階での呼び出し実装

`createSkill()` メソッド内の適切な位置に5箇所の呼び出しを追加:

```typescript
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string> {
  // ... 既存の前処理 ...

  // 段階1: planning（createSkill 開始直後・mode 分岐前）
  onProgress?.({ phase: "planning", percentage: 10, message: "構造を計画しています" });

  switch (options.mode) {
    case "create":
      structurePlan = await this.runCreateWorkflow(options);
      break;
    // ... 他のモード ...
  }

  // 段階2: generating-skill（SKILL.md 生成開始直前）
  onProgress?.({ phase: "generating-skill", percentage: 40, message: "SKILL.md を生成しています" });

  // ... SKILL.md 生成処理 ...

  // 段階3: generating-agents（エージェント定義生成開始直前）
  onProgress?.({ phase: "generating-agents", percentage: 70, message: "エージェント定義を生成しています" });

  // ... エージェント定義生成処理 ...

  // 段階4: validating（検証開始直前）
  onProgress?.({ phase: "validating", percentage: 90, message: "スキルを検証しています" });

  // ... 検証処理 ...

  // 段階5: done（完了直前）
  onProgress?.({ phase: "done", percentage: 100, message: "完了しました" });

  return skillDir;
}
```

### 4. Green 確認コマンド

```bash
# Phase 4 テストが PASS することを確認（Green状態）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts
# 期待: PASS（全8テストケース）

# 既存テストが引き続き PASS することを確認
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
# 期待: PASS（回帰なし）
```

### 5. 型チェック・lint 確認

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
# 期待: 0 error

# ESLint
pnpm --filter @repo/desktop lint
# 期待: 0 error
```

## 統合テスト連携【必須】

| 判定項目       | 基準                             | 結果    |
| -------------- | -------------------------------- | ------- |
| Green 確認     | Phase 4 テストが全 PASS すること | pending |
| 既存テスト回帰 | 既存テストへの影響がないこと     | pending |
| 型チェック     | `pnpm typecheck` が 0 error      | pending |

## 多角的チェック観点

| 観点           | チェック内容                                                                  |
| -------------- | ----------------------------------------------------------------------------- |
| 実装の完全性   | 5段階全てのコールバック呼び出しが実装されているか                             |
| オプショナル性 | `onProgress` が `undefined` の場合のガード（`?.`）が全5箇所で使用されているか |
| 順序の正確性   | planning → generating-skill → generating-agents → validating → done の順か    |
| 型安全性       | `SkillCreatorProgressData` 型に沿ったデータが渡されているか                   |

## 成果物

| 成果物       | パス                                                          | 説明                                    |
| ------------ | ------------------------------------------------------------- | --------------------------------------- |
| 実装ファイル | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | コールバック引数追加・5段階呼び出し実装 |

## 完了条件

- [ ] 既存テスト回帰確認（baseline）が完了
- [ ] `SkillCreatorProgressData` 型と `SkillCreatorProgressCallback` 型が追加されている
- [ ] `createSkill()` のシグネチャに `onProgress?` が追加されている
- [ ] 5段階の `onProgress?.()` 呼び出しが実装されている
- [ ] Phase 4 テスト（TC-01〜TC-08）が全 PASS している（Green）
- [ ] 既存テストが回帰なしで PASS している
- [ ] `pnpm typecheck` が 0 error
- [ ] `pnpm lint` が 0 error
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 既存テスト回帰確認（baseline・Red状態確認）
2. `SkillCreatorProgressData` / `SkillCreatorProgressCallback` 型追加
3. `createSkill()` シグネチャ変更
4. 5段階の `onProgress?.()` 呼び出し実装
5. Green 確認（Phase 4 テスト PASS）
6. 既存テスト回帰確認（PASS）
7. 型チェック・lint 確認
8. 実装サマリーの出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 6: テスト拡充
