# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 12                     |
| Phase名    | ドキュメント更新       |
| 前提Phase  | Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）     |
| ステータス | 未実施                 |
| 作成日     | 2026-01-24             |
| 機能名     | SkillImportStore       |

---

## 目的

実装内容を文書化し、システム仕様書を更新する。
未タスクがあれば検出・記録する。

## 背景

ドキュメントは将来のメンテナンスに不可欠である。
実装と同時にドキュメントを更新することで、知識の散逸を防ぐ。

---

## 実行タスク

> 以下のタスクを全て実行してください（4タスク全て必須）。

### タスク1: 実装ガイド作成

**目的**: SkillImportStore の使用方法を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. 使用例を含める
4. 注意事項を記載する

**実装ガイド構成**:

```markdown
# SkillImportStore 実装ガイド

## Part 1: 概念的説明

### 概要

SkillImportStore は、ユーザーがインポートしたスキルの情報を
アプリケーション再起動後も保持するための永続化サービスです。

### 主な機能

- スキルのインポート状態管理
- スキル個別設定の保存
- ツール権限の記憶
- メタデータキャッシュ

## Part 2: 技術的詳細

### アーキテクチャ

- electron-store を使用した JSON ファイルベースの永続化
- 保存先: ~/.aiworkflow/config/skill-imports.json

### API リファレンス

（各メソッドの詳細）

### 使用例

（コード例）
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirements のシステム仕様を更新する

> **重要**: 📖 `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照してください。

**⚠️ 2ステップで実行:**

#### Step 1: タスク完了記録（必須）

1. 該当する仕様書にタスク完了を記録する
2. 関連ドキュメントリンクを追加する

**記録先候補**:

| 仕様書               | 更新内容                 |
| -------------------- | ------------------------ |
| `interfaces-core.md` | skillImportStore API追加 |

#### Step 2: システム仕様更新（条件付き）

**更新判断基準**:

| 更新が必要な場合         | 更新が不要な場合           |
| ------------------------ | -------------------------- |
| 新規インターフェース追加 | 内部実装の詳細変更のみ     |
| 既存インターフェース変更 | リファクタリング（IF不変） |
| 新規定数/設定値追加      | バグ修正（仕様変更なし）   |

**本タスクの場合**: skillImportStore は新規モジュールのため、インターフェース仕様の追加が**必要**。

**更新チェックリスト**:

- [ ] `interfaces-core.md` に skillImportStore インターフェースを追加
- [ ] 変更履歴にバージョンを追記

**期待される成果物**:

- `outputs/phase-12/spec-update-summary.md`

---

### タスク3: ドキュメント更新履歴作成

**目的**: 本タスクで行ったドキュメント更新を記録する

**実行手順**:

自動生成スクリプトを使用（推奨）:

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store
```

手動で以下を補完:

1. システム仕様更新内容または「更新なし」の判断根拠
2. ソースコード変更の概要
3. 作成したドキュメント一覧

**更新履歴テンプレート**:

```markdown
# TASK-2B ドキュメント更新履歴

## 作成日

2026-01-24

## 更新したドキュメント

| ドキュメント            | 更新内容             |
| ----------------------- | -------------------- |
| implementation-guide.md | 新規作成             |
| interfaces-core.md      | skillImportStore追加 |

## システム仕様更新

更新理由: 新規モジュールのインターフェース追加

## ソースコード変更概要

- `apps/desktop/src/main/settings/skillImportStore.ts` 新規作成
- テストファイル追加
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成

**目的**: 残課題や未対応事項を検出・記録する（0件でも出力必須）

**実行手順**:

1. Phase 11 の発見課題を確認する
2. FAILテスト、重要度「高」課題を抽出する
3. 未対応事項があれば記録する
4. 検出されなくても「検出タスクなし」と明記する

**検出コマンド**（オプション）:

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store \
  --sources "apps/desktop/src/main/settings/"
```

**未タスク検出レポート形式**:

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | N/A     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、
未タスクとして記録すべき項目はありません。
```

または課題がある場合:

```markdown
## 検出タスク一覧

| ID     | 内容                     | 重要度 | 対応方針         |
| ------ | ------------------------ | ------ | ---------------- |
| UT-001 | キャッシュ有効期限未実装 | 中     | 次スプリント対応 |
```

**期待される成果物**:

- `outputs/phase-12/unassigned-tasks-report.md`

---

## 参照資料

| 参照資料          | パス                                                                           | 内容         |
| ----------------- | ------------------------------------------------------------------------------ | ------------ |
| 仕様更新フロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準 |
| 実装ファイル      | `apps/desktop/src/main/settings/skillImportStore.ts`                           | 実装コード   |
| Phase 11 発見課題 | `outputs/phase-11/discovered-issues.md`                                        | 発見課題     |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                   | 内容         |
| -------------------- | ---------------------------------------------------------------------- | ------------ |
| コアインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md` | 更新対象候補 |

---

## 成果物

| 成果物           | パス                                          | 内容         |
| ---------------- | --------------------------------------------- | ------------ |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`    | 使用方法文書 |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`     | 仕様更新内容 |
| ドキュメント履歴 | `outputs/phase-12/documentation-changelog.md` | 更新履歴     |
| 未タスクレポート | `outputs/phase-12/unassigned-tasks-report.md` | 残課題       |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念、Part 2: 技術）が作成されている
- [ ] システム仕様更新の判断と実行が完了している
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも必須）

---

## フォールバック手順

タスク2（システム仕様更新）で更新が不要と判断した場合:

1. `spec-update-summary.md` に「更新不要」と判断根拠を記載
2. 判断根拠例: 「内部実装のみの変更でインターフェースに影響なし」

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store/phase-13-pr-creation.md`
