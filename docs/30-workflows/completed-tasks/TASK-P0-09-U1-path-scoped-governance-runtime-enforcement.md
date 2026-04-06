# TASK-P0-09-U1: path-scoped governance runtime enforcement — タスク指示書

```yaml
issue_number: 1932
task_id: TASK-P0-09-U1
task_name: path-scoped-governance-runtime-enforcement
category: セキュリティ
target_feature: RuntimeSkillCreatorFacade / SkillCreatorPermissionPolicy
priority: 高
scale: 小規模
status: 完了
source_phase: Phase 12
created_date: 2026-04-06
parent_task: TASK-P0-09
dependencies:
  - TASK-P0-09
```

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-P0-09-U1                                            |
| タスク名     | path-scoped-governance-runtime-enforcement               |
| 分類         | セキュリティ                                             |
| 対象機能     | RuntimeSkillCreatorFacade / SkillCreatorPermissionPolicy |
| 優先度       | 高                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 完了                                                     |
| 発見元       | Phase 12（TASK-P0-09 unassigned-task-detection）         |
| 発見日       | 2026-04-06                                               |

---

## 苦戦箇所・知見（TASK-P0-09 実装時）

### 苦戦箇所 1: SDK callback から `targetPath` を安全に抽出する方法

`RuntimeSkillCreatorFacade.createExecuteGovernanceCanUseTool()` が受け取る `input: Record<string, unknown>` のキー名は SDK バージョンにより `file_path` / `path` が揺れる。

**知見**: `input?.file_path ?? input?.path` の fallback パターンで両方を拾い、存在しない場合は context なし（tool-level 判定のみ）として扱うことで後方互換を保てる。

### 苦戦箇所 2: 「判定ロジック層」と「配線層」の責任分離

`SkillCreatorPermissionPolicy.evaluateContextPolicy()` は実装・テスト済みのため改変禁止。配線層（`RuntimeSkillCreatorFacade`）のみを修正する原則を守らないと、単体テストを壊さずに統合テストが通らない状態になる。

**知見**: 配線層のメソッドシグネチャに `skillRoot: string` を追加し、呼び出し元の `execute()` から `this.getExplicitSkillCreatorRoot()` 等で取得して渡す。

### 苦戦箇所 3: `improve` phase での `canUseTool` 未設定状態

`execute` 修正後に `improve` phase でも同様の未配線が残る。確認を怠ると片方だけ直した状態になる。

**知見**: `createExecuteGovernanceCanUseTool()` と対応する `createImproveGovernanceCanUseTool()` を同時に追加するか、共通 helper に切り出すことで漏れを防止する。

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-09 で governance 基盤（policy/hooks/audit）を整備した。`execute` phase での tool-level enforcement は機能しているが、`SkillCreatorPermissionPolicy.evaluateContextPolicy()` が持つ **path-scoped deny** ロジックは SDK 実行経路に接続されておらず、runtime で発動していない。

### 1.2 問題点・課題

- `execute` phase で Write/Edit ツールが呼ばれても、**対象パスが skill ルート外でも deny されない**。
- `RuntimeSkillCreatorFacade.createExecuteGovernanceCanUseTool()` が `canUseTool(toolName, "execute")` を context なしで呼んでいる。
- SDK callback の `input` 引数から `targetPath` を抽出する配線コードが存在しない。

```typescript
// 現在の実装（配線なし）
private createExecuteGovernanceCanUseTool() {
  return async (
    toolName: string,
    _input: Record<string, unknown>,  // ← 使っていない
    options: { toolUseID: string },
  ) => {
    const decision = evaluateGovernanceToolUse(toolName, "execute");
    // ↑ context 引数なし → path-scoped 判定が発動しない
    ...
  };
}
```

### 1.3 放置した場合の影響

- skill-creator が意図せずスキルルート外のファイルを書き換えるリスクが残る（セキュリティホール）。
- TASK-P0-09 の AC-2 が PARTIAL 判定のまま残り、将来の仕様参照者に誤解を与える。
- 将来の phase 追加時に同様の配線漏れが再発するパターンが固定化される。

---

## 2. 何を達成するか（What）

### 2.1 目的

`execute`（および `improve`）の SDK callback を `canUseTool(toolName, phase, context)` に接続し、path-scoped deny を runtime で実効化する。

### 2.2 最終ゴール

