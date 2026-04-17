# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| 作成日     | 2026-04-15                             |
| ステータス | pending                                |

## 目的

`skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーにおける `createSkill()` 呼び出し箇所の現状を確認し、
コールバック接続（`sendSkillCreatorProgress` との配線）の要件と受け入れ基準を固定する。
また `SkillCreateWizard.tsx` で `streaming.stage/percent/message` が `GenerateStep` に正しく渡されているかの
確認要件を定義する。

## 実行タスク

- P50チェック: 対象ファイルの現状確認・既実装コードの inventory 調査
- 断絶箇所の特定: `sendSkillCreatorProgress` が呼ばれていない事実の確認
- `SkillCreateWizard.tsx` における `GenerateStep` への props 接続状況の確認
- 受け入れ基準定義: AC-1〜AC-4 を検証可能な形で固定
- タスク分類宣言: 本タスクは **バグ修正タスク / 非UIタスク / NON_VISUAL**

## 参照資料

| 資料名                  | パス                                                                 | 用途                              |
| ----------------------- | -------------------------------------------------------------------- | --------------------------------- |
| phase-1-analysis.md     | `docs/30-workflows/00-task-spec-design-docs/phase-1-analysis.md`     | 問題1の現状分析                   |
| phase-2-solution.md     | `docs/30-workflows/00-task-spec-design-docs/phase-2-solution.md`     | 解決策設計（解決アプローチB）     |
| phase-3-review.md       | `docs/30-workflows/00-task-spec-design-docs/phase-3-review.md`       | タスク粒度・スコープ確認（3.5節） |
| TASK-SW-STREAM-001 仕様 | `docs/30-workflows/skill-create-flow-gaps/p01-par-STREAM-001/`       | 前提タスク確認                    |
| skillCreatorHandlers.ts | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                  | 修正対象ファイル                  |
| SkillCreateWizard.tsx   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | props 接続確認対象                |
| GenerateStep.tsx        | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | props 受取確認用                  |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# skillCreatorHandlers.ts の最近のコミット履歴確認
git log --oneline -10 -- apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# createSkill の呼び出し箇所確認
grep -n "createSkill" apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# sendSkillCreatorProgress の実装・呼び出し確認
grep -n "sendSkillCreatorProgress" apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# onProgress コールバックが既に接続されているか確認
grep -n "onProgress" apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# SkillCreateWizard.tsx の GenerateStep への props 渡し確認
grep -n "GenerateStep\|streaming\|stage\|percent\|message" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

### 1. 断絶箇所の確認

設計書（phase-1-analysis.md）で特定された断絶箇所を実際のコードで確認する:

| 断絶箇所                                              | 期待する確認内容                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| `sendSkillCreatorProgress` の呼び出し元が存在しない   | `grep -rn "sendSkillCreatorProgress"` の結果が定義とエクスポートのみであること |
| `createSkill` 呼び出しに第2引数（コールバック）がない | `:276` 付近の呼び出しが `createSkill(validatedArgs)` のみであること            |
| `onProgress` コールバックの未接続                     | ハンドラー内に `sendSkillCreatorProgress` への配線コードが存在しないこと       |

### 2. `SkillCreateWizard.tsx` の確認

```bash
# useStreamingProgress() の利用確認
grep -n "useStreamingProgress\|streaming" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# GenerateStep への props 渡し確認
grep -n "GenerateStep" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# GenerateStep が受け取る props 確認
grep -n "stage\|percent\|message\|props" apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx
```

`streaming.stage/percent/message` が `GenerateStep` に渡されているかを確認し、
未接続の場合は本タスクのスコープに含める。

### 3. 前提タスク（TASK-SW-STREAM-001）の完了確認

```bash
# SkillCreatorService.createSkill のシグネチャ確認（onProgress? が存在するか）
grep -n "createSkill\|onProgress" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

TASK-SW-STREAM-001 完了後、`createSkill` に `onProgress?` コールバック引数が存在することを前提とする。
Phase 5（実装）開始前に TASK-SW-STREAM-001 の完了を確認すること。

