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
| E2E 統合確認レポート     | `docs/30-workflows/p03-seq-CANCEL-004/outputs/phase-5/implementation-summary.md` | 各層の確認結果と pass/fail          |
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
  - Renderer は `window.skillCreatorAPI` 経由で Preload が公開した API を呼び出す
  - Preload は `ipcRenderer.invoke()` を通じて Main に IPC メッセージを送る
  - Main は `ipcMain.handle()` で登録したハンドラが処理する
- **contextBridge**: `preload/index.ts` で `contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI)` により `window.skillCreatorAPI` が露出される（L646）
- **ALLOWED_INVOKE_CHANNELS**: `preload/channels.ts` に定義された許可チャンネルリスト。`safeInvoke` はこのリストにないチャンネルの呼び出しをブロックする
- **AbortController/AbortSignal**: `startGeneration()` が `AbortController` を生成して `signal` を返す。`cancelGeneration()` でその controller を abort する。signal が実際の処理に渡されていない場合、中断効果がない
- **`useCancelGeneration` の現在の実装**: IPC 呼び出し（`skillCreatorAPI?.cancelGeneration?.()`）は既に実装済み（`useCancelGeneration.ts:37`）。ただしこれは E2E 統合テストで検証されていない

### 3.4 推奨アプローチ

以下の順序で確認を進める（トップダウン確認）。

1. **Renderer 側の確認**: `useCancelGeneration.ts` で `skillCreatorAPI?.cancelGeneration?.()` が呼ばれていることを確認（コードリーディングで確認済みだが、単体テストの確認）
2. **Preload 側の確認**: `skill-creator-api.ts` の `cancelGeneration()` が `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を呼んでいること、および `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` に含まれていることを確認
3. **UI バインディングの確認**: `SkillCreateWizard.tsx` でキャンセルボタンが `cancelGeneration()` を呼んでいることを確認
4. **AbortSignal consumer の確認**: `startGeneration()` が返す signal がスキル生成フロー内のどこかで consumer されているかを調査
5. **不足分の対処**: 確認の結果、不足している場合は実装修正またはテスト追加を行う

---

## 4. 実行手順

### Phase 1: 現状確認・要件定義（1時間）

**手順:**

1. `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` を読み、`cancelGeneration()` の実装を確認する
2. `apps/desktop/src/preload/channels.ts` を検索し、`ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が含まれているかを確認する
3. `apps/desktop/src/preload/index.ts` を確認し、`skillCreatorAPI` が `contextBridge.exposeInMainWorld` で公開されているかを確認する（L646）
4. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` を確認し、キャンセルボタンが `cancelGeneration()` を呼んでいることを確認する
5. `startGeneration()` が返す `AbortSignal` の consumer を `SkillCreateWizard.tsx` および関連コンポーネントで調査する

**確認項目（チェックリスト形式で記録）:**

- [ ] `useCancelGeneration.ts:37` に `await skillCreatorAPI?.cancelGeneration?.()` がある
- [ ] `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` 配列に含まれている
- [ ] `preload/index.ts:646` に `contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI)` がある
- [ ] `SkillCreateWizard.tsx` の `handleCancelGeneration` が `cancelGeneration()` を呼んでいる
- [ ] キャンセルボタンの `onClick` が `handleCancelGeneration` にバインドされている
- [ ] `startGeneration()` の返り値 `AbortSignal` を受け取っている consumer コードが存在する

**成果物:**

- Phase 1 確認レポート（`outputs/phase-1/requirements-definition.md`）

**完了条件:**

- 上記チェックリスト全項目の pass/fail が記録されている

---

### Phase 2: 設計（30分）

**手順:**

1. Phase 1 の確認結果をもとに、不足しているものを特定する
2. 不足項目がある場合、修正方針を設計する
3. 不足項目がない場合、E2E 統合テストの設計を行う

**E2E 統合テストの設計方針（不足がない場合）:**

- IPC Preload 全層をモックし、`useCancelGeneration.cancelGeneration()` 呼び出し → `window.skillCreatorAPI.cancelGeneration()` が invoke されること → IPC ハンドラが `cancelCurrentOperation` を呼ぶことを、各層境界で検証する
- 既存の `useCancelGeneration.test.ts` は単体テストであるため、IPC 呼び出し確認は `mockCancelGeneration` モックで間接確認している。E2E テストでは Preload API の実際の channel 文字列まで確認する

**成果物:**

- Phase 2 設計書（`outputs/phase-2/design.md`）

**完了条件:**

- 不足項目または E2E テスト設計が明確に記述されている

---

### Phase 3: 設計レビュー（15分）

**手順:**

1. Phase 2 設計書を読み直し、対処漏れがないか確認する
2. CANCEL-001〜003 の既存実装と矛盾がないかを確認する
3. 問題なければ Phase 4 に進む

**完了条件:**

- 設計に矛盾がなく、Phase 4 に進める状態である

---

### Phase 4: テスト作成（2時間）

**手順:**

1. E2E 統合テストが必要な場合は以下を作成する

   **ファイルパス**: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.e2e.test.ts`

   **テストケース設計:**
   - TC-E2E-01: `cancelGeneration()` 呼び出し時に `window.skillCreatorAPI.cancelGeneration` が invoke される
   - TC-E2E-02: `startGeneration()` → `cancelGeneration()` のフローで AbortSignal が abort 状態になる
   - TC-E2E-03: `cancelGeneration()` 後に Store の `streamingStage` が `cancelled` になる
   - TC-E2E-04: `skillCreatorAPI` が null の場合でも `cancelGeneration()` がクラッシュしない

