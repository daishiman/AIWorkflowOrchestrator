---
description: |
  依存パッケージを一括更新するコマンド。

  更新戦略（patch/minor/major/latest）に基づいて、セキュリティパッチ適用・
  マイナーバージョンアップ・メジャーアップグレードを安全に実行します。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/dep-mgr.md` - 依存関係管理専門エージェント（一括更新・監査）

  📚 利用可能スキル（dep-mgrエージェントが参照）:
  - `.claude/skills/upgrade-strategies/SKILL.md` - patch/minor/major/latest戦略、破壊的変更評価
  - `.claude/skills/semantic-versioning/SKILL.md` - セマンティックバージョニング、変更影響評価
  - `.claude/skills/dependency-auditing/SKILL.md` - 更新後の脆弱性監査、ライセンス変更チェック

  ⚙️ このコマンドの設定:
  - argument-hint: "[strategy]"（更新戦略: patch/minor/major/latest、デフォルト: patch）
  - allowed-tools: パッケージ管理とエージェント起動用
    • Task: dep-mgrエージェント起動用
    • Bash(pnpm*|pnpm*): パッケージ更新専用（outdated/update/install）
    • Read: package.json、pnpm-lock.yaml確認用
    • Edit: package.json更新用
  - model: sonnet（標準的な依存関係更新タスク）

  📋 成果物:
  - 更新されたpackage.json
  - 更新されたロックファイル
  - 更新レポート（更新パッケージ一覧、バージョン変更、破壊的変更警告）
  - セキュリティ監査レポート

  🎯 更新戦略:
  - **patch**（デフォルト、推奨）: セキュリティパッチのみ（1.0.0 → 1.0.1）
  - **minor**: 新機能追加（後方互換）（1.0.0 → 1.1.0）
  - **major**: 破壊的変更を含む（1.0.0 → 2.0.0）
  - **latest**: 最新版に強制更新（非推奨、緊急時のみ）

  トリガーキーワード: update dependencies, upgrade packages, 依存関係更新, パッケージアップグレード
argument-hint: "[strategy]"
allowed-tools:
  - Task
  - Bash(pnpm*)
  - Read
  - Edit
model: sonnet
---

# 依存パッケージ一括更新

このコマンドは、依存パッケージを戦略的に一括更新します。

## 📋 実行フロー

### Phase 1: 更新戦略の確認

**引数検証**:

```bash
# 更新戦略（オプション、デフォルト: patch）
strategy: "${ARGUMENTS:-patch}"

# 許可される値: patch, minor, major, latest
if ! [[ "$strategy" =~ ^(patch|minor|major|latest)$ ]]; then
  エラー: 無効な更新戦略です
  使用可能: patch, minor, major, latest
  使用例: /ai:update-dependencies patch
fi
```

**パッケージマネージャー検出**:

```bash
# ロックファイルから判定
if [ -f "pnpm-lock.yaml" ]; then
  pkg_manager="pnpm"
elif [ -f "package-lock.json" ]; then
  pkg_manager="pnpm"
elif [ -f "yarn.lock" ]; then
  pkg_manager="yarn"
else
  エラー: パッケージマネージャーを検出できません
