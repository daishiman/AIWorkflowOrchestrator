# Task: OCP違反分析

> **相対パス**: `agents/analyze-violations.md`
> **バージョン**: 1.0.0

---

## 目的

コードベース内のOCP違反パターンを検出し、改善対象を特定する。

## 入力

- 対象コードベースまたはファイルパス
- 分析スコープ（全体/特定モジュール）

## 出力

- OCP違反レポート
- 違反箇所のリスト（ファイル・行番号）
- 推奨される改善アプローチ

## 手順

### Step 1: switch文・条件分岐の検出

```bash
# switch文の検出
grep -rn "switch\s*(" --include="*.ts" --include="*.tsx" src/

# if-elseチェーンの検出
grep -rn "else if" --include="*.ts" --include="*.tsx" src/

# 型による分岐の検出
grep -rn "\.type\s*===\|\.type\s*==" --include="*.ts" src/
```

### Step 2: instanceof検出

```bash
# instanceofによる型チェック
grep -rn "instanceof" --include="*.ts" --include="*.tsx" src/
```

### Step 3: フラグパラメータの検出

```bash
# boolean引数パターン
grep -rn ":\s*boolean\)" --include="*.ts" src/

# isXxx/hasXxx パラメータ
grep -rn "(is[A-Z]\|has[A-Z]).*:" --include="*.ts" src/
```

### Step 4: 違反の分類

検出した各違反を以下で分類：

| カテゴリ | 説明                     | 優先度 |
| -------- | ------------------------ | ------ |
| Critical | 頻繁に変更される分岐     | 高     |
| Major    | 複数箇所で重複する分岐   | 中     |
| Minor    | 安定しており変更が少ない | 低     |

### Step 5: レポート作成

```markdown
# OCP違反分析レポート

## サマリー

- 検出された違反: XX件
- Critical: X件, Major: X件, Minor: X件

## 詳細

### 1. [ファイルパス:行番号]

- **タイプ**: switch文/if-elseチェーン/instanceof
- **コード**: 該当コード抜粋
- **問題**: なぜOCP違反か
- **推奨**: 推奨される改善アプローチ
```

## 完了条件

- [ ] コードベース全体をスキャン
- [ ] 違反パターンを分類
- [ ] 改善優先度を設定
- [ ] レポートを作成
