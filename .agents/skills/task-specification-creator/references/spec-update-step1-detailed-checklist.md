# Spec Update Step 1 詳細チェックリスト

> 親ファイル: [spec-update-workflow.md](spec-update-workflow.md)
> 読み込み条件: Phase 12 Task 2 の Step 1 を実行するとき。
> 詳細な手順・テンプレートが必要な場合に参照する。

---

## Step 1: タスク完了記録（必須）

**全タスクで必須**。バグ修正でも新機能でも必ず実行。

```
Phase 12 Task 2 開始
    ↓
該当する仕様書を特定
  └── 例: skill関連 → interfaces-agent-sdk.md
    ↓
「## 完了タスク」セクションを追加（末尾近く）
  └── ⚠️ 必須: 「タスク完了ステータス更新」セクションの詳細テンプレートを使用
  └── テスト結果サマリー表・成果物表を含む詳細記録を追加すること
    ↓
「## 関連ドキュメント」セクションに実装ガイドリンク追加
    ↓
「変更履歴」にバージョン追記
    ↓
aiworkflow-requirements/LOGS.md にタスク完了エントリを追加
    ↓
task-specification-creator/LOGS.md にタスク完了記録を追加
    ↓
topic-map.md に新規セクションエントリを追加
    ↓
完了
```

---

## Step 1 完了チェックリスト（Phase 12 Task 2 完了前に確認）

```markdown
## Step 1 完了チェックリスト

### Step 1-A: タスク完了記録
- [ ] 該当仕様書の「完了タスク」テーブルにタスクIDと完了日を追加した
- [ ] 「タスク完了ステータス更新」セクションの**詳細テンプレート**で完了記録を追加した
  - [ ] テスト結果サマリー表（機能/エラーハンドリング/アクセシビリティ/統合テスト）
  - [ ] 成果物テーブル（テスト結果レポート、実装ガイド、発見課題リスト）
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加した
- [ ] 「変更履歴」にバージョン番号を追記した

### Step 1-B: 実装状況テーブル更新
- [ ] 該当仕様書に「実装状況」テーブルがある場合、該当行を「完了」に更新した
- [ ] 仕様書作成のみのタスクは、該当行を `spec_created` に更新した（`completed` にしない）
- [ ] 更新対象として列挙した仕様書が実在することを `test -f <path>` で確認した
- [ ] `phase-*.md` が `../task-*.md` を参照している場合、ブリッジ仕様の実在または参照修正を確認した

### Step 1-C: 関連タスクテーブル更新
- [ ] arch-state-management.md、interfaces-agent-sdk.md、security-api-electron.md、task-workflow.md の「関連タスク」テーブルを確認した
- [ ] 該当タスクのステータスを「**完了**」に更新した

### Step 1-D: topic-map.md再生成（⚠️ 見落としやすい）
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行した
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されている

### Step 1-E: 未タスク指示書作成・登録（1件以上検出時は必須）
- [ ] 未タスク候補が1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成・配置した
- [ ] 未タスクごとに配置先判定を記録した（未完了=`docs/30-workflows/unassigned-task/` / 完了移管済み=`docs/30-workflows/completed-tasks/unassigned-task/`）
- [ ] `docs/30-workflows/completed-tasks/unassigned-task/` 配下に未完了指示書（`未実施`/`未着手`）が混在していないことを確認した
- [ ] `task-workflow.md` の残課題（未タスク）テーブルに新規未タスクを登録した
- [ ] 関連仕様書（`interfaces-agent-sdk-history.md`、`task-workflow.md`、該当する `interfaces-*.md`）の残課題テーブルに新規未タスクを登録した
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`ALL_LINKS_EXIST` を確認した
- [ ] `audit-unassigned-tasks.js --json --diff-from <ref> --target-file <path>` または `--diff-from <ref>` の `currentViolations.total` を記録した
- [ ] scope未指定の `audit-unassigned-tasks.js --json` を baseline 監視結果として併記した
- [ ] ⚠️ 検出レポート作成だけでなく、指示書作成+テーブル登録まで完了すること

### Step 1-F: DevOps関連ファイル更新（CI/CD最適化タスクの場合は必須）
CI/CD・ビルド・テスト並列化に関するDevOps関連タスク完了時は、以下のファイルを確認・更新する。

- [ ] `deployment-gha.md` にCI/CD変更内容を記載した
  - [ ] シャード戦略（シャード数、分散方式）
  - [ ] キャッシュ戦略（対象、キャッシュキー）
  - [ ] 並列化設定（Vitest pool, maxForks, fileParallelism）
- [ ] `technology-devops.md` にパターン・完了タスクを追加した
  - [ ] CI最適化パターンセクション
  - [ ] 完了タスクテーブル
- [ ] `quality-requirements.md` に品質関連設定を追加した
  - [ ] 並列化設定と環境変数制御
  - [ ] パフォーマンス要件（実行時間目標）
- [ ] ⚠️ DevOps知見は3ファイルに分散するため、漏れやすい。必ず全ファイルを確認すること
```

