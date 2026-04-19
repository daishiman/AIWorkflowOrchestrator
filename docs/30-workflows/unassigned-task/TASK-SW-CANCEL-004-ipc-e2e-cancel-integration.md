# IPC E2E接続確認（Renderer統合） - skill-creator cancel chain 完結 - タスク指示書

## メタ情報

```yaml
issue_number: 2299
```

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-SW-CANCEL-004                                                |
| タスク名     | IPC E2E接続確認（Renderer統合） - skill-creator cancel chain 完結 |
| 分類         | 改善（imp）                                                       |
| 対象機能     | skill-creator キャンセル機能（Renderer層 IPC E2E統合）            |
| 優先度       | 高                                                                |
| 見積もり規模 | 中規模                                                            |
| ステータス   | unassigned                                                        |
| 発見元       | TASK-SW-CANCEL-003 Phase 12 未タスク検出レポート（UT-01〜UT-03）  |
| 発見日       | 2026-04-19                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

skill-creator のキャンセル機能は以下の4タスクで段階的に構築されるチェーン構成になっている。

| タスクID           | 担当範囲                                              | ステータス |
| ------------------ | ----------------------------------------------------- | ---------- |
| TASK-SW-CANCEL-001 | AbortController 基盤（Main層 SkillCreatorService）    | 完了       |
| TASK-SW-CANCEL-002 | Main層基盤（cancelCurrentOperation メソッド実装）     | 完了       |
| TASK-SW-CANCEL-003 | Main層ハンドラ確認（skillCreatorHandlers CANCEL登録） | 完了       |
| TASK-SW-CANCEL-004 | E2E統合確認（Renderer → Preload → Main 全層）         | 未着手     |

CANCEL-001〜003 では Main 側の実装が完了したことが確認された。しかし、Renderer 側から IPC を経由してキャンセル要求が Main まで正しく到達するか（E2E）は未確認であり、チェーンが完結していない。

### 1.2 問題点・課題

CANCEL-003 の Phase 12 未タスク検出レポートに記録された3点が未解決のまま残っている。

1. **UT-01**: `skillCreatorAPI?.cancelGeneration?.()` の IPC E2E 接続確認（Renderer → Preload → Main の全層を通じた動作）
2. **UT-02**: キャンセルボタン UI（`SkillCreateWizard.tsx`）と `useCancelGeneration` フック、IPC のバインディング確認
3. **UT-03**: `startGeneration()` が返す `AbortSignal` の Renderer フロー内 consumer 確認（AbortSignal が実際に利用されているか）

現状、各ファイルは独立してテストされているが、以下の E2E フローを単一の統合として検証したテストは存在しない。

```
キャンセルボタン click
  → handleCancelGeneration() [SkillCreateWizard.tsx:553-557]
    → cancelGeneration() [useCancelGeneration.ts:24-41]
      → abortControllerRef.current.abort()  ← AbortSignal abort
      → setStage("cancelled")               ← Store 更新
      → skillCreatorAPI.cancelGeneration()  ← IPC invoke
        → Preload: safeInvoke(SKILL_CREATOR_CANCEL) [skill-creator-api.ts:726-727]
          → Main: ipcMain.handle(SKILL_CREATOR_CANCEL, ...) [skillCreatorHandlers.ts:688-706]
            → skillCreatorService.cancelCurrentOperation()
            → onCancelCurrentSkillCreation?.()
```

### 1.3 放置した場合の影響

- キャンセルボタンを押しても、Main プロセス側の LLM 処理が継続する（UI は cancelled 表示なのに裏でリソースを消費し続ける）
- `startGeneration()` が返す `AbortSignal` が consumer に渡されていなければ、AbortController の abort が実際の処理中断に繋がらない
- CANCEL chain の不完全な状態が放置され、後続のリグレッション発見が遅れる

---

## 2. 何を達成するか（What）

### 2.1 目的

skill-creator キャンセル機能の IPC E2E フロー（Renderer → Preload → Main）が正しく結線されていることを確認し、CANCEL-001〜004 チェーンを完結させる。

### 2.2 最終ゴール

以下の3点がすべて確認済みの状態になること。

1. `skillCreatorAPI.cancelGeneration()` が IPC を通じて Main の `skillCreatorService.cancelCurrentOperation()` まで到達する
2. キャンセルボタン UI が `useCancelGeneration.cancelGeneration()` と正しくバインドされており、IPC 呼び出しまで繋がっている
3. `startGeneration()` が返す `AbortSignal` が実際にスキル生成フロー内の consumer に渡されている

### 2.3 スコープ（含む/含まない）

**含むもの:**

- `useCancelGeneration.ts` の E2E 動作確認（既存コード確認）
- `SkillCreateWizard.tsx` のキャンセルボタンと `useCancelGeneration` のバインディング確認
- `AbortSignal` の Renderer フロー内 consumer 調査と確認
- IPC チャンネル定義（`SKILL_CREATOR_CANCEL`）の Preload 側許可リスト確認
- 不足している E2E 統合テストの作成（必要な場合）
- 不足していれば実装修正、実装済みであれば確認記録のみ

**含まないもの:**

- Main 層の `SkillCreatorService` や `skillCreatorHandlers` への新規機能追加（CANCEL-001〜003 で完了済み）
- UI/UX の変更（新規ボタン追加等）
- キャンセル後の状態復元ロジックの変更

### 2.4 成果物

