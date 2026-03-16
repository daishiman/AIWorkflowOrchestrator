# Phase 12: システム仕様同期計画

## メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| 作成日   | 2026-03-16                         |

## 概要

P43対策として、仕様書更新を複数エージェントに分散して実施する計画。
各エージェントは最大3ファイルを担当し、rate limit による中断を防ぐ。

## 同期対象5ファイルとエージェント配分

| #   | 仕様書                                                        | 担当エージェント | 更新内容                                                                                                                      |
| --- | ------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | interfaces-agent-sdk-skill-reference-share-debug-analytics.md | Agent A          | DocOperationResult / DocError / ILLMDocQueryAdapter / SkillDocsCapabilityResult 型定義追加                                    |
| 2   | api-ipc-agent-details.md                                      | Agent A          | 4チャンネル（generate/preview/export/templates）のDocOperationResult導入、エラーコード体系（DOC-1001〜DOC-4001）記録          |
| 3   | security-electron-ipc-advanced.md                             | Agent A          | 4層セキュリティ（sender検証 / P42 3段バリデーション / enum範囲チェック / error boundary）の実装記録追加                       |
| 4   | task-workflow.md                                              | Agent B          | 完了タスクセクションに TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 を追加 + 残課題テーブルに UT-SKILL-DOCS-TERMINAL-HANDOFF-001 を登録 |
| 5   | lessons-learned.md                                            | Agent B          | queryFn差替パターン・CapabilityResolverパターン・Phase 4-5統合ワークフローの教訓を追記                                        |

## P43対策詳細

### エージェント分割方針

- **Agent A**: 技術仕様3ファイル（interfaces / api-ipc / security）
  - 推定ツール使用: 15〜20回
  - 推定時間: 120〜180秒
- **Agent B**: ワークフロー仕様2ファイル（task-workflow / lessons-learned）
  - 推定ツール使用: 10〜15回
  - 推定時間: 90〜120秒

### 実行順序

1. Agent A と Agent B を並列実行（独立しているため）
2. 両エージェント完了後、`git diff --stat -- .claude/skills/` で実際の変更ファイル数を検証
3. 変更が想定ファイル数と一致しない場合は、未更新ファイルを個別に対応

## 付随更新（Step 1-A）

以下は Agent B と並列でメインエージェントが実施する:

| 対象ファイル                                         | 更新内容                                    |
| ---------------------------------------------------- | ------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 完了記録 |
| `.claude/skills/task-specification-creator/LOGS.md`  | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 完了記録 |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブル更新                        |
| `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴テーブル更新                        |

## Agent A 詳細指示

### 対象ファイル 1: interfaces-agent-sdk-skill-reference-share-debug-analytics.md

追加する型定義セクション:

```
### TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 追加型定義

- DocOperationResult<T>: Result<T, DocError> のエイリアス。ドキュメント操作の成否を型安全に表現
- DocError: code (DOC-1001〜DOC-4001) + message + optional cause を持つエラー型
- DocErrorCode: enum として DOC_VALIDATION_ERROR / DOC_LLM_ERROR / DOC_EXPORT_ERROR / DOC_INTERNAL_ERROR を定義
- ILLMDocQueryAdapter: `query(prompt)` + `isAvailable()` + `getProviderName()` の3メソッドを定義するインターフェース
- SkillDocsCapabilityResult: capability ("integrated-api" | "guidance-only" | "terminal-handoff") + optional reason を持つ結果型
```

### 対象ファイル 2: api-ipc-agent-details.md

追加するセクション:

```
### skill:docs:* チャンネル群（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001）

4チャンネルすべてのレスポンスを DocOperationResult<T> に統一。
エラーコード体系: DOC-1000番台(Validation) / DOC-2000番台(Business) / DOC-3000番台(LLM) / DOC-4000番台(Internal)
```

### 対象ファイル 3: security-electron-ipc-advanced.md

追加する4層セキュリティの記録:

```
1. sender検証: validateIpcSender() で送信元ウィンドウを検証
2. P42 3段バリデーション: validateStringArg() で型チェック → 空文字列 → トリム空文字列
3. enum範囲チェック: DocErrorCode の有効値のみ受け入れ
4. error boundary: DocOperationResult で全エラーをラップし、内部スタックトレースを隠蔽
```

## Agent B 詳細指示

### 対象ファイル 4: task-workflow.md

- 完了タスクセクションに追加: `TASK-IMP-SKILL-DOCS-AI-RUNTIME-001` (完了日: 2026-03-16)
- 残課題テーブルに追加: `UT-SKILL-DOCS-TERMINAL-HANDOFF-001` (優先度: 中 / ステータス: unassigned)

### 対象ファイル 5: lessons-learned.md

追加する教訓3点:

1. **queryFn差替パターン**: テスト用 stub queryFn を注入する設計により、LLM 呼び出しをテストから分離できる。`SkillDocGenerator` の `queryFn?: (prompt: string) => Promise<string>` オプションパターンを参照
2. **CapabilityResolverパターン**: 機能の可用性判定を `SkillDocsCapabilityResolver` に集約することで、呼び出し元のロジックを単純化できる。`await isAvailable()` と生成結果のエラー分類を組み合わせて段階的フォールバックを実現
3. **Phase 4-5統合ワークフロー**: テスト設計と実装を同一フェーズで完結させる場合、テスト数の事前見積もり（Phase 4想定値）を後から使い回さず、Phase 12 で実際のテスト数を `grep -c` で確認すること（P37対策）

## 検証手順

Agent 実行後に以下で確認:

```bash
# 変更ファイル数の確認（P43対策）
git diff --stat -- .claude/skills/

# 未タスク配置の確認（P38対策）
ls docs/30-workflows/unassigned-task/task-ut-skill-docs-terminal-handoff-001.md

# topic-map 再生成（P2対策）
node scripts/generate-index.js
```
