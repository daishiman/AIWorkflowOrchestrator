# Phase 3: 設計レビューレポート - Runtime Policy Centralization

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| タスク種別   | design（設計タスク）                       |
| 作成日       | 2026-03-21                                 |
| レビュー対象 | Phase 1-2 全成果物（6ファイル）            |
| 後続フェーズ | Phase 4（テスト作成）                      |

---

## 1. レビューサマリー

### 全体判定: MINOR

Phase 1-2 の成果物は AC-1〜AC-4 の全てを実質的に満たしており、Phase 4 着手に必要な設計基盤は整っている。所有層の定義、health route の primary/legacy 区分、型の責務境界、policy consumption contract のいずれも十分な具体性と検証可能性を持つ。

MINOR 指摘として以下 3 点を記録する。いずれも Phase 4 着手を blocking しない。後続フェーズ（Phase 5 実装開始前まで）に解消すること。

| 指摘ID | 分類  | 内容概要                                                            | 追跡先    |
| ------ | ----- | ------------------------------------------------------------------- | --------- |
| M-1    | MINOR | AC-3: `RuntimeDecision` の IPC 向け sanitize 後の型が未定義         | Phase 5前 |
| M-2    | MINOR | AC-4: `IRuntimePolicyResolver.resolve()` のデフォルト引数仕様が曖昧 | Phase 4   |
| M-3    | MINOR | AC-2: `AI_CHECK_CONNECTION` 廃止手続きの cleanup タスクIDが未割当   | Phase 12  |

---

## 2. AC 別レビュー結果

### AC-1: ownership table の網羅性・具体性

**判定: PASS**

**確認内容:**

`contract-matrix.md § 1` に以下の 4 カテゴリが定義されており、AC-1 の検証条件を全て満たす。

| カテゴリ                     | 所有層    | 禁止層記載 | 禁止事項の具体性   |
| ---------------------------- | --------- | ---------- | ------------------ |
| 1-1. runtime 実行可否        | Main のみ | Renderer   | 具体的な違反例あり |
| 1-2. health check の実行主体 | Main      | Renderer   | 具体的な違反例あり |
| 1-3. handoff bundle の構築   | Main      | Renderer   | 具体的な違反例あり |
| 1-4. authMode の参照権限     | Main      | Renderer   | 具体的な違反例あり |

Renderer が禁止層として明記されているカテゴリは 4 つ（最低基準 3 つを超過）。各行に「所有層」「入力」「出力型」「禁止層」「禁止事項」の全項目が記載されている。

`createFallbackStatus` による Renderer 側状態生成が禁止事項に含まれており（1-4 の「特記事項」）、Phase 1 棚卸し結果（current-state-inventory.md § 3-1）で特定されたリスクに対応できている。

**強み:** 「表示許容」列を設けることで「表示目的は OK だが runtime 判定は禁止」という重要な二段階を簡潔に表現できている点が優れている。

---

### AC-2: health route の primary/legacy 区分の明確さ

**判定: PASS（MINOR M-3 付き）**

**確認内容:**

`contract-matrix.md § 3` に以下が全て揃っている。

- `llm:check-health` が primary として明記されている
- `AI_CHECK_CONNECTION` が legacy 残置として明記され、「新規利用: 禁止」が明示されている
- 廃止トリガーが grep コマンド形式（`grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/`）で検証可能な条件として記載されている
- 廃止手続き（cleanup タスク作成）が記載されている

AC-2 の検証条件（新規コード禁止の明示・削除トリガー条件の定義・廃止条件の定義）を全て満たす。

**MINOR M-3:** 廃止手続きの項目に「専用の cleanup タスクを作成し」と記載されているが、タスクID・担当フェーズが未割当のため、後続タスク一覧での追跡が困難。Phase 12 の未タスク管理フローで cleanup タスクを登録することを推奨する。

---

### AC-3: 型の所有層・IPC 通過可否・責務境界の図示品質

**判定: PASS（MINOR M-1 付き）**

**確認内容:**

`design-summary.md § 2-1`（ASCII 図）と `§ 2-2`（型の所有層マッピング）、および `contract-matrix.md § 2`（型契約テーブル）の組み合わせで以下が確認できる。

