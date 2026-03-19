# 未タスク検出レポート - UT-TASK06-007 Phase 12

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | UT-TASK06-007     |
| 作成日   | 2026-03-18        |
| Phase    | 12 - ドキュメント |
| 検出件数 | 5件               |

---

## 検出サマリー

| 未タスクID            | タイトル                                              | 優先度 | ステータス |
| --------------------- | ----------------------------------------------------- | ------ | ---------- |
| UT-TASK06-007-EXT-001 | タプル配列経由ハンドラ抽出パターン拡張                | Medium | 未着手     |
| UT-TASK06-007-EXT-002 | エイリアス / 再export / 動的定数のチャンネル解決強化  | Low    | 未着手     |
| UT-TASK06-007-EXT-003 | ipcMain.on パターンの検証強化（第2フェーズ）          | Low    | 未着手     |
| UT-TASK06-007-EXT-004 | check-ipc-contracts.ts モジュール分割リファクタリング | Low    | 未着手     |
| UT-TASK06-007-EXT-005 | R-02 セマンティクスチェック精度向上                   | Low    | 未着手     |

---

## 検出内容詳細

### UT-TASK06-007-EXT-001: タプル配列経由ハンドラ抽出パターン拡張

**概要**:
`registerAllIpcHandlers` 内でタプル配列形式 `[IPC_CHANNELS.XXX, handler]` を使ってハンドラを一括登録するパターンが、`check-ipc-contracts.ts` の `extractMainHandlers` 関数で未対応。このパターンを使うハンドラは現在の静的解析では検出されず、R-01（存在チェック）でのフォールスポジティブ（Mainにハンドラがないという誤検出）が発生する可能性がある。

**現状のコード例**（検出できないパターン）:

```typescript
// apps/desktop/src/main/handlers/register-all.ts
const handlers: [string, IpcHandler][] = [
  [IPC_CHANNELS.SKILL_IMPORT, handleSkillImport],
  [IPC_CHANNELS.SKILL_REMOVE, handleSkillRemove],
];

for (const [channel, handler] of handlers) {
  ipcMain.handle(channel, handler);
}
```

**対応内容**:

- `extractMainHandlers` にタプル配列パターンの正規表現を追加
- 配列リテラル `[[channel, handler], ...]` の形式を解析してチャンネル名を抽出
- 既存テストに新パターン用ケースを追加

**影響範囲**: `apps/desktop/scripts/check-ipc-contracts.ts`（主に `extractMainHandlers` 関数）

**関連制約**: C-01（実装ガイド 既知の制約テーブル参照）

---

### UT-TASK06-007-EXT-002: エイリアス / 再export / 動的定数のチャンネル解決強化

**概要**:
2026-03-19 の再監査で `resolveChannelMap` は `IPC_CHANNELS` に加えて複数 const object を収集できるようになった。一方で、再export、別名参照、動的組み立て、構造化された alias chain までは完全に追えていない。

**現状の問題**:

- 単純な object literal 以外の経路で渡されるチャンネル参照は未解決のまま残る
- `resolveChannelMap` の coverage は改善したが、「どこまで解けるか」の境界が仕様化されていない

**対応内容**:

- alias / re-export / computed key を含むケースの fixture 追加
- 「単純 object literal」「再export」「計算済み alias」を分けた仕様化
- 必要なら設定ファイル化ではなく AST ベース判定へ昇格

**影響範囲**: `apps/desktop/scripts/check-ipc-contracts.ts`（主に `resolveChannelMap` 関数）

**関連制約**: C-02（実装ガイド 既知の制約テーブル参照）

---

### UT-TASK06-007-EXT-003: ipcMain.on パターンの検証強化（第2フェーズ）

**概要**:
現在の実装では `ipcMain.handle()` を主要な検出対象とし、`ipcMain.on()` は第1フェーズとして限定的なサポートのみ。`ipcMain.on()` で登録されたイベントリスナー（一方向通信）と `preload` の `safeOn` の対応検証が不完全。

**現状の制約**:

