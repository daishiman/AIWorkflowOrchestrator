# ALLOWED_TOOLS_WHITELIST と toolMetadata 同期 - タスク指示書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | task-permission-toolmetadata-whitelist-sync                  |
| タスク名     | ALLOWED_TOOLS_WHITELISTとtoolMetadataのツール定義同期        |
| 分類         | セキュリティ                                                 |
| 対象機能     | security.ts / toolMetadata.ts                                |
| 優先度       | 中                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | Phase 12（task-imp-permission-tool-metadata-001）仕様Gap分析 |
| 発見日       | 2026-02-01                                                   |
| issue_number | 628                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

security-skill-execution.mdで定義されるALLOWED_TOOLS_WHITELIST（11ツール）と、toolMetadata.tsで定義されるTOOL_METADATA（12ツール）の間にツール定義の不一致がある。ALLOWED_TOOLS_WHITELISTにはLS・TodoWriteが含まれるがtoolMetadataには未定義。逆にtoolMetadataにはNotebookEdit・Skill・AskUserが含まれるがWHITELISTには未登録。

### 1.2 問題点・課題

- セキュリティホワイトリストとUI表示メタデータの対象ツールが一致していない
- 新規ツール追加時に片方のみ更新される漏れリスクがある
- LS・TodoWriteにリスクレベル情報がなくDEFAULT_METADATAにフォールバックしている
- NotebookEdit・Skill・AskUserがホワイトリストに含まれず、セキュリティチェックをすり抜ける可能性がある

### 1.3 放置した場合の影響

- ツール管理の二重定義による整合性問題が蓄積
- セキュリティ監査時にツール定義の不整合が指摘される可能性
- 新規ツール追加時の更新漏れが発生しやすくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

ALLOWED_TOOLS_WHITELISTとTOOL_METADATAの対象ツールリストを統一し、ツール定義の単一情報源（Single Source of Truth）を確立する。

### 2.2 最終ゴール

- 全許可ツールがALLOWED_TOOLS_WHITELISTとTOOL_METADATAの両方に定義されている
- ツール追加時に1箇所の変更で両方に反映される仕組み（または整合性チェック）が存在する
- LS・TodoWriteにリスクレベルが明示的に定義されている

### 2.3 スコープ

#### 含むもの

- ALLOWED_TOOLS_WHITELISTへのNotebookEdit・Skill・AskUser追加検討
- TOOL_METADATAへのLS・TodoWrite追加
- 整合性チェックスクリプトまたはテスト作成
- システム仕様書（security-skill-execution.md、ui-ux-agent-execution.md）の更新

#### 含まないもの

- ツール定義の完全な一元化リファクタリング（アーキテクチャ変更）
- リスクレベルの動的変更機能（別タスク: task-permission-risk-level-dynamic-change）

### 2.4 成果物

- security.ts修正（ALLOWED_TOOLS_WHITELIST更新）
- toolMetadata.ts修正（LS・TodoWriteエントリ追加）
- 整合性テスト（WHITELIST vs METADATAの差分検出テスト）
- システム仕様書更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-tool-metadata-001が完了していること（完了済み）
- ALLOWED_TOOLS_WHITELISTの各ツールの用途を理解していること

### 3.2 依存タスク

- task-imp-permission-tool-metadata-001（完了済み）

### 3.3 必要な知識

- TypeScript
- Claude Agent SDKのツール一覧と各ツールの機能
- packages/shared/src/constants/security.tsの構造

### 3.4 推奨アプローチ

1. 現在の差異を確認（11 vs 12ツール、差分3ツールずつ）
2. 各差分ツールのセキュリティリスクを評価
3. ALLOWED_TOOLS_WHITELISTとTOOL_METADATAを更新
4. 整合性チェックテストを作成（両定義の差分を検出）
5. TDDで実装

---

## 4. 実行手順

### Phase構成

Phase 1-12の標準タスクフローに従う（task-specification-creatorスキル準拠）。

### 主要作業

1. security.tsのALLOWED_TOOLS_WHITELISTにNotebookEdit・Skill・AskUserを追加（要否判断含む）
2. toolMetadata.tsのTOOL_METADATAにLS（Low, ファイル一覧を表示します）・TodoWrite（Low, タスクリストを更新します）を追加
3. 整合性テスト追加: `expect(whitelistTools.sort()).toEqual(metadataTools.sort())`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ALLOWED_TOOLS_WHITELISTとTOOL_METADATAの対象ツールが一致している
- [ ] 全ツールにリスクレベルが明示的に定義されている（DEFAULT_METADATAフォールバック不要）
- [ ] 整合性チェックテストが存在し、PASSしている

### 品質要件

- [ ] 既存テスト（258テスト）が全てPASS
- [ ] 新規テストのカバレッジが80%以上

### ドキュメント要件

- [ ] security-skill-execution.mdの比較テーブルが更新されている
- [ ] ui-ux-agent-execution.mdのツールカバレッジマッピングが更新されている

---

## 6. 検証方法

### テストケース

- ALLOWED_TOOLS_WHITELISTの全ツールにTOOL_METADATAエントリが存在する
- TOOL_METADATAの全ツールがALLOWED_TOOLS_WHITELISTに含まれる
- LS・TodoWriteのリスクレベルが正しく取得できる
- NotebookEdit・Skill・AskUserのホワイトリスト検証が正しく動作する

### 検証手順

1. ユニットテスト実行
2. 整合性チェックテスト実行

---

## 7. リスクと対策

| リスク                                            | 影響度 | 発生確率 | 対策                                       |
| ------------------------------------------------- | ------ | -------- | ------------------------------------------ |
| WHITELISTへのツール追加がセキュリティリスクを増大 | 中     | 低       | 各ツールのリスク評価を実施してから追加判断 |
| 既存のセキュリティチェックロジックへの影響        | 中     | 低       | validateAllowedToolsテストで回帰確認       |

---

## 8. 参照情報

### 関連ドキュメント

- セキュリティ定数: `packages/shared/src/constants/security.ts`
- toolMetadata実装: `apps/desktop/src/renderer/components/skill/toolMetadata.ts`
- システム仕様（セキュリティ）: `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`
- システム仕様（UI）: `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`

### 参考資料

- ツールカバレッジマッピング: ui-ux-agent-execution.md のtoolMetadata vs ALLOWED_TOOLS_WHITELIST比較テーブル

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
security-skill-execution.md v1.3.0更新時にALLOWED_TOOLS_WHITELIST（11ツール）とtoolMetadata（12ツール）の差異を文書化。
差分: WHITELISTのみ: LS, TodoWrite / METADATAのみ: NotebookEdit, Skill, AskUser
```

### 補足事項

LS・TodoWriteは旧バージョンのClaude Code互換ツール。将来的に非推奨となる可能性があるため、追加時はツールのライフサイクルを考慮すること。