| 確認項目                                                          | 状態 |
| ----------------------------------------------------------------- | ---- |
| 3 型の所有層（packages/shared / Main 内部）が図示                 | PASS |
| IPC 境界の通過可否が型ごとに定義                                  | PASS |
| `RuntimeDecision.integrated_api.apiKey` の IPC 除外ルール（DD-2） | PASS |
| `TerminalHandoffBundle` が Main 内部型として分類                  | PASS |
| 各型の必須フィールドが定義されている                              | PASS |

特に `design-summary.md § 2-1` の ASCII 図は IPC 境界（contextBridge）を中心に据え、「通過可能」「通過禁止」を明示しており、責務境界の可視化として十分な品質を持つ。

**MINOR M-1:** `RuntimeDecision` の `integrated_api` ケースについて、「IPC 送信前に `apiKey` を除外する」ルールが DD-2 として設計判断に記録されているが、除外後の IPC 向け型（サニタイズ済み `RuntimeDecision`）の定義が成果物内に存在しない。

具体的には以下の型が Phase 5 実装で必要になるが、Phase 4 のテスト設計段階で仕様が確定していないと P60 パターン（テスト応答形式の不一致）が発生するリスクがある。

```typescript
// IPC 送信前のサニタイズ後型（未定義）
type RuntimeDecisionForRenderer =
  | { type: "integrated_api" } // apiKey を除外
  | { type: "terminal_handoff"; guidance: HandoffGuidance }; // bundle を除外し HandoffGuidance に変換
```

Phase 4 テスト設計開始前に `sanitizeForRenderer()` の入出力型を contract-matrix.md に追記することを推奨する。

---

### AC-4: consumption contract 4 原則の実装者への明確さ

**判定: PASS（MINOR M-2 付き）**

**確認内容:**

`contract-matrix.md § 4` に以下の 4 原則が全て記載されている。

| 原則 | 内容                                                       | 「禁止」明記 | 「必須」明記 | 型スニペット |
| ---- | ---------------------------------------------------------- | ------------ | ------------ | ------------ |
| 1    | runtime 判定は `IRuntimePolicyResolver.resolve()` 経由のみ | あり         | あり         | あり         |
| 2    | health check は `llm:check-health` 経由のみ                | あり         | あり         | あり         |
| 3    | handoff は `buildForSurface()` 経由のみ                    | あり         | あり         | あり         |
| 4    | 型は `packages/shared` から import のみ                    | あり         | あり         | あり         |

Step 03-09 全 surface への影響警告が § 2 および § 4 冒頭に記載されており、AC-4 の「警告コメント」条件を満たす。

**MINOR M-2:** 原則 1 のコードスニペットでは `resolve(authMode, apiKey)` という引数形式が記載されているが、`design-summary.md § 4 DD-1` には「`RuntimeResolver` の DI パターン（引数なし `resolve()`）を `RuntimePolicyResolver` に取り込む」という記述がある。引数ありと引数なし（内部 DI）の双方に対応する場合、`resolve()` のシグネチャが以下のどちらになるか Phase 4 前に確定が必要。

- パターン A: `resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>`（常に引数で渡す）
- パターン B: `resolve(authMode?: AuthMode, apiKey?: string | null): Promise<RuntimeDecision>`（省略時は内部 DI から取得）

Phase 4 のテストケース設計で引数の渡し方が固まらないと、テストと実装の不整合（P60）が発生するリスクがある。scope-definition.md に「仮定義として引数形式を採用し Task01 整合時に確認する」と記載があるため、Phase 4 着手前に現行の `RuntimePolicyResolver` インターフェースを確認して確定すること。

---

## 3. Simpler Alternative 再評価

### 案 A（採用）の妥当性確認: PASS

`design-summary.md § 3` の比較表を検証した結果、案 A（`RuntimePolicyResolver` を唯一のリゾルバーとして統合）は以下の理由で最適な選択と判断する。

**案 A が最もシンプルである根拠:**

1. **既存インターフェースの活用**: `IRuntimePolicyResolver` インターフェースが既に定義されており、DI 基盤が整っている。新規インターフェースの定義コストがゼロ。
2. **型の安定性が高い**: `RuntimeDecision` 型は現行コードに既存であり、Step 03-09 の実装で直接参照できる。
3. **変更箇所が明確**: `RuntimeResolver` の呼び出し元を `IRuntimePolicyResolver` に切り替えるという単純な作業で統合できる。

**案 B の不採用は妥当:**
Facade を追加しても二重管理の根本原因（`RuntimeResolution` 型の残存）が解消されない。FR-2 の「責務統合」要件を満たさない。

