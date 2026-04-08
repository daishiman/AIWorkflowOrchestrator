# Phase 2 成果物: テスト設計書

## 実行日時: 2026-04-07

---

## モック戦略

| 観点                   | 設計内容                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| モック戦略             | `vi.mock("electron")` で `ipcMain.handle` を spy し、チャネル名収集用配列に push して記録する |
| `BrowserWindow` スタブ | `isDestroyed: () => false` と `webContents: { send: vi.fn() }` の最小スタブを用意する         |
| スナップショット対象   | `registerRuntimeSkillCreatorHandlers()` から収集したソート済みチャネル名配列（18 チャネル）   |
| 重複検出               | `Set` 変換後のサイズと元配列サイズが一致するかのアサーション                                  |
| テストファイル配置     | `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts`                  |

---

## アサーション方針

```typescript
// 1. チャネル名収集
const channels = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls
  .map((args) => args[0] as string)
  .sort(); // 決定論的にするためソート必須

// 2. 件数アサーション
expect(channels).toHaveLength(18);

// 3. スナップショット比較
expect(channels).toMatchSnapshot();

// 4. 重複なしアサーション
const unique = new Set(channels);
expect(unique.size).toBe(channels.length);
```

---

## 設計詳細

### なぜ `vi.mock("electron")` が適切か

`ipcMain` は Electron のメインプロセス環境でのみ動作する。Vitest（Node.js）環境では実際の `ipcMain` は使えないため、`vi.mock` でモジュール全体を差し替える。

### なぜ `.sort()` が必要か

`registerRuntimeSkillCreatorHandlers()` 内のチャネル登録順序は実装依存。順序が変わるとスナップショットが壊れる。ソートで決定論性を保証する。

### 最小 `BrowserWindow` スタブの surface

`registerRuntimeSkillCreatorHandlers()` が実際に使うのは:

- `mainWindow.isDestroyed()` → `() => false` を返す
- `mainWindow.webContents.send(...)` → `vi.fn()` で十分

---

## BLOCKER チェック（Phase 3 用）

| チェック項目                                                        | 判定 |
| ------------------------------------------------------------------- | ---- |
| `vi.mock("electron")` が `ipcMain` 実挙動を正確に捉えるか           | PASS |
| `mainWindow` モックが最小 surface で成立するか                      | PASS |
| スナップショットがソート済みで決定論的か                            | PASS |
| 重複検出ロジック（Set 比較）が正確か                                | PASS |
| スコープが `registerRuntimeSkillCreatorHandlers` に限定されているか | PASS |
| スコープが「含まないもの」を超過していないか                        | PASS |
| 変更ファイルが最小限か                                              | PASS |

---

## 完了判定

- [x] テスト設計書が作成されている（モック方針・アサーション方針を含む）
- [x] 変更ファイル一覧が確定している
- [x] 設計が Phase 3 レビューで承認可能な粒度で記述されている
- [x] `outputs/phase-2/` 配下に成果物が配置されている
