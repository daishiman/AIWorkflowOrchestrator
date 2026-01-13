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
node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs
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
node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs
```

## 参照リソース

| リソース         | パス                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| 仕様スキル       | `.claude/skills/aiworkflow-requirements/SKILL.md`                      |
| トピックマップ   | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`          |
| 記述ガイドライン | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` |
| テンプレート     | `.claude/skills/aiworkflow-requirements/assets/spec-template.md`       |