fi
```

### Phase 2: dep-mgrエージェントを起動

**使用エージェント**: `.claude/agents/dep-mgr.md`

**エージェントへの依頼内容**:

````markdown
依存パッケージを「${strategy}」戦略で更新してください。

**入力**:

- 更新戦略: ${strategy}
- パッケージマネージャー: ${pkg_manager}
- 現在のpackage.json: ${cat package.json}
- 現在のロックファイル: ${cat pnpm-lock.yaml}

**要件**:

1. 更新可能パッケージ確認:

   ```bash
   # pnpm の場合
   pnpm outdated

   # 出力例
   Package      Current  Wanted  Latest
   zod          3.22.0   3.22.4  3.23.0
   next         14.1.0   14.1.4  14.2.0
   typescript   5.3.3    5.3.3   5.4.2
   ```
````

2. 更新戦略別の判断:
   - **patch**: パッチバージョンのみ更新（3.22.0 → 3.22.4）
   - **minor**: マイナーバージョンまで更新（3.22.0 → 3.23.0）
   - **major**: メジャーバージョンも更新（14.1.0 → 14.2.0）
   - **latest**: すべて最新版に更新（警告表示）

3. 破壊的変更評価:
   - メジャーバージョン変更があるパッケージを特定
   - CHANGELOG確認（GitHub Releases）
   - 破壊的変更の影響範囲を評価

4. 更新実行:

   ```bash
   # patch戦略（セキュリティパッチ）
   pnpm update

   # minor戦略
   pnpm update --latest-minor

   # major戦略（対話的更新推奨）
   pnpm update --latest

   # latest戦略（非推奨、緊急時のみ）
   pnpm update --latest
   ```

5. 更新後の検証:
   - `pnpm install` でロックファイル再生成
   - `pnpm audit` でセキュリティ監査
   - `pnpm typecheck` で型エラーチェック
   - `pnpm test` でテスト実行

6. 更新レポート生成:

   ```markdown
   ## 依存関係更新完了

   更新戦略: ${strategy}

   ### 更新されたパッケージ（10件）

   | パッケージ | 変更前 | 変更後 | 種類                        |
   | ---------- | ------ | ------ | --------------------------- |
   | zod        | 3.22.0 | 3.22.4 | patch（セキュリティパッチ） |
   | next       | 14.1.0 | 14.1.4 | patch                       |
   | typescript | 5.3.3  | 5.4.2  | minor（新機能追加）         |

   ### 破壊的変更（0件）

   なし

   ### セキュリティ監査

   - 脆弱性: 修正済み（2件のCritical脆弱性を解決）
   - ライセンス: 変更なし

   ### Next Steps

   1. テスト実行: pnpm test
   2. 型チェック: pnpm typecheck
   3. ローカル動作確認
   4. コミット: git commit -m "chore(deps): update dependencies (${strategy})"
   ```

**スキル参照**:

- `.claude/skills/upgrade-strategies/SKILL.md`
- `.claude/skills/semantic-versioning/SKILL.md`
- `.claude/skills/dependency-auditing/SKILL.md`

**成果物**:

- 更新されたpackage.json
- 更新されたロックファイル
- 更新レポート

````

### Phase 3: 完了報告

```markdown
## 依存関係更新完了

更新戦略: ${strategy}
パッケージマネージャー: ${pkg_manager}

### 更新サマリー
- 更新パッケージ: ${updated_count}件
- セキュリティパッチ: ${security_fixes}件
- 破壊的変更: ${breaking_changes}件

### セキュリティ
✅ 脆弱性: ${vuln_fixed}件修正
✅ ライセンス: 変更なし

### Next Steps
1. テスト実行確認
2. 型チェック確認
3. ローカル動作確認
4. コミット作成
````

## 使用例

### patch戦略（推奨、デフォルト）

```bash
/ai:update-dependencies patch
```

自動実行:

1. セキュリティパッチのみ更新（1.0.0 → 1.0.1）
2. 破壊的変更なし保証
3. 安全な自動更新
4. テスト・型チェック実行

### minor戦略

```bash
/ai:update-dependencies minor
```

新機能を含むマイナーバージョンまで更新（後方互換保証）

### major戦略（破壊的変更を含む）

```bash
/ai:update-dependencies major
```

メジャーバージョンも更新（破壊的変更の可能性）

## 更新戦略詳細

### patch戦略（セキュリティパッチ）

```bash
# 対象バージョン
1.0.0 → 1.0.1  # バグ修正、セキュリティパッチ
1.2.3 → 1.2.5  # パッチバージョンのみ

# 特徴
- ✅ 破壊的変更なし
- ✅ 後方互換性保証
- ✅ セキュリティ脆弱性修正
- ✅ 自動化に最適（CI/CDで定期実行）

# 推奨頻度
週次または月次（セキュリティパッチ優先）
```