1. `execute` phase での Write/Edit 呼び出し時に `input.file_path`（または `input.path`）を `targetPath` として抽出し、`allowedSkillRoot` 外であれば `deny` を返す。
2. 既存 90 件 governance tests が全 PASS を維持する。
3. path-scoped enforcement に関する統合テストが追加されて PASS する。

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.createExecuteGovernanceCanUseTool()` への `targetPath` 抽出と context 接続
- path-scoped enforcement に関するテスト追加
- `improve` phase の canUseTool context 接続（オプション、同 PR で対応可）

#### 含まないもの

- `SkillCreatorPermissionPolicy.evaluateContextPolicy()` の改変（実装済み・テスト済みのため）
- renderer 側 governance 表示 UI（将来スコープ）
- audit 永続化（将来スコープ）
- `plan` / `verify` phase への path 制約追加（read-only のため不要）

### 2.4 成果物

| 成果物                               | パス                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| 修正: `RuntimeSkillCreatorFacade.ts` | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`               |
| 追加テスト                           | `apps/desktop/src/main/services/runtime/__tests__/governance/` 内の統合テストに追記 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-P0-09 が完了していること（governance module 実装済み）
- `SkillCreatorPermissionPolicy.canUseTool()` の context-aware 判定が単体テスト済みであること
- `evaluateGovernanceToolUse` が `canUseTool` の alias として `governance/index.ts` からエクスポート済みであること

### 3.2 依存タスク

- TASK-P0-09（claude-sdk-permission-hooks-governance）: **完了済み**

### 3.3 必要な知識

- Claude Agent SDK の `canUseTool` callback シグネチャ:
  `(toolName: string, input: Record<string, unknown>, options: { toolUseID: string }) => Promise<{ behavior: "allow" | "deny", ... }>`
- `CanUseToolContext` インターフェース（`SkillCreatorPermissionPolicy.ts` 定義済み）:
  ```typescript
  export interface CanUseToolContext {
    targetPath?: string;
    allowedSkillRoot?: string;
  }
  ```
- `allowedSkillRoot` の取得方法: `this.getExplicitSkillCreatorRoot()` または `execute()` の引数から渡す

### 3.4 推奨アプローチ

```typescript
// 修正後イメージ
private createExecuteGovernanceCanUseTool(skillRoot: string) {
  return async (
    toolName: string,
    input: Record<string, unknown>,
    options: { toolUseID: string },
  ) => {
    const targetPath =
      (input?.file_path as string | undefined) ??
      (input?.path as string | undefined);
    const decision = evaluateGovernanceToolUse(toolName, "execute", {
      targetPath,
      allowedSkillRoot: skillRoot,
    });
    this.auditSink.record({
      sessionId: options.toolUseID,
      eventType: "pre_tool_use",
      toolName,
      decision: decision.behavior,
      reason: decision.reason,
    });
    return decision;
  };
}
```

---

## 4. 実行手順

### Phase 1: 現状調査・要件定義

**目的**: 接続すべき箇所と影響範囲を確定する

**調査事項**:

- `RuntimeSkillCreatorFacade.ts` の `createExecuteGovernanceCanUseTool()` の現在のシグネチャ確認
- `execute()` メソッドで `skillRoot` を取得できるか確認
- SDK `canUseTool` callback の `input` の実際の型を確認

**成果物**: `outputs/phase-1/gap-analysis.md`

---

### Phase 2: 設計

**目的**: 変更箇所と影響範囲を設計する

**設計事項**:

- `createExecuteGovernanceCanUseTool(skillRoot: string)` のシグネチャ変更
- `input` からの `targetPath` 抽出ロジック
- `improve` phase への同様の接続設計（別メソッドか共通 helper か）

**成果物**: `outputs/phase-2/design.md`

---

### Phase 3: 設計レビュー

**目的**: 変更が既存テスト・型安全性を損なわないか確認する

**レビュー観点**:

- 既存 90 件テストへの影響
- `CanUseToolContext` の型整合
- セキュリティ要件の充足

**成果物**: `outputs/phase-3/design-review-result.md`

---

### Phase 4: テスト作成（TDD Red）

**目的**: 失敗するテストを先に書く

**テストケース**:

- `TC-PATH-01`: skill root 外の Write → `deny` が返る
- `TC-PATH-02`: skill root 内の Write → `allow` が返る
- `TC-PATH-03`: context なし（input にパスがない）→ tool-level 判定のみ

**成果物**: 失敗するテスト（`__tests__/governance/` 内）

---

### Phase 5: 実装（Green）

**目的**: テストを通す実装を行う

**変更ファイル**:

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**完了条件**: Phase 4 のテスト全 PASS、既存 90 件テスト全 PASS

---

### Phase 6: テスト拡充

**目的**: エッジケースを追加してカバレッジを向上させる

**追加ケース**:

- `TC-PATH-04`: `input.path` キー（`file_path` なし）からの抽出
- `TC-PATH-05`: `improve` phase での path-scoped deny
- `TC-PATH-06`: skill root が未設定（empty string）の場合の動作

---

### Phase 7: カバレッジ確認

**目的**: 追加テストでカバレッジが目標に達したか確認する

**目標**: `RuntimeSkillCreatorFacade.ts` の branch coverage 80%+

