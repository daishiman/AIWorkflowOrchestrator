# 脆弱性修正戦略

## 概要

脆弱性を安全に修正するには、リスクと影響を考慮した
計画的なアプローチが必要です。

## 修正オプションの種類

### 1. パッケージのアップグレード

**最も推奨される方法**

**直接依存の場合**:
```bash
# 特定バージョンへアップグレード
pnpm update lodash@4.17.21

# 最新バージョンへアップグレード
pnpm update lodash@latest

# package.jsonも更新
pnpm update lodash --save
```

**推移的依存の場合（pnpm）**:
```json
// package.json
{
  "pnpm": {
    "overrides": {
      "lodash": ">=4.17.21"
    }
  }
}
```

**推移的依存の場合（npm）**:
```json
// package.json
{
  "overrides": {
    "lodash": ">=4.17.21"
  }
}
```

**推移的依存の場合（yarn）**:
```json
// package.json
{
  "resolutions": {
    "lodash": ">=4.17.21"
  }
}
```

### 2. パッチの適用

**package-patchを使用**:
```bash
# パッチの作成
npx patch-package lodash

# パッチが patches/lodash+4.17.19.patch として保存される
# package.jsonにpostinstallスクリプトを追加
```

```json
// package.json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

**パッチの内容例**:
```diff
diff --git a/node_modules/lodash/lodash.js b/node_modules/lodash/lodash.js
index 1234567..abcdefg 100644
--- a/node_modules/lodash/lodash.js
+++ b/node_modules/lodash/lodash.js
@@ -1234,7 +1234,10 @@ function baseSet(object, path, value, customizer) {
   var nested = object;
   while (++index < length) {
     var key = toKey(path[index]);
+    // セキュリティ修正: __proto__ への代入を防止
+    if (key === '__proto__' || key === 'constructor') {
+      continue;
+    }
```

### 3. 代替パッケージへの移行

**移行の判断基準**:
- [ ] 現在のパッケージがメンテナンスされていない
- [ ] 脆弱性が頻繁に発見される
- [ ] より安全な代替が存在する

**移行例**:
```bash
# moment.js → date-fns への移行
pnpm remove moment
pnpm add date-fns

# request → node-fetch への移行
pnpm remove request
pnpm add node-fetch
```

### 4. 緩和策の適用

**パッチが利用できない場合の一時的対策**

**入力検証の強化**:
```javascript
// 脆弱な関数を使用する前に入力を検証
function safeProcess(input) {
  // プロトタイプ汚染を防止
  if (typeof input !== 'object' || input === null) {
    throw new Error('Invalid input');
  }

  // 危険なキーを除外
  const sanitized = Object.keys(input)
    .filter(key => !['__proto__', 'constructor', 'prototype'].includes(key))
    .reduce((obj, key) => {
      obj[key] = input[key];
      return obj;
    }, {});

  return vulnerableFunction(sanitized);
}
```

**WAFルールの追加**:
```yaml
# 例: AWS WAFルール
Rules:
  - Name: BlockSQLInjection
    Priority: 1
    Statement:
      SqliMatchStatement:
        FieldToMatch:
          Body: {}
        TextTransformations:
          - Priority: 0
            Type: URL_DECODE
```

### 5. 機能の無効化

**リスクを受け入れられない場合**:
```javascript
// 脆弱な機能を使用しないラッパー
const safeLibrary = {
  ...originalLibrary,
  // 脆弱な関数を無効化
  vulnerableFunction: () => {
    throw new Error('This function is disabled due to security concerns');
  }
};

export default safeLibrary;
```

## 修正戦略の選択フロー

```
脆弱性を発見
    │
    ▼
パッチ/新バージョンが利用可能か？
    │
    ├─ はい → 互換性を確認
    │           │
    │           ├─ 互換性あり → アップグレード実施
    │           │
    │           └─ 破壊的変更あり → 移行計画策定
    │
    └─ いいえ → 代替パッケージがあるか？
                  │
                  ├─ はい → 移行コスト評価
                  │           │
                  │           ├─ 許容範囲 → 移行実施
                  │           │
                  │           └─ 高コスト → 緩和策検討
                  │
                  └─ いいえ → 緩和策を適用
                              または
                              リスク受容を検討
```

## 優先度別の修正アプローチ

### Critical / High

**即時対応が必要**

1. **緊急パッチの適用**:
   ```bash
   # 即座にパッチを適用
   pnpm update vulnerable-package --save

   # ロックファイルをコミット
   git add pnpm-lock.yaml package.json
   git commit -m "security: patch CVE-XXXX-XXXXX"
   ```

2. **ホットフィックスデプロイ**:
   ```bash
   # メインブランチに直接適用
   git checkout main
   # パッチ適用
   git push origin main
   # 即時デプロイ
   ```

3. **影響を受けるシステムの監視強化**:
   - エラーレートの監視
   - 異常なアクセスパターンの検出
   - ログの詳細分析

### Medium

**計画的な対応**

1. **次回スプリントに組み込み**:
   - チケット作成
   - 影響範囲の詳細調査
   - テスト計画の策定

2. **通常のリリースプロセスで対応**:
   ```bash
   # フィーチャーブランチで作業
   git checkout -b fix/cve-xxxx-xxxxx

   # パッチ適用とテスト
   pnpm update vulnerable-package --save
   pnpm test

   # PRを作成
   git push origin fix/cve-xxxx-xxxxx
   ```

### Low

**定期メンテナンスで対応**

1. **依存関係更新バッチに含める**:
   ```bash
   # 定期的な依存関係更新
   pnpm update
   pnpm audit
   pnpm test
   ```

2. **次回メジャーリリースで対応**:
   - 技術的負債として記録
   - 優先度を定期的に再評価

## 修正後の検証

### 脆弱性の解消確認

```bash
# 監査を再実行
pnpm audit

# 特定のCVEが解消されたか確認
pnpm audit --json | jq '.advisories | to_entries[] | select(.value.cves[] == "CVE-XXXX-XXXXX")'
```

### 回帰テスト

```bash
# 全テストスイートを実行
pnpm test

# 特に影響を受ける機能のテスト
pnpm test --grep "affected-feature"

# E2Eテスト
pnpm test:e2e
```

### パフォーマンス確認

```bash
# ベンチマーク実行
pnpm benchmark

# バンドルサイズの確認
pnpm build
du -sh dist/
```

## 文書化

### セキュリティアドバイザリーの記録

```markdown
## セキュリティアドバイザリー: CVE-XXXX-XXXXX

### 概要
- **脆弱性**: プロトタイプ汚染
- **影響を受けるパッケージ**: lodash < 4.17.21
- **重大度**: High (CVSS 7.5)

### 影響
本プロジェクトでは lodash の merge 関数を使用しており、
攻撃者が細工した入力により任意のプロパティを注入できる可能性がありました。

### 対応
- lodash を 4.17.21 にアップグレード
- 影響を受ける入力ポイントに追加のバリデーションを実装

### 確認
- 自動テスト: 全て通過
- セキュリティ監査: 脆弱性解消を確認
- 本番デプロイ: 2025-11-27 完了
```

## チェックリスト

### 修正前
- [ ] 脆弱性の詳細を理解したか？
- [ ] 影響範囲を特定したか？
- [ ] 修正オプションを評価したか？
- [ ] ロールバック計画を準備したか？

### 修正中
- [ ] テスト環境で検証したか？
- [ ] 回帰テストを実行したか？
- [ ] パフォーマンス影響を確認したか？

### 修正後
- [ ] 脆弱性が解消されたことを確認したか？
- [ ] 新たな脆弱性が導入されていないか？
- [ ] 文書化を完了したか？
- [ ] 関係者に報告したか？
