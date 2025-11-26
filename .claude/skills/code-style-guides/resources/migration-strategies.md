# Style Guide Migration Strategies

## 移行の必要性

### 移行が必要なケース

**ケース1: linterなし → linterあり**
- 既存プロジェクトにlinterを初導入
- レガシーコードベースの近代化

**ケース2: 緩いルール → 厳格なルール**
- 品質基準の向上
- 技術的負債の返済

**ケース3: スタイルガイド変更**
- StandardからAirbnbへ
- セミコロンなし → セミコロンあり

## 移行戦略

### 戦略1: Big Bang（一括移行）

**アプローチ**: 一度にすべてを変更

**手順**:
```bash
# 1. 新しい設定ファイル作成
cp .eslintrc.old .eslintrc.json

# 2. 全ファイルに自動修正適用
pnpm eslint --fix "src/**/*.{ts,tsx,js,jsx}"

# 3. 手動修正（自動修正不可能なもの）
# 4. コミット
git add .
git commit -m "style: migrate to Airbnb style guide"
```

**メリット**:
- シンプル
- 移行期間が短い

**デメリット**:
- リスクが高い
- 大量のコンフリクト可能性
- 進行中の作業への影響大

**適用**:
- 小規模プロジェクト（<5,000行）
- 進行中の作業が少ない時期

### 戦略2: Incremental（段階的移行）

**アプローチ**: 複数フェーズに分けて移行

**Phase 1: 基礎ルールのみ**
```json
{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": "error",
    "no-undef": "error"
  }
}
```

**Phase 2: warn追加**
```json
{
  "extends": ["airbnb-base"],
  "rules": {
    "no-console": "warn",
    "complexity": ["warn", 15]
  }
}
```

**Phase 3: error格上げ**
```json
{
  "rules": {
    "no-console": "error",
    "complexity": ["error", 10]
  }
}
```

**メリット**:
- リスク低減
- 学習曲線が緩やか
- 進行中の作業への影響小

**デメリット**:
- 移行期間が長い（数ヶ月）
- 一時的に混在状態

**適用**:
- 大規模プロジェクト（>5,000行）
- チームの学習時間確保

### 戦略3: Feature Branch（機能別移行）

**アプローチ**: 新規コードのみ厳格ルール適用

**設定**:
```json
{
  "extends": ["airbnb-base"],
  "overrides": [
    {
      "files": ["legacy/**/*.js"],
      "rules": {
        "complexity": "off",
        "max-lines-per-function": "off"
      }
    },
    {
      "files": ["src/**/*.ts"],
      "rules": {
        "complexity": ["error", 10]
      }
    }
  ]
}
```

**メリット**:
- レガシーコードに触れない
- 新規開発から高品質
- リスク最小

**デメリット**:
- 一貫性の欠如
- 長期的に混在状態が続く

**適用**:
- 大規模レガシーシステム
- リライトが非現実的

### 戦略4: Strangler Fig（徐々に置き換え）

**アプローチ**: リファクタリング時に順次移行

**ルール**:
```
新規ファイル → 厳格ルール
編集ファイル → 厳格ルール適用
未編集ファイル → レガシールール許容
```

**実装**:
```bash
# 編集時に自動修正
git diff --name-only | xargs eslint --fix
```

**メリット**:
- 自然な移行
- リスク低
- コスト分散

**デメリット**:
- 完了まで長期間
- 一貫性の監視が必要

**適用**:
- 中〜大規模プロジェクト
- 継続的改善文化

## 移行チェックリスト

### 移行前準備
- [ ] 現状のコード品質を測定（ESLintエラー数）
- [ ] チームへの移行計画共有と合意形成
- [ ] ブランチ作成（`git checkout -b lint/migration`）
- [ ] バックアップ作成（コミットまたはスタッシュ）

### 移行実施
- [ ] 新しい.eslintrc.json作成
- [ ] 自動修正実行（`eslint --fix`）
- [ ] 手動修正（自動修正不可能なエラー）
- [ ] テスト実行（品質低下していないか確認）
- [ ] ビルド成功確認

### 移行後検証
- [ ] すべてのlintエラーが解消
- [ ] テストが全パス
- [ ] ビルドが成功
- [ ] チームレビュー
- [ ] mainブランチへマージ

## トラブルシューティング

### 問題1: 自動修正で壊れる

**症状**: `eslint --fix`後にコードが動かない

**原因**: 複雑なリファクタリングが必要なケース

**解決**:
```bash
# 1ファイルずつ修正
for file in src/*.ts; do
  eslint --fix "$file"
  pnpm test  # 各ファイル修正後にテスト
done
```

### 問題2: エラーが多すぎる

**症状**: 数千件のlintエラー

**解決**:
- 段階的移行に切り替え
- まずwarnのみ有効化
- 優先度の高いルールから段階的にerror化

### 問題3: チームの抵抗

**症状**: 開発者が移行に反対

**解決**:
- チーム合意形成（投票、議論）
- 小規模パイロット実施（1機能のみ）
- メリットの可視化（バグ削減率等）

## 移行スケジュール例

### 小規模プロジェクト（1-2週間）

```
Week 1:
  - Day 1-2: 設定ファイル作成、テスト
  - Day 3-4: 全ファイルにeslint --fix
  - Day 5: 手動修正、レビュー

Week 2:
  - Day 1-2: テスト、ビルド確認
  - Day 3: チームレビュー
  - Day 4-5: 修正、マージ
```

### 大規模プロジェクト（3-6ヶ月）

```
Month 1:
  - eslint:recommendedのみ、warn運用
  - チームトレーニング

Month 2-3:
  - airbnb-base追加、warn運用
  - 新規コードのみerror

Month 4-5:
  - 既存コードをディレクトリ毎に移行
  - 1ディレクトリ/週ペース

Month 6:
  - すべてerror化
  - 完了
```

## まとめ

**選択基準**:
- 小規模 → Big Bang
- 大規模 → Incremental or Strangler Fig
- レガシー → Feature Branch or Strangler Fig

**成功要因**:
- チーム合意形成
- 段階的アプローチ
- 継続的なレビューと調整
