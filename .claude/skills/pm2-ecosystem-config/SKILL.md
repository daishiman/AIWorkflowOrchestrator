---
name: pm2-ecosystem-config
description: |
  PM2エコシステム設定の設計と最適化を専門とするスキル。
  Alexandre Strzelewiczの思想に基づき、ecosystem.config.js の
  構成、実行モード選択、環境設定、監視設定を体系的に設計します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/pm2-ecosystem-config/resources/config-structure-guide.md`: ecosystem.config.js構造（apps配列、必須/推奨オプション、共通設定）
  - `.claude/skills/pm2-ecosystem-config/resources/environment-management.md`: env階層設計、env_production分離、機密情報外部化パターン
  - `.claude/skills/pm2-ecosystem-config/resources/execution-modes.md`: fork vs cluster選択基準、instances数決定、負荷タイプ別最適化
  - `.claude/skills/pm2-ecosystem-config/scripts/validate-ecosystem.mjs`: ecosystem.config.js構文検証と設定項目の整合性チェック
  - `.claude/skills/pm2-ecosystem-config/templates/ecosystem.config.template.js`: PM2設定ファイルテンプレート（実行モード、再起動戦略、環境変数含む）

  専門分野:
  - ecosystem.config.js設計: apps配列、環境設定、共通オプション
  - 実行モード選択: fork vs cluster、instances数決定
  - 再起動戦略: autorestart、max_restarts、min_uptime
  - 環境変数管理: env、env_production、機密情報外部化

  使用タイミング:
  - PM2でNode.jsアプリケーションを管理する時
  - ecosystem.config.jsを新規作成する時
  - 既存PM2設定を最適化する時
  - 本番環境でのプロセス管理設定を設計する時

  Use proactively when designing PM2 configurations, optimizing
  process management, or setting up production Node.js environments.
version: 1.0.0
---

# PM2 Ecosystem Configuration

## 概要

PM2 エコシステム設定は、Node.js アプリケーションのプロセス管理を
宣言的に定義するフレームワークです。Alexandre Strzelewicz が設計した
この設定システムにより、本番環境での安定稼働を実現します。

**主要な価値**:

- 宣言的設定による再現性
- 環境別設定の分離
- 実行モードの最適選択
- 自動再起動による高可用性

## リソース構造

```
pm2-ecosystem-config/
├── SKILL.md
├── resources/
│   ├── config-structure-guide.md
│   ├── execution-modes.md
│   └── environment-management.md
├── scripts/
│   └── validate-ecosystem.mjs
└── templates/
    └── ecosystem.config.template.js
```

### リソース種別

- **設定構造ガイド** (`resources/config-structure-guide.md`): apps 配列、必須/オプション項目
- **実行モード** (`resources/execution-modes.md`): fork vs cluster、instances 数決定
- **環境管理** (`resources/environment-management.md`): env 設定、機密情報管理

## コマンドリファレンス

### リソース読み取り

```bash
# 設定構造ガイド
cat .claude/skills/pm2-ecosystem-config/resources/config-structure-guide.md

# 実行モード選択ガイド
cat .claude/skills/pm2-ecosystem-config/resources/execution-modes.md

# 環境管理ガイド
cat .claude/skills/pm2-ecosystem-config/resources/environment-management.md
```

### スクリプト実行

```bash
# ecosystem.config.js検証
node .claude/skills/pm2-ecosystem-config/scripts/validate-ecosystem.mjs <config-file>
```

### テンプレート参照

```bash
# テンプレートを参照
cat .claude/skills/pm2-ecosystem-config/templates/ecosystem.config.template.js

# テンプレートをコピー
cp .claude/skills/pm2-ecosystem-config/templates/ecosystem.config.template.js ./ecosystem.config.js
```

## ワークフロー

### Phase 1: アプリケーション要件の理解

**収集すべき情報**:

- エントリーポイント（script）
- 実行モード要件（I/O bound vs CPU bound）
- 環境変数要件
- リソース制約

**判断基準**:

- [ ] エントリーポイントは明確か？
- [ ] 負荷特性を理解しているか？
- [ ] 環境別の要件は把握できたか？

### Phase 2: 実行モードの決定

**fork vs cluster の選択**:

| 特性           | fork                   | cluster           |
| -------------- | ---------------------- | ----------------- |
| インスタンス数 | 1                      | 複数              |
| 負荷タイプ     | I/O bound              | CPU bound         |
| ステート       | ステートフル可         | ステートレス必須  |
| 用途           | ファイル処理、外部 API | HTTP/API サーバー |

**instances 数の決定**:

- 自動設定: `"max"` または `0` で CPU 数に自動調整
- 固定値: 明示的な数値で制御
- 予約: `-1` でシステム用に 1 コア確保

**リソース**: `resources/execution-modes.md`

### Phase 3: 設定ファイルの作成

**必須項目**:

```javascript
{
  name: 'app-name',      // プロセス名
  script: './dist/index.js',  // エントリーポイント
  cwd: './app-directory' // 作業ディレクトリ
}
```

**推奨項目**:

```javascript
{
  exec_mode: 'fork',     // または 'cluster'
  instances: 1,          // インスタンス数
  autorestart: true,     // 自動再起動
  max_restarts: 10,      // 最大再起動回数
  min_uptime: '10s'      // 最小稼働時間
}
```

**リソース**: `resources/config-structure-guide.md`

### Phase 4: 環境設定

**環境変数の階層**:

```javascript
{
  env: {
    // 共通設定（すべての環境）
    NODE_ENV: 'development'
  },
  env_production: {
    // 本番環境専用
    NODE_ENV: 'production'
  }
}
```

**機密情報の管理**:

- 設定ファイルに直接記載しない
- `.env` ファイルまたは環境変数マネージャー使用
- `env_file` オプションでファイル参照

**リソース**: `resources/environment-management.md`

### Phase 5: 検証

**構文チェック**:

```bash
node -c ecosystem.config.js
```

**PM2 検証**:

```bash
pm2 start ecosystem.config.js --dry-run
```

## ベストプラクティス

### すべきこと

1. **説明的な命名**: プロジェクト名-コンポーネント名
2. **ビルド成果物指定**: `./dist/index.js` など
3. **環境分離**: `env` と `env_production` を分離
4. **再起動制限**: `max_restarts` で無限ループ防止

### 避けるべきこと

1. **機密情報の直接記載**: API キー、パスワード
2. **絶対パスのハードコード**: 環境依存を避ける
3. **過大な instances 数**: リソース枯渇の原因
4. **再起動設定なし**: クラッシュ時に停止

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-26 | 初版作成 |

## 関連スキル

- **process-lifecycle-management** (`.claude/skills/process-lifecycle-management/SKILL.md`)
- **graceful-shutdown-patterns** (`.claude/skills/graceful-shutdown-patterns/SKILL.md`)
- **log-rotation-strategies** (`.claude/skills/log-rotation-strategies/SKILL.md`)
- **memory-monitoring-strategies** (`.claude/skills/memory-monitoring-strategies/SKILL.md`)
