# Lessons Learned（教訓集） / current index

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: current summary のインデックス。各カテゴリ別ファイルへの導線を提供する。

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | タスク実行時の苦戦箇所と解決策を記録し、将来の開発効率を向上           |
| スコープ | 実装過程で遭遇した課題、解決策、コード例                               |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-03-18 | 3.0.0 | 1489行 → 400行以下に圧縮。3重重複セクション除去。UT-06-003 を `lessons-learned-safety-gate-ipc-quality.md` に分割。TASK-SKILL-LIFECYCLE-08 仕様書作成/再監査を `lessons-learned-phase12-workflow-lifecycle.md` に移動。SafetyGate P62/P63 は `lessons-learned-safety-gate-permission-fallback.md` で管理 |
| 2026-03-18 | 2.1.1 | TASK-SKILL-LIFECYCLE-02 の苦戦箇所3件追加（P50 既実装検出 / P4+P43 テスト数値伝達ミス / P4 Mirror Sync 早期完了記載）を `lessons-learned-phase12-workflow-lifecycle.md` に追記。合計5件 |
| 2026-03-18 | 2.1.0 | TASK-SKILL-LIFECYCLE-02 の苦戦箇所2件（P31 Zustand 個別セレクタ / P39 happy-dom fireEvent）を `lessons-learned-phase12-workflow-lifecycle.md` に追加 |
| 2026-03-18 | 2.1.0 | 500行制限対応。2026-03-14〜16 の教訓を `lessons-learned-archive-2026-03-mid.md` へ移動。重複エントリ除去。current には 2026-03-17〜18 の教訓のみ保持 |
| 2026-03-17 | 2.0.0 | 651行超過のため4ファイルに分割しインデックス化。分類軸: ViewType/UI、IPC/Preload/Runtime、テスト/型安全、Phase12/ワークフロー |
| 2026-03-17 | 1.30.00 | TASK-SKILL-LIFECYCLE-08 仕様書作成の教訓4件を追加 |
| 2026-03-17 | 1.30.1 | 500行制限対応。2026-03-14〜03-15 の教訓セクション（TASK-SKILL-LIFECYCLE-04/05、TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 P57〜P61、TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 追補、esbuild/payload 再監査）を lessons-learned-archive-2026-03.md へ移動 |
| 2026-03-17 | 1.30.0 | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 実装教訓を追加。GAP-03 影響範囲分析、GAP-02 テスト回帰、P42 バリデーション配置順序を追記 |
| 2026-03-17 | 1.30.00 | TASK-SKILL-LIFECYCLE-08 仕様書作成の教訓4件を追加。docs-only Phase 12 実更新の困難さ、55ファイル間整合性維持、並列サブエージェント情報断絶、Phase 12 Task 6 遵守チェックリスト作成漏れパターンを追記 |
| 2026-03-17 | 1.29.99 | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 再監査。AI_CHECK_CONNECTION 存廃記述衝突、llm:check-health 契約ドリフト、Phase 11 プレースホルダー混入検知手順を追記 |
| 2026-03-17 | 1.29.99 | TASK-SKILL-LIFECYCLE-08 / UT-06-005 の苦戦箇所3件（P62: PermissionStore DI スコープ問題 / P63: SafetyGate metadataProvider 抽象化境界 / フォールバックテスト設計）を追加。`lessons-learned-safety-gate-permission-fallback.md` 新規作成。古いセクション（2026-03-13〜03-14 TASK-SKILL-LIFECYCLE-04/05/P57〜P61 等）を各アーカイブファイルに移動して500行以下に圧縮 |
| 2026-03-17 | 1.29.99 | TASK-SKILL-LIFECYCLE-08 再監査の教訓3件を追加。Phase 12 実績ファイルの planned wording 残存防止、設計タスクでの screenshot 証跡必須化、未タスク参照切れの即時補完ルールを追記 |
| 2026-03-17 | 1.29.99 | TASK-SKILL-LIFECYCLE-08 / UT-06-005 の苦戦箇所3件（P62/P63）を追加 |
| 2026-03-17 | 1.29.98 | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 の苦戦箇所3件を追加 |
| 2026-03-17 | 1.29.98 | TASK-SKILL-LIFECYCLE-08 / UT-06-005 の苦戦箇所3件（P62: PermissionStore DI スコープ問題 / P63: SafetyGate metadataProvider 抽象化境界 / フォールバックテスト設計）を追加 |
| 2026-03-17 | 1.29.97 | UT-06-003 SafetyGate 実装の教訓5件を追加。IPC テスト応答形式不一致（P60）、DIP 違反遅発検出（P61）、P49 違反残存、ternary 分岐カバレッジ特定困難、未タスク配置ディレクトリ間違い（P38 再発）を追記 |
| 2026-03-16 | 1.29.97 | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION の教訓3件を追加。IPC ハンドラ登録漏れ検出、P42 バリデーション一括検証、better-sqlite3 Graceful Degradation を追記 |
| 2026-03-16 | 1.29.96 | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 / UT-06-005 / UT-06-001 / TASK-SKILL-LIFECYCLE-07 / TASK-SKILL-LIFECYCLE-06 の教訓を追加（P57〜P59 新規） |
| 2026-03-15 | 1.29.94 | TASK-SKILL-LIFECYCLE-05 苦戦箇所6追加 |
| 2026-03-14 | 1.29.91 | TASK-SKILL-LIFECYCLE-04 / TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 追加 |
| 2026-03-12 | 1.29.83 | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 追加。SKILL.md 入口 + family file + rolling LOGS + archive の責務分離、mirror/validator 同期手順標準化 |
| 2026-03-12 | 1.29.82 | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 Phase 12 再確認追補。workflow baseline/global legacy 分離報告、skill-creator 同期時の3ファイル同値転記ルール追加 |
| 2026-03-06 | 1.29.43 | UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 追加。大規模 reference スキルの入口設計と validator 不整合を分離、三層入口と validator 整合を未タスク化 |