**案 C の不採用は妥当:**
新規クラス作成は本タスクが design タスクであるという前提に反し、変更コストが案 A と比較して不必要に高い。型の安定性は案 A で十分に確保できる。

### 追加確認: 設計の一貫性

案 A 採用に伴う `RuntimeResolver.resolve()` の deprecated 化について、`scope-definition.md § 1` に「非推奨化・移行計画の定義」としてスコープに含まれており、`contract-matrix.md § 5` に移行計画が記載されている。設計の一貫性は確保されている。

---

## 4. Drift リスク分析

### Drift リスク 1: RuntimePolicyResolver を呼ばずに LLM を直接実行するパターンの再発

**リスクレベル: 高**

**根拠:** 現行 `aiHandlers.ts` が `RuntimePolicyResolver` を呼ばずに直接 LLM を実行している問題が既に確認されている（current-state-inventory.md § 1-4）。同様のパターンが Task04-06 の新規ハンドラー実装でも繰り返されるリスクがある。

**防止策（設計成果物での対応）:**

- contract-matrix.md § 4 原則 1 に「[禁止] ハンドラー内で authMode や apiKey を参照して integrated / handoff を自ら決定する」と明記されている。
- validation-matrix.md § 2 Integration テスト観点に「AI Chat / Agent / Skill ハンドラーが `IRuntimePolicyResolver.resolve()` を呼び出していること」が記載されており、テストで検出可能。

**残存リスク:** lint ルールが未実装のため、静的検査での強制力がない。cleanup タスクで lint ルール追加を検討することを推奨する。

---

### Drift リスク 2: HandoffGuidance ではなく TerminalHandoffBundle を Renderer に渡すリスク

**リスクレベル: 中**

**根拠:** `TerminalHandoffBundle`（Main 内部型）と `HandoffGuidance`（IPC 通過型）の二型が混在しており、実装者が誤って `TerminalHandoffBundle` を IPC レスポンスに含めるリスクがある。

**防止策（設計成果物での対応）:**

- contract-matrix.md § 1-3 に「[禁止] Renderer が `TerminalHandoffBundle`（Main 内部型）を受け取り、表示用テキストを自前で組み立てること」が明記されている。
- contract-matrix.md § 2 の型契約テーブルに「`TerminalHandoffBundle`: IPC 通過可否 = 不可」「Renderer 参照可否 = 禁止」が明記されている。
- validation-matrix.md § 2 Integration テスト観点に「`terminal_handoff` の IPC レスポンスに `TerminalHandoffBundle` が含まれないこと」が検証項目として記載されている。

**残存リスク:** Phase 5 実装者が contract-matrix.md を参照しない場合の人的ミスは設計成果物では防げない。Phase 4 テスト設計で Integration テストを先行作成することでリスクを軽減できる。

---

### Drift リスク 3: AI_CHECK_CONNECTION を新規コードで参照するリスク

**リスクレベル: 中**

**根拠:** `AI_CHECK_CONNECTION` の新規参照禁止はコメントで記載されているが、lint ルールとして強制力がない（current-state-inventory.md § 1-4 に「強制力なし」と明示されている）。

**防止策（設計成果物での対応）:**

- contract-matrix.md § 3 の「新規利用: 禁止」が明示されている。
- contract-matrix.md § 4 原則 2 に「[禁止] `AI_CHECK_CONNECTION` チャンネルを新規コードから呼び出す」が明記されている。
- validation-matrix.md § 2 Manual テスト観点に grep コマンドによる確認が記載されている。

**残存リスク:** lint ルール未実装のため静的検査での検出ができない。MINOR M-3 と合わせて cleanup タスクで対処することを推奨する。

---

### Drift リスク 4: sanitizeForRenderer 処理の surface 別実装漏れ

**リスクレベル: 中**

**根拠:** DD-2 で「`sanitizeForRenderer()` 相当の処理を定義する」とされているが、実装は各 surface の IPC ハンドラー内で個別に行われる。Task03-09 の 7 surface のうち一部で実装が漏れるリスクがある。

**防止策（設計成果物での対応）:**

- contract-matrix.md § 4 原則 1 のコードスニペットに「`decision.apiKey` は内部でのみ使用し、IPC レスポンスに含めない」というコメントが明記されている。
- validation-matrix.md § 2 Integration テスト観点に「`integrated_api` の IPC レスポンスに `apiKey` フィールドが含まれないこと」が検証項目として記載されている。

