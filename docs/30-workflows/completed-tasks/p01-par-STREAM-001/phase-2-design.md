# Phase 2: 設計

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 2                                       |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 前提Phase  | Phase 1                                 |
| 後続Phase  | Phase 3                                 |
| 作成日     | 2026-04-15                              |
| ステータス | pending                                 |

## 目的

`SkillCreatorService.createSkill()` へのコールバック引数追加の詳細設計を確定する。
型定義・シグネチャ変更・各段階での呼び出しポイントを設計し、
TASK-SW-STREAM-002 への接続インターフェースを明確化する。

## 実行タスク

- 進捗データ型の定義設計
- `createSkill()` シグネチャ変更設計
- 処理の節目での呼び出しポイント設計（5段階）
- 既存テストへの影響範囲の設計
- TASK-SW-STREAM-002 との接続インターフェース定義
- 検証マトリクスの定義

## 参照資料

| 資料名                  | パス                                                                                    | 用途                     |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物          | `outputs/phase-1/requirements-definition.md`                                            | 要件・AC参照             |
| phase-2-solution.md     | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` | 解決策設計参照           |
| SkillCreatorService.ts  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                           | 修正対象コード確認       |
| useStreamingProgress.ts | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                               | 期待する進捗データ型確認 |

## 実行手順

### 1. 進捗データ型の設計

`useStreamingProgress.ts` の `StreamingProgressApi.onProgress` が期待する型を確認した上で、
`SkillCreatorService.ts` 内で使用するコールバック型を設計する。

```typescript
// 進捗データ型（useStreamingProgress.ts の期待型と一致させる）
type SkillCreatorProgressData = {
  phase: string;
  percentage: number;
  message: string;
};

// コールバック型
type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;
```

**型配置方針**:

- `SkillCreatorProgressData` は `SkillCreatorService.ts` 内に定義する（単一ファイル使用）
- TASK-SW-STREAM-002 での `sendSkillCreatorProgress` 呼び出し時に同型を参照できるよう、
  将来的に `packages/shared/` への移動を未タスクとして記録する

### 2. `createSkill()` シグネチャ変更設計

```typescript
// 変更前
async createSkill(options: CreateSkillOptions): Promise<string>

// 変更後
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string>
```

**設計ポイント**:

- `onProgress` はオプショナル（`?:`）のため、既存の呼び出し元への破壊的変更なし
- コールバックが `undefined` の場合は呼び出しをスキップする（ガード付き呼び出し）
- コールバックの例外は握りつぶさず、呼び出し元へ伝播させる（配線不整合を早く検知する）

```typescript
// ガード付き呼び出しパターン
onProgress?.({
  phase: "planning",
  percentage: 10,
  message: "構造を計画しています",
});
```

### 3. 処理の節目での呼び出しポイント設計（5段階）

`SkillCreatorService.ts` の `createSkill` メソッド内の5箇所で `onProgress` を呼び出す:

| 段階 | 呼び出しタイミング                                      | phase                 | percentage | message                              |
| ---- | ------------------------------------------------------- | --------------------- | ---------- | ------------------------------------ |
| 1    | `createSkill()` 開始直後・mode 分岐前                   | `"planning"`          | 10         | `"構造を計画しています"`             |
| 2    | SKILL.md 生成開始直前（`generate_skill_md` 呼び出し前） | `"generating-skill"`  | 40         | `"SKILL.md を生成しています"`        |
| 3    | エージェント定義生成開始直前                            | `"generating-agents"` | 70         | `"エージェント定義を生成しています"` |
| 4    | 検証開始直前（`validateSkill` 呼び出し前）              | `"validating"`        | 90         | `"スキルを検証しています"`           |
| 5    | 処理完了直後（`return skillDir` 直前）                  | `"done"`              | 100        | `"完了しました"`                     |

- `generateTasks` の有無に関わらず、`generating-agents`（70%）の通知は送る。進捗はワークフローの段階を表し、タスク仕様書生成の有無とは切り離す。

**実装イメージ**:

```typescript
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string> {
  // ... 既存の前処理 ...

  // 段階1: planning
  onProgress?.({ phase: "planning", percentage: 10, message: "構造を計画しています" });

  switch (options.mode) {
    case "create":
      structurePlan = await this.runCreateWorkflow(options);
      break;
    // ...
  }

  // 段階2: generating-skill
  onProgress?.({ phase: "generating-skill", percentage: 40, message: "SKILL.md を生成しています" });

  // SKILL.md 生成処理 ...

  // 段階3: generating-agents
  onProgress?.({ phase: "generating-agents", percentage: 70, message: "エージェント定義を生成しています" });

  // エージェント定義生成処理 ...

  // 段階4: validating
  onProgress?.({ phase: "validating", percentage: 90, message: "スキルを検証しています" });

  // 検証処理 ...

  // 段階5: done
  onProgress?.({ phase: "done", percentage: 100, message: "完了しました" });

  return skillDir;
}
```

### 4. 既存テストへの影響範囲の設計

コールバック引数はオプショナルのため、既存のテストコードへの変更は最小限:

| テストファイル                                                                | 影響内容                                       | 対応方針                       |
| ----------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts` | `createSkill` モックのシグネチャ変更の影響なし | オプショナル引数のため変更不要 |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`     | 同上                                           | 変更不要                       |

### 5. TASK-SW-STREAM-002 との接続インターフェース定義

TASK-SW-STREAM-002 は本タスクで追加した `onProgress` コールバックを受け取り、
`sendSkillCreatorProgress(mainWindow, progress)` に接続する:

```typescript
// TASK-SW-STREAM-002 での使用イメージ（本タスクのスコープ外）
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

