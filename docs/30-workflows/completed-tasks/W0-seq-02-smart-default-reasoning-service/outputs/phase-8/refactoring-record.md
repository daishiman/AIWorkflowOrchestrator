# Phase 8: リファクタリング記録

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 8                                      |
| 機能名 | claude-sdk-permission-hooks-governance |
| 成果物 | リファクタリング記録                   |
| 作成日 | 2026-03-31                             |
| 前提   | Phase 7（カバレッジ確認）完了          |

---

## 1. リファクタリング対象の分析

### 1.1 コード品質メトリクス

| 対象ファイル                    | 行数（実装部分） | 複雑度 | 重複コード | 判定 |
| ------------------------------- | ---------------- | ------ | ---------- | ---- |
| SkillCreatorGovernancePolicy.ts | 約 120 行        | 低     | 軽微       | 良好 |
| GovernanceAuditSink.ts          | 約 100 行        | 低     | なし       | 良好 |
| GovernanceHooksFactory.ts       | 約 150 行        | 中     | 軽微       | 良好 |

---

## 2. 類似構造の分析

### 2.1 plan / verify の toolPolicy 共通化検討

**検出内容**: plan と verify の toolPolicy は同一構造を持つ。

| 項目            | plan                               | verify                             |
| --------------- | ---------------------------------- | ---------------------------------- |
| permissionMode  | `"plan"`                           | `"plan"`                           |
| allowedTools    | `["Read", "Glob", "Grep", "Bash"]` | `["Read", "Glob", "Grep", "Bash"]` |
| disallowedTools | `["Edit", "Write"]`                | `["Edit", "Write"]`                |
| canUseTool      | なし                               | なし                               |

**分析**: 構造は同一だが、phase name が異なるため audit 記録で phase 判定が曖昧になるリスクがある。共通化すると `GovernanceAuditEvent.phase` の値が `"plan"` なのか `"verify"` なのか判別できなくなる。

**判定**: **現状維持**。phase ごとの分離を維持することで、audit ログの phase 追跡性を確保する。

### 2.2 buildSessionSummary / buildUiPayload の類似パターン

**検出内容**: GovernanceAuditSink の `buildSessionSummary` と `buildUiPayload` の両メソッドで、policy 参照パターンが類似している。

```typescript
// buildSessionSummary
const deniedEvents = events.filter((e) => e.decision === "deny");

// buildUiPayload
const recentDenials = events.filter((e) => e.decision === "deny").slice(-10);
```

**分析**: フィルタリングパターンは類似するが、責務が異なる。

| メソッド            | 責務                                   |
| ------------------- | -------------------------------------- |
| buildSessionSummary | セッション全体の統計サマリーを生成する |
| buildUiPayload      | renderer 向け UI ペイロードを構築する  |

**判定**: **現状維持**。責務の異なるメソッドの共通化は、将来的な仕様変更時に意図しない副作用を生むリスクがある。

### 2.3 onPreToolUse / onPostToolUse の AuditSink record パターン

**検出内容**: GovernanceHooksFactory の `onPreToolUse` と `onPostToolUse` で AuditSink への `record` 呼び出しパターンが類似している。

```typescript
// onPreToolUse
sink.record({
  timestamp: new Date().toISOString(),
  sessionId: sessionState.sessionId,
  phase,
  eventKind: "tool_request",
  toolName: event.toolName,
  decision: "allow",
});

// onPostToolUse
sink.record({
  timestamp: new Date().toISOString(),
  sessionId: sessionState.sessionId,
  phase,
  eventKind: "tool_result",
  toolName: event.toolName,
  toolResult: { duration: event.duration, success: event.success },
});
```

**分析**: `timestamp` / `sessionId` / `phase` のベースフィールドは共通だが、record 内容が異なる。

| Hook          | 固有フィールド                              |
| ------------- | ------------------------------------------- |
| onPreToolUse  | `decision`, `reason`                        |
| onPostToolUse | `toolResult.duration`, `toolResult.success` |

**判定**: **現状維持**。ベースフィールドを共通ヘルパーに抽出可能だが、hook ごとの record 構造が異なるため、共通化のメリットが小さい。

---

## 3. SRP（単一責務）準拠の確認

| コンポーネント               | 責務                                         | SRP 判定 |
| ---------------------------- | -------------------------------------------- | -------- |
| SkillCreatorGovernancePolicy | phase 別 policy の定義と canUseTool 判定     | 準拠     |
| GovernanceAuditSink          | 監査イベントの収集・フィルタ・サマリー生成   | 準拠     |
| GovernanceHooksFactory       | SDK hooks の生成と AuditSink への event 委譲 | 準拠     |

**結果**: 全コンポーネントが SRP に準拠しており、責務の分離が適切に行われている。

---

## 4. コード品質チェックリスト

| チェック項目                           | 結果 |
| -------------------------------------- | ---- |
| `any` 型の使用                         | なし |
| `@ts-ignore` / `@ts-expect-error`      | なし |
| 型アサーション（`as`）の不適切な使用   | なし |
| 未使用の import                        | なし |
| 未使用の変数                           | なし |
| console.log の残存                     | なし |
| ハードコードされた文字列（チャネル名） | なし |
| エラーの握りつぶし（catch で無視）     | なし |
| デッドコード                           | なし |

---

## 5. リファクタリング実施項目

| #   | 項目                                    | 重要度 | 対応   | 理由                                                 |
| --- | --------------------------------------- | ------ | ------ | ---------------------------------------------------- |
| 1   | plan/verify の toolPolicy 共通化        | 低     | 見送り | phase 判定が曖昧になるリスク                         |
| 2   | buildSessionSummary/buildUiPayload 統合 | 低     | 見送り | 責務が異なるため分離を維持                           |
| 3   | record ベースフィールドの共通化         | 低     | 見送り | 共通化のメリットが小さく、可読性を下げるリスクがある |
| 4   | デッドコードの除去                      | -      | なし   | デッドコード検出なし                                 |
| 5   | 未使用 import の除去                    | -      | なし   | 未使用 import 検出なし                               |

---

## 6. 結論

| 項目             | 結果                                                   |
| ---------------- | ------------------------------------------------------ |
| リファクタリング | 不要（現時点でコード品質に問題なし）                   |
| 重複コード       | 軽微な類似構造あり（phase 分離・責務分離の観点で許容） |
| 複雑度           | 許容範囲内                                             |
| SRP 準拠         | 全コンポーネント準拠                                   |

**総合判断**: 重大な重複なし。各モジュールは単一責務を守っており、過剰な共通化は可読性を下げるリスクがあるため、現状維持とする。

**Phase 8 判定**: コード品質に問題なく、リファクタリングの必要なし。Phase 9（品質保証）へ進む。
