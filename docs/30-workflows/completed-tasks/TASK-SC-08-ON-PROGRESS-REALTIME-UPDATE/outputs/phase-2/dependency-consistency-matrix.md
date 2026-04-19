# 依存タスク整合確認マトリクス

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 2                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 依存タスク一覧

| 依存タスクID                     | 依存種別 | 内容                                           | 整合状態 |
| -------------------------------- | -------- | ---------------------------------------------- | -------- |
| TASK-SC-07-STREAMING-PROGRESS-UI | 前提     | useStreamingProgress Hook の基本実装           | 整合     |
| TASK-SW-STREAM-FUP-03            | 前提     | SkillCreatorService の mode 別 phase emit 実装 | 整合     |
| TASK-SC-06-UI-RUNTIME-CONNECTION | 前提     | generationProgress 静的テキスト接続            | 整合     |

---

## 2. 依存タスク詳細確認

### TASK-SC-07-STREAMING-PROGRESS-UI

| 確認項目                               | 期待値 | 実際の状態                       | 結果 |
| -------------------------------------- | ------ | -------------------------------- | ---- |
| `useStreamingProgress.ts` が存在する   | あり   | あり                             | OK   |
| `PHASE_TO_STAGE` 定数が定義されている  | あり   | あり（create モード 5 エントリ） | OK   |
| `mapPhaseToStage` 関数が存在する       | あり   | あり（フォールバック付き）       | OK   |
| P5 対策（useEffect cleanup）が実装済み | あり   | あり                             | OK   |
| `skillCreatorAPI.onProgress` 接続済み  | あり   | あり（useEffect 内で登録）       | OK   |
| `useUpdateStreamingProgress` 使用      | あり   | あり                             | OK   |

### TASK-SW-STREAM-FUP-03

| 確認項目                                        | 期待値 | 実際の状態                    | 結果 |
| ----------------------------------------------- | ------ | ----------------------------- | ---- |
| update モードで `loading-skill` phase を emit   | あり   | あり（Main プロセス実装済み） | OK   |
| update モードで `analyzing` phase を emit       | あり   | あり（Main プロセス実装済み） | OK   |
| orchestrate モードで `engine-selection` を emit | あり   | あり（Main プロセス実装済み） | OK   |
| improve-prompt モードで `improving` を emit     | あり   | あり（Main プロセス実装済み） | OK   |
| `SKILL_CREATOR_PROGRESS` チャネルを使用         | あり   | あり                          | OK   |

### TASK-SC-06-UI-RUNTIME-CONNECTION

| 確認項目                                         | 期待値 | 実際の状態                            | 結果 |
| ------------------------------------------------ | ------ | ------------------------------------- | ---- |
| `GenerateStep.tsx` に `generationProgress` prop  | あり   | あり                                  | OK   |
| `message \|\| generationProgress \|\| ""` の実装 | あり   | あり（currentMessage として実装済み） | OK   |
| SkillCreateWizard 経由での接続                   | あり   | あり                                  | OK   |

---

## 3. 後続タスクへの影響評価

| 後続タスク候補                  | 影響内容                                                 | 対応要否 |
| ------------------------------- | -------------------------------------------------------- | -------- |
| 全モードの E2E テスト           | mode 別進捗表示が正しく動くことを確認できる              | 任意     |
| collaborative モード追加        | 新 phase が追加された場合 PHASE_TO_STAGE に追記するだけ  | 将来対応 |
| StreamingGenerationStage 型拡張 | 現時点では不要。mode 固有 stage が必要になった場合に対応 | 将来対応 |

---

## 4. 整合性サマリー

| 観点                 | 結果 | 備考                                                          |
| -------------------- | ---- | ------------------------------------------------------------- |
| 前提タスクの完了確認 | PASS | TASK-SC-07, SW-STREAM-FUP-03, SC-06 いずれも実装済み          |
| インタフェース整合   | PASS | IPC ペイロード型・Preload API 型・Store 型に変更なし          |
| 型互換性             | PASS | 追加エントリの値はすべて `StreamingGenerationStage` に適合    |
| 後方互換性           | PASS | create モード既存 phase の動作に変更なし                      |
| 循環依存なし         | PASS | PHASE_TO_STAGE は単方向参照のみ                               |
| 二重登録リスクなし   | PASS | onProgress 登録は `useStreamingProgress.ts` の useEffect のみ |