> 2026-03-14〜16 の教訓は [lessons-learned-archive-2026-03-mid.md](lessons-learned-archive-2026-03-mid.md) を参照。
> 2026-03-13 以前の教訓は [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。

---

## 分割ファイル一覧

### 分割ファイル対応表

| ファイル | カテゴリ | 含まれるタスク | 行数目安 |
| --- | --- | --- | --- |
| [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md) | ViewType / Electron UI | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001, TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 | ~160 |
| [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md) | IPC / Preload / AI Runtime | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001, TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 (P57-P61), TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001, TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 | ~200 |
| [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md) | テスト / 型安全 / 品質 | UT-06-001 (tool-risk-config), UT-06-005 (Permission Fallback) | ~170 |
| [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md) | Phase 12 / ワークフロー / ライフサイクル | TASK-SKILL-LIFECYCLE-02/04/05/06/07/08 | ~390 |
| [lessons-learned-safety-gate-permission-fallback.md](lessons-learned-safety-gate-permission-fallback.md) | SafetyGate / Permission / DI スコープ | TASK-SKILL-LIFECYCLE-08 / UT-06-005 (P62, P63) | ~155 |
| [lessons-learned-safety-gate-ipc-quality.md](lessons-learned-safety-gate-ipc-quality.md) | SafetyGate IPC / DIP / 型安全 | UT-06-003 (P60, P61, P49 再発, P38 再発) | ~130 |

---

### 2026-03-17 TASK-SKILL-LIFECYCLE-08 仕様書作成（設計タスク Phase 1-13）

#### 苦戦箇所1: docs-only タスクでの Phase 12 実更新の worktree コンフリクトリスク

| 項目 | 内容 |
| --- | --- |
| 課題 | worktree 環境で `.claude/skills/` を実更新すると、main ブランチの同ファイルと merge 時にコンフリクトが発生するリスクがある。このリスクを理由に Phase 12 実更新を先送りする判断が繰り返し発生した（P57 の再発） |
| 再発条件 | worktree で設計タスクを実行し、`.claude/skills/` への実更新を「merge 後でよい」と判断する |
| 解決策 | worktree でも Phase 12 完了時点で `.claude/skills/` を実更新する。コンフリクトリスクより仕様書乖離リスクの方が高い。コンフリクト発生時は merge 時に手動解消する |
| 標準ルール | Phase 12 の `.claude/skills/` 実更新は worktree 環境でも先送りしない（P57 準拠） |
| 関連パターン | P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン） |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所2: 55ファイルの成果物間の整合性維持（Phase 間参照チェイン）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 1-12 で55ファイルを生成したが、後続 Phase が前 Phase の成果物パスを参照するチェインが長くなり、N-1 / N-2 Phase の参照が壊れやすかった。Phase 5 で型名を変更した際に Phase 2 / Phase 4 の参照が更新されないケースが発生した |
| 再発条件 | 成果物数が30ファイルを超え、Phase 間の参照が3段以上の深さになる場合 |
| 解決策 | Phase 5 以降で型名・インターフェース名を変更した場合は `grep -rn "旧名" outputs/` で全成果物の参照を検索し、同ターンで更新する |
| 標準ルール | 型名・インターフェース名の変更は、成果物全体の grep 検索と参照更新を同時に行う |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所3: 並列サブエージェント間の情報断絶（P59 再発リスク）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4/5/12 を並列サブエージェントで分担した際、各エージェントが独自に成果物を生成し、後続のメインエージェントが統合する段階で件数・ステータスの不整合が発生した（P59 パターン） |
| 再発条件 | 3つ以上のサブエージェントを並列実行し、各エージェントの成果物を統合する場合 |
| 解決策 | 並列サブエージェントは成果物ファイルを出力し、メインエージェントが統合時に `find outputs/ -name "*.md" | wc -l` で件数を検証する。documentation-changelog は最後にメインエージェントが一括作成する |
| 標準ルール | 並列エージェントの成果物統合後にメインエージェントが件数・ステータスの照合を行い、changelog は事後統合する（P59 準拠） |
| 関連パターン | P59（並列エージェント changelog 件数不整合）、P43（サブエージェント rate limit 中断） |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所4: Phase 12 Task 6（遵守チェックリスト）の作成漏れパターン

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 の Task 1-5 に注力した結果、Task 6（Phase 12 遵守チェックリスト）の作成が漏れた。再監査で初めて欠落が検出され、追加作業が発生した |
| 再発条件 | Phase 12 の Task 数が5以上で、最後の Task が「チェックリスト作成」のようなメタタスクの場合 |
| 解決策 | Phase 12 開始時に Task 6（遵守チェックリスト）を最初に空ファイルで作成し、各 Task 完了ごとにチェックを記入する |
| 標準ルール | Phase 12 遵守チェックリストは最初に空テンプレートで作成し、逐次記入する |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 同種課題の簡潔解決手順（4ステップ）

1. Phase 12 開始時に遵守チェックリスト（Task 6）を空テンプレートで先行作成する。
2. 型名・IF名の変更時は `grep -rn "旧名" outputs/` で成果物全体の参照を同ターンで更新する。
3. 並列エージェントの成果物統合はメインエージェントが件数照合し、changelog は事後一括作成する。
4. worktree 環境でも `.claude/skills/` 実更新を先送りしない（P57 準拠）。

---

### 2026-03-17 TASK-SKILL-LIFECYCLE-08 再監査（Phase 11/12 実績同期）

#### 苦戦箇所1: 実更新済みなのに成果物文書が「計画」記述のまま残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `system-spec-update-summary.md` と `documentation-changelog.md` が計画文言のままで、実更新済みの `.claude/skills/*` と整合しなかった |
| 解決策 | 文書を実績形式へ全面更新し、実際に更新したファイル群と validator 結果を記録した |
| 標準ルール | Phase 12 完了前に「実更新ファイル一覧 + 検証結果 + planned wording 0件」を同一ターンで確定する |

#### 苦戦箇所2: 設計タスクでも screenshot 要求に対する証跡不足

| 項目 | 内容 |
| --- | --- |
| 課題 | docs-only 前提で進めた結果、Phase 11 の TC-ID と screenshot 証跡が不足して validator が失敗した |
| 解決策 | dedicated capture script を作成し、TC-11-01〜03 の screenshot と metadata を再生成した |
| 標準ルール | 設計タスクでもユーザーが画面検証を要求した場合は screenshot 取得を必須にし、`validate-phase11-screenshot-coverage` を完了ゲートに置く |

#### 苦戦箇所3: 未タスク台帳のリンク切れが後段で一括失敗を誘発

| 項目 | 内容 |
| --- | --- |
| 課題 | `task-workflow.md` の `unassigned-task/` 参照切れ12件で `verify-unassigned-links` が失敗した |
| 解決策 | 欠落12件を即時復旧し、TASK-08由来の4件を新規 formalize して台帳を同時更新した |
| 標準ルール | 未タスクの新規/移設時は `verify-unassigned-links` を即時実行し、リンク切れ0件を確認してから Phase 12 を閉じる |

### 2026-03-17 TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 実装（GAP-01〜03 修正）

#### 苦戦箇所1: GAP-03 修正の影響範囲が極めて小さかった理由

| 項目 | 内容 |
| --- | --- |
| 課題 | `?? DEFAULT_CONFIG` を1行削除するだけで済んだ。修正規模が極めて小さい割に、Phase 1-3 の設計フェーズに多くの時間を投資した |
| 再発条件 | Phase 1（要件定義）で「呼び出し元に null チェックが存在するか」を確認せずに設計を進める |
| 解決策 | Phase 1 で `grep -rn "getSelectedLLMConfig" apps/desktop/src/` を実行し、呼び出し元の null チェック状況を事前確認する。既に null チェックが存在するなら DEFAULT_CONFIG fallback のみを削除で済む |
| 標準ルール | 設計フェーズの呼び出し元調査精度が実装の効率に直結する。「影響範囲が小さい」ことが確認できれば Phase 5 の工数見積もりを縮小できる |
| 関連タスク | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |

#### 苦戦箇所2: GAP-02 の既存テスト回帰（`"error"` → `"disconnected"`）

| 項目 | 内容 |
| --- | --- |
| 課題 | `status: "error"` → `"disconnected"` の変更で既存テスト `llm.test.ts` L231 が失敗。`HealthCheckResultSchema` の enum に `"disconnected"` が含まれることは事前確認済みだったが、既存テストの期待値を事前に棚卸しなかった |
| 再発条件 | 既存コードの定数・戻り値を変更する際に、`grep -rn '"error"'` で既存テストの期待値を洗い出さない |
| 解決策 | 値変更前に `grep -rn 'status.*"error"\|"error".*status' apps/desktop/src/__tests__/` で既存テストの期待値を確認してから実装する |
| 標準ルール | 既存の enum 値を変更する場合は、変更前に既存テストの期待値を grep で全件確認し、回帰修正をセットで実施する |
| 関連タスク | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |

#### 苦戦箇所3: P42 バリデーション追加の配置順序

| 項目 | 内容 |
| --- | --- |
| 課題 | P42 準拠の trim チェックを、既存の `if (!request.providerId \|\| !request.modelId)` チェックの**前**に配置すると、undefined/null に対して `.trim()` を呼んで TypeError が発生する |
| 再発条件 | P42 バリデーション（型チェック → 空文字 → trim）を既存のバリデーション順序を無視して追加する |
| 解決策 | バリデーション順序: (1) falsy チェック → (2) 型チェック → (3) 空文字 → (4) trim の順を守る。既存 falsy チェックの**後**に trim チェックを追加する |
| 標準ルール | P42 バリデーション追加時は既存の falsy チェック（`!value`）を先に通過させ、その後に `.trim() === ""` を追加する |
| 関連パターン | P42（文字列引数の .trim() バリデーション漏れ） |
| 関連タスク | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |

```typescript
// ❌ trim を先に追加するとfalsyチェック前にTypeError
if (typeof request.providerId !== "string" || request.providerId.trim() === "") { ... }
if (!request.providerId || !request.modelId) { ... } // ← 既存

// ✅ 正しい順序: falsy → 型 → 空文字 → trim
if (request.providerId || request.modelId) {
  if (!request.providerId || !request.modelId) { ... } // 既存falsy
  if (typeof request.providerId !== "string" || request.providerId.trim() === "") { ... } // P42追加
  if (typeof request.modelId !== "string" || request.modelId.trim() === "") { ... } // P42追加
}
```

#### 同種課題の簡潔解決手順（3ステップ）

1. GAP 修正前に `grep -rn "getSelectedLLMConfig\|handleCheckHealth"` で呼び出し元の null チェック状況を確認し、影響範囲を見積もる。
2. enum 値変更前に `grep -rn '"error"' __tests__/` で既存テストの期待値を全件確認し、回帰修正をセットで計画する。
3. P42 バリデーション追加は falsy チェックの**後**に配置し、`typeof` → `=== ""` → `.trim() === ""` の順を守る。

---

### 2026-03-17 TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 再監査（契約衝突検知）

#### 苦戦箇所: 「廃止完了」と「legacy残置」の二重記述

| 項目 | 内容 |
| --- | --- |
| 課題 | Task06 の成果物で `AI_CHECK_CONNECTION` を「廃止完了」と記述していた一方、実装（`aiHandlers.ts` / `preload/index.ts` / `channels.ts`）は legacy 互換で残存していた |
| 再発条件 | 設計段階の意図（廃止予定）を、実装完了後に実測で上書きしないまま Phase 12 を完了扱いにする |
| 解決策 | 仕様を実装実体へ同期し、`AI_CHECK_CONNECTION` は legacy 方針へ修正。primary 経路を `llm:check-health` に固定した |
| 標準ルール | 存廃を含む IPC は「コード実体 > 設計意図」の順で判定し、Phase 12 で `rg` 実測値を必ず残す |

#### 同種課題の5分解決カード

1. `rg -n "AI_CHECK_CONNECTION|llm:check-health"` を Main/Preload/Spec の3層で同時実行する。  
2. 仕様に「廃止」と書かれている項目は、ハンドラ/チャネル/API型の実体有無を実測で再確認する。  
3. `HealthCheckResult` は `status/latency/checkedAt` の語彙を shared schema と一致させる。  
4. Phase 11 証跡は 1x1 プレースホルダー混入有無を `file` コマンドで確認する。  
5. 差分が残った場合は未タスク化（指示書作成 + backlog 同期）まで同一ターンで閉じる。  

### 2026-03-17 TASK-SKILL-LIFECYCLE-08 / UT-06-005（SafetyGate・Permission・Fallback 実装）

> 詳細版: [lessons-learned-safety-gate-permission-fallback.md](lessons-learned-safety-gate-permission-fallback.md)

#### 苦戦箇所1: PermissionStore の DI スコープ問題（P62）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/ipc/index.ts` で PermissionStore が `track("registerPermissionStoreHandlers")` のクロージャ内部でインスタンス化されていたため、SafetyGate がそのインスタンスにアクセスできなかった。SafetyGate の evaluate() が PermissionStore のデータを参照できず、常にデフォルト判定になる |
| 再発条件 | Graceful Degradation パターン（P54）で `track()` クロージャを使う場合に、クロージャ間で共有が必要なインスタンスをスコープ内でインスタンス化する |
| 解決策 | PermissionStore を `track()` クロージャの外（上位スコープ）に抽出し、PermissionStoreHandlers と SafetyGate の両方から共有参照可能にした |
| 標準ルール | `track()` クロージャを使う場合、複数クロージャ間で共有が必要なインスタンスはスコープ外に抽出する。P34（遅延初期化 DI）と同じく、依存オブジェクトのライフサイクルを事前に設計する |
| 関連パターン | P34（遅延初期化 DI パターン選択）、P54（safeRegister パターン不適合）、P60（createAuthModeService のスコープ制限）|
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

```typescript
// ❌ クロージャ内でインスタンス化 → SafetyGate から参照不能
track("registerPermissionStoreHandlers", () => {
  const permissionStore = new PermissionStore(); // ← スコープ内
  registerPermissionStoreHandlers(permissionStore);
});
const safetyGate = new DefaultSafetyGate(permissionStore); // ← 参照不能

// ✅ 上位スコープに抽出 → 複数クロージャから共有参照
const permissionStore = new PermissionStore(); // ← 上位スコープ
track("registerPermissionStoreHandlers", () => {
  registerPermissionStoreHandlers(permissionStore);
});
track("registerSafetyGateHandlers", () => {
  const safetyGate = new DefaultSafetyGate(permissionStore); // ← 共有参照
  registerSafetyGateHandlers(safetyGate);
});
```

#### 苦戦箇所2: SafetyGate metadataProvider の抽象化境界（P63）

| 項目 | 内容 |
| --- | --- |
| 課題 | DefaultSafetyGate のコンストラクタに `metadataProvider: { getRequiredTools, getAccessPaths }` を渡す設計にしたが、実行時にスキルのメタデータをどこから取得するかが未定義だった。暫定的に空配列を返すスタブ実装（`async () => []`）を入れたが、実スキル実行時にはスキルマニフェストからの動的取得が必要 |
| 再発条件 | インターフェース設計時にデータフローの「ソース（どのモジュールがデータを持つか）」を設計ドキュメントに明示しない場合 |
| 解決策 | 現時点ではスタブ実装を維持し、TASK-SKILL-LIFECYCLE-08 実装フェーズでスキルマニフェストとの統合を行う設計とした。スタブ判断の根拠を Phase 2 設計ドキュメントに明記し、未タスク化した |
| 標準ルール | インターフェースの設計時に「このメソッドのデータソースはどのモジュールか」をデータフロー図またはコメントで明記する。実装時にスタブが残る場合は設計ドキュメントに判断根拠を記録して未タスク化する |
| 関連パターン | P34（遅延初期化 DI）、S-PF-2（revokeSessionEntries スタブ実装の設計判断）|
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所3: フォールバック制御の境界条件テスト設計

| 項目 | 内容 |
| --- | --- |
| 課題 | abort/skip/retry/timeout の4パターン × 正常/異常の組み合わせが多く、テストケースの網羅性確保が困難だった。23テストに絞り込む判断基準が明確でなかった |
| 再発条件 | フォールバック戦略が4種類以上ある場合に、全組み合わせを網羅しようとして最初からテスト数が膨張する |
| 解決策 | 各フォールバック戦略の代表的なケース（成功/失敗/タイムアウト）に限定。revokeSessionEntries は独立したテストグループとして分離することで、テスト間の依存を排除した |
| 標準ルール | フォールバック戦略のテストは「各戦略の最重要パス（成功/失敗）」+「共通インフラの独立テスト」の2層構造で設計する。全組み合わせは Phase 6（テスト拡充）で対応する |
| 関連パターン | S-PF-1（既実装コードの4ステップ abort フロー発見遅延）、S-PF-2（revokeSessionEntries スタブ実装）|
| 関連タスク | UT-06-005 |

#### 同種課題の5分解決カード（DI スコープ + 抽象化境界 + フォールバックテスト）

1. `track()` クロージャ間で共有するインスタンスは、必ず最外スコープでインスタンス化してから各クロージャに渡す（P62 準拠）。
2. インターフェースのメソッドを設計する際は「データソースはどのモジュールか」を設計書に明記し、未定義ならスタブ選択+未タスク化する（P63 準拠）。
3. フォールバックテストは「代表パス × 戦略数 + 独立インフラテスト」の2層構造で設計し、全組み合わせは Phase 6 に委ねる。
4. スタブ実装を選択する場合は Phase 2 に判断根拠を記録し、Phase 12 Task 4 で未タスク化する（S-PF-2 準拠）。
5. `grep -n "permissionStore\|metadataProvider" <target-file>` で依存参照箇所を確認し、スコープを可視化する。

---

### 2026-03-17 UT-06-003 SafetyGate 実装

#### 苦戦箇所1: IPC テスト応答形式の不一致（最も苦戦）

| 項目 | 内容 |
| --- | --- |
| 課題 | テスト I-3〜I-7 が `{ code: "VALIDATION_ERROR" }` のフラットな形式を期待していたが、実装は `{ success: false, error: { code: "VALIDATION_ERROR" } }` のラッパー形式を返していた。テスト全体の修正が必要になった |
| 再発条件 | Phase 4（テスト設計）で IPC レスポンスの wrapper 構造を明示的に決定せず、Phase 5（実装）で初めて形式が確定する |
| 解決策 | テストの全アサーションを `result.error.code` 形式に修正。Phase 4 で IPC レスポンスの wrapper 形式（`{ success, data?, error? }`）を事前に明示的に定義する |
| 標準ルール | IPC ハンドラのテスト設計時にレスポンス構造（success/error wrapper）を Phase 2 設計書に明記し、テストコードに反映する |
| 関連パターン | P60（新規） |
| 関連タスク | UT-06-003 |

```typescript
// Phase 4 でフラットな形式を想定（不正）
expect(result).toEqual({ code: "VALIDATION_ERROR", message: "..." });

// Phase 5 の実装が返す実際の形式
expect(result).toEqual({
  success: false,
  error: { code: "VALIDATION_ERROR", message: "..." },
});
```

#### 苦戦箇所2: DIP 違反の遅発検出

| 項目 | 内容 |
| --- | --- |
| 課題 | `registerSafetyGateHandlers` が `DefaultSafetyGate`（具象クラス）を引数に取っていた。Phase 10 の最終レビューまで検出されなかった |
| 再発条件 | Phase 2 設計で IPC ハンドラの依存先が Port/Interface であることを設計チェック項目に含めない |
| 解決策 | 引数型を `SafetyGatePort`（インターフェース）に変更 |
| 標準ルール | Phase 2 設計書に「IPC ハンドラの依存先が Port/Interface であること」を設計チェック項目として含める |
| 関連パターン | P61（新規）、DIP（依存性逆転原則） |
| 関連タスク | UT-06-003 |

```typescript
// DIP 違反（具象クラス依存）
export function registerSafetyGateHandlers(safetyGate: DefaultSafetyGate): void {}

// DIP 準拠（インターフェース依存）
export function registerSafetyGateHandlers(safetyGate: SafetyGatePort): void {}
```

#### 苦戦箇所3: P49 違反（as キャスト）の残存

| 項目 | 内容 |
| --- | --- |
| 課題 | エラーハンドリングで `(error as { code: string })` を使用。コンパイルは通るが実行時に安全でない |
| 再発条件 | catch ブロック内の `error: unknown` に対して `as` キャストを安易に使用する |
| 解決策 | `in` 演算子 + `typeof` による段階的な実行時検証に置換 |
| 標準ルール | catch ブロック内の `error: unknown` に対しては、必ず `in` 演算子パターンを使用する（P49 準拠） |
| 関連パターン | P49（type predicate 内での `as` キャスト vs `in` 演算子） |
| 関連タスク | UT-06-003 |

```typescript
// P49 違反
const err = error as { code: string };
return { success: false, error: { code: err.code } };

// P49 準拠
if (error != null && typeof error === "object" && "code" in error && typeof error.code === "string") {
  return { success: false, error: { code: error.code } };
}
```

#### 苦戦箇所4: カバレッジ未達箇所の特定困難（ternary 分岐）

| 項目 | 内容 |
| --- | --- |
| 課題 | `normalizePath` の末尾スラッシュ分岐（ternary の true ケース）が未カバー。行レベルのカバレッジレポートでは特定が困難だった |
| 再発条件 | ternary 演算子の分岐カバレッジを行レベルレポートだけで確認しようとする |
| 解決策 | JSON カバレッジ出力 + Node.js スクリプトで正確な未カバー分岐を特定 |
| 標準ルール | ternary 演算子の分岐カバレッジは v8 プロバイダの JSON 出力を使って分析する。行レベルレポートだけでは不十分 |
| 関連パターン | P41（v8 カバレッジプロバイダのインライン関数カウント） |
| 関連タスク | UT-06-003 |

#### 苦戦箇所5: 未タスク配置ディレクトリの間違い（P38 再発）

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスク指示書を `safety-gate-implementation/unassigned-task/` に配置したが、正しくは `docs/30-workflows/unassigned-task/` |
| 再発条件 | workflow ローカルパスに未タスクを配置する（P38/P58 と同一パターン） |
| 解決策 | root canonical path（`docs/30-workflows/unassigned-task/`）へ再配置 |
| 標準ルール | Phase 12 テンプレートに「配置先: `docs/30-workflows/unassigned-task/`」を明示する |
| 関連パターン | P38（未タスク配置ディレクトリ間違い）、P58（設計タスクにおける未タスク指示書の配置省略） |
| 関連タスク | UT-06-003 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 2 設計書に IPC レスポンス wrapper 形式（`{ success, data?, error? }`）と IPC ハンドラの依存先（Port/Interface）を明記する。
2. Phase 4 テスト設計時に Phase 2 のレスポンス形式定義を参照し、アサーションを wrapper 形式で記述する。
3. catch ブロック内の `error: unknown` には `in` 演算子パターンのみ使用し、`as` キャストを禁止する。
4. ternary 演算子の分岐カバレッジは `vitest run --coverage --reporter=json` で JSON 出力して分析する。
5. 未タスク指示書は必ず `docs/30-workflows/unassigned-task/` に配置する。

---

### 2026-03-16 TASK-FIX-ELECTRON-APP-MENU-ZOOM-001

#### 苦戦箇所1: Main Process エントリポイント（index.ts）のトップレベル副作用でテスト不可能

| 項目 | 内容 |
| --- | --- |
| 課題 | Main Process の index.ts に直接メニューロジックを追加しようとしたが、テストファイルで import するだけで `setupCustomProtocol` 等のトップレベル副作用が実行され、テストが動作しない |
| 再発条件 | Main Process のエントリポイント（index.ts）に直接ロジックを追加しようとした時 |
| 解決策 | ロジックを独立したモジュール（menu.ts）に分離してテスト容易性を確保（SRP準拠）。エントリポイントは薄い呼び出し層に留める |
| 標準ルール | Electron Main Process にメニュー/機能を追加する際は、まず独立モジュールに分離してからエントリポイントで呼び出す |
| 関連パターン | P5（リスナー二重登録）、SRP（単一責務原則） |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

#### 苦戦箇所2: Electron role ベースメニューの検証手法

| 項目 | 内容 |
| --- | --- |
| 課題 | Electron の role ベースメニュー項目（cut, copy, paste, zoomIn 等）は OS ネイティブ処理に委譲されるため、動作の直接テストが困難 |
| 再発条件 | Electron の role ベースメニュー項目のテストを書く時 |
| 解決策 | `Menu.buildFromTemplate` のモック呼出し引数を検査してメニュー構造を検証する。`vi.spyOn(process, "platform", "get")` で platform 分岐もテスト可能 |
| 標準ルール | role ベースのメニュー項目は Electron に処理を委譲（カスタム click 不要）し、テストはメニュー構造の検証に留める |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

```typescript
// role ベースメニューのテスト手法
vi.spyOn(process, "platform", "get").mockReturnValue("darwin");
setupApplicationMenu();
const template = vi.mocked(Menu.buildFromTemplate).mock.calls[0][0];
expect(template).toContainEqual(expect.objectContaining({ role: "zoomIn" }));
```

#### 苦戦箇所3: 小規模修正に対する13 Phase ワークフローの適用

| 項目 | 内容 |
| --- | --- |
| 課題 | 83行の新規ファイル + 2行の既存ファイル変更程度の小規模修正に対して、13 Phase のフルワークフローは過剰に見えた |
| 再発条件 | 小規模な機能追加（100行未満）にフルワークフローを適用する場合 |
| 解決策 | テスト20件・カバレッジ100%の品質が確保されており、platform 分岐の品質保証ができた |
| 標準ルール | ワークフローの規模判断は実装行数ではなく、品質保証の必要度（platform 分岐、セキュリティ影響等）で判断する |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Electron Main Process にメニュー/機能を追加する際は、まず独立モジュールに分離する。
2. role ベースのメニュー項目は Electron に処理を委譲し、カスタム click ハンドラは不要。
3. macOS は Apple HIG 準拠の4メニュー（App/Edit/View/Window）、Windows/Linux は最小構成にする。
4. テストは `Menu.buildFromTemplate` のモック引数検査でメニュー構造を検証する。
5. platform 分岐テストは `vi.spyOn(process, "platform", "get").mockReturnValue(...)` でモックする。

---

## クイックリファレンス: カテゴリ別検索ガイド

### ViewType / 画面遷移 / Electron メニュー
-> [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md)
- `renderView` 分岐テスト、screenshot 到達確認、P40 テスト実行ディレクトリ依存
- Electron role ベースメニュー、Main Process エントリポイント副作用

### IPC / Preload / AI Runtime / 認証
-> [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md)
- AuthMode 値乖離（P57）、同名ファイル二重存在（P58）、Preload API 未公開（P59）
- サービススコープ制限（P60）、動的アダプタ注入（P61）
- LLM adapter bind() パターン、CapabilityResolver、esbuild platform mismatch
- IPC payload 契約ドリフト、未タスク target-file 監査

### テスト / 型安全 / 品質検証
-> [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md)
- Object.freeze + satisfies パターン（P19 再発防止）
- テンプレートリテラル型による CSS 変数名の値域制限
- SKILL.md 変更履歴更新漏れ（P29 再発）
- 既実装コードの abort フロー発見遅延（P50）
- PERMISSION_MAX_RETRIES デッドコード化、abortedExecutions メモリリーク

### Phase 12 / ワークフロー / ライフサイクル設計
-> [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md)
- 設計タスクでの仕様書更新先送り（P57）、未タスク指示書配置省略（P58）
- 並列エージェント changelog 件数不整合（P59）
- Phase 12 サブエージェントの実ファイル更新保留
- Phase 3 MINOR 追跡マトリクス、TaskOutput timeout、コンテキスト消失
- Phase 11 必須成果物、artifacts.json 逐次更新忘れ
- 未タスク配置先ドリフト、system spec same-wave 同期

---

## 最新教訓（2026-03-17〜）

### 2026-03-17 TASK-SKILL-LIFECYCLE-08 仕様書作成（設計タスク Phase 1-13）

#### 苦戦箇所1: docs-only タスクでの Phase 12 実更新の worktree コンフリクトリスク

| 項目 | 内容 |
| --- | --- |
| 課題 | worktree 環境で `.claude/skills/` を実更新すると、main ブランチの同ファイルと merge 時にコンフリクトが発生するリスクがある。このリスクを理由に Phase 12 実更新を先送りする判断が繰り返し発生した（P57 の再発） |
| 再発条件 | worktree で設計タスクを実行し、`.claude/skills/` への実更新を「merge 後でよい」と判断する |
| 解決策 | worktree でも Phase 12 完了時点で `.claude/skills/` を実更新する。コンフリクトリスクより仕様書乖離リスクの方が高い。コンフリクト発生時は merge 時に手動解消する |
| 標準ルール | Phase 12 の `.claude/skills/` 実更新は worktree 環境でも先送りしない（P57 準拠） |
| 関連パターン | P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン） |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所2: 55ファイルの成果物間の整合性維持（Phase 間参照チェイン）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 1-12 で55ファイルを生成したが、後続 Phase が前 Phase の成果物パスを参照するチェインが長くなり、N-1 / N-2 Phase の参照が壊れやすかった。Phase 5 で型名を変更した際に Phase 2 / Phase 4 の参照が更新されないケースが発生した |
| 再発条件 | 成果物数が30ファイルを超え、Phase 間の参照が3段以上の深さになる場合 |
| 解決策 | Phase 5 以降で型名・インターフェース名を変更した場合は `grep -rn "旧名" outputs/` で全成果物の参照を検索し、同ターンで更新する |
| 標準ルール | 型名・インターフェース名の変更は、成果物全体の grep 検索と参照更新を同時に行う |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所3: 並列サブエージェント間の情報断絶（P59 再発リスク）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4/5/12 を並列サブエージェントで分担した際、各エージェントが独自に成果物を生成し、後続のメインエージェントが統合する段階で件数・ステータスの不整合が発生した（P59 パターン） |
| 再発条件 | 3つ以上のサブエージェントを並列実行し、各エージェントの成果物を統合する場合 |
| 解決策 | 並列サブエージェントは成果物ファイルを出力し、メインエージェントが統合時に `find outputs/ -name "*.md" | wc -l` で件数を検証する。documentation-changelog は最後にメインエージェントが一括作成する |
| 標準ルール | 並列エージェントの成果物統合後にメインエージェントが件数・ステータスの照合を行い、changelog は事後統合する（P59 準拠） |
| 関連パターン | P59（並列エージェント changelog 件数不整合）、P43（サブエージェント rate limit 中断） |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所4: Phase 12 Task 6（遵守チェックリスト）の作成漏れパターン

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 の Task 1-5 に注力した結果、Task 6（Phase 12 遵守チェックリスト）の作成が漏れた。再監査で初めて欠落が検出され、追加作業が発生した |
| 再発条件 | Phase 12 の Task 数が5以上で、最後の Task が「チェックリスト作成」のようなメタタスクの場合 |
| 解決策 | Phase 12 開始時に Task 6（遵守チェックリスト）を最初に空ファイルで作成し、各 Task 完了ごとにチェックを記入する |
| 標準ルール | Phase 12 遵守チェックリストは最初に空テンプレートで作成し、逐次記入する |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 同種課題の簡潔解決手順（4ステップ）

1. Phase 12 開始時に遵守チェックリスト（Task 6）を空テンプレートで先行作成する。
2. 型名・IF名の変更時は `grep -rn "旧名" outputs/` で成果物全体の参照を同ターンで更新する。
3. 並列エージェントの成果物統合はメインエージェントが件数照合し、changelog は事後一括作成する。
4. worktree 環境でも `.claude/skills/` 実更新を先送りしない（P57 準拠）。

---

### 2026-03-17 TASK-SKILL-LIFECYCLE-08 再監査（Phase 11/12 実績同期）

#### 苦戦箇所1: 実更新済みなのに成果物文書が「計画」記述のまま残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `system-spec-update-summary.md` と `documentation-changelog.md` が計画文言のままで、実更新済みの `.claude/skills/*` と整合しなかった |
| 解決策 | 文書を実績形式へ全面更新し、実際に更新したファイル群と validator 結果を記録した |
| 標準ルール | Phase 12 完了前に「実更新ファイル一覧 + 検証結果 + planned wording 0件」を同一ターンで確定する |

#### 苦戦箇所2: 設計タスクでも screenshot 要求に対する証跡不足

| 項目 | 内容 |
| --- | --- |
| 課題 | docs-only 前提で進めた結果、Phase 11 の TC-ID と screenshot 証跡が不足して validator が失敗した |
| 解決策 | dedicated capture script を作成し、TC-11-01〜03 の screenshot と metadata を再生成した |
| 標準ルール | 設計タスクでもユーザーが画面検証を要求した場合は screenshot 取得を必須にし、`validate-phase11-screenshot-coverage` を完了ゲートに置く |

#### 苦戦箇所3: 未タスク台帳のリンク切れが後段で一括失敗を誘発

| 項目 | 内容 |
| --- | --- |
| 課題 | `task-workflow.md` の `unassigned-task/` 参照切れ12件で `verify-unassigned-links` が失敗した |
| 解決策 | 欠落12件を即時復旧し、TASK-08由来の4件を新規 formalize して台帳を同時更新した |
| 標準ルール | 未タスクの新規/移設時は `verify-unassigned-links` を即時実行し、リンク切れ0件を確認してから Phase 12 を閉じる |

---

### 2026-03-17 TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 実装（GAP-01〜03 修正）

#### 苦戦箇所1: GAP-03 修正の影響範囲が極めて小さかった理由

| 項目 | 内容 |
| --- | --- |
| 課題 | `?? DEFAULT_CONFIG` を1行削除するだけで済んだ。修正規模が極めて小さい割に、Phase 1-3 の設計フェーズに多くの時間を投資した |
| 再発条件 | Phase 1（要件定義）で「呼び出し元に null チェックが存在するか」を確認せずに設計を進める |
| 解決策 | Phase 1 で `grep -rn "getSelectedLLMConfig" apps/desktop/src/` を実行し、呼び出し元の null チェック状況を事前確認する。既に null チェックが存在するなら DEFAULT_CONFIG fallback のみを削除で済む |
| 標準ルール | 設計フェーズの呼び出し元調査精度が実装の効率に直結する。「影響範囲が小さい」ことが確認できれば Phase 5 の工数見積もりを縮小できる |
| 関連タスク | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |

#### 苦戦箇所2: GAP-02 の既存テスト回帰（`"error"` -> `"disconnected"`）

| 項目 | 内容 |
| --- | --- |
| 課題 | `status: "error"` -> `"disconnected"` の変更で既存テスト `llm.test.ts` L231 が失敗。`HealthCheckResultSchema` の enum に `"disconnected"` が含まれることは事前確認済みだったが、既存テストの期待値を事前に棚卸しなかった |
| 再発条件 | 既存コードの定数・戻り値を変更する際に、`grep -rn '"error"'` で既存テストの期待値を洗い出さない |
| 解決策 | 値変更前に `grep -rn 'status.*"error"\|"error".*status' apps/desktop/src/__tests__/` で既存テストの期待値を確認してから実装する |
| 標準ルール | 既存の enum 値を変更する場合は、変更前に既存テストの期待値を grep で全件確認し、回帰修正をセットで実施する |
| 関連タスク | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |

#### 苦戦箇所3: P42 バリデーション追加の配置順序

| 項目 | 内容 |
| --- | --- |
| 課題 | P42 準拠の trim チェックを、既存の `if (!request.providerId \|\| !request.modelId)` チェックの**前**に配置すると、undefined/null に対して `.trim()` を呼んで TypeError が発生する |
| 再発条件 | P42 バリデーション（型チェック -> 空文字 -> trim）を既存のバリデーション順序を無視して追加する |
| 解決策 | バリデーション順序: (1) falsy チェック -> (2) 型チェック -> (3) 空文字 -> (4) trim の順を守る。既存 falsy チェックの**後**に trim チェックを追加する |
| 標準ルール | P42 バリデーション追加時は既存の falsy チェック（`!value`）を先に通過させ、その後に `.trim() === ""` を追加する |
| 関連パターン | P42（文字列引数の .trim() バリデーション漏れ） |
| 関連タスク | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |

```typescript
// falsy -> 型 -> 空文字 -> trim の正しい順序
if (request.providerId || request.modelId) {
  if (!request.providerId || !request.modelId) { ... } // 既存falsy
  if (typeof request.providerId !== "string" || request.providerId.trim() === "") { ... } // P42追加
  if (typeof request.modelId !== "string" || request.modelId.trim() === "") { ... } // P42追加
}
```

#### 同種課題の簡潔解決手順（3ステップ）

1. GAP 修正前に `grep -rn "getSelectedLLMConfig\|handleCheckHealth"` で呼び出し元の null チェック状況を確認し、影響範囲を見積もる。
2. enum 値変更前に `grep -rn '"error"' __tests__/` で既存テストの期待値を全件確認し、回帰修正をセットで計画する。
3. P42 バリデーション追加は falsy チェックの**後**に配置し、`typeof` -> `=== ""` -> `.trim() === ""` の順を守る。

---

### 2026-03-17 TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 再監査（契約衝突検知）

#### 苦戦箇所: 「廃止完了」と「legacy残置」の二重記述

| 項目 | 内容 |
| --- | --- |
| 課題 | Task06 の成果物で `AI_CHECK_CONNECTION` を「廃止完了」と記述していた一方、実装（`aiHandlers.ts` / `preload/index.ts` / `channels.ts`）は legacy 互換で残存していた |
| 再発条件 | 設計段階の意図（廃止予定）を、実装完了後に実測で上書きしないまま Phase 12 を完了扱いにする |
| 解決策 | 仕様を実装実体へ同期し、`AI_CHECK_CONNECTION` は legacy 方針へ修正。primary 経路を `llm:check-health` に固定した |
| 標準ルール | 存廃を含む IPC は「コード実体 > 設計意図」の順で判定し、Phase 12 で `rg` 実測値を必ず残す |

#### 同種課題の5分解決カード

1. `rg -n "AI_CHECK_CONNECTION|llm:check-health"` を Main/Preload/Spec の3層で同時実行する。
2. 仕様に「廃止」と書かれている項目は、ハンドラ/チャネル/API型の実体有無を実測で再確認する。
3. `HealthCheckResult` は `status/latency/checkedAt` の語彙を shared schema と一致させる。
4. Phase 11 証跡は 1x1 プレースホルダー混入有無を `file` コマンドで確認する。
5. 差分が残った場合は未タスク化（指示書作成 + backlog 同期）まで同一ターンで閉じる。

---

### 2026-03-17 TASK-SKILL-LIFECYCLE-08 / UT-06-005（SafetyGate・Permission・Fallback 実装）

> 詳細版: [lessons-learned-safety-gate-permission-fallback.md](lessons-learned-safety-gate-permission-fallback.md)

#### 苦戦箇所1: PermissionStore の DI スコープ問題（P62）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/ipc/index.ts` で PermissionStore が `track("registerPermissionStoreHandlers")` のクロージャ内部でインスタンス化されていたため、SafetyGate がそのインスタンスにアクセスできなかった |
| 再発条件 | Graceful Degradation パターン（P54）で `track()` クロージャを使う場合に、クロージャ間で共有が必要なインスタンスをスコープ内でインスタンス化する |
| 解決策 | PermissionStore を `track()` クロージャの外（上位スコープ）に抽出し、PermissionStoreHandlers と SafetyGate の両方から共有参照可能にした |
| 標準ルール | `track()` クロージャを使う場合、複数クロージャ間で共有が必要なインスタンスはスコープ外に抽出する |
| 関連パターン | P34（遅延初期化 DI パターン選択）、P54（safeRegister パターン不適合）、P60（createAuthModeService のスコープ制限）|
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

```typescript
// 上位スコープに抽出 -> 複数クロージャから共有参照
const permissionStore = new PermissionStore(); // <- 上位スコープ
track("registerPermissionStoreHandlers", () => {
  registerPermissionStoreHandlers(permissionStore);
});
track("registerSafetyGateHandlers", () => {
  const safetyGate = new DefaultSafetyGate(permissionStore); // <- 共有参照
  registerSafetyGateHandlers(safetyGate);
});
```

#### 苦戦箇所2: SafetyGate metadataProvider の抽象化境界（P63）

| 項目 | 内容 |
| --- | --- |
| 課題 | DefaultSafetyGate のコンストラクタに `metadataProvider: { getRequiredTools, getAccessPaths }` を渡す設計にしたが、実行時にスキルのメタデータをどこから取得するかが未定義だった |
| 再発条件 | インターフェース設計時にデータフローの「ソース（どのモジュールがデータを持つか）」を設計ドキュメントに明示しない場合 |
| 解決策 | 現時点ではスタブ実装を維持し、TASK-SKILL-LIFECYCLE-08 実装フェーズでスキルマニフェストとの統合を行う設計とした |
| 標準ルール | インターフェースの設計時に「このメソッドのデータソースはどのモジュールか」をデータフロー図またはコメントで明記する |
| 関連パターン | P34（遅延初期化 DI）、S-PF-2（revokeSessionEntries スタブ実装の設計判断）|
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所3: フォールバック制御の境界条件テスト設計

| 項目 | 内容 |
| --- | --- |
| 課題 | abort/skip/retry/timeout の4パターン x 正常/異常の組み合わせが多く、テストケースの網羅性確保が困難だった |
| 再発条件 | フォールバック戦略が4種類以上ある場合に、全組み合わせを網羅しようとして最初からテスト数が膨張する |
| 解決策 | 各フォールバック戦略の代表的なケース（成功/失敗/タイムアウト）に限定。revokeSessionEntries は独立したテストグループとして分離 |
| 標準ルール | フォールバック戦略のテストは「各戦略の最重要パス（成功/失敗）」+「共通インフラの独立テスト」の2層構造で設計する |
| 関連タスク | UT-06-005 |

---

### 2026-03-17 UT-06-003 SafetyGate 実装

#### 苦戦箇所1: IPC テスト応答形式の不一致（最も苦戦）

| 項目 | 内容 |
| --- | --- |
| 課題 | テスト I-3〜I-7 が `{ code: "VALIDATION_ERROR" }` のフラットな形式を期待していたが、実装は `{ success: false, error: { code: "VALIDATION_ERROR" } }` のラッパー形式を返していた |
| 再発条件 | Phase 4（テスト設計）で IPC レスポンスの wrapper 構造を明示的に決定せず、Phase 5（実装）で初めて形式が確定する |
| 解決策 | テストの全アサーションを `result.error.code` 形式に修正。Phase 4 で IPC レスポンスの wrapper 形式を事前に定義する |
| 標準ルール | IPC ハンドラのテスト設計時にレスポンス構造（success/error wrapper）を Phase 2 設計書に明記する |
| 関連パターン | P60（新規） |
| 関連タスク | UT-06-003 |

#### 苦戦箇所2: DIP 違反の遅発検出

| 項目 | 内容 |
| --- | --- |
| 課題 | `registerSafetyGateHandlers` が `DefaultSafetyGate`（具象クラス）を引数に取っていた。Phase 10 まで検出されなかった |
| 解決策 | 引数型を `SafetyGatePort`（インターフェース）に変更 |
| 標準ルール | Phase 2 設計書に「IPC ハンドラの依存先が Port/Interface であること」を設計チェック項目として含める |
| 関連パターン | P61（新規）、DIP（依存性逆転原則） |
| 関連タスク | UT-06-003 |

#### 苦戦箇所3: P49 違反（as キャスト）の残存

| 項目 | 内容 |
| --- | --- |
| 課題 | エラーハンドリングで `(error as { code: string })` を使用 |
| 解決策 | `in` 演算子 + `typeof` による段階的な実行時検証に置換 |
| 標準ルール | catch ブロック内の `error: unknown` に対しては、必ず `in` 演算子パターンを使用する（P49 準拠） |
| 関連パターン | P49（type predicate 内での `as` キャスト vs `in` 演算子） |
| 関連タスク | UT-06-003 |

#### 苦戦箇所4: カバレッジ未達箇所の特定困難（ternary 分岐）

| 項目 | 内容 |
| --- | --- |
| 課題 | `normalizePath` の末尾スラッシュ分岐（ternary の true ケース）が未カバー。行レベルのカバレッジレポートでは特定が困難だった |
| 解決策 | JSON カバレッジ出力 + Node.js スクリプトで正確な未カバー分岐を特定 |
| 標準ルール | ternary 演算子の分岐カバレッジは v8 プロバイダの JSON 出力を使って分析する |
| 関連タスク | UT-06-003 |

#### 苦戦箇所5: 未タスク配置ディレクトリの間違い（P38 再発）

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスク指示書を `safety-gate-implementation/unassigned-task/` に配置したが、正しくは `docs/30-workflows/unassigned-task/` |
| 解決策 | root canonical path（`docs/30-workflows/unassigned-task/`）へ再配置 |
| 標準ルール | Phase 12 テンプレートに「配置先: `docs/30-workflows/unassigned-task/`」を明示する |
| 関連パターン | P38（未タスク配置ディレクトリ間違い）、P58 |
| 関連タスク | UT-06-003 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 2 設計書に IPC レスポンス wrapper 形式と IPC ハンドラの依存先（Port/Interface）を明記する。
2. Phase 4 テスト設計時に Phase 2 のレスポンス形式定義を参照し、アサーションを wrapper 形式で記述する。
3. catch ブロック内の `error: unknown` には `in` 演算子パターンのみ使用し、`as` キャストを禁止する。
4. ternary 演算子の分岐カバレッジは `vitest run --coverage --reporter=json` で JSON 出力して分析する。
5. 未タスク指示書は必ず `docs/30-workflows/unassigned-task/` に配置する。

---

## TASK-IMP-CHATPANEL-REAL-AI-CHAT-001: ChatPanel 実AIチャット配線（設計タスク）

> 記録日: 2026-03-18

### 苦戦1: 旧設計セクションと新設計セクションの共存問題

- **問題**: arch-state-management-core.md に旧8状態定義（L91-145）と新8状態定義（L432-527）が共存し、設計の正本がどちらか不明確になった
- **発見経緯**: Phase 12 完了後の多角的レビュー（3並列エージェント）で spec-audit-system エージェントが検出。Phase 2-10 では見逃されていた
- **解決策**: 旧セクションに廃止注記（`> [DEPRECATED]`）を追加し、新セクションへの参照誘導を設置
- **教訓**: 仕様書に新セクションを追加する際は、同一概念を定義する旧セクションを `grep -n "^##\|^###" {ファイル}` で検索し、廃止処理を同時に行うこと
- **関連 Pitfall**: P26（システム仕様書更新遅延）の派生パターン

### 苦戦2: Phase 10 MINOR ID と Phase 12 未タスク ID の不整合

- **問題**: Phase 10 で付与された MINOR-1/MINOR-2 という ID が、Phase 12 Task 4 で COV-001/GUARD-001 等の別体系 ID に置き換えられた。task-workflow-backlog.md に誤った ID とファイルパスで登録され、追跡不能になった
- **発見経緯**: 多角的レビューの spec-audit-task エージェントが backlog 登録の不整合を検出
- **解決策**: backlog の2件を削除し、正しい6件（GUARD-001, COV-001〜003, STUB-001, REFACTOR-001）で再登録
- **教訓**: Phase 10 MINOR 判定の ID は Phase 12 Task 4 で未タスク化する際に正式 ID に変換される。変換時に旧 ID のエントリを必ず削除すること
- **関連 Pitfall**: P3（未タスク管理の3ステップ不完全）

### 苦戦3: blocked->ready 遷移トリガーの IPC チャンネル不一致

- **問題**: state-machine.md で `blocked->ready` 遷移のトリガーを `auth-key:exists` と定義したが、LLM プロバイダー API キーの検証には `llm:check-health` が適切。Claude Agent SDK のキー存在確認と LLM プロバイダーの疎通確認は異なる概念
- **発見経緯**: 多角的レビューの elegance-review エージェント（深層分析）が検出
- **解決策**: verification-report.md の NOTE-4 として記録し、後続実装タスクで確定する方針
- **教訓**: 設計書内に IPC チャンネル名を記載する際は、`grep -rn "チャンネル名" apps/desktop/src/` で実装コードに同チャンネルが存在することを確認すること

### 苦戦4: 並列エージェント間の情報断絶（P59 再確認）

- **問題**: Phase 12 を複数の並列エージェントで分担した際、documentation-changelog 作成エージェントと未タスク検出エージェントの間で件数不整合が発生
- **教訓**: documentation-changelog は全 SubAgent 完了後にメインエージェントが一括作成する。SubAgent に委譲した場合は `unassigned-task-detection.md` の件数と照合してから完了とする
- **関連 Pitfall**: P59（並列エージェントによる changelog 件数不整合）

### 苦戦5: インラインセレクタ vs 個別セレクタの設計判断遅延

