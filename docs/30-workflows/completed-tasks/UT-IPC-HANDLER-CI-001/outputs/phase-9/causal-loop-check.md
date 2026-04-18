# 因果ループ監査

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 9                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 因果ループ 1: チャンネル追加 → CI 失敗

```
開発者が creatorHandlers.ts にチャンネルを追加する
↓
スナップショットが更新されない
↓
REG-SNAP-01: toMatchSnapshot() が差分を検出 → テスト失敗
REG-COUNT-01: toHaveLength(19) が件数不一致 → テスト失敗
↓
CI が失敗 → PR マージがブロックされる
↓
開発者が気づき --updateSnapshot で意図的に更新
```

**検証**: REG-SNAP-01 と REG-COUNT-01 が対応 ✅

## 因果ループ 2: 重複登録 → CI 失敗

```
開発者が同一チャンネルを 2 回 ipcMain.handle() で登録する
（例: SKILL_CREATOR_GET_ADAPTER_STATUS の二重登録）
↓
mockIpcMainHandle.mockImplementation が 2 回同じチャンネルをキャプチャ
↓
REG-DEDUP-01: new Set(handles).size < handles.length → テスト失敗
REG-SNAP-01: スナップショット差分（重複分のチャンネル名が増加） → テスト失敗
↓
CI が失敗 → PR マージがブロックされる
```

**検証**: REG-DEDUP-01 と REG-EDGE-01 が対応 ✅

## 因果ループ 3: スナップショット過多更新 → テスト形骸化（リスク）

```
スナップショット更新が習慣化する
↓
--updateSnapshot を安易に実行する
↓
意図しないチャンネル変更がスナップショットに吸収される
↓
テストが形骸化する
```

**対策**: PR テンプレートに「意図的な変更か確認」チェック項目を追加（R-002 対策）
**現状**: このループはまだ発生していない。注意が必要。
