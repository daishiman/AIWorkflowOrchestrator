# Lessons Learned: ViewType / Electron UI

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: ViewType ルーティング、Electron メニュー、UI 画面遷移に関する教訓
> 分割元: [lessons-learned-current.md](lessons-learned-current.md)

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | ViewType/ルーティング/Electron UI に関する教訓を集約                   |
| スコープ | renderView 分岐、Electron メニュー、画面遷移テスト                     |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-03-17 | 1.0.0 | lessons-learned-current.md から分割作成 |

---

## 2026-03-17 TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001

### 苦戦箇所1: `currentView` 注入による direct 画面到達が screenshot で不安定

| 項目 | 内容 |
| --- | --- |
| 課題 | `renderView()` の追加 case（`skillAnalysis` / `skillCreate`）を画面証跡で確認する際、`currentView` を直接注入する経路は auth/persist 初期化タイミングで揺れやすかった |
| 再発条件 | App shell 初期化を伴う状態で screenshot を短時間に連続取得する場合 |
| 解決策 | 画面到達は `advanced route fallback`（`/advanced/skill-analysis` / `/advanced/skill-create-wizard`）へ寄せ、分岐保証は `App.renderView.viewtype.test.tsx` で担保した |
| 標準ルール | UI証跡（route-based）と分岐保証（unit test）を同一コマンドに混在させない |
| 関連タスク | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 |
| follow-up | UT-IMP-SKILL-LIFECYCLE-ROUTING-DIRECT-RENDERVIEW-CAPTURE-GUARD-001 |

### 苦戦箇所2: Phase 12 成果物命名の揺れ（`report` と `detection`）

| 項目 | 内容 |
| --- | --- |
| 課題 | `unassigned-task-report.md` と `unassigned-task-detection.md` が混在し、changelog の件数整合が崩れるリスクがあった |
| 再発条件 | legacy 名称を残したまま Task 12-4 の正本名を作らない場合 |
| 解決策 | `unassigned-task-detection.md` を正本、`unassigned-task-report.md` を互換リンクへ変更し、件数は detection を基準値に固定した |
| 標準ルール | Phase 12 Task 4 の正本名は `unassigned-task-detection.md` とし、互換ファイルは必ず正本へリンクする |
| 関連タスク | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 |

### 苦戦箇所3: P40 テスト実行ディレクトリ依存（再発）-- dynamic import で顕在化

| 項目 | 内容 |
| --- | --- |
| 課題 | プロジェクトルートから `pnpm vitest run` を実行すると、`@/renderer/App` エイリアスが解決できず全9テストが失敗した |
| 再発条件 | `apps/desktop/vitest.config.ts` に定義されたパスエイリアス（`@/`）を使用するテストを、ルートディレクトリから実行した場合 |
| 根本原因 | Vite のパスエイリアスが `apps/desktop/vitest.config.ts` に定義されており、ルートの vitest.config.ts では解決されない。特に `await import("@/renderer/App")` のような dynamic import は `vi.mock` でモック化されないため、ランタイムでエイリアス解決が必須 |
| 解決策 | `cd apps/desktop && pnpm vitest run` で正しいディレクトリから実行する |
| 標準ルール | P40 準拠: テスト実行は常に対象パッケージのディレクトリから行う。dynamic import を含むテストは特に影響を受けやすい |
| 関連パターン | P40（テスト実行ディレクトリ依存） |
| 関連タスク | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 |

### 苦戦箇所4: コンテキスト切れによるエージェント中断

| 項目 | 内容 |
| --- | --- |
| 課題 | 前回セッションで並列エージェントを起動後、コンテキスト制限に到達しエージェントの完了確認ができなかった |
| 再発条件 | 大規模タスク（Phase 1-12 一括実行）で複数の並列エージェントを起動した場合 |
| 解決策 | セッション再開時に `git diff --stat HEAD` と `Glob` で成果物の完了状態を確認し、中断箇所を特定してから再開する |
| 標準ルール | 各エージェントの成果物をファイルシステム上で確認可能な形にしておく。TaskOutput が使えない場合は `git diff --stat` / `Glob` / `Read` で代替確認する |
| 関連パターン | P43（サブエージェントの rate limit 中断） |
| 関連タスク | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 |

### 苦戦箇所5: Phase 6-7 追加テスト数の整合（P37 再発）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4 で13テスト、Phase 6 で+11テスト = 合計34テストとなり、Phase 5 成果物ドキュメントに記載した23テストを超過した。ドキュメントの数値を事後修正する必要があった |
| 再発条件 | Phase 4 の想定テスト数をドキュメントに記載し、Phase 6 の追加テストでドキュメント数値が乖離する場合 |
| 解決策 | テスト数は最終確認後（Phase 7 カバレッジ確認後）にドキュメントに記載する。Phase 4 / Phase 5 の想定値をそのまま使い回さない |
| 標準ルール | P37 準拠: Phase 12 でテスト数を実際のテストファイルから `grep -c "it\|test(" *.test.ts` で正確にカウントして記載する |
| 関連パターン | P37（ドキュメント数値の早期固定） |
| 関連タスク | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 |

