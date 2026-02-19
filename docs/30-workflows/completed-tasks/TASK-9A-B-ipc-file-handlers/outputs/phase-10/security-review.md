# セキュリティレビュー

## メタ情報

| 項目         | 値                                                                            |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | TASK-9A-B                                                                     |
| Phase        | 10（最終レビュー）                                                            |
| 作成日       | 2026-02-19                                                                    |
| レビュー対象 | IPC ファイルハンドラー（skill:readFile 〜 skill:restoreBackup 全6チャンネル） |

---

## 1. セキュリティチェックマトリクス

全6ハンドラーについて、必須セキュリティ対策の実装状況を確認した。

| チャンネル          | validateIpcSender | validatePath               | sanitizeErrorMessage        | getAllowedWindows | チャンネル定数参照                   |
| ------------------- | ----------------- | -------------------------- | --------------------------- | ----------------- | ------------------------------------ |
| skill:readFile      | ✅                | ✅（SkillFileManager内部） | ✅（isKnownSkillFileError） | ✅ [mainWindow]   | ✅ IPC_CHANNELS.SKILL_READ_FILE      |
| skill:writeFile     | ✅                | ✅（SkillFileManager内部） | ✅                          | ✅ [mainWindow]   | ✅ IPC_CHANNELS.SKILL_WRITE_FILE     |
| skill:createFile    | ✅                | ✅（SkillFileManager内部） | ✅                          | ✅ [mainWindow]   | ✅ IPC_CHANNELS.SKILL_CREATE_FILE    |
| skill:deleteFile    | ✅                | ✅（SkillFileManager内部） | ✅                          | ✅ [mainWindow]   | ✅ IPC_CHANNELS.SKILL_DELETE_FILE    |
| skill:listBackups   | ✅                | N/A（pathなし）            | ✅                          | ✅ [mainWindow]   | ✅ IPC_CHANNELS.SKILL_LIST_BACKUPS   |
| skill:restoreBackup | ✅                | ✅（SkillFileManager内部） | ✅                          | ✅ [mainWindow]   | ✅ IPC_CHANNELS.SKILL_RESTORE_BACKUP |

### 判定凡例

- ✅: 実装済み・問題なし
- N/A: 該当機能の性質上不要

---

## 2. パストラバーサル攻撃パターン検証

`SkillFileManager` 内部の `validatePath` 実装により、以下の攻撃パターンを全て遮断していることをテストで確認した。

| 攻撃パターン                 | テストケース                                     | 結果 |
| ---------------------------- | ------------------------------------------------ | ---- |
| `../../../etc/passwd`        | テスト S-04                                      | PASS |
| `../../secret`               | テスト S-05                                      | PASS |
| `../../../tmp/x`             | テスト S-06                                      | PASS |
| `foo/../../../x`             | テスト S-07                                      | PASS |
| URLエンコード（%2e%2e%2f等） | SkillFileManager内部で`path.resolve`後にチェック | PASS |

**検証方法**: `path.resolve` でフルパスに解決した後、スキルディレクトリのプレフィックスを確認。プレフィックスが一致しない場合は `SkillFileError` を送出するため、ハンドラー側で `sanitizeErrorMessage` によってサニタイズされた上で Renderer に返却される。

---

## 3. エラーサニタイズ検証

内部情報（スタックトレース、ファイルシステムパス等）が Renderer に漏洩しないことを確認した。

| シナリオ                                       | 期待動作                           | テストケース | 結果 |
| ---------------------------------------------- | ---------------------------------- | ------------ | ---- |
| 未知の `Error`                                 | `"Internal error"` を返す          | S-09         | PASS |
| `Error` 以外のオブジェクト                     | `"Internal error"` を返す          | S-10         | PASS |
| `isKnownSkillFileError` が `true` の既知エラー | `error.message` をそのまま返す     | S-11         | PASS |
| スタックトレース漏洩                           | `stack` プロパティが含まれないこと | S-09         | PASS |

**実装詳細**: `sanitizeErrorMessage` 関数は `isKnownSkillFileError` ガードを持ち、既知の `SkillFileError` のみ `message` を通過させ、それ以外は `"Internal error"` に置換する。

---

## 4. チャンネルホワイトリスト管理

`apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に以下6チャンネルが追加されていることを確認した。

```
IPC_CHANNELS.SKILL_READ_FILE
IPC_CHANNELS.SKILL_WRITE_FILE
IPC_CHANNELS.SKILL_CREATE_FILE
IPC_CHANNELS.SKILL_DELETE_FILE
IPC_CHANNELS.SKILL_LIST_BACKUPS
IPC_CHANNELS.SKILL_RESTORE_BACKUP
```

ホワイトリストに存在しないチャンネルは `safeInvoke` によりブロックされるため、未登録チャンネルの不正呼び出しは不可能である。

---

## 5. 送信元ウィンドウ検証

全ハンドラーで `validateIpcSender(event, getAllowedWindows())` を実行し、`mainWindow` 以外からの呼び出しを拒否する実装を確認した。`getAllowedWindows` は `[mainWindow]` を返し、想定外のウィンドウからの IPC 呼び出しを遮断する。

---

## 6. セキュリティレビュー結果

**全項目 PASS**

指摘事項なし。04-electron-security.md の IPC セキュリティ原則（チャンネルホワイトリスト管理・送信元検証・引数バリデーション・エラーサニタイズ）を全て充足している。
