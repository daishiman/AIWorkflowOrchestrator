# Claude Code SDK permission / hooks / audit ガバナンス - タスク指示書

## メタ情報

```yaml
issue_number: 1894
task_id: TASK-P0-09
task_name: Claude Code SDK permission / hooks / audit ガバナンス
category: セキュリティ・新機能（Feature Gap系）
target_feature: Skill Creator Agent SDK Lane - SDK実行ガバナンス
priority: 中
scale: 大規模
status: 未実施
source: P0是正パック（Feature Gap分析：SDK実行の安全境界が未固定）
created_date: 2026-04-04
step: 10
dependencies:
  - TASK-RT-06 # SDKメッセージ契約正規化（先行必須）
  - TASK-P0-03 # manifest配置（先行必須）
  - TASK-P0-04 # ManifestLoader有効化（先行必須）
subtasks:
  - TASK-P0-09-U1-governance-actual-enforcement-completion
  - TASK-P0-09-U1-path-scoped-governance-runtime-enforcement
related_tasks:
  - UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001
```

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-P0-09                                                 |
| 優先度     | 中                                                         |
| 規模       | 大規模                                                     |
| ステータス | 未実施                                                     |
| 発見元     | P0是正パック（Feature Gap分析：SDK実行の安全境界が未固定） |
| 発見日     | 2026-04-04                                                 |
| Step       | 10（RT-06/P0-03/P0-04 後に直列実行）                       |
| 依存タスク | TASK-RT-06, TASK-P0-03, TASK-P0-04                         |

> **依存関係の注意**:
>
> - TASK-RT-06（SDKメッセージ契約正規化）が完了してから本タスクを開始すること。
>   RT-06 は Facade 手前の SDK メッセージ契約を正規化する責務を持ち、P0-09 はその上に
>   permission / hooks 境界を重ねる位置付けである。
> - TASK-P0-03（manifest配置）および TASK-P0-04（ManifestLoader有効化）が完了していること。
>   ManifestLoader が有効化されていない状態では、phase 別 policy の設定基盤が不安定となる。

---

## 1. Why

### 1.1 背景

Claude Code SDK の `query()` を用いた Skill Creator 実行において、SDK 実行の安全境界が未固定の状態である。
具体的には以下の3つの軸でガバナンス境界が確立されていない：

1. **permission（allowedTools / permissionMode）の未固定**
   - phase 別（requirements-gathering / plan / execute / verify / improve）の許可ツールセットが
     ハードコードまたは未設定のまま SDK に渡されている。
   - SDK 側の `permissionMode` が phase ごとに適切に切り替わらない。

2. **hooks の未整備**
   - Skill Creator 実行専用の pre-execute / post-execute hooks が設計されていない。
   - SDK セッション単位の lifecycle イベント（onSessionStart / onPreToolUse / onPostToolUse / onSessionEnd）が
     audit 記録に接続されていない。

3. **audit 記録の欠如**
   - どのツールを何回呼んだか、どの phase でどの判定が下されたかを記録する機構がない。
   - 運用後のインシデント調査や policy チューニングに必要な履歴が残らない。

### 1.2 問題点・課題

- SDK の `query()` 実行時に、Facade 手前での permission / hooks 契約の正規化が実装されていない。
- TASK-RT-06 が先行して SDK メッセージ契約を正規化するが、permission / hooks 境界は P0-09 の責務として
  切り分けられており、現在は未着手のままである。
- サブタスク（TASK-P0-09-U1）が先行して定義されているが、それらは本タスク（P0-09）の完了を前提として
  carry-forward されたものであり、P0-09 本体の実装が先に必要である。

### 1.3 放置した場合の影響

- Skill Creator が意図せずスキルルート外のファイルを操作するリスクが残る。
- SDK 実行の監査証跡がなく、セキュリティインシデント発生時に原因追跡ができない。
- phase 別の tool 許可境界が明確でないため、将来の phase 追加時に実装漏れが体系的に発生する。

---

