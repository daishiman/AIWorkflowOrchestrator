# 未タスク指示書: UT-RUNTIME-BUILDER-DELETE-CHAT-EDIT-001

## メタ情報

```yaml
issue_number: 1517
```

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | UT-RUNTIME-BUILDER-DELETE-CHAT-EDIT-001          |
| 由来       | UT-RUNTIME-BUILDER-MIGRATION-001 Phase 3 MINOR-1 |
| ステータス | unassigned                                       |
| 優先度     | low                                              |
| 作成日     | 2026-03-23                                       |
| 関連仕様書 | llm-workspace-chat-edit.md                       |

## 目的

`apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts` を削除し、`runtime/TerminalHandoffBuilder` への一本化を完了する。

## 背景

UT-RUNTIME-BUILDER-MIGRATION-001 で `buildForSurface()` 統一メソッドを追加し、全呼び出し元を移行した。chat-edit 版は `@deprecated` 付与済みだが、ファイル自体はまだ残存している。

## 実行タスク

1. `chat-edit/TerminalHandoffBuilder.ts` を import している箇所がないことを確認する
2. ファイルを削除する
3. 関連テストがあれば削除または移行する

## 受入基準

- [ ] `chat-edit/TerminalHandoffBuilder.ts` が削除されている
- [ ] `grep -rn "chat-edit/TerminalHandoffBuilder" apps/desktop/src/` が 0件
- [ ] 全テストが PASS する