- `ipcMain.on()` は検出されるが、`removeListener` / `removeAllListeners` のライフサイクルが追跡されない
- `safeOn` と `ipcMain.on` の対称性チェックが R-01 の対象外になっている

**対応内容**:

- `extractMainHandlers` に `ipcMain.on()` パターンの完全サポートを追加
- リスナーのライフサイクル（登録・解除）を追跡する `ListenerEntry` 型を導入
- R-01 の検出範囲を `ipcMain.handle + ipcMain.on` の両方に拡張

**影響範囲**: `apps/desktop/scripts/check-ipc-contracts.ts`（extractMainHandlers、matchAndValidate）

**関連制約**: C-03（実装ガイド 既知の制約テーブル参照）

---

### UT-TASK06-007-EXT-004: check-ipc-contracts.ts モジュール分割リファクタリング

**概要**:
`check-ipc-contracts.ts` は 578 行の単一ファイルであり、EXT-001〜005 の追加実装を前提にするとさらに肥大化する。抽出器 / resolver / validator / reporter の責務境界が曖昧になるため、モジュール分割で保守性を回復する。

**対応内容**:

- `extractors.ts` / `resolver.ts` / `validator.ts` / `reporter.ts` への分割
- CLI エントリと純粋関数群の分離
- モジュール単位テストの導入

**影響範囲**: `apps/desktop/scripts/check-ipc-contracts.ts`、追加モジュール群、関連テスト

**関連制約**: C-04（実装ガイド 既知の制約テーブル参照）

---

### UT-TASK06-007-EXT-005: R-02 セマンティクスチェック精度向上

**概要**:
R-02 は近似的な静的解析に依存しており、偽陽性と見逃しの両方を残している。`skillId` / `skillName` のような P45 系ドリフトをより精密に検出できるよう、セマンティクス比較を強化する。

**対応内容**:

- `classifyHandlerArgPattern` / `classifyPreloadArgPattern` の `unknown` 削減
- 参照渡しハンドラの引数推定強化
- `rawSignature` / `rawArgs` からの命名差分ヒューリスティクス追加

**影響範囲**: `apps/desktop/scripts/check-ipc-contracts.ts`（主に R-02 判定部）

**関連制約**: C-05（実装ガイド 既知の制約テーブル参照）

---

## P3チェックリスト

**注意（P3/P38/P58対策）**: 3ステップの完了状況を記録する。

| ステップ                    | 内容                                                                                                                 | 実施状況 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------- |
| ① 指示書作成                | `docs/30-workflows/unassigned-task/` 配下にEXT-001〜005の指示書を配置                                                | 完了     |
| ② task-workflow family 同期 | `task-workflow.md` / `task-workflow-backlog.md` / `task-workflow-completed-ipc-contract-preload-alignment.md` を同期 | 完了     |
| ③ 関連仕様書リンク追加      | `ipc-contract-checklist.md` / `quick-reference.md` / implementation pattern detail に参照リンクを追加                | 完了     |

### 指示書配置先

```
1. docs/30-workflows/unassigned-task/ut-task06-007-ext-001-tuple-array-handler-extraction.md
2. docs/30-workflows/unassigned-task/ut-task06-007-ext-002-multi-channel-const-resolution.md
3. docs/30-workflows/unassigned-task/ut-task06-007-ext-003-ipc-on-pattern-enhancement.md
4. docs/30-workflows/unassigned-task/ut-task06-007-ext-004-script-modular-split.md
5. docs/30-workflows/unassigned-task/ut-task06-007-ext-005-r02-semantic-precision.md
```

- task-workflow.md / task-workflow-backlog.md / task-workflow-completed-ipc-contract-preload-alignment.md: 同期済み
- 関連仕様書リンク: ipc-contract-checklist.md / quick-reference.md / implementation pattern detail に追加済み

---

## unassigned-task-detection.md 更新履歴

| 日付       | 件数 | 変更内容                                                            |
| ---------- | ---- | ------------------------------------------------------------------- |
| 2026-03-18 | 3件  | 初版作成（EXT-001〜003 を記録）                                     |
| 2026-03-19 | 5件  | 再監査で EXT-004 / EXT-005 と backlog / completed ledger 同期を追加 |
