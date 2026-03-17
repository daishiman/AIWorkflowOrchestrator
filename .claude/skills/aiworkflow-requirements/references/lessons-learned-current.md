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
| 2026-03-17 | 2.0.0 | 651行超過のため4ファイルに分割しインデックス化。分類軸: ViewType/UI、IPC/Preload/Runtime、テスト/型安全、Phase12/ワークフロー |
| 2026-03-17 | 1.29.99 | TASK-SKILL-LIFECYCLE-08 / UT-06-005 の苦戦箇所3件（P62: PermissionStore DI スコープ問題 / P63: SafetyGate metadataProvider 抽象化境界 / フォールバックテスト設計）を追加。`lessons-learned-safety-gate-permission-fallback.md` 新規作成。古いセクション（2026-03-13〜03-14 TASK-SKILL-LIFECYCLE-04/05/P57〜P61 等）を各アーカイブファイルに移動して500行以下に圧縮 |
| 2026-03-17 | 1.29.98 | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 の苦戦箇所3件を追加 |
| 2026-03-17 | 1.29.97 | UT-06-003 SafetyGate 実装の教訓5件を追加。IPC テスト応答形式不一致（P60）、DIP 違反遅発検出（P61）、P49 違反残存、ternary 分岐カバレッジ特定困難、未タスク配置ディレクトリ間違い（P38 再発）を追記 |
| 2026-03-16 | 1.29.97 | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION の教訓3件を追加。IPC ハンドラ登録漏れ検出、P42 バリデーション一括検証、better-sqlite3 Graceful Degradation を追記 |
| 2026-03-16 | 1.29.96 | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 / UT-06-005 / UT-06-001 / TASK-SKILL-LIFECYCLE-06/07 の教訓を追加 |
| 2026-03-15 | 1.29.94 | TASK-SKILL-LIFECYCLE-05 苦戦箇所6追加 |
| 2026-03-14 | 1.29.91 | TASK-SKILL-LIFECYCLE-04 / TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 追加 |
| 2026-03-12 | 1.29.83 | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 追加。SKILL.md 入口 + family file + rolling LOGS + archive の責務分離、mirror/validator 同期手順標準化 |
| 2026-03-12 | 1.29.82 | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 Phase 12 再確認追補。workflow baseline/global legacy 分離報告、skill-creator 同期時の3ファイル同値転記ルール追加 |
| 2026-03-06 | 1.29.43 | UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 追加。大規模 reference スキルの入口設計と validator 不整合を分離、三層入口と validator 整合を未タスク化 |

