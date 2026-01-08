# agent-sdk-integration - タスク実行仕様書

## ユーザーからの元の指示

```
Claude Agent SDKを使ったスライド作成システムの構築
- presentation-slide-generatorスキルをAIWorkflowOrchestratorアプリ上から呼び出し
- スライドを作成・管理するシステムを構築
```

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | task-feat-agent-sdk-integration-001 |
| タスク名     | Claude Agent SDK統合基盤の構築      |
| 分類         | 要件（新機能）                      |
| 対象機能     | スライド作成システム                |
| 優先度       | 高                                  |
| 見積もり規模 | 中規模                              |
| ステータス   | 未実施                              |
| 作成日       | 2026-01-07                          |

---

## タスク概要

### 目的

ElectronアプリからClaude Agent SDKを介してスキルを呼び出せる基盤を構築する。

### 背景

AIWorkflowOrchestratorアプリでは、presentation-slide-generatorスキルを活用したスライド作成機能を提供したい。このスキルはClaude Code環境で動作するが、Electronデスクトップアプリから直接呼び出す仕組みが必要である。

Anthropicが提供する**Claude Agent SDK**（`@anthropic-ai/claude-agent-sdk`）を使用することで、スキルの呼び出しやセッション管理、ツール制御が可能になる。

### 最終ゴール

1. `@anthropic-ai/claude-agent-sdk`がインストールされている
2. Electronメインプロセスでエージェントを初期化できる
3. IPC通信でRendererプロセスからエージェントAPIを呼び出せる
4. `presentation-slide-generator`スキルの基本呼び出しが動作する

### 成果物一覧

| 種別         | 成果物                               | 配置先                             |
| ------------ | ------------------------------------ | ---------------------------------- |
| 機能         | Agent SDK統合モジュール              | `packages/shared/src/agent/`       |
| 機能         | Electronメインプロセス用エージェント | `apps/desktop/src/main/agent/`     |
| 機能         | IPC通信用プリロードスクリプト        | `apps/desktop/src/preload/`        |
| ドキュメント | Claude Agent SDKスキル               | `.claude/skills/claude-agent-sdk/` |
| テスト       | ユニットテスト・統合テスト           | `packages/*/src/**/*.test.ts`      |
| PR           | GitHub Pull Request                  | GitHub UI                          |

---

## 参照ファイル

本仕様書のスキル選定は以下を参照：

- `.claude/skills/skill_list.md` - スキル一覧
- `.claude/skills/aiworkflow-requirements/references/` - システム仕様
- `docs/30-workflows/unassigned-task/task-agent-sdk-integration.md` - 元の未タスク指示書

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名         | 責務                                 | 依存 |
| ------ | -------- | -------------------- | ------------------------------------ | ---- |
| T-00-1 | Phase 0  | SDK調査・スキル作成  | Claude Agent SDK調査・スキル作成     | -    |
| T-01-1 | Phase 1  | 要件定義             | 目的・スコープ・受け入れ基準定義     | T-00 |
| T-02-1 | Phase 2  | 設計                 | アーキテクチャ・詳細設計             | T-01 |
| T-03-1 | Phase 3  | 設計レビューゲート   | 要件・設計の妥当性検証               | T-02 |
| T-04-1 | Phase 4  | テスト作成           | TDD: Red（失敗するテスト作成）       | T-03 |
| T-05-1 | Phase 5  | 実装                 | TDD: Green（テストを通す実装）       | T-04 |
| T-06-1 | Phase 6  | テスト拡充           | カバレッジ目標達成                   | T-05 |
| T-07-1 | Phase 7  | テストカバレッジ確認 | カバレッジ目標検証                   | T-06 |
| T-08-1 | Phase 8  | リファクタリング     | TDD: Refactor（品質改善）            | T-07 |
| T-09-1 | Phase 9  | 品質保証             | 静的解析・セキュリティ・性能         | T-08 |
| T-10-1 | Phase 10 | 最終レビューゲート   | 全体品質・整合性検証                 | T-09 |
| T-11-1 | Phase 11 | 手動テスト検証       | UX・実環境動作確認                   | T-10 |
| T-12-1 | Phase 12 | ドキュメント更新     | ドキュメント・仕様反映・未タスク検出 | T-11 |
| T-13-1 | Phase 13 | PR作成               | コミット・PR・CI確認                 | T-12 |

**総サブタスク数**: 14個

---

## 実行フロー図

```mermaid
graph TD
    START[タスク開始] --> T-00[Phase 0: SDK調査・スキル作成]
    T-00 --> T-01[Phase 1: 要件定義]
    T-01 --> T-02[Phase 2: 設計]
    T-02 --> T-03[Phase 3: 設計レビューゲート]
    T-03 --> T-04[Phase 4: テスト作成]
    T-04 --> T-05[Phase 5: 実装]
    T-05 --> T-06[Phase 6: テスト拡充]
    T-06 --> T-07[Phase 7: カバレッジ確認]
    T-07 --> T-08[Phase 8: リファクタリング]
    T-08 --> T-09[Phase 9: 品質保証]
    T-09 --> T-10[Phase 10: 最終レビューゲート]
    T-10 --> T-11[Phase 11: 手動テスト]
    T-11 --> T-12[Phase 12: ドキュメント更新]
    T-12 --> T-13[Phase 13: PR作成・CI確認]
    T-13 --> END[マージ準備完了]

    T-03 -->|MAJOR| T-02
    T-03 -->|MAJOR: 要件| T-01
    T-07 -->|未達| T-06
    T-10 -->|MAJOR| T-08
    T-10 -->|MAJOR: 実装| T-05
    T-10 -->|MAJOR: テスト| T-04
    T-10 -->|MAJOR: 設計| T-02
    T-10 -->|CRITICAL| T-01
```

