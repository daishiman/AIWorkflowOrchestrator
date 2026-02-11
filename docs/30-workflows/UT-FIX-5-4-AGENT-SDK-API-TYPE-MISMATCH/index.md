# UT-FIX-5-4: AgentSDKAPI型定義不一致修正

## メタ情報

```yaml
task_id: UT-FIX-5-4
task_name: AgentSDKAPI型定義不一致修正
category: バグ修正（型安全性）
target_feature: Agent SDK API
priority: 高
scale: 小規模
status: 未着手
source_phase: UT-FIX-5-3 Phase 12 アーキテクチャ検証
created_date: 2026-02-10
dependencies: [UT-FIX-5-3]
issue: https://github.com/daishiman/AIWorkflowOrchestrator/issues/765
```

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| タスクID   | UT-FIX-5-4                                                                   |
| 優先度     | 高                                                                           |
| 規模       | 小規模                                                                       |
| ステータス | 未着手                                                                       |
| GitHub     | [Issue #765](https://github.com/daishiman/AIWorkflowOrchestrator/issues/765) |

---

## 概要

### 問題の背景

UT-FIX-5-3（Preload Agent Abort セキュリティ修正）のPhase 12完了後、アーキテクチャ検証において `agentSDKAPI.abort()` メソッドの型定義と実装の不一致が発見された。

### 問題点

| 箇所                                     | 現在の型定義         | 実際の戻り値       |
| ---------------------------------------- | -------------------- | ------------------ |
| `apps/desktop/src/preload/types.ts:1289` | `abort: () => void;` | `Promise<unknown>` |
| `packages/shared/src/agent/types.ts:236` | `abort(): void;`     | `Promise<unknown>` |

実装では `safeInvoke(IPC_CHANNELS.AGENT_ABORT)` を呼び出しており、`safeInvoke` は `ipcRenderer.invoke()` をラップしているため、戻り値は `Promise<unknown>` となる。

### 影響

1. **TypeScriptコンパイラの誤った型推論**: `.then()` や `await` が使用できない
2. **エラーハンドリングの欠落**: Promise rejectionをキャッチできない
3. **一貫性の欠如**: 他のAgentSDKAPIメソッドはPromiseを返す

---

## 目的

`agentSDKAPI.abort()` メソッドの型定義を実装と一致させ、型安全性を確保する。

---

## スコープ

### 含むもの

- `apps/desktop/src/preload/types.ts` の `AgentSDKAPI.abort` 型修正
- `packages/shared/src/agent/types.ts` の `AgentAPI.abort` 型修正
- 呼び出し箇所のPromise処理追加（必要に応じて）
- 型修正に対応するテストケースの追加

### 含まないもの

- `abort` メソッドの機能変更
- Main Process側のハンドラー修正（UT-FIX-5-3で完了済み）
- 他のAgentSDKAPIメソッドの修正

---

## Phase構成

| Phase | 名称                 | カテゴリ     | 仕様書                                                       |
| ----- | -------------------- | ------------ | ------------------------------------------------------------ |
| 1     | 要件定義             | 要件         | [phase-1-requirements.md](phase-1-requirements.md)           |
| 2     | 設計                 | 設計         | [phase-2-design.md](phase-2-design.md)                       |
| 3     | 設計レビューゲート   | ゲート       | [phase-3-review-gate.md](phase-3-review-gate.md)             |
| 4     | テスト作成           | TDD-Red      | [phase-4-test-creation.md](phase-4-test-creation.md)         |
| 5     | 実装                 | TDD-Green    | [phase-5-implementation.md](phase-5-implementation.md)       |
| 6     | テスト拡充           | 品質         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       |
| 7     | テストカバレッジ確認 | 品質         | [phase-7-coverage-check.md](phase-7-coverage-check.md)       |
| 8     | リファクタリング     | TDD-Refactor | [phase-8-refactoring.md](phase-8-refactoring.md)             |
| 9     | 品質保証             | 品質         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |
| 10    | 最終レビューゲート   | ゲート       | [phase-10-final-review.md](phase-10-final-review.md)         |
| 11    | 手動テスト検証       | 検証         | [phase-11-manual-test.md](phase-11-manual-test.md)           |
| 12    | ドキュメント更新     | 文書化       | [phase-12-documentation.md](phase-12-documentation.md)       |
| 13    | PR作成               | 完了         | [phase-13-pr-creation.md](phase-13-pr-creation.md)           |

---

## 成果物

| 成果物       | パス                                                     |
| ------------ | -------------------------------------------------------- |
| 型定義修正   | `apps/desktop/src/preload/types.ts`                      |
| 正本型修正   | `packages/shared/src/agent/types.ts`                     |
| テスト追加   | `apps/desktop/src/preload/__tests__/agentSDKAPI.test.ts` |
| 実装ガイド   | `outputs/phase-12/implementation-guide.md`               |
| ドキュメント | `outputs/phase-12/documentation-changelog.md`            |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                      | パス                                                                              | 内容                      |
| --------------------------- | --------------------------------------------------------------------------------- | ------------------------- |
| Agent IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャネル設計と型定義   |
| Electron IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPCパターンとセキュリティ |
| APIセキュリティ             | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | 完了タスク記録            |
| AgentSDKAPIインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | AgentSDKAPI正式定義       |

### プロジェクトルール

| 資料名               | パス                                    | 内容                      |
| -------------------- | --------------------------------------- | ------------------------- |
| 型安全ルール         | `.claude/rules/02-code-quality.md`      | TypeScript型安全の原則    |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`    | P23-P28 API型管理パターン |
| Electronセキュリティ | `.claude/rules/04-electron-security.md` | IPC セキュリティ原則      |

### 先行タスク

| タスクID   | 関係 | 説明                                 | ステータス |
| ---------- | ---- | ------------------------------------ | ---------- |
| UT-FIX-5-3 | 先行 | Preload Agent Abort セキュリティ修正 | 完了       |

---

## 関連パターン（既知の落とし穴）

| Pitfall ID | タイトル            | 関連性                                |
| ---------- | ------------------- | ------------------------------------- |
| P23        | API二重定義の型管理 | 2箇所の型定義を同時更新する必要がある |
| P24        | Store型定義不統一   | shared層とpreload層の型不一致         |
| P27        | ハードコード文字列  | IPC_CHANNELS定数使用を確認            |

---

## 変更履歴

| 日付       | 変更内容 |
| ---------- | -------- |
| 2026-02-10 | 初版作成 |
