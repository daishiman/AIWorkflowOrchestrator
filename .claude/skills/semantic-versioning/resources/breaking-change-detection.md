# 破壊的変更の検出と対応

## 概要

破壊的変更（Breaking Changes）は、既存のコードが動作しなくなる可能性のある変更です。
事前に検出し、適切に対応することで、アップグレードリスクを最小化できます。

## 破壊的変更の種類

### 1. API変更

**削除された機能**:
```javascript
// Before (v1.x)
import { deprecatedFunction } from 'package';

// After (v2.x) - 関数が削除されている
// deprecatedFunction is not exported
```

**名前変更**:
```javascript
// Before (v1.x)
import { oldName } from 'package';

// After (v2.x)
import { newName } from 'package';
```

**シグネチャ変更**:
```javascript
// Before (v1.x)
function getData(id) { ... }

// After (v2.x) - 必須引数が追加
function getData(id, options) { ... }
```

### 2. 動作変更

**デフォルト値変更**:
```javascript
// Before (v1.x)
createClient(); // strictMode: false がデフォルト

// After (v2.x)
createClient(); // strictMode: true がデフォルト
```

**戻り値の型変更**:
```javascript
// Before (v1.x)
getUser(id); // returns: { name: string }

// After (v2.x)
getUser(id); // returns: { name: string, email: string | null }
```

### 3. 環境要件変更

**Node.jsバージョン**:
```json
// Before (v1.x)
{ "engines": { "node": ">=14.0.0" } }

// After (v2.x)
{ "engines": { "node": ">=18.0.0" } }
```

**ピア依存変更**:
```json
// Before (v1.x)
{ "peerDependencies": { "react": "^17.0.0" } }

// After (v2.x)
{ "peerDependencies": { "react": "^18.0.0" } }
```

## 破壊的変更の検出方法

### 1. CHANGELOG/リリースノートの確認

**確認すべきセクション**:
- `## Breaking Changes`
- `## BREAKING CHANGES`
- `## Migration Guide`
- `## Upgrade Guide`

**キーワード検索**:
- "breaking"
- "removed"
- "deprecated"
- "renamed"
- "changed"

### 2. GitHub Releasesの確認

```bash
# GitHubのリリースページを確認
# https://github.com/<owner>/<repo>/releases

# 主要なポイント:
# - タグ名（v2.0.0等のMajorリリース）
# - リリースノートの内容
# - 添付されたマイグレーションガイド
```

### 3. TypeScript型定義の差分

**型定義の変更を確認**:
```typescript
// Before (v1.x) - @types/package
interface Config {
  option1: string;
  option2?: number;
}

// After (v2.x) - @types/package
interface Config {
  option1: string;
  option2: number;  // オプショナルではなくなった
  option3: boolean; // 新しい必須プロパティ
}
```

### 4. 依存関係の変更確認

```bash
# package.jsonの差分を確認
# - dependencies
# - peerDependencies
# - engines
```

## 影響範囲の調査

### プロジェクト内での使用箇所検索

**検索パターン**:
```bash
# importの検索
grep -r "from 'package-name'" src/
grep -r "require('package-name')" src/

# 特定の関数/クラスの使用
grep -r "deprecatedFunction" src/
grep -r "OldClassName" src/
```

**TypeScriptプロジェクトの場合**:
```bash
# 型のimportも検索
grep -r "import type.*from 'package-name'" src/
```

### 影響度スコアリング

| 要因 | 低 (1-3) | 中 (4-6) | 高 (7-10) |
|-----|---------|---------|---------|
| 使用箇所数 | 1-5箇所 | 6-20箇所 | 20箇所以上 |
| 変更の複雑さ | 単純な置換 | ロジック変更必要 | アーキテクチャ変更必要 |
| テストカバレッジ | 高 (>80%) | 中 (50-80%) | 低 (<50%) |
| 本番への影響 | 間接的 | 直接的だが限定的 | クリティカルパス |

**総合影響度 = (使用箇所 + 複雑さ + (10-テストカバレッジ) + 本番影響) / 4**

## 対応戦略

### 戦略1: 段階的移行

**適用条件**:
- 影響範囲が広い
- テストカバレッジが十分
- 移行期間が確保できる

**手順**:
1. 新バージョンと旧APIの共存期間を設定
2. 警告を出しながら旧APIを使用
3. 段階的に新APIへ移行
4. 旧APIを完全に削除

### 戦略2: 一括移行

**適用条件**:
- 影響範囲が限定的
- 変更が単純（名前変更等）
- テストで検証可能

**手順**:
1. フィーチャーブランチを作成
2. 全ての変更を一括で適用
3. テストで検証
4. コードレビュー後にマージ

### 戦略3: 移行延期

**適用条件**:
- 影響範囲が非常に広い
- 移行コストが高い
- 代替手段がある

**対応**:
1. 現在のバージョンを固定
2. セキュリティパッチのみバックポート
3. 移行計画を中長期で策定

## チェックリスト

### 破壊的変更検出時
- [ ] CHANGELOGで破壊的変更を確認したか？
- [ ] 移行ガイドが提供されているか？
- [ ] プロジェクト内の影響範囲を調査したか？
- [ ] 影響度スコアを算出したか？

### 対応戦略決定時
- [ ] 影響度に応じた戦略を選択したか？
- [ ] 必要なリソース（時間、人員）を見積もったか？
- [ ] ロールバック計画を準備したか？
- [ ] テスト計画を立案したか？

### 移行実施時
- [ ] フィーチャーブランチで作業しているか？
- [ ] 各変更後にテストを実行しているか？
- [ ] コードレビューを受けているか？
- [ ] 本番デプロイ前に検証環境でテストしたか？
