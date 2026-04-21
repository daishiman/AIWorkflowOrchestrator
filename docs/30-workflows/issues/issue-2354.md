# [#2354] refactor(ipc): TASK-SC-08-FUP-04 filter-by-id パターンの progress 受信系水平展開

## メタ情報

```yaml
issue_number: 2354
title: refactor(ipc): TASK-SC-08-FUP-04 filter-by-id パターンの progress 受信系水平展開
state: OPEN
priority: 中
scale: 中規模
category: リファクタリング
status: 未実施
created_date: 2026-04-20
updated_date: 2026-04-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2354
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

skill-creator 系以外（例: execution progress / audit log stream 等）で `skill-creator:progress` 同等の単一ブロードキャスト IPC を利用している受信系があれば、FUP-02 で導入した `filter-by-planId` パターンを水平展開するリファクタリングタスク。

## 参照仕様書

- 正本: [docs/30-workflows/unassigned-task/TASK-SC-08-FUP-04-PROGRESS-FILTER-HORIZONTAL.md](../blob/main/docs/30-workflows/unassigned-task/TASK-SC-08-FUP-04-PROGRESS-FILTER-HORIZONTAL.md)
- 親 task: #2300 (TASK-SC-08-FUP-02, CLOSED) — filter-by-planId 実装完了
- lessons-learned: `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md`

## 前提条件

- 横断調査で対象受信系が存在することを確認できた場合のみ起票
- 本 task 作成時点では具体対象は未特定（FUP-02 NV-03 の結果を起点に洗い出し運用と連携）

## スコープ

### 含む

- 対象 IPC チャンネル洗い出し（`webContents.send` / `ipcMain.emit` を経由する単一ブロードキャスト受信系）
- 同様の filter ヘルパー共通化の要否判定
- 受信 Hook への `options.planId` 追加
- 後方互換 3 条件のテスト網羅

### 含まない

- progress チャンネル自体の多重化
- サービス境界再設計

## 対象候補の調査観点

- `webContents.send('*:progress', payload)` パターン
- execution progress / audit log stream など並行呼び出し系
- 同一チャンネルに複数 emitter から送信される箇所

## 苦戦箇所・学習事項 (FUP-02 由来)

- filter-by-id パターンは**後方互換 3 条件**（未設定 2 種 + 一致 / 不一致）のテスト網羅が必要
- **Runtime Facade と Main IPC** のどちらで emit されるか経路調査に時間がかかる
- **useEffect 依存配列**に planId を入れ忘れると cleanup が動かずリーク
- 空文字 `""` と `undefined` を厳密等価で区別する必要
- 共通 helper 化するかインラインロジックで残すかは**呼び出し元数と実装パターンの揃い具合**で判断

## 起票タイミング

NV-03 / phase-8 refactor-decision-log の結果で水平展開候補が見つかった時点。