| 成果物                   | パス                                                                             | 説明                                |
| ------------------------ | -------------------------------------------------------------------------------- | ----------------------------------- |
| E2E 統合確認レポート     | `docs/30-workflows/p04-seq-CANCEL-004/outputs/phase-5/implementation-summary.md` | 各層の確認結果と pass/fail          |
| （必要な場合）統合テスト | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.e2e.test.ts`      | IPC モックを使った E2E フローテスト |
| （必要な場合）実装修正   | 対象ファイル（確認時に特定）                                                     | 不足実装の修正コード                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SW-CANCEL-001〜003 が完了済みであること（Main 層の実装が完了済み）
- 以下のファイルが存在すること
  - `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
  - `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts`
  - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - `apps/desktop/src/preload/skill-creator-api.ts`
  - `apps/desktop/src/preload/channels.ts`
  - `apps/desktop/src/preload/index.ts`
  - `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
  - `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

### 3.2 依存タスク

| タスクID           | 関係 | 説明                                            |
| ------------------ | ---- | ----------------------------------------------- |
| TASK-SW-CANCEL-001 | 先行 | AbortController 基盤。完了済み前提              |
| TASK-SW-CANCEL-002 | 先行 | cancelCurrentOperation 実装。完了済み前提       |
| TASK-SW-CANCEL-003 | 先行 | skillCreatorHandlers ハンドラ確認。完了済み前提 |

### 3.3 必要な知識

- **Electron IPC 3層モデル**: Renderer（画面側） → Preload（contextBridge） → Main（Node.js側）の流れ
- **contextBridge**: `preload/index.ts` で `contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI)` により `window.skillCreatorAPI` が露出される
- **ALLOWED_INVOKE_CHANNELS**: `preload/channels.ts` に定義された許可チャンネルリスト
- **AbortController/AbortSignal**: `startGeneration()` が `AbortController` を生成して `signal` を返す

### 3.4 推奨アプローチ

1. **Renderer 側の確認**: `useCancelGeneration.ts` で IPC 呼び出しが実装されているか確認
2. **Preload 側の確認**: `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` に含まれているか確認
3. **UI バインディングの確認**: `SkillCreateWizard.tsx` のキャンセルボタンバインディング確認
4. **AbortSignal consumer の確認**: signal が実際に consumer されているか調査
5. **不足分の対処**: 不足がある場合は実装修正、ない場合は確認記録のみ

---

## 4. 実行手順（Phase 1-13）

Phase 1〜13 の詳細な手順は `docs/30-workflows/skill-create-flow-gaps/p04-seq-CANCEL-004/` を参照のこと。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useCancelGeneration.cancelGeneration()` が `window.skillCreatorAPI.cancelGeneration()` を呼び出すことが確認済み
- [ ] `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` に含まれており、`safeInvoke` でブロックされないことが確認済み
- [ ] `SkillCreateWizard.tsx` のキャンセルボタンが `useCancelGeneration.cancelGeneration()` と正しくバインドされていることが確認済み
- [ ] `startGeneration()` が返す `AbortSignal` が Renderer フロー内の consumer に渡されていることが確認済み
- [ ] CANCEL-001〜004 チェーン全体の E2E フローが文書化されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全 pass
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] `pnpm --filter @repo/desktop lint` が通る

---

## 6. リスクと対策

| リスク                                                            | 影響度 | 発生確率 | 対策                                                      |
| ----------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------- |
| `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が不足        | 高     | 中       | Phase 1 で `channels.ts` を必ず確認し、不足なら即修正する |
| `startGeneration()` の `AbortSignal` が consumer に渡されていない | 高     | 中       | Phase 1 で consumer コードを必ず調査する                  |
| CANCEL-003 の「verify_existing モード」問題が再発                 | 低     | 高       | 本タスクは最初から「既実装確認モード」として進める        |

---

## 7. 参照情報

| ドキュメント                          | パス                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| CANCEL-003 Phase 12 未タスク検出      | `docs/30-workflows/p03-seq-CANCEL-003/outputs/phase-12/unassigned-task-detection.md` |
| CANCEL-003 実装ガイド                 | `docs/30-workflows/p03-seq-CANCEL-003/outputs/phase-12/implementation-guide.md`      |
| p04-seq-CANCEL-004 仕様書ディレクトリ | `docs/30-workflows/skill-create-flow-gaps/p04-seq-CANCEL-004/`                       |

---

## 8. 苦戦箇所【記入必須】

| #   | 苦戦箇所         | 内容・原因                             | 対策・教訓     |
| --- | ---------------- | -------------------------------------- | -------------- |
| 1   | （実行時に記入） | 本タスク実行時に苦戦した箇所を記入する | 対策を記入する |

**CANCEL-003 から引き継いだ苦戦箇所（背景として記録）:**

| #   | 苦戦箇所（CANCEL-003 時点）            | 内容                                                                     | CANCEL-004 への教訓                                                    |
| --- | -------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1   | 新規実装テンプレートと既実装確認の混線 | ワークフローが新規実装前提で各 Phase で意図のずれが生じた                | 本タスクは最初から `implementation_mode: "verify_existing"` として扱う |
| 2   | cancel chain の分割タスク管理          | CANCEL-003 単体では E2E 完了にならないことが仕様書に明示されていなかった | CANCEL-004 が完了してはじめてチェーン完結であることを明示した          |
