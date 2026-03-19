# P50チェック結果: 既実装状態の調査

## タスクID: UT-TASK06-007

## 調査日: 2026-03-18

## 調査コマンドと結果

### 1. 既存IPC契約チェックスクリプトの検索

```bash
find apps/desktop/scripts/ packages/ -name "*ipc*contract*" -o -name "*check*ipc*" 2>/dev/null
```

**結果**: 該当ファイルなし

### 2. CI品質ゲートのIPC関連チェック

```bash
grep -rn "ipc" .github/workflows/ 2>/dev/null
```

**結果**: `.github/workflows/` ディレクトリが存在しない（CI未構成）

### 3. 対象ファイルのコミット履歴

```bash
git log --oneline -10 -- apps/desktop/src/main/handlers/ apps/desktop/src/preload/
```

**結果**: 直近10コミットでハンドラ・Preload層に活発な変更あり

### 4. 既存scriptsディレクトリの内容

```bash
ls apps/desktop/scripts/
```

**結果**: Phase 11用キャプチャスクリプト（`.mjs`）、カバレッジツール、Phase 11サーバーが存在。IPC契約チェックスクリプトは未作成。

## IPC規模の実測値

| 指標                  | 実測値 | 仕様書記載値 | 差分                                            |
| --------------------- | ------ | ------------ | ----------------------------------------------- |
| ipcMain.handle 登録数 | 324    | 324          | 一致                                            |
| safeInvoke 呼び出し数 | 150    | 325          | 乖離あり（仕様書値は全Preload APIメソッド数か） |
| safeOn 呼び出し数     | 1      | -            | -                                               |
| IPC_CHANNELS 定義数   | 252    | 360          | 乖離あり（仕様書値はコメント含む行数か）        |

## 判定

| 判定       | 条件                              | 対応                      |
| ---------- | --------------------------------- | ------------------------- |
| **未実装** | 既存IPC契約チェックスクリプトなし | 新規作成として Phase 2 へ |

## 結論

IPC契約ドリフト自動検出スクリプトは完全に未実装の状態。新規作成として Phase 2（設計）に進む。
