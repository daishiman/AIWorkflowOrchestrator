# Phase 7: 統合ゲート

## メタ情報

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001        |
| Phase    | 7                                                            |
| 作成日   | 2026-03-23                                                   |
| 前提     | Phase 4 test-matrix.md、Phase 6 regression-expansion-plan.md |

## 1. 統合ゲートの位置づけ

Phase 7 の統合ゲートは、後続の Phase 8（リファクタリング）に進む前に確認すべき
「再実行すべき統合観点」を定義する。

カバレッジ数値（coverage-targets.md）が充足していても、以下の統合ゲートを全て通過しない限り
Phase 8 に進んではならない。

## 2. 統合ゲート一覧

### Gate 1: IPC 契約整合（P44/P45/P65 対策）

IPC handler と Preload の型・引数が完全に整合していることを確認する。

| チェック項目                                                    | 確認方法                                                                | 合否基準             |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------- |
| `slide:capability:get` の引数型が Main/Preload で一致           | handler の型定義と `window.electronAPI.slide.getCapability` の型を照合  | 完全一致             |
| `slide:capability:changed` のペイロード型が Main/Preload で一致 | `webContents.send` の第2引数型と Preload の `ipcRenderer.on` の型を照合 | 完全一致             |
| Preload allowlist に両 channel が登録されている                 | `ipc-channels.ts` の ALLOWED_CHANNELS を確認                            | 2件存在              |
| channel 名が `IPC_CHANNELS` 定数から参照されている              | `grep -rn '"slide:capability' apps/desktop/src/`                        | 文字列リテラル0件    |
| dead-end namespace がない（P65 対策）                           | `grep -rn "slide:capability" apps/desktop/src/` で全ファイルを確認      | 未登録 channel が0件 |

### Gate 2: 禁止遷移ガード（V-08 対応）

不正遷移4パターンが全て拒否されることを確認する。

| 禁止遷移            | 拒否の実装方法               | テスト TC-ID | 確認コマンド           |
| ------------------- | ---------------------------- | ------------ | ---------------------- |
| synced → degraded   | Reducer で throw             | V08-T01      | テスト実行で PASS 確認 |
| synced → guidance   | Reducer で throw             | V08-T02      | テスト実行で PASS 確認 |
| guidance → degraded | Reducer で throw             | V08-T03      | テスト実行で PASS 確認 |
| degraded → running  | Reducer で throw（P62 対策） | V08-T04      | テスト実行で PASS 確認 |

### Gate 3: silent fallback 完全排除（P62 対策）

apiKeySource が全パスで正しく報告されることを確認する。

| 確認項目                                                     | 確認方法                                                                   | 合否基準 |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- | -------- |
| safeStorage 成功時: apiKeySource="safeStorage"               | V10-T03 のアサーション                                                     | PASS     |
| env fallback 時: apiKeySource="env" + 警告ログ               | V10-T04 + ERR-T07 のアサーション                                           | PASS     |
| API key なし時: apiKeySource="none" + blockedReason 設定     | V10-T05 + ERR-T08 のアサーション                                           | PASS     |
| safeStorage 成功時に env を参照しない（false positive 防止） | ERR-T09 のアサーション                                                     | PASS     |
| `DEFAULT_CONFIG` への暗黙 fallback が存在しない              | `grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/main/services/` | 0件      |

### Gate 4: ManualBoundary 制約（V-11 対応）

禁止アクション3種が manual lane で実行されないことを確認する。

| 禁止アクション   | テスト TC-ID     | 確認コマンド                                                             |
| ---------------- | ---------------- | ------------------------------------------------------------------------ |
| auto-send        | V11-T01          | `mockAgentClient.runSlideSync` が manual lane で呼ばれていないことを確認 |
| hidden injection | V11-T02          | `mockManualFallback.preprocessInput` がパススルーであることを確認        |
| silent retry     | V11-T03, ERR-T01 | `mockAgentClient.runSlideSync` の呼び出し回数が1回であることを確認       |

### Gate 5: 後方互換性（V-09 対応）

ModifierResponse の既存 consumer が拡張フィールドなしでも動作することを確認する。

