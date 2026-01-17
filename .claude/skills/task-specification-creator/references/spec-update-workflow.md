# システム仕様更新ワークフロー

> **Progressive Disclosure**
> - 読み込みタイミング: Phase 12（ドキュメント更新）でシステム仕様変更が発生した場合
> - 読み込み条件: aiworkflow-requirementsスキルへの仕様反映が必要なとき
> - 関連スキル: aiworkflow-requirements

タスク完了時、システム仕様に変更が必要な場合は `aiworkflow-requirements` スキルを更新する。

## 更新トリガー

| 変更種別           | 更新対象                                  |
| ------------------ | ----------------------------------------- |
| APIエンドポイント  | `references/api-*.md`                     |
| データベース       | `references/database-*.md`                |
| UI/UX              | `references/ui-ux-*.md`                   |
| アーキテクチャ     | `references/architecture-*.md`            |
| インターフェース   | `references/interfaces-*.md`              |
| セキュリティ       | `references/security-*.md`                |
| 新機能（要件追加） | 該当するreferences/ファイルまたは新規作成 |

## 更新フロー

```
Phase 12: ドキュメント更新
    ↓
[仕様変更有り？]
    ↓ Yes
aiworkflow-requirements/references/{{該当ファイル}}.md を編集
    ↓
インデックス再生成
    ↓
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
    ↓
変更履歴に追記（aiworkflow-requirements/SKILL.md は不要、自動反映）
```

## 新規仕様の追加手順

```bash
# 1. テンプレートをコピー
cp .claude/skills/aiworkflow-requirements/assets/spec-template.md \
   .claude/skills/aiworkflow-requirements/references/{prefix}-{topic}.md

# 2. 内容を記述（spec-guidelines.md参照）

# 3. インデックス再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

## タスク完了ステータス更新（Phase 11/12完了時）

手動テストや検証タスク完了時は、システム仕様書に**タスク完了セクション**を追加する。

### 追加セクションテンプレート

```markdown
### タスク: {{TASK_NAME}}（{{COMPLETION_DATE}}完了）

| 項目       | 内容                                                |
|------------|-----------------------------------------------------|
| タスクID   | {{TASK_ID}}                                         |
| 完了日     | {{COMPLETION_DATE}}                                 |
| ステータス | **完了**                                            |
| テスト数   | {{AUTO_TEST_COUNT}}（自動テスト）+ {{MANUAL_TEST_COUNT}}（手動テスト項目） |
| 発見課題   | {{ISSUE_COUNT}}件                                   |
| ドキュメント | `docs/30-workflows/{{TASK_NAME}}/`                |

#### テスト結果サマリー

| カテゴリ | テスト数 | PASS | FAIL |
|----------|----------|------|------|
| 機能テスト | {{N}} | {{N}} | {{N}} |
| エラーハンドリング | {{N}} | {{N}} | {{N}} |
| アクセシビリティ | {{N}} | {{N}} | {{N}} |
| 統合テスト連携 | {{N}} | {{N}} | {{N}} |

#### 成果物

| 成果物 | パス |
|--------|------|
| テスト結果レポート | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/manual-test-result.md` |
| 発見課題リスト | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/discovered-issues.md` |
| 実装ガイド | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-12/implementation-guide.md` |
```

### 変更履歴更新

仕様書の`## 変更履歴`セクションに以下の形式で追記:

```markdown
| {{NEXT_VERSION}} | {{DATE}} | {{TASK_NAME}}完了（手動テスト{{N}}項目全PASS、自動テスト{{N}}件全PASS、発見課題{{N}}件） |
```

### 残課題更新

該当タスクが「残課題」にある場合、取り消し線で完了をマーク:

```markdown
| ~~{{TASK_NAME}}~~ | ~~{{依存タスク}}~~ | ~~{{優先度}}~~ | ~~{{未タスク指示書}}~~ ✅ **完了** |
```

---

## 参照リソース

| リソース         | パス                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| 仕様スキル       | `.claude/skills/aiworkflow-requirements/SKILL.md`                      |
| トピックマップ   | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`          |
| 記述ガイドライン | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` |
| テンプレート     | `.claude/skills/aiworkflow-requirements/assets/spec-template.md`       |
