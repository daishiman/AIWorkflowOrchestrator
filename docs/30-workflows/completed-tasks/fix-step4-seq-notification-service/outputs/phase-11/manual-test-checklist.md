# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| Phase      | 11                            |
| タスクID   | TASK-NOTIFICATION-SERVICE-001 |
| タスク種別 | NON_VISUAL（UI 変更なし）     |
| 実施日     | 2026-04-02                    |

---

## NON_VISUAL タスク記録

本タスクは UI コンポーネントを変更しない NON_VISUAL タスク。
通知は macOS ネイティブ通知（OS 管理の UI）であり、アプリ内 Renderer Process UI には変更がない。

---

## 手動テストチェックリスト

- [x] MTC-01: スキル生成完了通知（macOS 通知センターに「スキル作成完了」が表示されること）
- [x] MTC-02: スキル生成失敗通知（macOS 通知センターに「スキル作成失敗」が表示されること）
- [x] MTC-03: before-quit ガード（スキル生成中に Cmd+Q で確認ダイアログが表示されること）
- [x] MTC-04: before-quit ガード（スキル生成中でないときはダイアログなしで終了できること）

---

## 前提条件

- macOS 環境で Electron アプリが起動可能
- TASK-FIX-EXECUTE-PLAN-FF-001 完了済み（スキル生成実行可能な状態）
- システム設定 > 通知で当該アプリの通知が許可されていること

---

## 起動コマンド

```bash
pnpm --filter @repo/desktop dev
```
