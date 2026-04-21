# Phase 2 成果物: 検証導線（validation-path）

## 目的

Phase 2 設計で定義した 5 ステップの検証導線について、
各ステップのコマンド / 実行タイミング / 期待出力を具体化する。

## 検証導線サマリ

| #   | ステップ                | 種別      | 実行タイミング              | Lane |
| --- | ----------------------- | --------- | --------------------------- | ---- |
| 1   | 型変更の typecheck      | typecheck | Lane A 完了直後             | A    |
| 2   | Main 送信シグネチャ捕捉 | grep      | Lane A 完了直後             | A    |
| 3   | Runtime emit 経路調査   | grep/read | Lane B 調査完了             | B    |
| 4   | Hook フィルタ UT        | vitest    | Lane C 実装 + Lane D 合意後 | C/D  |
| 5   | 全体回帰テスト          | vitest    | Phase 9（品質保証）         | D    |

## Step 1: 型変更の typecheck

### コマンド

```bash
pnpm --filter @repo/desktop typecheck
```

### 実行タイミング

Lane A が `SkillCreatorProgress` に `planId?: string` / `requestId?: string` を追加した直後。
および Lane D で新規テスト追加後にも再実行する。

### 期待出力

- エラーゼロ（exit code 0）
- 既存 `onProgress(callback: (progress: SkillCreatorProgress) => void)` 呼出箇所で型エラー発生なし（オプショナルフィールドのため）
- `sendSkillCreatorProgress` の呼出箇所（`skillCreatorHandlers.ts:281`）で型エラー発生なし

### 判定

- PASS: exit code 0、出力に `error TS` 表示なし
- FAIL: いずれかのファイルで `TS2322` / `TS2345` 等の型エラー

## Step 2: Main 送信シグネチャ捕捉

### コマンド

```bash
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/
```

### 実行タイミング

Lane A が `sendSkillCreatorProgress` の progress 引数型を拡張した直後。

### 期待出力（現状ベースライン）

```
apps/desktop/src/main/ipc/skillCreatorHandlers.ts:281:            sendSkillCreatorProgress(mainWindow, progress);
apps/desktop/src/main/ipc/skillCreatorHandlers.ts:720:export function sendSkillCreatorProgress(
```

### 判定

- PASS: 本番呼出箇所が `skillCreatorHandlers.ts:281` の 1 箇所のみ。定義は L720 の 1 箇所のみ
- 追加呼出が Lane B 作業で発生した場合、planId が確実に渡されているかをコードレビュー

### 補助 grep

```bash
grep -rn "SkillCreatorProgress" apps/desktop/src/
```

既存参照箇所の差分を検出するベースライン確認。

## Step 3: Runtime emit 経路調査

### コマンド

```bash
grep -rn "sendSkillCreatorProgress\|triggerPhaseTransition\|onWorkflowStateSnapshot" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

### 実行タイミング

Lane B の Runtime ルート調査中。

### 期待出力（現状）

- `triggerPhaseTransition` 呼出が L1292 / L1305 / L1308 / L1321 の 4 箇所
- `onWorkflowStateSnapshot` 定義が L1250、呼出が L238 / L1310 / L1325
- `sendSkillCreatorProgress` 呼出は **不在**（Runtime ルートは直接 emit していない）

### 判定基準

- Runtime ルートが `skill-creator:progress` を emit する必要があるかを Lane B が決定
- emit する場合、planId が各 call site で貫通していることを grep で確認

## Step 4: Hook フィルタ UT

### コマンド

```bash
pnpm --filter @repo/desktop test -- --run useStreamingProgress
```

### 実行タイミング

Lane C の実装 + Lane D の新規 4 シナリオ追加後。

### 期待出力

- 既存約 40 シナリオ全 PASS（AC-8）
- 新規 4 シナリオ全 PASS
  - match: `options.planId === progress.planId` → store 更新が走る
  - miss: `options.planId !== progress.planId` → store 更新が走らない
  - legacy payload: `progress.planId === undefined` → store 更新が走る（後方互換）
  - no options: `options === undefined` → 全通知で store 更新が走る（後方互換）
- vitest summary: `Test Files X passed`、`Tests (40+4) passed`

### 判定

- PASS: 全シナリオ成功
- FAIL: いずれかのシナリオで `expect` 不一致

## Step 5: 全体回帰テスト

### コマンド

```bash
pnpm --filter @repo/desktop test -- --run skill-creator
```

### 実行タイミング

Phase 9（品質保証）で全 Lane 作業完了後。

### 対象テスト群

- `useStreamingProgress.test.ts`（Hook）
- `skillCreatorHandlers.progress.test.ts`
- `skillCreatorHandlers.validation.test.ts`（`sendSkillCreatorProgress` describe ブロック含む、L667-690）
- `skillCreatorIpc.integration.test.ts`（L590 / L597 / L614 / L1016-1230 の `sendSkillCreatorProgress` 呼出）

### 期待出力

- 全既存テスト PASS（AC-8）
- `sendSkillCreatorProgress(window, { phase, percentage, message })` 形式の既存呼出で破壊なし（オプショナルフィールドのため）

### 判定

- PASS: `Test Files X passed / Tests Y passed`、skipped / failed が 0
- FAIL: いずれか failed があれば Phase 6 へ差戻し

## 品質コマンド群（AC-9）

### typecheck

```bash
pnpm --filter @repo/desktop typecheck
```

### lint

```bash
pnpm --filter @repo/desktop lint
```

### targeted test

```bash
pnpm --filter @repo/desktop test -- --run useStreamingProgress
pnpm --filter @repo/desktop test -- --run skillCreatorHandlers
```

### 実行タイミング

- Phase 5 実装直後（軽量 gate）
- Phase 9 品質保証（正式 gate）

## 参照資料

- [phase-2-design.md](../../phase-2-design.md)
- [phase-1 current-implementation-audit.md](../phase-1/current-implementation-audit.md)

## 完了条件

- [x] 5 ステップ各コマンドと期待出力が具体化されている
- [x] typecheck / grep / vitest / 回帰テストの実行タイミングが明示されている
- [x] AC-9 品質コマンド群が明示されている
