# システム仕様更新ワークフロー（詳細手順）

> 元ファイル: [spec-update-workflow.md](spec-update-workflow.md)
> 読み込み条件: Phase 12 Task 2 の Step 1/Step 2 を実行する時。

## 更新フロー（2ステップ）

### Step 1: タスク完了記録（必須）

**全タスクで必須**。バグ修正でも新機能でも必ず実行。

```
Phase 12 Task 2 開始
    |
該当する仕様書を特定
  -- 例: skill関連 -> interfaces-agent-sdk.md
    |
「## 完了タスク」セクションを追加（末尾近く）
  -- 必須: 「タスク完了ステータス更新」セクションの詳細テンプレートを使用
  -- テスト結果サマリー表・成果物表を含む詳細記録を追加すること
    |
「## 関連ドキュメント」セクションに実装ガイドリンク追加
    |
「変更履歴」にバージョン追記
    |
aiworkflow-requirements/LOGS.md にタスク完了エントリを追加
    |
task-specification-creator/LOGS.md にタスク完了記録を追加
    |
topic-map.md に新規セクションエントリを追加
    |
完了
```

#### Step 1 完了チェックリスト

##### Step 1-A: タスク完了記録
- [ ] 該当仕様書の「完了タスク」テーブルにタスクIDと完了日を追加した
- [ ] 「タスク完了ステータス更新」セクションの**詳細テンプレート**で完了記録を追加した
  - [ ] テスト結果サマリー表（機能/エラーハンドリング/アクセシビリティ/統合テスト）
  - [ ] 成果物テーブル（テスト結果レポート、実装ガイド、発見課題リスト）
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加した
- [ ] 「変更履歴」にバージョン番号を追記した

##### Step 1-B: 実装状況テーブル更新
- [ ] 該当仕様書に「実装状況」テーブルがある場合、該当行を「完了」に更新した
- [ ] 仕様書作成のみのタスクは、該当行を `spec_created` に更新した（`completed` にしない）
- [ ] 更新対象として列挙した仕様書が実在することを `test -f <path>` で確認した
- [ ] `phase-*.md` が `../task-*.md` を参照している場合、ブリッジ仕様の実在または参照修正を確認した

##### Step 1-C: 関連タスクテーブル更新
- [ ] arch-state-management.md、interfaces-agent-sdk.md、security-api-electron.md、task-workflow.md の「関連タスク」テーブルを確認した
- [ ] 該当タスクのステータスを「**完了**」に更新した

##### Step 1-D: topic-map.md再生成
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行した
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されている

##### Step 1-E: 未タスク指示書作成・登録（1件以上検出時は必須）
- [ ] 未タスク候補が1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成・配置した
- [ ] 未タスクごとに配置先判定を記録した
- [ ] `task-workflow.md` の残課題テーブルに新規未タスクを登録した
- [ ] 関連仕様書の残課題テーブルに新規未タスクを登録した
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`ALL_LINKS_EXIST` を確認した

##### Step 1-F: DevOps関連ファイル更新（CI/CD最適化タスクの場合は必須）
- [ ] `deployment-gha.md` にCI/CD変更内容を記載した
- [ ] `technology-devops.md` にパターン・完了タスクを追加した
- [ ] `quality-requirements.md` に品質関連設定を追加した

##### Step 1-G: 検証コマンド順次実行（Phase 12同期ガード）

**1. 未タスク参照リンク検証**
```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

**2. 索引再生成**
```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json
```

**3. SKILL 検証（3スキル）**
```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

合格基準: Error 0件。Warning は3段階分類（許容/要監視/要対応）に基づき対応する。
詳細な判定フローは [spec-update-workflow.md](spec-update-workflow.md) の Step 1-G.3.1 を参照。

**4. Phase仕様書参照と outputs 実体の整合確認**
```bash
rg -n "docs/30-workflows/unassigned-task/task-.*\\.md" docs/30-workflows/{{FEATURE_NAME}}/phase-*.md
```

#### Step 1-G.1: baseline / current 分離監査

```bash
# 1) 全体監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# 2) 対象ファイル監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/<task>.md
```

判定ルール:
- `baseline`: 着手前から存在する違反。スコープ外として記録
- `current`: 今回変更で新規発生した違反。今回タスク内で修正必須

### 必須更新ファイル（全タスク共通）
- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した
- [ ] aiworkflow-requirements/SKILL.md の変更履歴にバージョンを追記した
- [ ] task-specification-creator/SKILL.md の変更履歴にバージョンを追記した

