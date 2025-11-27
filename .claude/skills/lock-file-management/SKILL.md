---
name: lock-file-management
description: |
  ロックファイル（pnpm-lock.yaml、package-lock.json等）の整合性管理と
  依存関係の再現性確保を専門とするスキル。

  専門分野:
  - ロックファイル形式: 各パッケージマネージャーのロックファイル仕様
  - 整合性確認: ロックファイルとpackage.jsonの同期状態検証
  - 競合解決: マージコンフリクト時の適切な解決方法
  - 再現性保証: 環境間での依存関係の一貫性確保

  使用タイミング:
  - ロックファイルのマージコンフリクトを解決する時
  - 依存関係の再現性問題をデバッグする時
  - CI/CD環境での依存関係インストールを最適化する時
  - 新しい環境でのセットアップ手順を確立する時

  Use proactively when resolving lock file conflicts,
  debugging reproducibility issues, or optimizing CI/CD dependency installation.
version: 1.0.0
---

# Lock File Management

## 概要

このスキルは、ロックファイルの管理を通じて依存関係の再現性と整合性を確保するための
方法論を提供します。

ロックファイルは依存関係の正確なバージョンを記録し、異なる環境間で同一の依存関係を
再現するための重要な役割を果たします。

**主要な価値**:
- 開発・ステージング・本番環境間での依存関係の一貫性
- ビルドの再現性による問題の早期発見
- 依存関係の意図しない変更の防止

**対象ユーザー**:
- 依存関係を管理するエージェント（@dep-mgr）
- DevOpsエンジニア
- プロジェクトのセットアップを行う開発者

## リソース構造

```
lock-file-management/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── lock-file-formats.md                    # 各PMのロックファイル形式
│   ├── conflict-resolution.md                  # マージコンフリクトの解決
│   ├── integrity-verification.md               # 整合性検証方法
│   └── ci-cd-optimization.md                   # CI/CDでの最適化
├── scripts/
│   └── verify-lock-integrity.mjs               # 整合性検証スクリプト
└── templates/
    └── lockfile-troubleshooting-template.md    # トラブルシューティングテンプレート
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 各PMのロックファイル形式
cat .claude/skills/lock-file-management/resources/lock-file-formats.md

# マージコンフリクトの解決
cat .claude/skills/lock-file-management/resources/conflict-resolution.md

# 整合性検証方法
cat .claude/skills/lock-file-management/resources/integrity-verification.md

# CI/CDでの最適化
cat .claude/skills/lock-file-management/resources/ci-cd-optimization.md
```

### スクリプト実行

```bash
# 整合性検証スクリプト
node .claude/skills/lock-file-management/scripts/verify-lock-integrity.mjs

# 例: 詳細出力モード
node .claude/skills/lock-file-management/scripts/verify-lock-integrity.mjs --verbose
```

### テンプレート参照

```bash
# トラブルシューティングテンプレート
cat .claude/skills/lock-file-management/templates/lockfile-troubleshooting-template.md
```

## いつ使うか

### シナリオ1: ロックファイルのマージコンフリクト

**状況**: git mergeやrebase時にロックファイルでコンフリクトが発生

**適用条件**:
- [ ] pnpm-lock.yamlまたはpackage-lock.jsonでコンフリクトが発生
- [ ] 複数のブランチで依存関係が変更された
- [ ] マージ後に依存関係が正しくインストールされない

**期待される成果**: 正常に解決されたロックファイルと動作確認

### シナリオ2: 環境間の再現性問題

**状況**: ローカルとCI/CD、または開発者間で依存関係の挙動が異なる

**適用条件**:
- [ ] ローカルでは動作するがCIでは失敗する
- [ ] 他の開発者の環境で問題が発生する
- [ ] 「私の環境では動く」問題が発生

**期待される成果**: 環境間で一貫した依存関係のインストール

### シナリオ3: CI/CDの最適化

**状況**: 依存関係のインストール時間が長く、CIのパフォーマンスを改善したい

**適用条件**:
- [ ] CIの実行時間の大部分が依存関係インストールに費やされている
- [ ] キャッシュが効果的に機能していない
- [ ] 不必要な依存関係の再インストールが発生している

**期待される成果**: 最適化されたCI設定とキャッシュ戦略

## パッケージマネージャー別ロックファイル

### pnpm (pnpm-lock.yaml)

**特徴**:
- YAML形式で人間が読みやすい
- 厳格な依存関係解決
- コンテンツアドレス可能なストレージ

**推奨設定**:
```yaml
# .npmrc
auto-install-peers=true
strict-peer-dependencies=false
```

**インストールコマンド**:
```bash
# 開発環境
pnpm install

# CI環境（ロックファイルを厳密に使用）
pnpm install --frozen-lockfile

# 本番環境（devDependencies除外）
pnpm install --prod --frozen-lockfile
```

### npm (package-lock.json)

**特徴**:
- JSON形式
- npm v7以降でワークスペースをサポート
- 広く普及

**推奨設定**:
```
# .npmrc
package-lock=true
save-exact=true
```

**インストールコマンド**:
```bash
# 開発環境
npm install

# CI環境（クリーンインストール）
npm ci

# 本番環境
npm ci --production
```

### yarn (yarn.lock)

**特徴**:
- カスタム形式
- PnP（Plug'n'Play）モードをサポート
- 確定的な解決