## 2. What

### 2.1 目的

SDK `query()` 実行前に、Facade 手前で permission / hooks 契約を正規化し、
phase 別の安全境界を runtime で実効化する。
また audit 記録の基盤を整備し、Skill Creator 実行の可観測性を確保する。

### 2.2 最終ゴール

1. phase 別の `permissionMode` と `allowedTools` / `disallowedTools` が正しく SDK に渡される。
2. Skill Creator 専用の hooks（pre-execute / post-execute / onSessionStart / onSessionEnd）が
   SDK lifecycle に接続される。
3. ツール呼び出し履歴（audit ログ）が session 単位で記録される。
4. Facade 手前での permission / hooks 契約の正規化レイヤーが実装される。
5. サブタスク（TASK-P0-09-U1）の前提条件が整う。

### 2.3 スコープ

#### P0-09 メインタスクの責務

| 責務                                        | 実装対象                          |
| ------------------------------------------- | --------------------------------- |
| phase 別 permissionMode / allowedTools 定義 | `SkillCreatorPermissionPolicy.ts` |
| Skill Creator 専用 hooks の設定             | `SkillCreatorHooksFactory.ts`     |
| audit レコードの基本実装                    | `SkillCreatorAuditSink.ts`        |
| Facade 手前での permission / hooks 正規化   | `RuntimeSkillCreatorFacade.ts`    |

#### TASK-P0-09-U1 サブタスクの責務（P0-09 完了後に実施）

| サブタスク                                   | 責務                                                       |
| -------------------------------------------- | ---------------------------------------------------------- |
| `governance-actual-enforcement-completion`   | `execute` / `improve` phase での canUseTool 実配線         |
| `path-scoped-governance-runtime-enforcement` | `targetPath` / `allowedSkillRoot` の SDK callback への接続 |

> **P0-09 と U1 の関係**:
> P0-09 は governance の基盤（policy 定義・hooks 設計・audit 基盤）を整備する。
> U1 はその基盤を使い、runtime での path-scoped 制約を実際に有効化する carry-forward タスクである。
> U1 を先に実施しても基盤がなければ動作しないため、P0-09 → U1 の順序を厳守すること。

#### 含むもの（P0-09 の実装スコープ）

- phase 別の permissionMode / allowedTools 定義と SDK への適用
- Skill Creator 実行専用 hooks の設定（pre-execute / post-execute 等）
- audit レコードの基本実装（ツール呼び出し履歴）
- Facade 手前での permission / hooks 契約正規化レイヤー

#### 含まないもの（他タスクの責務）

- SDK メッセージ正規化レイヤー（TASK-RT-06 の責務）
- manifest 配置（TASK-P0-03 の責務）
- ManifestLoader 有効化（TASK-P0-04 の責務）
- RuntimePolicyResolver 全体の再設計（TASK-SDK-07 で実装済み）
- path-scoped enforcement の実配線（TASK-P0-09-U1 の責務）

### 2.4 成果物

| 成果物                                        | パス                                                                                |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| 新規・修正: `SkillCreatorPermissionPolicy.ts` | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts` |
| 新規・修正: `SkillCreatorHooksFactory.ts`     | `apps/desktop/src/main/services/runtime/governance/SkillCreatorHooksFactory.ts`     |
| 新規: `SkillCreatorAuditSink.ts`              | `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts`        |
| 修正: `RuntimeSkillCreatorFacade.ts`          | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`               |
| テスト                                        | `apps/desktop/src/main/services/runtime/__tests__/governance/`                      |

---

## 3. How

### 3.1 前提条件

- TASK-RT-06（SDKメッセージ契約正規化）が完了していること
- TASK-P0-03（manifest配置）が完了していること
- TASK-P0-04（ManifestLoader有効化）が完了していること
- `RuntimePolicyResolver.ts` が実装済みであること（TASK-SDK-07 完了済み）
- `SkillCreatorWorkflowEngine.ts` の phase 遷移ロジックが把握されていること

