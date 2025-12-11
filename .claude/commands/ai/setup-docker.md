---
description: |
  Dockerコンテナ化の設定を作成します。
  Dockerfile、docker-compose.yml、マルチステージビルド、ベストプラクティスを適用します。

  🤖 起動エージェント:
  - `.claude/agents/devops-eng.md`: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** docker-basics
  **Phase 2（設計時）:** docker-best-practices, multi-stage-builds
  **Phase 3（セキュリティ時）:** docker-security
  **Phase 4（品質時）:** dockerfile-optimization

  ⚙️ このコマンドの設定:
  - argument-hint: service-name（例: api, frontend, worker）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: エージェント起動用
    • Read: プロジェクト構成確認用
    • Write: Docker設定ファイル作成用
  - model: sonnet

  トリガーキーワード: docker, container, dockerfile, docker-compose
argument-hint: "service-name"
allowed-tools:
  - Task
  - Read
  - Write
model: sonnet
---

# setup-docker

## Phase 1: エージェント起動

`.claude/agents/devops-eng.md` を起動して、Docker設定を作成:

**起動タイミング**: コマンド開始直後

**引数引き渡し**:

- `$ARGUMENTS`: サービス名（例: api, frontend, worker）
  - 未指定時: プロジェクト全体のコンテナ化設定を作成

**依頼内容**:
以下のDocker設定を作成してください:

1. **プロジェクト構成の分析**
   - package.json からランタイム・依存関係を確認
   - ビルドプロセスの特定
   - 環境変数の抽出

2. **Dockerfile作成**
   - マルチステージビルドの適用
   - ベースイメージの選択（Node.js LTS推奨）
   - レイヤーキャッシュの最適化
   - セキュリティベストプラクティス適用

3. **docker-compose.yml作成**
   - サービス定義（`$ARGUMENTS` に基づく）
   - ボリュームマウント設定
   - ネットワーク設定
   - 環境変数の管理

4. **.dockerignore作成**
   - 不要なファイルの除外
   - ビルドコンテキストの最適化

5. **Railway対応**
   - `railway.json` との統合
   - ヘルスチェック設定
   - ポート設定

**期待成果物**:

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- Dockerドキュメント（`docs/docker.md`）

## Phase 2: スキル参照（エージェント内で実行）

エージェントが以下のスキルを必要に応じて参照:

**必須スキル**:

- `.claude/skills/docker-basics/SKILL.md`: Docker基礎・構文
- `.claude/skills/docker-best-practices/SKILL.md`: ベストプラクティス

**条件付きスキル**:

- `.claude/skills/multi-stage-builds/SKILL.md`: マルチステージビルドが必要な場合
- `.claude/skills/docker-security/SKILL.md`: セキュリティ要件が高い場合
- `.claude/skills/dockerfile-optimization/SKILL.md`: パフォーマンス最適化が必要な場合

## Phase 3: 検証と完了

**検証基準**:

- ✅ Dockerfileが正しい構文で作成されている
- ✅ マルチステージビルドが適用されている
- ✅ docker-compose.ymlが動作可能
- ✅ .dockerignoreが適切に設定されている
- ✅ セキュリティベストプラクティスが適用されている
- ✅ Railwayとの統合が考慮されている

**完了時の出力**:
Dockerファイルのパスとローカル実行手順を表示してください。
