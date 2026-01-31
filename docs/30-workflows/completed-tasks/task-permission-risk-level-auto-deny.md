# リスクレベル自動拒否ロジック - タスク指示書

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | task-permission-risk-level-auto-deny              |
| タスク名     | リスクレベル自動拒否ロジック                      |
| 分類         | セキュリティ                                      |
| 対象機能     | PermissionDialog / SkillExecutor                  |
| 優先度       | 中                                                |
| 見積もり規模 | 中規模                                            |
| ステータス   | 未実施                                            |
| 発見元       | Phase 12（task-imp-permission-tool-metadata-001） |
| 発見日       | 2026-01-31                                        |
| issue_number | 623                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-imp-permission-tool-metadata-001でツールにリスクレベル（Low/Medium/High/Critical）が付与されるようになった。現在はリスクレベルに関わらず全てのツール使用がPermissionDialogで確認される。Criticalレベルのツールについて、自動的に拒否するオプションを提供することでセキュリティを強化できる。

### 1.2 問題点・課題

- リスクレベルが表示されるだけで、実際のアクセス制御には使われていない
- ユーザーが意図せずCriticalレベルの操作を許可してしまうリスクがある
- セキュリティポリシーに基づくツール使用制限機能がない

### 1.3 放置した場合の影響

- リスクレベル表示はあくまで視覚的な警告に留まり、強制力のある制御ができない
- セキュリティ意識の低いユーザーがCriticalツールを安易に許可する可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

リスクレベルに基づいてツール使用を自動的に拒否するオプション機能を実装する。

### 2.2 最終ゴール

- 設定で「Criticalレベルは自動拒否」等のポリシーを定義できる
- 自動拒否時はPermissionDialogに拒否理由が表示される
- ポリシーはデフォルトで無効（現在の動作を維持）

### 2.3 スコープ

#### 含むもの

- リスクレベル別自動拒否ポリシーの設定インターフェース
- SkillExecutorでの拒否ロジック実装
- PermissionDialogでの拒否理由表示
- ユニットテスト

#### 含まないもの

- ツール単位の個別拒否設定（リスクレベル単位のみ）
- リスクレベル動的変更機能（別タスク: task-permission-risk-level-dynamic-change）

### 2.4 成果物

- 自動拒否ポリシー型定義
- SkillExecutorへの拒否ロジック組み込み
- PermissionDialog拒否理由表示UI
- ユニットテスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-tool-metadata-001が完了していること（完了済み）
- SkillExecutorの権限フロー（PreToolUse/PostToolUse）を理解していること

### 3.2 依存タスク

- task-imp-permission-tool-metadata-001（完了済み）

### 3.3 必要な知識

- TypeScript、React
- Claude Agent SDK（PreToolUseフック）
- PermissionStore / SkillExecutorの権限フロー

### 3.4 推奨アプローチ

1. 自動拒否ポリシーの型定義を作成
2. SkillExecutorのPreToolUseフックに拒否判定を追加
3. PermissionDialogに拒否理由表示を追加
4. TDDで実装

---

## 4. 実行手順

### Phase構成

Phase 1-12の標準タスクフローに従う（task-specification-creatorスキル準拠）。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Criticalレベルツールの自動拒否が機能する
- [ ] 拒否時にPermissionDialogに理由が表示される
- [ ] デフォルトでポリシーが無効（既存動作維持）
- [ ] ポリシー有効/無効の切り替えが可能

### 品質要件

- [ ] ユニットテストのカバレッジ80%以上
- [ ] 既存テスト（258テスト）が全てPASS

### ドキュメント要件

- [ ] 自動拒否ポリシーの設定ドキュメント
- [ ] 実装ガイド

---

## 6. 検証方法

### テストケース

- ポリシー無効 → 全ツールが通常のPermissionDialog表示
- Critical自動拒否 → Criticalツールが即座に拒否される
- High+Critical自動拒否 → 両レベルが拒否される
- 拒否時のUI表示確認

### 検証手順

1. ユニットテスト実行
2. 各ポリシー設定でPermissionDialogの挙動を確認

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                               |
| -------------------------------- | ------ | -------- | ---------------------------------- |
| 必要なツールまで拒否されるUX問題 | 高     | 中       | デフォルト無効、警告メッセージ表示 |
| SkillExecutorとの統合複雑度      | 中     | 低       | PreToolUseフック内で完結させる     |

---

## 8. 参照情報

### 関連ドキュメント

- toolMetadata実装: `apps/desktop/src/renderer/components/skill/toolMetadata.ts`
- SkillExecutor仕様: `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`
- Claude Agent SDK: `.claude/skills/claude-agent-sdk/SKILL.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
元タスク仕様書（task-imp-permission-tool-metadata-001）のスコープ外項目として検出
```

### 補足事項

セキュリティ強化に直結するが、ユーザビリティとのバランスが重要。デフォルト無効で段階的に導入することを推奨。