---

## LOGS.md 更新（必須：2ファイル、`skill-creator` 更新時は +1）

**⚠️ 重要**: 以下の**2つの**LOGS.mdファイルを**両方**更新する。さらに `skill-creator` を改善した場合は `skill-creator/LOGS.md` も同一ターンで更新する。

| ファイル | 目的 |
| -------- | ---- |
| `.claude/skills/aiworkflow-requirements/LOGS.md` | システム仕様書更新の記録 |
| `.claude/skills/task-specification-creator/LOGS.md` | タスク仕様書スキルの使用記録 |
| `.claude/skills/skill-creator/LOGS.md` | スキル改善パターン追加の記録（`skill-creator` 更新時のみ） |

**1. aiworkflow-requirements/LOGS.md** に以下の形式でエントリを追加:

```markdown
## {{DATE}}: {{TASK_NAME}}（{{TASK_ID}}）

| 項目         | 内容                     |
| ------------ | ------------------------ |
| タスクID     | {{TASK_ID}}              |
| 操作         | update-spec              |
| 対象ファイル | {{更新したファイル一覧}} |
| 結果         | success                  |
| 備考         | {{実装内容の概要}}       |

### 更新詳細

- **更新**: `references/{{FILE}}.md`（vX.Y.Z → vX.Y.Z+1）
  - {{追加したセクション・内容}}
```

**2. task-specification-creator/LOGS.md** に以下の形式でエントリを追加:

```markdown
## {{DATE}} - {{TASK_NAME}}（{{TASK_ID}}）タスク完了

### コンテキスト
- スキル: task-specification-creator
- タスクID: {{TASK_ID}}
- タスク名: {{TASK_NAME}}
- Phase: 1-12（または1-13）

### 成果
- テストカバレッジ: {{TEST_COUNT}}テスト全件PASS
- 実装内容:
  - {{主要な実装内容1}}
  - {{主要な実装内容2}}

### 結果
- ステータス: success
- 完了日時: {{DATE}}
```

---

## topic-map.md 更新（新規セクション追加時は必須）

`.claude/skills/aiworkflow-requirements/indexes/topic-map.md` の該当ファイルセクションに:

```markdown
| {{新規セクション名}}（{{TASK_ID}}） | L{{行番号}} |
```

---

## Step 1-C: 関連タスクテーブル更新の詳細手順

システム仕様書（`arch-state-management.md`、`interfaces-agent-sdk.md`、`security-api-electron.md`、`task-workflow.md`）に「関連タスク」テーブルがあり、当該タスクが記載されている場合は、ステータスを更新する。

```
[仕様書内に「関連タスク」テーブルがあるか？]
    ├── No → Step 2へ進む
    └── Yes
         ↓
    [当該タスクがテーブルに記載されているか？]
        ├── No → Step 2へ進む
        └── Yes
             ↓
        ステータス列を「未着手」→「**完了**」に更新
             ↓
        documentation-changelog.md に更新ファイルを記録
```

### 確認すべきファイル（タスク種別による）

| タスク種別                 | 確認すべきファイル                          | テーブル名                   |
| -------------------------- | ------------------------------------------- | ---------------------------- |
| Skill/Agent関連            | `arch-state-management.md`                  | 関連タスク                   |
| Skill/Agent関連            | `interfaces-agent-sdk-history.md`           | 未タスク候補                 |
| IPC/Preload関連            | `security-api-electron.md`                  | 関連タスク                   |
| IPC/Preload関連            | `api-ipc-agent.md`                          | チャンネル一覧・完了タスク   |
| IPC/Preload関連            | `interfaces-agent-sdk-skill.md`             | インターフェース定義         |
| IPC/Preload関連            | `architecture-implementation-patterns.md`   | 実装パターン                 |
| UI/UXコンポーネント関連    | `ui-ux-components.md`                       | 関連タスク                   |
| データベース関連           | `database-schema.md`                        | 関連タスク                   |

> **Step 1-C 発見手順**: 上記テーブルだけでなく、以下のGrepで漏れを防止する:
> ```bash
> grep -rl "TASK_ID_OR_NAME" .claude/skills/aiworkflow-requirements/references/
> ```
> 例: `grep -rl "permission-tool-icons" .claude/skills/aiworkflow-requirements/references/`

### 更新例

```markdown
# 変更前
| TASK-7B  | SkillImportDialog         | 未着手   |

# 変更後
| TASK-7B  | SkillImportDialog         | **完了** |
```

---

## 必須更新ファイル（全タスク共通）