### 3.2 依存タスク

| タスクID    | 内容                      | ステータス       |
| ----------- | ------------------------- | ---------------- |
| TASK-RT-06  | SDKメッセージ契約正規化   | 依存（先行必須） |
| TASK-P0-03  | manifest配置              | 依存（先行必須） |
| TASK-P0-04  | ManifestLoader有効化      | 依存（先行必須） |
| TASK-SDK-07 | RuntimePolicyResolver実装 | 完了済み         |

### 3.3 必要な知識

- Claude Agent SDK の `query()` API と `permissionMode` / `allowedTools` / `canUseTool` オプション
- `SkillCreatorWorkflowEngine.ts` の phase 遷移（plan → execute → verify → improve）
- `RuntimeSkillCreatorFacade.ts` の `createGovernanceHooks()` パターン
- `CanUseToolContext` インターフェースと `evaluateContextPolicy()` の設計

### 3.4 設計判断の指針

**hooks の設定：manifest 側 vs コード側固定**

- 基本的な hooks 定義はコード側（`SkillCreatorHooksFactory.ts`）に固定する。
- phase 別の設定値（allowedTools など）は policy テーブル（`SkillCreatorPermissionPolicy.ts`）で管理し、
  manifest から上書き可能な設計を将来的に考慮するが、P0-09 時点ではコード側固定を採用する。

**audit 記録の軽量実装**

- in-memory のリングバッファ（最大 N 件）を採用し、パフォーマンスへの影響を最小化する。
- 永続化（ファイル書き込み / DB）は将来スコープとし、P0-09 では session 単位のメモリ記録のみ実装する。

---

## 4. 実行手順

### Phase 構成概要

| Phase | 内容                                     | 主な成果物                          |
| ----- | ---------------------------------------- | ----------------------------------- |
| 1     | 現状調査（サブタスク状況確認）           | 現状ギャップ分析レポート            |
| 2     | phase 別 allowedTools 設計               | policy テーブル設計書               |
| 3     | hooks 設定（`SkillCreatorHooksFactory`） | hooks 設計書                        |
| 4     | audit 実装（`SkillCreatorAuditSink`）    | audit 基盤実装                      |
| 5     | Facade 手前正規化                        | `RuntimeSkillCreatorFacade.ts` 修正 |
| 6     | テスト                                   | ユニットテスト・統合テスト          |
| 7     | 完了処理                                 | ドキュメント更新・PR 作成           |

---

### Phase 1: 現状調査（サブタスク状況確認）

#### 目的

現在の governance 実装の状態と、TASK-P0-09-U1 サブタスク群の状況を調査し、
P0-09 本体として実装すべき差分を確定する。

#### 手順

1. `apps/desktop/src/main/services/runtime/governance/` の全ファイルを確認する。
   - `SkillCreatorPermissionPolicy.ts`: phase 別 policy テーブルの実装状況
   - `SkillCreatorHooksFactory.ts`: hooks の実装状況
   - `SkillCreatorAuditSink.ts`: audit 記録の実装状況（ファイルが存在しない場合は新規作成対象）
2. `RuntimeSkillCreatorFacade.ts` の governance 関連実装を確認する。
   - `createGovernanceHooks()` の実装
   - `query()` 呼び出し前の permission / hooks 正規化の有無
3. TASK-P0-09-U1 サブタスクファイルを確認し、carry-forward された未実装箇所を特定する。
   - `TASK-P0-09-U1-governance-actual-enforcement-completion.md`
   - `TASK-P0-09-U1-path-scoped-governance-runtime-enforcement.md`
4. `RuntimeSkillCreatorFacade.ts` の `createExecuteGovernanceCanUseTool()` において
   `_input` が未使用（context なし）であることを確認する。
5. 現状ギャップ（実装済み / 未実装 / 部分実装）を一覧表として整理する。

#### 成果物

- 現状ギャップ分析レポート（実装済み / 未実装 / 部分実装の一覧）
- P0-09 本体実装対象ファイルリスト

