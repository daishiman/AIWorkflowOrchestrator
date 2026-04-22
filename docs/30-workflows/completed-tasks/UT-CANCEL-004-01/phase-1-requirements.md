# Phase 1: 要件定義

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 1                |
| タスクID   | UT-CANCEL-004-01 |
| ステータス | 未実施           |
| 作成日     | 2026-04-22       |

## 目的

`agentSlice.createSkill()` への `signal?: AbortSignal` 引数追加に必要な前提条件・変更スコープ・テスト戦略を確定する。変更量は小規模（2ファイルの引数追加と伝達）だが、型安全性・後方互換性・既存呼び出し側への影響を事実ベースで把握した上で設計フェーズに進む。

## 実行タスク

### Step 0: P50 チェック（前提確認）

- 依存タスク `TASK-SW-CANCEL-004` の完了確認
  - Main プロセス側（`SkillCreatorService.ts`）が AbortSignal を受け取れる状態かを `git log --oneline` で確認する
- 依存タスク `TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001` の完了確認
  - Main 側 private workflow が abort guard を持つ状態で完了していることを確認する
  - preload / IPC の public shape は変えない前提であることを型定義ファイル（`preload.d.ts` または `ipcTypes.ts` など）で確認・記録する
- 現ブランチの差分確認: `git diff main...HEAD` でスコープ外の変更がないことを確認する
- 既存テスト PASS 確認: `pnpm --filter @repo/desktop test agentSlice` を実行し、現状のテスト通過率を記録する

### Step 1: 既存コード棚卸し

`agentSlice.ts` の確認:

- `createSkill` 型定義（L369-377）の現シグネチャを記録する
  - 引数: `description: string`, `options: {...}`, `context?: SkillCreationContext`
  - `signal` 引数が存在しないことを明示する
- `createSkill` 実装（L1200-1233）の `window.electronAPI.skill.create()` 呼び出し箇所を確認する
  - 渡している引数（`description`, `options`, `context`）を記録する
- `agentSlice.ts` 内で `createSkill` を呼び出している箇所が他にないか確認する（セルフ呼び出しの有無）

`SkillCreateWizard.tsx` の確認:

- `handleGenerate()` 内の `startGeneration()` 呼び出し箇所（L467）を確認する
  - `startGeneration()` の返値（`AbortSignal`）が現状どう扱われているかを記録する（捨てられているか変数に格納されているか）
- `createSkill()` 呼び出し箇所（L487-491）の現引数を記録する
- `useCreateSkill` フックがどのように `agentSlice.createSkill` をラップしているか確認する

`useCancelGeneration.ts` の確認:

- `startGeneration()` の戻り値型（`AbortSignal`）を確認する
- `cancelGeneration()` が `AbortController.abort()` を呼ぶ実装になっているか確認する

### Step 2: 受入基準の確定

| ID     | 受入基準                                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| AC-001 | `createSkill` の型定義（L369付近）に `signal?: AbortSignal` が第4引数として追加されている                  |
| AC-002 | `createSkill` の実装（L1200付近）に `signal?: AbortSignal` が第4引数として追加されている                   |
| AC-003 | `SkillCreateWizard.tsx` の `handleGenerate` で `startGeneration()` の戻り値が `createSkill` に渡されている |
| AC-004 | TypeScript 型チェック PASS・ESLint エラーゼロ・全テスト PASS                                               |

### Step 3: chain_position と CANCEL-CHAIN 情報の記録

```yaml
chain_position: "4/4"
chain_id: "SW-CANCEL-CHAIN-001"
chain_completion_definition: |
  このタスクが完了 = Renderer Store 層の createSkill に signal 引数が追加され、
  startGeneration() の返値が createSkill まで到達する。
  chain 全体の完了は本タスクの Phase 12 close-out をもって判定する。
depends_on_chain_tasks:
  - TASK-SW-CANCEL-001: AbortController 基盤
  - TASK-SW-CANCEL-002: cancelCurrentOperation()
  - TASK-SW-CANCEL-003: IPC ハンドラ登録
  - TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001: Main private workflow 入口保証
  - TASK-SW-CANCEL-004: startGeneration() 実装
provides_to_chain_tasks: []
```

## 参照資料

| 参照資料            | パス                                                                       | 内容                       |
| ------------------- | -------------------------------------------------------------------------- | -------------------------- |
| agentSlice          | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                     | createSkill の型定義・実装 |
| SkillCreateWizard   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`         | handleGenerate             |
| useCancelGeneration | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                   | startGeneration 返値型     |
| 完了済み依存タスク  | `docs/30-workflows/completed-tasks/TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001/` | 前タスク成果物             |

## 実行手順

1. P50 チェックを実施する
2. 既存コードを棚卸しして現状シグネチャを記録する
3. 受入基準（AC-001〜AC-004）を確定する
4. chain_position・chain_id を記録する
5. Step 1〜4 の結果を `outputs/phase-1/requirements-analysis.md` に記録する
6. aiworkflow-requirements との対応を `outputs/phase-1/spec-extraction-map.md` に記録する

## 統合テスト連携

- Phase 1 で確認した現シグネチャを Phase 4 の Red テスト前提条件として引き継ぐ
- AC-001〜AC-004 を Phase 10 の照合マトリクスに直接使用する

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                                 |
| ------------ | ------------------------------------------------------------ |
| 矛盾なし     | IPC に signal を含めないという方針が一貫しているか           |
| 漏れなし     | P50チェック・コード棚卸し・AC確定の3ステップが揃っているか   |
| 整合性       | chain_position が依存タスク一覧と一致しているか              |
| 依存関係整合 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 の完了を確認しているか |

## サブタスク管理

| サブタスクID | 内容                | ステータス |
| ------------ | ------------------- | ---------- |
| ST-1-01      | P50 チェック        | 未実施     |
| ST-1-02      | 既存コード棚卸し    | 未実施     |
| ST-1-03      | 受入基準確定        | 未実施     |
| ST-1-04      | chain_position 記録 | 未実施     |

## 成果物

- `outputs/phase-1/requirements-analysis.md`
- `outputs/phase-1/spec-extraction-map.md`

## 完了条件

- [ ] P50 チェックが完了している
- [ ] `createSkill` の現シグネチャが記録されている
- [ ] `SkillCreateWizard.tsx` の `startGeneration` 戻り値の扱いが確認されている
- [ ] AC-001〜AC-004 が確定している
- [ ] chain_position・chain_id が記録されている

## タスク 100% 実行確認【必須】

- [ ] 全タスクを実行した
- [ ] 成果物が生成されていることを確認した
- [ ] Phase 2 の前提条件が揃っている

## 次Phase

[phase-2-design.md](phase-2-design.md)