### 同種課題の簡潔解決手順（3ステップ）

1. screenshot の到達確認は route-based に固定し、`phase11-capture-metadata.json` を更新する。
2. `renderView` 分岐保証は `App.renderView.*` の unit test へ分離し、coverage validator と別に実行する。
3. Phase 12 は `spec-update-summary` / `documentation-changelog` / `unassigned-task-detection` の検出件数を同値で閉じる。

### 5分解決カード

| 苦戦箇所 | 即時チェック | 解決策 |
| --- | --- | --- |
| テスト alias 解決失敗 | `pwd` がパッケージルートか確認 | `cd apps/desktop && pnpm vitest run` |
| エージェント中断後の再開 | `git diff --stat HEAD` で成果物確認 | 中断箇所を特定→不足分のみ再実行 |
| テスト数ドキュメント不整合 | `grep -c "it\|test(" *.test.ts` | Phase 7 完了後に正確な数値で更新 |

---

## 2026-03-16 TASK-FIX-ELECTRON-APP-MENU-ZOOM-001

### 苦戦箇所1: Main Process エントリポイント（index.ts）のトップレベル副作用でテスト不可能

| 項目 | 内容 |
| --- | --- |
| 課題 | Main Process の index.ts に直接メニューロジックを追加しようとしたが、テストファイルで import するだけで `setupCustomProtocol` 等のトップレベル副作用が実行され、テストが動作しない |
| 再発条件 | Main Process のエントリポイント（index.ts）に直接ロジックを追加しようとした時 |
| 解決策 | ロジックを独立したモジュール（menu.ts）に分離してテスト容易性を確保（SRP準拠）。エントリポイントは薄い呼び出し層に留める |
| 標準ルール | Electron Main Process にメニュー/機能を追加する際は、まず独立モジュールに分離してからエントリポイントで呼び出す |
| 関連パターン | P5（リスナー二重登録）、SRP（単一責務原則） |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

### 苦戦箇所2: Electron role ベースメニューの検証手法

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
// メニュー構造を検証（role の存在確認）
expect(template).toContainEqual(expect.objectContaining({ role: "zoomIn" }));
```

### 苦戦箇所3: 小規模修正に対する13 Phase ワークフローの適用

| 項目 | 内容 |
| --- | --- |
| 課題 | 83行の新規ファイル + 2行の既存ファイル変更程度の小規模修正に対して、13 Phase のフルワークフローは過剰に見えた |
| 再発条件 | 小規模な機能追加（100行未満）にフルワークフローを適用する場合 |
| 解決策 | テスト20件・カバレッジ100%の品質が確保されており、ワークフローの網羅性が品質に貢献した。小規模でもフルワークフローを適用することで、macOS は Apple HIG 準拠の4メニュー、Windows/Linux は最小構成という platform 分岐の品質保証ができた |
| 標準ルール | ワークフローの規模判断は実装行数ではなく、品質保証の必要度（platform 分岐、セキュリティ影響等）で判断する |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

### 同種課題の簡潔解決手順（5ステップ）

1. Electron Main Process にメニュー/機能を追加する際は、まず独立モジュールに分離する。
2. role ベースのメニュー項目は Electron に処理を委譲し、カスタム click ハンドラは不要。
3. macOS は Apple HIG 準拠の4メニュー（App/Edit/View/Window）、Windows/Linux は最小構成にする。
4. テストは `Menu.buildFromTemplate` のモック引数検査でメニュー構造を検証する。
5. platform 分岐テストは `vi.spyOn(process, "platform", "get").mockReturnValue("darwin"|"win32"|"linux")` でモックする。

---

## 派生未タスク

| 未タスクID | 概要 | 指示書パス |
| --- | --- | --- |
| UT-IMP-SKILL-LIFECYCLE-ROUTING-DIRECT-RENDERVIEW-CAPTURE-GUARD-001 | direct renderView 到達ガード | `docs/30-workflows/unassigned-task/task-imp-skill-lifecycle-routing-direct-renderview-capture-guard-001.md` |
| UT-IMP-P40-DYNAMIC-IMPORT-TEST-PATTERN-STANDARDIZATION-001 | P40 dynamic import テストパターン標準化 | `docs/30-workflows/unassigned-task/task-imp-p40-dynamic-import-test-pattern-standardization-001.md` |
| UT-IMP-QUICK-REFERENCE-SEARCH-PATTERNS-SPLIT-001 | quick-reference-search-patterns.md 500行超過分割 | `docs/30-workflows/unassigned-task/task-imp-quick-reference-search-patterns-split-001.md` |
| UT-IMP-SPEC-500LINE-PREEMPTIVE-SPLIT-GUIDELINE-001 | 500行制限 先制分割ガイドライン | `docs/30-workflows/unassigned-task/task-imp-spec-500line-preemptive-split-guideline-001.md` |
