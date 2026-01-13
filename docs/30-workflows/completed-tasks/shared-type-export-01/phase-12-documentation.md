# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 12                    |
| Phase名    | ドキュメント更新      |
| 前提Phase  | Phase 11              |
| 後続Phase  | Phase 13              |
| ステータス | 未実施                |
| 作成日     | 2026-01-13            |
| 機能名     | shared-type-export-01 |

---

## 目的

実装内容のドキュメント化、システム仕様の更新、および未タスクの検出を行う。

## 背景

実装完了後、将来の開発者や利用者のためにドキュメントを整備する。また、実装中に発見された技術的負債を可視化し、継続的改善につなげる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: 実装内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化する

**実行手順**:

1. Part 1: 概念的説明を作成
2. Part 2: 技術的詳細を作成
3. 用語集を作成

**ドキュメント構成**:

```markdown
# services/graph 型エクスポート 実装ガイド

## Part 1: 概念的説明

### なぜ型エクスポートが必要か

（中学生にもわかる説明）

TypeScriptでは、型情報はデフォルトでは外部に公開されません。
これは「家の中の部屋」のようなもので、外からは見えません。
`index.ts` でエクスポートすることで、「玄関」を作り、
外部からアクセスできるようにします。

### エクスポートの仕組み

- `export type`: 型情報のみをエクスポート（コンパイル後は消える）
- `export`: 値もエクスポート（enum, class, function）

## Part 2: 技術的詳細

### エクスポート構造

（コード例と設計理由）

### 使用方法

（インポート例）
```

**期待される成果物**:

- 実装ガイド（出力: `outputs/phase-12/implementation-guide.md`）

---

### タスク2: システムドキュメント更新確認

**目的**: 既存のシステムドキュメントの更新が必要かを確認する

**実行手順**:

1. aiworkflow-requirements の関連仕様を確認
2. 更新が必要な項目があれば特定
3. 更新計画を作成

**確認対象**:

| ドキュメント                                | 確認内容                 | 更新要否 |
| ------------------------------------------- | ------------------------ | -------- |
| `interfaces-rag-community-detection.md`     | Community型の記述        | -        |
| `interfaces-rag-community-summarization.md` | CommunitySummary型の記述 | -        |
| `architecture-monorepo.md`                  | エクスポート構造の説明   | -        |

**期待される成果物**:

- ドキュメント更新記録（出力: `outputs/phase-12/documentation-update-log.md`）

---

### タスク3: 未タスク検出

**目的**: 技術的負債やスコープ外の課題を検出し、可視化する

**実行手順**:

1. 各Phaseのレビュー結果からMINOR判定の指摘を抽出
2. コードベースのTODO/FIXMEコメントを確認
3. 検出された未タスクを一覧化

**検索コマンド**:

```bash
# TODO/FIXMEコメントの検索
grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/services/graph/

# Phase成果物から「将来対応」を検索
grep -r "将来対応\|TODO\|FIXME" docs/30-workflows/shared-type-export-01/outputs/
```

**期待される成果物**:

- 未タスク検出レポート（出力: `outputs/phase-12/unassigned-task-report.md`）

---

### タスク4: 関連タスクの状態確認

**目的**: 関連する後続タスク（Part 2, Part 3）の状態を確認する

**実行手順**:

1. SHARED-TYPE-EXPORT-02 の状態確認
2. SHARED-TYPE-EXPORT-03 の状態確認
3. 依存関係の記録

**期待される成果物**:

- 関連タスク状態（出力: `outputs/phase-12/related-tasks-status.md`）

---

## 参照資料

| 参照資料               | パス                                                                                 | 内容               |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`  | テンプレート       |
| システム仕様           | `.claude/skills/aiworkflow-requirements/references/`                                 | 既存仕様           |
| 未タスクガイドライン   | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク作成ルール |

---

## 成果物

| 成果物           | パス                                           | 内容             |
| ---------------- | ---------------------------------------------- | ---------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`     | 実装ドキュメント |
| 更新記録         | `outputs/phase-12/documentation-update-log.md` | ドキュメント更新 |
| 未タスクレポート | `outputs/phase-12/unassigned-task-report.md`   | 技術的負債一覧   |
| 関連タスク状態   | `outputs/phase-12/related-tasks-status.md`     | 後続タスク状態   |

---

## 完了条件

- [ ] 実装ガイド（Part 1 + Part 2）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 関連タスク状態が確認されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 12 ステータスを `completed` に更新

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-13-pr-creation.md`
