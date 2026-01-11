# 履歴UIコンポーネント統合 - タスク仕様書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | history-ui-integration                     |
| タスク名     | 履歴UIコンポーネントのアプリケーション統合 |
| 発見元       | Phase 11（手動テスト検証）                 |
| 発見日       | 2026-01-10                                 |
| 優先度       | 高                                         |
| 見積もり規模 | 中規模（M）                                |
| ステータス   | 進行中                                     |

---

## 概要

CONV-05-03で開発した履歴/ログ表示UIコンポーネント（テストカバレッジ94.43%達成）をElectronアプリケーションに統合し、ユーザーが利用可能な状態にする。

### 背景

- コンポーネントは単体テストで動作検証済みだが、実際のアプリケーションには未統合
- ユーザーが履歴/ログ表示機能を利用できない状態
- IPC通信が実際のメインプロセスと連携していない

### 最終ゴール

- 履歴一覧画面が表示される
- バージョン詳細が確認できる
- 変換ログが表示・フィルタできる
- バージョン復元が実行できる

---

## Phase一覧

| Phase | 名称                 | ステータス | パス                               |
| ----- | -------------------- | ---------- | ---------------------------------- |
| 1     | 要件定義             | 未実施     | `phase-1-requirements.md`          |
| 2     | 設計                 | 未実施     | `phase-2-design.md`                |
| 3     | 設計レビューゲート   | 未実施     | `phase-3-design-review.md`         |
| 4     | テスト作成           | 未実施     | `phase-4-test-creation.md`         |
| 5     | 実装                 | 未実施     | `phase-5-implementation.md`        |
| 6     | テスト拡充           | 未実施     | `phase-6-test-enhancement.md`      |
| 7     | テストカバレッジ確認 | 未実施     | `phase-7-coverage-verification.md` |
| 8     | リファクタリング     | 未実施     | `phase-8-refactoring.md`           |
| 9     | 品質保証             | 未実施     | `phase-9-quality-assurance.md`     |
| 10    | 最終レビューゲート   | 未実施     | `phase-10-final-review.md`         |
| 11    | 手動テスト検証       | 未実施     | `phase-11-manual-testing.md`       |
| 12    | ドキュメント更新     | 未実施     | `phase-12-documentation.md`        |
| 13    | PR作成               | 未実施     | `phase-13-pr-creation.md`          |

---

## スコープ

### 含むもの

- preloadスクリプトの設定（historyAPI公開）
- IPCハンドラーの登録（4チャンネル）
- HistoryPage.tsxの作成（ページコンポーネント）
- ルーティング設定
- global.d.ts型定義の追加
- 統合テスト

### 含まないもの

- 新機能の追加
- パフォーマンス最適化（仮想スクロール等）
- UIデザインの変更

---

## 依存関係

### 前提条件

| タスク     | 説明                 | ステータス |
| ---------- | -------------------- | ---------- |
| CONV-05-01 | 履歴データ永続化     | 完了       |
| CONV-05-02 | 履歴取得サービス     | 完了       |
| CONV-05-03 | 履歴UIコンポーネント | 完了       |

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                         | 内容                              |
| -------------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| 履歴/ログ表示UI仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | コンポーネント・型定義・IPC仕様   |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Electron IPC セキュリティパターン |

---

## 成果物一覧

| カテゴリ     | 成果物             | 配置先                                            |
| ------------ | ------------------ | ------------------------------------------------- |
| コード       | preload.ts更新     | `apps/desktop/src/main/preload.ts`                |
| コード       | historyHandlers.ts | `apps/desktop/src/main/ipc/historyHandlers.ts`    |
| コード       | HistoryPage.tsx    | `apps/desktop/src/renderer/pages/HistoryPage.tsx` |
| コード       | global.d.ts更新    | `apps/desktop/src/renderer/global.d.ts`           |
| テスト       | 統合テスト         | `apps/desktop/src/renderer/pages/__tests__/`      |
| ドキュメント | 実装ガイド         | `outputs/phase-12/implementation-guide.md`        |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-10 | 初版作成 |