**コマンド**: `cd apps/desktop && npx vitest run --coverage src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

---

### Phase 8: リファクタリング

**目的**: コードの可読性・保守性を向上させる（テストは引き続き PASS）

**観点**:

- `createExecuteGovernanceCanUseTool` と `createImproveGovernanceCanUseTool` で重複があれば共通 helper に切り出す
- `targetPath` 抽出ロジックを分離する場合は `extractTargetPath(input)` ユーティリティ関数として定義

---

### Phase 9: 品質保証

**目的**: lint / typecheck / 全テストが通ることを確認する

```bash
pnpm --filter @repo/desktop lint --quiet
pnpm --filter @repo/desktop typecheck
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

---

### Phase 10: 最終レビュー

**目的**: 設計・実装・テストが仕様を満たしているかレビューゲートを通過する

**チェック項目**:

- [ ] path-scoped deny が runtime で機能する
- [ ] 既存 90 件テスト全 PASS
- [ ] 新規テスト全 PASS
- [ ] typecheck / lint PASS

---

### Phase 11: 動作確認

**目的**: テスト証跡を記録する

**分類**: NON_VISUAL（Main プロセス非 UI コンポーネント）

**代替根拠**: Phase 9 の自動テスト結果（`npx vitest run` の stdout）

**成果物**: `outputs/phase-11/auto-test-result.txt`, `outputs/phase-11/manual-test-result.md`

---

### Phase 12: ドキュメント更新

**目的**: 実装結果を記録し、次の担当者に引き継ぐ

**必須成果物**:

- `outputs/phase-12/implementation-guide.md` — 中学生レベル説明 + TypeScript 型定義・API シグネチャ・エラーハンドリング・設定パラメータ
- `outputs/phase-12/system-spec-update-summary.md` — Step 1-A〜1-G / Step 2
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

**中学生レベルの概念説明**（Phase 12 implementation-guide Part 1 に記述）:

> 「学校の入り口に守衛さんがいます。守衛さんは『どの生徒がどの教室に入ってよいか』のルールブックを持っています（PermissionPolicy）。でも今は守衛さんが『あなたは教室に入っていいよ』とは言うけれど、『その教室は本当に君の担当教室？』と確認していません。このタスクでは、守衛さんが入室許可を出す前に『担当の教室番号（skillRoot）と、行こうとしている教室番号（targetPath）が一致するか』を必ず確認するように改善します。」

---

### Phase 13: PR 作成

**目的**: レビュー依頼を出す

**PR タイトル**: `feat(governance): TASK-P0-09-U1 path-scoped runtime enforcement 実配線`

**PR ラベル**: `priority:high`, `scale:small`, `type:security`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `execute` phase で skill root 外への Write/Edit が `deny` される
- [ ] `execute` phase で skill root 内への Write/Edit が `allow` される
- [ ] context が取得できない場合（`targetPath` なし）は tool-level 判定のみ（後方互換）
- [ ] 既存 90 件 governance tests が全 PASS

### 品質要件

- [ ] TypeScript 型エラーなし（typecheck EXIT:0）
- [ ] lint エラーなし（lint EXIT:0 / warnings のみ許容）
- [ ] branch coverage 80%+（`RuntimeSkillCreatorFacade.ts`）

### ドキュメント要件

- [ ] `outputs/phase-12/implementation-guide.md` が中学生レベル説明を含む
- [ ] Phase 12 全 6 成果物が揃っている

---

## 6. 検証方法

```bash
# 全 governance テスト実行
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint --quiet

# カバレッジ
cd apps/desktop && npx vitest run --coverage src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                       |
| -------------------------------------------------- | ------ | -------- | ---------------------------------------------------------- |
| SDK バージョンアップで `input` キー名が変わる      | 高     | 低       | `file_path ?? path` fallback パターンで吸収                |
| `skillRoot` が取得できない場合に false deny が発生 | 高     | 低       | `skillRoot` が空/undefined の場合は context なし扱いにする |
| `improve` phase の接続漏れ                         | 中     | 中       | Phase 5 実装時にチェックリストで `improve` も確認          |
| 既存テストの破壊                                   | 高     | 低       | Phase 4 前に全テストが PASS していることを確認してから着手 |

---

## 8. 参照情報

| 資料                              | パス                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| TASK-P0-09 実装記録               | `docs/30-workflows/completed-tasks/task-p0-09-sdk-permission-hooks-governance/`               |
| `RuntimeSkillCreatorFacade.ts`    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                         |
| `SkillCreatorPermissionPolicy.ts` | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts`           |
| governance テスト                 | `apps/desktop/src/main/services/runtime/__tests__/governance/`                                |
| 関連フル仕様書                    | `docs/30-workflows/unassigned-task/TASK-P0-09-U1-governance-actual-enforcement-completion.md` |
