# TASK-SW-STREAM-001 要件定義書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 作成日     | 2026-04-16                              |
| ステータス | 完了                                    |

## P50チェック: 既実装状態の確認結果

### `createSkill()` シグネチャ確認

```
apps/desktop/src/main/services/skill/SkillCreatorService.ts:79
async createSkill(options: CreateSkillOptions): Promise<string>
```

**確認結果**: `onProgress` 引数なし ✅（未実装を確認）

### `sendSkillCreatorProgress` 呼び出し元確認

```
grep -rn "sendSkillCreatorProgress" apps/ packages/
→ 定義箇所: skillCreatorHandlers.ts:692
→ 呼び出し元: なし（テストファイルのみ）
```

**確認結果**: 呼び出し元が存在しないことを確認 ✅

### フロント側接続確認

`useStreamingProgress.ts` の `onProgress` は以下の型で正しく実装済み:

```typescript
onProgress?: (
  callback: (progress: {
    phase: string;
    percentage: number;
    message: string;
  }) => void,
```

**確認結果**: フロント・Preload 側は変更不要 ✅

## 機能要件

| 要件ID | 内容                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------ |
| FR-01  | `createSkill()` が第2引数 `onProgress?: (progress: SkillCreatorProgressData) => void` を受け取る |
| FR-02  | `runCreateWorkflow` 開始直前に `planning` フェーズで呼び出す（percentage: 10）                   |
| FR-03  | SKILL.md 生成開始直前に `generating-skill` フェーズで呼び出す（percentage: 40）                  |
| FR-04  | タスク仕様書生成直前に `generating-agents` フェーズで呼び出す（percentage: 70）                  |
| FR-05  | 検証開始直前に `validating` フェーズで呼び出す（percentage: 90）                                 |
| FR-06  | 処理完了直前に `done` フェーズで呼び出す（percentage: 100）                                      |
| FR-07  | `onProgress` が未指定の場合でも正常動作する（オプショナル）                                      |

## 非機能要件

| 要件ID | 内容                                                            |
| ------ | --------------------------------------------------------------- |
| NFR-01 | 既存の呼び出し元（skillCreatorHandlers.ts）に破壊的変更をしない |
| NFR-02 | TypeScript 型チェックが 0 error                                 |
| NFR-03 | 既存テストが回帰なしで PASS する                                |

## 断絶箇所の特定

| 断絶箇所                                    | 確認内容                                | 結果     |
| ------------------------------------------- | --------------------------------------- | -------- |
| `sendSkillCreatorProgress` の呼び出し元なし | テストファイルのみで呼び出し元なし      | 確認済み |
| `createSkill` にコールバック引数なし        | シグネチャに `onProgress` が存在しない  | 確認済み |
| 処理の節目でコールバック呼び出しなし        | SkillCreatorService.ts 内に進捗通知なし | 確認済み |

## タスク分類

| 分類項目   | 値                                       |
| ---------- | ---------------------------------------- |
| タスク種別 | バグ修正タスク                           |
| UIタスク   | 非UIタスク（UIの見た目変更なし）         |
| 可視性     | NON_VISUAL（メインプロセス内部変更のみ） |
| テスト種別 | ユニットテスト（メインプロセス層）       |

## スコープ外

- `skillCreatorHandlers.ts` でのコールバック接続（TASK-SW-STREAM-002）
- フロント・Preload 側の変更（変更不要）
- キャンセル処理の IPC 接続（TASK-SW-CANCEL-001〜004）
