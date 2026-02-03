# Claude Agent SDK本格統合 - タスク指示書

## メタ情報

```yaml
issue_number: 693
```

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-9B-I                      |
| タスク名     | Claude Agent SDK本格統合       |
| 分類         | 機能拡張                       |
| 対象機能     | Skill Creator Service          |
| 優先度       | 中                             |
| 見積もり規模 | 大規模                         |
| ステータス   | 未着手                         |
| 発見元       | TASK-9B-G Phase 3 設計レビュー |
| 発見日       | 2026-02-03                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9B-GではSkillCreatorServiceのコア機能を実装した。
現在のScriptExecutorはClaude Code CLIに依存しているが、将来的にはClaude Agent SDKを直接統合することで、より柔軟なエージェント実行が可能になる。

### 1.2 問題点・課題

- 現在のScriptExecutorはClaude Code CLI経由でエージェント実行
- SDK直接統合による以下のメリットが未活用:
  - Hooks（PreToolUse, PostToolUse）によるリアルタイム制御
  - Permission Controlの統合管理
  - MCPツールの動的登録
  - ストリーミングの低レイテンシ処理

### 1.3 放置した場合の影響

- Claude Code CLIへの依存継続
- 高度なエージェント制御機能が利用不可
- スキル作成プロセスの最適化機会の損失

---

## 2. 何を達成するか（What）

### 2.1 目的

Claude Agent SDK（@anthropic-ai/claude-agent-sdk）を直接統合し、ScriptExecutorの代替実装を提供する。

### 2.2 最終ゴール

- SDK統合版ExecutionEngineの実装
- Hooksによるリアルタイム制御
- Permission Controlの統合
- CLIモードとSDKモードの切り替え可能

### 2.3 スコープ

#### 含むもの

- SDKExecutionEngine実装
- Hooksシステム統合
- Permission Control連携
- 設定による実行モード切り替え

#### 含まないもの

- MCPサーバー実装（別タスク）
- UIコンポーネント変更

### 2.4 成果物

| 成果物             | パス                                                             |
| ------------------ | ---------------------------------------------------------------- |
| SDKExecutionEngine | `apps/desktop/src/main/services/skill/SDKExecutionEngine.ts`     |
| Hooks統合          | `apps/desktop/src/main/services/skill/hooks/`                    |
| Permission連携     | 既存PermissionResolverとの統合                                   |
| 設定               | `apps/desktop/src/main/services/skill/config/executionConfig.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9B-G（SkillCreatorService実装）完了
- TASK-9B-H（IPC設定）完了
- Claude Agent SDK APIの理解

### 3.2 依存タスク

| タスクID  | タスク名                | ステータス |
| --------- | ----------------------- | ---------- |
| TASK-9B-G | SkillCreatorService実装 | ✅ 完了    |
| TASK-9B-H | IPC通信チャンネル設定   | 未着手     |

### 3.3 必要な知識・スキル

- Claude Agent SDK（@anthropic-ai/claude-agent-sdk）
- Anthropic SDK（@anthropic-ai/sdk）
- Hooksシステム（PreToolUse, PostToolUse, PermissionRequest）
- TypeScript非同期パターン

### 3.4 推奨アプローチ

1. claude-agent-sdkスキルのreferencesを参照
2. Strategy Patternで実行エンジンを抽象化
3. 設定値でCLI/SDK切り替え

---

## 4. 実行手順

### Phase 1-13: task-specification-creatorの標準フローに従って実行

### 参考: アーキテクチャ設計

```
interface IExecutionEngine {
  execute(script: string, args: Record<string, unknown>): AsyncGenerator<StreamChunk>
  abort(): Promise<void>
}

class CLIExecutionEngine implements IExecutionEngine { ... }  // 既存
class SDKExecutionEngine implements IExecutionEngine { ... }  // 新規
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SDKExecutionEngineが実装されている
- [ ] Hooksが統合されている
- [ ] Permission Controlが連携している
- [ ] CLI/SDK切り替えが設定可能

### 品質要件

- [ ] テストカバレッジ: Line 80%, Branch 60%, Function 80%
- [ ] 既存テストが引き続きパス

### ドキュメント要件

- [ ] interfaces-agent-sdk-skill.mdにSDK統合仕様を追記
- [ ] 実装ガイドを更新

---

## 6. 検証方法

### テストケース

| #   | テストケース   | 期待結果                           |
| --- | -------------- | ---------------------------------- |
| 1   | SDK直接実行    | Anthropic APIが直接呼び出される    |
| 2   | Hooks発火      | PreToolUse/PostToolUseが呼ばれる   |
| 3   | Permission連携 | 権限要求がUIに表示される           |
| 4   | モード切り替え | 設定変更で実行エンジンが切り替わる |

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                   |
| ------------------ | ------ | -------- | ---------------------- |
| SDK API変更        | 中     | 中       | アダプター層で吸収     |
| パフォーマンス差異 | 低     | 中       | ベンチマーク比較       |
| 既存機能との互換性 | 高     | 低       | Strategy Patternで分離 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント            | パス                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| Claude Agent SDK仕様    | `.claude/skills/claude-agent-sdk/references/`                      |
| SkillCreatorService仕様 | `aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |

### 関連タスク

| タスクID  | 関係 | 説明                    |
| --------- | ---- | ----------------------- |
| TASK-9B-G | 先行 | SkillCreatorService実装 |
| TASK-9B-H | 先行 | IPC通信チャンネル設定   |

---

## 9. 先行タスクからの教訓（TASK-9B-G）

TASK-9B-G（SkillCreatorService実装）で得られた知見を本タスク実装時に活用すること。

### 9.1 Script First原則

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| 原則     | 決定論的な処理（100%正しい結果が出るもの）はスクリプトに委譲 |
| 実装     | ScriptExecutorで検証・ファイル操作を決定論的に実行           |
| 本タスク | SDK統合でも同原則を維持、Hooksは非決定論的部分に適用         |

### 9.2 定数外部化のタイミング

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| 問題     | 初期実装でハードコードした定数を後から外部化すると手戻りが発生 |
| 解決策   | Phase 8リファクタリングで定数外部化を計画的に実施              |
| 本タスク | SDK設定値（APIキー、エンドポイント等）は最初から外部化設計     |

### 9.3 Strategy Patternの活用

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| 教訓     | CLIモードとSDKモードを共存させるにはStrategy Patternが有効 |
| 本タスク | IExecutionEngine抽象化により、実行エンジンを柔軟に切り替え |

### 9.4 未タスク登録漏れ防止

| 項目     | 内容                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 問題     | 未タスク指示書を作成しても、task-workflow.mdへの登録を忘れやすい                           |
| 解決策   | **3ステップ必須**: ①指示書作成 → ②task-workflow.md残課題テーブル登録 → ③関連仕様書への記載 |
| 本タスク | Phase 12完了前に必ず3ステップを確認すること                                                |

---

## 10. 備考

### 発見元の原文

```
Phase 3 設計レビュー結果より:
- Claude Agent SDK本格統合（MINOR判定）
- 将来拡張としてSDK直接統合を推奨
```

### 補足事項

- 初期段階ではCLIモードをデフォルトとし、SDKモードはオプトイン
- SDK統合は段階的に実施（Phase 1: 基本実行 → Phase 2: Hooks → Phase 3: MCP）