2. 実装修正が必要な場合はそのテストを作成する

**成果物:**

- E2E 統合テストファイル（または修正対象テストファイル）

**完了条件:**

- テストが `pnpm vitest run --reporter=verbose` で実行でき、失敗理由が明確である（Red状態）

---

### Phase 5: 実装修正（2時間）

**手順:**

1. Phase 4 のテストが Red の場合に限り実装修正を行う
2. 修正対象ファイルに必要最小限の変更を加える

**想定される修正パターン（Phase 1 の確認結果次第）:**

- **ALLOWED_INVOKE_CHANNELS に SKILL_CREATOR_CANCEL が不足している場合**:
  `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` 配列に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を追加する

- **AbortSignal の consumer が存在しない場合**:
  `startGeneration()` の戻り値 signal を `createSkill()` 呼び出し側に渡す処理を追加する

- **キャンセルボタンのバインディングが不足している場合**:
  `SkillCreateWizard.tsx` の該当 onClick に `handleCancelGeneration` を追加する

3. 修正後、Phase 4 のテストが Green になることを確認する
4. `pnpm --filter @repo/desktop test` で既存テストが全 pass することを確認する

**成果物:**

- Phase 5 実装サマリー（`outputs/phase-5/implementation-summary.md`）
- 修正したファイル一覧（実装修正がなかった場合は「修正なし・確認のみ」と記録）

**完了条件:**

- Phase 4 で作成したテストがすべて Green
- 既存テストがすべて pass している

---

### Phase 6〜11: テスト拡充・品質保証・手動テスト

Phase 5 で実装修正がなかった場合（確認のみだった場合）は、Phase 6〜11 を簡略化できる。

**Phase 6（テスト拡充）:**

- エッジケーステスト（`cancelGeneration()` 二重呼び出し、`window.skillCreatorAPI` が undefined の場合など）を追加する

**Phase 7（カバレッジ確認）:**

- `pnpm vitest run --coverage` で `useCancelGeneration.ts` の line/branch カバレッジが 80% 以上であることを確認する

**Phase 8（リファクタリング）:**

- コードの重複や型安全性の問題があれば修正する（実装修正なしの場合は対象なし）

**Phase 9（品質保証）:**

- `pnpm --filter @repo/desktop typecheck` が通ることを確認する
- `pnpm --filter @repo/desktop lint` が通ることを確認する

**Phase 10（最終レビュー）:**

- CANCEL-001〜004 チェーン全体の動作が文書化されていることを確認する

**Phase 11（手動テスト）:**

