# [#1530] [UT-06-002-UT-4] permission-store-handlers ロガー統一

## メタ情報

```yaml
issue_number: 1530
title: [UT-06-002-UT-4] permission-store-handlers ロガー統一
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1530
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`permission-store-handlers.ts` 内の `console.error`/`console.info` を `electron-log` に統一する。PermissionStore.ts 側は既に electron-log を使用しており、ハンドラ側だけ console が残っている。

## 対応方針

`import log from "electron-log"` を追加し、`console.error` → `log.error`、`console.info` → `log.info` に置換する。ログレベルは元のコンテキストに合わせて適切に維持する（エラー系は `log.error`、情報系は `log.info`）。

## 変更対象ファイル

| ファイル                                                 | 変更種別 |
| -------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts` | 修正     |

## 完了条件

- [ ] `console.error`/`console.info` が全て `electron-log` の対応メソッドに置換されている
- [ ] ログレベルが適切である（error は `log.error`、info は `log.info`）
- [ ] 関連テストが PASS する

---

**元タスク**: UT-06-002 | **検出日**: 2026-03-23
