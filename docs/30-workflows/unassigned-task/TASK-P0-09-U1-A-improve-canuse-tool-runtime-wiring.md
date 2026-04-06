# TASK-P0-09-U1-A: improve() フローへの canUseTool runtime 配線 — タスク指示書

```yaml
issue_number: 1953
task_id: TASK-P0-09-U1-A
task_name: improve-canuse-tool-runtime-wiring
category: セキュリティ
target_feature: RuntimeSkillCreatorFacade / improve() フロー
priority: 低
scale: 小規模
status: 未着手
source_phase: Phase 12（TASK-P0-09-U1 unassigned-task-detection）
created_date: 2026-04-06
parent_task: TASK-P0-09-U1
dependencies:
  - TASK-P0-09-U1
```

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-P0-09-U1-A                                     |
| タスク名     | improve-canuse-tool-runtime-wiring                  |
| 分類         | セキュリティ                                        |
| 対象機能     | RuntimeSkillCreatorFacade / improve() フロー        |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未着手                                              |
| 発見元       | Phase 12（TASK-P0-09-U1 unassigned-task-detection） |
| 発見日       | 2026-04-06                                          |

---

## 苦戦箇所・知見（TASK-P0-09-U1 実装時）

### 苦戦箇所 1: improve() フローが SDK callback を経由しない設計

`execute()` フローは Claude Agent SDK の `canUseTool` callback で path-scoped deny を runtime 配線できるが、`improve()` フローは `llmAdapter.sendChat()` を使用する。SDK の callback 機構が直接適用されないため、同等の enforcement を実現するには `applyImprovement()` 内での明示的な呼び出しが必要。

**知見**: `applyImprovement()` 内で `evaluateGovernanceToolUse("Edit", "improve", context)` を呼び出すパターンで対応可能。ただし `execute` 側の SDK callback と異なり「呼び出し漏れ」リスクがあるため、integration test で明示的に検証すること。

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-09-U1 では `execute` phase の SDK callback に path-scoped governance を配線した。しかし `improve()` フローは `llmAdapter.sendChat()` を経由するため、SDK の `canUseTool` callback が適用されない構造になっている。

### 1.2 問題点・課題

- `improve()` の `applyImprovement()` 内でファイルを書き込む際、path-scoped deny が runtime で発動しない。
- `createImproveGovernanceCanUseTool()` は method として実装済みだが、実際の `improve()` フローには接続されていない。
- `execute` phase と `improve` phase で enforcement の一貫性が欠けている。

### 1.3 放置した場合の影響

- skill-creator が `improve` phase で意図せずスキルルート外のファイルを書き換えるリスクが残る（低確率だが実際の設計は自身のスキルルート内のみを対象とするため）。
- セキュリティ基盤の一貫性が欠けた状態が継続する。

---

## 2. 何を達成するか（What）

### 2.1 目的

`improve()` フローの `applyImprovement()` 内で path-scoped governance を runtime で発動させ、`execute` フローと同等の enforcement を実現する。

### 2.2 最終ゴール

1. `applyImprovement()` 内で `evaluateGovernanceToolUse("Edit", "improve", context)` を呼び出し、deny の場合は書き込みをスキップして理由を記録する。
2. 既存の governance tests（101件）が全 PASS を維持する。
3. `improve` phase の path-scoped enforcement に関するテストが追加されて PASS する。

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.applyImprovement()` への `evaluateGovernanceToolUse` 呼び出し追加
- `improve` phase path-scoped enforcement のテスト追加
- audit sink への improve 関連イベント記録

#### 含まないもの

- `SkillCreatorPermissionPolicy.evaluateContextPolicy()` の改変
- renderer 側 governance 表示 UI（TASK-P0-09-U1-B）
- audit 永続化（TASK-P0-09-U1-C）

### 2.4 成果物

| 成果物                               | パス                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| 修正: `RuntimeSkillCreatorFacade.ts` | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                          |
| 追加テスト                           | `apps/desktop/src/main/services/runtime/__tests__/governance/improve-path-enforcement.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-P0-09-U1 が完了していること（path-scoped enforcement 基盤実装済み）
- `evaluateGovernanceToolUse` が `governance/index.ts` からエクスポート済みであること
- `createImproveGovernanceCanUseTool()` が実装済みであること

