# Phase 1: 要件定義

## メタ情報

| 項目                | 値                                                                         |
| ------------------- | -------------------------------------------------------------------------- |
| Phase               | 1                                                                          |
| タスクID            | TASK-SW-CANCEL-004                                                         |
| タスク種別          | NON_VISUAL code task（verify_existing モード）                             |
| implementation_mode | verify_existing                                                            |
| 目的                | IPC E2E 確認の要件を固定し、CANCEL-001〜004 チェーン完結の受入基準を定める |

## 目的

IPC E2E 確認の要件を固定し、CANCEL-001〜004 チェーン完結の受入基準を定める。

## 実行タスク

### タスク1: cancel chain の前提固定

**目的**: 先行タスク、verify_existing 前提、task classification を確定する。

**実行手順**:

1. CANCEL-001〜003 の完了前提を確認する。
2. `implementation_mode: "verify_existing"` の妥当性を確認する。
3. task classification と P50 チェックを記録する。

**期待される成果物**:

- P50 チェック結果
- task classification 判定
- 先行タスク前提一覧

### タスク2: 受入基準と確認対象の固定

**目的**: AC-1〜AC-8 と確認対象ファイルを検証可能な形に分解する。

**実行手順**:

1. 対象ファイル一覧を整理する。
2. AC-1〜AC-8 を検証方法付きで確定する。
3. 確認チェックリストを作成する。

**期待される成果物**:

- 受入基準一覧
- 確認対象ファイル一覧
- 確認チェックリスト

## Phase 1 で固定する一次結論

| 観点               | 結論                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 真の論点           | 未実装機能の設計ではなく、既存実装が Renderer → Preload → Main の全層を通じて正しく結線されているかを確認すること           |
| 依存関係・責務境界 | Renderer 責務は `useCancelGeneration`・`SkillCreateWizard`。Preload 責務は `skill-creator-api`・`channels`。Main は完了済み |
| 価値とコスト       | 高価値はチェーン完結保証。コストは確認作業・E2E テスト追加であり、Main 側の再実装コストはゼロ                               |
| 改善優先順位       | ALLOWED_INVOKE_CHANNELS 確認 → UI バインディング確認 → AbortSignal consumer 確認 → E2E テスト追加                           |
| 4条件評価          | 価値性・実現性・運用性は PASS。整合性は Phase 1 確認で確定する                                                              |

## P50 チェック

### 先行タスク確認

- `TASK-SW-CANCEL-001`: AbortController 基盤 ✅ 完了済み
- `TASK-SW-CANCEL-002`: cancelCurrentOperation 実装 ✅ 完了済み
- `TASK-SW-CANCEL-003`: skillCreatorHandlers CANCEL 登録 ✅ 完了済み

### P50 判定テーブル

| 確認項目                        | 判定   | 対応                                   |
| ------------------------------- | ------ | -------------------------------------- |
| current branch に実装が存在する | Yes    | 差分確認・回帰確認を中心とする         |
| upstream（main等）にマージ済み  | 要確認 | main との差分確認を Phase 5 冒頭で実施 |
| 前提タスクが完了済み            | Yes    | CANCEL-001〜003 を完了前提として扱う   |

## scope（chain task 必須項目）

```yaml
chain_position: "4/4"
chain_id: "SW-CANCEL-CHAIN-001"
chain_completion_definition: |
  このタスクが完了すると、skill-creator cancel chain の Renderer → Preload → Main
  の全層接続確認が閉じ、CANCEL-001〜004 の chain 完結を判定できる。
depends_on_chain_tasks:
  - TASK-SW-CANCEL-001: AbortController 基盤
  - TASK-SW-CANCEL-002: cancelCurrentOperation 実装
  - TASK-SW-CANCEL-003: SKILL_CREATOR_CANCEL ハンドラ登録
provides_to_chain_tasks:
  - Phase 12 close-out evidence: CANCEL chain 完結記録
```

### 確認対象ファイル一覧

| ファイル                                                                | 役割                                            |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                | Renderer キャンセルフック（IPC 呼び出しを含む） |
| `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts` | 既存単体テスト                                  |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`      | キャンセルボタン UI とバインディング            |
| `apps/desktop/src/preload/skill-creator-api.ts`                         | Preload API（cancelGeneration IPC 呼び出し）    |
| `apps/desktop/src/preload/channels.ts`                                  | IPC チャンネル定義と許可リスト                  |
| `apps/desktop/src/preload/index.ts`                                     | contextBridge 公開（L646）                      |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                     | Main IPC ハンドラ（SKILL_CREATOR_CANCEL L688）  |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`           | cancelCurrentOperation 実装                     |

