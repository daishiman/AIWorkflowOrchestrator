# Quality Metrics

## 概要

エージェント品質を定量的・定性的に評価するための品質メトリクス集。

## 品質の5つのカテゴリ

### 1. 構造品質（Structural Quality）

**指標**:

- ファイルサイズ: 450-550行（推奨）
- Phase数: 3-7個（推奨）
- セクション完全性: 7つの必須セクション

**測定方法**:

```bash
# ファイルサイズチェック
wc -l agent-file.md

# Phase数カウント
grep -c "^### Phase" agent-file.md

# 必須セクションチェック
grep "^## 役割" agent-file.md
grep "^## 専門分野" agent-file.md
grep "^## ワークフロー" agent-file.md
```

**スコア算出**:

```
構造スコア = (ファイルサイズ適正度 × 0.3) +
            (Phase数適正度 × 0.3) +
            (セクション完全性 × 0.4)
```

### 2. 設計原則品質（Design Principles Quality）

**指標**:

- 単一責任原則: 役割セクション数 = 1
- 依存性逆転: スキル参照数 > 0
- プログレッシブディスクロージャー: 詳細はスキルへ移譲

**測定方法**:

```bash
# 単一責任チェック
ROLE_COUNT=$(grep -c "^## 役割" agent-file.md)
if [ $ROLE_COUNT -eq 1 ]; then echo "PASS"; fi

# スキル参照チェック
SKILL_COUNT=$(grep -c "Skill(" agent-file.md)
if [ $SKILL_COUNT -gt 0 ]; then echo "PASS"; fi
```

**スコア算出**:

```
設計原則スコア = (単一責任 × 0.4) +
                (依存性逆転 × 0.3) +
                (プログレッシブディスクロージャー × 0.3)
```

### 3. セキュリティ品質（Security Quality）

**指標**:

- 最小権限の原則: tools配列の妥当性
- パス制限: write_allowed_paths設定
- 承認要求: 危険な操作への approval_required

**測定方法**:

```bash
# ツール権限チェック
TOOLS=$(grep "^tools:" agent-file.md | sed 's/tools: *//')

# パス制限チェック
grep "write_allowed_paths" agent-file.md
grep "write_forbidden_paths" agent-file.md

# 承認要求チェック
grep "approval_required" agent-file.md
```

**スコア算出**:

```
セキュリティスコア = (最小権限 × 0.4) +
                    (パス制限 × 0.3) +
                    (承認要求 × 0.3)
```

### 4. ドキュメンテーション品質（Documentation Quality）

**指標**:

- description明確性: 2-3行、100-200文字
- ベストプラクティス: ✅❌形式
- 変更履歴: 存在と更新頻度

**測定方法**:

```bash
# description長さチェック
DESC_LENGTH=$(grep -A 10 "^description:" agent-file.md | wc -c)

# ベストプラクティスチェック
grep "✅" agent-file.md
grep "❌" agent-file.md

# 変更履歴チェック
grep "## 変更履歴" agent-file.md
```

**スコア算出**:

```
ドキュメンテーションスコア = (description明確性 × 0.3) +
                            (ベストプラクティス × 0.4) +
                            (変更履歴 × 0.3)
```

### 5. 統合品質（Integration Quality）

**指標**:

- スキル統合: スキル参照の適切性
- コマンド統合: コマンドの存在
- エージェント連携: ハンドオフプロトコル

**測定方法**:

```bash
# スキル統合チェック
grep "Skill(.claude/skills/" agent-file.md

# コマンド統合チェック
grep "^## コマンド統合" agent-file.md

# ハンドオフチェック
grep "handoff\|ハンドオフ" agent-file.md
```

**スコア算出**:

```
統合スコア = (スキル統合 × 0.4) +
            (コマンド統合 × 0.3) +
            (エージェント連携 × 0.3)
```

## 総合品質スコア

**算出式**:

```
総合品質スコア = (構造品質 × 0.25) +
                (設計原則品質 × 0.25) +
                (セキュリティ品質 × 0.20) +
                (ドキュメンテーション品質 × 0.15) +
                (統合品質 × 0.15)
```

**評価基準**:

- 90-100点: 優秀（Excellent）
- 80-89点: 良好（Good）
- 70-79点: 合格（Acceptable）
- 60-69点: 改善必要（Needs Improvement）
- 0-59点: 不合格（Failing）

## 品質レポート例

```
=== エージェント品質レポート ===
エージェント名: code-reviewer
評価日: 2025-11-24

[構造品質] 85/100
  - ファイルサイズ: 520行（適正） ✓
  - Phase数: 5個（適正） ✓
  - セクション完全性: 7/7 ✓

[設計原則品質] 90/100
  - 単一責任原則: PASS ✓
  - 依存性逆転: 3スキル参照 ✓
  - プログレッシブディスクロージャー: PASS ✓

[セキュリティ品質] 75/100
  - 最小権限: [Read, Grep] ✓
  - パス制限: なし ⚠
  - 承認要求: なし ⚠

[ドキュメンテーション品質] 88/100
  - description明確性: 適切 ✓
  - ベストプラクティス: あり ✓
  - 変更履歴: あり ✓

[統合品質] 80/100
  - スキル統合: 3スキル ✓
  - コマンド統合: なし -
  - エージェント連携: あり ✓

=== 総合評価 ===
総合品質スコア: 84/100
評価: 良好（Good）

推奨改善:
1. セキュリティ: write_allowed_pathsを設定
2. セキュリティ: 危険な操作にapproval_requiredを追加
```

## 自動評価スクリプト

```bash
# validate-quality.shを使用
./scripts/validate-quality.sh agent-file.md
```

## ベストプラクティス

### ✅ すべきこと

1. **定期的な評価**: 月1回の品質評価
2. **スコア記録**: 変更履歴に品質スコアを記録
3. **継続的改善**: 80点以上を維持
4. **自動化**: validate-quality.shを使用

### ❌ 避けるべきこと

1. **評価の省略**: 新規エージェント作成時の評価省略
2. **低スコア放置**: 60点未満の放置
3. **手動評価のみ**: スクリプトを使用しない

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-24 | 初版作成 |
