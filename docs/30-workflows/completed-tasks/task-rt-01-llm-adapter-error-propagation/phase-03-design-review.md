# Phase 3: 設計レビューゲート - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目    | 値                                       |
| ------- | ---------------------------------------- |
| Phase   | 3 - 設計レビューゲート                   |
| 機能名  | task-rt-01-llm-adapter-error-propagation |
| 作成日  | 2026-04-04                               |
| 前Phase | [Phase 2: 設計](phase-02-design.md)      |

## 目的

Phase 2 の設計を PASS / MINOR / MAJOR の 3 段階で評価し、Phase 4 への進行可否を判断する。
IPC 4 層整合・型設計・コンポーネント責務境界・状態所有権に集中してレビューする。

## 実行タスク

- **設計レビュー実施**: Phase 2 の全設計決定事項を PASS / MINOR / MAJOR で評価する
- **型互換性検証**: Phase 2 の型互換性テーブル（下書き）を確定する
- **simpler alternative 検討**: より単純な実装方法がないか検討・記録する
- **Phase 4 開始条件の確認**: MAJOR 指摘がない場合に Phase 4 への進行を承認する

## 参照資料

| 資料名               | パス                                                                                 | 用途                   |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| Phase 2 設計書       | `phase-02-design.md`                                                                 | レビュー対象           |
| IPC セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-details.md` | sender validation 基準 |
| IPC 4層整合ガイド    | `.claude/skills/task-specification-creator/references/phase-template-core.md`        | 4 層チェックリスト     |

## 設計レビュー

### チェック1: IPC 4層整合性

| チャネル                               | 定数定義    | ALLOWED リスト   | ハンドラ登録                   | Preload API                            | 判定     |
| -------------------------------------- | ----------- | ---------------- | ------------------------------ | -------------------------------------- | -------- |
| `skill-creator:get-adapter-status`     | ✅ 設計済み | ✅ INVOKE に追加 | ✅ `ipcMain.handle` 設計済み   | ✅ `getAdapterStatus()` 設計済み       | **PASS** |
| `skill-creator:adapter-status-changed` | ✅ 設計済み | ✅ ON に追加     | ✅ `webContents.send` 設計済み | ✅ `onAdapterStatusChanged()` 設計済み | **PASS** |

**判定: PASS** — デッドチャンネルのリスクなし。

### チェック2: セキュリティ（sender validation）

| 対象                                        | validateIpcSender 適用                                   | 判定     |
| ------------------------------------------- | -------------------------------------------------------- | -------- |
| `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラ | ✅ `validateSender(event, channel, mainWindow)` 設計済み | **PASS** |

**判定: PASS** — 不正な送信元からの invoke を弾ける設計になっている。

### チェック3: 状態所有権

| 状態                       | 所有者                              | Renderer からのアクセス方法 | 判定     |
| -------------------------- | ----------------------------------- | --------------------------- | -------- |
| `_llmAdapterStatus`        | Main（`RuntimeSkillCreatorFacade`） | IPC pull + push のみ        | **PASS** |
| `_llmAdapterFailureReason` | Main（`RuntimeSkillCreatorFacade`） | IPC pull + push のみ        | **PASS** |

**判定: PASS** — 状態所有権が Main に閉じており、Renderer は IPC 経由でのみ参照する。

### チェック4: 型設計

| 型                        | 定義場所                                    | 互換性                                     | 判定     |
| ------------------------- | ------------------------------------------- | ------------------------------------------ | -------- |
| `LLMAdapterStatusPayload` | `packages/shared/src/types/skillCreator.ts` | Main / Renderer / Preload の全層で参照可能 | **PASS** |
| `LLMAdapterStatus`        | `packages/shared/src/types/skillCreator.ts` | 既存型、変更不要                           | **PASS** |

**判定: PASS** — 型が shared パッケージに集約されており、パッケージ間の型ドリフトが発生しない。

### チェック5: コンポーネント責務境界

| 観点                                         | 設計内容                                            | 判定     |
| -------------------------------------------- | --------------------------------------------------- | -------- |
| `LLMAdapterErrorBanner` — Pure component か  | ✅ Props のみで描画を決定（副作用なし）             | **PASS** |
| `useLLMAdapterStatus` — IPC 依存の局所化     | ✅ フック内に閉じ、コンポーネントに漏れない         | **PASS** |
| `SkillLifecyclePanel` — 既存ロジックへの影響 | ✅ 既存フック・状態管理に変更なし（フック追加のみ） | **PASS** |

