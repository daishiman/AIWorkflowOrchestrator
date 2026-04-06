# ハードコードされた AGENT_NAMES の動的解決 - タスク指示書

## メタ情報（依存: P0-03/P0-04を明記）

```yaml
issue_number: 1892
task_id: TASK-P0-07
task_name: hardcoded-agent-names-dynamic-resolution
category: リファクタリング（Feature Gap系）
target_feature: Skill Creator Agent SDK Lane - エージェント名解決
priority: 中
scale: 中規模
status: 未実施
source: P0是正パック（ギャップ分析）
created_date: 2026-04-04
step: 10（P0-03/P0-04後に直列実行）
dependencies:
  - TASK-P0-03（workflow-manifest.json 本番配置）
  - TASK-P0-04（ManifestLoader デフォルト起動有効化）
```

| 項目         | 値                                                             |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-P0-07                                                     |
| タスク名     | ハードコードされた AGENT_NAMES の動的解決                      |
| 分類         | リファクタリング（Feature Gap系）                              |
| 対象機能     | Skill Creator Agent SDK Lane - エージェント名解決              |
| 優先度       | 中                                                             |
| 見積もり規模 | 中規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | P0是正パック（ギャップ分析）                                   |
| 発見日       | 2026-04-04                                                     |
| Step         | 10（P0-03/P0-04後に直列実行）                                  |
| 依存タスク   | TASK-P0-03（manifest配置）, TASK-P0-04（ManifestLoader有効化） |

---

## 1. Why

### 1.1 背景

`SkillCreatorWorkflowEngine` 内のワークフロー phases（requirements-gathering / plan / execute / verify / improve）は、現在コード内の定数・リテラルとして直接埋め込まれている。
また、各フェーズが使用するエージェントリソース（discover-problem / design-workflow / plan-structure / improve-prompt など）は `planPromptConstants.ts` / `improvePromptConstants.ts` に `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` としてハードコードされており、`workflow-manifest.json` からの動的解決が行われていない。

TASK-P0-03 で `workflow-manifest.json` が本番配置され、TASK-P0-04 で `ManifestLoader` がデフォルト有効化されたことにより、本タスクの前提条件が整った。
本タスクでは、manifest を唯一の正本として、ワークフローフェーズ ID とエージェントリソースを動的に解決する仕組みへとリファクタリングする。

### 1.2 問題点・課題

- `planPromptConstants.ts` の `PLAN_RESOURCE_REQUESTS` および `improvePromptConstants.ts` の `IMPROVE_RESOURCE_REQUESTS` にエージェント名（`discover-problem` / `design-workflow` / `plan-structure` / `improve-prompt`）がハードコードされている
- `RuntimeSkillCreatorFacade.ts` の fallback path（`hasDynamicResourcePipeline()` が false の場合）では `PLAN_RESOURCE_REQUESTS` を静的リストとして参照しており、manifest 変更に追随しない
- `SkillCreatorWorkflowEngine.ts` の phase 状態機械（`review` / `execute` / `verify` / `improve` / `reverify` など）も manifest の `phases[].id` とは独立して定義されており、manifest から動的解決されていない
- manifest 変更時にエージェント名のコードも同時変更が必要となり、保守性が低い
- 設計原則として「`.claude/skills/skill-creator/` の manifest を唯一の正本とする」が定められているが、現状は静的コードが正本となっている

### 1.3 放置した場合の影響

- manifest の phases / resources を変更してもコードが追随せず、ランタイムとマニフェストが乖離したまま動作し続ける
- 動的パイプラインの恩恵（manifest による設定変更の即時反映）を享受できない
- テスト `T-P7-04: AGENT_NAMES の残留参照が runtime services にない` が示す設計意図に反する状態が温存される

---

## 2. What

### 2.1 達成目標

- `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` の静的定義を保持しつつ、manifest が有効な場合は manifest の `resources[]` からエージェント/リファレンスを動的に解決する
- `hasDynamicResourcePipeline()` が true の場合の動的パスにおいて、manifest の各 phase（`plan` / `improve` 等）に紐づく `resourceIds` からエージェントリストを組み立てる
- manifest が存在しない場合やロード失敗時は既存の静的 `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` にフォールバックし、後退しない