> 2026-03-13〜03-14 の旧セクション（TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 / CHAT-EDIT / TERMINAL-SURFACE）は [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。
> TASK-SKILL-LIFECYCLE-04/05、P57〜P61 は [lessons-learned-skill-lifecycle-test-hardening.md](lessons-learned-skill-lifecycle-test-hardening.md) および [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。

---

## 分割ファイル一覧

### 分割ファイル対応表

| ファイル | カテゴリ | 含まれるタスク | 行数目安 |
| --- | --- | --- | --- |
| [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md) | ViewType / Electron UI | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001, TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 | ~160 |
| [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md) | IPC / Preload / AI Runtime | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001, TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 (P57-P61), TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001, TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 | ~200 |
| [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md) | テスト / 型安全 / 品質 | UT-06-001 (tool-risk-config), UT-06-005 (Permission Fallback) | ~170 |
| [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md) | Phase 12 / ワークフロー / ライフサイクル | TASK-SKILL-LIFECYCLE-04/05/06/07 | ~290 |

---

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
→ [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md)
- `renderView` 分岐テスト、screenshot 到達確認、P40 テスト実行ディレクトリ依存
- Electron role ベースメニュー、Main Process エントリポイント副作用

### IPC / Preload / AI Runtime / 認証
→ [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md)
- AuthMode 値乖離（P57）、同名ファイル二重存在（P58）、Preload API 未公開（P59）
- サービススコープ制限（P60）、動的アダプタ注入（P61）
- LLM adapter bind() パターン、CapabilityResolver、esbuild platform mismatch
- IPC payload 契約ドリフト、未タスク target-file 監査

### テスト / 型安全 / 品質検証
→ [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md)
- Object.freeze + satisfies パターン（P19 再発防止）
- テンプレートリテラル型による CSS 変数名の値域制限
- SKILL.md 変更履歴更新漏れ（P29 再発）
- 既実装コードの abort フロー発見遅延（P50）
- PERMISSION_MAX_RETRIES デッドコード化、abortedExecutions メモリリーク

### Phase 12 / ワークフロー / ライフサイクル設計
→ [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md)
- 設計タスクでの仕様書更新先送り（P57）、未タスク指示書配置省略（P58）
- 並列エージェント changelog 件数不整合（P59）
- Phase 12 サブエージェントの実ファイル更新保留
- Phase 3 MINOR 追跡マトリクス、TaskOutput timeout、コンテキスト消失
- Phase 11 必須成果物、artifacts.json 逐次更新忘れ
- 未タスク配置先ドリフト、system spec same-wave 同期

---

### 2026-03-16 TASK-SKILL-LIFECYCLE-06

#### 苦戦箇所1: 設計タスクでのシステム仕様書更新先送り（P57）

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計タスク（型定義・契約定義のみ）では「`.claude/skills/` の実更新は PR 作成時に実施」と先送りし、`system-spec-update-summary.md` に計画文だけを記録した。Phase 12 完了条件を満たさなかった |
| 再発条件 | 「プロダクションコードがないから仕様書更新は後でよい」と判断する |
| 解決策 | 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない（TASK-SKILL-LIFECYCLE-05 苦戦箇所6 の再発） |
| 関連パターン | P57（新規）、P26（システム仕様書更新遅延） |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 苦戦箇所2: 設計タスクを理由とした未タスク指示書の配置省略（P58）

| 項目 | 内容 |
| --- | --- |
| 課題 | 「設計タスクだから」という例外判断で `docs/30-workflows/unassigned-task/` への独立指示書ファイルの作成を省略した |
| 再発条件 | タスク種別を理由に P3 の3ステップを例外扱いにする |
| 解決策 | 設計タスクの未タスクであっても独立した指示書ファイルを `docs/30-workflows/unassigned-task/` に作成する |
| 標準ルール | P3（①指示書作成 → ②task-workflow 登録 → ③関連仕様書リンク追加）に例外はない |
| 関連パターン | P58（新規）、P3、P38 |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 苦戦箇所3: 並列エージェント分担による documentation-changelog 件数不整合（P59）

| 項目 | 内容 |
| --- | --- |
| 課題 | documentation-changelog.md に「Task 4 検出件数: 0件」と記載されたが、実際の `unassigned-task-detection.md` では8件検出されていた |
| 再発条件 | 並列エージェントで分担し、changelog を各エージェントが個別に記録する |
| 解決策 | documentation-changelog.md は全 Task 完了後にメインエージェントが一括作成し、`unassigned-task-detection.md` の検出件数と照合してから記録する |
| 標準ルール | changelog は「事後統合」する。並列エージェントの中間報告をそのまま changelog に転記しない |
| 関連パターン | P59（新規）、P4、P43、P51 |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 同種課題の簡潔解決手順（3ステップ）

1. Phase 12 開始時に「設計タスク / 実装タスク」に関わらず `.claude/skills/` の実更新を必須とし、計画文ではなく実績ログのみを記録する。
2. 未タスク検出は P3 の3ステップを必ず完遂し、タスク種別を理由に例外判断をしない。
3. documentation-changelog はメインエージェントが最終統合する。

---

### 2026-03-16 UT-06-005 Permission Fallback（abort/skip/retry/timeout）

#### 苦戦箇所 S-PF-1: 既実装コードの4ステップ abort フロー発見遅延

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4 でテストを書き始めた段階で、abort 4ステップ（cancelAll→revokeSessionEntries→log→IPC通知）が既に SkillExecutor.ts に実装済みだった |
| 再発条件 | 大規模ファイル（SkillExecutor.ts 1500行超）のコード調査が不十分なまま Phase 1 に入る場合 |
| 解決策 | Phase 1 で `git log --oneline -- <target-file>` と `grep -n "abort\|fallback\|retry" <target-file>` を実行し、既存実装の有無を確認してから要件を策定する |
| 関連パターン | P50（既実装防御の発見による Phase 転換）|
| 関連タスク | UT-06-005 |

#### 苦戦箇所 S-PF-2: revokeSessionEntries スタブ実装の設計判断

| 項目 | 内容 |
| --- | --- |
| 課題 | abort フローの Step 2（revokeSessionEntries）がスタブ実装（全エントリクリア）のまま。セッション別フィルタリングには AllowedToolEntry に sessionId 追加が必要で、スコープ外と判断した |
| 再発条件 | 既存の型定義（AllowedToolEntry）を拡張すると、関連テスト・仕様書への影響範囲が広すぎる場合 |
| 解決策 | スタブ実装を選択し、本格実装を UT-06-005-B として未タスク化。スタブ判断の根拠を Phase 2 設計ドキュメントに明記する |
| 関連タスク | UT-06-005, UT-06-005-B |

#### 苦戦箇所 S-PF-3: PERMISSION_MAX_RETRIES デッドコード化と abortedExecutions メモリリーク

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 10 最終レビューで2件の品質問題を検出: (1) `PERMISSION_MAX_RETRIES=3` がデッドコード化 (2) `abortedExecutions: Set<string>` にクリア機構がなくメモリリーク |
| 再発条件 | 定数を定義しても使用箇所で参照せず直値を使うパターン、Set/Map のクリーンアップ忘れ |
| 解決策 | (1) retryCounters の条件を `PERMISSION_MAX_RETRIES` 参照に変更 (2) abortedExecutions にセッション単位のクリア機構を追加 |
| 関連タスク | UT-06-005 |

#### 同種課題の5分解決カード

1. `grep -n "abort\|fallback\|retry\|skip" <target-file>` で既存実装を確認
2. 既実装の場合は Phase 4-5 を「検証・補完」モードに切り替え（P50 準拠）
3. スタブ実装が必要な場合は Phase 2 に判断根拠を記録し、未タスク化を Phase 12 Task 4 に組み込む
4. 定数定義は `grep -rn "CONST_NAME" <file>` で使用箇所を確認、未使用は即修正
5. Set/Map を使う場合は cleanup 機構（セッション終了時の clear/delete）を設計段階で明記

---

### 2026-03-16 TASK-SKILL-LIFECYCLE-07

#### 苦戦箇所1: Phase 12 サブエージェントが「設計タスク範囲外」として実ファイル更新を保留する

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 の Step 1-A〜Step 2 で、サブエージェントが「設計タスクなので実ファイル更新は実装タスクで行う」と判断し、更新計画のみ記録した |
| 再発条件 | 設計タスク（spec_created）で Phase 12 を実行する場合に、「設計 = ファイル変更不要」と誤解する |
| 解決策 | 設計タスクでも Step 1-A（タスク完了記録）、Step 1-C（関連タスクテーブル）、Step 2（システム仕様更新）は実ファイルへの書き込みが必須 |
| 標準ルール | Phase 12 のシステム仕様書更新は、タスク種別に関わらず実ファイル変更を必ず伴う |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 苦戦箇所2: Phase 3 MINOR 4件の追跡フローが Phase 横断で見失われる

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 3 で検出された MINOR 4件が Phase 5→9→10 を横断する過程で、追跡マトリクスを作成しなかったため対応状況の確認に時間がかかった |
| 再発条件 | Phase 3 の MINOR 指摘が4件以上で、複数 Phase にまたがる修正が必要な場合 |
| 解決策 | Phase 5 完了時点で「Phase 3 MINOR 追跡マトリクス」を作成し、各指摘の対応状況を明示する |
| 標準ルール | Phase 3 の MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成する |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 苦戦箇所3: バックグラウンドエージェントの TaskOutput timeout パターン

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列実行したバックグラウンドエージェントが10分 timeout で結果取得に失敗したが、実際には成果物ファイルの生成は完了していた |
| 再発条件 | 大量の成果物を生成する Phase（Phase 4/5/12）をバックグラウンドエージェントで実行した場合 |
| 解決策 | timeout 後は `find` / `ls` で成果物ファイルの存在を直接確認する |
| 標準ルール | バックグラウンドエージェント timeout 後は成果物ファイルの存在確認を優先する |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 苦戦箇所4: コンテキストウィンドウ圧縮で前セッションのエージェント結果が消失する

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列エージェントの結果をメモリ上で保持したが、コンテキストウィンドウ圧縮により前セッションの結果が参照不能になった |
| 再発条件 | 長時間セッションで並列エージェントを多用し、結果をファイル出力せずメモリのみで保持した場合 |
| 解決策 | 並列エージェントの結果は必ず成果物ファイルとして出力し、後続 Phase ではファイルから読み取る |
| 標準ルール | 並列エージェントは成果物ファイル出力を優先し、結果参照はファイルベースで行う |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 同種課題の簡潔解決手順（4ステップ）

1. 設計タスクの Phase 12 でも実ファイル更新を必ず実施する。「更新計画の記録」だけでは成果物にならない。
2. Phase 3 MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成する。
3. バックグラウンドエージェント timeout 後は `find`/`ls` で成果物存在を直接確認する。
4. 並列エージェントの結果は成果物ファイルに出力し、コンテキスト消失に備える。

---

### 2026-03-15 TASK-SKILL-LIFECYCLE-05

#### 苦戦箇所1: Phase 11 の必須成果物が揃っておらず screenshot coverage validator が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | `manual-test-result.md` のみで運用し、`manual-test-checklist.md` と `screenshot-plan.json` が欠落した状態で再監査に進んでしまった |
| 再発条件 | 「スクリーンショットがあるから十分」と判断し、validator 前提ファイルを確認しない |
| 解決策 | `outputs/phase-11/` を `checklist/result/plan/screenshots` の4点セットで再構成し、TC-11-01〜05 の証跡を 1:1 で再紐付けした |
| 標準ルール | Phase 11 完了判定は `validate-phase11-screenshot-coverage` PASS を必須にし、必須ファイル欠落を残さない |

#### 苦戦箇所2: docs-heavy task の画面検証が build 依存で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | current build での capture が環境要因で不安定なとき、画面検証の証跡収集が止まりやすい |
| 再発条件 | fallback 経路を事前定義せず、実画面 capture 成功だけを前提に運用する |
| 解決策 | source screenshot を current workflow に集約し、review board 1件を current workflow で新規 capture、metadata で source と用途を明記した |
| 標準ルール | docs-heavy + screenshot要求時は review board fallback を許容し、source / review board / metadata を同時に記録する |

#### 苦戦箇所3: implementation-guide の literal 要件漏れで Phase 12 が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | Part 1 の「なぜ先行」と Part 2 の「使用例」「エッジケース」が欠けると validator で fail する |
| 再発条件 | 内容は充実していても、validator が見る literal 見出し・語句を満たさない |
| 解決策 | Part 1 冒頭に why-first を追加し、Part 2 に API 使用例セクションとエッジケースセクションを明示追加した |
| 標準ルール | implementation-guide は内容品質だけでなく validator literal 互換を同時に満たす |

#### 苦戦箇所4: Record パターンでの ScoringGate 網羅性保証

| 項目 | 内容 |
| --- | --- |
| 課題 | switch 文で ScoringGate の4段階を分岐しようとしたが、新しい段階が追加された場合にコンパイルエラーにならない。exhaustive check の `default: never` パターンも検討したが、静的マッピングの方が安全だった |
| 再発条件 | ユニオン型の分岐に switch 文を使い、exhaustive check を忘れる |
| 解決策 | `Record<ScoringGate, CTAVisibility>` で全キーの定義を型レベルで強制する。キーが不足するとコンパイルエラーになるため、網羅性が保証される |
| 標準ルール | ユニオン型の全ケース網羅には `Record<UnionType, Config>` パターンを使う（02-code-quality.md 準拠） |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所5: 設計タスクの artifacts.json 逐次更新忘れ

| 項目 | 内容 |
| --- | --- |
| 課題 | 49成果物を全て作成済みだったが、artifacts.json の phase status が全て `not_started` のまま放置。3つの並列検証エージェントで全Phase PASS を確認した後に初めて発見した |
| 再発条件 | 設計タスクでは「コードを書かない」前提があり、状態ファイルの更新が後回しにされる |
| 解決策 | 各Phase完了ごとに artifacts.json の status, artifacts 配列, acceptanceCriteria を逐次更新。最終的に status: "completed" + 全AC verified: true に更新した |
| 標準ルール | artifacts.json は Phase 完了の正式記録であり、成果物作成と同時に更新する |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所6: Phase 12 本文と成果物の実績が乖離する

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-12-documentation.md` が `not_started` のまま、`documentation-changelog.md` に「実装タスクで後続対応」といった計画文が残り、成果物実体と矛盾した |
| 再発条件 | outputs 実体更新後に本体仕様書と changelog を同時更新しない |
| 解決策 | `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3点を同一ターンで更新し、planned wording を除去した |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 開始時に `checklist/result/plan/screenshots` の4点セットを先に作る。
2. screenshot 取得は「実画面試行 → fallback review board → metadata固定」の順で閉じる。
3. Phase 12 は `implementation-guide` の literal 要件を先に満たしてから詳細説明を肉付けする。
4. `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` を同時に更新して整合を固定する。
5. 最終判定で `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を連続実行する。

---

### 2026-03-14 TASK-SKILL-LIFECYCLE-04

#### 苦戦箇所1: 未タスク配置先ドリフトで指定ディレクトリ監査が不成立になる

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスクを `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/` に置いたため、`--target-file` 監査境界と衝突した |
| 再発条件 | workflow ローカル path を temporary 運用のまま台帳反映する |
| 解決策 | root canonical path（`docs/30-workflows/unassigned-task/`）へ再配置し、`phase-12-documentation` / `unassigned-task-detection` / `task-workflow-backlog` / `interfaces` 参照を同ターン更新した |
| 標準ルール | active 未タスクは root canonical path を正本とし、workflow ローカル path は使わない |

#### 苦戦箇所2: `current`/`baseline` と配置可否を同一判定にすると報告が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | 監査値だけで「指定ディレクトリに置けているか」を判定しようとして説明が曖昧になった |
| 再発条件 | 配置可否・link整合・監査値を 1 つの数値で報告する |
| 解決策 | `配置可否`、`verify-unassigned-links`、`audit --diff-from HEAD --target-file` を3軸で分離記録した |
| 標準ルール | `currentViolations=0` は品質判定、配置可否は別項目として必ず明記する |

#### 苦戦箇所3: system spec の同期対象を絞りすぎると same-wave が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | workflow 成果物だけ更新して `resource-map` / `quick-reference` / `legacy register` / `LOGS` を後回しにすると、再利用入口が stale になる |
| 再発条件 | 「実装記録は完了したので index は後でよい」と判断する |
| 解決策 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` を統合正本として追加し、`current canonical set` と `artifact inventory` を起点に parent docs / ledger / indexes / logs を同一 wave で同期した |
| 標準ルール | Phase 12 の close-out は `workflow + parent docs + task-workflow + lessons + indexes + LOGS + mirror` を最小単位とする |

#### 同種課題の簡潔解決手順（4ステップ）

1. MINOR 検出時に未タスク指示書を root `docs/30-workflows/unassigned-task/` へ作成する。
2. 指示書は 9セクション形式（`## 1..9` + `3.5`）で作り、親タスク苦戦箇所を継承する。
3. `task-workflow-backlog` / 関連仕様書 / workflow outputs の参照を同ターンで更新する。
4. `verify-unassigned-links` と `audit --diff-from HEAD --target-file` で link と品質を分離検証する。

---

### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57〜P61）

#### P57: 設計書と実コードの AuthMode 値の乖離

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計ドキュメントでは AuthMode を `"integrated"` / `"terminal"` / `"hybrid"` の3値で定義したが、実コードベースでは `"subscription" \| "api-key"` の2値。RuntimeResolver の実装時に解決テーブルの全面書き直しが必要だった |
| 再発条件 | Phase 2（設計）で想定値を使い、実コードの型定義を検証しない |
| 解決策 | Phase 1（要件定義）で `grep -rn "AuthMode" packages/shared/` を実行し、正本の型定義値を確認する。設計書で想定値を使う前に必ず実コードの型を検証 |
| 標準ルール | 設計書で列挙型の値を参照するときは、実コードの型定義を正本として先に確認する |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P58: 同名ファイルの二重存在（chatEditHandlers.ts）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/handlers/chatEditHandlers.ts` と `apps/desktop/src/main/ipc/chatEditHandlers.ts` の2つが存在し、実際に `ipc/index.ts` から import されているのは `ipc/chatEditHandlers.ts` だった。設計書は `handlers/chatEditHandlers.ts` を参照しており、誤ったファイルを修正するリスクがあった |
| 再発条件 | 設計書のファイルパスを信じて修正対象を決め、実際の import 元を確認しない |
| 解決策 | 修正対象ファイルの特定には `grep -rn "import.*chatEditHandlers" apps/desktop/src/main/` で実際の import 元を確認する |
| 標準ルール | 同名ファイルが複数ディレクトリに存在する場合、`grep import` で実際に使用されている方を正本とする |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P59: Preload API 未公開（exposeChatEditAPI 呼び出し欠落）

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditApi.ts` に `exposeChatEditAPI()` 関数は定義されていたが、`preload/index.ts` で一切呼ばれておらず、`chatEditAPI` が Renderer に完全に未公開だった。他の全 API（electronAPI, agentAPI 等）は contextBridge 経由で公開済みだった |
| 症状 | `window.chatEditAPI` が `undefined` で全ての chat-edit IPC 呼び出しが失敗 |
| 再発条件 | 新規 Preload API を定義するだけで `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックへの追記を忘れる |
| 解決策 | 新規 Preload API を追加した場合、`preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと else ブロックの両方に追記されているか必ず確認する |
| 再発防止 | `grep -c "exposeInMainWorld" preload/index.ts` と `grep -c "chatEditAPI\|slideApi\|agentAPI" preload/index.ts` で API 公開数を監査 |
| 関連パターン | M-01（contextBridge 未使用）、P23（API二重定義の型管理複雑性） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P60: createAuthModeService のスコープ制限

| 項目 | 内容 |
| --- | --- |
| 課題 | `ipc/index.ts` で `createAuthModeService(authKeyService)` が `track("registerAuthModeHandlers", ...)` コールバック内で呼ばれており、そのスコープ外（chat-edit ハンドラ登録ブロック）からは参照できなかった。chat-edit ハンドラにも authModeService が必要だったため、別インスタンスを生成する必要があった |
| 再発条件 | 複数のハンドラ登録ブロックで同じサービスが必要なのに、外側スコープに引き上げない |
| 解決策 | 複数のハンドラ登録ブロックで同じサービスが必要な場合、外側スコープで生成するか、各ブロック内で `createXxxService()` を呼ぶ |
| 標準ルール | サービスの共有スコープは「最も外側の共通消費者」に合わせて配置する |
| 関連パターン | P34（遅延初期化 DI パターン選択） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P61: ChatEditService の動的アダプタ注入

| 項目 | 内容 |
| --- | --- |
| 課題 | ChatEditService はコンストラクタで LLMAdapter を受け取る設計だが、RuntimeResolver の結果（API キー有無）によって adapter が変わるため、毎回 `new ChatEditService(resolution.adapter, contextBuilder)` で生成する方式を採用。stubLLMAdapter を置き換える際、Setter Injection ではなく Factory パターンに近い動的生成が最適だった |
| 再発条件 | adapter が呼び出し時の状態に依存するのに、インスタンスをキャッシュする |
| 解決策 | adapter が呼び出し時の状態に依存する場合は、毎回 new でインスタンスを生成する。API キーが変更される可能性を考慮すると、キャッシュを避ける |
| 標準ルール | DI 対象が実行時コンテキスト依存（認証状態等）の場合は Factory パターンで毎回生成する |
| 関連パターン | P34（遅延初期化 DI） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 1 で `grep -rn "AuthMode\|ChatEdit" packages/shared/ apps/desktop/src/` を実行し、実コードの型定義値と既存ファイル配置を先に確認する。
2. 同名ファイルがある場合は `grep -rn "import.*FileName"` で実際の import 元を特定し、正本を決定する。
3. 新規 Preload API は定義後に `preload/index.ts` の `contextBridge.exposeInMainWorld()` と else ブロックの両方に追記を確認する。
4. サービスの共有スコープは消費者ブロックの共通親に引き上げるか、各ブロック内で `createXxxService()` を呼ぶ。
5. DI 対象が認証状態依存の場合は Factory パターンで毎回生成し、キャッシュを避ける。

---

### 2026-03-14 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 12 再確認追補）

#### 苦戦箇所: 既存未タスクを再参照しても、対象ファイル自体が10見出し要件を満たしていない場合がある

| 項目 | 内容 |
| --- | --- |
| 課題 | `unassigned-task-detection.md` で「既存未タスクを再利用」と記録しても、`audit-unassigned-tasks --target-file` では current 違反が出るケースがあった |
| 再発条件 | diff監査（`--diff-from HEAD`）だけで完了判定し、再参照した既存未タスク本文を個別監査しない |
| 解決策 | 再参照した各未タスクに対して `audit-unassigned-tasks --target-file` を実行し、違反があれば同ターンで9見出しへ是正した |
| 標準ルール | Phase 12 の「新規未タスク0件」判定時でも、再参照した既存未タスクは `target-file` 監査で `currentViolations=0` を確認する |

#### 同種課題の簡潔解決手順（5ステップ）

1. `verify-unassigned-links --source .../task-workflow.md` で参照切れを先に潰す。
2. `audit-unassigned-tasks --json --diff-from HEAD` で今回差分の合否（current）を確認する。
3. `unassigned-task-detection.md` で再参照した既存未タスクを列挙する。
4. 各ファイルへ `audit-unassigned-tasks --target-file <path>` を実行し、current違反を確認する。
5. 違反があれば同ターンで9見出し是正し、再実行で `currentViolations=0` を固定する。

---

### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001

#### 苦戦箇所1: current build screenshot が esbuild platform mismatch で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | `electron-vite dev` が `@esbuild/darwin-arm64` / `@esbuild/darwin-x64` 不一致で起動できず、Phase 11 の実画面 capture が中断した |
| 再発条件 | worktree の node 実行アーキと lockfile 由来 binary がずれている状態で capture script を実行する |
| 解決策 | 当日中に fallback review board capture を current workflow 配下で生成し、`phase11-capture-metadata.json` へ理由と source を固定した |
| 標準ルール | 明示 screenshot 要求時は「実画面試行ログ → fallback 実行 → metadata 記録 → coverage validator PASS」まで同一ターンで閉じる |

#### 苦戦箇所2: chatEdit preload と Main IPC の payload 契約がドリフトしていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditAPI.readFile/writeFile` が positional 引数で invoke し、Main 側の object payload 契約（`{ filePath, workspacePath? }`）と不整合だった |
| 再発条件 | IPC handler 側シグネチャ変更時に preload API と renderer hook の引数形を同時更新しない |
| 解決策 | `chatEditApi.ts` を object payload 契約へ統一し、`getEditorSelection` も `{ success, data }` を unwrap する実装へ修正した |
| 標準ルール | IPC 契約変更時は handler / preload / renderer usage を 1 セットで更新し、`typecheck` と関連テストを同ターンで実行する |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 capture 前に `pnpm --filter @repo/desktop dev` の preflight 実行可否を確認する。
2. 起動不可ならエラー理由を記録し、fallback capture を current workflow 配下で生成する。
3. screenshot plan / manual-test-result / metadata を同時更新して TC-ID と証跡を 1:1 にする。
4. IPC 契約差分がある場合は handler・preload・renderer 呼び出しの 3 点を同時に修正する。
5. `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` / `verify-all-specs` / `validate-phase-output` を連続実行して PASS を固定する。

---

### 2026-03-16 TASK-SKILL-LIFECYCLE-06

#### 苦戦箇所1: 設計タスクでのシステム仕様書更新先送り（P57）

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計タスク（型定義・契約定義のみ）では「`.claude/skills/` の実更新は PR 作成時に実施」と先送りし、`system-spec-update-summary.md` に計画文だけを記録した。Phase 12 完了条件を満たさなかった |
| 再発条件 | 「プロダクションコードがないから仕様書更新は後でよい」と判断する |
| 解決策 | 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する。worktree 環境でのコンフリクトリスクより、仕様書と実装の乖離リスクの方が高い |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない（TASK-SKILL-LIFECYCLE-05 苦戦箇所6 の再発） |
| 関連パターン | P57（新規）、P26（システム仕様書更新遅延） |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 苦戦箇所2: 設計タスクを理由とした未タスク指示書の配置省略（P58）

| 項目 | 内容 |
| --- | --- |
| 課題 | 「設計タスクだから」という例外判断で `docs/30-workflows/unassigned-task/` への独立指示書ファイルの作成を省略した。「本レポート内で完了」という代替措置では、後続の監査ツールが指示書パスを参照できず不整合が発生する |
| 再発条件 | タスク種別を理由に P3 の3ステップを例外扱いにする |
| 解決策 | 設計タスクの未タスクであっても独立した指示書ファイルを `docs/30-workflows/unassigned-task/` に作成する |
| 標準ルール | P3（①指示書作成 → ②task-workflow 登録 → ③関連仕様書リンク追加）に例外はない |
| 関連パターン | P58（新規）、P3（未タスク管理の3ステップ不完全）、P38（未タスク配置ディレクトリ間違い） |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 苦戦箇所3: 並列エージェント分担による documentation-changelog 件数不整合（P59）

| 項目 | 内容 |
| --- | --- |
| 課題 | documentation-changelog.md に「Task 4 検出件数: 0件」と記載されたが、実際の `unassigned-task-detection.md` では8件検出されていた。Phase 12 を複数の並列エージェントで分担した結果、changelog 作成エージェントと未タスク検出エージェントの情報が断絶した |
| 再発条件 | 並列エージェントで分担し、changelog を各エージェントが個別に記録する |
| 解決策 | documentation-changelog.md は全 Task 完了後にメインエージェントが一括作成し、`unassigned-task-detection.md` の検出件数と照合してから記録する |
| 標準ルール | changelog は「事後統合」する。並列エージェントの中間報告をそのまま changelog に転記しない |
| 関連パターン | P59（新規）、P4（早期完了記載）、P43（サブエージェント中断）、P51（サブエージェント早期完了記載） |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 同種課題の簡潔解決手順（3ステップ）

1. Phase 12 開始時に「設計タスク / 実装タスク」に関わらず `.claude/skills/` の実更新を必須とし、計画文ではなく実績ログのみを記録する。
2. 未タスク検出は P3 の3ステップを必ず完遂し、タスク種別を理由に例外判断をしない。
3. documentation-changelog はメインエージェントが最終統合する。並列エージェントの分担結果を `unassigned-task-detection.md` の件数と照合してから記録する。

---

### 2026-03-16 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

#### 教訓1: Constructor Injection による queryFn 差替パターン

| 項目 | 内容 |
| --- | --- |
| 状況 | SkillDocGenerator の stubQueryFn を LLMDocQueryAdapter.query() に差し替える必要があった |
| 解決策 | `adapter.query.bind(adapter)` で既存の `LLMQueryFn` シグネチャに合わせることで、SkillDocGenerator 自体に変更を加えずに adapter を注入できた（Open-Closed Principle） |
| 適用範囲 | 他の LLM 統合箇所（chat-edit, agent-execution 等）でも同パターンが適用可能 |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 教訓2: CapabilityResolver パターンの再利用性

| 項目 | 内容 |
| --- | --- |
| 状況 | Skill Docs の capability 判定（integrated-api / guidance-only / terminal-handoff）を3パスで実装 |
| 解決策 | ILLMDocQueryAdapter インターフェースの isAvailable() / getProviderName() を基に resolver が判定する疎結合設計 |
| 注意 | terminal-handoff は事後判定（LLM呼出し失敗後の fallback）であり、事前判定には isAvailable() では不十分。実LLM接続テストが必要（UT-SKILL-DOCS-TERMINAL-HANDOFF-001 として未タスク化） |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 教訓3: Phase 4-5 統合実行の効率性

| 項目 | 内容 |
| --- | --- |
| 状況 | Phase 4（テスト作成 Red）と Phase 5（実装 Green）を別エージェントで実行しようとした |
| 解決策 | TDD の Red-Green サイクルを1エージェントで統合実行するほうが、型定義→テスト→実装のコンテキスト切替コストが低く効率的だった |
| 適用範囲 | 今後の Phase 4-5 実行時は統合エージェントを推奨 |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 同種課題の簡潔解決手順（3ステップ）

1. LLM adapter 差し替えは `bind()` パターンで既存シグネチャに合わせ、Generator クラス本体を変更しない。
2. CapabilityResolver の terminal-handoff パスは「失敗後 fallback」として設計し、事前判定と混在させない。
3. Phase 4-5 は同一エージェントで Red-Green サイクルを完結させる。

---

### 2026-03-16 UT-06-005 Permission Fallback（abort/skip/retry/timeout）

#### 苦戦箇所 S-PF-1: 既実装コードの4ステップ abort フロー発見遅延

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4 でテストを書き始めた段階で、abort 4ステップ（cancelAll→revokeSessionEntries→log→IPC通知）が既に SkillExecutor.ts に実装済みだった。Phase 1-3 で「新規実装」前提で仕様を書いたため、既存コードとの重複リスクが発生 |
| 再発条件 | 大規模ファイル（SkillExecutor.ts 1500行超）のコード調査が不十分なまま Phase 1 に入る場合 |
| 解決策 | Phase 1 で `git log --oneline -- <target-file>` と `grep -n "abort\|fallback\|retry" <target-file>` を実行し、既存実装の有無を確認してから要件を策定する |
| 関連パターン | P50（既実装防御の発見による Phase 転換）|
| 関連タスク | UT-06-005 |

#### 苦戦箇所 S-PF-2: revokeSessionEntries スタブ実装の設計判断

| 項目 | 内容 |
| --- | --- |
| 課題 | abort フローの Step 2（revokeSessionEntries）がスタブ実装（全エントリクリア）のまま。セッション別フィルタリングには AllowedToolEntry に sessionId 追加が必要で、UT-06-005 のスコープ外と判断した |
| 再発条件 | 既存の型定義（AllowedToolEntry）を拡張すると、関連テスト・仕様書への影響範囲が広すぎる場合 |
| 解決策 | スタブ実装を選択し、本格実装を UT-06-005-B として未タスク化。スタブ判断の根拠を Phase 2 設計ドキュメントに明記する |
| 関連タスク | UT-06-005, UT-06-005-B |

#### 苦戦箇所 S-PF-3: PERMISSION_MAX_RETRIES デッドコード化と abortedExecutions メモリリーク

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 10 最終レビューで2件の品質問題を検出: (1) `PERMISSION_MAX_RETRIES=3` が定数として定義されているが、retryCounters で直接 `3` がハードコードされデッドコード化 (2) `abortedExecutions: Set<string>` にクリア機構がなくメモリリーク |
| 再発条件 | 定数を定義しても使用箇所で参照せず直値を使うパターン、Set/Map のクリーンアップ忘れ |
| 解決策 | (1) retryCounters の条件を `PERMISSION_MAX_RETRIES` 参照に変更 (2) abortedExecutions にセッション単位のクリア機構を追加 |
| 関連タスク | UT-06-005 |

#### 同種課題の5分解決カード

1. `grep -n "abort\|fallback\|retry\|skip" <target-file>` で既存実装を確認
2. 既実装の場合は Phase 4-5 を「検証・補完」モードに切り替え（P50 準拠）
3. スタブ実装が必要な場合は Phase 2 に判断根拠を記録し、未タスク化を Phase 12 Task 4 に組み込む
4. 定数定義は `grep -rn "CONST_NAME" <file>` で使用箇所を確認、未使用は即修正
5. Set/Map を使う場合は cleanup 機構（セッション終了時の clear/delete）を設計段階で明記

---

### 2026-03-16 TASK-SKILL-LIFECYCLE-07

#### 苦戦箇所1: Phase 12 サブエージェントが「設計タスク範囲外」として実ファイル更新を保留する

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 の Step 1-A〜Step 2 で、サブエージェントが「設計タスクなので実ファイル更新は実装タスクで行う」と判断し、更新計画のみ記録して実ファイルへの反映を行わなかった |
| 再発条件 | 設計タスク（spec_created）で Phase 12 を実行する場合に、「設計 = ファイル変更不要」と誤解する |
| 解決策 | 設計タスクでも Phase 12 の Step 1-A（タスク完了記録）、Step 1-C（関連タスクテーブル）、Step 2（システム仕様更新）は実ファイルへの書き込みが必須。「更新計画の記録」は成果物にならない |
| 標準ルール | Phase 12 のシステム仕様書更新は、タスク種別（設計/実装）に関わらず実ファイル変更を必ず伴う |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 苦戦箇所2: Phase 3 MINOR 4件の追跡フローが Phase 横断で見失われる

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 3 で検出された MINOR 4件が Phase 5→9→10 を横断する過程で、追跡マトリクスを作成しなかったため対応状況の確認に時間がかかった |
| 再発条件 | Phase 3 の MINOR 指摘が4件以上で、複数 Phase にまたがる修正が必要な場合 |
| 解決策 | Phase 5 完了時点で「Phase 3 MINOR 追跡マトリクス」を作成し、各指摘の対応状況（対応済み/未対応/Phase 10 に持ち越し）を明示する |
| 標準ルール | Phase 3 の MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成する |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 苦戦箇所3: バックグラウンドエージェントの TaskOutput timeout パターン

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列実行したバックグラウンドエージェントが10分 timeout で結果取得に失敗したが、実際には成果物ファイルの生成は完了していた |
| 再発条件 | 大量の成果物を生成する Phase（Phase 4/5/12）をバックグラウンドエージェントで実行した場合 |
| 解決策 | timeout 後は `find` / `ls` で成果物ファイルの存在を直接確認する。TaskOutput の成功/失敗だけで判断しない |
| 標準ルール | バックグラウンドエージェント timeout 後は成果物ファイルの存在確認を優先する |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 苦戦箇所4: コンテキストウィンドウ圧縮で前セッションのエージェント結果が消失する

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列エージェントの結果をメモリ上で保持したが、コンテキストウィンドウ圧縮により前セッションの結果が参照不能になった |
| 再発条件 | 長時間セッションで並列エージェントを多用し、結果をファイル出力せずメモリのみで保持した場合 |
| 解決策 | 並列エージェントの結果は必ず成果物ファイルとして出力し、後続 Phase ではファイルから読み取る |
| 標準ルール | 並列エージェントは成果物ファイル出力を優先し、結果参照はファイルベースで行う |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 同種課題の簡潔解決手順（4ステップ）

1. 設計タスクの Phase 12 でも実ファイル更新を必ず実施する。「更新計画の記録」だけでは成果物にならない。
2. Phase 3 MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成し、各指摘の対応状況を明示する。
3. バックグラウンドエージェント timeout 後は `find`/`ls` で成果物存在を直接確認する。
4. 並列エージェントの結果は成果物ファイルに出力し、コンテキスト消失に備える。

---

### 2026-03-15 TASK-SKILL-LIFECYCLE-05

#### 苦戦箇所1: Phase 11 の必須成果物が揃っておらず screenshot coverage validator が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | `manual-test-result.md` のみで運用し、`manual-test-checklist.md` と `screenshot-plan.json` が欠落した状態で再監査に進んでしまった |
| 再発条件 | 「スクリーンショットがあるから十分」と判断し、validator 前提ファイルを確認しない |
| 解決策 | `outputs/phase-11/` を `checklist/result/plan/screenshots` の4点セットで再構成し、TC-11-01〜05 の証跡を 1:1 で再紐付けした |
| 標準ルール | Phase 11 完了判定は `validate-phase11-screenshot-coverage` PASS を必須にし、必須ファイル欠落を残さない |

#### 苦戦箇所2: docs-heavy task の画面検証が build 依存で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | current build での capture が環境要因で不安定なとき、画面検証の証跡収集が止まりやすい |
| 再発条件 | fallback 経路を事前定義せず、実画面 capture 成功だけを前提に運用する |
| 解決策 | source screenshot を current workflow に集約し、review board 1件を current workflow で新規 capture、metadata で source と用途を明記した |
| 標準ルール | docs-heavy + screenshot要求時は review board fallback を許容し、source / review board / metadata を同時に記録する |

#### 苦戦箇所3: implementation-guide の literal 要件漏れで Phase 12 が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | Part 1 の「なぜ先行」と Part 2 の「使用例」「エッジケース」が欠けると validator で fail する |
| 再発条件 | 内容は充実していても、validator が見る literal 見出し・語句を満たさない |
| 解決策 | Part 1 冒頭に why-first を追加し、Part 2 に API 使用例セクションとエッジケースセクションを明示追加した |
| 標準ルール | implementation-guide は内容品質だけでなく validator literal 互換を同時に満たす |

#### 苦戦箇所4: Record パターンでの ScoringGate 網羅性保証

| 項目 | 内容 |
| --- | --- |
| 課題 | switch 文で ScoringGate の4段階を分岐しようとしたが、新しい段階が追加された場合にコンパイルエラーにならない。exhaustive check の `default: never` パターンも検討したが、静的マッピングの方が安全だった |
| 再発条件 | ユニオン型の分岐に switch 文を使い、exhaustive check を忘れる |
| 解決策 | `Record<ScoringGate, CTAVisibility>` で全キーの定義を型レベルで強制する。キーが不足するとコンパイルエラーになるため、網羅性が保証される |
| 標準ルール | ユニオン型の全ケース網羅には `Record<UnionType, Config>` パターンを使う（02-code-quality.md 準拠） |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所5: 設計タスクの artifacts.json 逐次更新忘れ

| 項目 | 内容 |
| --- | --- |
| 課題 | 49成果物を全て作成済みだったが、artifacts.json の phase status が全て `not_started` のまま放置。3つの並列検証エージェントで全Phase PASS を確認した後に初めて発見した |
| 再発条件 | 設計タスクでは「コードを書かない」前提があり、状態ファイルの更新が後回しにされる |
| 解決策 | 各Phase完了ごとに artifacts.json の status, artifacts 配列, acceptanceCriteria を逐次更新。最終的に status: "completed" + 全AC verified: true に更新した |
| 標準ルール | artifacts.json は Phase 完了の正式記録であり、成果物作成と同時に更新する |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所6: Phase 12 本文と成果物の実績が乖離する

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-12-documentation.md` が `not_started` のまま、`documentation-changelog.md` に「実装タスクで後続対応」といった計画文が残り、成果物実体と矛盾した |
| 再発条件 | outputs 実体更新後に本体仕様書と changelog を同時更新しない |
| 解決策 | `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3点を同一ターンで更新し、planned wording を除去した |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 開始時に `checklist/result/plan/screenshots` の4点セットを先に作る。
2. screenshot 取得は「実画面試行 → fallback review board → metadata固定」の順で閉じる。
3. Phase 12 は `implementation-guide` の literal 要件を先に満たしてから詳細説明を肉付けする。
4. `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` を同時に更新して整合を固定する。
5. 最終判定で `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を連続実行する。

---

### 2026-03-14 TASK-SKILL-LIFECYCLE-04

#### 苦戦箇所1: 未タスク配置先ドリフトで指定ディレクトリ監査が不成立になる

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスクを `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/` に置いたため、`--target-file` 監査境界と衝突した |
| 再発条件 | workflow ローカル path を temporary 運用のまま台帳反映する |
| 解決策 | root canonical path（`docs/30-workflows/unassigned-task/`）へ再配置し、`phase-12-documentation` / `unassigned-task-detection` / `task-workflow-backlog` / `interfaces` 参照を同ターン更新した |
| 標準ルール | active 未タスクは root canonical path を正本とし、workflow ローカル path は使わない |

#### 苦戦箇所2: `current`/`baseline` と配置可否を同一判定にすると報告が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | 監査値だけで「指定ディレクトリに置けているか」を判定しようとして説明が曖昧になった |
| 再発条件 | 配置可否・link整合・監査値を 1 つの数値で報告する |
| 解決策 | `配置可否`、`verify-unassigned-links`、`audit --diff-from HEAD --target-file` を3軸で分離記録した |
| 標準ルール | `currentViolations=0` は品質判定、配置可否は別項目として必ず明記する |

#### 苦戦箇所3: system spec の同期対象を絞りすぎると same-wave が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | workflow 成果物だけ更新して `resource-map` / `quick-reference` / `legacy register` / `LOGS` を後回しにすると、再利用入口が stale になる |
| 再発条件 | 「実装記録は完了したので index は後でよい」と判断する |
| 解決策 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` を統合正本として追加し、`current canonical set` と `artifact inventory` を起点に parent docs / ledger / indexes / logs を同一 wave で同期した |
| 標準ルール | Phase 12 の close-out は `workflow + parent docs + task-workflow + lessons + indexes + LOGS + mirror` を最小単位とする |

#### 同種課題の簡潔解決手順（4ステップ）

1. MINOR 検出時に未タスク指示書を root `docs/30-workflows/unassigned-task/` へ作成する。
2. 指示書は 9セクション形式（`## 1..9` + `3.5`）で作り、親タスク苦戦箇所を継承する。
3. `task-workflow-backlog` / 関連仕様書 / workflow outputs の参照を同ターンで更新する。
4. `verify-unassigned-links` と `audit --diff-from HEAD --target-file` で link と品質を分離検証する。

---

### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57〜P61）

#### P57: 設計書と実コードの AuthMode 値の乖離

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計ドキュメントでは AuthMode を `"integrated"` / `"terminal"` / `"hybrid"` の3値で定義したが、実コードベースでは `"subscription" \| "api-key"` の2値。RuntimeResolver の実装時に解決テーブルの全面書き直しが必要だった |
| 再発条件 | Phase 2（設計）で想定値を使い、実コードの型定義を検証しない |
| 解決策 | Phase 1（要件定義）で `grep -rn "AuthMode" packages/shared/` を実行し、正本の型定義値を確認する。設計書で想定値を使う前に必ず実コードの型を検証 |
| 標準ルール | 設計書で列挙型の値を参照するときは、実コードの型定義を正本として先に確認する |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P58: 同名ファイルの二重存在（chatEditHandlers.ts）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/handlers/chatEditHandlers.ts` と `apps/desktop/src/main/ipc/chatEditHandlers.ts` の2つが存在し、実際に `ipc/index.ts` から import されているのは `ipc/chatEditHandlers.ts` だった。設計書は `handlers/chatEditHandlers.ts` を参照しており、誤ったファイルを修正するリスクがあった |
| 再発条件 | 設計書のファイルパスを信じて修正対象を決め、実際の import 元を確認しない |
| 解決策 | 修正対象ファイルの特定には `grep -rn "import.*chatEditHandlers" apps/desktop/src/main/` で実際の import 元を確認する |
| 標準ルール | 同名ファイルが複数ディレクトリに存在する場合、`grep import` で実際に使用されている方を正本とする |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P59: Preload API 未公開（exposeChatEditAPI 呼び出し欠落）

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditApi.ts` に `exposeChatEditAPI()` 関数は定義されていたが、`preload/index.ts` で一切呼ばれておらず、`chatEditAPI` が Renderer に完全に未公開だった。他の全 API（electronAPI, agentAPI 等）は contextBridge 経由で公開済みだった |
| 症状 | `window.chatEditAPI` が `undefined` で全ての chat-edit IPC 呼び出しが失敗 |
| 再発条件 | 新規 Preload API を定義するだけで `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックへの追記を忘れる |
| 解決策 | 新規 Preload API を追加した場合、`preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと else ブロックの両方に追記されているか必ず確認する |
| 再発防止 | `grep -c "exposeInMainWorld" preload/index.ts` と `grep -c "chatEditAPI\|slideApi\|agentAPI" preload/index.ts` で API 公開数を監査 |
| 関連パターン | M-01（contextBridge 未使用）、P23（API二重定義の型管理複雑性） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P60: createAuthModeService のスコープ制限

| 項目 | 内容 |
| --- | --- |
| 課題 | `ipc/index.ts` で `createAuthModeService(authKeyService)` が `track("registerAuthModeHandlers", ...)` コールバック内で呼ばれており、そのスコープ外（chat-edit ハンドラ登録ブロック）からは参照できなかった。chat-edit ハンドラにも authModeService が必要だったため、別インスタンスを生成する必要があった |
| 再発条件 | 複数のハンドラ登録ブロックで同じサービスが必要なのに、外側スコープに引き上げない |
| 解決策 | 複数のハンドラ登録ブロックで同じサービスが必要な場合、外側スコープで生成するか、各ブロック内で `createXxxService()` を呼ぶ |
| 標準ルール | サービスの共有スコープは「最も外側の共通消費者」に合わせて配置する |
| 関連パターン | P34（遅延初期化 DI パターン選択） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P61: ChatEditService の動的アダプタ注入

| 項目 | 内容 |
| --- | --- |
| 課題 | ChatEditService はコンストラクタで LLMAdapter を受け取る設計だが、RuntimeResolver の結果（API キー有無）によって adapter が変わるため、毎回 `new ChatEditService(resolution.adapter, contextBuilder)` で生成する方式を採用。stubLLMAdapter を置き換える際、Setter Injection ではなく Factory パターンに近い動的生成が最適だった |
| 再発条件 | adapter が呼び出し時の状態に依存するのに、インスタンスをキャッシュする |
| 解決策 | adapter が呼び出し時の状態に依存する場合は、毎回 new でインスタンスを生成する。API キーが変更される可能性を考慮すると、キャッシュを避ける |
| 標準ルール | DI 対象が実行時コンテキスト依存（認証状態等）の場合は Factory パターンで毎回生成する |
| 関連パターン | P34（遅延初期化 DI） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 1 で `grep -rn "AuthMode\|ChatEdit" packages/shared/ apps/desktop/src/` を実行し、実コードの型定義値と既存ファイル配置を先に確認する。
2. 同名ファイルがある場合は `grep -rn "import.*FileName"` で実際の import 元を特定し、正本を決定する。
3. 新規 Preload API は定義後に `preload/index.ts` の `contextBridge.exposeInMainWorld()` と else ブロックの両方に追記を確認する。
4. サービスの共有スコープは消費者ブロックの共通親に引き上げるか、各ブロック内で `createXxxService()` を呼ぶ。
5. DI 対象が認証状態依存の場合は Factory パターンで毎回生成し、キャッシュを避ける。

---

### 2026-03-14 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 12 再確認追補）

#### 苦戦箇所: 既存未タスクを再参照しても、対象ファイル自体が10見出し要件を満たしていない場合がある

| 項目 | 内容 |
| --- | --- |
| 課題 | `unassigned-task-detection.md` で「既存未タスクを再利用」と記録しても、`audit-unassigned-tasks --target-file` では current 違反が出るケースがあった |
| 再発条件 | diff監査（`--diff-from HEAD`）だけで完了判定し、再参照した既存未タスク本文を個別監査しない |
| 解決策 | 再参照した各未タスクに対して `audit-unassigned-tasks --target-file` を実行し、違反があれば同ターンで9見出しへ是正した |
| 標準ルール | Phase 12 の「新規未タスク0件」判定時でも、再参照した既存未タスクは `target-file` 監査で `currentViolations=0` を確認する |

#### 同種課題の簡潔解決手順（5ステップ）

1. `verify-unassigned-links --source .../task-workflow.md` で参照切れを先に潰す。
2. `audit-unassigned-tasks --json --diff-from HEAD` で今回差分の合否（current）を確認する。
3. `unassigned-task-detection.md` で再参照した既存未タスクを列挙する。
4. 各ファイルへ `audit-unassigned-tasks --target-file <path>` を実行し、current違反を確認する。
5. 違反があれば同ターンで9見出し是正し、再実行で `currentViolations=0` を固定する。

---

### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001

#### 苦戦箇所1: current build screenshot が esbuild platform mismatch で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | `electron-vite dev` が `@esbuild/darwin-arm64` / `@esbuild/darwin-x64` 不一致で起動できず、Phase 11 の実画面 capture が中断した |
| 再発条件 | worktree の node 実行アーキと lockfile 由来 binary がずれている状態で capture script を実行する |
| 解決策 | 当日中に fallback review board capture を current workflow 配下で生成し、`phase11-capture-metadata.json` へ理由と source を固定した |
| 標準ルール | 明示 screenshot 要求時は「実画面試行ログ → fallback 実行 → metadata 記録 → coverage validator PASS」まで同一ターンで閉じる |

#### 苦戦箇所2: chatEdit preload と Main IPC の payload 契約がドリフトしていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditAPI.readFile/writeFile` が positional 引数で invoke し、Main 側の object payload 契約（`{ filePath, workspacePath? }`）と不整合だった |
| 再発条件 | IPC handler 側シグネチャ変更時に preload API と renderer hook の引数形を同時更新しない |
| 解決策 | `chatEditApi.ts` を object payload 契約へ統一し、`getEditorSelection` も `{ success, data }` を unwrap する実装へ修正した |
| 標準ルール | IPC 契約変更時は handler / preload / renderer usage を 1 セットで更新し、`typecheck` と関連テストを同ターンで実行する |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 capture 前に `pnpm --filter @repo/desktop dev` の preflight 実行可否を確認する。
2. 起動不可ならエラー理由を記録し、fallback capture を current workflow 配下で生成する。
3. screenshot plan / manual-test-result / metadata を同時更新して TC-ID と証跡を 1:1 にする。
4. IPC 契約差分がある場合は handler・preload・renderer 呼び出しの 3 点を同時に修正する。
5. `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` / `verify-all-specs` / `validate-phase-output` を連続実行して PASS を固定する。


> 2026-03-13 以前の教訓は [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。