| 確認項目                                                 | テスト TC-ID     | 合否基準           |
| -------------------------------------------------------- | ---------------- | ------------------ |
| 既存形式（fallback_reason, suggested_action なし）の処理 | V09-T03          | エラーなく処理完了 |
| optional フィールドが undefined の場合の consumer の動作 | V09-T01, V09-T02 | エラーなく処理完了 |
| 拡張フィールドあり版の consumer での読み取り             | V09-T04          | 正常に読み取れる   |

### Gate 6: DTO の IPC 伝搬（V-10 対応）

SlideCapabilityDTO が structured clone 制約を満たすことを確認する。

| 確認項目                                                     | テスト TC-ID | 確認方法                           |
| ------------------------------------------------------------ | ------------ | ---------------------------------- |
| 全4状態（synced/running/degraded/guidance）が IPC を通過する | V10-T07      | `structuredClone(dto)` が成功      |
| contextBridge を経由して Renderer に届く                     | V10-T01〜T06 | integration テスト PASS            |
| undefined フィールドが除去されて届く                         | BC-IPC-01    | consumer が undefined を期待しない |

### Gate 7: P5 対策（二重登録防止）

`registerSlideCapabilityHandlers()` の二重登録が防止されていることを確認する。

| 確認項目                                              | 確認方法                                           | 合否基準 |
| ----------------------------------------------------- | -------------------------------------------------- | -------- |
| 2回目の登録で例外が throw される                      | BC-IPC-02 のテスト                                 | PASS     |
| macOS `activate` イベント後も handler が正常動作する  | 手動テスト（Phase 11）またはシミュレーションテスト | 正常動作 |
| `unregisterAllIpcHandlers` の呼び出し後に再登録できる | テスト（P5 解決策パターンの採用確認）              | PASS     |

## 3. ゲート通過基準の総括

| Gate   | 名称                 | 合否基準                        | 未達時の対処                                   |
| ------ | -------------------- | ------------------------------- | ---------------------------------------------- |
| Gate 1 | IPC 契約整合         | 全チェック項目 OK               | Phase 5 へ戻り channel 設計を修正              |
| Gate 2 | 禁止遷移ガード       | V08-T01〜T04 全件 PASS          | Phase 5 へ戻り Reducer を修正                  |
| Gate 3 | silent fallback 排除 | 全チェック項目 OK               | Phase 5 へ戻り apiKeySource 実装を修正         |
| Gate 4 | ManualBoundary 制約  | V11-T01〜T03, ERR-T01 全件 PASS | Phase 5 へ戻り lane 分岐を修正                 |
| Gate 5 | 後方互換性           | V09-T01〜T05 全件 PASS          | Phase 5 へ戻り optional フィールドの扱いを修正 |
| Gate 6 | DTO IPC 伝搬         | V10-T01〜T07 全件 PASS          | Phase 5 へ戻り DTO 設計を修正                  |
| Gate 7 | P5 対策              | BC-IPC-02 PASS                  | Phase 5 へ戻り safeRegister パターンを適用     |

**全7ゲートが PASS した場合のみ Phase 8 へ進む。**

## 4. 設計タスクにおける統合ゲートの扱い

本タスクは設計タスクであり、プロダクションコードの変更がないため、
実装タスク（UT-SLIDE-IMPL-001）の Phase 7 で本 integration-gate.md を参照して実際のゲート確認を行う。

本文書は「後続実装タスクが Phase 7 で何を確認するか」の設計文書として機能する。

```
本タスク Phase 7（統合ゲート設計）
  └→ UT-SLIDE-IMPL-001 Phase 7（統合ゲート実施）
       ├── Gate 1〜7 の実際の確認
       └── 全 PASS → Phase 8 へ進む
```

## 5. Phase 8 以降への引き継ぎ事項

統合ゲート通過後に Phase 8（リファクタリング）で確認すべき追加事項:

| 引き継ぎ項目                               | 引き継ぎ先 Phase | 内容                                                   |
| ------------------------------------------ | ---------------- | ------------------------------------------------------ |
| BC-ST-01 の自己遷移仕様確定                | Phase 8          | リファクタリング時に自己遷移の no-op/throw を統一      |
| BC-MB-02 の hidden injection 定義明確化    | Phase 8          | コメントで定義を明文化する                             |
| P41 対策（v8 coverage でのインライン関数） | Phase 7 確認後   | カバレッジが想定より低い場合は inline arrow 関数を展開 |
| EV07-T04（自己遷移）の期待動作確定         | Phase 8 後       | リファクタリング完了後にテストを確定版で実装           |