### 2.2 最終ゴール

1. `RuntimeSkillCreatorFacade.plan()` において、manifest が有効な場合は `phase.id === "plan"` の `resourceIds` からエージェントを動的解決する
2. `RuntimeSkillCreatorFacade.improve()` において、manifest が有効な場合は `phase.id === "improve"` の `resourceIds` からエージェントを動的解決する
3. フォールバック（manifest なし / ロード失敗）時は既存の `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` 静的リストを使用し、動作が後退しない
4. 既存テスト `T-P7-04: AGENT_NAMES の残留参照が runtime services にない` が引き続き PASS する
5. `pnpm --filter @repo/desktop typecheck` および `pnpm --filter @repo/desktop lint` がエラーなし

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.ts` における `plan()` / `improve()` フェーズの manifest 動的解決パスの強化
- manifest の `phases[]` / `resources[]` からフェーズ別エージェントリストを組み立てるユーティリティ実装
- manifest ロード失敗時のフォールバック設計（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` を維持）
- 動的解決パスのテスト追加

#### 含まないもの

- `workflow-manifest.json` 内容の変更（TASK-P0-03 の責務）
- `ManifestLoader` 自体の変更（TASK-P0-04 の責務）
- `SkillCreatorWorkflowEngine.ts` の phase 状態機械（`plan` / `execute` / `verify` / `improve` / `reverify`）の定義変更（phase 遷移ロジックの変更は別タスク）
- 新規フェーズの追加やフェーズ順序の変更

---

## 3. How（前提条件: P0-03/P0-04完了）

### 3.1 前提条件

- **TASK-P0-03 完了**: `.claude/skills/skill-creator/workflow-manifest.json` および `.agents/skills/skill-creator/workflow-manifest.json` が配置済みであること
- **TASK-P0-04 完了**: `ManifestLoader` がデフォルト起動で manifest を自動読み込みし、`hasDynamicResourcePipeline()` が true を返す状態になっていること
- `manifest.phases[]` に `requirements-gathering` / `plan` / `execute` / `verify` / `improve` が存在し、各 phase の `resourceIds[]` が `resources[]` に正しく参照されていること

### 3.2 現状アーキテクチャの理解

#### 動的パスと静的フォールバックの二重構造

`RuntimeSkillCreatorFacade.plan()` は以下の二重構造を持つ：

```typescript
if (this.hasDynamicResourcePipeline()) {
  // manifest の resources を PhaseResourcePlanner / SkillCreatorSourceResolver 経由で解決
  const resolved = await this.resolveOperationResources(
    PLAN_RESOURCE_REQUESTS, // ← ここに静的リストが残っている
    PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
    "plan",
  );
  // ... agentSpecs を組み立てる
} else {
  // fallback: PLAN_RESOURCE_REQUESTS を静的リストとして直接使用
  for (const request of PLAN_RESOURCE_REQUESTS.filter(
    (r) => r.kind === "agent",
  )) {
    const content = await this.resourceLoader.loadAgent(request.id);
    agentSpecs.push({ name: request.id, content });
  }
}
```

動的パス（`hasDynamicResourcePipeline()` が true）の場合も `resolveOperationResources()` に `PLAN_RESOURCE_REQUESTS` を渡しているため、manifest の `plan` フェーズの `resourceIds` が `PLAN_RESOURCE_REQUESTS` より優先されていない可能性がある。

#### `IMPROVE_RESOURCE_REQUESTS` の静的定義

`improvePromptConstants.ts` の `IMPROVE_RESOURCE_REQUESTS` も同様に、manifest の `improve` フェーズ定義とは独立してハードコードされている。

### 3.3 推奨アプローチ

1. `ManifestLoader` が返す manifest オブジェクトから特定 phase の `resourceIds` を取得するユーティリティ関数を作成する
2. 動的パス（`hasDynamicResourcePipeline()` が true）において、`PLAN_RESOURCE_REQUESTS` を manifest の `plan` フェーズの `resourceIds` から生成した `PhaseResourceRequest[]` に差し替える
3. manifest にエントリが存在しない resource id については、既存の `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` のエントリをフォールバックとして使用する
4. テストで manifest モックを使用し、動的解決が機能することを検証する

