# 実装パターン / IPC契約ドリフト自動検出 (S-IPC-AUTO)

> 親仕様書: [architecture-implementation-patterns-reference-ipc-contract-audits.md](architecture-implementation-patterns-reference-ipc-contract-audits.md)
> タスク: UT-TASK06-007

## 概要

regex/grep ベースの静的解析で、Main Process ハンドラと Preload API の契約ドリフトを自動検出するパターン。2026-03-19 再監査時点では `safeInvoke<T>` / `safeOn<T>` / 複数行 preload 呼び出し / 複数 const object 収集まで反映済み。

## スクリプト

`apps/desktop/scripts/check-ipc-contracts.ts`

## 検出ルール

| ルールID | ルール名 | 重大度 | 対応P |
| --- | --- | --- | --- |
| R-01 | チャンネル孤児（Main/Preload片方のみ） | warning | - |
| R-02 | 引数形式不一致（object vs primitive） | error | P44 |
| R-03 | チャンネル名ハードコード | warning | P27 |
| R-04 | 定数定義済みだが Main 未登録 | error | - |

## 実行方法

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only --format json
```

## 抽出パターン

- Main: `ipcMain.handle` / `ipcMain.on` + マルチライン結合
- Preload: `safeInvoke` / `safeOn` + generic / 複数行
- チャンネル解決: `IPC_CHANNELS`, `CHANNELS`, `CHAT_EDIT_CHANNELS` など const object を main/preload/shared から収集

## 既知の制約

- タプル配列経由登録（`[IPC_CHANNELS.XXX, handler]`）は未抽出
- alias / re-export / 動的定数参照は完全ではない
- event channel parity（`ipcMain.on` vs `safeOn`）はノイズを残す

## 教訓

1. preload 側の抽出改善だけでは十分でなく、channel map と main registration pattern を同時に進化させる必要がある
2. metrics が変わったら workflow outputs / LOGS / backlog を同ターンで更新しないと documentation drift が再発する
3. P45 は「設計上の目標」と「現在の自動検出能力」を分けて書く

## テスト戦略

### ユニットテスト（69件）

- ベースライン49件:
  T-4-1〜T-4-8（抽出関数・検出ルール・レポート生成・チャンネル解決）、
  T-6-1〜T-6-4（異常系・境界値・エッジケース・P44/P45回帰）、
  T-7a〜T-7e（`main()` / CLIオプション / exit code）
- EXT-006 追加20件:
  T-N-01〜05（`normalizeTypeAnnotation`）、
  T-P-01〜06（`isPrimitiveTypeAnnotation`）、
  T-M-01〜04（`mergeChannelMaps`）、
  T-R-01〜05（`CHANNEL_OBJECT_PATTERN` / `PRELOAD_CALL_START_PATTERN`）

### カバレッジ（2026-03-21 測定）

| 指標 | 結果 |
|---|---|
| Line | 95.79% |
| Branch | 91.55% |
| Function | 100% |

### テスト実行

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts
```

### main() テストのパス解決パターン

`process.argv[1]` をスクリプトパスに設定して実コードベースに対する統合テストとして実行。
fs モックよりも安定し、高カバレッジを達成（P40派生パターン対策）。

## 実行サマリー（2026-03-21 実測）

| 項目 | 値 |
|---|---|
| 実行時間 | 約2.1秒 |
| Main handlers 検出数 | 217 |
| Preload entries 検出数 | 189 |
| Drifts | 198件 |
| Orphans | 120件 |
| 判定 | `passed: false`（実コード上の既存 drift により FAIL 継続） |

## 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| UT-TASK06-007 | IPC契約ドリフト自動検出スクリプト | 完了（2026-03-18、2026-03-19 再監査追補） |
| UT-TASK06-007-EXT-001 | タプル配列経由ハンドラ抽出拡張 | 未着手 |
| UT-TASK06-007-EXT-002 | エイリアス / 再export / 動的定数解決強化 | 未着手 |
| UT-TASK06-007-EXT-003 | ipcMain.on パターン検証強化 | 未着手 |
| UT-TASK06-007-EXT-004 | check-ipc-contracts.ts モジュール分割 | 未着手 |
| UT-TASK06-007-EXT-005 | R-02 セマンティクスチェック精度向上 | 未着手 |
| UT-TASK06-007-EXT-006 | check-ipc-contracts テスト拡充（5関数/パターン export追加 + 20件追加） | 完了（2026-03-21、カバレッジ95.79%） |
