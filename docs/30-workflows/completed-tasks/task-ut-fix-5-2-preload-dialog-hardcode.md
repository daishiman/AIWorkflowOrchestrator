# UT-FIX-5-2: Preload Dialog API ハードコード削除

## メタ情報

| 項目             | 内容                                         |
| ---------------- | -------------------------------------------- |
| タスクID         | UT-FIX-5-2                                   |
| タスク名         | Preload Dialog API ハードコード削除          |
| 分類             | バグ修正                                     |
| 対象機能         | Preload API                                  |
| 優先度           | 中                                           |
| 見積もり規模     | 極小（10分以内）                             |
| ステータス       | 未実施                                       |
| 発見元           | TASK-FIX-5-1 Phase 10 アーキテクチャレビュー |
| 発見日           | 2026-02-09                                   |
| セキュリティ影響 | 中                                           |
| 関連タスク       | TASK-FIX-5-1-SKILL-API-UNIFICATION           |
| issue_number     | 755                                          |

## 1. Why（なぜこのタスクが必要か）

### 問題

`apps/desktop/src/preload/index.ts` の行328, 333で、Dialog APIのチャネル名がハードコード文字列で指定されている。

### 影響

- 型安全性が失われている
- チャネル名の変更時に追従漏れのリスク
- IPC_CHANNELSによる一元管理が崩れる

### 現状のコード

```typescript
// Line 328
showOpenDialog: (options) => safeInvoke("dialog:showOpenDialog", options),
// Line 333
showSaveDialog: (options) => safeInvoke("dialog:showSaveDialog", options),
```

## 2. What（何を達成するか）

### ゴール

- ハードコード文字列を`IPC_CHANNELS`定数に置換
- 型安全なチャネル参照を実現

### 変更後のコード

```typescript
showOpenDialog: (options) => safeInvoke(IPC_CHANNELS.DIALOG_SHOW_OPEN, options),
showSaveDialog: (options) => safeInvoke(IPC_CHANNELS.DIALOG_SHOW_SAVE, options),
```

## 3. How（どのように実装するか）

### Step 1: IPC_CHANNELS定数の確認

`apps/desktop/src/preload/channels.ts`で`DIALOG_SHOW_OPEN`と`DIALOG_SHOW_SAVE`が定義されていることを確認

### Step 2: 置換実行

2箇所のハードコード文字列を定数参照に置換

### Step 3: 動作確認

- ファイル選択ダイアログが正常に動作することを確認
- 型チェックがパスすることを確認

### 3.5 実装課題と解決策（TASK-FIX-5-1からの学び）

| 課題ID | 課題                                   | 解決策                                                               | 参照                                                                                                              |
| ------ | -------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| S1     | ハードコード文字列がgrepで発見しにくい | `grep -rn "safeInvoke\|safeOn" &#124; grep -v "IPC_CHANNELS"` で検出 | [P27: 06-known-pitfalls.md](../../../.claude/rules/06-known-pitfalls.md#p27-preload-ハードコード文字列の見落とし) |
| S2     | 置換後に機能破壊のリスク               | 手動テストでダイアログ機能を確認                                     | [P28: 06-known-pitfalls.md](../../../.claude/rules/06-known-pitfalls.md#p28-手動テストでの削除確認忘れ)           |

## 4. 完了条件

- [ ] `"dialog:showOpenDialog"` → `IPC_CHANNELS.DIALOG_SHOW_OPEN` に置換
- [ ] `"dialog:showSaveDialog"` → `IPC_CHANNELS.DIALOG_SHOW_SAVE` に置換
- [ ] `pnpm typecheck` がパス
- [ ] ダイアログ機能の手動テスト完了

## 5. リスクと対策

| リスク       | 対策                    |
| ------------ | ----------------------- |
| 定数が未定義 | 事前にchannels.tsを確認 |
| 機能破壊     | 手動テストで確認        |

## 6. 検証方法

| テスト種別 | 検証内容                 | 実行コマンド                      |
| ---------- | ------------------------ | --------------------------------- |
| 型チェック | TypeScript型エラーなし   | `pnpm typecheck`                  |
| 単体テスト | 既存テストがPASS         | `pnpm test -- --run`              |
| 手動テスト | ダイアログ機能が正常動作 | アプリ起動→ファイル選択ダイアログ |

## 7. 参照

- 検出レポート: `docs/30-workflows/TASK-FIX-5-1-SKILL-API-UNIFICATION/outputs/phase-12/unassigned-task-detection.md`
- 苦戦パターン: `.claude/rules/06-known-pitfalls.md#P27`