---

## 4. 実行手順

### Phase 1: ハードコード箇所調査

#### 目的

エージェント名がハードコードされている全箇所を特定し、影響範囲を把握する。

#### 手順

1. 以下のファイルを読み込み、ハードコードされたエージェント名・リソース名を全てリストアップする:
   - `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（`PLAN_RESOURCE_REQUESTS` 内の `id` フィールド）
   - `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`（`IMPROVE_RESOURCE_REQUESTS` 内の `id` フィールド）
   - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（`plan()` / `improve()` の動的・静的両パス）
2. 以下の grep でハードコード参照の全箇所を確認する:
   ```bash
   grep -rn "PLAN_RESOURCE_REQUESTS\|IMPROVE_RESOURCE_REQUESTS" \
     apps/desktop/src/main/services/runtime/
   ```
3. `hasDynamicResourcePipeline()` の実装を確認し、true になる条件を把握する
4. `resolveOperationResources()` の実装を確認し、引数の `PLAN_RESOURCE_REQUESTS` がどのように使用されているかを把握する
5. manifest の `plan` フェーズ / `improve` フェーズの `resourceIds` が、現在の `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` と一致しているかを確認する

#### 成果物

- ハードコード箇所一覧（ファイル名 / 行番号 / 内容）
- 動的パスで manifest が活用されている範囲と、活用されていない範囲の区別

#### 完了条件

- [ ] `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` の参照箇所が全て特定されている
- [ ] `hasDynamicResourcePipeline()` が true になる条件が理解されている
- [ ] `resolveOperationResources()` への引数として静的リストが使用されているか確認されている
- [ ] manifest の `plan` / `improve` フェーズの `resourceIds` が把握されている

---

### Phase 2: 動的解決設計

#### 目的

manifest から phase 別リソースリストを動的に組み立てるアーキテクチャを設計する。

#### 手順

1. manifest の `phases[id === "plan"].resourceIds` から `PhaseResourceRequest[]` を生成するユーティリティ関数のシグネチャを設計する:
   ```typescript
   function buildPhaseResourceRequestsFromManifest(
     manifest: LoadedManifest,
     phaseId: string,
     fallback: readonly PhaseResourceRequest[],
   ): PhaseResourceRequest[];
   ```
2. manifest の `resources[]` から `id` / `kind` / `path` を取得し、`PhaseResourceRequest` にマッピングする変換ロジックを設計する
3. `resolveOperationResources()` の呼び出し箇所で、静的 `PLAN_RESOURCE_REQUESTS` の代わりに manifest 由来の動的リストを渡す変更点を設計する
4. フォールバック条件を設計する:
   - manifest にフェーズが存在しない場合 → 静的リストにフォールバック
   - manifest の `resourceIds` が空の場合 → 静的リストにフォールバック
   - manifest の resource エントリが静的リストに存在しない id を持つ場合 → `relativePath` を manifest の `path` から推定する

#### 成果物

- `outputs/phase-2/design-document.md`（ユーティリティ関数シグネチャ・変換ロジック・フォールバック条件の設計書）

#### 完了条件

- [ ] ユーティリティ関数のシグネチャが確定している
- [ ] フォールバック条件が明文化されている
- [ ] 変更対象ファイルと変更内容の概要が確定している

---

### Phase 3: 実装

#### 目的

Phase 2 の設計に従い、manifest からの動的解決を実装する。

#### 手順

1. `RuntimeSkillCreatorFacade.ts` に `buildPhaseResourceRequestsFromManifest()` ユーティリティを追加する（または `planPromptConstants.ts` の隣に新ファイルとして配置する）
2. `plan()` の動的パス（`hasDynamicResourcePipeline()` が true の場合）を変更し、`PLAN_RESOURCE_REQUESTS` の代わりに manifest 由来のリストを使用する:
   ```typescript
   const phaseRequests = buildPhaseResourceRequestsFromManifest(
     this.loadedManifest,
     "plan",
     PLAN_RESOURCE_REQUESTS,
   );
   const resolved = await this.resolveOperationResources(
     phaseRequests,
     PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
     "plan",
   );
   ```
3. `improve()` の動的パスも同様に変更し、`IMPROVE_RESOURCE_REQUESTS` の代わりに manifest 由来のリストを使用する
4. `pnpm --filter @repo/desktop test RuntimeSkillCreatorFacade.plan` を実行し、既存テストが PASS することを確認する

#### 成果物

- 変更済み `RuntimeSkillCreatorFacade.ts`（動的解決パスの強化）
- `buildPhaseResourceRequestsFromManifest()` ユーティリティ関数

#### 完了条件

- [ ] `plan()` の動的パスで manifest 由来のリストが使用されている
- [ ] `improve()` の動的パスで manifest 由来のリストが使用されている
- [ ] 既存テスト `T-P7-04` が PASS する
- [ ] TypeScript 型エラーなし

---

### Phase 4: フォールバック設計・実装

#### 目的

manifest が存在しない / ロード失敗 / フェーズが見つからない場合に動作が後退しないことを保証する。

#### 手順

1. `ManifestLoader` の初期化完了前（またはロード失敗時）に `hasDynamicResourcePipeline()` が false を返すことを確認する
2. `buildPhaseResourceRequestsFromManifest()` が manifest に対象フェーズを見つけられない場合、`fallback` パラメータを返すことをテストで検証する
3. `plan()` の静的フォールバックパス（`hasDynamicResourcePipeline()` が false かつ `this.resourceLoader` が存在する場合）は変更せず、`PLAN_RESOURCE_REQUESTS` を引き続き使用することを確認する
4. フォールバックの発動を示すログ出力（`debug` または `warn` レベル）を追加する

#### 成果物

- フォールバック検証テスト
- ログ出力実装

#### 完了条件

- [ ] manifest ロード前 / 失敗時に静的リストへフォールバックすることが確認されている
- [ ] フォールバックが発動した場合にログが出力される
- [ ] フォールバック時の既存テストが PASS する

---

### Phase 5: テスト

#### 目的

動的解決が機能することを検証するテストを追加する。

#### 手順

1. `RuntimeSkillCreatorFacade.plan.test.ts` に以下のテストケースを追加する:
   - `T-P7-05`: manifest の `plan` フェーズの `resourceIds` からエージェントリストが組み立てられること
   - `T-P7-06`: manifest に `plan` フェーズが存在しない場合、`PLAN_RESOURCE_REQUESTS` にフォールバックすること
   - `T-P7-07`: manifest の `resourceIds` が空の場合、`PLAN_RESOURCE_REQUESTS` にフォールバックすること
2. `RuntimeSkillCreatorFacade` の `improve()` 相当テストに以下を追加する:
   - manifest の `improve` フェーズの `resourceIds` からエージェントリストが組み立てられること
3. 全テストを実行して PASS を確認する:
   ```bash
   pnpm --filter @repo/desktop test RuntimeSkillCreatorFacade
   ```

#### 成果物

- 追加テストケース（`T-P7-05` 〜 `T-P7-07`）

#### 完了条件

- [ ] `T-P7-05` 〜 `T-P7-07` が PASS する
- [ ] 既存テスト `T-P7-04` が引き続き PASS する
- [ ] `RuntimeSkillCreatorFacade` の全テストが PASS する

---

### Phase 6: 完了・品質確認

#### 目的

型チェック / lint / 全テスト通過を確認し、タスクを完了する。

#### 手順

1. TypeScript 型チェックを実行する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
2. ESLint を実行する:
   ```bash
   pnpm --filter @repo/desktop lint
   ```
3. 全テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test
   ```