#### 完了条件

- [ ] governance ディレクトリ全ファイルの実装状況が把握されている
- [ ] TASK-P0-09-U1 サブタスクの carry-forward 内容が確認されている
- [ ] P0-09 本体で実装すべき差分が確定している

---

### Phase 2: phase 別 allowedTools 設計

#### 目的

requirements-gathering / plan / execute / verify / improve の各 phase で
許可・拒否するツールセットと `permissionMode` を設計し、policy テーブルとして確定する。

#### 手順

1. 各 phase のユースケースを整理する：
   - `requirements-gathering`: 情報収集のみ。Read 系ツールのみ許可。
   - `plan`: 設計書の読み書き。Read 系 + Write（設計書ファイルのみ）。
   - `execute`: スキルコードの生成・編集。Write / Edit 系を許可（スキルルート内に限定）。
   - `verify`: テスト実行・結果確認。Bash（テスト実行）+ Read 系。
   - `improve`: 改善点の修正。Edit 系（既存ファイルのみ）。

2. 各 phase の `permissionMode` を確定する：
   - `default`: 変更操作を都度確認（要承認フロー）
   - `acceptEdits`: 編集操作を自動承認
   - `bypassPermissions`: 全操作を自動承認（通常は使用禁止）

3. `DESTRUCTIVE_TOOLS`（全 phase で disallow）のリストを確定する。

4. 既存の `SkillCreatorPermissionPolicy.ts` の policy テーブルと比較し、
   不足・誤りを特定する。

5. policy テーブルの変更差分を設計書として記録する。

#### 設計指針（phase 別 policy 案）

```typescript
// 参考：既存実装の policy テーブル（現状確認後に更新すること）
const POLICY_TABLE = {
  "requirements-gathering": {
    permissionMode: "default",
    allowedTools: [...READ_TOOLS],
    disallowedTools: ["Write", "Edit", ...DESTRUCTIVE_TOOLS],
  },
  plan: {
    permissionMode: "default",
    allowedTools: [...READ_TOOLS],
    disallowedTools: ["Write", "Edit", ...DESTRUCTIVE_TOOLS],
  },
  execute: {
    permissionMode: "acceptEdits",
    allowedTools: [...WRITE_TOOLS],
    disallowedTools: [...DESTRUCTIVE_TOOLS],
  },
  verify: {
    permissionMode: "default",
    allowedTools: [...TEST_TOOLS],
    disallowedTools: ["Write", "Edit", ...DESTRUCTIVE_TOOLS],
  },
  improve: {
    permissionMode: "acceptEdits",
    allowedTools: [...IMPROVE_TOOLS],
    disallowedTools: ["Write", ...DESTRUCTIVE_TOOLS],
  },
};
```

#### 成果物

- policy テーブル設計書（phase 別 allowedTools / disallowedTools / permissionMode）

#### 完了条件

- [ ] 全 5 phase の policy が確定している
- [ ] `DESTRUCTIVE_TOOLS` のリストが確定している
- [ ] 既存実装との差分が明確になっている

---

### Phase 3: hooks 設定（SkillCreatorHooksFactory）

#### 目的

Skill Creator 実行専用の lifecycle hooks を設計・実装する。

#### 手順

1. `SkillCreatorHooksFactory.ts` の現在の実装を確認する。
2. 以下の lifecycle hooks の設計を確定する：
   - `onSessionStart(params)`: SDK セッション開始時のログ記録
   - `onPreToolUse(params)`: ツール呼び出し前の governance チェック・ログ記録
   - `onPostToolUse(params)`: ツール呼び出し後の結果記録
   - `onSessionEnd(params)`: SDK セッション終了時のサマリー記録
3. `createGovernanceHooks(phase)` が各 phase 対応の hooks インスタンスを返す設計を確認・修正する。
4. hooks が `SkillCreatorAuditSink`（Phase 4 で実装）に結果を記録するインターフェースを設計する。
5. hooks の設定をコード側に固定する理由（manifest 側に持たない理由）をコードコメントに記録する。

