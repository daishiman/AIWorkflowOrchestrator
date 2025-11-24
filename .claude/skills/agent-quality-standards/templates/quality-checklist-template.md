# Quality Checklist Template

## エージェント品質チェックリスト

エージェント名: `{{agent_name}}`
バージョン: `{{version}}`
評価日: `{{date}}`
評価者: `{{evaluator}}`

---

## 1. 構造品質（Structural Quality）

### ファイルサイズ

- [ ] ファイルサイズが450-550行の範囲内
  - 実測: `{{line_count}}` 行
  - ステータス: `{{size_status}}`

### Phase設計

- [ ] Phase数が3-7個の範囲内
  - 実測: `{{phase_count}}` 個
  - ステータス: `{{phase_status}}`

### 必須セクション

- [ ] `## 役割` セクションが存在
- [ ] `## 専門分野` セクションが存在
- [ ] `## ワークフロー` セクションが存在
- [ ] `## スキル管理` セクションが存在
- [ ] `## ベストプラクティス` セクションが存在
- [ ] `## 詳細リファレンス` セクションが存在
- [ ] `## 変更履歴` セクションが存在

**構造品質スコア**: `{{structural_score}}/100`

---

## 2. 設計原則品質（Design Principles Quality）

### 単一責任原則

- [ ] 役割セクション数が1つのみ
  - 実測: `{{role_count}}` 個
  - ステータス: `{{srp_status}}`

### 依存性逆転

- [ ] スキル参照が存在する（プログレッシブディスクロージャー）
  - 実測: `{{skill_count}}` 個のスキル参照
  - ステータス: `{{dip_status}}`

### 開放・閉鎖原則

- [ ] スキル追加により拡張可能な構造
- [ ] エージェント本体の変更を最小化

**設計原則品質スコア**: `{{design_score}}/100`

---

## 3. セキュリティ品質（Security Quality）

### 最小権限の原則

- [ ] toolsフィールドが役割に適切
  - 設定: `{{tools}}`
  - ステータス: `{{tools_status}}`

### パス制限

- [ ] write_allowed_pathsが設定されている（Write/Editツール使用時）
  - 設定: `{{write_allowed_paths}}`
- [ ] write_forbidden_pathsが設定されている（センシティブファイル保護）
  - 設定: `{{write_forbidden_paths}}`

### 承認要求

- [ ] approval_requiredが設定されている（危険な操作時）
  - 設定: `{{approval_required}}`

**セキュリティ品質スコア**: `{{security_score}}/100`

---

## 4. ドキュメンテーション品質（Documentation Quality）

### YAML Frontmatter

- [ ] `name`フィールドが適切（kebab-case）
  - 値: `{{name}}`
- [ ] `description`フィールドが明確（100-200文字）
  - 長さ: `{{description_length}}` 文字
- [ ] `tools`フィールドが定義済み
- [ ] `model`フィールドが定義済み
  - 値: `{{model}}`
- [ ] `version`フィールドがセマンティックバージョニング形式
  - 値: `{{version}}`

### ベストプラクティス

- [ ] ✅形式の「すべきこと」が記述されている
  - 項目数: `{{best_practice_count}}`
- [ ] ❌形式の「避けるべきこと」が記述されている
  - 項目数: `{{avoid_count}}`

### 変更履歴

- [ ] 変更履歴セクションが存在
- [ ] 初版日付が記録されている
- [ ] バージョンアップ時に更新されている

**ドキュメンテーション品質スコア**: `{{documentation_score}}/100`

---

## 5. 統合品質（Integration Quality）

### スキル統合

- [ ] スキル参照が相対パス形式（`.claude/skills/`）
  - スキル数: `{{skill_count}}`
- [ ] スキル読み込みが明示的（Bash catコマンド）
  - 実装: `{{skill_loading_status}}`

### コマンド統合

- [ ] スラッシュコマンドとの統合が文書化されている
  - コマンド数: `{{command_count}}`

### エージェント連携

- [ ] ハンドオフプロトコルが定義されている（マルチエージェント時）
  - 実装: `{{handoff_status}}`
- [ ] 依存エージェントが明示されている
  - 前提エージェント数: `{{prerequisite_count}}`
  - 後続エージェント数: `{{successor_count}}`

**統合品質スコア**: `{{integration_score}}/100`

---

## 総合評価

| カテゴリ | スコア | 重み | 加重スコア |
|---------|-------|------|-----------|
| 構造品質 | `{{structural_score}}` | 25% | `{{structural_weighted}}` |
| 設計原則品質 | `{{design_score}}` | 25% | `{{design_weighted}}` |
| セキュリティ品質 | `{{security_score}}` | 20% | `{{security_weighted}}` |
| ドキュメンテーション品質 | `{{documentation_score}}` | 15% | `{{documentation_weighted}}` |
| 統合品質 | `{{integration_score}}` | 15% | `{{integration_weighted}}` |

**総合品質スコア**: `{{total_score}}/100`

**評価**: `{{rating}}`
- 90-100点: 優秀（Excellent）
- 80-89点: 良好（Good）
- 70-79点: 合格（Acceptable）
- 60-69点: 改善必要（Needs Improvement）
- 0-59点: 不合格（Failing）

---

## 改善推奨事項

### 優先度: 高（High Priority）

1. `{{high_priority_1}}`
2. `{{high_priority_2}}`
3. `{{high_priority_3}}`

### 優先度: 中（Medium Priority）

1. `{{medium_priority_1}}`
2. `{{medium_priority_2}}`

### 優先度: 低（Low Priority）

1. `{{low_priority_1}}`
2. `{{low_priority_2}}`

---

## アクションプラン

| 項目 | 優先度 | 担当 | 期限 | ステータス |
|------|-------|------|------|-----------|
| `{{action_1}}` | `{{priority_1}}` | `{{assignee_1}}` | `{{deadline_1}}` | `{{status_1}}` |
| `{{action_2}}` | `{{priority_2}}` | `{{assignee_2}}` | `{{deadline_2}}` | `{{status_2}}` |
| `{{action_3}}` | `{{priority_3}}` | `{{assignee_3}}` | `{{deadline_3}}` | `{{status_3}}` |

---

## 次回評価予定

次回評価日: `{{next_evaluation_date}}`
評価頻度: 月1回（推奨）

---

## 評価者サイン

評価者: `{{evaluator}}`
日付: `{{date}}`
サイン: `{{signature}}`

---

## 変更履歴

| 日付 | 評価者 | 総合スコア | 主要変更 |
|------|-------|-----------|---------|
| `{{date}}` | `{{evaluator}}` | `{{total_score}}` | 初回評価 |