4. 以下の確認を手動で行う:
   - `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` は静的フォールバックとして保持されており、削除されていないこと
   - 新たな `const` としてエージェント名が追加されていないこと
5. PR を作成する（ユーザー承認後）。タイトル: `refactor(runtime): TASK-P0-07 AGENT_NAMES 動的解決（manifest 優先 + 静的フォールバック）`

#### 成果物

- typecheck / lint / テスト全 PASS の確認
- GitHub PR

#### 完了条件

- [ ] typecheck エラーなし
- [ ] lint エラーなし
- [ ] 全テスト PASS
- [ ] PR 作成済み（ユーザー承認後）

---

## 5. 完了条件チェックリスト

### 機能要件（AC）

- [ ] AC-1: `plan()` の動的パスで、manifest の `plan` フェーズ `resourceIds` からエージェントリストが組み立てられる
- [ ] AC-2: `improve()` の動的パスで、manifest の `improve` フェーズ `resourceIds` からエージェントリストが組み立てられる
- [ ] AC-3: manifest にフェーズが存在しない / `resourceIds` が空の場合、静的リスト（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする
- [ ] AC-4: フォールバック発動時にログ出力（`debug` または `warn`）がある
- [ ] AC-5: `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` は削除されず、静的フォールバックとして保持されている