#### 設計指針（hooks 構造案）

```typescript
// SkillCreatorGovernanceHooks インターフェース
interface SkillCreatorGovernanceHooks {
  onSessionStart(params: {
    sessionId: string;
    phase: SkillCreatorGovernancePhase;
  }): void;
  onPreToolUse(params: {
    toolName: string;
    input: Record<string, unknown>;
    toolUseID: string;
  }): { allowed: boolean; reason?: string };
  onPostToolUse(params: {
    toolName: string;
    toolUseID: string;
    result: unknown;
  }): void;
  onSessionEnd(params: {
    sessionId: string;
    outcome: "success" | "failure" | "aborted";
  }): void;
}
```

#### 成果物

- 修正済み `SkillCreatorHooksFactory.ts`

#### 完了条件

- [ ] 全 lifecycle hooks の設計が確定している
- [ ] `createGovernanceHooks(phase)` が正しく実装されている
- [ ] audit sink との接続インターフェースが設計されている

---

### Phase 4: audit 実装（SkillCreatorAuditSink）

#### 目的

ツール呼び出し履歴（audit ログ）を session 単位で記録する軽量な audit 基盤を実装する。

#### 手順

1. `SkillCreatorAuditSink.ts` の実装方針を確定する：
   - in-memory のリングバッファ（最大件数: デフォルト 200 件）を採用する。
   - `record(entry: AuditEntry)` メソッドで記録する。
   - `getSessionSummary()` メソッドで session 単位のサマリーを返す。
   - `clear()` メソッドで session 終了時のリセットを可能にする。
2. `AuditEntry` の型定義を確定する：

   ```typescript
   interface AuditEntry {
     timestamp: number;
     sessionId: string;
     phase: SkillCreatorGovernancePhase;
     toolName: string;
     toolUseID: string;
     decision: "allow" | "deny";
     reason?: string;
     targetPath?: string;
   }
   ```

3. パフォーマンスへの影響を最小化するため、同期処理のみで実装する（非同期 I/O は使用しない）。
4. 永続化（ファイル書き込み / DB）は実装しない（将来スコープとして TODO コメントを残す）。
5. `SkillCreatorAuditSink.ts` を新規作成し、`governance/index.ts` からエクスポートする。

#### 成果物

- 新規 `SkillCreatorAuditSink.ts`
- 更新済み `governance/index.ts`

#### 完了条件

- [ ] `SkillCreatorAuditSink` が in-memory で audit 記録を管理できる
- [ ] `AuditEntry` の型定義が確定している
- [ ] `governance/index.ts` からエクスポートされている

---

### Phase 5: Facade 手前正規化（RuntimeSkillCreatorFacade）

#### 目的

`RuntimeSkillCreatorFacade.ts` において、SDK `query()` 呼び出し前に
permission / hooks 契約を正規化するレイヤーを実装する。

#### 手順

1. `RuntimeSkillCreatorFacade.ts` の現在の `query()` 呼び出し箇所を全て特定する。
2. 各 phase の `query()` 呼び出し前に、以下を正規化する：
   - `permissionMode`: phase 別 policy テーブルから取得した値を設定する
   - `allowedTools`: phase 別 policy テーブルから取得した値を設定する
   - `disallowedTools`: phase 別 policy テーブルから取得した値を設定する
   - `canUseTool`: governance hooks の `onPreToolUse` を経由する callback を設定する
3. `createGovernanceHooks(phase)` を各 phase の `query()` 呼び出し前に実行し、
   lifecycle hooks を SDK に渡す。
4. `SkillCreatorAuditSink` のインスタンスを Facade で保持し、
   `onPreToolUse` / `onPostToolUse` で audit 記録に接続する。
5. 正規化レイヤーを独立したプライベートメソッド（`createSdkGovernanceOptions(phase)`）として
   切り出し、全 phase で再利用可能にする。

#### 設計指針（正規化レイヤーの構造案）