### 判断

- 本タスクは `implementation_mode: "verify_existing"` として全フェーズを進める
- Phase 1 の確認結果で不足が判明した場合のみ Phase 5 で最小限の修正を行う

## task classification【必須】

| 項目                 | 判定   | 理由                                                              |
| -------------------- | ------ | ----------------------------------------------------------------- |
| UI task              | いいえ | 新規 UI 変更はなし（既存ボタンのバインディング確認のみ）          |
| docs-only            | いいえ | IPC 接続という実コード動作の回帰確認であり、spec_created ではない |
| NON_VISUAL code task | はい   | 変更の主対象は Renderer/Preload/Main の IPC 接続とその検証        |

## 受入基準

| ID   | 基準                                                                                                      | 検証方法                   |
| ---- | --------------------------------------------------------------------------------------------------------- | -------------------------- |
| AC-1 | `useCancelGeneration.cancelGeneration()` が `window.skillCreatorAPI.cancelGeneration()` を呼び出す        | コードリーディング・テスト |
| AC-2 | `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` に含まれており safeInvoke でブロックされない          | channels.ts 確認           |
| AC-3 | `preload/index.ts` で `skillCreatorAPI` が `window.skillCreatorAPI` として contextBridge 公開されている   | L646 確認                  |
| AC-4 | `SkillCreateWizard.tsx` のキャンセルボタンが `useCancelGeneration.cancelGeneration()` に正しくバインド    | コードリーディング         |
| AC-5 | `startGeneration()` が返す `AbortSignal` が Renderer フロー内の consumer に渡されている（または修正済み） | 調査・コード確認           |
| AC-6 | CANCEL-001〜004 チェーン全体の E2E フローが文書化されている                                               | outputs 確認               |
| AC-7 | `pnpm --filter @repo/desktop test` が全 pass                                                              | CI コマンド                |
| AC-8 | `pnpm --filter @repo/desktop typecheck` が通る                                                            | CI コマンド                |

## 確認チェックリスト（Phase 1 実行時に記入）

- [ ] `useCancelGeneration.ts:37` に `await skillCreatorAPI?.cancelGeneration?.()` がある
- [ ] `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` 配列に含まれている
- [ ] `preload/index.ts:646` に `contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI)` がある
- [ ] `SkillCreateWizard.tsx` の `handleCancelGeneration` が `cancelGeneration()` を呼んでいる
- [ ] キャンセルボタンの `onClick` が `handleCancelGeneration` にバインドされている
- [ ] `startGeneration()` の返り値 `AbortSignal` を受け取っている consumer コードが存在する

## Canonical Artifacts【必須】

| 成果物                  | パス                                              |
| ----------------------- | ------------------------------------------------- |
| 要件定義                | `outputs/phase-1/requirements-definition.md`      |
| 現実装監査              | `outputs/phase-1/current-implementation-audit.md` |
| artifact canonical 一覧 | `outputs/phase-1/artifact-canonical-list.md`      |

## 成果物

| 成果物                  | パス                                              | 内容                                          |
| ----------------------- | ------------------------------------------------- | --------------------------------------------- |
| 要件定義                | `outputs/phase-1/requirements-definition.md`      | Phase 1 の一次結論、受入基準、P50 判定        |
| 現実装監査              | `outputs/phase-1/current-implementation-audit.md` | 既存 cancel chain 実装の確認結果              |
| artifact canonical 一覧 | `outputs/phase-1/artifact-canonical-list.md`      | 後続 Phase で使用する canonical artifact 一覧 |

## 参照資料

- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `docs/30-workflows/p03-seq-CANCEL-003/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`

## 統合テスト連携

- Phase 4 で `useCancelGeneration` の targeted test と E2E 統合テスト設計へ接続する。
- Phase 5 で AC-1〜AC-5 の確認結果を実コード・テスト結果へ反映する。
- Phase 9 で `pnpm --filter @repo/desktop test` と `typecheck` の品質ゲートに連携する。

## 完了条件

- [ ] P50 チェック結果を記録した
- [ ] task classification を確定した（NON_VISUAL code task / verify_existing）
- [ ] AC-1 から AC-8 を確定した
- [ ] 確認チェックリスト全項目の pass/fail を記録した
- [ ] artifact canonical 一覧を固定した
- [ ] Phase 2 に渡す真の論点と優先順位を確定した
