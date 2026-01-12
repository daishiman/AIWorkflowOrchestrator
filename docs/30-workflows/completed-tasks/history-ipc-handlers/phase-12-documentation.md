# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 12                   |
| Phase名    | ドキュメント更新     |
| 前提Phase  | Phase 11             |
| 後続Phase  | Phase 13             |
| ステータス | 未実施               |
| 作成日     | 2026-01-11           |
| 機能名     | history-ipc-handlers |

---

## 目的

実装した内容をドキュメント化し、システム仕様を更新する。
また、残課題や技術的負債を検出し、未タスク指示書を作成する。

## 背景

実装完了後、知識の共有と将来のメンテナンス性向上のために、ドキュメントを更新する。
また、実装中に発見された「将来対応」項目を可視化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成（Part 1: 概念的説明）

**目的**: 中学生にもわかる概念的な説明を作成する。

**実行手順**:

1. IPCハンドラーの役割を比喩を使って説明する
2. 全体アーキテクチャをASCII図解で説明する
3. なぜこの設計にしたかを説明する
4. `outputs/phase-12/implementation-guide-part1.md` に記録する

**記述内容**:

- IPCハンドラーとは何か（比喩を使った説明）
- なぜIPCが必要か
- どのように動作するか（図解付き）

**期待される成果物**:

- `outputs/phase-12/implementation-guide-part1.md`（概念的説明）

---

### タスク2: 実装ガイド作成（Part 2: 技術的詳細）

**目的**: 技術的な詳細をドキュメント化する。

**実行手順**:

1. ファイル構成と各ファイルの役割を説明する
2. 関数のシグネチャと使用方法を説明する
3. エラーハンドリングの方針を説明する
4. `outputs/phase-12/implementation-guide-part2.md` に記録する

**記述内容**:

- ファイル構成
- 関数インターフェース
- 使用例（コードスニペット）
- エラーハンドリング

**期待される成果物**:

- `outputs/phase-12/implementation-guide-part2.md`（技術的詳細）

---

### タスク3: システム仕様更新（aiworkflow-requirements）

**目的**: 関連するシステム仕様を更新する。

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` を確認する
2. 必要に応じて仕様を更新する（実装と仕様の乖離があれば）
3. `outputs/phase-12/spec-update-log.md` に更新内容を記録する

**更新対象**:
| ファイル | 更新内容 |
| -------- | -------- |
| ui-ux-history-panel.md | IPCハンドラーの実装完了ステータスを更新 |

**期待される成果物**:

- `outputs/phase-12/spec-update-log.md`（仕様更新ログ）

---

### タスク4: 未タスク検出

**目的**: 残課題や技術的負債を検出する。

**実行手順**:

1. Phase 3, 9, 10のレビュー結果からMINOR指摘を抽出する
2. Phase 11の手動テストで発見されたスコープ外の問題を抽出する
3. コードベースの TODO/FIXME コメントを検索する
4. `outputs/phase-12/unassigned-task-report.md` にレポートを作成する

**Grepパターン**:

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/ipc/historyHandlers.ts
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`（未タスク検出レポート）

---

### タスク5: 未タスク指示書作成（該当する場合）

**目的**: 検出された未タスクの指示書を作成する。

**実行手順**:

1. タスク4で検出された課題を評価する
2. 必要に応じて `docs/30-workflows/unassigned-task/` に指示書を作成する
3. `outputs/phase-12/documentation-update-log.md` に記録する

**期待される成果物**:

- 未タスク指示書（該当する場合）
- `outputs/phase-12/documentation-update-log.md`（ドキュメント更新ログ）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                       | 内容           |
| ------------------- | -------------------------------------------------------------------------- | -------------- |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | 更新対象の仕様 |

---

## 成果物

| 成果物               | パス                                             | 内容                   |
| -------------------- | ------------------------------------------------ | ---------------------- |
| 実装ガイド Part1     | `outputs/phase-12/implementation-guide-part1.md` | 概念的説明             |
| 実装ガイド Part2     | `outputs/phase-12/implementation-guide-part2.md` | 技術的詳細             |
| 仕様更新ログ         | `outputs/phase-12/spec-update-log.md`            | 仕様の更新内容         |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`     | 残課題の一覧           |
| ドキュメント更新ログ | `outputs/phase-12/documentation-update-log.md`   | ドキュメント更新の記録 |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成された
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成された
- [ ] システム仕様（aiworkflow-requirements）が更新された（該当する場合）
- [ ] 未タスク検出レポートが作成された
- [ ] 検出された未タスクに対して指示書が作成された（該当する場合）
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 実装ガイドテンプレート（参考）

### Part 1: 概念的説明

```markdown
# IPCハンドラー実装ガイド - Part 1: 概念的説明

## IPCハンドラーとは？

【比喩を使った説明】
IPCハンドラーは、アプリの「フロント係」と「バックオフィス」を繋ぐ「受付窓口」のようなものです。

## なぜIPCが必要か？

Electronでは、画面（レンダラープロセス）とシステム（メインプロセス）は別々に動いています。
これはセキュリティのためです。

## 全体の流れ
```

UI（画面）
↓ 「履歴を見せて」とお願い
受付窓口（IPCハンドラー）
↓ 「履歴ください」とお願い
履歴サービス（HistoryService）
↓ データを返す
受付窓口（IPCハンドラー）
↓ 結果を返す
UI（画面に表示）

```

```

### Part 2: 技術的詳細

````markdown
# IPCハンドラー実装ガイド - Part 2: 技術的詳細

## ファイル構成

| ファイル           | 役割                     |
| ------------------ | ------------------------ |
| historyHandlers.ts | 4つのIPCハンドラーを定義 |

## 関数インターフェース

### registerHistoryHandlers

```typescript
export function registerHistoryHandlers(historyService: HistoryService): void;
```
````

**引数**: HistoryServiceのインスタンス
**戻り値**: なし（void）
**役割**: 4つのIPCハンドラーを登録する

````

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク
- タスク1（実装ガイド作成 Part1）: [結果を記入]
- タスク2（実装ガイド作成 Part2）: [結果を記入]
- タスク3（システム仕様更新）: [結果を記入]
- タスク4（未タスク検出）: [結果を記入]
- タスク5（未タスク指示書作成）: [結果を記入]

### ドキュメント更新状況
- 作成したドキュメント数: [N]件
- 更新した仕様: [あれば記入]
- 検出した未タスク: [N]件

### 発見事項
- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項
-
````

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ipc-handlers/phase-13-pr-creation.md`
