# 実際のスキル実行ロジック実装 - タスク指示書

## メタ情報

```yaml
issue_number: 411
```

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| タスクID     | TASK-SKILL-EXEC-LOGIC        |
| タスク名     | 実際のスキル実行ロジック実装 |
| 分類         | 要件/機能追加                |
| 対象機能     | SkillService.executeSkill    |
| 優先度       | 中                           |
| 見積もり規模 | 中規模                       |
| ステータス   | 未実施                       |
| 発見元       | Phase 12（ドキュメント更新） |
| 発見日       | 2026-01-18                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

skill-execution-implementationでは、スキル実行のIPC通信基盤（`skillAPI.execute` → `skill:execute` IPC → `SkillService.executeSkill`）を構築した。しかし、`SkillService.executeSkill`の内部実装は現在スタブ実装（成功結果を返すのみ）であり、実際のスキル実行ロジックは未実装。

### 1.2 問題点・課題

現在の実装:

```typescript
// 初期実装: 成功結果を返す
// 将来的にはスキルの実際の実行ロジックを実装
const output = `Skill "${skill.name}" executed successfully`;
```

この実装では、スキルの実際の機能（例：スライド生成、コード検索など）を実行することができない。

### 1.3 放置した場合の影響

- ユーザーがスキルを「実行」しても実際には何も起こらない
- スキルシステムの価値が半減する
- Agent画面の実行機能が形骸化する

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillService.executeSkill`に実際のスキル実行ロジックを実装し、各スキルが定義する機能を実行できるようにする。

### 2.2 最終ゴール

- スキル実行時に、スキル定義に基づいた処理が実行される
- 実行結果（出力、エラー）が適切に返却される
- 複数のスキルタイプ（プロンプトベース、スクリプトベース等）をサポート

### 2.3 スコープ

#### 含むもの

- スキル実行エンジンの設計・実装
- スキルタイプ別の実行戦略
- 実行結果の標準化
- エラーハンドリング
- 単体テスト・統合テスト

#### 含まないもの

- 新しいスキルの追加（既存スキルの実行のみ）
- UI変更
- スキル管理機能の変更

### 2.4 成果物

- `SkillExecutionEngine` クラス（または同等の実行ロジック）
- スキルタイプ別Executor（PromptExecutor, ScriptExecutorなど）
- 更新されたテストスイート
- 実装ガイドドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- skill-execution-implementation（Phase 1-12）が完了していること
- 既存のIPC通信基盤が正常に動作すること

### 3.2 依存タスク

- skill-execution-implementation（完了済み）

### 3.3 必要な知識

- TypeScript
- Electron Main Process
- スキル定義（SKILL.mdフォーマット）
- Claude Agent SDK（プロンプトベースのスキル実行時）

### 3.4 推奨アプローチ

#### Strategy Patternによる実装

```typescript
// スキルタイプ別の実行戦略
interface SkillExecutor {
  execute(
    skill: Skill,
    params?: Record<string, unknown>,
  ): Promise<SkillRunResult>;
}

class PromptBasedExecutor implements SkillExecutor {
  // プロンプトベースのスキル（Agent SDKを使用）
}

class ScriptBasedExecutor implements SkillExecutor {
  // スクリプトベースのスキル（子プロセス実行）
}

class SkillExecutionEngine {
  private executors: Map<SkillType, SkillExecutor>;

  async execute(
    skill: Skill,
    params?: Record<string, unknown>,
  ): Promise<SkillRunResult> {
    const executor = this.executors.get(skill.type);
    return executor.execute(skill, params);
  }
}
```

---

## 4. 実行手順

### Phase構成

5フェーズ構成（task-specification-creator標準ワークフロー適用）

### Phase 1: 要件定義

#### 目的

実行すべきスキルタイプと実行方式を明確化する

#### 手順

1. 既存スキルの実行方式を調査
2. スキルタイプを分類（プロンプトベース、スクリプトベース等）
3. 各タイプの実行要件を定義
4. 受け入れ基準を作成

#### 成果物

- `outputs/phase-1/functional-requirements.md`

#### 完了条件

- スキルタイプが分類されている
- 各タイプの実行フローが定義されている

### Phase 2: 設計

#### 目的

SkillExecutionEngineのアーキテクチャを設計する

#### 手順

1. クラス図を作成
2. 実行シーケンスを設計
3. インターフェース定義
4. エラーハンドリング設計

#### 成果物

- `outputs/phase-2/architecture.md`
- `outputs/phase-2/interface-design.md`

#### 完了条件

- Strategy Patternに基づく設計が完了
- 各Executorの責務が明確

### Phase 3-8: TDD実装サイクル

標準のRed/Green/Refactorサイクルで実装

### Phase 9-12: 品質検証・ドキュメント

標準ワークフローに従う

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] プロンプトベースのスキルが実行できる
- [ ] スクリプトベースのスキルが実行できる
- [ ] 実行結果が正しく返却される
- [ ] エラー時に適切なエラーメッセージが返却される

### 品質要件

- [ ] ユニットテストカバレッジ 80%以上
- [ ] 統合テストが全件PASS
- [ ] TypeScript型エラーなし

### ドキュメント要件

- [ ] 実装ガイドが更新されている
- [ ] システム仕様書（interfaces-agent-sdk.md）が更新されている

---

## 6. 検証方法

### テストケース

| TC-ID    | テスト内容                 | 期待結果                       |
| -------- | -------------------------- | ------------------------------ |
| TC-X-001 | プロンプトベーススキル実行 | プロンプトが処理され結果が返る |
| TC-X-002 | スクリプトベーススキル実行 | スクリプトが実行され結果が返る |
| TC-X-003 | 不明なスキルタイプ         | 適切なエラーが返却される       |
| TC-X-004 | 実行タイムアウト           | タイムアウトエラーが返却される |

### 検証手順

1. 自動テストを実行（`pnpm --filter @repo/desktop test`）
2. 手動でスキル実行を確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                             |
| ------------------------------ | ------ | -------- | -------------------------------- |
| Agent SDK統合の複雑性          | 高     | 中       | 段階的に実装、既存パターンを参照 |
| スキル定義フォーマットの多様性 | 中     | 中       | タイプを限定して段階的に拡張     |
| パフォーマンス劣化             | 中     | 低       | 非同期処理、キャッシュ活用       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-execution-implementation/outputs/phase-12/implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`
- `.claude/skills/claude-agent-sdk/SKILL.md`

### 参考資料

- Slide Agent SDK統合実装: `apps/desktop/src/main/slide/skill-executor.ts`
- Direct SDK Pattern: `apps/desktop/src/main/slide/agent-client.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
現在のSkillService.executeSkillはスタブ実装で、成功結果を返すのみ。
実際のスキル実行ロジックは未実装。
```

### 補足事項

- 既存のSlide SDK統合（`apps/desktop/src/main/slide/`）を参考にすることを推奨
- SkillExecutorパターン（SkillPhaseマッピング）は再利用可能