```markdown
- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した
- [ ] aiworkflow-requirements/SKILL.md の変更履歴にバージョンを追記した
- [ ] task-specification-creator/SKILL.md の変更履歴にバージョンを追記した
- [ ] `skill-creator` を更新した場合、skill-creator/LOGS.md を更新した
- [ ] `skill-creator` を更新した場合、skill-creator/SKILL.md の変更履歴にバージョンを追記した
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した
- [ ] ui-ux-components.md（UI/UX関連タスクの場合）の完了タスクと変更履歴を更新した
- [ ] completed-tasks/ 内の該当タスク仕様書のステータスを更新した（実装完了: `completed` / 仕様書作成のみ: `spec_created`）
```

---

## タスク完了ステータス更新テンプレート（Phase 11/12完了時）

手動テストや検証タスク完了時は、システム仕様書に**タスク完了セクション**を追加する。

```markdown
### タスク: {{TASK_NAME}}（{{COMPLETION_DATE}}完了）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | {{TASK_ID}}                                                                |
| 完了日       | {{COMPLETION_DATE}}                                                        |
| ステータス   | **完了**                                                                   |
| テスト数     | {{AUTO_TEST_COUNT}}（自動テスト）+ {{MANUAL_TEST_COUNT}}（手動テスト項目） |
| 発見課題     | {{ISSUE_COUNT}}件                                                          |
| ドキュメント | `docs/30-workflows/{{TASK_NAME}}/`                                         |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS  | FAIL  |
| ------------------ | -------- | ----- | ----- |
| 機能テスト         | {{N}}    | {{N}} | {{N}} |
| エラーハンドリング | {{N}}    | {{N}} | {{N}} |
| アクセシビリティ   | {{N}}    | {{N}} | {{N}} |
| 統合テスト連携     | {{N}}    | {{N}} | {{N}} |

#### 成果物

| 成果物             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 手動テストチェックリスト | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/manual-test-checklist.md` |
| テスト結果レポート | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/manual-test-result.md`   |
| スクリーンショット計画 | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/screenshot-plan.json` |
| 発見課題リスト     | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/discovered-issues.md`    |
| 実装ガイド         | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-12/implementation-guide.md` |
```

### 変更履歴更新

仕様書の`## 変更履歴`セクションに以下の形式で追記:

```markdown
| {{NEXT_VERSION}} | {{DATE}} | {{TASK_NAME}}完了（手動テスト{{N}}項目全PASS、自動テスト{{N}}件全PASS、発見課題{{N}}件） |
```

- 追記前に対象ファイルの既存 `Version` 列を確認し、同一番号を再利用しない。
- 同日に追補が複数回入る場合は、既存最大値に対して `+0.0.1` で採番する。

### 残課題更新

該当タスクが「残課題」にある場合、取り消し線で完了をマーク:

```markdown
| ~~{{TASK_NAME}}~~ | ~~{{依存タスク}}~~ | ~~{{優先度}}~~ | ~~{{未タスク指示書}}~~ ✅ **完了** |
```

---

## 具体例: TASK-IMP-permission-tool-icons-001

以下は実際のタスク完了時のPhase 12 Task 2実行例。

### Step実行結果

| Step   | 判定      | 理由                                                                 |
| ------ | --------- | -------------------------------------------------------------------- |
| 1-A    | ✅ 完了   | `interfaces-agent-sdk-ui.md` に完了タスクセクション追加              |
| 1-B    | 該当なし  | Renderer Process内部変更のみ。APIエンドポイント追加なし              |
| 1-C    | ✅ 完了   | `interfaces-agent-sdk-history.md` の未タスク候補テーブルを更新       |
| 2      | ✅ 更新実施 | 新定数 `TOOL_ICONS`、新関数 `getToolIcon()`、`formatArgs()` を追加 |

### Step 1-C 発見プロセス

```bash
grep -rn "permission-tool-icons" references/
# → interfaces-agent-sdk-history.md:310: 未タスク候補テーブルに記載あり
# → interfaces-agent-sdk-ui.md: 記載なし（Step 1-Aで追加）
```

### 更新ファイル一覧

| ファイル                         | 変更内容                                                       |
| -------------------------------- | -------------------------------------------------------------- |
| `interfaces-agent-sdk-ui.md`     | v1.3.0: 完了タスク、v1.3.1: TOOL_ICONS/getToolIcon/formatArgs |
| `interfaces-agent-sdk-history.md`| 未タスク候補テーブルのステータス更新                           |
| `ui-ux-agent-execution.md`       | ツールアイコンバッジ視覚仕様追加、テスト数更新                |
| `aiworkflow-requirements/LOGS.md`| 仕様更新記録                                                  |
| `task-specification-creator/LOGS.md` | Phase 1-12完了記録                                        |
| `topic-map.md`                   | 新セクションエントリ追加                                      |