### 品質要件

- [ ] 既存テスト `T-P7-04: AGENT_NAMES の残留参照が runtime services にない` が PASS
- [ ] 新規テスト `T-P7-05` 〜 `T-P7-07` が PASS
- [ ] `RuntimeSkillCreatorFacade` の全既存テストが PASS（リグレッションなし）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし

---

## 6. 検証方法

### テストコマンド

```bash
# plan フェーズ関連テスト
pnpm --filter @repo/desktop test RuntimeSkillCreatorFacade.plan

# improve フェーズ関連テスト
pnpm --filter @repo/desktop test RuntimeSkillCreatorFacade.improve

# RuntimeSkillCreatorFacade 全テスト（リグレッション確認）
pnpm --filter @repo/desktop test RuntimeSkillCreatorFacade

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### テストケース一覧

| テストID | 内容                                                                         | 期待結果                                                      |
| -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| T-P7-04  | AGENT_NAMES の残留参照が runtime services にない（既存）                     | `PLAN_RESOURCE_REQUESTS` が唯一の source of truth（変更なし） |
| T-P7-05  | manifest の `plan` フェーズ `resourceIds` からエージェントリストを組み立てる | manifest モックの resourceIds で loadAgent が呼ばれる         |
| T-P7-06  | manifest に `plan` フェーズが存在しない場合にフォールバック                  | `PLAN_RESOURCE_REQUESTS` の id で loadAgent が呼ばれる        |
| T-P7-07  | manifest の `resourceIds` が空の場合にフォールバック                         | `PLAN_RESOURCE_REQUESTS` の id で loadAgent が呼ばれる        |

### 手動確認手順

1. `planPromptConstants.ts` にエージェント名文字列リテラルが増えていないことを確認する:
   ```bash
   grep -n '"discover-problem"\|"design-workflow"\|"plan-structure"' \
     apps/desktop/src/main/services/runtime/planPromptConstants.ts
   ```
2. `RuntimeSkillCreatorFacade.ts` にコードとして新たなエージェント名定数が追加されていないことを確認する:
   ```bash
   grep -n 'const AGENT_NAMES\|AGENT_NAMES =' \
     apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
   ```

---

## 7. リスクと対策

| リスク                                                                                 | 影響度 | 発生確率 | 対策                                                                                                                                     |
| -------------------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| manifest の `plan` フェーズの `resourceIds` が既存の `PLAN_RESOURCE_REQUESTS` と異なる | 高     | 中       | Phase 1 でフェーズ別 `resourceIds` と静的リストの一致を確認する。異なる場合は manifest を修正するか、動的変換ロジックでカバーする        |
| ManifestLoader の初期化完了前にエージェント名が必要になるケース                        | 高     | 低       | `hasDynamicResourcePipeline()` が false を返す間は静的フォールバックを使用し、初期化完了後に動的パスへ切り替える既存の二重構造を維持する |
| `resolveOperationResources()` の引数仕様変更が他の呼び出し元に影響する                 | 中     | 低       | Phase 1 で全呼び出し箇所を確認する。変更は動的パスの引数のみに留め、関数シグネチャは変更しない                                           |
| フォールバック発動がサイレントで検知できない                                           | 中     | 中       | フォールバック発動時に `warn` ログを出力し、Phase 4 でログ出力のテストを追加する                                                         |
| AGENT_NAMES 参照が他のファイルに散在している場合の見落とし                             | 中     | 低       | Phase 1 の grep 調査で `AGENT_NAMES\|PLAN_RESOURCE_REQUESTS\|IMPROVE_RESOURCE_REQUESTS` を広範囲に検索し、見落としがないことを確認する   |

---

## 8. 参照情報（苦戦箇所）

### 苦戦箇所 1: AGENT_NAMES がコード各所に散在している場合

現状調査の結果、`AGENT_NAMES` という変数名そのものは `runtime` サービス層に存在せず、テストの名称としてのみ使用されていた（`T-P7-04` のテスト記述内）。
実際のエージェント名のハードコードは `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` 定数内の `id` フィールドに集約されている。

Phase 1 で全参照箇所を確認し、漏れがないことを保証してから実装に進むこと。

### 苦戦箇所 2: ManifestLoader の初期化完了前にエージェント名が必要になるケース

`RuntimeSkillCreatorFacade` の `plan()` / `improve()` は、ManifestLoader の初期化完了有無を `hasDynamicResourcePipeline()` で判定している。
初期化完了前は `hasDynamicResourcePipeline()` が false を返し、静的フォールバックパスを使用するため、タイミング問題は既存の二重構造で対処されている。
本タスクでは、この判定フローを変更せずに、動的パスにおける manifest 由来リストの使用を強化することに留める。

### 苦戦箇所 3: フォールバック値（manifest 未配置時のデフォルトエージェント名）の設計

`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` は、manifest が存在しない場合の「最終フォールバック」として保持し続ける必要がある。
これらを削除すると、P0-03 が未完了の環境（CI / 開発環境の初回セットアップなど）でエージェント名解決が全面的に失敗する。
「manifest 優先 + 静的フォールバック」の二重構造を維持し、静的リストは削除しないこと。

### 苦戦箇所 4: `resolveOperationResources()` の引数との整合性

`resolveOperationResources()` は `PhaseResourceRequest[]` を受け取り、`SkillCreatorSourceResolver` 経由でリソースを解決する。
manifest 由来のリソースリストを `PhaseResourceRequest[]` に変換する際、`tier` / `required` / `legacyCategory` / `legacyName` フィールドを適切にデフォルト値で埋める必要がある。
`tier: "required-core"` / `required: true` をデフォルトとし、`legacyCategory` / `legacyName` は manifest の `kind` / `path` から推定する。

---

## 9. 備考

### 現状確認（2026-04-04 時点）

調査の結果、以下の状態が確認されている：

- `PLAN_RESOURCE_REQUESTS`（`planPromptConstants.ts`）: エージェント名 `discover-problem` / `design-workflow` / `plan-structure` が静的定義
- `IMPROVE_RESOURCE_REQUESTS`（`improvePromptConstants.ts`）: エージェント名 `improve-prompt` が静的定義
- `RuntimeSkillCreatorFacade.plan()`: 動的パスでも `PLAN_RESOURCE_REQUESTS` を `resolveOperationResources()` に渡している（manifest の `plan` フェーズの `resourceIds` が直接使用されていない可能性）
- テスト `T-P7-04`: 「AGENT_NAMES を介さずに `PLAN_RESOURCE_REQUESTS` が使用されること」を検証しており、本タスクの完了後も引き続き PASS する必要がある

### 後続タスクへの影響

本タスク完了後、manifest のリソース定義を変更するだけでエージェントリストを更新できるようになり、コード変更が不要となる。
ただし `SkillCreatorWorkflowEngine.ts` の phase 状態機械（`plan` / `execute` / `verify` / `improve` / `reverify`）の定義変更は本タスクのスコープ外であり、将来的な別タスクで対応する。

### 関連ドキュメント

| ドキュメント                         | パス                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| RuntimeSkillCreatorFacade 実装       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                  |
| ManifestLoader 実装                  | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                             |
| planPromptConstants（静的リスト）    | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                                        |
| improvePromptConstants（静的リスト） | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`                                     |
| P0 是正パック（設計方針）            | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md`                |
| 依存タスク: manifest 配置            | `docs/30-workflows/unassigned-task/TASK-P0-03-workflow-manifest-production-placement.md`               |
| 依存タスク: ManifestLoader 有効化    | `docs/30-workflows/unassigned-task/task-p0-04-manifest-loader-default-startup.md`                      |
| AGENT_NAMES 残留参照検証テスト       | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（`T-P7-04`） |
