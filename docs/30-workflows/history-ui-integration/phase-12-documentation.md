# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 12                     |
| Phase名    | ドキュメント更新       |
| 前提Phase  | Phase 11               |
| 後続Phase  | Phase 13               |
| ステータス | 未実施                 |
| 作成日     | 2026-01-10             |
| 機能名     | history-ui-integration |

---

## 目的

実装した内容をドキュメント化し、システム要件に反映し、未完了タスクを検出・記録する。

## 背景

Phase 11までで実装・テストが完了。本フェーズでは技術ドキュメントを作成し、システム仕様を更新し、残課題を可視化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成（Phase 12-1）

**目的**: 実装内容をドキュメント化

**2パート構成**:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1: 概念的説明に含める内容**:

- 履歴UIコンポーネント統合とは何か
- なぜ統合が必要だったか
- どのように動作するか（図解付き）

**Part 2: 技術的詳細に含める内容**:

- アーキテクチャ図
- IPC通信フロー
- コード例と設計意図
- 用語集

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システムドキュメント更新（Phase 12-2）

**目的**: システム仕様書を更新

**更新対象**:

| ドキュメント | パス                                                                       | 更新内容               |
| ------------ | -------------------------------------------------------------------------- | ---------------------- |
| 履歴UI仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | 統合完了ステータス追加 |

**更新原則**:

- 概要のみ記載
- Single Source of Truth遵守
- 詳細は実装ガイドを参照

**期待される成果物**:

- `outputs/phase-12/documentation-update-log.md`

---

### タスク3: 未タスク検出（Phase 12-3）

**目的**: 残課題を検出し、指示書として記録

**検出ソース**:

| #   | ソース                 | 確認項目                      | Grepパターン例                                        |
| --- | ---------------------- | ----------------------------- | ----------------------------------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                    |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/`                                   |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                   |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`            |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/` |

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`
- 該当時: `docs/30-workflows/unassigned-task/*.md`

---

## 参照資料

| 参照資料               | パス                                                                                | 内容           |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                                            | Phase 11成果物 |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` | テンプレート   |
| 未タスクテンプレート   | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`      | テンプレート   |

---

## 成果物

| 成果物               | パス                                           | 必須 | 内容                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新履歴が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 実装ガイド作成（Part 1: 概念的説明）
2. 実装ガイド作成（Part 2: 技術的詳細）
3. システムドキュメント更新
4. 未タスク検出
5. 未タスク指示書作成（該当する場合）
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-integration --phase 12
```

---

## 実装ガイドテンプレート

```markdown
# 履歴UIコンポーネント統合 - 実装ガイド

## Part 1: 概念的な説明

### これは何？

履歴UIコンポーネント統合とは、すでに作成済みの履歴表示UIコンポーネントを
Electronアプリケーションで実際に使えるようにする作業です。

### なぜ必要？

コンポーネントは単体で動作確認できていましたが、実際のアプリから呼び出す
仕組み（IPC通信）がなかったため、ユーザーが利用できない状態でした。

### どう動く？（図解）
```

ユーザーが履歴ボタンをクリック
↓
HistoryPage（画面）が表示される
↓
VersionHistory（一覧）がデータを取得
↓
preload（橋渡し）→ Main（サーバー）→ DB
↓
データが画面に表示される

```

## Part 2: 技術的な詳細

### アーキテクチャ

[ASCII図を含める]

### IPC通信チャンネル

| チャンネル | 用途 |
| ---------- | ---- |
| history:getFileHistory | 履歴一覧取得 |
| history:getVersionDetail | バージョン詳細取得 |
| history:getConversionLogs | 変換ログ取得 |
| history:restoreVersion | バージョン復元 |

### 用語集

| 用語 | 読み方 | 意味 |
| ---- | ------ | ---- |
| IPC | アイピーシー | Inter-Process Communication、プロセス間通信 |
| preload | プリロード | レンダラーとメインプロセスを橋渡しするスクリプト |
| contextBridge | コンテキストブリッジ | 安全にAPIを公開する仕組み |
```

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ui-integration/phase-13-pr-creation.md`