**インストールコマンド**:
```bash
# 開発環境
yarn install

# CI環境（イミュータブル）
yarn install --immutable

# 本番環境
yarn install --production --immutable
```

## ワークフロー

### Phase 1: ロックファイルの状態確認

**目的**: 現在のロックファイルの状態を把握する

**ステップ**:
1. ロックファイルの存在確認
2. package.jsonとの整合性確認
3. 最終更新日時の確認
4. 異常なパターンの検出

**判断基準**:
- [ ] ロックファイルが存在するか？
- [ ] package.jsonの依存関係と整合しているか？
- [ ] 古すぎるロックファイルではないか？

### Phase 2: 問題の診断

**目的**: 発生している問題の根本原因を特定する

**ステップ**:
1. エラーメッセージの分析
2. 依存関係ツリーの確認
3. バージョン競合の特定
4. 環境固有の問題の切り分け

**判断基準**:
- [ ] エラーの種類を特定したか？
- [ ] 影響を受けるパッケージを特定したか？
- [ ] 問題が環境固有かどうか判断したか？

### Phase 3: 修正の実施

**目的**: 問題を安全に解決する

**ステップ**:
1. バックアップの作成
2. 適切な修正方法の選択
3. 修正の適用
4. 動作確認

**判断基準**:
- [ ] 修正前のバックアップがあるか？
- [ ] 適切な修正方法を選択したか？
- [ ] テストで動作確認したか？

### Phase 4: 検証と文書化

**目的**: 修正が正しく行われたことを確認し、記録する

**ステップ**:
1. 全テストの実行
2. CI環境での確認
3. 変更内容の文書化
4. チームへの共有

**判断基準**:
- [ ] 全テストが通過したか？
- [ ] CIが正常に動作するか？
- [ ] 変更内容を文書化したか？

## ベストプラクティス

### すべきこと

1. **ロックファイルを常にコミット**:
   - ロックファイルはバージョン管理に含める
   - .gitignoreに追加しない
   - 変更時は意図的にレビュー

2. **CI環境では厳格モードを使用**:
   - `pnpm install --frozen-lockfile`
   - `npm ci`
   - `yarn install --immutable`

3. **定期的な更新**:
   - 依存関係を定期的に更新
   - 古すぎるロックファイルは問題の温床
   - セキュリティパッチは早期に適用

### 避けるべきこと

1. **ロックファイルの手動編集**:
   - ❌ 直接YAMLやJSONを編集
   - ✅ パッケージマネージャーのコマンドを使用

2. **ロックファイルを無視したインストール**:
   - ❌ `--no-lockfile`オプションの使用
   - ✅ ロックファイルを尊重したインストール

3. **コンフリクトの不適切な解決**:
   - ❌ 片方のバージョンを盲目的に採用
   - ✅ 再生成して整合性を確保

## トラブルシューティング

### 問題1: "lockfile out of sync" エラー

**症状**: package.jsonとロックファイルが同期していない

**原因**:
- package.jsonを手動で編集した
- 部分的なインストールが行われた
- 異なるパッケージマネージャーが使用された

**解決策**:
```bash
# pnpm
pnpm install

# npm
npm install

# yarn
yarn install
```

### 問題2: マージコンフリクト

**症状**: git merge時にロックファイルでコンフリクト発生

**解決策**:
```bash
# 1. package.jsonのコンフリクトを先に解決

# 2. ロックファイルは一旦どちらかを採用
git checkout --theirs pnpm-lock.yaml
# または
git checkout --ours pnpm-lock.yaml

# 3. ロックファイルを再生成
pnpm install

# 4. コミット
git add .
git commit -m "chore: resolve lock file conflict"
```

### 問題3: "unable to resolve dependency tree" エラー

**症状**: ピア依存の競合でインストールが失敗

**解決策**:
```bash
# pnpm: 設定で緩和
# .npmrc
strict-peer-dependencies=false

# npm: legacy peer depsモード
npm install --legacy-peer-deps

# または特定バージョンを強制
# package.json
{
  "overrides": {
    "problem-package": "1.0.0"
  }
}
```

### 問題4: CIでのみインストールが失敗

**症状**: ローカルでは成功するがCIで失敗

**原因**:
- キャッシュの問題
- Node.jsバージョンの不一致
- OSの違い

**解決策**:
1. キャッシュをクリア
2. Node.jsバージョンを明示的に指定
3. 同一のコマンドを使用しているか確認
4. `--frozen-lockfile`を使用しているか確認

## 関連スキル

- **semantic-versioning** (`.claude/skills/semantic-versioning/SKILL.md`): バージョン変更の影響評価
- **dependency-auditing** (`.claude/skills/dependency-auditing/SKILL.md`): セキュリティ脆弱性の検出
- **upgrade-strategies** (`.claude/skills/upgrade-strategies/SKILL.md`): 安全なアップグレード手法

## メトリクス

### ロックファイル管理の効果測定

**測定指標**:
- ロックファイル関連のCIエラー発生率
- コンフリクト解決にかかる平均時間
- 環境間の再現性問題の発生率

**目標値**:
- CIエラー率: <1%
- コンフリクト解決時間: <15分
- 再現性問題: 月間0件

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-27 | 初版作成 - ロックファイル管理フレームワーク |

## 参考文献

- **pnpm documentation**: https://pnpm.io/
- **npm package-lock.json**: https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json
- **yarn.lock**: https://yarnpkg.com/configuration/yarnrc
