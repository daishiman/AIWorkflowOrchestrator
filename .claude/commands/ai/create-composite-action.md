---
description: |
  カスタムコンポジットアクションを作成します。
  複数のステップをまとめて再利用可能なアクションとしてパッケージ化します。

  🤖 起動エージェント:
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 1で起動）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** github-actions-syntax
  **Phase 2（設計時）:** composite-actions, action-inputs-outputs
  **Phase 3（セキュリティ時）:** github-actions-security
  **Phase 4（品質時）:** github-actions-best-practices

  ⚙️ このコマンドの設定:
  - argument-hint: action-name（例: setup-environment, deploy-to-railway）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: エージェント起動用
    • Read: 既存アクション確認用
    • Write(.github/actions/**): コンポジットアクション作成用
  - model: sonnet

  トリガーキーワード: composite action, custom action, reusable action
argument-hint: "action-name"
allowed-tools:
  - Task
  - Read
  - Write(.github/actions/**)
model: sonnet
---

# create-composite-action

## Phase 1: エージェント起動

`.claude/agents/gha-workflow-architect.md` を起動して、コンポジットアクションを作成:

**起動タイミング**: コマンド開始直後

**引数引き渡し**:

- `$ARGUMENTS`: アクション名（例: setup-environment, deploy-to-railway）
  - 未指定時: インタラクティブに用途を確認

**依頼内容**:
以下のコンポジットアクションを作成してください:

1. **アクション目的の明確化**
   - `$ARGUMENTS` から目的を判定
   - 既存ワークフローから再利用可能なステップを抽出

2. **アクション設計**
   - `action.yml` の構成
   - 入力パラメータの定義（required・default値）
   - 出力値の定義（他のステップで使用する値）

3. **ステップの実装**
   - 複数のステップを `runs.steps` に配置
   - シェルスクリプトまたは他のアクション呼び出し
   - エラーハンドリングの実装

4. **README.md の作成**
   - アクションの説明
   - 使用例
   - 入力・出力パラメータのリファレンス

**期待成果物**:

- `.github/actions/{name}/action.yml`
- `.github/actions/{name}/README.md`

## Phase 2: スキル参照（エージェント内で実行）

エージェントが以下のスキルを必要に応じて参照:

**必須スキル**:

- `.claude/skills/github-actions-syntax/SKILL.md`: アクション構文・メタデータ設定
- `.claude/skills/composite-actions/SKILL.md`: コンポジットアクションのパターン

**条件付きスキル**:

- `.claude/skills/action-inputs-outputs/SKILL.md`: 複雑な入出力設計が必要な場合
- `.claude/skills/github-actions-security/SKILL.md`: シークレット管理が必要な場合

## Phase 3: 検証と完了

**検証基準**:

- ✅ `action.yml` が正しい構文で作成されている
- ✅ 入力パラメータが適切に定義されている（required・default）
- ✅ ステップが正しく配置され、動作する
- ✅ README.md に使用例が明記されている
- ✅ エラーハンドリングが実装されている

**完了時の出力**:
アクションのパスと使用方法を表示してください。
