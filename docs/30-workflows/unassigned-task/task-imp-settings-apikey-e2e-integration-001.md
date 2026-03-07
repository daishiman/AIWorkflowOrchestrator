# ApiKeysSection E2E統合テスト追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1046
```

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | UT-FIX-SETTINGS-APIKEY-E2E-001   |
| タスク名     | ApiKeysSection E2E統合テスト追加 |
| 分類         | テスト改善                       |
| 対象機能     | Settings > ApiKeysSection        |
| 優先度       | 低                               |
| 見積もり規模 | 中規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 12                         |
| 発見日       | 2026-03-07                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 で Main 側（`apiKeyHandlers` の `Array.isArray` バリデーション）と Renderer 側（`ApiKeysSection` の type predicate フィルタ）の二重防御を実装した。しかし、現状は全て単体テスト（モック使用）で検証しており、実際の Electron IPC 通信経路での連携動作は未検証。

S28（Main ハンドラ間接テストパターン）で `ipcMain.handle` のコールバックを直接テストする手法を確立したが、これはあくまでモック環境での検証であり、contextBridge / structured clone の実動作は含まれない。

### 1.2 問題点・課題

- Main Process の `Array.isArray` バリデーションと Renderer の 5層防御（S27）が実際に連携動作するかを検証できていない
- contextBridge 経由の structured clone で型情報が変化するケース（P48の原因）が、単体テストでは再現不可能
- Electron 実行環境固有の問題（P40: テスト実行ディレクトリ依存）がE2Eレベルで顕在化する可能性がある

### 1.3 放置した場合の影響

- Main 側でバリデーション PASS したレスポンスが Renderer 側で予期せぬ shape になるケースを検出できない
- contextBridge の structured clone による型変換問題がリリース後に初めて発覚するリスクがある
- IPC 契約変更時に、単体テストは PASS するが実環境で動作しないリグレッションが混入する

---

## 2. 何を達成するか（What）

### 2.1 目的

ApiKeysSection の契約防御を E2E で再現し、実環境回帰を検出できる状態にする。

### 2.2 最終ゴール

最低3ケース（正常/非配列/malformed混在）のE2EがCIで実行できる。

### 2.3 スコープ

#### 含むもの

- E2Eテスト追加
- fixture整備
- 実行手順ドキュメント化

#### 含まないもの

- 全設定画面E2E網羅
- 既存unit testの置換

### 2.4 成果物

- E2Eテストファイル
- 実行ログ
- 仕様更新記録

---

## 3. どのように実行するか（How）

### 3.1 前提条件

Playwright/E2E環境が利用可能であること。

### 3.2 依存タスク

- TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 完了

### 3.3 必要な知識

Playwright、Electronレンダラー検証、fixture設計。

### 3.4 推奨アプローチ

既存の screenshot capture script を流用し、テスト化へ段階移行する。

---

## 4. 実行手順

### Phase構成

- Phase 1: E2Eシナリオ設計
- Phase 2: テスト実装
- Phase 3: CI導入

### Phase 2: テスト実装

#### 手順

1. 正常系ケースを実装
2. 非配列ケースを実装
3. malformed混在ケースを実装

#### 完了条件

3ケース全PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 3ケースのE2Eが実装済み

### 品質要件

- [ ] CIで安定実行できる
- [ ] flaky抑制策あり

### ドキュメント要件

- [ ] Phase 11/12 証跡運用を更新

---

## 6. 検証方法

### テストケース

- TC-E2E-01: 正常表示
- TC-E2E-02: providers非配列
- TC-E2E-03: malformed混在

### 検証手順

1. `pnpm --filter @repo/desktop test:e2e` 実行
2. スクリーンショットとログを確認

---

## 7. リスクと対策

| リスク       | 影響度 | 発生確率 | 対策                          |
| ------------ | ------ | -------- | ----------------------------- |
| flaky化      | 中     | 中       | wait条件の明確化とfixture固定 |
| 実行時間増加 | 低     | 中       | スモーク3ケースに限定         |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` — S27: Renderer境界5層防御パターン、S28: Mainハンドラ間接テストパターン
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` — v1.14.0: Main/Renderer双方の防御仕様
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` — CC-7: レスポンス配列フィールドの防御検証
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — 残課題テーブル
- `.claude/rules/06-known-pitfalls.md` — P40（テスト実行ディレクトリ依存）, P48, P49
- `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/phase-12/unassigned-task-report.md`

### 参考資料

- `apps/desktop/scripts/capture-task-06-settings-apikey-contract-guard-phase11.mjs` — Phase 11 スクリーンショットスクリプト（E2Eテストの基盤として流用可能）
- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

---

## 9. 備考

### 苦戦箇所（TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 からの教訓）

1. **Main ハンドラの直接テスト困難性（S28）**: `ipcMain.handle` で登録されたコールバックは直接呼び出せない。S28パターン（`ipcMain.handle` をモックし、`mock.calls` からコールバックを取得して直接テスト）で解決したが、E2E テストではこの制約がなくなり、実際のIPC通信を検証できる

2. **テスト実行ディレクトリ依存（P40）**: モノレポ環境でプロジェクトルートからテストを実行すると `vitest.config.ts` の `environment` 設定が読み込まれない。E2E テストでも同様の問題が発生する可能性がある。`pnpm --filter @repo/desktop` で実行することを標準化する

3. **Renderer 5層防御の検証限界**: 単体テストではモックされたIPCレスポンスに対する防御を検証できるが、実際の Main Process → Preload → Renderer の通信経路での防御連携は検証できない。E2E テストで初めて「Main側 `Array.isArray` + Renderer側 type predicate」の二重防御が連携動作することを確認できる

### レビュー指摘の原文

```text
UT-3: E2E テストでの設定画面統合テスト — 現在のテストは単体テスト（モック使用）のみ。
実際の Electron 環境での IPC 通信を含む統合テストにより、Main Process のバリデーションと
Renderer のフィルタが連携して動作することを確認できる。
```

### 補足事項

- 優先度低。E2E基盤整備タスクと同時に実施する
- Phase 11 スクリーンショットスクリプトをベースに、Playwright の Electron テストに移行することを推奨
- 最低3ケース（正常/非配列/malformed混在）に限定し、flaky リスクを最小化する