### 3.2 依存タスク

- TASK-P0-09-U1（path-scoped-governance-runtime-enforcement）: **完了済み**

### 3.3 推奨アプローチ

```typescript
// applyImprovement() 内での governance 呼び出しイメージ
private async applyImprovement(
  content: string,
  targetPath: string,
  skillRoot: string,
): Promise<void> {
  // path-scoped governance チェック
  const decision = evaluateGovernanceToolUse("Edit", "improve", {
    targetPath,
    allowedSkillRoot: skillRoot,
  });
  this.auditSink.record({
    sessionId: crypto.randomUUID(),
    eventType: "pre_tool_use",
    toolName: "Edit",
    decision: decision.behavior,
    reason: decision.reason,
  });
  if (decision.behavior === "deny") {
    // deny の場合は書き込みをスキップ
    return;
  }
  // 実際の書き込み処理
  await this.fileWriter.write(targetPath, content);
}
```

---

## 4. 実行手順

### Phase 1: 現状調査・要件定義

`applyImprovement()` の現在の実装と `skillRoot` の取得方法を確認する。

### Phase 2: 設計

`applyImprovement()` シグネチャ変更（`skillRoot` 追加）と governance 呼び出し位置を設計する。

### Phase 3: 設計レビュー

既存テストへの影響を確認する。

### Phase 4: テスト作成（TDD Red）

`improve` phase での path-scoped deny テストを先に書く。

### Phase 5: 実装（Green）

`applyImprovement()` に governance 呼び出しを追加する。

### Phase 6: テスト拡充

エッジケース（`targetPath` なし、`skillRoot` 空）を追加する。

### Phase 7: カバレッジ確認

branch coverage 80%+ を確認する。

### Phase 8: リファクタリング

`execute` と `improve` の governance 呼び出しを共通 helper に切り出す（必要な場合）。

### Phase 9: 品質保証

```bash
pnpm --filter @repo/desktop lint --quiet
pnpm --filter @repo/desktop typecheck
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

### Phase 10: 最終レビュー

- [ ] `improve` phase の path-scoped deny が runtime で機能する
- [ ] 既存 101 件テスト全 PASS
- [ ] 新規テスト全 PASS
- [ ] typecheck / lint PASS

### Phase 11: 動作確認

テスト証跡を記録する（NON_VISUAL）。

### Phase 12: ドキュメント更新

`outputs/phase-12/` に全 6 成果物を作成する。

### Phase 13: PR 作成

PR タイトル: `feat(governance): TASK-P0-09-U1-A improve() path-scoped runtime enforcement 配線`

---

## 5. 完了条件チェックリスト

- [ ] `improve` phase で skill root 外への Edit が `deny` される
- [ ] `improve` phase で skill root 内への Edit が `allow` される
- [ ] `targetPath` なしの場合は tool-level 判定のみ（後方互換）
- [ ] 既存 101 件 governance tests が全 PASS
- [ ] TypeScript 型エラーなし
- [ ] lint エラーなし

---

## 6. リスクと対策

| リスク                                                  | 影響度 | 発生確率 | 対策                                                 |
| ------------------------------------------------------- | ------ | -------- | ---------------------------------------------------- |
| `applyImprovement()` シグネチャ変更で呼び出し元が壊れる | 中     | 低       | 全呼び出し箇所を grep で確認してから変更する         |
| `skillRoot` が取得できず false deny が発生              | 高     | 低       | `skillRoot` が空/undefined の場合は context なし扱い |
| 既存テストの破壊                                        | 高     | 低       | Phase 4 前に全テスト PASS 確認                       |

---

## 7. 参照情報

| 資料                           | パス                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| 親タスク（U1）実装記録         | `docs/30-workflows/completed-tasks/task-p0-09-u1-path-scoped-governance-runtime-enforcement/` |
| `RuntimeSkillCreatorFacade.ts` | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                         |
| governance テスト              | `apps/desktop/src/main/services/runtime/__tests__/governance/`                                |
| unassigned-task-detection      | `outputs/phase-12/unassigned-task-detection.md`（TASK-P0-09-U1）                              |