```typescript
// 各 phase の query() 呼び出し時に使用する governance オプションを生成
private createSdkGovernanceOptions(
  phase: SkillCreatorGovernancePhase,
  allowedSkillRoot?: string,
): SdkGovernanceOptions {
  const policy = getPolicy(phase);
  const hooks = this.createGovernanceHooks(phase);

  return {
    permissionMode: policy.permissionMode,
    allowedTools: policy.allowedTools,
    disallowedTools: policy.disallowedTools,
    canUseTool: async (toolName, input, options) => {
      const decision = hooks.onPreToolUse({
        toolName,
        input,
        toolUseID: options.toolUseID,
      });
      if (decision.allowed) {
        return { behavior: "allow", toolUseID: options.toolUseID };
      }
      return { behavior: "deny", message: decision.reason, toolUseID: options.toolUseID };
    },
  };
}
```

#### 成果物

- 修正済み `RuntimeSkillCreatorFacade.ts`

#### 完了条件

- [ ] 全 phase の `query()` 呼び出しで permission / hooks が正規化されている
- [ ] `createSdkGovernanceOptions(phase)` が全 phase で再利用されている
- [ ] audit sink が hooks 経由で記録を受け取っている

---

### Phase 6: テスト

#### 目的

Phase 2〜5 で実装した governance 基盤のユニットテストと統合テストを作成・実行する。

#### 手順

1. `SkillCreatorPermissionPolicy.ts` のテスト（既存・新規）を実行する：
   - 各 phase の allowedTools / disallowedTools / permissionMode が正しいこと
   - `canUseTool()` が phase 別に正しく判定すること
   - `evaluateContextPolicy()` が targetPath の検証を正しく行うこと

2. `SkillCreatorHooksFactory.ts` のテストを追加・実行する：
   - `createGovernanceHooks(phase)` が phase 別に適切な hooks を返すこと
   - lifecycle hooks が正しいシグネチャで動作すること

3. `SkillCreatorAuditSink.ts` のテストを作成・実行する：
   - `record()` が最大件数を超えたときにリングバッファが機能すること
   - `getSessionSummary()` が正しいサマリーを返すこと
   - `clear()` でバッファがリセットされること

4. `RuntimeSkillCreatorFacade.ts` の統合テストを追加・実行する：
   - 各 phase の `query()` 呼び出し前に正しい governance オプションが設定されること
   - `execute` phase で allowedTools 外のツール呼び出しが deny されること

5. 全テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/desktop lint
   ```

#### 成果物

- governance ユニットテスト一式
- 統合テスト（`RuntimeSkillCreatorFacade.governance.test.ts`）
- テスト実行結果レポート

#### 完了条件

- [ ] 全ユニットテストが PASS している
- [ ] 統合テストが PASS している
- [ ] `pnpm typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし

---

### Phase 7: 完了処理

#### 目的

実装の完全性を最終確認し、ドキュメントを更新し、PR を作成する。

#### 手順

1. 完了条件チェックリスト（セクション 5）を全項目確認する。
2. TASK-P0-09-U1 サブタスクの前提条件（governance 基盤の実装完了）が
   整っていることを確認し、サブタスクファイルを更新する。
3. 以下のドキュメントを更新する：
   - 本仕様書のステータスを「完了」に更新する
   - `task-00-master-task-list.md` の P0-09 ステータスを更新する
4. PR を作成する：
   - タイトル: `feat(governance): TASK-P0-09 SDK permission / hooks / audit ガバナンス基盤実装`
   - 本文に: phase 別 policy テーブル確立・audit sink 実装・Facade 正規化レイヤー追加を記載
5. CI が全 PASS であることを確認する。
6. PR マージ後、TASK-P0-09-U1 サブタスクを次のスプリントに割り当てる。

#### 成果物

- 更新済み本仕様書
- 更新済み `task-00-master-task-list.md`
- GitHub PR

#### 完了条件