**判定: PASS**

### チェック6: メモリリーク防止

| リスク                               | 対策                                                          | 判定     |
| ------------------------------------ | ------------------------------------------------------------- | -------- |
| push 購読リーク                      | `useEffect` クリーンアップで `unsubscribe()` 呼び出し設計済み | **PASS** |
| アンマウント後の非同期 pull 結果適用 | `cancelled` フラグで pull コールバックをキャンセル設計済み    | **PASS** |

**判定: PASS**

### チェック7: simpler alternative 検討

| 代替案                                    | 検討結果                                                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| push のみ（pull なし）                    | マウント時に初期状態が不明。`"initializing"` のままになる可能性あり → **採用しない**                            |
| pull のみ（push なし）                    | ポーリングが必要になり非効率。`setLLMAdapterFailed()` 後の即時反映が保証されない → **採用しない**               |
| `agentSlice` にアダプタ状態を追加         | 既存スライスへの追加はスコープ拡大になる。`useLLMAdapterStatus` フックで局所化する方がシンプル → **採用しない** |
| Facade から直接 `webContents.send` を呼ぶ | Main の IPC 層と Service 層の責務が混在する → **採用しない**                                                    |

**結論**: pull + push の組み合わせ + `onAdapterStatusChanged` コールバックパターンが最適。

## MINOR 追跡テーブル

| MINOR ID | 指摘内容 | 解決予定Phase | 備考 |
| -------- | -------- | ------------- | ---- |
| （なし） | —        | —             | —    |

## ゲート判定

| 評価軸         | 判定 | 備考                        |
| -------------- | ---- | --------------------------- |
| MAJOR 指摘件数 | 0 件 | —                           |
| MINOR 指摘件数 | 0 件 | —                           |
| IPC 4層完全性  | PASS | 全チャネルで 4 層揃っている |
| セキュリティ   | PASS | sender validation 設計済み  |
| 型整合性       | PASS | shared パッケージに集約     |

### **ゲート判定: PASS → Phase 4 へ進んでよい**

---

## 統合テスト連携

Phase 4 で作成するテストが Phase 2 の設計契約と合致することを確認する：

- `creatorHandlers.adapterStatus.test.ts`: `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラの期待レスポンス形式 `{ success: true, data: LLMAdapterStatusPayload }` をテストする
- `LLMAdapterErrorBanner.test.tsx`: `status === "failed"` 時のバナー表示、`"ready"` / `"initializing"` 時の非表示をテストする

## 多角的チェック観点（AIが判断）

| 観点                     | 適用判断 | 確認内容                                                                   |
| ------------------------ | -------- | -------------------------------------------------------------------------- |
| IPC デッドチャンネル防止 | 適用済み | 4層対応表で全チャネルを検証                                                |
| 型ドリフト検出           | 適用済み | `LLMAdapterStatusPayload` は shared に配置、Main/Renderer 両方から参照可能 |
| 責務境界                 | 適用済み | IPC 基盤（Main 側）と UI 表示（Renderer 側）の concern が分離されている    |

## サブタスク管理

| ID     | 内容                           | ステータス |
| ------ | ------------------------------ | ---------- |
| ST-3-1 | IPC 4層チェック実施            | 完了       |
| ST-3-2 | 型互換性テーブル確定           | 完了       |
| ST-3-3 | simpler alternative 検討・記録 | 完了       |
| ST-3-4 | ゲート判定                     | PASS       |

## 成果物

| 成果物                               | パス                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| 設計レビューゲート判定（本ファイル） | `docs/30-workflows/task-rt-01-llm-adapter-error-propagation/phase-03-design-review.md` |
| ゲート判定サマリー                   | `outputs/phase-3/gate-decision.md`                                                     |

## 完了条件

- [ ] 全チェック項目に対して PASS / MINOR / MAJOR の判定が記載されている
- [ ] MAJOR 指摘件数が 0 であることが確認されている
- [ ] simpler alternative の検討結果が記録されている
- [ ] Phase 4 開始条件が満たされている（MAJOR = 0）

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-3/` に配置した
- [ ] `artifacts.json` の Phase 3 を `completed` に更新した

## 次Phase

**ゲート PASS** → [Phase 4: テスト作成](phase-04-test-creation.md) へ進む

Phase 4 以降は **Phase 4〜10 を依存関係に応じて並列実行可能**。
Phase 4（テスト作成）と Phase 5（実装）は TDD の順序を守り直列で実行すること。
