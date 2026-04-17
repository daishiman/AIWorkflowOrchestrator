# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| タスクID   | TASK-SW-CANCEL-003                       |
| 機能名     | skill-creator-cancel-main-handler        |
| 前提Phase  | -（TASK-SW-CANCEL-002 完了が前提）       |
| 後続Phase  | Phase 2                                  |
| 作成日     | 2026-04-15                               |
| ステータス | completed（current worktree で実装済み） |

## 目的

`SkillCreatorService.ts` および `skillCreatorHandlers.ts` の現状を確認し、キャンセル処理実装の要件と受け入れ基準を固定する。特に `useCancelGeneration.startGeneration()` の `AbortSignal` 戻り値の利用箇所を調査し、接続ロジックへの影響を評価する。

> **追記（2026-04-16）**: current worktree では `SkillCreatorService` と `skillCreatorHandlers` の cancel 接続が実装済み。以下は当時の要件定義として保持している。

## 背景

TASK-SW-CANCEL-002 で Preload 層の `cancelGeneration` が確立された。メインプロセス側では `SKILL_CREATOR_CANCEL` チャンネルのハンドラーが存在しないため、キャンセル invoke がメインに届いても何も処理されない。本タスクでハンドラーを実装することで IPC 4層の層3が完成する。

> **実装状態メモ（2026-04-16時点）**: current worktree では `currentAbortController` プロパティ・`cancelCurrentOperation()` メソッド・`SKILL_CREATOR_CANCEL` ハンドラー・`unregisterSkillCreatorHandlers()` の `removeHandler` まで実装済み。`useCancelGeneration.startGeneration()` の `AbortSignal` 利用箇所も確認済みで、Renderer からの cancel 通知が main へ届く状態になっている。

設計レビュー（phase-3-review.md 3.2・3.3節）により、以下の2点がスコープに追加されている:

1. `useCancelGeneration.startGeneration()` の `AbortSignal` 利用箇所を確認（CANCEL-003 実装前）
2. `unregisterSkillCreatorHandlers()` への `SKILL_CREATOR_CANCEL` の `removeHandler` 追加

## 実行タスク

- P50チェック: 対象ファイルの現状確認
- `SkillCreatorService.ts` の構造確認（既存プロパティ・メソッド）
- `skillCreatorHandlers.ts` の構造確認（ハンドラー登録方式・unregister パターン）
- `useCancelGeneration.startGeneration()` の `AbortSignal` 利用箇所調査
- 受け入れ基準（AC-1〜AC-6）の固定

## 参照資料

| 資料名               | パス                                                                                    | 用途                              |
| -------------------- | --------------------------------------------------------------------------------------- | --------------------------------- |
| SkillCreatorService  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                           | クラス構造・プロパティの確認      |
| skillCreatorHandlers | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                     | ハンドラー登録・unregister の確認 |
| useCancelGeneration  | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                                | AbortSignal 利用箇所の確認        |
| 解決策設計書         | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` | 問題2解決アプローチC参照          |
| 設計レビュー書       | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-3-review.md`   | 3.2・3.3節の追加スコープ          |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# currentAbortController が既に実装されていないか確認
grep -n "currentAbortController\|cancelCurrentOperation\|SKILL_CREATOR_CANCEL" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts

# skillCreatorHandlers.ts のキャンセルハンドラー確認
grep -n "SKILL_CREATOR_CANCEL\|cancelCurrentOperation" \
  apps/desktop/src/main/ipc/skillCreatorHandlers.ts
```

### 1. SkillCreatorService 構造確認

```bash
# クラス定義・プロパティ確認
grep -n "class SkillCreatorService\|private\|public\|protected" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts | head -20

# createSkill メソッドシグネチャ確認
grep -n "async createSkill\|cancelCurrentOperation" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### 2. skillCreatorHandlers 構造確認

```bash
# ハンドラー登録パターン確認
grep -n "ipcMain.handle\|ipcMain.removeHandler" apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# unregisterSkillCreatorHandlers の現在の実装確認
grep -n -A 20 "unregisterSkillCreatorHandlers" apps/desktop/src/main/ipc/skillCreatorHandlers.ts
```

### 3. AbortSignal 利用箇所調査（重要）

```bash
# startGeneration の呼び出し箇所確認
grep -rn "startGeneration\|AbortSignal\|abortSignal" \
  apps/desktop/src/renderer/ | grep -v ".test.ts"

# SkillCreateWizard での cancelGeneration / startGeneration 使用確認
grep -n "cancelGeneration\|startGeneration\|abortSignal" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

### 4. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                                         | 検証方法                                     |
| ---- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| AC-1 | `SkillCreatorService` に `private currentAbortController: AbortController \| null = null` が存在する | grep で確認                                  |
| AC-2 | `cancelCurrentOperation()` が `abort()` を呼び出しフラグをリセットする                               | コードレビュー                               |
| AC-3 | `SKILL_CREATOR_CANCEL` の `ipcMain.handle()` が登録されている                                        | grep で確認                                  |
| AC-4 | `unregisterSkillCreatorHandlers()` に `SKILL_CREATOR_CANCEL` の `removeHandler` が追加されている     | grep で確認                                  |
| AC-5 | `startGeneration()` の `AbortSignal` 利用箇所が確認・評価されている（調査レポートあり）              | outputs/phase-1/abort-signal-usage-report.md |
| AC-6 | `pnpm typecheck` が PASS する                                                                        | `pnpm typecheck`                             |

## 統合テスト連携【必須】

| 判定項目                          | 基準 | 結果    |
| --------------------------------- | ---- | ------- |
| SkillCreatorService 構造確認完了  | 完了 | pending |
| skillCreatorHandlers 構造確認完了 | 完了 | pending |
| AbortSignal 利用箇所調査完了      | 完了 | pending |
| AC-1〜AC-6 の定義完了             | 完了 | pending |

## 多角的チェック観点（AIが判断）

- [ ] `SkillCreatorService` がシングルトンかインスタンス生成かを確認したか（ハンドラーとの接続方法に影響）
- [ ] `unregisterSkillCreatorHandlers` が現在どのチャンネルを解除しているかを確認したか
- [ ] `AbortSignal` が `skillCreatorAPI.createSkill()` の呼び出しに渡されているかを確認したか

## サブタスク管理

1. P50チェック（重複実装なし確認）
2. `SkillCreatorService` 構造確認
3. `skillCreatorHandlers` 構造確認
4. `AbortSignal` 利用箇所調査・評価レポート作成
5. 受け入れ基準（AC-1〜AC-6）の固定
6. 成果物の出力

## 成果物

| 成果物                       | パス                                           | 説明                         |
| ---------------------------- | ---------------------------------------------- | ---------------------------- |
| 要件定義書                   | `outputs/phase-1/requirements-definition.md`   | 機能要件・非機能要件・AC一覧 |
| 受け入れ基準                 | `outputs/phase-1/acceptance-criteria.md`       | 検証可能なAC一覧             |
| AbortSignal 利用調査レポート | `outputs/phase-1/abort-signal-usage-report.md` | 調査結果・影響評価           |

## 完了条件

- [ ] P50チェック実施済み
- [ ] `SkillCreatorService` のクラス構造・プロパティを確認済み
- [ ] `unregisterSkillCreatorHandlers` の現状を確認済み
- [ ] `AbortSignal` 利用調査レポートが作成されている
- [ ] AC-1〜AC-6 が検証可能な形で定義されている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