- [ ] 全完了条件チェックリストが PASS している
- [ ] TASK-P0-09-U1 サブタスクの前提条件が整っている旨が記録されている
- [ ] PR が作成され CI が全 PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] phase 別（requirements-gathering / plan / execute / verify / improve）の
      `permissionMode` が SDK に正しく渡される
- [ ] phase 別の `allowedTools` / `disallowedTools` が SDK に正しく渡される
- [ ] `createGovernanceHooks(phase)` が全 5 phase に対応している
- [ ] `SkillCreatorAuditSink` が session 単位でツール呼び出し履歴を記録する
- [ ] `RuntimeSkillCreatorFacade.ts` の全 phase `query()` 呼び出し前に
      permission / hooks 契約が正規化されている
- [ ] DESTRUCTIVE_TOOLS（全 phase で disallow されるべきツール）が全 phase でブロックされる

### 品質要件

- [ ] 全ユニットテストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `SkillCreatorAuditSink` の branch coverage が 80% 以上

### ドキュメント要件

- [ ] 本仕様書のステータスが「完了」になっている
- [ ] `task-00-master-task-list.md` の P0-09 ステータスが更新されている
- [ ] TASK-P0-09-U1 サブタスクの前提条件が整っている旨が記録されている

---

## 6. 検証方法

### テストコマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# governance 関連テストのみ実行
pnpm --filter @repo/desktop test -- --grep "governance"
```

### 動作確認テストケース

| テストケース                                              | 期待結果                                            |
| --------------------------------------------------------- | --------------------------------------------------- |
| `plan` phase / Write ツール呼び出し                       | `deny`（allowedTools に含まれない）                 |
| `execute` phase / Write ツール呼び出し（allowedTools 内） | `allow`                                             |
| `execute` phase / DESTRUCTIVE_TOOLS 呼び出し              | `deny`（disallowedTools）                           |
| `verify` phase / Edit ツール呼び出し                      | `deny`（allowedTools に含まれない）                 |
| `improve` phase / Write ツール呼び出し                    | `deny`（disallowedTools）                           |
| audit sink / record() を 200 件超えた場合                 | 古いエントリが破棄（リングバッファ動作）            |
| `getGovernanceState()` IPC 呼び出し                       | 現在の phase・直近の denial・session サマリーを返す |

---

## 7. リスクと対策

| リスク                                                                       | 影響度 | 発生確率 | 対策                                                                                                               |
| ---------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| Phase 別 allowedTools の設計が既存の `RuntimePolicyResolver` と競合する      | 高     | 中       | `RuntimePolicyResolver.ts` の実装を Phase 1 で確認し、重複・競合を特定してから設計を開始する                       |
| hooks の設定をコード側に固定することで将来の manifest 駆動設定への移行が困難 | 中     | 低       | コードコメントに「将来の manifest 上書き可能設計への移行ポイント」を明示しておく                                   |
| audit sink の in-memory 実装がメモリリークを引き起こす                       | 高     | 低       | リングバッファの最大件数を設定し、session 終了時に `clear()` を確実に呼ぶことを hooks の `onSessionEnd` で保証する |
| TASK-RT-06 が完了していない状態で P0-09 を先行実装した場合、後から衝突が発生 | 高     | 中       | TASK-RT-06 の完了を Phase 1 開始前に必ず確認する。未完の場合は待機する                                             |
| サブタスク（TASK-P0-09-U1）との実装重複                                      | 中     | 中       | Phase 1 で U1 サブタスクの carry-forward 内容を確認し、P0-09 本体の実装スコープを明確に分離する                    |

---

## 8. 参照情報

### 関連ファイル

| ファイル                          | パス                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.ts`    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`               |
| `SkillCreatorWorkflowEngine.ts`   | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`              |
| `SkillCreatorPermissionPolicy.ts` | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts` |
| `SkillCreatorHooksFactory.ts`     | `apps/desktop/src/main/services/runtime/governance/SkillCreatorHooksFactory.ts`     |
| `SkillCreatorAuditSink.ts`        | `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts`        |
| `governance/index.ts`             | `apps/desktop/src/main/services/runtime/governance/index.ts`                        |
| `RuntimePolicyResolver.ts`        | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                   |

### 関連サブタスク・仕様書

| ドキュメント                                           | パス                                                                                            |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| サブタスク: governance-actual-enforcement-completion   | `docs/30-workflows/unassigned-task/TASK-P0-09-U1-governance-actual-enforcement-completion.md`   |
| サブタスク: path-scoped-governance-runtime-enforcement | `docs/30-workflows/unassigned-task/TASK-P0-09-U1-path-scoped-governance-runtime-enforcement.md` |
| 関連 UT: PHASE11-SCREENSHOT-EVIDENCE                   | `docs/30-workflows/unassigned-task/UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001.md`                 |

### 苦戦箇所と知見

#### 苦戦箇所 1: phase 別 allowedTools 設計

各 phase で許可ツールが本当に異なるべきかどうかの判断が難しい。
特に `requirements-gathering` phase は既存の実装では定義されていない可能性があるため、
Phase 1 の現状調査で実装済みの phase 一覧を確認してから設計を開始すること。

**知見**: `plan` と `requirements-gathering` は同じ policy（Read のみ）で
まとめられることが多い。phase 数を増やすと policy テーブルの管理コストが上がるため、
実際のユースケースと対応する phase 定義を一致させることを優先する。

#### 苦戦箇所 2: hooks vs コード固定の選択

manifest 側に hooks の設定を持たせると、実行時に manifest が破損または欠落した場合に
governance が無効化されるリスクがある。セキュリティ境界はコード側に固定する方が安全。

**知見**: hooks の基本動作はコード側に固定し、policy テーブルの値（allowedTools の具体的な
リスト）は定数ファイルで管理することで、コードの可読性を保ちながらセキュリティを維持できる。
将来 manifest から上書きする場合も、コード側のデフォルト値を override する設計にすること。

#### 苦戦箇所 3: audit 軽量実装

audit 記録の永続化はパフォーマンスに影響するため、in-memory に留める設計が妥当。
ただし session が長時間続く場合にメモリが膨らむリスクがある。

**知見**: リングバッファの最大件数（例: 200 件）を `AuditSinkOptions` として
constructor で設定可能にし、テスト時は最大件数を小さくして動作確認しやすくする。
将来の永続化は `AuditSink` を interface 化し、`InMemoryAuditSink` と `FileAuditSink` を
差し替えられる設計にすることで対応する。

---

## 9. 備考

### P0-09 と U1 サブタスクの関係

```
TASK-P0-09（本タスク）
  ├─ governance 基盤の設計・実装
  │    ├─ phase 別 policy テーブル確立
  │    ├─ SkillCreatorHooksFactory 整備
  │    ├─ SkillCreatorAuditSink 新規実装
  │    └─ Facade 手前正規化レイヤー実装
  │
  └─ 完了後に TASK-P0-09-U1 へ carry-forward
       ├─ governance-actual-enforcement-completion
       │    └─ execute / improve phase での canUseTool 実配線
       └─ path-scoped-governance-runtime-enforcement
            └─ targetPath / allowedSkillRoot の SDK callback 接続
```

P0-09 が完了した時点で「governance の骨格」は確立されるが、
path-scoped な実行時制約の実配線は U1 サブタスクとして後続処理される。
これは意図的な carry-forward であり、P0-09 の実装を小さく保つための設計判断である。

### 開発環境での注意事項

- `pnpm --filter @repo/desktop test` を実行する前に `pnpm --filter @repo/shared build` を
  完了させること（shared パッケージのビルドが governance テストの依存関係となる場合がある）。
- worktree 環境では Electron を起動しての手動確認は困難なため、
  Phase 6 のテストはユニットテストと統合テストのみで完結させること。
  手動確認が必要な場合は main ブランチへのマージ後に実施し、
  `UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001` として別タスク化する。