### minor戦略（新機能追加）

```bash
# 対象バージョン
1.0.0 → 1.1.0  # 新機能追加（後方互換）
1.2.0 → 1.5.0  # マイナーバージョンアップ

# 特徴
- ✅ 後方互換性保証
- ⚠️ 新機能追加（既存動作は変更なし）
- ✅ 非推奨警告の可能性

# 推奨頻度
月次または四半期毎（新機能活用のため）
```

### major戦略（破壊的変更）

```bash
# 対象バージョン
1.5.0 → 2.0.0  # 破壊的変更を含む
2.0.0 → 3.0.0  # メジャーアップグレード

# 特徴
- ⚠️ 破壊的変更あり
- ⚠️ API変更の可能性
- ⚠️ 移行ガイド必須
- ❌ 自動化非推奨（手動レビュー必要）

# 推奨頻度
計画的（四半期～半期毎、CHANGELOGレビュー後）
```

### latest戦略（非推奨）

```bash
# 対象バージョン
すべてのパッケージを最新版に強制更新

# 特徴
- ❌ 破壊的変更の可能性大
- ❌ 予期しないエラー発生リスク
- ❌ 本番環境では使用禁止

# 使用ケース（限定的）
- 新規プロジェクト作成時
- 大規模移行プロジェクト
- 開発環境のリセット
```

## トラブルシューティング

### 更新後のテスト失敗

**原因**: 破壊的変更またはバグ

**解決策**:

```bash
# ロックファイルをリセット
git checkout pnpm-lock.yaml package.json

# 再インストール
pnpm install

# 個別パッケージのダウングレード
pnpm add [package-name]@[previous-version]
```

### 型エラー発生

**原因**: TypeScript バージョン変更または型定義更新

**解決策**:

```bash
# 型定義の更新
pnpm add -D @types/node @types/react

# tsconfig.json の調整
# "skipLibCheck": true （一時回避）

# パッケージの個別ダウングレード
```

### peer Dependency 競合

**原因**: メジャーアップグレード後の peer dependency 不一致

**解決策**:

```bash
# 競合確認
pnpm list

# peer dependency も更新
pnpm add [peer-dependency]@latest

# overrides 使用（最終手段）
# package.json:
# "pnpm": {
#   "overrides": {
#     "[package-name]": "^2.0.0"
#   }
# }
```

## ベストプラクティス

### 更新前の準備

```bash
# ✅ 良い: 更新前にブランチ作成
git checkout -b chore/update-dependencies
git status  # クリーンな状態確認

# ✅ 良い: 更新前に現在の動作確認
pnpm test
pnpm typecheck
pnpm build

# ❌ 悪い: main ブランチで直接更新
```

### 段階的更新

```bash
# ✅ 良い: patch → minor → major の順で段階的に
/ai:update-dependencies patch
# テスト → コミット

/ai:update-dependencies minor
# テスト → コミット

/ai:update-dependencies major
# レビュー → テスト → コミット

# ❌ 悪い: いきなり latest で一括更新
/ai:update-dependencies latest  # 危険
```

### 更新後の検証フロー

```bash
# 1. 静的チェック
pnpm typecheck  # 型エラー確認
pnpm lint       # コードスタイル確認

# 2. テスト実行
pnpm test       # ユニットテスト
pnpm test:e2e   # E2Eテスト

# 3. ビルド確認
pnpm build      # ビルド成功確認

# 4. ローカル動作確認
pnpm dev        # 実際に動作確認
```

## 参照

- dep-mgr: `.claude/agents/dep-mgr.md`
- upgrade-strategies: `.claude/skills/upgrade-strategies/SKILL.md`
- semantic-versioning: `.claude/skills/semantic-versioning/SKILL.md`
