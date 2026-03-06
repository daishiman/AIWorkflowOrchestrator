# Phase 6: 回帰テスト拡充

## 実施概要

- 実施日: 2026-03-06
- 実行トラック:
  - SubAgent-Contract-Main 相当: `authModeHandlers.test.ts`, `authModeHandlers.error.test.ts`
  - SubAgent-Bridge-Preload 相当: `authModeApi.contract.test.ts`, `channels.test.ts`
  - SubAgent-Renderer-State 相当: `authModeSlice.test.ts`, `authModeSlice.error.test.ts`, `authModeSlice.selectors.test.ts`, `SettingsView.test.tsx`, `AuthModeSelector.test.tsx`, `infinite-loop-prevention.test.tsx`
- 実行コマンド:

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/ipc/__tests__/authModeHandlers.test.ts \
  src/main/ipc/__tests__/authModeHandlers.error.test.ts \
  src/preload/__tests__/authModeApi.contract.test.ts \
  src/preload/channels.test.ts \
  src/renderer/store/slices/__tests__/authModeSlice.test.ts \
  src/renderer/store/slices/__tests__/authModeSlice.error.test.ts \
  src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts \
  src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx \
  src/renderer/views/SettingsView/SettingsView.test.tsx \
  src/renderer/__tests__/infinite-loop-prevention.test.tsx
```

- 結果: `Test Files 10 passed (10)`, `Tests 252 passed (252)`

## 正常系の追加・固定

| レイヤ   | ケース                                                      | 監査結果 |
| -------- | ----------------------------------------------------------- | -------- |
| Main     | `get` が `data: { mode }` を返す                            | PASS     |
| Main     | `set` 成功時に `changed` event を送る                       | PASS     |
| Main     | `status` が canonical `AuthModeStatus` を返す               | PASS     |
| Main     | `validate(mode)` が canonical `AuthModeStatus` を返す       | PASS     |
| Main     | `validate()` が current mode を使う                         | PASS     |
| Preload  | `get()` が `AUTH_MODE_GET` をそのまま invoke                | PASS     |
| Preload  | `validate(request?)` が optional request で動作             | PASS     |
| Preload  | `onModeChanged()` が shared event payload を透過            | PASS     |
| Renderer | `fetchMode -> fetchStatus` で state が同期                  | PASS     |
| Renderer | `setMode -> fetchStatus` で新 mode の status を再取得       | PASS     |
| Renderer | `changed` event の `status` をそのまま state に反映         | PASS     |
| UI       | `SettingsView` が `message`, `errorCode`, `guidance` を表示 | PASS     |
| UI       | `AuthModeSelector` の click / keyboard / aria 契約          | PASS     |

## 異常系の追加・固定

| レイヤ   | ケース                                                              | 監査結果 |
| -------- | ------------------------------------------------------------------- | -------- |
| Main     | invalid sender が request validation より先に reject                | PASS     |
| Main     | invalid mode を `auth-mode/invalid-mode` で reject                  | PASS     |
| Main     | sender null / destroyed / external origin / missing frame を reject | PASS     |
| Main     | storage error を sanitize して返す                                  | PASS     |
| Main     | token / key / `sk-ant-*` を error message から mask                 | PASS     |
| Main     | credential missing を `no-api-key` / `no-subscription-token` に分離 | PASS     |
| Renderer | `fetchStatus` 失敗時に fallback status を構築                       | PASS     |
| Renderer | `validate` 失敗時に fallback status を返す                          | PASS     |
| Renderer | network / keychain / unknown を UI message へ変換                   | PASS     |
| Renderer | `window.electronAPI` 欠如時にクラッシュしない                       | PASS     |

## Red から Green へ反転した要点

1. `auth-mode:get` の戻り shape を Main / Preload / Renderer で `{ mode }` に統一した。
2. `auth-mode:status` と `auth-mode:validate` を `AuthModeStatus` transport DTO に統一した。
3. `auth-mode:changed` を `previousMode`, `mode`, `status`, `changedAt` に再定義した。
4. sender failure と invalid mode failure を別ケースで固定した。
5. SettingsView と selector 系回帰を加え、P31 再発条件を監視対象に入れた。

## selector / no-loop 回帰

| ファイル                            | 観点                                                | 結果 |
| ----------------------------------- | --------------------------------------------------- | ---- |
| `authModeSlice.selectors.test.ts`   | 個別 selector と action 参照安定性                  | PASS |
| `SettingsView.test.tsx`             | `initializeAuthMode` が mount で 1 回だけ実行       | PASS |
| `infinite-loop-prevention.test.tsx` | SettingsView 相当の初期化パターンが無限ループしない | PASS |

## Phase 7 への引き継ぎ

- touched file の coverage 数値を集計する
- channel ごとの contract coverage matrix を作る
- coverage 対象に含まれない `preload/index.ts`, `preload/types.ts`, `store/index.ts` は contract test と selector regression で担保した旨を明記する