#### LOGS.md 更新（必須：2ファイル）

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
```

**2. task-specification-creator/LOGS.md** に以下の形式でエントリを追加:

```markdown
## {{DATE}} - {{TASK_NAME}}（{{TASK_ID}}）タスク完了

### コンテキスト
- スキル: task-specification-creator
- タスクID: {{TASK_ID}}

### 成果
- テストカバレッジ: {{TEST_COUNT}}テスト全件PASS
- 実装内容:
  - {{主要な実装内容1}}
  - {{主要な実装内容2}}

### 結果
- ステータス: success
- 完了日時: {{DATE}}
```

### Step 1-C: 関連タスクテーブル更新（詳細）

確認すべきファイル（タスク種別による）:

| タスク種別              | 確認すべきファイル                        | テーブル名                 |
| ----------------------- | ----------------------------------------- | -------------------------- |
| Skill/Agent関連         | `arch-state-management.md`                | 関連タスク                 |
| Skill/Agent関連         | `interfaces-agent-sdk-history.md`         | 未タスク候補               |
| IPC/Preload関連         | `security-api-electron.md`                | 関連タスク                 |
| IPC/Preload関連         | `api-ipc-agent.md`                        | チャンネル一覧・完了タスク |
| UI/UXコンポーネント関連 | `ui-ux-components.md`                     | 関連タスク                 |
| データベース関連        | `database-schema.md`                      | 関連タスク                 |

> **Step 1-C 発見手順**: `grep -rl "TASK_ID_OR_NAME" .claude/skills/aiworkflow-requirements/references/`

---

### IPC機能開発時の追加更新対象（Step 2該当時）

| # | 更新対象ファイル                          | 更新内容                                                 | 必須/任意 |
|---|-------------------------------------------|----------------------------------------------------------|-----------|
| 1 | `api-ipc-agent.md`                        | 新規チャンネル一覧、型定義、完了タスク記録               | 必須      |
| 2 | `security-electron-ipc.md`                | セキュリティ検証パターン（sender検証、ホワイトリスト）   | 必須      |
| 3 | `architecture-overview.md`                | IPCハンドラー登録一覧（registerAllIpcHandlers）           | 必須      |
| 4 | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                     | 必須      |
| 5 | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加             | 必須      |
| 6 | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）             | 任意      |
| 7 | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                   | 任意      |

---

### Step 2: システム仕様更新（条件付き）

**更新判断基準に該当する場合のみ**実行。

```
[仕様変更有り？]（更新判断基準で判断）
    +-- No -> 「更新なし」をdocumentation-changelog.mdに明記して終了
    +-- Yes
         |
aiworkflow-requirements/references/{{該当ファイル}}.md を編集
         |
インデックス再生成
         |
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
         |
変更履歴に追記（aiworkflow-requirements/SKILL.md も必須更新）
```

## タスク完了ステータス更新テンプレート

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
```

### 変更履歴更新

仕様書の`## 変更履歴`セクションに以下の形式で追記:

```markdown
| {{NEXT_VERSION}} | {{DATE}} | {{TASK_NAME}}完了 |
```

- 追記前に対象ファイルの既存 `Version` 列を確認し、同一番号を再利用しない。
- 同日に追補が複数回入る場合は、既存最大値に対して `+0.0.1` で採番する。

### 残課題更新

該当タスクが「残課題」にある場合、取り消し線で完了をマーク:

```markdown
| ~~{{TASK_NAME}}~~ | ~~{{依存タスク}}~~ | ~~{{優先度}}~~ | ~~{{未タスク指示書}}~~ -- **完了** |
```

---

## 参照リソース

| リソース                   | パス                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| 仕様スキル                 | `.claude/skills/aiworkflow-requirements/SKILL.md`                              |
| トピックマップ             | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  |
| 記述ガイドライン           | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`         |
| 仕様テンプレート           | `.claude/skills/aiworkflow-requirements/assets/spec-template.md`               |
| ドキュメント更新履歴テンプレート | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md` |

---

- [phase-12-documentation-guide.md](phase-12-documentation-guide.md)
- [phase12-checklist-definition.md](phase12-checklist-definition.md)
- [technical-documentation-guide.md](technical-documentation-guide.md)
- [patterns-phase12-sync.md](patterns-phase12-sync.md)

## 変更履歴

| Date | Changes |
| ---- | ------- |
| 2026-03-18 | 925行のmonolithから詳細手順を分離。親ファイルはインデックス+判断基準に縮小 |
| 2026-03-12 | Step 1 / Step 2 / validation の 3 ファイルへ責務分離 |