- E2E フローを実際の Electron アプリ上で動作確認する（デスクトップアプリを起動し、スキル生成中にキャンセルボタンを押して Main の LLM 処理が止まることを確認）

---

### Phase 12: ドキュメント更新

**手順:**

1. 確認・修正内容を `outputs/phase-12/implementation-guide.md` にまとめる
2. CANCEL-001〜004 チェーンが完結したことを記録する
3. 苦戦箇所を記録する（セクション9参照）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useCancelGeneration.cancelGeneration()` が `window.skillCreatorAPI.cancelGeneration()` を呼び出すことが確認済みである
- [ ] `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` に含まれており、`safeInvoke` でブロックされないことが確認済みである
- [ ] `preload/index.ts` で `skillCreatorAPI` が `window.skillCreatorAPI` として公開されていることが確認済みである
- [ ] `SkillCreateWizard.tsx` のキャンセルボタンが `useCancelGeneration.cancelGeneration()` と正しくバインドされていることが確認済みである
- [ ] `startGeneration()` が返す `AbortSignal` が Renderer フロー内の consumer に渡されていること（または渡されていない場合に修正済み）が確認済みである
- [ ] CANCEL-001〜004 チェーン全体の E2E フローが文書化されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全 pass
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] `pnpm --filter @repo/desktop lint` が通る
- [ ] `useCancelGeneration.ts` のテストカバレッジが line/branch 各 80% 以上

### ドキュメント要件

- [ ] Phase 12 実装ガイドが作成されている（CANCEL-001〜004 チェーン全体の説明を含む）
- [ ] 苦戦箇所セクション（セクション9）が記入されている

---

## 6. 検証方法

### テストケース

| TC番号    | 対象                     | 検証内容                                                                              | 期待結果                          |
| --------- | ------------------------ | ------------------------------------------------------------------------------------- | --------------------------------- |
| TC-UT-01  | `useCancelGeneration.ts` | `cancelGeneration()` 呼び出し時に `skillCreatorAPI.cancelGeneration` が invoke される | mock が1回呼ばれる                |
| TC-UT-02  | `useCancelGeneration.ts` | `startGeneration()` 後に `cancelGeneration()` を呼ぶと signal.aborted が true になる  | `signal.aborted === true`         |
| TC-UT-03  | `useCancelGeneration.ts` | `cancelGeneration()` 後に Store の `streamingStage` が `cancelled` になる             | `streamingStage === "cancelled"`  |
| TC-UT-04  | `useCancelGeneration.ts` | `skillCreatorAPI` が null でも `cancelGeneration()` がクラッシュしない                | 例外が throw されない             |
| TC-CH-01  | `preload/channels.ts`    | `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が含まれている                    | 配列内に `"skill-creator:cancel"` |
| TC-UI-01  | `SkillCreateWizard.tsx`  | キャンセルボタンの `onClick` が `handleCancelGeneration` を呼んでいる                 | コードで確認                      |
| TC-E2E-01 | Electron 実装アプリ      | スキル生成中にキャンセルボタンを押すと Main の LLM 処理が止まる                       | 処理が中断される                  |

### 検証手順

1. `pnpm --filter @repo/desktop test -- useCancelGeneration` を実行し、全テストが pass することを確認する
2. `pnpm --filter @repo/desktop test -- skillCreatorHandlers-cancel` を実行し、Main 側テストが pass することを確認する
3. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する
4. （任意）Electron アプリを起動し、スキル生成中にキャンセルボタンを押して動作確認する

---

## 7. リスクと対策

