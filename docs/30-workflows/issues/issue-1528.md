# [#1528] [UT-06-002-UT-2] before-quit セッション終了フック実装

## メタ情報

```yaml
issue_number: 1528
title: [UT-06-002-UT-2] before-quit セッション終了フック実装
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1528
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`app.on('before-quit')` で `permissionStore.revokeSessionEntries("app-quit")` を呼び出し、セッションスコープのエントリをアプリ終了時に確実にクリアする。

## 対応方針

`apps/desktop/src/main/index.ts` の app ready イベント後に `app.on('before-quit', () => { permissionStore.revokeSessionEntries("app-quit"); })` を追加。PermissionStore インスタンスは既存の DI 配線から取得。

## 変更対象ファイル

| ファイル                         | 変更種別 |
| -------------------------------- | -------- |
| `apps/desktop/src/main/index.ts` | 修正     |

## 完了条件

- [ ] before-quit イベントで revokeSessionEntries が呼ばれる
- [ ] session スコープのエントリのみがクリアされる
- [ ] permanent/time スコープのエントリは残る
- [ ] 関連テストが PASS する

---

**元タスク**: UT-06-002 | **検出日**: 2026-03-23