本タスクの成果物が TASK-SW-STREAM-002 の前提条件となる。

### 6. 検証マトリクス

| テスト対象                 | テストコマンド                                                         |
| -------------------------- | ---------------------------------------------------------------------- |
| SkillCreatorService テスト | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/` |
| 型チェック                 | `pnpm --filter @repo/desktop typecheck`                                |
| lint                       | `pnpm --filter @repo/desktop lint`                                     |
| 既存統合テスト             | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/`  |

## 統合テスト連携【必須】

| 判定項目               | 基準     | 結果    |
| ---------------------- | -------- | ------- |
| 型チェック（設計段階） | PASS     | pending |
| シグネチャ互換性       | 後方互換 | pending |

## 多角的チェック観点

| 観点               | チェック内容                                                                     |
| ------------------ | -------------------------------------------------------------------------------- |
| 後方互換性         | `onProgress` がオプショナルで既存呼び出し元への破壊的変更がないか                |
| 型整合性           | `SkillCreatorProgressData` が `useStreamingProgress.ts` の期待型と一致しているか |
| 呼び出しタイミング | 5段階のコールバック呼び出しが処理フローの適切なタイミングに配置されているか      |
| 接続境界           | TASK-SW-STREAM-002 との責務分離が明確か                                          |

## 成果物

| 成果物 | パス                        | 説明                                                           |
| ------ | --------------------------- | -------------------------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 型定義・シグネチャ変更・呼び出しポイント・接続インターフェース |

## 完了条件

- [ ] 進捗データ型（`SkillCreatorProgressData`）の定義が確定済み
- [ ] `createSkill()` の変更後シグネチャが確定済み
- [ ] 5段階の呼び出しポイントと各段階のデータが確定済み
- [ ] 既存テストへの影響範囲が「変更不要」と確認済み
- [ ] TASK-SW-STREAM-002 との接続インターフェースが定義済み
- [ ] 検証マトリクスが定義済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 進捗データ型の設計
2. `createSkill()` シグネチャ変更設計
3. 5段階の呼び出しポイント設計
4. 既存テストへの影響範囲確認
5. TASK-SW-STREAM-002 との接続インターフェース定義
6. 検証マトリクス定義
7. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 3: 設計レビューゲート