**推奨対応:** MINOR M-1 で指摘した `RuntimeDecisionForRenderer` 型の定義を行い、型レベルで `apiKey` が含まれないことを保証することで、このリスクを低減できる。

---

## 5. MINOR 指摘事項

### M-1: IPC 向けサニタイズ後型の定義が未記載

**分類**: MINOR（Phase 4 着手前に解消を推奨）
**対象成果物**: contract-matrix.md § 2 型契約テーブル
**内容**:

`RuntimeDecision` の IPC 送信前サニタイズ（DD-2）により、Renderer に届く型は以下の形式になる。この型が成果物に定義されていないため、Phase 4 のテスト設計で期待値の記述に曖昧さが生じる。

Phase 5 実装開始前に `contract-matrix.md § 2` に以下の型定義（またはその等価物）を追記することを推奨する:

```typescript
// IPC 送信用 (Renderer 向け)
type RuntimeDecisionDTO =
  | { type: "integrated_api" }
  | { type: "terminal_handoff"; guidance: HandoffGuidance };
```

**blocking**: なし（Phase 4 着手を blocking しない）

---

### M-2: IRuntimePolicyResolver.resolve() のシグネチャが未確定

**分類**: MINOR（Phase 4 着手前に解消を推奨）
**対象成果物**: contract-matrix.md § 4 原則 1
**内容**:

`DD-1` に「`RuntimeResolver` の引数なし `resolve()` を `RuntimePolicyResolver` に取り込む」という設計判断があるが、統合後の `resolve()` のシグネチャが成果物に確定されていない。Phase 4 のテストケース設計で引数の渡し方が定まらないと P60 パターンが発生するリスクがある。

現行の `IRuntimePolicyResolver` インターフェースを `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` で確認し、引数形式（常時引数 / 省略時内部DI）を Phase 4 着手前に確定して contract-matrix.md に記載することを推奨する。

**blocking**: なし（Phase 4 着手を blocking しない）

---

### M-3: AI_CHECK_CONNECTION 廃止 cleanup タスクの未登録

**分類**: MINOR（Phase 12 で対応）
**対象成果物**: contract-matrix.md § 3 legacy route の残置条件詳細
**内容**:

廃止手続きに「専用の cleanup タスクを作成する」と記載されているが、タスクID・担当フェーズが未割当。Phase 12 の未タスク検出フローで cleanup タスクを `docs/30-workflows/unassigned-task/` に登録し、task-workflow.md の残課題テーブルに追記することを推奨する。

**blocking**: なし（Phase 4 着手を blocking しない）

---

## 6. 発見された設計上の強み

### 強み 1: 「表示許容 / 判定禁止」の二段階区分

Renderer が `authMode` や `healthStatus` を保持することを「表示目的」に限定して許容しつつ、「runtime 実行可否の判定への流用」を禁止する二段階区分が Ownership Table に明確に記載されている。単純に「Renderer から排除」とするのではなく、現実的なアーキテクチャに対応した設計判断であり、Task03-09 の実装者が迷わない。

### 強み 2: drift しやすいポイントの先行特定

`design-summary.md § 5` と `validation-matrix.md § 1` の両方に drift しやすいポイントが事前特定されており、Phase 3 レビュー観点と一致している。設計者が潜在的なリスクを認識した上で成果物を作成していることがわかる。

### 強み 3: 廃止条件が検証可能な形式で定義されている

`AI_CHECK_CONNECTION` の廃止トリガーが grep コマンド形式で定義されており、「将来的に削除」という曖昧表現を避けている。仕様書が実行可能な検証手順を含む点が優れている。

### 強み 4: Task01 依存の明示と仮定義による並列進行

`scope-definition.md § 3` に Task01 からの入力依存が明示されており、Task01 未完了の場合は「仮定義で進め、Task01 完了時に整合確認を行う」という現実的な方針が記載されている。並列進行を阻害しない設計になっている。

### 強み 5: P42 準拠の trim チェックがテスト観点に含まれている

`validation-matrix.md § 2` の Unit テスト観点に `apiKey=" "`（スペースのみ）のケースが明示されており、P42（`.trim()` バリデーション漏れ）の既知の落とし穴への対策が Phase 4 前に取り込まれている。
