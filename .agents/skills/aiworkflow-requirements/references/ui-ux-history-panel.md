# 履歴/ログ表示UI仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
> 実装タスク: CONV-05-03

---

## 概要

本ドキュメントは、ファイル変換履歴とログを表示するUIコンポーネントの設計仕様を定義する。
バージョン管理、詳細確認、バージョン復元機能を提供する。

---

## ドキュメント構成

| カテゴリ         | ファイル                                       | 説明                                         |
| ---------------- | ---------------------------------------------- | -------------------------------------------- |
| コンポーネント   | [ui-history-components.md](./ui-history-components.md) | コンポーネント構成、Props定義、カスタムフック |
| データ型・IPC    | [ui-history-data-types.md](./ui-history-data-types.md) | データ型、データフロー、IPC通信              |
| UI設計           | [ui-history-design.md](./ui-history-design.md)         | UI設計、アクセシビリティ、エラーハンドリング |
| 統合・タスク管理 | [ui-history-integration.md](./ui-history-integration.md) | 統合手順、ステータス、タスク依存関係       |

---

## コンポーネント一覧

| コンポーネント | 種別     | 責務                           | 詳細 |
| -------------- | -------- | ------------------------------ | ---- |
| VersionHistory | Organism | バージョン履歴一覧の表示       | [ui-history-components.md](./ui-history-components.md) |
| VersionDetail  | Organism | 選択バージョンの詳細表示       | [ui-history-components.md](./ui-history-components.md) |
| ConversionLogs | Organism | 変換ログの一覧・フィルタ表示   | [ui-history-components.md](./ui-history-components.md) |
| RestoreDialog  | Organism | バージョン復元の確認ダイアログ | [ui-history-components.md](./ui-history-components.md) |

---

## カスタムフック一覧

| フック名          | 責務                     | 状態管理                           |
| ----------------- | ------------------------ | ---------------------------------- |
| useVersionHistory | バージョン履歴の取得     | history, isLoading, error, hasMore |
| useVersionDetail  | バージョン詳細の取得     | version, logs, isLoading, error    |
| useConversionLogs | 変換ログの取得・フィルタ | logs, isLoading, error, hasMore    |
| useRestore        | バージョン復元処理       | isLoading, error, isSuccess        |

---

## IPCチャンネル

| チャンネル                  | 方向            | 用途               |
| --------------------------- | --------------- | ------------------ |
| `history:getFileHistory`    | Renderer → Main | 履歴一覧取得       |
| `history:getVersionDetail`  | Renderer → Main | バージョン詳細取得 |
| `history:getConversionLogs` | Renderer → Main | 変換ログ取得       |
| `history:restoreVersion`    | Renderer → Main | バージョン復元     |

---

## テスト品質サマリー

| カテゴリ           | テスト数 | カバレッジ |
| ------------------ | -------- | ---------- |
| コンポーネント     | 73       | 94.43%     |
| フック             | 28       | 94.43%     |
| IPCハンドラー      | 22       | 100%       |
| preload API        | 28       | 100%       |
| 統合テスト         | 39       | -          |
| **合計（自動）**   | **190**  | -          |
| **手動テスト項目** | **24**   | 全PASS     |

---

## 統合ステータス

| タスク | 状態 | 備考 |
|--------|------|------|
| CONV-05-01 ロギングサービス | **完了** | 履歴データ永続化基盤 |
| CONV-05-02 履歴取得サービス | **完了** | PR未作成 |
| history-ui-integration | **完了** | preload/IPC/ページ統合 |
| history-ipc-handlers | **完了** | 4チャンネル実装 |
| history-service-db-integration | **完了** | カバレッジ92%+ |
| history-preload-setup | **完了** | 28テスト、100% |
| history-manual-testing | **完了** | 24項目全PASS |
| CONV-05-03 UIコンポーネント | **未着手** | 4コンポーネント＋4フック |

詳細は [ui-history-integration.md](./ui-history-integration.md) を参照。

---

## 変更履歴

| Version | Date       | Changes                      |
| ------- | ---------- | ---------------------------- |
| 2.0.0   | 2026-01-26 | 4ファイルに分割（740行→インデックス+詳細ファイル） |
| 1.8.0   | 2026-01-17 | history-manual-testing完了（手動テスト24項目全PASS、自動テスト190件全PASS、発見課題0件） |
| 1.7.0   | 2026-01-13 | history-preload-setup完了（28テスト、カバレッジ100%、セキュリティ確認完了） |
| 1.6.0   | 2026-01-12 | 未タスク指示書作成完了 |
| 1.5.0   | 2026-01-12 | history-service-db-integration完了 |
| 1.4.0   | 2026-01-12 | タスク依存関係一覧追加 |
| 1.3.0   | 2026-01-12 | IPCハンドラー詳細セクション追加 |
| 1.2.0   | 2026-01-11 | 統合ステータスセクション追加 |
| 1.1.0   | 2026-01-10 | 実装詳細・型定義・テスト情報を追加 |
| 1.0.0   | 2026-01-10 | CONV-05-03で初版作成         |

---

## 履歴UIファミリー参照導線（TASK-SKILL-LIFECYCLE-07）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| ステータス | `spec_created`（設計タスク） |

### ナビゲーション経路

ライフサイクル履歴パネルからの参照導線:

| 起点 | 遷移先 | トリガー |
| --- | --- | --- |
| ライフサイクルタイムライン | スキル詳細パネル | イベント行クリック |
| 集約ビューサマリー | HistorySearchView | 「すべての履歴」リンク |
| フィードバック一覧 | フィードバック詳細モーダル | フィードバック行クリック |
| スコア推移グラフ | 評価詳細ビュー | データポイントクリック |

### 参照リンク

- Task07 設計: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-2-design.md`

---

## 関連ドキュメント

| ドキュメント     | パス                              |
| ---------------- | --------------------------------- |
| コンポーネント設計 | ui-ux-components.md             |
| パネルUI設計     | ui-ux-panels.md                   |
| デザインシステム | ui-ux-design-system.md            |
| アクセシビリティ | ui-ux-advanced.md                 |
| ファイル変換アーキテクチャ | architecture-file-conversion.md |
