# UT-FIX-5-3: Preload Agent Abort セキュリティ修正

## メタ情報

| 項目             | 内容                                         |
| ---------------- | -------------------------------------------- |
| タスクID         | UT-FIX-5-3                                   |
| タスク名         | Preload Agent Abort セキュリティ修正         |
| 分類             | バグ修正                                     |
| 対象機能         | Preload API                                  |
| 優先度           | 高                                           |
| 見積もり規模     | 小（30分以内）                               |
| ステータス       | 未実施                                       |
| 発見元           | TASK-FIX-5-1 Phase 10 アーキテクチャレビュー |
| 発見日           | 2026-02-09                                   |
| セキュリティ影響 | 高                                           |
| 関連タスク       | TASK-FIX-5-1-SKILL-API-UNIFICATION           |
| issue_number     | 756                                          |

## 1. Why（なぜこのタスクが必要か）

### 問題

`apps/desktop/src/preload/index.ts` の行424で、`ipcRenderer.send()`を直接呼び出しており、safeInvokeによるホワイトリスト検証をバイパスしている。

### セキュリティリスク

- ALLOWED_INVOKE_CHANNELSによるセキュリティ検証がスキップされる
- 未承認のIPCチャネルへのアクセスを防止できない

### 現状のコード

```typescript
abort: () => {
  ipcRenderer.send("agent:abort");
},
```

## 2. What（何を達成するか）

### ゴール

- `ipcRenderer.send`を`safeInvoke`に置換
- ハードコード文字列を`IPC_CHANNELS`定数に置換
- ホワイトリスト検証を有効化

### 変更後のコード

```typescript
abort: () => safeInvoke(IPC_CHANNELS.AGENT_ABORT),
```

## 3. How（どのように実装するか）

### Step 1: IPC_CHANNELS定数の確認

`AGENT_ABORT`が定義されていることを確認。未定義の場合は追加。

### Step 2: ALLOWED_INVOKE_CHANNELS確認

`AGENT_ABORT`がホワイトリストに含まれていることを確認。

### Step 3: Main側ハンドラー確認

`ipcMain.on("agent:abort", ...)`が`ipcMain.handle`に対応しているか確認。
対応していない場合は調整が必要。

### Step 4: 置換実行

`ipcRenderer.send` → `safeInvoke`に置換

### Step 5: 動作確認

エージェント中止機能が正常に動作することを確認

### 3.5 実装課題と解決策（TASK-FIX-5-1からの学び）

| 課題ID | 課題                                                    | 解決策                                               | 参照                                                                                                                                          |
| ------ | ------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S1     | ipcRenderer.send()がホワイトリスト検証をバイパス        | safeInvokeに置換してセキュリティ検証を有効化         | [P27: 06-known-pitfalls.md](../../../.claude/rules/06-known-pitfalls.md#p27-preload-ハードコード文字列の見落とし)                             |
| S2     | Main側ハンドラーがsend→invoke変更に対応していない可能性 | ipcMain.on → ipcMain.handle への変更が必要か事前確認 | [security-skill-ipc.md](../../../.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md)                                     |
| S3     | ホワイトリスト（ALLOWED_INVOKE_CHANNELS）への登録漏れ   | channels.tsでAGENT_ABORTが登録されていることを確認   | [architecture-implementation-patterns.md](../../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) |

## 4. 完了条件

- [ ] `IPC_CHANNELS.AGENT_ABORT` 定数が存在することを確認
- [ ] `ALLOWED_INVOKE_CHANNELS` にエントリ追加（必要な場合）
- [ ] `ipcRenderer.send("agent:abort")` → `safeInvoke(IPC_CHANNELS.AGENT_ABORT)` に置換
- [ ] Main側ハンドラーが`ipcMain.handle`パターンに対応（必要な場合）
- [ ] `pnpm typecheck` がパス
- [ ] エージェント中止機能の手動テスト完了

## 5. リスクと対策

| リスク                 | 対策                                        |
| ---------------------- | ------------------------------------------- |
| Main側ハンドラー非対応 | send→invokeへの変更が必要な場合は慎重に対応 |
| 機能破壊               | 手動テストで確認                            |
| ホワイトリスト未登録   | ALLOWED_INVOKE_CHANNELSへの追加             |

## 6. 検証方法

| テスト種別 | 検証内容                       | 実行コマンド                           |
| ---------- | ------------------------------ | -------------------------------------- |
| 型チェック | TypeScript型エラーなし         | `pnpm typecheck`                       |
| 単体テスト | 既存テストがPASS               | `pnpm test -- --run`                   |
| 手動テスト | エージェント中止機能が正常動作 | アプリ起動→エージェント実行→中止ボタン |

## 7. 参照

- 検出レポート: `docs/30-workflows/TASK-FIX-5-1-SKILL-API-UNIFICATION/outputs/phase-12/unassigned-task-detection.md`
- 苦戦パターン: `.claude/rules/06-known-pitfalls.md#P27`
- セキュリティ仕様: `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`