---

## Phase一覧

| Phase | 名称                | 仕様書                                                 | ステータス |
| ----- | ------------------- | ------------------------------------------------------ | ---------- |
| 0     | SDK調査・スキル作成 | [phase-0-sdk-research.md](phase-0-sdk-research.md)     | 未実施     |
| 1     | 要件定義            | [phase-1-requirements.md](phase-1-requirements.md)     | 未実施     |
| 2     | 設計                | [phase-2-design.md](phase-2-design.md)                 | 未実施     |
| 3     | 設計レビューゲート  | [phase-3-design-review.md](phase-3-design-review.md)   | 未実施     |
| 4     | テスト作成          | [phase-4-test-creation.md](phase-4-test-creation.md)   | 未実施     |
| 5     | 実装                | [phase-5-implementation.md](phase-5-implementation.md) | 未実施     |
| 6     | テスト拡充          | [phase-6-test-expansion.md](phase-6-test-expansion.md) | 未実施     |
| 7     | カバレッジ確認      | [phase-7-coverage-check.md](phase-7-coverage-check.md) | 未実施     |
| 8     | リファクタリング    | [phase-8-refactoring.md](phase-8-refactoring.md)       | 未実施     |
| 9     | 品質保証            | [phase-9-quality.md](phase-9-quality.md)               | 未実施     |
| 10    | 最終レビューゲート  | [phase-10-final-review.md](phase-10-final-review.md)   | 未実施     |
| 11    | 手動テスト          | [phase-11-manual-test.md](phase-11-manual-test.md)     | 未実施     |
| 12    | ドキュメント更新    | [phase-12-documentation.md](phase-12-documentation.md) | 未実施     |
| 13    | PR作成              | [phase-13-pr-creation.md](phase-13-pr-creation.md)     | 未実施     |

---

## テストカバレッジ目標

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テスト

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 統合テスト連携（Phase 1〜11で必須）

各Phaseで以下の統合テスト連携アクションを実施すること:

| Phase | 統合テスト連携アクション                        |
| ----- | ----------------------------------------------- |
| 1     | 接続要件（API/認証/データフロー）を要件に明記   |
| 2     | 統合ポイント/契約（API・スキーマ）を設計に反映  |
| 3     | 統合テスト観点のレビューゲートを実施            |
| 4     | 統合テストシナリオを全カテゴリで作成            |
| 5     | フロント/バック接続の実装とテスト支援コード整備 |
| 6     | 統合テストの拡充（全カテゴリのカバレッジ向上）  |
| 7     | 統合テストの再実行とゲート判定                  |
| 8     | リファクタ後の統合テスト継続成功を確認          |
| 9     | 品質保証で統合テスト結果を確認                  |
| 10    | 最終レビューで統合テスト結果を確認              |
| 11    | 手動統合テスト（UI/API接続）を確認              |

---

## Phase完了時の必須アクション

**各Phase完了時に以下を必ず実行すること:**

1. **スキル100%実行**: Phase内で指定された全スキルを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **フィードバック記録**: 使用スキルの結果をLOGS.mdに記録
4. **artifacts.json更新**: Phase完了ステータスを更新
5. **Phase末端の実行確認**: 各スキルを100%実行し、各タスクを完遂した旨を必ず明記

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase {{PHASE_NUMBER}}

# Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/agent-sdk-integration --phase {{PHASE_NUMBER}} --artifacts "..."
```

---

## リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                                     |
| ----------------------------- | ------ | -------- | ---------------------------------------- |
| API Key管理のセキュリティ問題 | 高     | 中       | electron-storeで暗号化保存、環境変数利用 |
| SDK APIの互換性問題           | 中     | 低       | SDK公式ドキュメントを定期確認            |
| IPC通信のパフォーマンス問題   | 中     | 低       | ストリーミング対応、バッチ処理検討       |

---

## 参照情報

### 関連ドキュメント

- `.claude/skills/presentation-slide-generator/SKILL.md`
- `.claude/skills/electron-ipc-patterns/SKILL.md`
- `.claude/skills/electron-security-hardening/SKILL.md`

### 参考資料

| リソース                         | URL                                                          |
| -------------------------------- | ------------------------------------------------------------ |
| Claude Agent SDK公式ドキュメント | https://platform.claude.com/docs/en/agent-sdk/overview       |
| TypeScript SDK GitHub            | https://github.com/anthropics/claude-agent-sdk-typescript    |
| SDK Demos                        | https://github.com/anthropics/claude-agent-sdk-demos         |
| NPM Package                      | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk |
