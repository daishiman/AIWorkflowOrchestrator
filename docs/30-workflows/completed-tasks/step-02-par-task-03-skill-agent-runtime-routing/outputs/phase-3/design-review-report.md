# Phase 3 設計レビュー報告

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase        | 3 - 設計レビュー                         |
| 作成日       | 2026-03-14                               |
| ステータス   | completed                                |
| レビュー対象 | Phase 1 要件定義 + Phase 2 設計          |

---

## 総合判定: PASS (MINOR 指摘 1 件)

MAJOR 指摘は 0 件。設計は Phase 4（テスト作成）への handoff に十分な粒度を持っており、後続 Phase への進行を承認する。

MINOR 指摘として、`SkillExecutor.getApiKey()` の扱い（完全廃止か `RuntimeDecision.apiKey` 経由への移行か）の詳細が設計文書に明示されていない点を記録する。この指摘は Phase 5（実装）で解消可能であり、設計上の重大な欠陥ではない。

---

## レビュー観点別 詳細判定

### 観点 1: SkillExecutor と AgentExecutor の双方に direct key read が残らないか

**判定: PASS (MINOR 1 件)**

**根拠:**

Phase 2 設計（design-summary.md Section 2.2）において、`RuntimePolicyResolver.resolve(authMode, apiKey)` が Main Process 側の統一入口として設計されている。Skill 実行経路・Agent 実行経路のいずれも、execute 入口で `RuntimeDecision` を受け取り、`integrated_api` か `terminal_handoff` かに従って分岐する設計になっている。

具体的には以下の設計が明示されている:

- `SkillExecutor.execute(request, skill, runtimeDecision?)` は `runtimeDecision` を受け取り、`integrated_api` 時に SDK query() を呼び出す（contract-matrix.md Section 3.3）
- `AgentExecutor.start(runtimeDecision?)` も同様に `runtimeDecision` を受け取る（contract-matrix.md Section 3.4）
- API key は `RuntimeDecision.apiKey` として Main Process 内を流通し、Renderer に返却されない（contract-matrix.md Section 4: security 境界）

これにより、`SkillExecutor` / `AgentExecutor` が auth-mode を独自に解釈して API key を直接取得するパスはなくなる設計となっている。

**ただし MINOR-01 を記録する:**

Phase 1 要件定義（requirements-definition.md Section 1.1）の現状経路分析では、`SkillExecutor.getApiKey()` が `authKeyService.getKey()` または `process.env.ANTHROPIC_API_KEY` を独自に参照していることが確認されている。Phase 2 設計（contract-matrix.md Section 3.3）では `runtimeDecision?` が Optional 引数として定義されており、「なければ自己解決」という注釈がある。

この「自己解決」パスが実装時に残存する可能性があり、`getApiKey()` の完全廃止か `RuntimeDecision.apiKey` 経由への変更かの方針が設計文書に明示されていない。Phase 5（実装）での判断に委ねることは可能だが、設計段階での明示が望ましい。

---

### 観点 2: internal role が UI 操作として露出しないか

**判定: PASS**

**根拠:**

Phase 2 設計全体にわたり、internal role の UI 非露出が一貫して担保されている。

- design-summary.md Section 3.1 の Internal Role 設計テーブルで「UI 表示名」欄が `作成中...` / `実行中...` / `改善中...` と定義されており、`Planner` / `Executor` / `Improver` のラベルは使用しない
- ui-ux-realization.md Section 8 のマイクロコピー定義で **「Planner / Executor / Improver のコピーを UI に出さない」** と明示されている
- IPC チャンネル名（`creator:plan` / `creator:execute` / `creator:improve`）は Main Process 内のルーティング名であり、Renderer に公開する CTA や表示文言とは分離されている
- Execution Bar の状態定義（ui-ux-realization.md Section 2）においても、job 名（`作成` / `実行` / `改善`）のみが表示対象として定義されている

role の分離はアーキテクチャレベル（Main Process 内のサービス責務）で閉じており、Renderer / Preload を経由しても role 名が漏洩するパスが設計に存在しない。

---

### 観点 3: permission、preflight、streaming の authority が変質していないか

**判定: PASS**

**根拠:**

Phase 1（requirements-definition.md Section 2）で棚卸しされた既存保証と、Phase 2 設計の Authority 配置（design-summary.md Section 4）を照合した結果、全ての authority が変質していないことを確認した。

**preflight authority:**

| 保証                                                | Phase 1 棚卸し | Phase 2 設計                           | 判定 |
| --------------------------------------------------- | -------------- | -------------------------------------- | ---- |
| API key 存在確認                                    | 維持要（✅）   | RuntimePolicyResolver.resolve() で実施 | 維持 |
| API key 取得失敗時エラー表示                        | 維持要（✅）   | AUTHENTICATION_ERROR コード維持        | 維持 |
| preflight が API 不在時に AUTHENTICATION_ERROR 返却 | 維持要（✅）   | PreflightResult.error に継続格納       | 維持 |

auth-mode 分岐が追加されたが、これは「拡張」であり「変質」ではない。preflight の成功/失敗判定ロジックそのものは変更されていない（contract-matrix.md Section 3.2）。

**permission authority:**

| 保証                             | Phase 2 設計                                             | 変更点   |
| -------------------------------- | -------------------------------------------------------- | -------- |
| 危険コマンドブロック（Bash）     | Main: SkillExecutor.createHooks().PreToolUse             | 変更なし |
| 保護パスへの書き込みブロック     | Main: SkillExecutor.createHooks().PreToolUse             | 変更なし |
| ツール許可記憶（rememberChoice） | Main: PermissionStore                                    | 変更なし |
| 権限ダイアログ IPC               | Main → Renderer: SKILL_CHANNELS.SKILL_PERMISSION_REQUEST | 変更なし |
| Agent permission hooks           | HooksFactory.createHooks()                               | 変更なし |

design-summary.md Section 4.2 において、permission authority の全項目が「変更なし」と明記されている。PermissionStore / PermissionResolver の責務は RuntimePolicyResolver の導入によって影響を受けない設計になっている。

**streaming authority:**

| 保証                   | Phase 2 設計                                       | 変更点   |
| ---------------------- | -------------------------------------------------- | -------- |
| Skill streaming        | Main: SKILL_CHANNELS.SKILL_STREAM                  | 変更なし |
| Agent streaming        | Main: IPC_CHANNELS.AGENT_EXECUTION_STREAM          | 変更なし |
| Creator streaming      | Main: `creator:stream`                             | 新規追加 |
| terminal handoff event | Main → Renderer: `skill:handoff` / `agent:handoff` | 新規追加 |
| AbortController        | SkillExecutor / AgentExecutor                      | 変更なし |
| Exponential Backoff    | SkillExecutor.executeWithRetry()                   | 変更なし |

既存の streaming チャンネルは全て変更なし。Creator streaming および terminal handoff event は新規追加であり、既存の Skill / Agent streaming の authority を侵食しない独立した追加設計になっている。

---

### 観点 4: skill-lifecycle Task03 が同じ契約を参照できるか

**判定: PASS**

**根拠:**

Phase 1 scope-definition.md Section 5 の依存タスクテーブルで、`skill-lifecycle Task03` が「本タスクの runtime policy 設計を参照する」後続提供先として明示されている。

contract-matrix.md Section 3.1 では `RuntimePolicyResolver` の interface が TypeScript 型として完全に定義されており、Task03 が参照すべき契約の全要素が揃っている:

```typescript
interface RuntimePolicyResolver {
  resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>;
}
```

Task03 が必要とする情報の充足を項目別に確認した:

| Task03 の参照ニーズ                    | 設計での対応                                                 | 充足 |
| -------------------------------------- | ------------------------------------------------------------ | ---- |
| auth-mode の値域                       | `AuthMode = "integrated_api" \| "claude_code"` と定義済み    | OK   |
| RuntimeDecision の型と戻り値           | `RuntimeDecision.type` / `apiKey?` / `handoff?` と定義済み   | OK   |
| terminal handoff bundle の構造         | `TerminalHandoffBundle` の全フィールドが定義済み             | OK   |
| SkillExecutor.execute() の新シグネチャ | `runtimeDecision?` の Optional 引数が定義済み                | OK   |
| エラーコードの体系                     | `AUTHENTICATION_ERROR` / `RUNTIME_POLICY_ERROR` 等が定義済み | OK   |
| IPC チャンネル名と Payload 型          | contract-matrix.md Section 1 で全チャンネルが定義済み        | OK   |

Phase 2 設計は Task03 が runtime policy を参照・実装するために必要な契約を全て提供できている。Task03 は `RuntimePolicyResolver` を DI 経由で受け取り、`SkillExecutor.execute()` に `runtimeDecision` を渡す実装パスを辿ることが可能。

---

## MINOR 指摘一覧

| ID       | 観点   | 指摘内容                                                                                                                                                                                           | 影響度 | 対応方針                                                                                                                                               |
| -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MINOR-01 | 観点 1 | `SkillExecutor.getApiKey()` の扱いが設計文書に明示されていない。`runtimeDecision?` が Optional であるため、実装時に「自己解決」パス（authKeyService / 環境変数への直接参照）が残存するリスクがある | 低     | Phase 5（実装）で `getApiKey()` を廃止し、`RuntimeDecision.apiKey` 経由のみに一本化する方針を実装仕様書（phase-5-implementation.md）に明記して対応する |

---

## 責務境界の整合性確認

### RuntimePolicyResolver の責務境界

| レイヤー | 責務                                                               | 持たない責務                                   |
| -------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| Renderer | authMode 値の参照（Zustand store）、handoff UI の表示              | auth-mode の判定・解決                         |
| Preload  | IPC 転送（skill:execute / agent:query 等）                         | runtime policy の評価                          |
| Main     | RuntimePolicyResolver による auth-mode 解決と RuntimeDecision 生成 | UI 表示ロジック / Renderer への API key の送信 |

矛盾なし。auth-mode の解決は Main Process に一元化されており、Renderer は Zustand store の値を参照するのみで独自判定を行わない。設計制約（scope-definition.md Section 3.2）と整合している。

### permission の責務境界

| レイヤー | 責務                                                     | 持たない責務            |
| -------- | -------------------------------------------------------- | ----------------------- |
| Renderer | permission dialog 表示、ユーザー応答の IPC 送信          | permission の判定       |
| Preload  | `skill:permission-response` の転送                       | permission のキャッシュ |
| Main     | PermissionStore / PreToolUse Hook による permission 判定 | UI 文言の生成           |

矛盾なし。RuntimePolicyResolver の追加によって PermissionStore の責務は変化しない。preflight と permission は独立した責務として維持されている。

### terminal handoff の責務境界

| レイヤー | 責務                                                          | 持たない責務                   |
| -------- | ------------------------------------------------------------- | ------------------------------ |
| Renderer | handoff card 表示、`コマンドをコピー` / `terminal を開く` CTA | handoff bundle の生成          |
| Preload  | `skill:handoff` / `agent:handoff` の転送                      | bundle 内容の解釈              |
| Main     | TerminalHandoffBundle の生成とサニタイズ                      | コマンドの自動送信（禁止事項） |

矛盾なし。terminal handoff は「ユーザーが手動で terminal を操作する」設計が維持されており、auto-send / hidden prompt injection は設計上発生しない（contract-matrix.md Section 4: security 境界）。

---

## 次 Phase への Handoff 確認

### Phase 4（テスト作成）への Handoff

| 確認項目                                                                    | 状態 | 根拠                                                    |
| --------------------------------------------------------------------------- | ---- | ------------------------------------------------------- |
| RuntimePolicyResolver の入出力型が定義されている                            | OK   | contract-matrix.md Section 3.1                          |
| SkillExecutor の拡張シグネチャが定義されている                              | OK   | contract-matrix.md Section 3.3                          |
| AgentExecutor の拡張シグネチャが定義されている                              | OK   | contract-matrix.md Section 3.4                          |
| IPC チャンネル名と Payload 型が定義されている                               | OK   | contract-matrix.md Section 1.1-1.3                      |
| terminal handoff bundle の構造が定義されている                              | OK   | contract-matrix.md Section 3.1（TerminalHandoffBundle） |
| エラーコードの体系が定義されている                                          | OK   | contract-matrix.md Section 5                            |
| preflight 拡張後の成功/失敗フローが定義されている                           | OK   | contract-matrix.md Section 3.2                          |
| internal role と IPC チャンネルの対応が定義されている                       | OK   | design-summary.md Section 3.2                           |
| security 境界（API key 非露出 / handoff bundle サニタイズ）が定義されている | OK   | contract-matrix.md Section 4                            |
| skill-lifecycle Task03 への handoff 契約が揃っている                        | OK   | 観点 4 の評価結果参照                                   |

全項目 OK。Phase 4 でテスト仕様を作成するために必要な契約が全て定義されている。

### skill-lifecycle Task03 への Handoff

| 確認項目                                           | 状態 | 根拠                            |
| -------------------------------------------------- | ---- | ------------------------------- |
| RuntimePolicyResolver の interface が定義済み      | OK   | contract-matrix.md Section 3.1  |
| SkillExecutor の拡張シグネチャが Task03 で参照可能 | OK   | contract-matrix.md Section 3.3  |
| auth-mode 値域が Task01 foundation と一致          | OK   | scope-definition.md Section 3.2 |
| terminal handoff bundle の構造が Task03 で利用可能 | OK   | design-summary.md Section 2.2   |

---

## 完了確認チェックリスト

- [x] MAJOR 指摘 0 件
- [x] 観点 1: SkillExecutor / AgentExecutor の direct key read 残存リスクを評価し、MINOR として記録した
- [x] 観点 2: internal role（Planner/Executor/Improver）が UI 非露出であることを設計全体で確認した
- [x] 観点 3: permission / preflight / streaming の authority が変質していないことを項目別に確認した
- [x] 観点 4: skill-lifecycle Task03 が同じ契約を参照できることを確認した
- [x] MINOR 指摘事項（MINOR-01）を未解決として記録し、Phase 5 対応方針を明記した
- [x] 責務境界の整合性を RuntimePolicyResolver / permission / terminal handoff の 3 軸で確認した
- [x] Phase 4（テスト作成）への handoff に必要な全契約が揃っていることを確認した
- [x] skill-lifecycle Task03 への handoff に必要な全契約が揃っていることを確認した

---

## 結論

Phase 1 の要件定義と Phase 2 の設計は、4 つのレビュー観点において PASS 基準を満たしている。MINOR 指摘 1 件（SkillExecutor.getApiKey() の廃止方針の明示不足）は Phase 5（実装）での対応で解消可能であり、設計全体の整合性を損なうものではない。Phase 4（テスト作成）への進行を承認する。
