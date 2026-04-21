# Phase 5: 実装（TDD Green フェーズ）

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| Phase      | 5                                                                   |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001                                     |
| ステータス | 未実施                                                              |
| 作成日     | 2026-04-21                                                          |
| タスク種別 | NON_VISUAL（UI変更なし）                                            |
| 実装モード | `"new"`（新規実装）                                                 |
| 入力       | Phase 4 で作成した `SkillCreatorService.update.test.ts`（Red 状態） |

## 目的

TDD の Green フェーズとして、Phase 4 で作成した `runUpdateWorkflow` テストを全て PASS させる最小実装を行う。
スタブ状態（`break` のみ）の `case "update":` ブロックを実処理に置き換え、
既存スキルの SKILL.md を実際に読み込んで更新・書き戻す処理を実装する。

重要な制約として、このフェーズで変更するのは `SkillCreatorService.ts` のみである。
テストファイル（`SkillCreatorService.update.test.ts`）は Red 状態から変更しない。

## 実装対象ファイル

| 対象ファイル                                                  | 作業内容                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | `runUpdateWorkflow()` メソッド実装・`case "update":` 修正 |

変更しないファイル:

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`
- その他既存テストファイル群

## update モードの PROGRESS_FLOWS

実装は以下の進捗フローに準拠すること。

```
loading-skill(10%) → analyzing(30%) → generating-skill(60%) → validating(90%) → done(100%)
```

## 実装内容

### Step 1: `case "update":` の修正

現在の `case "update":` ブロック（`SkillCreatorService.ts` L412-415 付近）を修正し、
`runUpdateWorkflow()` の呼び出しを追加する。

修正前（スタブ状態）:

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  break;  // 実処理なし
```

修正後のイメージ（実処理追加）:

- `emitProgress` の呼び出しを `runUpdateWorkflow()` 内に移管するか、
  または `case "update":` 内から `runUpdateWorkflow()` を呼び出してその結果を利用する
- `runCreateWorkflow()` の呼び出しパターン（L980-1003 付近）を参考にする

### Step 2: `runUpdateWorkflow()` メソッドの実装

`runCreateWorkflow()` のパターンに準拠して `runUpdateWorkflow()` を新規実装する。

実装すべき処理の流れ:

1. `emitProgress("loading-skill")` を発火する
2. `throwIfAborted(signal)` で AbortSignal を確認する
3. `fs.readFile()` で既存の SKILL.md を読み込む（ファイルが存在しない場合はエラー）
4. `emitProgress("analyzing")` を発火する
5. `throwIfAborted(signal)` で AbortSignal を確認する
6. `llmClient` が存在する場合は `extractPurposeWithLlm()` で purpose を再生成する
7. `emitProgress("generating-skill")` を発火する
8. `throwIfAborted(signal)` で AbortSignal を確認する
9. 読み込んだ SKILL.md に更新内容（purpose 等）をマージして新しい内容を生成する
10. `emitProgress("validating")` を発火する
11. `fs.writeFile()` で更新済み SKILL.md を書き戻す
12. `emitProgress("done")` を発火する
13. 更新結果（`StructurePlanJson` または更新フラグ）を返す

AbortSignal の確認タイミング:

- `loading-skill` と `analyzing` の間
- `analyzing` と `generating-skill` の間
- `generating-skill` と `validating` の間

エラーハンドリング:

- `isAbortError(error)` の場合は `throw` してキャンセルを伝播する
- `fs.readFile()` が失敗した場合（ENOENT 等）は `null` を返す
- `extractPurposeWithLlm()` が失敗した場合は purpose なしで処理を継続する（`runCreateWorkflow` のパターンに準拠）

## 参照パターン（コード参考）

`runCreateWorkflow()` の実装パターン（L980-1003 付近）を参考にすること:

```typescript
// 参考: runCreateWorkflow のエラーハンドリングパターン
private async runCreateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<StructurePlanJson | null> {
  this.throwIfAborted(signal);
  try {
    const purpose = await this.extractPurposeWithLlm(options, signal);
    // ... 処理 ...
    return structurePlan;
  } catch (error) {
    if (this.isAbortError(error)) throw error;
    return null;
  }
}
```

`extractPurposeWithLlm()` の再利用パターン:

```typescript
// 参考: extractPurposeWithLlm の llmClient ガード
private async extractPurposeWithLlm(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<string | null> {
  if (!this.llmClient) { return null; }
  // ...
}
```

## 実行手順

### Step 1: 実装

`SkillCreatorService.ts` に `runUpdateWorkflow()` メソッドを追加し、
`case "update":` ブロックを修正して `runUpdateWorkflow()` を呼び出すようにする。

### Step 2: テスト実行（Green 確認）

```bash
pnpm --filter @repo/desktop test SkillCreatorService.update
```

Phase 4 で Red 状態だったテスト（UPD-NORMAL-01〜02・UPD-ABORT-01〜03・UPD-ERROR-01）が全て PASS することを確認する。

### Step 3: 既存テスト全体の PASS 確認

```bash
pnpm --filter @repo/desktop test
```

`runUpdateWorkflow()` の追加によって既存テストが壊れていないことを確認する。
特に以下を確認する:

- `SkillCreatorService.test.ts` の全テストが PASS している
- `SkillCreatorService.purpose.test.ts` の全テストが PASS している
- `SkillCreatorService-cancel.test.ts` の全テストが PASS している
- `SkillCreatorService.integration.test.ts` の全テストが PASS している

## NON_VISUAL タスクの記録

本フェーズで変更するのは `SkillCreatorService.ts` のみであり、
UI コンポーネント・スタイル・レイアウトへの変更はない。NON_VISUAL タスクとして記録する。

## 参照資料

- Phase 4 で作成した `SkillCreatorService.update.test.ts`（Red 状態）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（実装対象・既存パターン参照）

## 成果物

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（`runUpdateWorkflow()` 実装済み）
- `outputs/phase-5/green-test-result.md`（全 PASS の確認記録。テストID・実行時間を記載）

## 完了条件

- [ ] `runUpdateWorkflow()` メソッドが `SkillCreatorService.ts` に実装されている
- [ ] `case "update":` ブロックが `runUpdateWorkflow()` を呼び出す実処理に変更されている
- [ ] Phase 4 のテスト（UPD-NORMAL-01〜02・UPD-ABORT-01〜03・UPD-ERROR-01）が全て PASS している
- [ ] PROGRESS_FLOWS（`loading-skill` → `analyzing` → `generating-skill` → `validating` → `done`）が正しい順序で発火している
- [ ] `pnpm --filter @repo/desktop test` 全体実行で既存テストが引き続き PASS している
- [ ] `green-test-result.md` に全 PASS の確認記録が記載されている

## タスク100%実行確認【必須】

1. `runUpdateWorkflow()` に AbortSignal 確認（`throwIfAborted`）が各ステップに実装されているか
2. `llmClient` あり/なしの両分岐が実装されているか
3. `fs.readFile()` エラー時のハンドリングが実装されているか
4. テストファイル（`SkillCreatorService.update.test.ts`）を変更していないことを `git diff` で確認したか
5. `pnpm --filter @repo/desktop test` 全体で既存テストが PASS していることを確認したか
6. `green-test-result.md` に実行日時・テスト数・実行時間を記録したか

## 次Phase

Phase 6（テスト拡充・fail path 追加）へ進む。
Green 状態を維持したまま、fail path テスト・回帰ガード・補助テストを追加して
`runUpdateWorkflow()` の堅牢性を高める。
