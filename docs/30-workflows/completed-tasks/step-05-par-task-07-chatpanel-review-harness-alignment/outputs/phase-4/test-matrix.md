# Phase 4: テストマトリクス

## メタ情報

| 項目               | 値                                              |
| ------------------ | ----------------------------------------------- |
| タスクID           | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 作成日             | 2026-03-23                                      |
| Phase              | 4 — テスト作成                                  |
| 対象コンポーネント | ChatPanel.tsx                                   |

---

## 1. テストタイプ責務分離

| タイプ      | 責務                                 | 実行環境           | TC-ID 範囲   |
| ----------- | ------------------------------------ | ------------------ | ------------ |
| unit        | 単一コールバック・ハンドラの動作検証 | happy-dom + Vitest | TC-01〜TC-05 |
| integration | Store action / IPC call の連携検証   | happy-dom + Vitest | TC-06〜TC-07 |
| contract    | mainline との parity 差分固定        | happy-dom + Vitest | TC-08        |
| manual      | UI 視覚動作・実機キーボード操作      | Electron 実機      | TC-09        |

---

## 2. テストケース一覧

### TC-01: GAP-01 — onTerminalSwitch actionability

| 項目           | 内容                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| タイプ         | unit                                                                          |
| 対象 GAP       | GAP-01                                                                        |
| 検証対象       | `handleTerminalSwitch` が Store の `setActiveView('terminal')` を呼び出すこと |
| 入力条件       | TerminalSwitch ボタンをクリック（fireEvent）                                  |
| 期待結果       | `mockSetActiveView` が `'terminal'` 引数で 1 回呼ばれる                       |
| no-op 禁止確認 | `() => {}` が使われていないこと（ソース grep で保証）                         |

### TC-02: GAP-02 — onSelectProvider actionability

| 項目           | 内容                                                                              |
| -------------- | --------------------------------------------------------------------------------- |
| タイプ         | unit                                                                              |
| 対象 GAP       | GAP-02                                                                            |
| 検証対象       | `handleSelectProvider` が Store の `setSelectedProvider(provider)` を呼び出すこと |
| 入力条件       | Provider セレクタを変更（fireEvent.change）                                       |
| 期待結果       | `mockSetSelectedProvider` が選択した provider 値で 1 回呼ばれる                   |
| no-op 禁止確認 | コールバック関数がストア呼び出しを含むこと                                        |

### TC-03: GAP-03 — onSelectModel actionability

| 項目           | 内容                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| タイプ         | unit                                                                     |
| 対象 GAP       | GAP-03                                                                   |
| 検証対象       | `handleSelectModel` が Store の `setSelectedModel(model)` を呼び出すこと |
| 入力条件       | Model セレクタを変更（fireEvent.change）                                 |
| 期待結果       | `mockSetSelectedModel` が選択した model 値で 1 回呼ばれる                |
| no-op 禁止確認 | コールバック関数がストア呼び出しを含むこと                               |

### TC-04: GAP-04 — onOpenTerminal actionability（MINOR-A 確認後）

| 項目           | 内容                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| タイプ         | unit                                                                       |
| 対象 GAP       | GAP-04                                                                     |
| 検証対象       | `handleOpenTerminal` が `window.electronAPI.openTerminal()` を呼び出すこと |
| 入力条件       | OpenTerminal ボタンをクリック（fireEvent）                                 |
| 期待結果       | `mockElectronAPI.openTerminal` が 1 回呼ばれる                             |
| 前提条件       | MINOR-A: `openTerminal` IPC チャンネルの存在を grep 確認済みであること     |
| no-op 禁止確認 | IPC 呼び出しが実装されていること                                           |

### TC-05: JSDoc @role review-harness の存在確認

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| タイプ   | unit（静的解析）                                                           |
| 検証対象 | ChatPanel.tsx のソースコードに `@role review-harness` JSDoc が存在すること |
| 手段     | ソースファイルの文字列検索（grep assertion）                               |
| 期待結果 | 1 件以上マッチすること                                                     |

### TC-06: Store action 連携 — provider/model 選択フロー

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| タイプ   | integration                                                                        |
| 検証対象 | provider 変更 → model リセット → 再選択の一連フローで Store が正しく更新されること |
| 入力条件 | provider 変更後に model 変更                                                       |
| 期待結果 | `setSelectedProvider` → `setSelectedModel` の順で各 1 回呼ばれる                   |

### TC-07: IPC call 連携 — terminal 起動フロー

| 項目     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| タイプ   | integration                                                       |
| 検証対象 | handoff 状態で OpenTerminal をクリックした際に IPC が呼ばれること |
| 入力条件 | state = `handoff`、OpenTerminal ボタンをクリック                  |
| 期待結果 | `window.electronAPI.openTerminal` が 1 回呼ばれる                 |

### TC-08: Mainline-Harness Parity 差分固定

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| タイプ   | contract                                                                         |
| 検証対象 | Concern 3 で定義した差分表（Props / State / Handlers / IPC）が変化していないこと |
| 手段     | スナップショットテスト（`toMatchSnapshot`）                                      |
| 期待結果 | スナップショット差分なし（変更時は意図的に更新する）                             |
| 備考     | 差分表の固定により意図しない mainline 機能の混入を防ぐ                           |

### TC-09: 手動テスト — Escape キャンセル・キーボード操作

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| タイプ   | manual                                                                 |
| 検証対象 | streaming 中に Escape キーを押すとキャンセルされること                 |
| 実行環境 | Electron 実機                                                          |
| 手順     | 1. メッセージ送信 → 2. streaming 中に Esc キー押下 → 3. キャンセル確認 |
| 期待結果 | state が `streaming` → `cancelled` に遷移し、UI が更新される           |

---

## 3. テスト対象ファイル

```
apps/desktop/src/renderer/components/chat/ChatPanel.tsx
apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx  ← 拡張対象
```

### 既存テストファイルの拡張ポイント

| 既存テストファイル             | 拡張内容                            |
| ------------------------------ | ----------------------------------- |
| ChatPanel.test.tsx             | TC-01〜TC-05、TC-08 を追加          |
| ChatPanel.integration.test.tsx | TC-06〜TC-07 を追加（存在する場合） |

---

## 4. テスト環境設定

### 環境

- **テストフレームワーク**: Vitest
- **DOM 環境**: happy-dom
- **P39 対策**: `userEvent` 使用禁止、`fireEvent` を使用する

```typescript
// NG: happy-dom では Symbol エラーが発生する
const user = userEvent.setup();
await user.click(element);

// OK: fireEvent を使用する
fireEvent.click(element);

// OK: 非同期ハンドラは act でラップ
await act(async () => {
  fireEvent.click(element);
});
```

### 実行コマンド（P40 対策）

```bash
# 必ずパッケージディレクトリから実行する
cd apps/desktop && pnpm vitest run src/renderer/components/chat/

# プロジェクトルートからの実行は vitest.config.ts が読み込まれず NG
# pnpm vitest run apps/desktop/src/renderer/...  ← 禁止
```

---

## 5. モック対象サマリ

| モック対象           | モック方式                              | 参照先           |
| -------------------- | --------------------------------------- | ---------------- |
| `useAppStore`        | `vi.mock("../../store")` + 個別セレクタ | mock-strategy.md |
| `useStreamingChat`   | `vi.mock` + state/actions               | mock-strategy.md |
| `window.electronAPI` | グローバルモック（beforeEach）          | mock-strategy.md |
