# システム仕様更新ワークフロー

> **Progressive Disclosure**
> - 読み込みタイミング: Phase 12（ドキュメント更新）でシステム仕様変更が発生した場合
> - 読み込み条件: aiworkflow-requirementsスキルへの仕様反映が必要なとき
> - 関連スキル: aiworkflow-requirements

タスク完了時、システム仕様に変更が必要な場合は `aiworkflow-requirements` スキルを更新する。

---

## 更新判断基準

### 更新が必要な場合（必須）

| 条件                               | 例                                        |
| ---------------------------------- | ----------------------------------------- |
| 新規インターフェース/型の追加      | ICorrectiveRAG, CRAGResult等              |
| 既存インターフェースの変更         | メソッド追加、シグネチャ変更              |
| 新規定数/設定値の追加              | CRAG_DEFAULTS等                           |
| アーキテクチャパターンの追加       | 新しいパイプライン段階                    |
| API仕様の変更                      | エンドポイント追加、リクエスト/レスポンス変更 |
| データベーススキーマ変更           | テーブル追加、カラム変更                  |
| 外部連携インターフェース追加       | IWebSearcher等                            |

### 更新が不要な場合

| 条件                               | 例                                        |
| ---------------------------------- | ----------------------------------------- |
| 内部実装の詳細変更のみ             | プライベートメソッド、ローカル変数        |
| リファクタリング（インターフェース不変） | コード構造改善、命名変更                  |
| バグ修正（仕様変更なし）           | 既存仕様の正しい実装                      |
| テスト追加のみ                     | カバレッジ向上                            |
| ドキュメント誤記修正               | typo修正、表現改善                        |

### 判断フローチャート

```
[新機能/変更がある]
    ↓
[外部から参照されるインターフェースか？]
    ├── Yes → 更新必要
    └── No
         ↓
    [他のコンポーネントが依存するか？]
        ├── Yes → 更新必要
        └── No → 更新不要（実装ガイドにのみ記載）
```

---

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

## 参照リソース

| リソース         | パス                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| 仕様スキル       | `.claude/skills/aiworkflow-requirements/SKILL.md`                      |
| トピックマップ   | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`          |
| 記述ガイドライン | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` |
| テンプレート     | `.claude/skills/aiworkflow-requirements/assets/spec-template.md`       |
