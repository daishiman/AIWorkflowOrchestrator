# Phase 0: SDK調査・スキル作成

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase番号  | 0                                                    |
| Phase名    | SDK調査・スキル作成                                  |
| 目的       | Claude Agent SDK調査・claude-agent-sdkスキル新規作成 |
| 前提Phase  | なし                                                 |
| 後続Phase  | Phase 1（要件定義）                                  |
| ステータス | 未実施                                               |

---

## 目的

Claude Agent SDKの公式ドキュメント・APIリファレンスを調査し、プロジェクト用のスキルを作成する。
Agent SDK: https://platform.claude.com/docs/ja/agent-sdk/overview
Agent Skill: https://platform.claude.com/docs/ja/agents-and-tools/agent-skills/overview

---

## 使用スキル

| スキル名      | パス                                    | 選定理由                                          |
| ------------- | --------------------------------------- | ------------------------------------------------- |
| skill-creator | `.claude/skills/skill-creator/SKILL.md` | 新規スキル作成（Trigger: スキル作成、新規スキル） |

**実行方法**:

```
1. claude-code-guideエージェント（Task agent）でClaude Agent SDKの公式ドキュメントを調査
2. 調査結果を元にskill-creatorスキルを使用してclaude-agent-sdkスキルを新規作成
```

---

## 成果物

| 成果物                       | 説明                             | 配置先                                   |
| ---------------------------- | -------------------------------- | ---------------------------------------- |
| Claude Agent SDK調査レポート | SDK概要・API・ベストプラクティス | `outputs/phase-0/sdk-research-report.md` |
| claude-agent-sdkスキル       | 新規作成するSDK利用スキル        | `.claude/skills/claude-agent-sdk/`       |

---

## 実行手順

### Step 1: Claude Agent SDK公式ドキュメント調査

claude-code-guideエージェントを使用してClaude Agent SDKの公式ドキュメントを調査する。
Agent SDK: https://platform.claude.com/docs/ja/agent-sdk/overview
Agent Skill: https://platform.claude.com/docs/ja/agents-and-tools/agent-skills/overview

**調査項目**:

1. SDK基本API（query, ClaudeSDKClient）
2. セッション管理パターン
3. パーミッション制御
4. Electron統合パターン
5. エラーハンドリング

**参考URL**:

- https://platform.claude.com/docs/en/agent-sdk/overview
- https://github.com/anthropics/claude-agent-sdk-typescript
- https://github.com/anthropics/claude-agent-sdk-demos
- https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk

### Step 2: claude-agent-sdkスキル作成

skill-creatorスキルを使用して、claude-agent-sdkスキルを新規作成する。

**スキル作成仕様**:

- **スキル名**: `claude-agent-sdk`
- **配置先**: `.claude/skills/claude-agent-sdk/`

**含める内容**:

1. SDK基本API（query, ClaudeSDKClient）
2. セッション管理パターン
3. パーミッション制御
4. Electron統合パターン
5. エラーハンドリング
6. ストリーミング対応

---

## 完了条件

- [ ] Claude Agent SDK公式ドキュメントを調査完了
- [ ] SDK利用パターンを整理
- [ ] `claude-agent-sdk`スキルを作成
- [ ] スキルがskill-creatorの品質基準を満たしている
- [ ] **本Phase内の全スキルを100%実行完了**
- [ ] TypeScript, pnpmを使用する

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                    | 内容                    |
| ---------------- | ----------------------------------------------------------------------- | ----------------------- |
| architecture-rag | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` | RAGアーキテクチャ設計   |
| interfaces-llm   | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`   | LLMインターフェース仕様 |

---

## スキルフィードバック記録

| スキル        | 結果    | 備考              |
| ------------- | ------- | ----------------- |
| skill-creator | pending | Phase完了後に記録 |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. Claude Agent SDK公式ドキュメント調査
3. SDK利用パターンの整理
4. skill-creatorスキルの実行
5. claude-agent-sdkスキルの作成
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 0
```

---

## 次のPhase

Phase 1: 要件定義

---

## 備考

- 本Phaseは後続Phase（要件定義、設計、実装）の基盤となる
- SDK V2（プレビュー版）のsend()/receive()パターンも調査対象に含める
- 調査結果はスキルのreferences/ディレクトリに整理する