### 4. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                                                            | 検証方法                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| AC-1 | `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` の第2引数に `onProgress` コールバックが接続されること               | コードレビュー + TypeScript 型チェック（`pnpm typecheck`）                    |
| AC-2 | `sendSkillCreatorProgress(mainWindow, progress)` がコールバック内で呼ばれ、IPC 経由で進捗が送信されること               | テスト: `sendSkillCreatorProgress` のモックが適切なデータで呼ばれることを検証 |
| AC-3 | `SkillCreateWizard.tsx` で `useStreamingProgress()` の戻り値（`stage/percent/message`）が `GenerateStep` に渡されること | コードレビュー + コンポーネント統合テスト                                     |
| AC-4 | スキル生成中に `GenerateStep.tsx` のプログレスバーが IPC メッセージ受信時に実際に更新されること                         | 手動テスト（Phase 11）: スキル生成中にプログレスバーが変化することを目視確認  |

### 5. タスク分類の宣言

| 分類項目   | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスク種別 | バグ修正タスク                                     |
| UIタスク   | 準UIタスク（GenerateStep props 確認は UI 関連）    |
| 可視性     | NON_VISUAL（コールバック配線はメインプロセス変更） |
| テスト種別 | 統合テスト（IPC ハンドラー層）                     |

### 6. スコープ外の明確化

本タスク（TASK-SW-STREAM-002）のスコープ外:

- `SkillCreatorService.createSkill()` への `onProgress` 引数追加（TASK-SW-STREAM-001 のスコープ）
- フロント・Preload 側の進捗受信コード（変更不要）
- キャンセル処理の IPC 接続（TASK-SW-CANCEL-001〜004 のスコープ）

## 統合テスト連携【必須】

IPC ハンドラーの接続要件（`sendSkillCreatorProgress` 呼び出し・`GenerateStep` props）を要件に明記済み。

| 判定項目                           | 基準     | 結果    |
| ---------------------------------- | -------- | ------- |
| 断絶箇所の特定                     | 確認済み | pending |
| `SkillCreateWizard.tsx` props 確認 | 確認済み | pending |
| 前提タスク完了確認                 | 完了済み | pending |

## 多角的チェック観点

| 観点             | チェック内容                                                                         |
| ---------------- | ------------------------------------------------------------------------------------ |
| 前提タスク整合   | TASK-SW-STREAM-001 完了後に `createSkill` シグネチャが変更済みであることを確認済みか |
| 4層整合性        | IPC チャンネル定数・ホワイトリスト・ハンドラー・Preload API の4層が整合しているか    |
| GenerateStep接続 | `useStreamingProgress` の戻り値が `GenerateStep` に渡されているか（漏れ確認）        |
| スコープ境界     | TASK-SW-STREAM-001 との責務分離が明確か                                              |

## 成果物

| 成果物       | パス                                         | 説明                          |
| ------------ | -------------------------------------------- | ----------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・AC 一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC-1〜AC-4 一覧    |

## 完了条件

- [ ] P50チェック実施済み（`createSkill` 呼び出しにコールバックがないことを確認）
- [ ] `sendSkillCreatorProgress` の呼び出し元が存在しないことを確認済み
- [ ] `SkillCreateWizard.tsx` の `GenerateStep` への props 接続状況を確認済み
- [ ] 前提タスク（TASK-SW-STREAM-001）の完了確認基準を定義済み
- [ ] AC-1〜AC-4 が検証可能な形で定義されている
- [ ] タスク分類を宣言済み
- [ ] スコープ外（TASK-SW-STREAM-001）との境界が明確
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（対象ファイルの現状確認）
2. 断絶箇所の確認（sendSkillCreatorProgress 呼び出し元なし）
3. `SkillCreateWizard.tsx` の props 接続確認
4. 前提タスク（TASK-SW-STREAM-001）完了確認
5. 受け入れ基準（AC-1〜AC-4）の固定
6. タスク分類の宣言
7. スコープ外の明確化
8. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 2: 設計
