---
description: |
  再利用可能なGitHub Actionsワークフローを作成します。
  共通処理をモジュール化し、複数のワークフローから呼び出し可能にします。

  🤖 起動エージェント:
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 1で起動）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** github-actions-syntax
  **Phase 2（設計時）:** reusable-workflows, workflow-inputs-outputs
  **Phase 3（セキュリティ時）:** github-actions-security
  **Phase 4（品質時）:** github-actions-best-practices

  ⚙️ このコマンドの設定:
  - argument-hint: workflow-name（例: setup-node, run-tests, deploy-app）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: エージェント起動用
    • Read: 既存ワークフロー確認用
    • Write(.github/workflows/reusable-**): 再利用可能ワークフロー作成用
  - model: sonnet

  トリガーキーワード: reusable, workflow, shared, common
argument-hint: "workflow-name"
allowed-tools:
  - Task
  - Read
  - Write(.github/workflows/reusable-**)
model: sonnet
---

# create-reusable-workflow

## Phase 1: エージェント起動

`.claude/agents/gha-workflow-architect.md` を起動して、再利用可能ワークフローを作成:

**起動タイミング**: コマンド開始直後

**引数引き渡し**:
- `$ARGUMENTS`: ワークフロー名（例: setup-node, run-tests, deploy-app）
  - 未指定時: インタラクティブに用途を確認

**依頼内容**:
以下の再利用可能ワークフローを作成してください:

1. **ワークフロー目的の明確化**
   - `$ARGUMENTS` から目的を判定
   - 既存ワークフローから共通処理を抽出

2. **入力・出力の設計**
   - `workflow_call` トリガーの設定
   - 入力パラメータの定義（型・デフォルト値・必須/任意）
   - 出力値の定義（他のワークフローで使用する値）

3. **共通処理の実装**
   - ジョブ・ステップの構成
   - シークレットの受け渡し設定
   - 環境変数の管理

4. **呼び出し例の作成**
   - サンプルワークフローファイル（コメント形式）
   - パラメータ指定例

**期待成果物**:
- `.github/workflows/reusable-{name}.yml`
- 呼び出し例のドキュメント（コメント形式）

## Phase 2: スキル参照（エージェント内で実行）

エージェントが以下のスキルを必要に応じて参照:

**必須スキル**:
- `.claude/skills/github-actions-syntax/SKILL.md`: ワークフロー構文・トリガー設定
- `.claude/skills/reusable-workflows/SKILL.md`: 再利用可能ワークフローのパターン

**条件付きスキル**:
- `.claude/skills/workflow-inputs-outputs/SKILL.md`: 複雑な入出力設計が必要な場合
- `.claude/skills/github-actions-security/SKILL.md`: シークレット受け渡しが必要な場合

## Phase 3: 検証と完了

**検証基準**:
- ✅ `workflow_call` トリガーが正しく設定されている
- ✅ 入力パラメータが適切に定義されている（型・デフォルト値）
- ✅ 出力値が必要に応じて定義されている
- ✅ 呼び出し例が明確に記載されている
- ✅ シークレット受け渡しが安全に設計されている

**完了時の出力**:
ワークフローファイルのパスと呼び出し方法を表示してください。