| リスク                                                                                                                          | 影響度 | 発生確率 | 対策                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が不足しており、IPC 呼び出しがサイレントに無視されている                    | 高     | 中       | Phase 1 で `channels.ts` を必ず確認し、不足なら即修正する                                                          |
| `startGeneration()` の `AbortSignal` が consumer に渡されておらず、中断効果がない                                               | 高     | 中       | Phase 1 で consumer コードを必ず調査する。見つからない場合は修正を実施する                                         |
| E2E 検証が困難（Electron アプリの起動環境がない場合）                                                                           | 中     | 低       | 手動テストは任意とし、単体テストの E2E モック検証で代替する                                                        |
| CANCEL-003 の「verify_existing モード」問題が再発する（ワークフローが新規実装前提で作られていることで、確認作業に混乱が生じる） | 低     | 高       | 本タスクは最初から「既実装確認モード」であることを明示し、フェーズ全体を確認作業として進める                       |
| 既存テストの `mockCancelGeneration` mock が IPC 層を実際には検証していない                                                      | 中     | 高       | E2E 統合テストでは `window.skillCreatorAPI.cancelGeneration` が invoke される事実を channel 文字列レベルで確認する |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                       | パス                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| CANCEL-001 仕様書（参考）          | `docs/30-workflows/unassigned-task/` 内の CANCEL-001 対応ファイル                    |
| CANCEL-003 Phase 12 未タスク検出   | `docs/30-workflows/p03-seq-CANCEL-003/outputs/phase-12/unassigned-task-detection.md` |
| CANCEL-003 実装ガイド              | `docs/30-workflows/p03-seq-CANCEL-003/outputs/phase-12/implementation-guide.md`      |
| skill-feedback-report (CANCEL-003) | `docs/30-workflows/p03-seq-CANCEL-003/outputs/phase-12/skill-feedback-report.md`     |

### 参考コードファイル

| ファイル                                                                | 役割                                            |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                | Renderer キャンセルフック（IPC 呼び出しを含む） |
| `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts` | 既存単体テスト（E2E は未確認）                  |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`      | キャンセルボタン UI とバインディング            |
| `apps/desktop/src/preload/skill-creator-api.ts`                         | Preload API（cancelGeneration IPC 呼び出し）    |
| `apps/desktop/src/preload/channels.ts`                                  | IPC チャンネル定義と許可リスト                  |
| `apps/desktop/src/preload/index.ts`                                     | contextBridge 公開（L646）                      |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                     | Main IPC ハンドラ（SKILL_CREATOR_CANCEL L688）  |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`           | cancelCurrentOperation 実装                     |

---

## 9. 備考

### 苦戦箇所【記入必須】

| #   | 苦戦箇所         | 内容・原因                             | 対策・教訓     |
| --- | ---------------- | -------------------------------------- | -------------- |
| 1   | （実行時に記入） | 本タスク実行時に苦戦した箇所を記入する | 対策を記入する |

**CANCEL-003 から引き継いだ苦戦箇所（背景として記録）:**

| #   | 苦戦箇所（CANCEL-003 時点）            | 内容                                                                                                                                        | CANCEL-004 への教訓                                                                                     |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | 新規実装テンプレートと既実装確認の混線 | ワークフローが新規実装前提で作られていたため、「実装を書く」手順が「確認する」手順として読み替えが必要だった。各 Phase で意図のずれが生じた | 本タスクは最初から `implementation_mode: "verify_existing"` として扱い、全 Phase を確認作業として進める |
| 2   | cancel chain の分割タスク管理          | CANCEL-001〜004 がチェーンを構成しているが、CANCEL-003 単体では E2E 完了にならないことが仕様書に明示されていなかった                        | 本タスク仕様書では「CANCEL-004 が完了してはじめてチェーン完結」であることを明示した                     |

### 補足事項

- 本タスクは **確認作業が主体** である。Phase 1 の確認の結果、既存コードが正しく実装されていることが判明した場合は、実装修正なしで E2E 統合テストの追加と確認記録の作成が成果物となる。
- `useCancelGeneration.ts` の既存コードを確認すると、`skillCreatorAPI?.cancelGeneration?.()` の呼び出しは L37 に既に存在する。ただし `ALLOWED_INVOKE_CHANNELS` への登録確認が最重要の確認ポイントである。
- `TASK-SC-07-IPC-CANCEL.md`（`docs/30-workflows/unassigned-task/`）は以前の時点での未実装状態を記録した仕様書であるが、現時点では `useCancelGeneration.ts` に IPC 呼び出しが実装されている。この仕様書との齟齬は Phase 1 確認時に記録すること。
