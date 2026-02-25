# Lessons Learned（教訓集）

> **相対パス**: `references/lessons-learned.md`
> **読み込み条件**: 実装タスク開始時、または類似課題に遭遇した場合

---

## メタ情報

| 項目 | 値 |
|------|---|
| 正本 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的 | タスク実行時の苦戦箇所と解決策を記録し、将来の開発効率を向上 |
| スコープ | 実装過程で遭遇した課題、解決策、コード例 |
| 対象読者 | AIWorkflowOrchestrator 開発者 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-02-25 | 1.24.0 | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 教訓追加: task-9D〜9J 仕様差分是正で発生した苦戦箇所3件（旧パス混在、artifacts必須項目漏れ、Date型方針ドリフト）と同種課題向け簡潔解決手順（5ステップ）を追加 |
| 2026-02-25 | 1.25.3 | UT-IPC-AUTH-HANDLE-DUPLICATE-001 の簡潔解決テンプレートを追加。目的/前提/4ステップ/検証/失敗時対処を1ページ化し、同種課題の初動時間短縮を明文化 |
| 2026-02-25 | 1.25.2 | UT-IPC-AUTH-HANDLE-DUPLICATE-001 再監査教訓を追記。全体監査FAILと今回差分FAILの混同、完了移管後リンク更新漏れの2課題を追加し、4ステップ是正手順を明文化 |
| 2026-02-25 | 1.25.1 | UT-IPC-AUTH-HANDLE-DUPLICATE-001 の参照整合を補正。成果物テーブルの未タスク指示書リンクを `completed-tasks/task-ipc-auth-handle-duplicate-001.md` へ更新 |
| 2026-02-25 | 1.25.0 | UT-IPC-AUTH-HANDLE-DUPLICATE-001 教訓追加: AUTH IPC登録一元化で「通常経路とfallback経路を同時に宣言化しないと監査ノイズが残る」点を記録。再発防止として「登録配列化 + fallback回帰テスト + rg監査0件確認」の3ステップを追加 |
| 2026-02-25 | 1.24.0 | UT-IPC-CHANNEL-NAMING-AUDIT-001 教訓追加: 対象外ノイズ（AUTH重複式）を未タスク分離しない場合に完了判定が曖昧化する問題を記録。再発防止として「対象内/対象外分離→未タスク3ステップ→リンク機械検証」の運用手順を追加 |
| 2026-02-24 | 1.23.0 | UT-IPC-DATA-FLOW-TYPE-GAPS-001 実装固有の苦戦箇所4件追加（仕様書修正タスクPhaseテンプレート適用、6ギャップ横断分析、Date型シリアライズ方針統一、positional→object引数移行設計）+ 同種課題向け簡潔解決手順5ステップ追加 |
| 2026-02-24 | 1.22.0 | UT-IPC-DATA-FLOW-TYPE-GAPS-001 教訓追加: Phase 12再監査で判明した苦戦箇所3件（成果物不足、artifacts.json二重管理非同期、未タスク指示書フォーマット不一致）と同種課題向け簡潔解決手順（4ステップ）を追加 |
| 2026-02-24 | 1.21.1 | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 教訓追加: Phase 12再監査で判明した苦戦箇所3件（検出ソース網羅漏れ、検証スクリプト終端依存、全体監査と差分判定の混同）と簡潔解決手順（5ステップ）を追加 |
| 2026-02-24 | 1.21.0 | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 実装固有の苦戦箇所3件追加（6ハンドラ引数形式の違い、return→throwマイグレーション影響分析、コンテキスト枯渇による3セッション分割）+ 実装面解決手順5ステップ追加 |
| 2026-02-24 | 1.20.0 | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 教訓追加: P42準拠バリデーション統一時の苦戦箇所3件（補完タスクと元未タスクの二重管理、Phase 12ステータス同期、未タスクraw検出の既存TODO混在）と同種課題向け簡潔解決手順（4ステップ）を追加 |
| 2026-02-24 | 1.20.0 | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 教訓追加: 仕様書修正のみタスクでの反映漏れ（完了台帳未反映、旧参照パス残存、`{outputs` ゴーストディレクトリ）を記録。同種課題向け簡潔解決手順（4ステップ）を追加 |
| 2026-02-23 | 1.19.0 | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 教訓追加: CIガードスクリプト実装の苦戦箇所4件（正規表現パース、キー変換設計、typesVersionsスキップ、process.exitCodeテスタビリティ）。実装内容・成果物・関連ドキュメント更新テーブル追加 |
| 2026-02-22 | 1.18.3 | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 の苦戦箇所3件を追加（Phase 10 MINOR残置、Phase 12証跡同期、未タスク監査のベースライン混同）。同種課題向け簡潔解決手順（5ステップ）を追加 |
| 2026-02-22 | 1.18.2 | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 の苦戦箇所3件を追加（同名コンポーネント特定、`skill.id`/`skill.name`混同、偽成功ログの誤読）。同種課題向け簡潔解決手順（4ステップ）を追加 |
| 2026-02-21 | 1.18.1 | UT-FIX-SKILL-IMPORT-INTERFACE-001 苦戦箇所2件追加（並列エージェント実行時のコンテキスト分離、completed-task配下のファイル移動時ステータス不整合） |
| 2026-02-21 | 1.18.0 | UT-FIX-SKILL-IMPORT-INTERFACE-001 教訓追加（Phase 12ステータス未同期、旧参照パス残存、Vitest実行ディレクトリ差異）。同種課題向け簡潔解決手順を追加 |
| 2026-02-21 | 1.17.4 | UT-FIX-SKILL-REMOVE-INTERFACE-001 に関連未タスク5件テーブルを追加。苦戦箇所から派生した UT-IMP-PHASE11-WORKTREE-PROTOCOL-001、UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001、UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001 の3件と既存2件を統合 |
| 2026-02-21 | 1.17.3 | UT-FIX-SKILL-REMOVE-INTERFACE-001 に苦戦箇所5-7を追加（マルチエージェントPhase実行の依存順序違反、worktree環境でのPhase 11手動テスト制約、カバレッジ閾値のスコープ解釈） |
| 2026-02-21 | 1.17.2 | UT-FIX-SKILL-REMOVE-INTERFACE-001 に苦戦箇所4を追加（worktree環境でのStep 1-A先送り誤判断）。未実施タスク誤配置（completed-tasks/unassigned-task混在）の再発防止手順を追記 |
| 2026-02-20 | 1.17.1 | UT-FIX-SKILL-REMOVE-INTERFACE-001 セクション品質向上: Before/Afterコード例追加、同種課題解決手順をチェックリスト形式に変更、予防策セクション追加、関連パターン相互参照テーブル追加（P23/P32/P42/P44/P3/P40） |
| 2026-02-20 | 1.17.1 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 を強化: 苦戦箇所4,5追加（paths定義順序、4ファイル同期）、既存3件にコード例追加、「同種課題の簡潔解決手順（5ステップ）」セクション追加 |
| 2026-02-20 | 1.17.0 | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所3件を追加（`skillId/skillName` 契約ドリフト、未タスク配置ドリフト、Vitest実行コンテキスト差異）。同種課題向け簡潔解決手順を追加 |
| 2026-02-20 | 1.17.0 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 の苦戦箇所3件を追加（三層整合の同期漏れ、補助型宣言取り込み漏れ、未タスクリンクの既存参照切れ） |
| 2026-02-19 | 1.16.0 | TASK-9A-C 仕様書作成フェーズの苦戦箇所4件を追加（並列エージェントAPIレートリミット、スキルスクリプトパス解決、大規模仕様書コンテキスト管理、Pitfall事前組み込みの有効性） |
| 2026-02-19 | 1.16.0 | TASK-9A-B 技術的苦戦箇所4件追加（handlerMap ESMモック、v8カバレッジ関数カウント、.trim()境界値、isKnownSkillFileError型ガード） |
| 2026-02-19 | 1.15.0 | TASK-9A-C Phase 12準拠監査の苦戦箇所4件を追加（参照パス混在、phase-09/phase-9表記ゆれ、spec_created判定曖昧、未タスクリンク実体不足） |
| 2026-02-19 | 1.15.0 | TASK-9A-B 実装苦戦箇所3件を追加（仕様書の実装事実ドリフト、Preload公開先パス取り違え、未タスクraw検出の誤読防止） |
| 2026-02-19 | 1.15.0 | TASK-FIX-10-1 教訓追加（Step 2要否判定、未タスク検出範囲、Vitest alias運用）。同種課題向けに「簡潔解決手順（5ステップ）」を追加 |
| 2026-02-14 | 1.14.0 | UT-FIX-IPC-RESPONSE-UNWRAP-001 実装苦戦箇所4件追加（TypeScript type erasure、ハンドラ応答形式不統一、テストモック波及修正、safeInvokeUnwrap設計判断） |
| 2026-02-14 | 1.13.0 | UT-FIX-IPC-RESPONSE-UNWRAP-001 教訓3件追加（仕様書参照正本の不一致、MINOR未タスク化漏れ、完了移管時のリンク不整合） |
| 2026-02-14 | 1.12.0 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 の苦戦箇所を2件追記（IPC_CHANNELS全走査の前提確認、IPC外リスナー解除漏れの防止） |
| 2026-02-14 | 1.12.0 | TASK-FIX-14-1 実装面の技術教訓4件追加（大量テストモック更新、debug後方互換判断、カバレッジ計測注意点、条件ガード削除による簡素化） |
| 2026-02-14 | 1.11.0 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 教訓追加（ipcMain.handle()二重登録例外、macOS activateライフサイクル） |
| 2026-02-14 | 1.11.0 | TASK-FIX-14-1 教訓追加（Phase 12成果物の実変更ファイル名照合、Step 1-A/1-C/1-D先送り誤判定防止、未タスク登録3ステップ同時完了） |
| 2026-02-13 | 1.10.0 | TASK-FIX-13-1 追加教訓2件（ドキュメント偏重による実装検証省略、並列エージェント成果物品質保証） |
| 2026-02-13 | 1.9.0 | TASK-FIX-13-1 苦戦箇所3件追加（deprecated削除範囲境界、`name`参照誤検出、Phase 12仕様同期漏れ防止） |
| 2026-02-13 | 1.8.0 | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 テスト環境教訓3件追加（happy-dom/userEvent非互換、テスト実行ディレクトリ依存、jsdom切替副作用） |
| 2026-02-13 | 1.7.0 | TASK-FIX-11-1-SDK-TEST-ENABLEMENT 教訓追加（Phase 12 Step 1-A/1-D誤判定、未タスクraw検出の誤検知、Vitestモック再初期化の注意点） |
| 2026-02-13 | 1.6.1 | UT-9B-H-003: SkillCreator IPCセキュリティ強化の教訓追加（TDDセキュリティ開発、正規表現パターン検証、YAGNI判断、Phase 12並列エージェント管理） |
| 2026-02-13 | 1.6.0 | UT-9B-H-003 追補教訓を追加（返却仕様の文言不整合、完了済み未タスク残置、Phase 12成果物レジストリ更新漏れ） |
| 2026-02-12 | 1.5.1 | UT-STORE-HOOKS-TEST-REFACTOR-001 苦戦箇所5・6追加（Phase 12 Step 2誤判定、実装ガイドテストカテゴリテーブル不整合） |
| 2026-02-12 | 1.5.0 | UT-STORE-HOOKS-TEST-REFACTOR-001 教訓追加（renderHookパターン移行、テストヘルパー共通化、electronAPIモック統一） |
| 2026-02-12 | 1.4.0 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 教訓追加（個別セレクタ移行、Phase 12チェックリスト管理） |
| 2026-02-12 | 1.3.1 | TASK-9B-H: 苦戦箇所の教訓5-8を追加（Phase 12暗黙的要件、artifacts.json全Phase更新、設計書-実装乖離管理、複数エージェント並列時の仕様書更新漏れ） |
| 2026-02-12 | 1.3.0 | 苦戦箇所1・3のコード例を実際の実装と整合するよう修正（架空のversion/authorフィールド削除、executeSkillシグネチャ修正） |
| 2026-02-12 | 1.2.1 | TASK-9B-H: SkillCreatorService IPCハンドラー登録の教訓追加（Preload統合漏れ、並列Phase実行、IPC型定義配置、artifacts.jsonステータス管理） |
| 2026-02-12 | 1.2.0 | TASK-FIX-7-1 追加苦戦箇所2件記録（Phase間テスト数整合性問題、未タスク指示書作成漏れ） |
| 2026-02-11 | 1.1.0 | テンプレート準拠、目次・コード例追加 |
| 2026-02-11 | 1.0.0 | 初版作成（TASK-FIX-7-1 苦戦箇所記録） |

---

## UT-IPC-AUTH-HANDLE-DUPLICATE-001: AUTH IPC登録一元化

### 苦戦箇所: 通常経路とfallback経路の片側のみを整理すると監査ノイズが残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `authHandlers.ts` のみ一元化すると `ipc/index.ts` fallback側に同型重複が残る |
| 原因 | 監査観点を通常経路に限定し、非Supabase経路を同時対象化していなかった |
| 対処 | 通常経路・fallback経路の両方を宣言的登録へ統一し、同時に回帰テストを追加 |
| 教訓 | AUTH系は「通常 + fallback」を1セットで扱わないと再発監査でノイズが残る |

### 同種課題の簡潔解決手順（3ステップ）

1. `AUTH_*` の登録点を通常経路とfallback経路で同時列挙する  
2. 両経路を配列/マップ化し、`ipcMain.handle` 直接重複を排除する  
3. `rg -n \"ipcMain\\.handle\\(\\s*IPC_CHANNELS\\.AUTH_\"` が0件であることを回帰テストと合わせて確認する

### 苦戦箇所: 全体監査FAILと今回差分FAILの混同

| 項目 | 内容 |
| --- | --- |
| 課題 | `audit-unassigned-tasks.js` の既存baseline違反を、今回変更差分の失敗と誤認しやすい |
| 原因 | 全体監査（資産健全性）と対象監査（今回差分）を同じ判定軸で扱っていた |
| 対処 | `detect-unassigned-tasks --scan <変更ディレクトリ>` を併用し、current/baseline を分離判定 |
| 教訓 | Phase 12 では「全体監査結果」と「今回差分起因」の両方を同時記録する |

### 同種課題の簡潔解決手順（4ステップ・再監査版）

1. `audit-unassigned-tasks.js` で baseline 健全性を確認する  
2. `detect-unassigned-tasks --scan <変更範囲>` で current 差分を抽出する  
3. `unassigned-task-detection.md` に baseline/current を分けて記録する  
4. 完了移管した未タスク参照は `completed-tasks/` 側へ同期更新する  

### 同種課題の即時実行テンプレート（20分版）

| 項目 | 内容 |
| --- | --- |
| 目的 | AUTH系IPCの重複登録と監査誤判定を1回の修正サイクルで解消する |
| 前提 | 通常経路とfallback経路を同時に編集対象へ含める |
| 成功条件 | 実装重複0件、回帰テストPASS、仕様/台帳/リンク整合PASS |

| Step | 実施内容 | 成果物/証跡 |
| --- | --- | --- |
| 1 | 通常/fallbackのAUTH 5チャネルを同時列挙 | 変更対象リスト |
| 2 | 共通登録ヘルパー + 配列/ループ登録へ統一 | 差分（`authHandlers.ts`, `index.ts`） |
| 3 | baseline/current監査を分離して記録 | `unassigned-task-detection.md` |
| 4 | 仕様書/台帳/リンクを同一ターンで同期 | `task-workflow.md`, `verify-unassigned-links.log` |

| 失敗しやすい点 | 回避策 |
| --- | --- |
| `audit-unassigned-tasks` のFAILだけで差分FAILと判断する | `detect-unassigned-tasks --scan` を必ず併記して判定 |
| 参照更新を後回しにしてリンク切れを残す | 完了移管と同時に `verify-unassigned-links.js` を実行 |
| 通常経路のみ修正してfallback経路を見落とす | Step 1で対象チャネルを2経路で明示チェック |

---

## 目次

0. [UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001: task-9D〜9J 仕様差分の統合是正](#ut-imp-ipc-preload-extension-spec-alignment-001-task-9d9j-仕様差分の統合是正)
   - [苦戦箇所1: 旧パスが文書内で混在し正本が不明瞭化](#苦戦箇所1-旧パスが文書内で混在し正本が不明瞭化)
   - [苦戦箇所2: artifacts必須項目の漏れがtaskごとに発生](#苦戦箇所2-artifacts必須項目の漏れがtaskごとに発生)
   - [苦戦箇所3: Date型方針がtask-9Iのみドリフト](#苦戦箇所3-date型方針がtask-9iのみドリフト)
   - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ-2)

0. [UT-IPC-DATA-FLOW-TYPE-GAPS-001: Phase 12再監査（仕様書修正タスク）](#ut-ipc-data-flow-type-gaps-001-phase-12再監査仕様書修正タスク)
   - [苦戦箇所1: Phase 12成果物の不足](#苦戦箇所1-phase-12成果物の不足)
   - [苦戦箇所2: artifactsjson 二重管理の非同期](#苦戦箇所2-artifactsjson-二重管理の非同期)
   - [苦戦箇所3: 未タスク指示書フォーマット不一致](#苦戦箇所3-未タスク指示書フォーマット不一致)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
   - [苦戦箇所4: 仕様書修正タスクのPhaseテンプレート適用困難](#苦戦箇所4-仕様書修正タスクのphaseテンプレート適用困難)
   - [苦戦箇所5: 6ギャップの横断的分析の複雑性](#苦戦箇所5-6ギャップの横断的分析の複雑性)
   - [苦戦箇所6: Date型シリアライズ方針の統一判断](#苦戦箇所6-date型シリアライズ方針の統一判断)
   - [苦戦箇所7: positional→object形式のIPC引数移行設計](#苦戦箇所7-positionalobject形式のipc引数移行設計)
   - [同種課題の簡潔解決手順（5ステップ）- 仕様書修正タスク向け](#同種課題の簡潔解決手順5ステップ-仕様書修正タスク向け)

0. [UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化](#ut-fix-ts-vitest-tsconfig-paths-001-vitest-alias-と-tsconfig-paths-の同期自動化)
   - [苦戦箇所1: Phase 12未タスク検出ソースの網羅漏れ](#苦戦箇所1-phase-12未タスク検出ソースの網羅漏れ)
   - [苦戦箇所2: validate-phase-output のセクション終端依存](#苦戦箇所2-validate-phase-output-のセクション終端依存)
   - [苦戦箇所3: 全体監査結果と今回差分の混同](#苦戦箇所3-全体監査結果と今回差分の混同)
   - [同種課題の簡潔解決手順（5ステップ・再監査版）](#同種課題の簡潔解決手順5ステップ再監査版)
0. [TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 4設定ファイル整合CIガード](#task-imp-module-resolution-ci-guard-001-reposhared-4設定ファイル整合ciガード)
   - [苦戦箇所1: Phase 10 MINORの残置（レポート仕様ドリフト）](#1-phase-10-minorの残置レポート仕様ドリフト)
   - [苦戦箇所2: Phase 12証跡と仕様書本体状態の同期漏れリスク](#2-phase-12証跡と仕様書本体状態の同期漏れリスク)
   - [苦戦箇所3: 未タスク監査結果のベースライン混同](#3-未タスク監査結果のベースライン混同)
   - [苦戦箇所4: vitest.config.ts の正規表現パース](#4-vitestconfigts-の正規表現パース)
   - [苦戦箇所5: キー形式の相互変換設計](#5-キー形式の相互変換設計)
   - [苦戦箇所6: typesVersions の "." エントリスキップロジック](#6-typesversions-の--エントリスキップロジック)
   - [苦戦箇所7: process.exitCode vs process.exit() のテスタビリティ](#7-processexitcode-vs-processexit-のテスタビリティ)
   - [同種課題の簡潔解決手順（5ステップ・CIガード版）](#同種課題の簡潔解決手順5ステップciガード版)
0. [UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog の id/name 契約不整合修正](#ut-fix-skill-import-id-mismatch-001-skillimportdialog-の-idname-契約不整合修正)
   - [苦戦箇所1: 同名コンポーネントの誤調査](#1-同名コンポーネントの誤調査)
   - [苦戦箇所2: `skill.id`/`skill.name` の文字列型混同](#2-skillidskillname-の文字列型混同)
   - [苦戦箇所3: インポート処理の偽成功ログの誤読](#3-インポート処理の偽成功ログの誤読)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
0. [UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import インターフェース整合修正](#ut-fix-skill-import-interface-001-skillimport-インターフェース整合修正)
   - [苦戦箇所1: Phase 12成果物と仕様書本体ステータスの不一致](#1-phase-12成果物と仕様書本体ステータスの不一致)
   - [苦戦箇所2: ワークフロー移動後の旧参照パス残存](#2-ワークフロー移動後の旧参照パス残存)
   - [苦戦箇所3: Vitest実行ディレクトリ差異による偽失敗](#3-vitest実行ディレクトリ差異による偽失敗)
   - [同種課題の簡潔解決手順（5ステップ・import版）](#同種課題の簡潔解決手順5ステップimport版)
0. [UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove インターフェース整合修正](#ut-fix-skill-remove-interface-001-skillremove-インターフェース整合修正)
   - [苦戦箇所1: `skillId` / `skillName` 契約ドリフト](#1-skillid--skillname-契約ドリフト)
   - [苦戦箇所2: 未タスク配置ディレクトリのドリフト](#2-未タスク配置ディレクトリのドリフト)
   - [苦戦箇所3: Vitest実行コンテキスト差異](#3-vitest実行コンテキスト差異)
   - [苦戦箇所4: worktree環境でのStep 1-A先送り誤判断](#4-worktree環境でのstep-1-a先送り誤判断)
   - [苦戦箇所5: マルチエージェントPhase実行の依存順序違反](#5-マルチエージェントphase実行の依存順序違反)
   - [苦戦箇所6: worktree環境でのPhase 11手動テスト制約](#6-worktree環境でのphase-11手動テスト制約)
   - [苦戦箇所7: カバレッジ閾値のスコープ解釈](#7-カバレッジ閾値のスコープ解釈)
   - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ)
0. [UT-FIX-SKILL-VALIDATION-CONSISTENCY-001: skill:ハンドラP42準拠バリデーション形式統一](#ut-fix-skill-validation-consistency-001-skillハンドラp42準拠バリデーション形式統一)
   - [苦戦箇所1: 補完タスクと元未タスクの二重管理](#1-補完タスクと元未タスクの二重管理)
   - [苦戦箇所2: Phase 12成果物と仕様書本体ステータスの同期漏れ](#2-phase-12成果物と仕様書本体ステータスの同期漏れ)
   - [苦戦箇所3: 未タスクraw検出に既存TODOが混在](#3-未タスクraw検出に既存todoが混在)
   - [苦戦箇所4: 6ハンドラの引数形式の違い（オブジェクト型 vs 直接引数型）](#4-6ハンドラの引数形式の違いオブジェクト型-vs-直接引数型)
   - [苦戦箇所5: return → throw マイグレーション時のRenderer側影響分析](#5-return--throw-マイグレーション時のrenderer側影響分析)
   - [苦戦箇所6: コンテキスト枯渇による3セッション分割](#6-コンテキスト枯渇による3セッション分割)
   - [同種課題の簡潔解決手順（プロセス面4ステップ + 実装面5ステップ）](#同種課題の簡潔解決手順プロセス面4ステップ--実装面5ステップ)
0. [TASK-9A-C: SkillEditor 仕様書再監査（Phase 12準拠）](#task-9a-c-skilleditor-仕様書再監査phase-12準拠)
   - [苦戦箇所1: tasks/completed-task 参照混在](#1-taskscompleted-task-参照混在)
   - [苦戦箇所2: phase-09 と phase-9 の表記ゆれ](#2-phase-09-と-phase-9-の表記ゆれ)
   - [苦戦箇所3: Step 1-B の状態判定の曖昧さ](#3-step-1-b-の状態判定の曖昧さ)
   - [苦戦箇所4: 未タスク参照の実体不足](#4-未タスク参照の実体不足)
   - [苦戦箇所5: 並列エージェント実行時のAPIレートリミット](#5-並列エージェント実行時のapiレートリミット)
   - [苦戦箇所6: スキルスクリプトのパス解決](#6-スキルスクリプトのパス解決)
   - [苦戦箇所7: 大規模仕様書のコンテキスト管理](#7-大規模仕様書のコンテキスト管理)
   - [苦戦箇所8: 仕様書へのPitfall事前組み込みの有効性](#8-仕様書へのpitfall事前組み込みの有効性)
0. [TASK-9A-B: スキルファイル操作IPCハンドラー実装](#task-9a-b-スキルファイル操作ipcハンドラー実装)
   - [苦戦箇所1: 仕様書の実装事実ドリフト（テスト件数・エラーメッセージ）](#1-仕様書の実装事実ドリフトテスト件数エラーメッセージ)
   - [苦戦箇所2: Preload公開先パスの取り違え](#2-preload公開先パスの取り違え)
   - [苦戦箇所3: 未タスク検出raw件数の誤読防止](#3-未タスク検出raw件数の誤読防止)
   - [苦戦箇所4: handlerMap ESMモックパターン](#4-handlermap-esmモックパターン)
   - [苦戦箇所5: v8カバレッジの関数定義行カウント問題](#5-v8カバレッジの関数定義行カウント問題)
   - [苦戦箇所6: .trim()境界値バリデーション漏れ](#6-trim境界値バリデーション漏れ)
   - [苦戦箇所7: isKnownSkillFileError型ガードによるエラーサニタイズ設計](#7-isknownskillfileerror型ガードによるエラーサニタイズ設計)
0. [TASK-FIX-10-1: Vitest未処理Promise拒否検知の復元](#task-fix-10-1-vitest未処理promise拒否検知の復元)
   - [苦戦箇所1: Step 2要否判定の誤り](#1-step-2要否判定の誤り)
   - [苦戦箇所2: 未タスク検出範囲の不足](#2-未タスク検出範囲の不足)
   - [苦戦箇所3: alias運用の継続性不足](#3-alias運用の継続性不足)
   - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ)
0. [TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: @repo/shared モジュール解決エラー修正](#task-fix-ts-shared-module-resolution-001-reposhared-モジュール解決エラー修正)
   - [苦戦箇所1: exports/paths/alias 三層整合の同期漏れ](#1-exportspathsalias-三層整合の同期漏れ)
   - [苦戦箇所2: source直接参照時の補助型宣言取り込み漏れ](#2-source直接参照時の補助型宣言取り込み漏れ)
   - [苦戦箇所3: 未タスクリンク整合の既存崩れ](#3-未タスクリンク整合の既存崩れ)
   - [苦戦箇所4: TypeScript paths 定義順序の重要性](#4-typescript-paths-定義順序の重要性)
   - [苦戦箇所5: 4ファイル同期の必要性](#5-4ファイル同期の必要性packagejson--tsconfig--vitestconfig--typesversions)
   - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ-1)
0. [UT-FIX-IPC-RESPONSE-UNWRAP-001: IPCレスポンスラッパー未展開修正](#ut-fix-ipc-response-unwrap-001-ipcレスポンスラッパー未展開修正)
   - [苦戦箇所1: 仕様書の正本参照が不一致](#1-仕様書の正本参照が不一致)
   - [苦戦箇所2: Phase 10 MINORの未タスク化漏れ](#2-phase-10-minorの未タスク化漏れ)
   - [苦戦箇所3: 完了移管後のリンク不整合](#3-完了移管後のリンク不整合)
   - [苦戦箇所4: TypeScript ジェネリクスの type erasure によるバグ根本原因](#4-typescript-ジェネリクスの-type-erasure-によるバグ根本原因)
   - [苦戦箇所5: ハンドラ応答形式の不統一](#5-ハンドラ応答形式の不統一safeinvoke-vs-safeinvokeunwrap-選択)
   - [苦戦箇所6: テストモック値の波及修正（19箇所）](#6-テストモック値の波及修正19箇所)
   - [苦戦箇所7: Phase 10 仕様書テーブルと実装の乖離](#7-phase-10-仕様書テーブルと実装の乖離)
0. [TASK-FIX-14-1: console → electron-log 移行](#task-fix-14-1-console--electron-log-移行)
   - [苦戦箇所1: 実変更ファイル名との乖離](#1-実変更ファイル名との乖離)
   - [苦戦箇所2: Phase 12 Step 1-A/1-C/1-D の先送り誤判定](#2-phase-12-step-1-a1-c1-d-の先送り誤判定)
   - [苦戦箇所3: 未タスク検出後の登録漏れ](#3-未タスク検出後の登録漏れ)
   - [苦戦箇所4: 大量テストファイルへのモック一括追加](#4-大量テストファイルへのモック一括追加)
   - [苦戦箇所5: debug プロパティの後方互換性判断](#5-debug-プロパティの後方互換性判断)
   - [苦戦箇所6: カバレッジ計測コマンドの引数誤り](#6-カバレッジ計測コマンドの引数誤り)
   - [苦戦箇所7: 条件ガード削除による予想外の簡素化効果](#7-条件ガード削除による予想外の簡素化効果)
0. [TASK-FIX-13-1: deprecatedプロパティ正式移行](#task-fix-13-1-deprecatedプロパティ正式移行)
   - [苦戦箇所1: 削除対象の境界判定](#1-削除対象の境界判定)
   - [苦戦箇所2: 汎用プロパティ参照の誤検出回避](#2-汎用プロパティ参照の誤検出回避)
   - [苦戦箇所3: Phase-12仕様同期漏れの防止](#3-phase-12仕様同期漏れの防止)
   - [苦戦箇所4: ドキュメント偏重による実装検証の省略](#4-ドキュメント偏重による実装検証の省略)
   - [苦戦箇所5: 並列エージェント実行時の成果物品質保証](#5-並列エージェント実行時の成果物品質保証)
0. [TASK-FIX-11-1: SDK統合テスト有効化](#task-fix-11-1-sdk統合テスト有効化)
   - [苦戦箇所1: Phase 12 Step 1-A/1-D の誤判定](#1-phase-12-step-1-a1-d-の該当なし誤判定)
   - [苦戦箇所2: 未タスク検出 raw 結果の誤読](#2-未タスク検出の-raw-結果をそのまま採用)
   - [苦戦箇所3: Vitest モック初期化の挙動差異](#3-vitest-モック初期化の挙動差異)
1. [TASK-FIX-7-1: SkillService executeSkill 委譲実装](#task-fix-7-1-skillservice-executeskill-委譲実装)
   - [苦戦箇所1: Setter Injection vs Constructor Injection](#1-setter-injection-vs-constructor-injection-の選択)
   - [苦戦箇所2: テストモックの大規模修正](#2-テストモックの大規模修正)
   - [苦戦箇所3: 型変換](#3-skill-から-skillmetadata-への型変換)
   - [苦戦箇所4: Phase間テスト数整合性問題](#4-phase間テスト数整合性問題)
   - [苦戦箇所5: 未タスク指示書の作成漏れ](#5-未タスク指示書の作成漏れ)
2. [UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行](#ut-store-hooks-component-migration-001-個別セレクタhook移行)
   - [苦戦箇所1: useStoreの参照安定性](#1-usestoreの参照安定性)
   - [苦戦箇所2: Phase 12チェックリスト管理](#2-phase-12チェックリスト管理)
3. [TASK-9B-H: SkillCreatorService IPCハンドラー登録](#task-9b-h-skillcreatorservice-ipcハンドラー登録)
   - [教訓1: Preload統合の漏れ防止](#1-preload統合の漏れ防止)
   - [教訓2: 並列Phase実行時のレビュータイミング](#2-並列phase実行時のレビュータイミング)
   - [教訓3: IPC型定義の配置戦略](#3-ipc型定義の配置戦略)
   - [教訓4: artifacts.jsonのPhaseステータス管理](#4-artifactsjsonのphaseステータス管理)
   - [教訓5: Phase 12の暗黙的要件の見落とし](#5-phase-12の暗黙的要件の見落とし)
   - [教訓6: artifacts.jsonのPhase別ステータス更新忘れ](#6-artifactsjsonのphase別ステータス更新忘れ)
   - [教訓7: 設計書と実装の乖離管理](#7-設計書と実装の乖離管理)
   - [教訓8: 複数エージェント並列実行時のシステム仕様書更新漏れ](#8-複数エージェント並列実行時のシステム仕様書更新漏れ)
   - [教訓9: 返却仕様文言・完了済み未タスク配置・artifacts最終整合](#9-返却仕様文言完了済み未タスク配置artifacts最終整合)
4. [UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行](#ut-store-hooks-test-refactor-001-renderhookパターン移行)
   - [苦戦箇所1: renderHookへの移行効果](#1-renderhookへの移行効果)
   - [苦戦箇所2: テストヘルパー関数の共通化](#2-テストヘルパー関数の共通化)
   - [苦戦箇所3: electronAPIモックの統一](#3-electronapiモックの統一)
   - [苦戦箇所4: 移行中のテスト数増加](#4-移行中のテスト数増加)
   - [苦戦箇所5: Phase 12 Step 2 の「該当なし」誤判定](#5-phase-12-step-2-の該当なし誤判定)
   - [苦戦箇所6: 実装ガイドのテストカテゴリテーブル不整合](#6-実装ガイドのテストカテゴリテーブル不整合)
5. [UT-9B-H-003: SkillCreator IPCセキュリティ強化](#ut-9b-h-003-skillcreator-ipcセキュリティ強化)
   - [苦戦箇所1: TDDでのセキュリティテスト先行設計の難しさ](#1-tddでのセキュリティテスト先行設計の難しさ)
   - [苦戦箇所2: 正規表現パターンのPrettier干渉](#2-正規表現パターンのprettier干渉)
   - [苦戦箇所3: YAGNI判断での共通化見送りの根拠付け](#3-yagni判断での共通化見送りの根拠付け)
   - [苦戦箇所4: Phase 11のCLI環境での手動テスト不可](#4-phase-11のcli環境での手動テスト不可)
   - [苦戦箇所5: 複数セッション間でのPhase 12成果物整合性](#5-複数セッション間でのphase-12成果物整合性)
6. [UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト](#ut-fix-agentview-infinite-loop-001-agentview無限ループ修正テスト)
   - [苦戦箇所1: happy-dom環境でのuserEvent非互換](#1-happy-dom環境でのuserevent非互換)
   - [苦戦箇所2: テスト実行ディレクトリ依存問題](#2-テスト実行ディレクトリ依存問題)
   - [苦戦箇所3: jsdom切り替え時の副作用](#3-jsdom切り替え時の副作用)
7. [UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止](#ut-fix-ipc-handler-double-reg-001-ipcハンドラ二重登録防止)
   - [教訓1: ipcMain.handle()の二重登録は例外送出](#1-ipcmainhandleの二重登録は例外送出)
   - [教訓2: IPC_CHANNELS 全走査の前提を先に検証する](#2-ipc_channels-全走査の前提を先に検証する)
   - [教訓3: IPC外リスナーの解除漏れを同時に防ぐ](#3-ipc外リスナーの解除漏れを同時に防ぐ)
8. [UT-SKILL-IMPORT-CHANNEL-CONFLICT-001: skill:import IPCチャネル名競合の予防的解消](#ut-skill-import-channel-conflict-001-skillimport-ipcチャネル名競合の予防的解消)
   - [苦戦箇所1: 仕様書修正のみタスクの完了反映が台帳から漏れた](#1-仕様書修正のみタスクの完了反映が台帳から漏れた)
   - [苦戦箇所2: workflow移管後の旧参照パス残存](#2-workflow移管後の旧参照パス残存)
   - [苦戦箇所3: 生成ミスによる-outputs-ゴーストディレクトリ](#3-生成ミスによる-outputs-ゴーストディレクトリ)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ-1)
9. [関連ドキュメント](#関連ドキュメント)
10. [テンプレート（新規教訓追加用）](#テンプレート新規教訓追加用)

---

## UT-IPC-DATA-FLOW-TYPE-GAPS-001: Phase 12再監査（仕様書修正タスク）

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-IPC-DATA-FLOW-TYPE-GAPS-001 |
| 目的 | IPCデータフロー型ギャップ修正タスクの Phase 12 成果物・システム仕様反映を完全同期する |
| 完了日 | 2026-02-24 |
| ステータス | **完了** |
| 関連Pitfall | P1, P2, P3, P4, P29 |

### 苦戦箇所1: Phase 12成果物の不足

| 項目 | 内容 |
|------|------|
| 課題 | `phase-12-documentation.md` で必須の `spec-update-summary.md` が未生成のまま進行していた |
| 原因 | `documentation-changelog.md` 更新時に成果物一覧との突合が後手になった |
| 対処 | `outputs/phase-12/` 実体と成果物表を1対1で突合し、不足成果物を即時作成した |
| 教訓 | Phase 12 は「文書更新完了」ではなく「成果物セット完了」で判定する |

### 苦戦箇所2: artifactsjson 二重管理の非同期

| 項目 | 内容 |
|------|------|
| 課題 | `artifacts.json` と `outputs/artifacts.json` の状態・成果物パスが分岐していた |
| 原因 | 片方のみ更新され、Phase 6/11/12 の成果物名が旧状態で残存した |
| 対処 | 2ファイルを同一内容へ同期し、completed成果物の実在チェックを実施した |
| 教訓 | 進捗台帳は同期手順を完了条件に組み込まないと再発する |

### 苦戦箇所3: 未タスク指示書フォーマット不一致

| 項目 | 内容 |
|------|------|
| 課題 | 未タスク指示書が旧テンプレート見出し（`## 1. メタ情報`）で監査違反になった |
| 原因 | Why/What/How 必須見出しへの追従不足 |
| 対処 | 指示書を最新テンプレート（`## メタ情報` + 1〜9セクション）へ全面整形した |
| 教訓 | 未タスク作成直後に `audit-unassigned-tasks.js` 単体監査を実行する |

### 同種課題の簡潔解決手順（4ステップ）

1. `phase-12-documentation.md` の成果物一覧と `outputs/phase-12/` 実体を突合する
2. `artifacts.json` と `outputs/artifacts.json` を同時更新し、completed成果物の参照切れをゼロ化する
3. `generate-index.js` 実行結果を `documentation-changelog.md` と `spec-update-summary.md` に記録する
4. 未タスク指示書は `audit-unassigned-tasks.js` で単体監査し、必須見出し不足を解消してから完了扱いにする

### 苦戦箇所4: 仕様書修正タスクのPhaseテンプレート適用困難

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: タスク管理・ワークフロー
- **症状**: コード変更なしの仕様書修正タスクでは、Phase 4（テスト作成）、Phase 7（カバレッジ確認）、Phase 11（手動テスト）が本来の意味（ユニットテスト、カバレッジ率、UI操作確認）と合致しない
- **原因**: Phase 1-13テンプレートはコード実装タスクを前提としており、仕様書修正のみタスクに対する簡略化Phaseガイドが存在しなかった
- **解決策**:
  - Phase 4 = grep検証基準設計（49検証項目を正規表現パターンとして定義）
  - Phase 5 = 仕様書修正実行（7ファイル、28修正項目）
  - Phase 6-7 = grepベース整合性検証（24項目）+ 網羅性確認（49項目）
  - Phase 11 = 実装者視点レビュー（3視点×3ケース = 9テスト）
- **教訓**: 仕様書修正タスクでは、各Phaseの「N/A」判定ではなく、同等の品質保証を別手段で実現する代替アプローチを設計すべき

### 苦戦箇所5: 6ギャップの横断的分析の複雑性

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: 分析・設計
- **症状**: 7ファイル×6ギャップ = 42交差ポイントの検証で、Gap別に修正すると1ファイル内の整合性が崩れ、ファイル別に修正するとGap間の一貫性が失われる
- **原因**: 型ギャップは複数ファイルに跨る横断的な問題であり、単一ファイルのスコープでは完全な検証ができない
- **解決策**:
  1. Phase 1でGap別に問題を分類し、影響範囲マトリクス（Gap×ファイル）を作成
  2. Phase 5ではGap別に修正を実行し、各Gap完了時にファイル間整合性を確認
  3. Phase 6で横断的整合性検証（24項目）、Phase 7で網羅性確認（49項目）を分離
- **教訓**: 横断的な型ギャップ修正では「Gap別修正→ファイル間検証」のサイクルが効果的。ファイル別に修正すると、後から別Gapの修正で先の修正と矛盾するリスクがある

### 苦戦箇所6: Date型シリアライズ方針の統一判断

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: 設計判断
- **症状**: 4ファイル（task-9f, 9g, 9h, 9j）に散在する14個のDate型フィールドに対し、IPC境界でのシリアライズ方針が未定義だった。`Date`型のままIPCで送信するとJSONシリアライズでタイムゾーン情報が失われるリスクがあった
- **原因**: 仕様書作成時にIPC境界での型変換を考慮していなかった。バックエンド側の`Date`型とフロントエンド側の`string`型の間のギャップが暗黙的だった
- **解決策**:
  - ISO 8601文字列（`string; // ISO 8601`）を統一基準として採用
  - Main Processハンドラの戻り値で`.toISOString()`に変換するパターンを標準化
  - Renderer側では`new Date(isoString)`で復元するパターンを明記
  - 14フィールド全てに型注記を一括追加

```typescript
// ❌ IPC境界でDate型を直接使用（シリアライズで情報欠落リスク）
interface SkillSchedule {
  nextRun: Date;       // JSONシリアライズで文字列化されるが形式が不定
  lastRun: Date | null;
}

// ✅ ISO 8601文字列で統一
interface SkillSchedule {
  nextRun: string;       // ISO 8601
  lastRun: string | null; // ISO 8601
}

// Main Process側の変換
return {
  nextRun: schedule.nextRun.toISOString(),
  lastRun: schedule.lastRun?.toISOString() ?? null,
};

// Renderer側の復元
const nextRun = new Date(schedule.nextRun);
```

- **教訓**: IPC境界を越えるDate型は必ずISO 8601文字列に変換する方針を仕様書段階で定義すべき。後からの一括修正は14フィールド×4ファイルと影響範囲が大きい

### 苦戦箇所7: positional→object形式のIPC引数移行設計

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: 設計判断・IPC
- **症状**: task-9a（Skill Editor）の6ハンドラがpositional形式（`safeInvoke(channel, arg1, arg2)`）で定義されていたが、P44/P45の教訓からobject形式（`safeInvoke(channel, { key1: val1, key2: val2 })`）への統一が必要だった
- **原因**: task-9aの仕様書はP44発見前に作成されており、旧パターンのpositional引数が使用されていた
- **解決策**:
  1. 6ハンドラ分のArgs型定義を新規追加（`SkillEditorReadArgs`, `SkillEditorWriteArgs`等）
  2. P42準拠の3段バリデーション（型チェック→空文字列→trim空文字列）をobject内の各フィールドに適用
  3. Before/Afterコード例を仕様書に記載し、後続実装者が迷わないようにする
  4. 既存のpositional形式のsafeInvoke呼び出しも、Preload側でobjectに変換する中間層パターンを設計

```typescript
// ❌ positional形式（旧パターン、P44リスク）
safeInvoke(IPC_CHANNELS.SKILL_EDITOR_READ, skillName, relativePath);

// ✅ object形式（P44/P45準拠）
safeInvoke(IPC_CHANNELS.SKILL_EDITOR_READ, { skillName, relativePath });

// Args型定義
interface SkillEditorReadArgs {
  skillName: string;
  relativePath: string;
}

// ハンドラ側バリデーション（P42準拠）
ipcMain.handle('skill:editor:read', async (event, args: SkillEditorReadArgs) => {
  if (typeof args?.skillName !== 'string' || args.skillName.trim() === '') {
    throw { code: 'VALIDATION_ERROR', message: 'skillName must be a non-empty string' };
  }
  if (typeof args?.relativePath !== 'string' || args.relativePath.trim() === '') {
    throw { code: 'VALIDATION_ERROR', message: 'relativePath must be a non-empty string' };
  }
  // ...
});
```

- **教訓**: 仕様書段階でIPC引数形式を統一しておくことで、実装時のP44/P45再発リスクを完全に排除できる。6ハンドラ分のArgs型定義は手間だが、型安全性と保守性の向上に大きく寄与する

### 同種課題の簡潔解決手順（5ステップ）- 仕様書修正タスク向け

仕様書間のデータフロー型ギャップを検出・解消するタスクに遭遇した場合：

1. **ギャップマトリクス作成**: 全対象ファイルを横軸、全ギャップを縦軸とした影響範囲マトリクスを作成し、各セルに「修正要/不要/該当なし」を記入
2. **grepベースの検証基準設計**: 各ギャップの修正完了を判定する正規表現パターンを事前定義（例: `grep -c "string; // ISO 8601" task-9*.md` で Date型フィールド数を検証）
3. **Gap別修正→ファイル間検証のサイクル**: Gap単位で全ファイルを修正し、修正完了後にファイル間の整合性をgrepで横断検証
4. **Phase対応表の事前定義**: コード変更なしタスクの場合、各Phaseで何を代替実施するかを Phase 1 で事前定義（Phase 4=検証基準設計、Phase 6-7=grep検証 等）
5. **Phase 12の成果物を先に定義**: spec-update-summary.md、documentation-changelog.md、unassigned-task-report.md の3成果物を Phase 12 開始時に空ファイルで作成し、完了時に内容を埋める

---

## UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001: task-9D〜9J 仕様差分の統合是正

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 |
| 目的 | task-9D〜9J の参照差分・artifacts差分を統合是正し、実装前の契約ドリフトを防止する |
| 完了日 | 2026-02-25 |
| ステータス | **完了** |
| 関連Pitfall | P32, P44, P45 |

### 苦戦箇所1: 旧パスが文書内で混在し正本が不明瞭化

| 項目 | 内容 |
|------|------|
| 課題 | `preload/skillAPI.ts` と `preload/skill-api.ts`、`main/ipc/channels.ts` と `preload/channels.ts` が混在していた |
| 原因 | 移行前後の記述が task ごとに異なる時期で更新され、統一ルールが未適用だった |
| 対処 | 旧パス検出条件を固定し、対象7仕様書で0件になるまで一括是正 |
| 教訓 | 参照差分はファイル単位ではなく「対象群一括」で潰すほうが再発しにくい |

### 苦戦箇所2: artifacts必須項目の漏れがtaskごとに発生

| 項目 | 内容 |
|------|------|
| 課題 | `modifies` / `creates` の記載粒度が task ごとにズレ、実装時の変更対象が不明瞭だった |
| 原因 | task-9D〜9J で共通必須項目のテンプレート化がされていなかった |
| 対処 | 必須4項目（`channels.ts`, `skill-api.ts`, `types.ts`, `skill/index.ts`）を共通化し、domain型を task別に補完 |
| 教訓 | artifacts は「共通セット + domain差分」の2層で設計すると漏れを抑制できる |

### 苦戦箇所3: Date型方針がtask-9Iのみドリフト

| 項目 | 内容 |
|------|------|
| 課題 | task-9I の `GeneratedDoc.generatedAt` のみ `Date` 記述が残り、IPC境界方針と矛盾した |
| 原因 | Dateシリアライズ方針の追記が一部タスクへ未展開だった |
| 対処 | `string (ISO 8601)` へ統一し、IPCシリアライズ方針セクションを追記 |
| 教訓 | Date型を含む仕様は「型定義修正」と「方針文章追記」をセットで実施する |

### 同種課題の簡潔解決手順（5ステップ）

1. 監査対象を task 群へ限定し、全体ベースライン違反と分離する。  
2. 参照差分（oldPaths）と台帳差分（missingArtifacts）を別指標で収集する。  
3. 旧参照パスを一括置換し、再監査で0件化する。  
4. artifacts を共通セット + domain差分で補完し、7/7一致を確認する。  
5. `task-workflow.md` 完了記録・残課題状態・`LOGS.md` を同一タイミングで同期する。  

---

## UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| 目的 | `vite-tsconfig-paths` 導入で Vitest alias 手動同期を廃止し、4設定整合チェック運用を安定化 |
| 完了日 | 2026-02-24 |
| ステータス | **完了** |
| 関連Pitfall | P3, P4, P43 |

### 苦戦箇所1: Phase 12未タスク検出ソースの網羅漏れ

| 項目 | 内容 |
|------|------|
| 課題 | `unassigned-task-report.md` が5検出ソース前提に対し、4ソース中心の記述になり監査観点が欠落した |
| 原因 | TODO/FIXME・`.skip`・Phase 10中心に確認し、Phase 3/11の明示記録が弱かった |
| 対処 | レポートを5ソース固定（Phase 3/10/11 + TODO/FIXME + `.skip`）へ再構成し、各ソースの判定根拠を明文化 |
| 教訓 | Phase 12 Task 4は「検出件数」より先に「検出ソース網羅」をチェックする |

### 苦戦箇所2: validate-phase-output のセクション終端依存

| 項目 | 内容 |
|------|------|
| 課題 | `validate-phase-output.js` のセクション抽出が終端依存実装で誤判定リスクを持っていた |
| 原因 | JavaScript環境で終端表現に依存した実装を使っていた |
| 対処 | `content + sentinel heading` 方式へ変更し、見出し境界のみで抽出する実装へ修正 |
| 教訓 | Markdown抽出は「終端文字」ではなく「次見出し」を境界にする |

### 苦戦箇所3: 全体監査結果と今回差分の混同

| 項目 | 内容 |
|------|------|
| 課題 | `audit-unassigned-tasks` の既存違反（67件/5件）を今回タスク起因と誤認しやすかった |
| 原因 | 全体健全性監査と変更差分監査を同じ文脈で扱った |
| 対処 | 全体監査結果はベースラインとして分離記録し、今回差分は `verify-unassigned-links` と対象ファイル個別確認で判定 |
| 教訓 | 「repo全体」と「今回対象」の判定軸を分離しないと優先順位が崩れる |

### 同種課題の簡潔解決手順（5ステップ・再監査版）

1. Phase 12 Task 4の5検出ソースをチェックリスト化し、漏れなく実行記録する
2. 検証スクリプトの抽出ロジックは見出し境界ベースで実装し、終端依存を避ける
3. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` をセットで実行する
4. `audit-unassigned-tasks` は全体ベースラインとして扱い、今回差分判定を別で記録する
5. lessons/LOGS/SKILL/Phase成果物を同一タスクIDで同日同期し、追跡可能性を閉じる

---

## TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 4設定ファイル整合CIガード

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| 目的 | @repo/shared パッケージの4設定ファイル（exports, paths, alias, typesVersions）間の整合性をCIで自動検証するガードスクリプトの実装 |
| 完了日 | 2026-02-22 |
| ステータス | **完了** |
| 関連Pitfall | P3, P4, P43 |
| テスト | `scripts/__tests__/check-shared-module-sync.test.ts` 43件PASS |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| CIガードスクリプト | `scripts/check-shared-module-sync.ts` | 4パーサー + 5チェッカー + 3ヘルパー + 2レポーター = 14関数 |
| テストスイート | `scripts/__tests__/check-shared-module-sync.test.ts` | 43テスト（8セクション: パーサー/チェッカー/レポーター/統合/ロバスト性/複合不整合/エッジケース/エラーハンドリング） |
| CI設定 | `.github/workflows/ci.yml` | `check-module-sync` ジョブ追加（buildの前提条件の1つ） |

### 苦戦箇所と解決策

#### 1. Phase 10 MINORの残置（レポート仕様ドリフト）

| 項目 | 内容 |
|------|------|
| **課題** | コア検証は完了していたが、レポート仕様（修正ガイダンス/件数サマリー/`printSummary`シグネチャ）がPhase 2設計と一致しなかった |
| **原因** | 検出ロジックとCI統合を優先し、出力フォーマット整備を後段に回した |
| **解決策** | MINOR 3件を `TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001` に統合し、`docs/30-workflows/unassigned-task/` に起票してP3 3ステップを完了した |
| **教訓** | Phase 10のMINORは「次回対応メモ」ではなく、同日中に未タスク化して追跡可能な状態にする |

#### 2. Phase 12証跡と仕様書本体状態の同期漏れリスク

| 項目 | 内容 |
|------|------|
| **課題** | 成果物が存在しても `phase-12-documentation.md` や関連台帳の状態同期が漏れるリスクがあった |
| **原因** | 成果物作成と仕様更新が別工程で進み、最終同期チェックが弱かった |
| **解決策** | `verify-all-specs` / `validate-phase-output` を同時実行し、成果物・仕様書本体・台帳の整合を機械検証した |
| **教訓** | Phase 12は「成果物がある」だけでは不十分で、状態同期までを完了条件に含める必要がある |

#### 3. 未タスク監査結果のベースライン混同

| 項目 | 内容 |
|------|------|
| **課題** | `audit-unassigned-tasks.js` で全体違反（既存68件）が出るため、今回対象の未タスク品質判定と混同しやすかった |
| **原因** | 全件監査結果をそのまま「今回不備」と解釈しやすい出力形式だった |
| **解決策** | 全体監査と対象ファイル個別確認を分離し、`task-imp-module-sync-report-enhancement.md` のテンプレ準拠を個別確認した |
| **教訓** | 監査は「全体健全性」と「今回差分」を分けて報告しないと、是正優先順位が崩れる |

#### 4. vitest.config.ts の正規表現パース

| 項目 | 内容 |
|------|------|
| **課題** | vitest.config.ts はTypeScriptファイルであり、JSON.parse()できない。alias定義を正規表現で抽出する必要がある |
| **原因** | `resolve(__dirname, "../../packages/shared/src/utils/index.ts")` のような関数呼び出しが値に含まれ、構造化パースが困難 |
| **解決策** | `/"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*\)/g` の正規表現で「キー: resolve(__dirname, "パス")」パターンのみ抽出。タブ/スペース混在、マルチライン、コメント挿入をテストで検証 |
| **教訓** | TypeScript設定ファイルのパースでは、完全なAST解析ではなく正規表現による部分マッチが現実的。ただしダブルクォート前提・コメント非対応など制約を明文化し、テスト（#29-32）で境界条件を網羅する |

**コード例**:

```typescript
const ALIAS_PATTERN = /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*\)/g;

export function parseAliases(filePath: string): Map<string, string> {
  const content = readFileSync(filePath, "utf-8");
  const aliases = new Map<string, string>();
  let match: RegExpExecArray | null;
  while ((match = ALIAS_PATTERN.exec(content)) !== null) {
    aliases.set(match[1], match[2]);
  }
  // 0件パース警告（alias キーワード存在時のみ）
  if (aliases.size === 0 && content.includes("alias")) {
    console.warn(`Warning: ${filePath} contains alias but no @repo/shared aliases were parsed`);
  }
  return aliases;
}
```

#### 5. キー形式の相互変換設計

| 項目 | 内容 |
|------|------|
| **課題** | 4設定ファイル間でキー形式が異なる: exports(`./utils`), paths(`@repo/shared/utils`), aliases(`@repo/shared/utils`), typesVersions(`utils`) |
| **原因** | npm (exports), TypeScript (paths), Vitest (alias), npm typesVersions がそれぞれ独自のキー命名規則を採用 |
| **解決策** | 3つのヘルパー関数を作成: `toModuleKey`(exports→paths/alias形式), `toSubpath`(paths/alias→exports形式), `toTypesVersionsKey`(exports→typesVersions形式)。変換ロジックはプレフィックス付加/除去のみでシンプルに保つ |
| **教訓** | 異なるシステム間のキー変換は、双方向変換関数を対で定義し、チェッカー関数はこれらを通して比較する設計が拡張性を維持しやすい |

**コード例**:

```typescript
// exports "./utils" → paths/alias "@repo/shared/utils"
function toModuleKey(subpath: string): string {
  return subpath === "." ? "@repo/shared" : `@repo/shared/${subpath.slice(2)}`;
}

// paths "@repo/shared/utils" → exports "./utils"
function toSubpath(moduleKey: string): string {
  return moduleKey === "@repo/shared" ? "." : `./${moduleKey.replace("@repo/shared/", "")}`;
}

// exports "./utils" → typesVersions "utils"（"." はスキップ対象）
function toTypesVersionsKey(subpath: string): string {
  return subpath.slice(2); // "./utils" → "utils"
}
```

#### 6. typesVersions の "." エントリスキップロジック

| 項目 | 内容 |
|------|------|
| **課題** | exports のメインエントリ（"."）は typesVersions に登録不要だが、サブパス（"./utils", "./errors" 等）は必須。この判定ロジックの正確な実装 |
| **原因** | package.json の typesVersions はサブパス用の型解決にのみ使用され、メインエントリの型は `types` フィールドで指定するため |
| **解決策** | `checkExportsVsTypesVersions` 内で `if (subpath === ".") continue;` でメインエントリをスキップ。テスト（#22-23）で「.」スキップ動作を明示的に検証 |
| **教訓** | npm パッケージ設定には「暗黙のルール」（メインエントリの型は types フィールドが担当）が存在する。チェッカー設計時にこれらの例外規則を先にリストアップし、テストで固定化することが重要 |

#### 7. process.exitCode vs process.exit() のテスタビリティ

| 項目 | 内容 |
|------|------|
| **課題** | `process.exit(1)` を使うとテストプロセス自体が終了してしまい、テスト不可能 |
| **原因** | `process.exit()` はプロセスを即座に終了させるため、Vitest のテストランナーごと終了する |
| **解決策** | `process.exitCode = 1` を使用し、プロセスは正常終了させる。テストでは `expect(process.exitCode).toBe(1)` で検証。`afterEach` で `process.exitCode = undefined` にリセット |
| **教訓** | CIスクリプトの終了コードテストでは、`process.exit()` ではなく `process.exitCode` プロパティを使用する。これによりmain関数の呼び出し後も制御がテストに戻る |

**コード例**:

```typescript
// ❌ テスト不可能
if (hasFailures) process.exit(1);

// ✅ テスト可能
if (hasFailures) process.exitCode = 1;

// テストでの検証
it("不整合がある場合 process.exitCode は 1", () => {
  main();
  expect(process.exitCode).toBe(1);
});
afterEach(() => { process.exitCode = undefined; });
```

### 同種課題の簡潔解決手順（5ステップ・CIガード版）

1. Phase 10レビュー直後にMINORを分類し、同一責務なら1つの未タスクへ統合する。
2. 未タスクは `docs/30-workflows/unassigned-task/` に作成し、`task-workflow.md` と関連仕様書への参照を同時更新する。
3. Phase 12では成果物作成後に `verify-all-specs` と `validate-phase-output` を連続実行して、仕様書本体状態まで同期確認する。
4. 未タスク監査は「全体ベースライン（既存違反）」と「今回対象ファイル」の2段で記録する。
5. `lessons-learned.md` と完了タスク仕様書に苦戦箇所を即日反映し、再発防止手順を固定化する。

### 成果物

| 成果物 | パス |
|--------|------|
| CIガードスクリプト | `scripts/check-shared-module-sync.ts` |
| テスト（43件） | `scripts/__tests__/check-shared-module-sync.test.ts` |
| CI設定 | `.github/workflows/ci.yml` |
| 実装ガイド | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-12/implementation-guide.md` |
| 未タスク指示書 | `docs/30-workflows/unassigned-task/task-imp-module-sync-report-enhancement.md` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| quality-requirements.md | 完了タスクセクション追加、派生未タスク参照リンク追加 (v1.9.0) |
| architecture-monorepo.md | 完了タスクセクション追加、ステータス列追加 (v1.3.0) |
| technology-devops.md | CIジョブテーブルに check-module-sync 追加 |
| task-workflow.md | 残課題テーブル完了化、TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001 登録 (v1.52.0) |
| LOGS.md (x2) | 完了ログ追加 |
| SKILL.md (x2) | 変更履歴追加 (v8.59.0 / v9.81.0) |
| topic-map.md | 再生成 (148ファイル, 1233キーワード) |

---

## UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog の id/name 契約不整合修正

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 目的 | Renderer層で `skill.id` を渡していた誤りを `skill.name` 契約へ修正する |
| 完了日 | 2026-02-22 |
| ステータス | **完了** |
| 関連Pitfall | P44, P45 |
| テスト | SkillImportDialog 49件 + AgentView統合3件 PASS |

### 苦戦箇所と解決策

#### 1. 同名コンポーネントの誤調査

| 項目 | 内容 |
|------|------|
| **課題** | `SkillImportDialog` が複数配置されており、修正対象コンポーネントの特定に時間を要した |
| **原因** | ファイル名検索だけで作業を開始し、実際の import 経路を先に固定しなかった |
| **解決策** | `AgentView` 側の import 文から逆引きし、`organisms/SkillImportDialog/index.tsx` を対象として固定した |
| **教訓** | UI不具合は「利用箇所 → import 先 → 実装本体」の順で特定すると迷走しにくい |

#### 2. `skill.id`/`skill.name` の文字列型混同

| 項目 | 内容 |
|------|------|
| **課題** | `skill.id` と `skill.name` がどちらも `string` のため、コンパイル時に契約違反が検出されない |
| **原因** | 型では区別できない識別子を、変数名と実装規約で分離していなかった |
| **解決策** | `onImport` を `skillNames` 命名に統一し、`selectedIds` から `name` へ明示変換を追加した |
| **教訓** | 文字列識別子は「名前」「変換点」「否定条件テスト」の3点セットで守る |

#### 3. インポート処理の偽成功ログの誤読

| 項目 | 内容 |
|------|------|
| **課題** | `importSkills` の成功ログに引きずられ、障害点を見誤りやすかった |
| **原因** | 関数単位のログだけ確認し、IPCハンドラの最終戻り値まで追跡しなかった |
| **解決策** | Renderer入力値 → IPC引数 → `getSkillByName()` の照合結果を一連で確認した |
| **教訓** | IPC系は「途中成功ログ」より「最終レスポンス契約」を真実源として扱う |

### 同種課題の簡潔解決手順（4ステップ）

1. 呼び出し元コンポーネントから import 先を逆引きして、修正対象を1ファイルに固定する。
2. IPCで期待する識別子（`name` か `id` か）を先に宣言し、実装境界に変換処理を1箇所だけ置く。
3. 変数名を `skillNames` のように契約準拠へ統一し、曖昧な `skills` 命名を避ける。
4. テストで「期待値（nameが渡る）」と「否定条件（idが渡らない）」を同時に検証する。

---

## UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import インターフェース整合修正

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-SKILL-IMPORT-INTERFACE-001 |
| 目的 | `skill:import` の IPC 契約を Main / Preload / 仕様書で一致させる |
| 完了日 | 2026-02-21 |
| ステータス | **完了** |
| 関連Pitfall | P23, P42, P44, P40 |
| テスト | `skillHandlers.test.ts` 52件PASS |

### 苦戦箇所と解決策

#### 1. Phase 12成果物と仕様書本体ステータスの不一致

| 項目 | 内容 |
|------|------|
| **課題** | `outputs/phase-12/` が揃っていても `phase-12-documentation.md` が「未実施」のまま残った |
| **原因** | 成果物作成を優先し、仕様書本体のステータス同期を後段に回した |
| **解決策** | 成果物監査と同時に、`phase-12-documentation.md` のステータスと完了チェックリストを同期 |
| **教訓** | Phase完了判定は「成果物」と「仕様書本体状態」を同時に満たす必要がある |

#### 2. ワークフロー移動後の旧参照パス残存

| 項目 | 内容 |
|------|------|
| **課題** | `skill-import-agent-system/tasks/00-...` 旧パスが Phase 1/2 に残存 |
| **原因** | タスク指示書を `completed-task/` に移動後、参照一括更新が漏れた |
| **解決策** | `rg` で旧パスを横断検出し、`completed-task/00-ut-fix-skill-import-interface-001.md` に統一 |
| **教訓** | タスク移動時はリンク修正と `verify-all-specs` 再実行を同一ターンで実施する |

#### 3. Vitest実行ディレクトリ差異による偽失敗

| 項目 | 内容 |
|------|------|
| **課題** | ルートからのVitest実行で alias 解決が崩れ、`handler not registered` の偽失敗が発生 |
| **原因** | `apps/desktop` 前提の設定をルート実行で評価したため |
| **解決策** | `apps/desktop` 作業ディレクトリで `pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts` に統一 |
| **教訓** | テストの実行場所は再現性要件。コマンドと実行ディレクトリを必ず記録する |

#### 4. 並列エージェント実行時のコンテキスト分離

| 項目 | 内容 |
|------|------|
| **課題** | 7エージェント並列実行では各エージェントが独立したコンテキストを持つため、Agent 4（コード変更）の結果をAgent 5-7（成果物生成）に自動伝達する仕組みがない |
| **原因** | 並列エージェントはそれぞれ独立したプロンプトで起動されるため、先行エージェントの出力をリアルタイムに参照できない |
| **解決策** | Agent 4（Phase 4-5: テスト+実装）完了後にAgent 5-7を起動し、Agent 4の変更内容（修正ファイルパス、テスト結果、主要な実装差分）をプロンプトに明示的に含める |
| **教訓** | 並列エージェント設計では「コンテキスト伝達の境界」を事前に定義する。全並列投入ではなく、依存関係に基づいた段階的投入が品質を維持する |

#### 5. completed-task配下のファイル移動時ステータス不整合

| 項目 | 内容 |
|------|------|
| **課題** | タスク指示書を `tasks/` から `completed-task/` に `mv` コマンドで移動した際、ファイル内のフロントマター `status` フィールドが `pending` のまま残った |
| **原因** | `mv` コマンドはファイル内容を変更しないため、ディレクトリ構造上は「完了」配下にあるがメタデータは「未完了」という不整合が発生 |
| **解決策** | ファイル移動時にフロントマターの `status` を `completed` に更新する。移動とステータス更新を同一ターンで実施する |
| **教訓** | ファイル配置とメタデータは独立した情報源であるため、両方を同時に更新する必要がある。`mv` 後に `verify-all-specs` でフロントマターの整合性を検証する |

### 同種課題の簡潔解決手順（5ステップ・import版）

1. `git diff` で実装差分と Phase 成果物の対象を先に固定する。
2. Phase仕様書本体のステータス/完了条件を成果物と同時に同期する。
3. `rg` で旧参照パスを横断検出し、移管先へ統一する。
4. テストは対象パッケージディレクトリで `vitest run` を実行し、実行場所を証跡化する。
5. `verify-all-specs` と `verify-unassigned-links` を連続実行し、リンク・整合を最終確認する。

---

## UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove インターフェース整合修正

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-SKILL-REMOVE-INTERFACE-001 |
| 目的 | `skill:remove` の IPC 契約を Main / Service / 仕様書で一貫させる |
| 完了日 | 2026-02-20 |
| ステータス | **完了** |
| 関連Pitfall | P23, P32, P42, P44 |
| テスト | SH-RM-01〜SH-RM-11（11件追加） |

### 苦戦箇所と解決策

#### 1. `skillId` / `skillName` 契約ドリフト

| 項目 | 内容 |
|------|------|
| **課題** | MainハンドラーとService層で同じ文字列引数を扱っているのに、命名が `skillId` / `skillName` で混在し、仕様書ともズレた |
| **原因** | 実装先行で命名統一ルールを適用しきれず、Step 2更新時に契約差分が残った |
| **解決策** | `skill:remove` を `skillName: string` に統一。Mainハンドラーで `.trim()` を含む3段バリデーションを実施し、関連仕様書4件（interfaces/api/security/architecture）を同時更新 |
| **教訓** | 引数名は型と同等の契約。コード修正時に仕様書を1ファイルでも後回しにすると再ドリフトする |

**コード例（Before → After）**:

```typescript
// ❌ Before: 3ファイルで命名が混在
// skillHandlers.ts — skillId を使用
ipcMain.handle(IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
    // args.skillId でアクセス
    return skillService.removeSkill(args.skillId);
  }
);

// SkillService.ts — skillName を使用
async removeSkill(skillName: string): Promise<RemoveResult> {
  return this.importManager.removeSkill(skillName);
}

// SkillImportManager.ts — skillName を使用
async removeSkill(skillName: string): Promise<RemoveResult> { ... }
```

```typescript
// ✅ After: 全3ファイルで skillName に統一 + P42準拠3段バリデーション
// skillHandlers.ts
ipcMain.handle(IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, skillName: string) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    if (typeof skillName !== "string" || skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    return skillService.removeSkill(skillName);
  }
);

// SkillService.ts — 同じ skillName を透過
async removeSkill(skillName: string): Promise<RemoveResult> {
  return this.importManager.removeSkill(skillName);
}

// SkillImportManager.ts — 同じ skillName を使用
async removeSkill(skillName: string): Promise<RemoveResult> {
  log.debug("[SkillImportManager] removeSkill called with:", skillName);
  const removed = this.importedIds.has(skillName);
  // ...
}
```

**同時更新が必要な箇所の一覧**（P23/P32パターン）:

| 更新対象 | ファイル | 変更内容 |
|----------|----------|----------|
| Mainハンドラー | `skillHandlers.ts` | 引数型・バリデーション・命名 |
| Service層 | `SkillService.ts` | メソッドシグネチャの引数名 |
| Import Manager | `SkillImportManager.ts` | メソッドシグネチャの引数名 |
| テスト | `skillHandlers.test.ts` | モック・アサーション全件 |
| 仕様書（interfaces） | `interfaces-agent-sdk-skill.md` | 契約定義 |
| 仕様書（API） | `api-ipc-agent.md` | エンドポイント定義 |
| 仕様書（セキュリティ） | `security-skill-ipc.md` | バリデーションルール |
| 仕様書（アーキテクチャ） | `arch-electron-services.md` | Service契約 |

#### 2. 未タスク配置ディレクトリのドリフト

| 項目 | 内容 |
|------|------|
| **課題** | 未実施タスク指示書が `docs/30-workflows/completed-tasks/unassigned-task/` に残り、`unassigned-task/` 参照と不整合になった |
| **原因** | 既存の移管運用（完了済み未タスクのアーカイブ）と、未実施タスク配置ルールが混在していた |
| **解決策** | 未実施指示書を `docs/30-workflows/unassigned-task/` に補完し、`task-workflow.md` / `api-ipc-agent.md` の参照を統一。`verify-unassigned-links.js` で全件検証 |
| **教訓** | 「未実施」と「完了済み」をディレクトリ境界で分離し、参照修正と物理配置を同じターンで完了させる |

**ディレクトリ構造の正しい配置**:

```
docs/30-workflows/
├── unassigned-task/                    # ✅ 未実施タスク指示書の正しい配置先
│   ├── task-xxx.md
│   └── task-yyy.md
├── completed-tasks/
│   ├── feature-a/                      # 完了タスクのアーカイブ
│   └── feature-b/
└── skill-import-agent-system/
    └── tasks/
        └── completed-task/             # ❌ ここに未実施指示書を置かない
```

**類似パターン**: P3（未タスク管理の3ステップ不完全）、P38（未タスク配置ディレクトリ間違い）

#### 3. Vitest実行コンテキスト差異

| 項目 | 内容 |
|------|------|
| **課題** | ルート実行と `apps/desktop` 実行で Vitest 設定解決が異なり、watch設定由来の失敗が発生した |
| **原因** | モノレポ構成で package 単位の設定（alias / environment）を前提にしたテストをルートから実行した |
| **解決策** | 検証コマンドを `apps/desktop` コンテキストに固定し、`vitest run` で非watch実行に統一 |
| **教訓** | 「どこでコマンドを打つか」も再現性要件。Phase 11/12の証跡には実行ディレクトリを明記する |

**コマンド例（正しい実行方法 / 間違い例）**:

```bash
# ❌ プロジェクトルートから直接実行 → vitest.config.ts が解決されない
cd /path/to/AIWorkflowOrchestrator
pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts

# ❌ watchモード（デフォルト）→ CI/自動実行で停止しない
cd apps/desktop
pnpm vitest src/main/ipc/__tests__/skillHandlers.test.ts

# ✅ 対象パッケージディレクトリから vitest run で実行
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# ✅ pnpm --filter を使用（ディレクトリ移動不要）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# ✅ 特定テストIDのみ実行
cd apps/desktop
pnpm vitest run -t "SH-RM" src/main/ipc/__tests__/skillHandlers.test.ts
```

**類似パターン**: P40（テスト実行ディレクトリ依存）

#### 4. worktree環境でのStep 1-A先送り誤判断

| 項目 | 内容 |
|------|------|
| **課題** | worktreeで作業中という理由で、Phase 12 Task 2 Step 1-A（LOGS/SKILL/関連仕様更新）を「マージ後対応」に先送りし、仕様同期が不完全なまま残った |
| **原因** | 「worktreeではスキル仕様書を更新しない」という誤った運用を採用し、spec-update-workflowの必須条件よりローカル判断を優先した |
| **解決策** | worktreeでもStep 1-Aを通常通り実施。未実施タスク誤配置（`completed-tasks/unassigned-task/`）を是正し、`task-workflow.md` 参照を `unassigned-task/` へ同期。`verify-unassigned-links.js` で機械検証 |
| **教訓** | 「作業場所（worktree）」はStep 1-A省略理由にならない。省略ではなく、同一ブランチで仕様更新まで完結させることが再発防止に直結する |

**実行コマンド（再発防止用）**:

```bash
# 未実施タスクの誤配置を検出（completed配下に未着手/未実施が混在していないか）
rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
  docs/30-workflows/completed-tasks/unassigned-task -g "*.md"

# task-workflow.md の参照整合を検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

#### 5. マルチエージェントPhase実行の依存順序違反

| 項目 | 内容 |
|------|------|
| **課題** | Phase 1-12を5エージェントに分割して全て並列ディスパッチした結果、Phase 4-7エージェントがPhase 1-3エージェントより先に完了した |
| **原因** | 要件定義（Phase 1）→ 設計（Phase 2）→ レビュー（Phase 3）の成果物が、後続Phaseの前提条件として参照されるべきだった |
| **解決策** | Phase依存チェーンを尊重し、ゲートPhase（Phase 3設計レビュー、Phase 10最終レビュー）の前後で並列化区間を分離する。推奨構成: [Phase 1→2→3] → [Phase 4→5→6→7] → [Phase 8→9→10] → [Phase 11] → [Phase 12] |
| **教訓** | エージェントディスパッチ前にPhase依存チェーンを確認し、ゲートPhaseを跨ぐ並列化を禁止する |

#### 6. worktree環境でのPhase 11手動テスト制約

| 項目 | 内容 |
|------|------|
| **課題** | Git worktree環境ではElectronアプリを起動できないため、Phase 11（手動テスト）のUI操作テストが実行不可 |
| **原因** | Phase 11仕様書が「Electronアプリ起動 → DevTools → 操作確認」を前提としている |
| **解決策** | worktree環境では自動テスト（vitest）で代替し、制約を成果物に明記する。Electron起動テストはmainブランチマージ後に実施 |
| **教訓** | Phase 11仕様書にworktree環境用の代替手順を明記する |

#### 7. カバレッジ閾値のスコープ解釈

| 項目 | 内容 |
|------|------|
| **課題** | `skillHandlers.ts` 全体のLine Coverage 45.14%（最低基準80%未満）だが、skill:remove固有のコード（行140-159）は全分岐カバー |
| **原因** | Phase 7（カバレッジ確認）の判定基準が「ファイル全体」か「修正対象ハンドラ」かが仕様書上あいまい |
| **解決策** | バグ修正タスクのカバレッジはファイル全体ではなく修正対象関数の分岐カバー率で判定する。ファイル全体のカバレッジは参考値として記録 |
| **教訓** | Phase 7仕様書に「修正対象関数のBranch Coverage 100%」を必須条件として明記する |

### 同種課題の簡潔解決手順（チェックリスト形式）

IPCインターフェース契約修正を行う場合、以下を順に実行する:

#### Step 1: 契約語彙の横断検出と統一判定

```bash
# 命名の混在を検出
rg -n "skillId|skillName" apps/desktop/src/main/ --type ts
rg -n "skillId|skillName" .claude/skills/aiworkflow-requirements/references/ --type md
```

- [ ] 実装コード内の命名混在を全件リストアップ
- [ ] 仕様書内の命名混在を全件リストアップ
- [ ] 統一先の命名を1つ決定（Preload側に合わせるのが原則）

#### Step 2: 実装と仕様書を同一ターンで更新

- [ ] Mainハンドラー（`skillHandlers.ts`）を更新
- [ ] Service層（`SkillService.ts`）を更新
- [ ] Import Manager / 下位層を更新
- [ ] テストファイル（`skillHandlers.test.ts`）を更新
- [ ] 仕様書 interfaces を更新
- [ ] 仕様書 api を更新
- [ ] 仕様書 security を更新
- [ ] 仕様書 architecture を更新

#### Step 3: 未実施タスク指示書の配置検証

```bash
# 配置先の確認
ls docs/30-workflows/unassigned-task/
# 検証スクリプト実行
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

- [ ] 未実施タスク指示書が `docs/30-workflows/unassigned-task/` にある
- [ ] `task-workflow.md` の参照パスが正しい
- [ ] `verify-unassigned-links.js` が `ALL_LINKS_EXIST` を返す

#### Step 4: テスト実行と結果記録

```bash
# 対象パッケージディレクトリから実行
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

- [ ] 全テストがPASS
- [ ] 実行ディレクトリをPhase成果物に明記
- [ ] `vitest run`（非watchモード）で実行

#### Step 5: 型チェックと最終検証

```bash
pnpm --filter @repo/shared build && pnpm typecheck
```

- [ ] 型チェックPASS
- [ ] `git diff --stat` で変更ファイル数を確認

### 予防策

今後同様の契約ドリフトを防止するための具体的手順:

| 予防策 | 実施タイミング | 具体的なアクション |
|--------|--------------|-------------------|
| **命名規約の事前確認** | Phase 2（設計） | Preload側の既存命名をgrepで確認し、ハンドラ設計に反映 |
| **P23準拠の同時更新** | Phase 5（実装） | ハンドラ・Service・Preload・テストを1コミットで更新 |
| **P42準拠のバリデーション** | Phase 5（実装） | 全文字列引数に `.trim() === ""` チェックを追加 |
| **仕様書の即時更新** | Phase 12（ドキュメント） | 実装完了後、PRマージを待たず仕様書を更新（P26対策） |
| **未タスク3ステップ検証** | Phase 12（ドキュメント） | ①指示書作成 → ②残課題テーブル → ③参照リンク → verify実行 |
| **テスト実行コンテキスト明記** | Phase 11（手動テスト） | 実行ディレクトリとコマンドを証跡に記録 |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| task-workflow.md | 未タスク参照パスを `unassigned-task/` に統一 |
| api-ipc-agent.md | UT-9A-B派生未タスク参照パスを `unassigned-task/` に統一 |
| interfaces-agent-sdk-skill.md | `skill:remove` 契約の完了記録を反映 |
| arch-electron-services.md | Service層の引数契約を `skillName` として明記 |

### 関連パターン相互参照

| パターン | 関連性 | 本タスクでの教訓 |
|----------|--------|-----------------|
| [P23: API二重定義の型管理](../../../rules/06-known-pitfalls.md#p23) | ハンドラ・Service・Preloadの3層同時更新が必要 | 命名の統一も型と同等の「契約」として扱う |
| [P32: 型定義の二箇所同時更新](../../../rules/06-known-pitfalls.md#p32) | 実装ファイル + 仕様書の同時更新パターン | 仕様書4件の同時更新が漏れやすい |
| [P42: .trim()バリデーション漏れ](../../../rules/06-known-pitfalls.md#p42) | 3段バリデーション標準化 | `skillName` にも `.trim()` チェック適用 |
| [P44: skill:import インターフェース不整合](../../../rules/06-known-pitfalls.md#p44) | 同一チャンネル群の姉妹タスク | `skill:import` と `skill:remove` で同じドリフトパターン |
| [P3: 未タスク管理の3ステップ不完全](../../../rules/06-known-pitfalls.md#p3) | 未タスク配置ドリフト | ディレクトリ境界での分離が不十分だった |
| [P40: テスト実行ディレクトリ依存](../../../rules/06-known-pitfalls.md#p40) | Vitest実行コンテキスト | `apps/desktop` からの実行が必須 |

> **統合チェックリスト**: 上記パターンを統合したIPC修正時の品質ゲートは [ipc-contract-checklist.md](./ipc-contract-checklist.md) を参照。

### 関連未タスク

| タスクID | タスク名 | 優先度 | 仕様書 |
|---------|---------|--------|--------|
| ~~UT-FIX-SKILL-VALIDATION-P42-001~~ | ~~skillHandlers P42準拠バリデーション横展開~~ | ~~中~~ | **完了: 2026-02-24（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001で実施）** |
| UT-FIX-SKILL-IPC-ERROR-RESPONSE-001 | skillHandlers IPCバリデーションエラー応答パターン統一 | 中 | [`docs/30-workflows/unassigned-task/task-ipc-skill-error-response-unification.md`](../../../docs/30-workflows/unassigned-task/task-ipc-skill-error-response-unification.md) |
| UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 | Phase 11 Worktree環境手動テスト実行プロトコル策定 | 中 | [`docs/30-workflows/unassigned-task/task-imp-phase11-worktree-testing-protocol-001.md`](../../../docs/30-workflows/unassigned-task/task-imp-phase11-worktree-testing-protocol-001.md) |
| UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 | IPCハンドラ粒度カバレッジ計測インフラ構築 | 中 | [`docs/30-workflows/unassigned-task/task-imp-ipc-handler-coverage-granular-001.md`](../../../docs/30-workflows/unassigned-task/task-imp-ipc-handler-coverage-granular-001.md) |
| UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001 | マルチエージェントPhase依存順序ガード | 中 | [`docs/30-workflows/unassigned-task/task-imp-multiagent-phase-ordering-guard-001.md`](../../../docs/30-workflows/unassigned-task/task-imp-multiagent-phase-ordering-guard-001.md) |

---

## UT-FIX-SKILL-VALIDATION-CONSISTENCY-001: skill:ハンドラP42準拠バリデーション形式統一

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 |
| 目的 | skillHandlers 6ハンドラのバリデーションを P42 準拠（`typeof` + `trim()` + throw形式）に統一 |
| 完了日 | 2026-02-24 |
| ステータス | **完了** |
| 関連Issue | #874 |

### 苦戦箇所と解決策

#### 1. 補完タスクと元未タスクの二重管理

| 項目 | 内容 |
|------|------|
| **課題** | `UT-FIX-SKILL-VALIDATION-P42-001`（元未タスク）と `UT-FIX-SKILL-VALIDATION-CONSISTENCY-001`（補完タスク）が併存し、一部仕様書で「未実施」が残った |
| **原因** | 補完タスク完了時に、残課題テーブル側の元タスク状態を同時更新していなかった |
| **解決策** | `task-workflow.md` / `security-skill-ipc.md` の該当行を完了同期し、補完タスクで実施済みであることを明記 |
| **教訓** | 補完タスクを完了したら、元未タスクを「完了または置換済み」に同時更新しないと重複管理になる |

#### 2. Phase 12成果物と仕様書本体ステータスの同期漏れ

| 項目 | 内容 |
|------|------|
| **課題** | `artifacts.json` は `phase_12_completed` でも、`phase-12-documentation.md` のメタ情報が `pending` のまま残る不整合が発生 |
| **原因** | 成果物生成と仕様書本体更新を別工程で進めたため、最終同期が漏れた |
| **解決策** | Phase 12終了時に `artifacts.json` と `phase-12-documentation.md` のステータスを必ず突合し、差分を同一ターンで修正 |
| **教訓** | 「成果物作成完了」と「仕様書本体の状態更新」は同一完了条件として扱う |

#### 3. 未タスクraw検出に既存TODOが混在

| 項目 | 内容 |
|------|------|
| **課題** | `detect-unassigned-tasks` が既存TODOを検出し、新規未タスクがあるように見える誤読が発生しやすい |
| **原因** | raw件数（候補）と精査後件数（新規起票対象）を分けずに扱うと、今回差分と既存負債が混在する |
| **解決策** | `raw件数` と `精査後件数` を分離記録し、既存管理済みTODOは新規起票対象から除外して判定 |
| **教訓** | 未タスク監査は「全体ベースライン」と「今回対象差分」を必ず分離報告する |

#### 4. 6ハンドラの引数形式の違い（オブジェクト型 vs 直接引数型）

| 項目 | 内容 |
|------|------|
| **課題** | 6ハンドラ中4つがオブジェクト型（`args.skillId`, `args.skillName`）、2つが直接引数型（`executionId: string`）で、共通バリデーション関数の抽出が困難 |
| **原因** | ハンドラ設計時に引数形式の統一規約がなく、skill:abort/get-statusは直接引数型、他はオブジェクト型で設計された |
| **解決策** | 共通関数抽出を断念し、各ハンドラにインラインでP42準拠3段バリデーション（typeof + .trim() === "" + throw）を適用。YAGNI原則に従い、引数形式統一は別タスク（UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001等）に委ねた |
| **教訓** | 引数形式が異なるハンドラ群のバリデーション統一では、「バリデーションパターン」と「引数形式」を分離して考える。パターンのみ統一し、形式統一は別スコープにする |

```typescript
// オブジェクト型（4ハンドラ: skill:import, skill:remove, skill:execute, skill:getDetail）
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" };
}

// 直接引数型（2ハンドラ: skill:abort, skill:get-status）
if (typeof executionId !== "string" || executionId.trim() === "") {
  throw { code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" };
}
```

#### 5. return → throw マイグレーション時のRenderer側影響分析

| 項目 | 内容 |
|------|------|
| **課題** | バリデーションエラーの応答形式を return（各種形式）から throw に変更すると、Renderer側でエラーハンドリングが変わる可能性があった |
| **原因** | 6ハンドラで return false / return null / return { success: false } / throw の4種類の応答形式が混在しており、throw統一の影響範囲が不明確 |
| **解決策** | Preload層の `safeInvoke` 実装を確認し、`ipcRenderer.invoke()` が Main Process の throw を自動的に reject に変換し、safeInvoke がそれをキャッチして `{ success: false, error: message }` 形式で返すことを確認。Renderer側の修正は不要と判断 |
| **教訓** | IPC throw 移行前に Preload 層の safeInvoke/safeInvokeUnwrap の例外処理パスを必ず確認する。Electron の ipcRenderer.invoke() は Main Process の throw を Promise rejection に変換する |

```typescript
// safeInvoke の例外処理（preload/ipc-utils.ts）
export async function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    // Main Process の throw はここでキャッチされる
    return { success: false, error: error.message } as T;
  }
}
```

#### 6. コンテキスト枯渇による3セッション分割

| 項目 | 内容 |
|------|------|
| **課題** | Phase 1-12の全実行に3セッションが必要となり、セッション間でのコンテキスト引き継ぎに苦労した |
| **原因** | Phase 12（ドキュメント更新）が最もコンテキストを消費する。8ファイルの仕様書更新 + topic-map再生成 + IPC契約検証 + documentation-changelog + unassigned-task-report の5タスクを1セッションで完了できなかった |
| **解決策** | セッション引き継ぎ時のサマリーに「残タスクリスト」「完了済みタスクの成果物パス」「次のアクション」を明示的に含める |
| **教訓** | Phase 12は仕様書更新を3ファイル以下/バッチに分割する（P43対策）。特に LOGS.md×2 + SKILL.md×2 の「4ファイル同時更新」はバッチ分割必須 |

### 同種課題の簡潔解決手順（プロセス面4ステップ + 実装面5ステップ）

#### プロセス面（4ステップ）

1. 補完タスク完了時に、元未タスクの状態を `task-workflow.md` とドメイン仕様書で同時更新する
2. `artifacts.json` と `phase-12-documentation.md` のステータスを突合し、差分を即時修正する
3. 未タスク監査は `raw件数` と `精査後件数` を分けて記録し、既存TODOを除外判定する
4. `lessons-learned.md` と `skill-creator/references/patterns.md` に再発防止パターンを同期する

#### 実装面（5ステップ）

1. **引数形式の分類**: `grep -n "ipcMain.handle" skillHandlers.ts` で全ハンドラの引数パターンを分類（オブジェクト型/直接引数型）
2. **Preload層の確認**: `grep -n "safeInvoke\|safeInvokeUnwrap" preload/skill-api.ts` で各ハンドラの呼び出しパターンとエラーハンドリングを確認
3. **P42パターンの適用**: 各ハンドラに `typeof arg !== "string" || arg.trim() === ""` + `throw { code: "VALIDATION_ERROR" }` を適用
4. **テストの作成**: `describe.each` で全ハンドラ × 入力パターン（null/undefined/空文字列/スペースのみ/正常値）のマトリクステストを作成
5. **後方互換性の検証**: 既存テストが全PASS することを確認（`cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers`）

---

## TASK-9A-C: SkillEditor 仕様書再監査（Phase 12準拠）

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-9A-C |
| 目的 | SkillEditor の Phase 12成果物・参照・仕様反映の整合化 |
| 完了日 | 2026-02-19 |
| ステータス | **仕様書作成済み（spec_created）** |

### 苦戦箇所と解決策

#### 1. tasks/completed-task 参照混在

| 項目 | 内容 |
|------|------|
| **課題** | `tasks/` と `tasks/completed-task/` が混在し、タスク参照が一貫しない |
| **原因** | 仕様書更新時に参照先変更が一部ファイルへしか反映されなかった |
| **解決策** | `TASK-9A-C` 参照を `completed-task/` へ統一し、旧参照ファイルを削除 |
| **教訓** | タスク状態変更時は `rg "TASK-ID"` で全参照を横断確認し、一括更新する |

#### 2. phase-09 と phase-9 の表記ゆれ

| 項目 | 内容 |
|------|------|
| **課題** | Phase 9成果物の参照が `phase-09` と `phase-9` で混在 |
| **原因** | 過去テンプレート由来の命名が残存していた |
| **解決策** | 実ディレクトリに合わせて `phase-9` に統一 |
| **教訓** | 監査時に `rg "phase-09"` を定常チェックに入れる |

#### 3. Step 1-B の状態判定の曖昧さ

| 項目 | 内容 |
|------|------|
| **課題** | 実装未着手タスクでも Step 1-B を `completed` と誤判定しやすい |
| **原因** | Step 1-B の説明が「未実装→完了」に偏っていた |
| **解決策** | 本件は `spec_created` を正として記録し、運用ガイドへ判定ルールを追記 |
| **教訓** | 仕様書作成タスクは `completed` ではなく `spec_created` を許容する分岐が必要 |

#### 4. 未タスク参照の実体不足

| 項目 | 内容 |
|------|------|
| **課題** | `task-workflow.md` の未タスクリンクに実体ファイル欠落が1件あった |
| **原因** | 参照登録時の物理ファイル作成が漏れた |
| **解決策** | `docs/30-workflows/unassigned-task/` に指示書を配置し、`verify-unassigned-links.js` で再検証 |
| **教訓** | 未タスク登録は「作成→配置→検証（ALL_LINKS_EXIST）」を同一ターンで完了する |

---

#### 5. 並列エージェント実行時のAPIレートリミット

| 項目 | 内容 |
|------|------|
| **課題** | Phase 1の4タスクを4つのSubAgentで並列実行したところ、3/4のエージェントがAPIレートリミット（"You've hit your limit"）に到達し、完了レポートが不完全になった |
| **原因** | 4エージェント同時実行によりAPIリクエストが集中し、レートリミットに到達。ファイル書き込みは処理最終段階に集中していたため、途中結果が失われるリスクがあった |
| **解決策** | 並列エージェント数を2-3に制限し、重要度の高いタスクを優先実行。ファイル書き込みを処理途中でも行うインクリメンタル設計にする |
| **教訓** | SubAgent並列実行は2-3が安全目安。4以上はレートリミットリスクが高い。重要度順にエージェントを割り当て、中間成果物のファイル書き込みを早期に行う設計が必要 |

**並列エージェント数の安全基準**:

| 並列数 | リスク | 推奨用途 |
|--------|--------|----------|
| 1-2 | 低 | 標準作業、長時間タスク |
| 3 | 中 | 独立性の高い短時間タスク |
| 4以上 | 高 | レートリミットに到達しやすい。回避策（優先実行・段階的起動）が必須 |

**カテゴリ**: エージェント実行・リソース管理

**相互参照**: [TASK-FIX-13-1 苦戦箇所5: 並列エージェント実行時の成果物品質保証](#5-並列エージェント実行時の成果物品質保証)

---

#### 6. スキルスクリプトのパス解決

| 項目 | 内容 |
|------|------|
| **課題** | `node scripts/complete-phase.js` でMODULE_NOT_FOUNDエラーが発生 |
| **原因** | スクリプトはプロジェクトルートの `scripts/` ではなく `.claude/skills/task-specification-creator/scripts/` に配置されているが、相対パスで誤参照した |
| **解決策** | スキル内スクリプトは `.claude/skills/{skill-name}/scripts/` の絶対パスから参照する |
| **教訓** | スキル関連スクリプトの実行時は、プロジェクトルートの `scripts/` と混同しないよう、必ず `.claude/skills/{skill-name}/scripts/` パスを使用する |

```bash
# ❌ プロジェクトルートのscripts/を参照（MODULE_NOT_FOUND）
node scripts/complete-phase.js

# ✅ スキルディレクトリ内のscripts/を参照
node .claude/skills/task-specification-creator/scripts/complete-phase.js
```

**カテゴリ**: ツーリング・環境

---

#### 7. 大規模仕様書のコンテキスト管理

| 項目 | 内容 |
|------|------|
| **課題** | Phase 4（テスト作成）が1005行/43KB、Phase 6（テスト拡充）が1065行/42KBの大規模仕様書になり、1回のエージェント実行で全内容を処理するのが困難だった |
| **原因** | SkillEditorの機能範囲が広く（9コンポーネント、テストデータファクトリ、ユーティリティ関数テスト等）、仕様書が肥大化。エージェントのコンテキストウィンドウを圧迫した |
| **解決策** | 仕様書を複数のサブタスクに分割し、各サブタスク内でコンテキストを限定。Progressive Disclosure原則に従い、必要な部分のみ読み込む設計にした |
| **教訓** | 仕様書は1ファイル800行以下を目安とし、超過する場合はファイル単位（テストデータファクトリ / ユーティリティ関数テスト / コンポーネントテスト）で分割記述する |

**仕様書サイズの目安**:

| サイズ | 処理可能性 | 推奨対応 |
|--------|-----------|----------|
| 500行以下 | 1エージェントで問題なし | 分割不要 |
| 500-800行 | 処理可能だがコンテキスト圧迫 | サブタスク分割推奨 |
| 800行以上 | コンテキスト超過リスク | ファイル単位分割必須 |

**カテゴリ**: 仕様書設計・コンテキスト管理

---

#### 8. 仕様書へのPitfall事前組み込みの有効性

| 項目 | 内容 |
|------|------|
| **課題** | （成功事例）過去の苦戦箇所が実装時に再発するリスクがあった |
| **成果** | `06-known-pitfalls.md` の P31（Zustand無限ループ）、P39（happy-dom userEvent非互換）、P40（テスト実行ディレクトリ依存）を Phase 仕様書に「⚠️ 既知の Pitfall 注意事項」テーブルとして事前記載した |
| **効果** | 実装者が仕様書を読んだ時点で既知の落とし穴を認知でき、テスト環境の設定忘れや非互換APIの使用を防止。SkillEditorの全内部状態を`useState`のみで管理する設計判断もP31対策から導出された |
| **教訓** | 今後の仕様書作成時は、関連するPitfallを仕様書の冒頭に「注意事項テーブル」として必ず記載し、既知の落とし穴を実装前に可視化する |

**Pitfall注意事項テーブルの記載例**:

| Pitfall ID | 概要 | 本タスクでの影響 | 対策 |
|-----------|------|----------------|------|
| P31 | Zustand Store Hooks無限ループ | SkillEditorで合成Hook使用すると無限ループ | 全内部状態を`useState`で管理 |
| P39 | happy-dom userEvent非互換 | テストで`userEvent`使用不可 | `fireEvent`を使用 |
| P40 | テスト実行ディレクトリ依存 | `apps/desktop/`以外から実行するとDOM未定義 | 対象パッケージディレクトリから実行 |

**カテゴリ**: 仕様書品質・知識の再利用

**相互参照**: [06-known-pitfalls.md - P31, P39, P40](../../../rules/06-known-pitfalls.md)

---

## 関連ドキュメント

| ドキュメント | 目的 | パス |
|--------------|------|------|
| architecture-implementation-patterns.md | 実装パターン集（DIパターン等） | [./architecture-implementation-patterns.md](./architecture-implementation-patterns.md) |
| interfaces-agent-sdk-executor.md | SkillExecutor インターフェース仕様 | [./interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md) |
| 06-known-pitfalls.md | 既知の落とし穴と防止策 | [../../../rules/06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) |

---

## TASK-9A-B: スキルファイル操作IPCハンドラー実装

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-9A-B |
| 目的 | SkillFileManager の6操作を IPC 経由で安全に実行できる状態にする |
| 完了日 | 2026-02-19 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| IPCハンドラー追加 | `apps/desktop/src/main/ipc/skillFileHandlers.ts` | `skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup` の6チャンネルを実装 |
| Preload API公開 | `apps/desktop/src/preload/skill-api.ts` | `electronAPI.skill` から file 操作 API を公開 |
| チャンネル定義拡張 | `packages/shared/src/ipc/channels.ts` | 6チャンネルを型安全に追加 |
| セキュリティ検証 | `apps/desktop/src/main/ipc/skillFileHandlers.ts` | `validateIpcSender` + 引数バリデーション + `isKnownSkillFileError` でサニタイズ |

### 苦戦箇所と解決策

#### 1. 仕様書の実装事実ドリフト（テスト件数・エラーメッセージ）

| 項目 | 内容 |
|------|------|
| **課題** | 仕様書の一部にテスト件数（47）やエラーメッセージ表記の旧値が残り、実装（65テスト、実コード文言）と不一致になった |
| **原因** | Phase 12の更新時に「前回レビューのメモ」を再利用し、再実行結果との差分確認を省略した |
| **解決策** | IPCテストを再実行して実測値を基準化し、`api-ipc-agent.md` / `security-electron-ipc.md` / `LOGS.md` を一括修正した |
| **教訓** | 仕様更新は必ず「実行ログと実装コード」を一次情報にし、数値・文言の転記は最後にクロスチェックする |

#### 2. Preload公開先パスの取り違え

| 項目 | 内容 |
|------|------|
| **課題** | 仕様書内に `skill-file-api.ts` という非実在パスが残り、実際の公開先（`skill-api.ts`）と乖離した |
| **原因** | ファイル名変更後の旧参照が複数仕様書に残存し、横断検索をせずに局所更新で完了扱いにした |
| **解決策** | `rg` で誤パスを全件検出し、`interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `security-electron-ipc.md` を同ターンで修正した |
| **教訓** | IPC系の仕様更新は単一ファイルで閉じず、Preload/Shared/Main を束ねた横断検索を必須工程にする |

#### 3. 未タスク検出raw件数の誤読防止

| 項目 | 内容 |
|------|------|
| **課題** | TODO/FIXME の raw 検出4件を新規未タスクと誤認しやすく、不要な指示書作成リスクがあった |
| **原因** | 検出スクリプト出力の「候補」と「確定課題」の区別が不明確になりやすい |
| **解決策** | raw 4件を既存未タスクとの対応で精査し、`task-imp-community-dashboard-handlers-001.md` で管理済みと確認して新規起票0件を明記した |
| **教訓** | 未タスク検出は raw 件数だけで判断せず、既存台帳との突合結果まで記録して完了判定する |

**コード例**:

```bash
# 実装事実ドリフトを防ぐ最小検証セット
pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/skillFileHandlers*.test.ts
rg -n "skill-file-api\\.ts|TASK-9A-B|65テスト|47" .claude/skills/aiworkflow-requirements/references/
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

#### 4. handlerMap ESMモックパターン

| 項目 | 内容 |
|------|------|
| **課題** | Vitest + ESM環境で `require("electron")` が使用不可。ipcMain.handle() で登録されたハンドラー関数をテスト側から直接呼び出す方法が必要だった |
| **原因** | Electron の ESM サポートが不完全で、CommonJS スタイルの `require` を使ったモジュール取得ができない |
| **解決策** | `vi.mock("electron")` で ipcMain.handle をモック化し、`Map<string, Function>` (handlerMap) にハンドラーを格納。テスト側から `handlerMap.get(channelName)!(event, args)` で直接呼び出す方式を採用 |
| **教訓** | Electron IPC テストでは、ランタイム依存を排除した handlerMap キャプチャ方式が最も安定する。TASK-8C-A で確立されたパターンを TASK-9A-B でも踏襲できた |

**コード例**:

```typescript
const handlerMap = new Map<string, Function>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: { fromWebContents: vi.fn() },
}));

// テスト内でハンドラー直接呼び出し
const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
const result = await handler!(mockEvent, { skillName: "test", relativePath: "SKILL.md" });
```

#### 5. v8カバレッジの関数定義行カウント問題

| 項目 | 内容 |
|------|------|
| **課題** | Function Coverage が 44.44% に急落。コールバック内のインライン arrow function `() => [mainWindow]` が v8 カバレッジプロバイダにより独立した関数としてカウントされた |
| **原因** | Vitest の v8 カバレッジプロバイダは V8 エンジンのネイティブカバレッジを使用するため、ソースコード上のアロー関数（`getAllowedWindows: () => [mainWindow]`）を個別関数としてカウントする |
| **解決策** | セキュリティテスト S-03 で `getAllowedWindows()` コールバックの戻り値を明示的に検証するテストを追加し、各ハンドラー内のインライン arrow function が実行されるようにした |
| **教訓** | v8 カバレッジでは、validateIpcSender のオプション内 arrow function も関数カウント対象。Function Coverage 低下時は、未実行のインライン関数を grep で特定し、テストで明示的に呼び出す |

**コード例**:

```typescript
// S-03: getAllowedWindows コールバックの実行を確認
for (let i = 0; i < 6; i++) {
  const options = mockValidateIpcSender.mock.calls[i][2];
  expect(options.getAllowedWindows()).toEqual([mainWindow]);
}
```

#### 6. .trim()境界値バリデーション漏れ

| 項目 | 内容 |
|------|------|
| **課題** | Phase 4（テスト作成）で `typeof args?.skillName !== "string"` の型チェックのみ設計したが、Phase 6（テスト拡充）でスペースのみ入力 `"   "` がバリデーションを通過する問題を発見 |
| **原因** | 初期設計で空文字列チェック `=== ""` を入れたが、空白のみの文字列（`"   "`）は空文字列ではないため通過。SkillFileManager側でパスエラーとなる前に IPC 層で拒否すべきだった |
| **解決策** | `args.skillName.trim() === ""` を全6ハンドラーの引数バリデーションに追加。backupPath にも同様の `.trim()` チェックを適用 |
| **教訓** | 文字列バリデーションでは `typeof` + `=== ""` だけでなく `.trim() === ""` の3段チェックを標準化すべき。境界値テスト（B-01, B-02）の追加により発見できた |

**コード例**:

```typescript
// ❌ 不十分 — スペースのみの入力を見逃す
if (typeof args?.skillName !== "string" || args.skillName === "") { ... }

// ✅ 完全 — .trim() でホワイトスペースのみも検出
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") { ... }
```

#### 7. isKnownSkillFileError型ガードによるエラーサニタイズ設計

| 項目 | 内容 |
|------|------|
| **課題** | 5種類のカスタムエラー（SkillNotFoundError, ReadonlySkillError, PathTraversalError, FileExistsError, FileNotFoundError）の判別を各ハンドラーで個別に行うと、DRY 違反とエラー種別追加時の変更漏れリスクがあった |
| **原因** | 初期設計で catch ブロック内に直接 instanceof チェーンを記述するプランだったが、6ハンドラー × 5エラー種別 = 30箇所の重複が発生 |
| **解決策** | `isKnownSkillFileError(error): error is A | B | C | D | E` 型ガード関数を共通化。既知エラーは `error.message` をそのまま返し、未知エラーは `"Internal error"` で内部情報を遮断する2分岐に集約 |
| **教訓** | TypeScript の type guard + union type は、エラーサニタイズの DRY 化に最適。新しいエラークラス追加時も型ガード関数1箇所の修正で済む |

**コード例**:

```typescript
function isKnownSkillFileError(
  error: unknown,
): error is SkillNotFoundError | ReadonlySkillError | PathTraversalError | FileExistsError | FileNotFoundError {
  return (
    error instanceof SkillNotFoundError ||
    error instanceof ReadonlySkillError ||
    error instanceof PathTraversalError ||
    error instanceof FileExistsError ||
    error instanceof FileNotFoundError
  );
}

// 各ハンドラーの catch ブロック（DRY）
catch (error) {
  if (isKnownSkillFileError(error)) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Internal error" };
}
```

### 参照

- `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/unassigned-task-report.md`
- `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-11/auto-test-result.md`

### 成果物

| 成果物 | パス |
|--------|------|
| ワークフロー一式 | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/` |
| 完了タスク記録 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` |
| IPC仕様更新 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` |
| セキュリティ仕様更新 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |

---

## TASK-FIX-10-1: Vitest未処理Promise拒否検知の復元

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 目的 | `dangerouslyIgnoreUnhandledErrors` を廃止し、未処理Promise拒否をテスト失敗として検知できる状態に戻す |
| 完了日 | 2026-02-19 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. Step 2要否判定の誤り

| 項目 | 内容 |
|------|------|
| **課題** | 「設定削除のみ」と見なしてシステム仕様更新不要と誤判定しやすかった |
| **原因** | インターフェース変更の有無だけで判断し、テスト戦略変更を仕様変更として扱っていなかった |
| **解決策** | 未処理Promise拒否の検知ルール変更を「品質仕様の変更」と定義し、`quality-requirements.md` を更新 |
| **教訓** | プロダクトコード変更がなくても、テスト戦略変更は Step 2 更新対象になる |

#### 2. 未タスク検出範囲の不足

| 項目 | 内容 |
|------|------|
| **課題** | 変更ファイル中心の確認では、Phase成果物に書かれた将来課題を見落としやすい |
| **原因** | Task 4で `outputs/phase-*` まで横断確認する運用が徹底されていなかった |
| **解決策** | Phase成果物まで含めて再監査し、`task-imp-vitest-alias-sync-automation-001` を未タスク登録 |
| **教訓** | 未タスク検出は「コード差分 + 成果物記述」の両輪で実施する |

#### 3. alias運用の継続性不足

| 項目 | 内容 |
|------|------|
| **課題** | `@repo/shared` alias は手動追従で、export更新時に再発リスクが残る |
| **原因** | alias整合の機械検証がなく、発覚がテスト実行時に後ろ倒しになる |
| **解決策** | 未タスク `task-imp-vitest-alias-sync-automation-001` を起票し、CIで差分検知する方針を定義 |
| **教訓** | 設定修正完了時点で「再発防止の自動検証」まで分離タスク化して残す |

### 同種課題の簡潔解決手順（5ステップ）

1. `dangerouslyIgnoreUnhandledErrors` を未設定に戻し、対象テストを最小実行して失敗原因を観測する。
2. 失敗が未処理Promise拒否であることを確認し、設定で隠蔽せずテスト/実装側を修正する。
3. `@repo/shared` の解決エラーが出る場合は、具体サブパスを先にしたalias順序で補正する。
4. Phase 12では `task-workflow.md` と `quality-requirements.md` を同時更新し、苦戦箇所を記録する。
5. 将来再発要因は未タスク化し、`verify-unassigned-links.js` で参照整合を確認する。

### 関連仕様書

| 仕様書 | 反映内容 |
|------|------|
| task-workflow.md | 完了タスク・苦戦箇所・未タスク登録 |
| quality-requirements.md | 未処理Promise拒否検知ルール、alias管理ルール |
| lessons-learned.md（本書） | 同種課題向けの再利用手順 |

---

## TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` モジュール解決エラー修正

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 目的 | `@repo/shared` サブパス解決を TypeScript / Vitest で一貫させる |
| 完了日 | 2026-02-20 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. exports/paths/alias 三層整合の同期漏れ

| 項目 | 内容 |
|------|------|
| **課題** | `package.json exports` だけ更新しても `tsc`/`vitest` の解決が一致しない |
| **原因** | 正本と実行系設定が分離しており、手動同期漏れが起きやすい |
| **解決策** | `exports`/`paths`/`alias` を同一変更で更新し、3テストで整合を固定化 |
| **教訓** | サブパス追加は「3層同時更新 + テスト更新」を1セットで扱う |

**三層設定の対応例**（`@repo/shared/types/rag` を追加する場合）:

```jsonc
// 1. package.json exports（正本）
"./types/rag": {
  "types": "./dist/src/types/rag/index.d.ts",
  "import": "./dist/src/types/rag/index.js"
}

// 2. tsconfig.json paths（tsc 解決用）
"@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"]

// 3. vitest.config.ts alias（テスト実行用）
"@repo/shared/types/rag": resolve(__dirname, "../../packages/shared/src/types/rag/index.ts")
```

**注意**: `exports` は `dist/` 配下を指すが、`paths` と `alias` は **ソースファイル直接参照**（`src/`）を指す。この「参照先の二重性」が同期漏れの原因となる。

#### 2. source直接参照時の補助型宣言取り込み漏れ

| 項目 | 内容 |
|------|------|
| **課題** | `apps/desktop` から shared ソースを直接参照すると、一部型宣言が欠落する |
| **原因** | shared 側補助宣言ファイルが `tsconfig` の `include` 対象外だった |
| **解決策** | `apps/desktop/tsconfig.json` `include` に `@anthropic-ai-claude-agent-sdk.d.ts` を追加 |
| **教訓** | workspace source 直参照時は、コードだけでなく補助宣言ファイルの取り込み確認が必要 |

```jsonc
// ❌ Before: 補助型宣言が include 対象外
// apps/desktop/tsconfig.json
{
  "include": ["src/**/*"]
}
// → shared 内の @anthropic-ai-claude-agent-sdk.d.ts が認識されず TS2307

// ✅ After: 補助型宣言を明示的に include
{
  "include": [
    "src/**/*",
    "../../packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts"
  ]
}
```

#### 3. 未タスクリンク整合の既存崩れ

| 項目 | 内容 |
|------|------|
| **課題** | 本タスクの検証中に、既存未タスク参照4件のリンク切れが発覚 |
| **原因** | `task-workflow.md` 登録済みタスクの指示書ファイルが未作成のまま残存 |
| **解決策** | 欠落4ファイルを `unassigned-task/` に作成し、`verify-unassigned-links.js` を再実行 |
| **教訓** | 新規未タスク登録時は、自タスク分だけでなく既存台帳全体のリンク健全性も確認する |

```bash
# リンク切れ検証コマンド
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 手動で未タスク参照を一括確認する場合
grep -rn "unassigned-task/" docs/30-workflows/ .claude/skills/ | \
  sed 's/.*(\(.*\)).*/\1/' | sort -u | \
  while read f; do [ ! -f "$f" ] && echo "MISSING: $f"; done
```

#### 4. TypeScript paths 定義順序の重要性

| 項目 | 内容 |
|------|------|
| **課題** | `@repo/shared/types` が `@repo/shared/types/llm/schemas` より先に定義されると、後者のパスが解決されない |
| **原因** | TypeScript は paths マッピングを上から順に評価し、最初にマッチしたパスを使用する。`@repo/shared/types` が先にマッチすると、`@repo/shared/types/llm/schemas` は評価されない |
| **解決策** | paths 定義順序を「具体的（長いパス）→ 汎用的（短いパス）」に並べる。vitest alias も同じ順序で定義する |
| **教訓** | TypeScript paths のマッチングは「最長一致」ではなく「先行一致」。定義順序がパス解決の正否を直接決定する |

```jsonc
// ❌ 誤った順序: 汎用パスが先にマッチし、具体パスが無効化
{
  "paths": {
    "@repo/shared/types": ["../../packages/shared/src/types/index.ts"],
    "@repo/shared/types/llm/schemas": ["../../packages/shared/src/types/llm/schemas/index.ts"],
    "@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"]
  }
}
// → "@repo/shared/types/llm/schemas" は "@repo/shared/types" にマッチして解決失敗

// ✅ 正しい順序: 具体パスを先に定義
{
  "paths": {
    "@repo/shared/types/llm/schemas": ["../../packages/shared/src/types/llm/schemas/index.ts"],
    "@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"],
    "@repo/shared/types": ["../../packages/shared/src/types/index.ts"]
  }
}
```

#### 5. 4ファイル同期の必要性（package.json / tsconfig / vitest.config / typesVersions）

| 項目 | 内容 |
|------|------|
| **課題** | `package.json exports` のみ更新しても、tsc と vitest が異なるパスに解決し整合しない |
| **原因** | モノレポの「ソース直接参照」方式では、正本（exports）と実行系設定（paths, alias, typesVersions）が完全に分離している |
| **解決策** | サブパス追加時は以下4ファイルを同一コミットで更新する |
| **教訓** | 設定変更の影響範囲を事前にチェックリストで固定化し、1ファイルでも漏れたらテストが落ちる構造にする |

**4ファイル同期チェックリスト**:

| # | ファイル | 更新内容 | 用途 |
|---|---------|---------|------|
| 1 | `packages/shared/package.json` exports | サブパスと `dist/` 参照先を追加 | ランタイム（Node.js解決） |
| 2 | `apps/desktop/tsconfig.json` paths | サブパスとソース直参照先を追加 | tsc 型チェック |
| 3 | `apps/desktop/vitest.config.ts` alias | サブパスとソース直参照先を追加（具体→汎用順） | Vitest テスト実行 |
| 4 | `packages/shared/package.json` typesVersions | `*` 条件で型解決パスを追加 | 型解決フォールバック |

### 同種課題の簡潔解決手順（5ステップ）

1. **エラー分析**: `pnpm typecheck 2>&1 | grep "TS2307" | sort -u` でモジュール未検出パスを特定する
2. **exports 確認**: `package.json` の `exports` エントリと実ファイルパスの 1:1 対応を確認する
3. **paths 追加**: `tsconfig.json` に paths マッピングを追加する（具体的→汎用の順序で定義）
4. **alias 同期**: `vitest.config.ts` の `resolve.alias` に同じエントリを追加する（同じく具体→汎用順）
5. **テスト実行**: `pnpm typecheck && cd apps/desktop && pnpm vitest run src/__tests__/*module-resolution*` で整合性を検証する

---

## TASK-FIX-14-1: console → electron-log 移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 目的 | Skill系Main Processのログ出力を `console.*` から `electron-log` に統一 |
| 完了日 | 2026-02-14 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. 実変更ファイル名との乖離

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12成果物（implementation-guide/final-review）に、実装対象と異なるファイル名が混入 |
| **原因** | 文書更新時に `git diff` ではなく過去メモを基準に記述したため |
| **解決策** | `git diff --name-only` と実ファイル参照を正として、成果物内の対象ファイル名を全件修正 |
| **教訓** | Phase 12の技術文書は「実装事実（差分）」を一次情報として記述し、推測ベース記述を禁止する |

#### 2. Phase 12 Step 1-A/1-C/1-D の先送り誤判定

| 項目 | 内容 |
|------|------|
| **課題** | `documentation-changelog.md` に Step 1-A/1-C/1-D が「PR時対応」相当で記録され、完了条件と不整合 |
| **原因** | Step 1（必須）とPhase 13（PR作成）の責務境界が曖昧だった |
| **解決策** | Step 1-A/1-C/1-Dを同ターン内で完了させ、`LOGS.md x2`・`SKILL.md x2`・`generate-index.js` 実行結果を反映 |
| **教訓** | Phase 12では「後続Phaseで対応予定」という記述を許容せず、必須ステップは即時完了で記録する |

#### 3. 未タスク検出後の登録漏れ

| 項目 | 内容 |
|------|------|
| **課題** | `SkillExecutor.ts` 残存 `console` を検出後、検出レポートのみで完了扱いになりやすかった |
| **原因** | 「検出」と「未タスク登録（指示書 + 仕様書テーブル更新）」の工程が分離されていた |
| **解決策** | 3ステップを同一ターンで実施（指示書作成 → `task-workflow.md` 登録 → 関連仕様書残課題更新） |
| **教訓** | 未タスク検出はレポート作成で終わらせず、追跡可能な台帳登録まで完了して初めてPhase 12完了とする |

#### 4. 大量テストファイルへのモック一括追加

| 項目 | 内容 |
|------|------|
| **課題** | 本番コード4ファイルの electron-log 移行に伴い、関連テスト9ファイルに `vi.mock("electron-log")` を追加する必要があった |
| **原因** | electron-log はデフォルトで stdout に出力するため、モック未定義のテストではログがテスト出力に混入する（P20パターン） |
| **解決策** | `grep -rn "from.*SkillImportManager\|PermissionStore\|SkillScanner\|SkillAnalyzer" __tests__/` で影響テストを特定し、バックグラウンドエージェントで9ファイルに一括追加 |
| **教訓** | ログライブラリ移行では、本番コード修正量よりテストモック追加の影響範囲の方が大きい。事前に影響テストファイル数を見積もり、並列エージェントで効率化すべき |

```typescript
// 標準モックパターン（全9ファイルに統一適用）
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
```

#### 5. debug プロパティの後方互換性判断

| 項目 | 内容 |
|------|------|
| **課題** | `SkillImportManager.ts` の `this.debug` プロパティは移行後に読み取られなくなったが、5テストファイル25箇所で参照されていた |
| **原因** | `if (this.debug) console.log(...)` が `log.debug(...)` に置換されたことで、`this.debug` の読み取り箇所が消滅 |
| **解決策** | 後方互換性を優先し、`this.debug` プロパティは設定のみ残して維持。テスト側の `{ debug: true }` オプション渡しは既存のまま |
| **教訓** | 「未使用プロパティの即時削除」vs「テスト影響の最小化」のトレードオフでは、テスト変更量が25箇所を超える場合は後方互換維持が合理的。後続タスク（TASK-FIX-14-2完了後）で段階的に削除を検討 |

#### 6. カバレッジ計測コマンドの引数誤り

| 項目 | 内容 |
|------|------|
| **課題** | `vitest run --coverage src/main/services/skill/SkillScanner.ts` でカバレッジが 0% と表示された |
| **原因** | vitest の引数にはテストファイルパスを指定すべきだが、ソースファイルパスを指定していた |
| **解決策** | `vitest run --coverage src/main/services/skill/` のようにテストファイルが含まれるディレクトリを指定し、出力から対象ソースファイルを grep で抽出 |
| **教訓** | vitest のカバレッジ計測では引数がテストファイルのフィルタとして機能する。ソースファイル単位のカバレッジが必要な場合は、テストディレクトリを指定して出力をフィルタリングする |

```bash
# ❌ カバレッジ0%になる（ソースファイルパスを引数に指定）
vitest run --coverage src/main/services/skill/SkillScanner.ts

# ✅ 正しい方法（テストディレクトリを指定してgrepで抽出）
vitest run --coverage src/main/services/skill/ 2>&1 | grep "SkillScanner"
```

#### 7. 条件ガード削除による予想外の簡素化効果

| 項目 | 内容 |
|------|------|
| **課題** | 当初は `console.log` → `log.debug` の単純置換のみと想定していた |
| **発見** | `if (this.debug)` ガード（3箇所）と `process.env.NODE_ENV !== "test"` ガード（2箇所）が同時に削除可能だった |
| **効果** | 条件分岐の削除によりコードの循環的複雑度が低下し、SkillImportManager.ts のコード行数が約10%削減 |
| **教訓** | ログライブラリ移行は単なるAPI置換ではなく、環境判定ロジックの簡素化という副次効果がある。移行計画時にこの効果を見積もることで、リファクタリングの価値を正当化できる |

### 関連未タスク

| タスクID | タスク名 | 優先度 | 仕様書 |
|---------|---------|--------|--------|
| TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION | SkillExecutor の console ログを electron-log に移行 | 低 | [`docs/30-workflows/unassigned-task/task-fix-14-2-skillexecutor-console-log-migration.md`](../../../docs/30-workflows/unassigned-task/task-fix-14-2-skillexecutor-console-log-migration.md) |

---

## TASK-FIX-11-1: SDK統合テスト有効化

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |
| 目的 | TODOプレースホルダ17件を実テスト化し、SDK統合後の検証を有効化 |
| 完了日 | 2026-02-13 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. Phase 12 Step 1-A/1-D の「該当なし」誤判定

| 項目 | 内容 |
|------|------|
| **課題** | 「テストコードのみ変更」を理由に LOGS/SKILL 更新と index 再生成を初回で省略 |
| **原因** | Step 1-A（必須）と Step 2（条件付き）の区別を混同 |
| **解決策** | Step 1-A〜1-Dを必須チェックとして再実行し、`LOGS.md x2`・`SKILL.md x2`・`generate-index.js` 実行を固定化 |
| **教訓** | 検証系・テスト系タスクでも Step 1-A/1-D は常に必須 |

#### 2. 未タスク検出の raw 結果をそのまま採用

| 項目 | 内容 |
|------|------|
| **課題** | `detect-unassigned-tasks.js` で 51件検出されたが、多くが仕様書本文中の説明用 TODO だった |
| **原因** | 実装ディレクトリとドキュメントディレクトリを同一ルールで評価 |
| **解決策** | 2段階判定を採用（1: 実装ディレクトリ優先スキャン、2: raw検出の手動精査） |
| **教訓** | raw件数は候補であり、未タスク確定件数とは分離して記録する |

#### 3. Vitest モック初期化の挙動差異

| 項目 | 内容 |
|------|------|
| **課題** | 一部テストで `vi.clearAllMocks()` 後も前テストのモック実装が残存 |
| **原因** | `clearAllMocks` は call history を消すのみで実装は保持される |
| **解決策** | `beforeEach` で `mockResolvedValue` を毎回再設定し、失敗系は `mockRejectedValueOnce` を使用 |
| **教訓** | 「履歴クリア」と「実装リセット」は別操作として扱う |

**Vitest モックリセット API 比較**:

| API | 呼び出し履歴 | mockImplementation | mockReturnValue | mockResolvedValue |
|-----|:---:|:---:|:---:|:---:|
| `vi.clearAllMocks()` | クリア | 保持 | 保持 | 保持 |
| `vi.resetAllMocks()` | クリア | リセット | リセット | リセット |
| `vi.restoreAllMocks()` | クリア | 元に戻す | 元に戻す | 元に戻す |

**SDK テスト有効化で発生した具体例**:

```typescript
// ❌ 問題パターン: mockRejectedValue が後続テストに漏洩
describe("エラーハンドリング", () => {
  it("SDK障害をハンドリングする", async () => {
    mockAgentAPI.query.mockRejectedValue(new Error("SDK call failed"));
    // テスト実行...
  });
  // ↑ mockRejectedValue は "永続的" なため、次のテストにも影響する

  it("正常系テスト", async () => {
    // ← mockRejectedValue が残存し、このテストも失敗する
  });
});

// ✅ 解決パターン: "Once" サフィックスで1回限りのモック
describe("エラーハンドリング", () => {
  it("SDK障害をハンドリングする", async () => {
    mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"));
    // テスト実行...
  });
  // ↑ "Once" なので消費後に元の実装に戻る

  it("正常系テスト", async () => {
    // ← 前テストの影響を受けない
  });
});
```

#### 3b. モジュールレベルモックによるタイムアウトテスト不可問題

| 項目 | 内容 |
|------|------|
| **課題** | `vi.mock("../agent-client")` でモジュール全体をモック化すると、内部の `setTimeout` + `AbortController` によるタイムアウトロジックが消失し、`vi.advanceTimersByTimeAsync(30000)` でタイムアウトを再現できない |
| **原因** | `vi.mock()` はモジュール内の全エクスポートをモック関数に置換するため、元の実装内部のタイマーロジックは実行されない |
| **解決策** | タイムアウトを内部ロジックで再現するのではなく、`mockRejectedValueOnce(new Error("Request timeout"))` で直接エラーを注入する |
| **教訓** | モジュールレベルモックでは「内部実装の再現」ではなく「外部インターフェースでのシミュレーション」が正しいアプローチ |

**コード例**:

```typescript
// ❌ 失敗パターン: モジュールモック下でタイマーを進めてもタイムアウトしない
vi.useFakeTimers();
const queryPromise = skillExecutor.execute(request, metadata);
await vi.advanceTimersByTimeAsync(30000);
// → モジュール内のsetTimeoutが存在しないため、何も起きない

// ✅ 成功パターン: エラーを直接注入
mockAgentAPI.query.mockImplementation(
  () => new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), 30000);
  })
);
vi.useFakeTimers();
const queryPromise = skillExecutor.execute(request, metadata);
await vi.advanceTimersByTimeAsync(30000);
// → モック内のsetTimeoutがfake timerで制御され、タイムアウトエラーが発生
```

#### 3c. beforeEach での明示的モック再設定パターン

| 項目 | 内容 |
|------|------|
| **課題** | `vi.clearAllMocks()` だけでは `mockImplementation()` で設定した「応答しない Promise」が残り続け、後続の正常系テストが全て失敗する |
| **原因** | `clearAllMocks` は呼び出し回数（`.mock.calls`）をリセットするのみで、`mockImplementation()` の関数置換はリセットしない |
| **解決策** | `beforeEach` で `mockAgentAPI.query.mockResolvedValue(...)` を毎回呼び出し、「デフォルト正常応答」を明示的に再設定する |
| **教訓** | テスト基盤の `beforeEach` は「呼び出し履歴クリア」と「デフォルト応答再設定」の2段構えで設計する |

**推奨パターン**:

```typescript
beforeEach(() => {
  // 段階1: 呼び出し履歴をクリア
  vi.clearAllMocks();

  // 段階2: デフォルト応答を明示的に再設定
  mockAgentAPI.query.mockResolvedValue({
    response: "default mock response",
    tokenUsage: { input: 100, output: 50 },
  });

  // 段階3: 他のモックのデフォルトも設定
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "response" }],
  });
});
```

### 関連未タスク

| タスクID | タスク名 | 優先度 | 仕様書 |
|---------|---------|--------|--------|
| task-imp-vitest-mock-reset-utility-001 | Vitest モック2段階リセットユーティリティ共通化 | 中 | [`docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md`](../../../docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md) |
| task-ref-vitest-module-mock-audit-001 | Vitest モジュールレベルモック監査・使い分けガイドライン策定 | 低 | [`docs/30-workflows/unassigned-task/task-ref-vitest-module-mock-audit-001.md`](../../../docs/30-workflows/unassigned-task/task-ref-vitest-module-mock-audit-001.md) |

---

## TASK-FIX-13-1: deprecatedプロパティ正式移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION |
| 目的 | `Anchor.name` / `Skill.lastUpdated` のdeprecated定義を正式撤去し、参照を移行 |
| 完了日 | 2026-02-13 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. 削除対象の境界判定

| 項目 | 内容 |
|------|------|
| **課題** | `lastUpdated` が複数型に存在し、全削除すると永続化互換を壊す可能性があった |
| **解決策** | `Skill.lastUpdated` のみ削除し、`SkillImportConfig.lastUpdated` は据え置き |
| **教訓** | deprecated除去時は「公開型」「永続化型」を先に分離して判定する |

#### 2. 汎用プロパティ参照の誤検出回避

| 項目 | 内容 |
|------|------|
| **課題** | `name` は汎用キーのため単純置換で誤修正リスクが高かった |
| **解決策** | `Anchor` 型スコープで参照箇所を限定し、`anchor.source` へ段階移行 |
| **教訓** | 文字列置換ではなく「型スコープ + 参照ファイル限定」で移行する |

#### 3. Phase-12仕様同期漏れの防止

| 項目 | 内容 |
|------|------|
| **課題** | コード修正完了時点で仕様書更新・教訓記録が漏れやすい |
| **解決策** | `interfaces-agent-sdk-skill.md` / `task-workflow.md` / 本書を同一ターンで更新 |
| **教訓** | Phase 12では「コード + 仕様 + 教訓」を1セットで完了判定する |

#### 4. ドキュメント偏重による実装検証の省略

| 項目 | 内容 |
|------|------|
| **課題** | Phase 1-12の成果物ドキュメントを並列エージェントで大量生成したが、実際のコード変更が完了しているかの検証（grep調査・テスト実行・型チェック）が不十分だった。ドキュメント作成が「実装完了」と誤認されるリスクがあった |
| **解決策** | 再検証セッションで3つの調査エージェントを並列起動し、Anchor型・Skill型の全参照箇所を網羅的にgrepした結果、実装自体は完了済みであることを確認。テスト（8/8 PASS）、TypeScript型チェック（エラー0件）、ESLint（エラー0件）で証明 |
| **教訓** | **ドキュメント生成とコード検証は分離すべき**。並列エージェントでドキュメントを生成する場合でも、必ず先に「コードの実装完了」を品質ゲート（テスト・型チェック・grep）で確認してからドキュメント作成に移行する |

#### 5. 並列エージェント実行時の成果物品質保証

| 項目 | 内容 |
|------|------|
| **課題** | 5つのバックグラウンドエージェントで Phase 1-11 のドキュメントを同時生成したが、各エージェントの出力品質を個別に検証する手段が不足していた |
| **解決策** | 全エージェント完了後に outputs/ 配下の12ファイル存在確認、ファイルサイズ確認、内容の一貫性チェックを実施 |
| **教訓** | 並列エージェント実行後は「全成果物の一覧確認」と「内容の整合性チェック」を必ず実施する。特にPhase間の依存関係がある場合、先行Phaseの結果を後続Phaseが正しく参照しているか確認が必要 |

---

## TASK-FIX-7-1: SkillService executeSkill 委譲実装

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 目的 | SkillService.executeSkill() が SkillExecutor に委譲するよう変更 |
| 完了日 | 2026-02-11 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| executeSkill() 委譲実装 | `SkillService.ts` | 内部で skillExecutor.execute() を呼び出し |
| setSkillExecutor() 追加 | `SkillService.ts` | Setter Injection パターンで SkillExecutor を注入 |
| DI 設定 | `skillHandlers.ts` | SkillExecutor を生成して SkillService に注入 |

### 苦戦箇所と解決策

#### 1. Setter Injection vs Constructor Injection の選択

| 項目 | 内容 |
|------|------|
| **課題** | SkillService のコンストラクタ時点では SkillExecutor を生成できない |
| **原因** | SkillExecutor は BrowserWindow を必要とし、アプリ起動後でないと生成不可 |
| **検討した選択肢** | Constructor Injection / Setter Injection / Factory Pattern |
| **採用した解決策** | Setter Injection パターン |
| **選択理由** | 遅延初期化が必要な依存オブジェクトに適切、テスタビリティも確保可能 |

**DIパターン使い分け基準**:

| パターン | 適用場面 | 例 |
|----------|----------|-----|
| Constructor Injection | 依存オブジェクトが生成時点で利用可能 | DB接続、設定オブジェクト |
| Setter Injection | 依存オブジェクトの生成に外部リソースが必要 | BrowserWindow、IPC ハンドラー |
| Factory Pattern | 依存オブジェクトを動的に生成する必要がある | プラグインシステム |

**コード例（Setter Injection パターン）**:

```typescript
// SkillService.ts
class SkillService {
  private skillExecutor: SkillExecutor | null = null;

  // Setter Injection: 遅延初期化用
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }

  async executeSkill(
    skillId: string,
    params?: {
      prompt?: string;
      timeout?: number;
      sessionId?: string;
      retryConfig?: SkillExecutionRequest['retryConfig'];
    },
  ): Promise<SkillExecutionResponse> {
    if (!this.skillExecutor) {
      throw new Error('SkillExecutor が初期化されていません');
    }
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error('スキルが見つかりません');
    }
    // SkillExecutionRequest を構築
    const request: SkillExecutionRequest = {
      prompt: params?.prompt ?? '',
      skillId,
      timeout: params?.timeout,
      sessionId: params?.sessionId,
      retryConfig: params?.retryConfig,
    };
    // Skill → SkillMetadata のインライン変換
    const metadata: SkillMetadata = {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      path: skill.path,
      triggers: skill.triggers,
      anchors: skill.anchors,
      allowedTools: skill.allowedTools,
      category: skill.category,
    };
    return this.skillExecutor.execute(request, metadata);
  }
}

// skillHandlers.ts（DI設定）
function registerSkillHandlers(mainWindow: BrowserWindow, skillService: SkillService): void {
  const skillExecutor = new SkillExecutor(mainWindow);
  skillService.setSkillExecutor(skillExecutor);
  // ハンドラー登録...
}
```

**参照**: [architecture-implementation-patterns.md - Setter Injection](./architecture-implementation-patterns.md)

---

#### 2. テストモックの大規模修正

| 項目 | 内容 |
|------|------|
| **課題** | 既存の5つのテストファイルに mockSkillExecutor を追加する必要があった |
| **影響範囲** | skillHandlers.test.ts, skillHandlers.execute.test.ts, skillHandlers.delegate.test.ts, skillIpc.integration.test.ts, SkillService.delegate.test.ts |
| **解決策** | 各テストファイルに mockSkillExecutor を定義し、beforeEach でリセット |
| **教訓** | DI 追加時は影響範囲を事前に調査すべき |

**mockSkillExecutor の標準構成**:

| メソッド | モック定義 | 説明 |
|----------|-----------|------|
| execute | `vi.fn()` | スキル実行 |
| abort | `vi.fn()` | 実行中断 |
| getActiveExecutions | `vi.fn().mockReturnValue([])` | アクティブ実行一覧 |
| getExecutionStatus | `vi.fn()` | 実行状態取得 |

**コード例（mockSkillExecutor）**:

```typescript
// テストファイルでの mockSkillExecutor 定義
const mockSkillExecutor = {
  execute: vi.fn(),
  abort: vi.fn(),
  getActiveExecutions: vi.fn().mockReturnValue([]),
  getExecutionStatus: vi.fn(),
};

describe('SkillService executeSkill委譲', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mockSkillExecutor をリセット
    mockSkillExecutor.execute.mockResolvedValue({
      success: true,
      output: 'test output',
    });
  });

  it('executeSkill が SkillExecutor に委譲する', async () => {
    skillService.setSkillExecutor(mockSkillExecutor);

    await skillService.executeSkill(testSkill, 'test args');

    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ name: testSkill.name }),
      'test args'
    );
  });
});
```

**参照**: [06-known-pitfalls.md - P21](../../../rules/06-known-pitfalls.md)

---

#### 3. Skill から SkillMetadata への型変換

| 項目 | 内容 |
|------|------|
| **課題** | Skill 型から SkillMetadata 型への変換が必要 |
| **原因** | SkillService は Skill 型（`lastModified` を含む）を保持するが、SkillExecutor.execute() は SkillMetadata 型（`Omit<Skill, "lastModified">`）を期待する |
| **解決策** | executeSkill() 内でインライン変換を実装（専用メソッドは不要） |
| **教訓** | 使用箇所が1箇所のみの型変換は、専用メソッドに抽出せずインラインで記述する方が可読性が高い。過剰な抽象化を避けるべき |

**型変換の対応関係（9フィールド）**:

`SkillMetadata` は `Omit<Skill, "lastModified">` として定義されており、`lastModified` を除くすべての Skill プロパティを含む。実際の変換では、以下の9フィールドを明示的にマッピングしている。

| Skill プロパティ | SkillMetadata プロパティ | 変換内容 |
|-----------------|-------------------------|----------|
| id | id | スキル一意識別子（パスのハッシュ） |
| name | name | スキル名 |
| slug | slug | ディレクトリ名 |
| description | description | 概要説明 |
| path | path | SKILL.md のファイルパス |
| triggers | triggers | Trigger キーワード配列 |
| anchors | anchors | Anchor 一覧 |
| allowedTools | allowedTools | 許可されたツール配列（任意） |
| category | category | カテゴリ（任意） |

**コード例（インライン変換）**:

```typescript
// SkillService.ts - executeSkill() 内でインライン変換
// 使用箇所が1箇所のため、専用メソッドへの抽出は過剰な抽象化と判断
const metadata: SkillMetadata = {
  id: skill.id,
  name: skill.name,
  slug: skill.slug,
  description: skill.description,
  path: skill.path,
  triggers: skill.triggers,
  anchors: skill.anchors,
  allowedTools: skill.allowedTools,
  category: skill.category,
};
return this.skillExecutor.execute(request, metadata);
```

**参照**: [interfaces-agent-sdk-executor.md - 型変換パターン](./interfaces-agent-sdk-executor.md)

---

#### 4. Phase間テスト数整合性問題

| 項目 | 内容 |
|------|------|
| **課題** | Phase 7/8/9/10 でテスト数が不整合（Phase 7: 38, Phase 8: 33, Phase 9: 39, Phase 10: 53） |
| **原因** | 各Phaseの成果物を独立に作成した際に、実際のテスト実行結果ではなく推定値を記載した |
| **解決策** | テスト数は必ず `pnpm vitest run -- --grep "対象" --reporter=verbose` の実行結果から取得する |
| **教訓** | テスト数等の定量データは推定ではなく実測値を使用すべき。Phase間で数値が不整合な場合は、最新のテスト実行結果を正として更新する |

**不整合が発生するパターン**:

| パターン | 原因 | 防止策 |
|----------|------|--------|
| Phase間の推定値ズレ | 各Phaseを異なるセッションで作成 | Phase完了時に毎回 `pnpm test` を実行して実測値を記録 |
| テスト追加/削除の未反映 | Phase 6でテスト追加後にPhase 7の数値を更新し忘れ | Phase 7（カバレッジ確認）で必ずテスト総数を再計測 |
| リファクタリングによるテスト統合 | Phase 8でテスト統合後に数値が減少 | リファクタリング後のテスト数を明示的に記録 |

**推奨ワークフロー**:

| ステップ | 処理 | 成果物 |
|----------|------|--------|
| 1 | `pnpm vitest run --reporter=verbose 2>&1 \| tail -5` | テスト総数の実測値 |
| 2 | 実測値を Phase 成果物に記録 | 正確なテスト数 |
| 3 | 前Phase の数値と比較し差異を説明 | テスト数増減の根拠 |

---

#### 5. 未タスク指示書の作成漏れ

| 項目 | 内容 |
|------|------|
| **課題** | `unassigned-task-report.md` に「指示書作成済み」と記載しながら、実際の指示書ファイルを未作成 |
| **原因** | レポート作成と指示書作成を別々のエージェントが担当し、指示書作成が実行されなかった |
| **解決策** | 未タスク管理の3ステップ（(1)指示書作成 (2)残課題テーブル登録 (3)関連仕様書リンク追加）は単一エージェントで一括実行する |
| **教訓** | P3（未タスク管理の3ステップ不完全）の再発。チェックリストを使った物理的ファイル存在確認が必要 |

**未タスク管理の3ステップ検証方法**:

| ステップ | 検証コマンド | 期待結果 |
|----------|-------------|----------|
| 1. 指示書ファイル存在確認 | `ls docs/30-workflows/unassigned-task/task-*.md` | 対象ファイルが存在すること |
| 2. 残課題テーブル登録確認 | `grep "タスクID" task-workflow.md` | 残課題テーブルにエントリが存在すること |
| 3. 関連仕様書リンク確認 | `grep "タスクID" references/*.md` | 関連仕様書に参照リンクが存在すること |

**再発防止策**:

| 対策 | 説明 |
|------|------|
| 単一エージェント実行 | 3ステップを分割せず、1つのエージェントが一括で実行 |
| ファイル存在確認 | 各ステップ完了後に `ls` でファイル存在を物理的に検証 |
| Phase 12チェックリスト | [05-task-execution.md#Task 4](../../../rules/05-task-execution.md) のチェックリストを逐次確認 |

**参照**: [06-known-pitfalls.md - P3](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物 | パス |
|--------|------|
| SkillService 実装 | `apps/desktop/src/main/services/skill/SkillService.ts` |
| skillHandlers DI 設定 | `apps/desktop/src/main/ipc/skillHandlers.ts` |
| 委譲テスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts` |
| SkillService 委譲テスト | `apps/desktop/src/main/services/skill/__tests__/SkillService.delegate.test.ts` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | Setter Injection パターン追加 |
| [interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md) | SkillService 統合セクション追加、型変換パターン追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) | P32 追加（遅延初期化パターン選択の教訓） |

---

## UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 目的 | Zustand合成Store Hookを個別セレクタHookに移行し、P31無限ループを根本解決 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| 個別セレクタHook 30個追加 | `apps/desktop/src/renderer/store/index.ts` | LLM系12個 + Skill系15個 + AuthMode系3個 |
| LLMSelectorPanel移行 | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | useLLMStore() → useLLMProviders(), useLLMFetchProviders() 等 |
| SkillSelector移行 | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` | useSkillStore() → useAvailableSkillsMetadata(), useRescanSkills() 等 |
| SettingsView移行 | `apps/desktop/src/renderer/views/SettingsView/index.tsx` | useAuthModeStore() → useSetAuthMode(), useInitializeAuthMode() 等。useRefガード削除 |

### 苦戦箇所と解決策

#### 1. useStoreの参照安定性

| 項目 | 内容 |
|------|------|
| **課題** | ZustandのuseStore(selector)で返されるオブジェクトや関数の参照安定性を保証する必要があった |
| **原因** | `useAppStore(state => ({ a: state.a, b: state.b }))` は毎回新しいオブジェクトを返すため、依存配列に入れると無限ループ発生 |
| **解決策** | 各フィールドを個別のセレクタで取得し、プリミティブ値やZustandが内部的に安定させる関数参照を返すようにした |
| **教訓** | Zustand Storeからの取得は「1セレクタ=1フィールド」が最も安全。オブジェクトをまとめて返すパターンは避ける |

**コード例（個別セレクタパターン）**:

```typescript
// store/index.ts - 個別セレクタHook（参照安定）
export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useLLMFetchProviders = () => useAppStore((state) => state.fetchProviders);

// コンポーネントでの使用（useRefガード不要）
const providers = useLLMProviders();
const fetchProviders = useLLMFetchProviders();

useEffect(() => {
  // fetchProvidersはZustandが内部的に安定させた参照のため、依存配列に含めても安全
  fetchProviders();
}, [fetchProviders]);
```

**参照**: [arch-state-management.md - P31対策](./arch-state-management.md), [06-known-pitfalls.md - P31](../../../rules/06-known-pitfalls.md)

---

#### 2. Phase 12チェックリスト管理

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12で12項目もの更新が必要で、複数の更新漏れが発生した |
| **原因** | Step 1-A〜1-D + Step 2の各サブステップを並列に管理しようとして、一部をスキップした |
| **解決策** | documentation-changelog.mdに各Step欄を事前に空欄状態で作成し、逐次消化する方式に変更 |
| **教訓** | Phase 12は「全Step確認前に完了と記載しない」ルールを厳守。チェックリスト駆動が必須 |

**参照**: [spec-update-workflow.md](../../task-specification-creator/references/spec-update-workflow.md), [06-known-pitfalls.md - P1, P4](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物 | パス |
|--------|------|
| 個別セレクタHook（30個） | `apps/desktop/src/renderer/store/index.ts` |
| 参照安定性テスト（31件） | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts` |
| 無限ループ防止テスト（40件） | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` |
| SkillSelector | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` |
| SettingsView | `apps/desktop/src/renderer/views/SettingsView/index.tsx` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [arch-state-management.md](./arch-state-management.md) | P31対策セクションに個別セレクタ実装完了記録 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) | P31解決策に個別セレクタ実装完了を反映 |
| [task-workflow.md](../../task-specification-creator/references/task-workflow.md) | 完了タスクセクション追加 |
| [patterns.md](./patterns.md) | P31対策パターンに個別セレクタ移行パターン追加 |
| [03-state-management.md](../../../rules/03-state-management.md) | 個別セレクタDOルール追加 |

---

## TASK-9B-H: SkillCreatorService IPCハンドラー登録

> **このセクションの役割**: プロセス面の教訓（何が問題だったか、どう防止するか）を記録する。実装パターン（どう実装するか）については [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md) を参照。

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| 目的 | SkillCreatorService の IPC ハンドラー登録・Preload API 公開・セキュリティ層を実装 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| IPCハンドラー登録 | `skillCreatorHandlers.ts` | ipcMain.handle で5チャンネル + 進捗通知1チャンネルを登録 |
| Preload API実装 | `skill-creator-api.ts` | safeInvoke/safeOn でホワイトリスト検証付きAPI公開 |
| contextBridge統合 | `preload/index.ts` | electronAPI.skillCreator として統合公開 |
| ホワイトリスト更新 | `channels.ts` | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS に追加 |

### 苦戦箇所と解決策

#### 1. Preload統合の漏れ防止

| 項目 | 内容 |
|------|------|
| **課題** | skill-creator-api.ts で skillCreatorAPI を実装したが、preload/index.ts への contextBridge 統合を忘れた |
| **原因** | Preload API の新規追加時に必要な更新箇所が4箇所に分散しており、チェックリスト化されていなかった |
| **解決策** | Phase 8-9 で発見・修正。新規Preload API追加時の4箇所更新チェックリストを策定 |
| **教訓** | 新規 Preload API 追加時は以下の4箇所を必ず更新する |

**新規Preload API追加時の必須更新箇所**:

| 更新箇所 | ファイル | 内容 |
|----------|----------|------|
| 1. import追加 | `preload/index.ts` | API実装モジュールのimport |
| 2. electronAPIオブジェクト追加 | `preload/index.ts` | electronAPIオブジェクトに新APIを追加 |
| 3. contextBridge.exposeInMainWorld | `preload/index.ts` | contextBridge経由でRendererに公開 |
| 4. non-isolatedフォールバック | `preload/index.ts` | contextIsolation無効時のwindow直下フォールバック |

**参照**: [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md)

**相互参照**: [06-known-pitfalls.md#P23 API二重定義の型管理](../../rules/06-known-pitfalls.md)（Preload API追加時の更新箇所分散に関する教訓）

---

#### 2. 並列Phase実行時のレビュータイミング

| 項目 | 内容 |
|------|------|
| **課題** | Phase 10（読み取り専用レビュー）が Phase 8-9（コード修正）と並列実行され、修正前のコードをレビューして MAJOR 判定を出した |
| **原因** | コード修正を伴う Phase とコード読み取りの Phase を並列実行した |
| **解決策** | コード修正を伴う Phase と読み取りレビュー Phase の並列実行を避ける |
| **教訓** | 並列実行する場合は修正前コードの可能性をレビュー結果に明記する |

**Phase並列実行の安全な組み合わせ**:

| 組み合わせ | 安全性 | 理由 |
|-----------|--------|------|
| Phase 1-3（要件・設計・レビュー） | 安全 | 読み取り専用の仕様書作業 |
| Phase 4-7（テスト・実装・カバレッジ） | 注意 | コード変更あり、依存関係確認必須 |
| Phase 8-9 + Phase 10 | 危険 | リファクタリング中にレビューすると修正前コードを評価してしまう |
| Phase 11 + Phase 12 | 安全 | 手動テストとドキュメントは独立 |

---

#### 3. IPC型定義の配置戦略

| 項目 | 内容 |
|------|------|
| **課題** | IpcResult<T> 型が Main 側（skillCreatorHandlers.ts）と Preload 側（skill-creator-api.ts）で重複定義された |
| **原因** | IPC 通信の両端で同じ型を使用するが、共有パッケージに配置する判断が後回しになった |
| **解決策** | 未タスク UT-9B-H-001 として登録し、@repo/shared/types に型を配置する後日対応を計画 |
| **教訓** | IPC通信で両側から参照される型は最初から @repo/shared に配置すべき |

**IPC型の配置判断基準**:

| 型の参照元 | 配置先 | 例 |
|-----------|--------|-----|
| Main側のみ | `apps/desktop/src/main/` 内 | 内部サービス型 |
| Preload側のみ | `apps/desktop/src/preload/` 内 | UI固有型 |
| Main + Preload両方 | `packages/shared/src/` | IpcResult<T>、共有レスポンス型 |
| Main + Preload + Renderer | `packages/shared/src/` | ドメイン型（Skill、Agent等） |

---

#### 4. artifacts.jsonのPhaseステータス管理

| 項目 | 内容 |
|------|------|
| **課題** | Phase完了時に artifacts.json のステータスが自動更新されず、Phase 12 のみ completed で残りが pending だった |
| **原因** | 各 Phase 完了時に artifacts.json のステータス更新が完了条件に含まれていなかった |
| **解決策** | 各 Phase 完了時に artifacts.json のステータス更新を完了条件チェックリストに追加 |
| **教訓** | Phase 完了時は成果物の作成だけでなく、artifacts.json のステータス更新も必須アクションとする |

**相互参照**: [06-known-pitfalls.md#P4 documentation-changelogへの早期完了記載](../../rules/06-known-pitfalls.md)（ステータス管理の早期完了判定に関する教訓）

---

#### 5. Phase 12の暗黙的要件の見落とし

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12の成果物として仕様書に明示されていないが、P28対策としてスキルフィードバックレポートが必要だった。仕様書のチェックリストを完了しても、`.claude/rules/06-known-pitfalls.md` に記載されたP28への対処が漏れた |
| **原因** | Phase 12仕様書のチェックリストが `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を参照していなかった |
| **解決策** | Phase 12実行前に `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を全て確認するチェックステップを追加する。P28は仕様書テンプレートにTask 5として明示化すべき |
| **教訓** | Phase 12のチェックリストだけでなく、`06-known-pitfalls.md` のPhase 12関連Pitfallも完了条件に含める必要がある |

**参照**: [06-known-pitfalls.md - P28](../../../rules/06-known-pitfalls.md)

**相互参照**: [06-known-pitfalls.md#P28 スキルフィードバックレポート未作成](../../rules/06-known-pitfalls.md)（Phase 12の暗黙的成果物に関する教訓）

---

#### 6. artifacts.jsonのPhase別ステータス更新忘れ

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12エージェントがPhase 12のステータスのみをcompletedに更新し、Phase 1-11はpendingのまま放置された |
| **原因** | 各Phaseの完了時にartifacts.jsonを更新する運用が確立されておらず、Phase 12エージェントが自Phase以外のステータスを確認しなかった |
| **解決策** | Phase 12仕様書の完了条件に「artifacts.jsonの全Phase（1-12）のステータスがcompletedであること」を明示する |
| **教訓** | Phase 12はプロジェクト全体のステータス整合性を確認する最終チェックポイントとして機能させる |

---

#### 7. 設計書と実装の乖離管理

| 項目 | 内容 |
|------|------|
| **課題** | Phase 2設計書で詳細に定義されたZodスキーマ、sanitizeError関数、handleWithErrorBoundaryラッパーが実装されなかった。Phase 5で実装をシンプル化したが、設計書を更新しなかったため、最終レビューで「設計-実装乖離」として検出された |
| **原因** | Phase 5（実装）で設計書の仕様を変更する判断をしたが、設計書（Phase 2成果物）を同時に更新しなかった |
| **解決策** | Phase 5（実装）で設計書の仕様を変更する場合は、同Phase内で設計書（Phase 2成果物）も更新する。「意図的なシンプル化」と「実装漏れ」を区別するため、変更理由をPhase 5成果物に記録する |
| **教訓** | 設計と実装の乖離は「意図的」であっても、設計書を更新しなければ後続レビューで「実装漏れ」と区別できない |

**設計変更時の記録フォーマット**:

| 項目 | 記載内容 |
|------|----------|
| 変更対象 | 設計書のどの仕様を変更したか |
| 変更理由 | シンプル化、パフォーマンス最適化、スコープ縮小 等 |
| 変更種別 | 「意図的なシンプル化」「スコープ外として後日対応」「不要と判断して削除」 |
| 未タスク化要否 | 後日対応が必要な場合は未タスクとして登録 |

**相互参照**: 将来 06-known-pitfalls.md に P33（設計-実装乖離管理）として追加予定。現時点では本教訓が正本。

---

#### 8. 複数エージェント並列実行時のシステム仕様書更新漏れ

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12エージェントが一部のシステム仕様書（api-ipc-agent.md, security-electron-ipc.md, architecture-overview.md）への更新を漏らした。後続の品質レビューで発見・追加修正が必要になった |
| **原因** | IPC機能開発時に更新すべきシステム仕様書の一覧が明示されておらず、エージェントが一部ファイルの存在を認識していなかった |
| **解決策** | Phase 12仕様書に「IPC機能開発時の更新対象ファイル一覧」を追加する。最低限の更新対象として以下を明記する |
| **教訓** | IPC機能開発では影響範囲が広く、更新対象ファイルが多い。チェックリストによる漏れ防止が必須 |

**IPC機能開発時の最低限の更新対象ファイル一覧**:

| ファイル | 更新内容 |
|----------|----------|
| `api-ipc-agent.md` | IPCチャンネル定義、ハンドラー仕様の追加・更新 |
| `security-electron-ipc.md` | セキュリティ層（ホワイトリスト、バリデーション）の記録 |
| `architecture-overview.md` | アーキテクチャ図、コンポーネント構成の更新 |
| `interfaces-agent-sdk-skill.md` | 型定義、インターフェース変更の記録 |
| `task-workflow.md` | 完了タスク記録、残課題テーブル更新 |
| `lessons-learned.md` | 苦戦箇所と教訓の記録 |
| `architecture-implementation-patterns.md` | 新規実装パターンの追加 |

---

#### 9. 返却仕様文言・完了済み未タスク配置・artifacts最終整合

| 項目 | 内容 |
|------|------|
| **課題** | UT-9B-H-003完了後、(1) 仕様書のエラーメッセージ文言が実装と不一致、(2) 完了済み未タスク指示書が `unassigned-task/` に残置、(3) `artifacts.json` のPhase完了状態の更新漏れが発生した |
| **原因** | Phase 12で「仕様記述」「未タスク管理」「成果物レジストリ管理」を別管理していたため、最終突合が弱かった |
| **解決策** | 1) `security-electron-ipc.md` / `api-ipc-agent.md` を実装準拠に更新、2) 完了済み指示書を `completed-tasks/unassigned-task/` へ移管、3) `artifacts.json` の phase-1〜12 を completed に統一 |
| **教訓** | Phase 12の完了判定は「ドキュメント更新」「未タスク配置整合」「artifacts整合」の3点を必須同時チェックにする |

**最終整合チェック（再発防止）**:

| チェック項目 | 確認内容 |
|-------------|----------|
| 返却仕様文言整合 | 仕様書のエラー文言が実装値と一致しているか |
| 未タスク配置整合 | 完了済み未タスクが `unassigned-task/` に残っていないか |
| artifacts整合 | phase-1〜12 の status が `completed` か |

**関連更新**:

| ファイル | 更新内容 |
|----------|----------|
| `security-electron-ipc.md` | v1.3.1: 返却仕様を実装準拠へ更新 |
| `api-ipc-agent.md` | v1.7.0: セキュリティ強化仕様追記 |
| `task-workflow.md` | v1.30.2: 完了済み未タスク指示書の移管反映 |

---

### 成果物

| 成果物 | パス |
|--------|------|
| IPCハンドラー | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` |
| Preload API | `apps/desktop/src/preload/skill-creator-api.ts` |
| ホワイトリスト更新 | `apps/desktop/src/preload/channels.ts` |
| Preload統合 | `apps/desktop/src/preload/index.ts` |
| ハンドラーテスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.test.ts` |
| Preload APIテスト | `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | IPC ハンドラー登録パターン（Pattern 3）追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) | Preload統合漏れ、並列Phase実行の教訓 |

---

## UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| 目的 | Store Hooksテストを getState() パターンから renderHook パターンに移行し、Reactサブスクリプション経由のテストを実現 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| AuthModeテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |
| LLMテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |
| AgentテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |

### 苦戦箇所と解決策

#### 1. renderHookへの移行効果

| 項目 | 内容 |
|------|------|
| **課題** | getState()パターンはZustandの内部APIを直接テストするため、Reactサブスクリプション経由の実際の動作と乖離する |
| **原因** | getState()はReactの再レンダリングサイクルを経由しないため、コンポーネントでの使用時と異なる結果を返す可能性がある |
| **解決策** | renderHookパターンにより、コンポーネントが実際に使用する経路（Reactサブスクリプション）でテスト |
| **教訓** | Zustand Hookのテストでは、getState()直接呼び出しではなく、renderHookを通じてReactサブスクリプション経路を検証すべき |

---

#### 2. テストヘルパー関数の共通化

| 項目 | 内容 |
|------|------|
| **課題** | 3つのテストファイルで同一のヘルパー関数（`assertNoInfiniteLoop()`, `assertStableReference()`, `assertNoUnrelatedRerender()`）が重複定義されている |
| **原因** | 各テストファイルを独立に作成した際に、共通ヘルパーの抽出を後回しにした |
| **解決策** | 3つのヘルパー関数を各ファイル内に定義。将来の共通化候補としてタスク化 |
| **教訓** | テストヘルパーが3ファイル以上で重複する場合は、共通テストユーティリティファイルへの抽出を検討すべき |

**テストヘルパー関数一覧**:

| ヘルパー関数 | 目的 | 検証内容 |
|-------------|------|----------|
| `assertNoInfiniteLoop()` | 無限ループ防止検証 | renderCountが閾値（通常5回）以下であることを確認 |
| `assertStableReference()` | 参照安定性検証 | 状態変更後もアクション関数の参照が同一であることを確認 |
| `assertNoUnrelatedRerender()` | 不要な再レンダリング防止検証 | 無関係な状態変更で再レンダリングが発生しないことを確認 |

---

#### 3. electronAPIモックの統一

| 項目 | 内容 |
|------|------|
| **課題** | authMode、LLM、skillの3セクションでelectronAPIモックの構造が異なり、テスト間で不整合が発生 |
| **原因** | 各テストファイルで個別にwindow.electronAPIモックを定義していたため、必要なプロパティの漏れが発生 |
| **解決策** | `createMockElectronAPI()` パターンで、authMode + llm + skill の3セクション全体を統一的にモック |
| **教訓** | electronAPIモックはテストファイルごとに部分的に定義するのではなく、全セクションを含む統一モックファクトリを使用すべき |

---

#### 4. 移行中のテスト数増加

| 項目 | 内容 |
|------|------|
| **課題** | テスト数が大幅に増加（getState()パターン48件 → renderHookパターン114件 + export検証23件） |
| **原因** | renderHookパターンでは参照安定性・無限ループ防止・不要再レンダリング防止のテストカテゴリ（CAT-01〜CAT-09）を体系的に追加した |
| **解決策** | テストカテゴリの体系的分類により、網羅性を確保しつつテスト構造を可読に維持 |
| **教訓** | テスト数の増加自体は問題ではなく、カテゴリ分類（CAT-01: 初期値, CAT-02: アクション実行, CAT-03: 参照安定性, CAT-04: 無限ループ防止, CAT-05: 不要再レンダリング防止等）で構造化されていることが重要 |

---

#### 5. Phase 12 Step 2 の「該当なし」誤判定

| 項目 | 内容 |
|------|------|
| **課題** | テストリファクタリングのため Step 2（システム仕様更新）を「該当なし」と判定したが、後から6ファイルの仕様書更新が必要になった |
| **原因** | 「テストのみの変更 = システム仕様に影響なし」と短絡的に判断した。しかし renderHook パターンへの移行はテスト戦略・テスト方法論の変更であり、開発ガイドラインや実装パターン仕様書に記録すべき内容だった |
| **解決策** | Phase 12 Step 2 の判定基準を拡張し、以下の変更は「該当あり」として仕様書更新を行う: (1) テスト方法論・戦略の変更（テストパターン移行等） (2) テストヘルパー・ユーティリティの新規追加 (3) テストカテゴリ体系の変更 |
| **教訓** | テストのみの変更でも、テスト方法論・戦略の変更はシステム仕様書の更新対象となる。「プロダクションコード変更なし = 仕様書更新不要」という判断は誤り |

**更新が必要だった仕様書一覧**:

| 仕様書 | 更新内容 |
|--------|----------|
| `development-guidelines.md` | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| `patterns.md` | Store Hookテスト実装パターン（renderHook方式）追加 |
| `arch-state-management.md` | テスト戦略セクション更新 |
| `task-workflow.md` | 完了タスクセクション追加、残課題テーブル更新 |
| `LOGS.md`（2ファイル） | タスク完了記録追加 |

**Phase 12 Step 2 判定フローチャート**:

| 変更種別 | Step 2 判定 | 理由 |
|----------|------------|------|
| プロダクションコード変更 | 該当あり | アーキテクチャ・インターフェースへの影響 |
| テスト方法論・戦略変更 | **該当あり** | 開発ガイドライン・パターン仕様書への影響 |
| テストケース追加（既存パターン） | 該当なし | 既存のテスト方法論内の変更 |
| テストコードのリファクタリング（パターン不変） | 該当なし | 構造変更のみ、方法論は不変 |

---

#### 6. 実装ガイドのテストカテゴリテーブル不整合

| 項目 | 内容 |
|------|------|
| **課題** | Phase 5 で作成した実装ガイドのテストカテゴリテーブルが、Phase 6 のテスト拡充後に更新されなかった |
| **原因** | Phase 6 でテストを大幅に拡充（CAT-07 が 3 テストから 19 テストに増加、CAT-10〜CAT-16 が新規追加）したが、実装ガイドのテーブルを再確認しなかった |
| **解決策** | Phase 6 完了後に実装ガイドのテストカテゴリテーブルを再確認し、テスト数とカテゴリを最新の実測値に更新する |
| **教訓** | Phase 6（テスト拡充）完了後は、必ず実装ガイドのテストカテゴリテーブルを再確認する。テーブルは Phase 5 時点のスナップショットであり、Phase 6 以降の変更が自動反映されないため |

**不整合の具体例**:

| カテゴリ | Phase 5 時点の記載 | Phase 6 後の実測値 | 差異 |
|----------|-------------------|-------------------|------|
| CAT-07（export検証） | 3テスト | 19テスト | +16テスト（大幅増） |
| CAT-10〜CAT-16 | 未記載 | 新規追加 | Phase 6 で新設されたカテゴリ |

**再発防止策**:

| Phase | テストカテゴリテーブル確認 | 理由 |
|-------|-------------------------|------|
| Phase 5（実装） | 初版作成 | 実装時点のテスト構造を記録 |
| Phase 6（テスト拡充） | **必須更新** | テスト数・カテゴリが変化するため |
| Phase 7（カバレッジ確認） | 確認推奨 | カバレッジ不足でテスト追加した場合 |
| Phase 8（リファクタリング） | 確認推奨 | テスト統合・分割した場合 |

---

### 成果物

| 成果物 | パス |
|--------|------|
| AuthModeセレクタテスト | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` |
| LLMセレクタテスト | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts` |
| Agentセレクタテスト | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [development-guidelines.md](./development-guidelines.md) | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| [patterns.md](../../skill-creator/references/patterns.md) | Store Hookテスト実装パターン（renderHook方式）追加 |

---

## UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 目的 | AgentViewコンポーネントの個別セレクタHook移行とテスト作成 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 1. happy-dom環境でのuserEvent非互換

| 項目 | 内容 |
|------|------|
| 難易度 | 高 |
| 影響範囲 | テストファイル全体（53テスト中49テスト失敗） |
| 解決時間 | 中程度（原因特定に時間を要した） |

**問題**: Phase 6で追加されたテストが`@testing-library/user-event`の`userEvent.setup()`を使用しており、happy-dom環境でSymbol操作エラーが発生。

```
TypeError: Symbol(Node prepared with document state workarounds)
```

**原因分析**:
- プロジェクトのデフォルトテスト環境は`happy-dom`（`vitest.config.ts`で設定）
- `userEvent.setup()`はjsdomのDOM APIに依存するSymbol操作を内部的に実行
- happy-domはこのSymbol操作を完全にはサポートしていない

**解決策**: `userEvent`を全て`fireEvent`に置換

```typescript
// ❌ happy-domで失敗するパターン
const { userEvent } = await import("@testing-library/user-event");
const user = userEvent.setup();
await user.click(element);

// ✅ happy-domで安定するパターン
import { fireEvent } from "@testing-library/react";
fireEvent.click(element);

// ✅ 非同期ハンドラの場合（Promise microtask flush）
import { act } from "@testing-library/react";
await act(async () => {
  fireEvent.click(element);
});
```

**再発防止**:
- happy-dom環境では`fireEvent`を使用する（プロジェクト標準）
- `userEvent`が必要な場合は`// @vitest-environment jsdom`ディレクティブを追加
- テスト追加時は必ずCI/ローカルで実行確認

### 2. テスト実行ディレクトリ依存問題

| 項目 | 内容 |
|------|------|
| 難易度 | 中 |
| 影響範囲 | テスト実行全体 |
| 解決時間 | 短い（パターン認識後は即解決） |

**問題**: プロジェクトルートから`pnpm vitest run apps/desktop/src/...`を実行すると、`document is not defined`エラーが発生。

**原因分析**:
- プロジェクトルートの`vitest.config.ts`と`apps/desktop/vitest.config.ts`は別ファイル
- ルートから実行すると`apps/desktop/vitest.config.ts`の`environment: "happy-dom"`と`setupFiles: ["./src/test/setup.ts"]`が読み込まれない
- 結果、テスト環境がデフォルト（node）となり、DOM APIが利用不可

**解決策**:
```bash
# ❌ プロジェクトルートから実行（失敗）
pnpm vitest run apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ apps/desktop/から実行（成功）
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ pnpm --filter を使用（成功）
pnpm --filter @repo/desktop exec vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx
```

**再発防止**: `apps/desktop/`配下のテストは必ず同ディレクトリから実行

### 3. jsdom切り替え時の副作用

| 項目 | 内容 |
|------|------|
| 難易度 | 中 |
| 影響範囲 | テストファイル全体 |
| 解決時間 | 短い（切り戻しで対応） |

**問題**: happy-domでの`userEvent`エラーを回避するため`// @vitest-environment jsdom`ディレクティブを追加したところ、別の問題が発生。

**症状**:
1. `toBeInTheDocument()`マッチャーが動作しない
2. DOM要素が重複して表示される（`getAllByRole`で期待以上の要素が返る）

**原因分析**:
- jsdom環境では`setup.ts`のロード順序が異なり、`@testing-library/jest-dom`の拡張が正しく適用されない場合がある
- jsdom独自のDOM実装による要素重複

**解決策**: jsdomへの切り替えを断念し、happy-dom + fireEventの組み合わせに統一

**教訓**: テスト環境の切り替えは、単一テストの問題解決を目的としない。環境を変更する場合は、テストファイル全体への影響を事前に検証する。

---

## UT-9B-H-003: SkillCreator IPCセキュリティ強化

### タスク概要

| 項目 | 値 |
|------|---|
| タスクID | UT-9B-H-003 |
| 目的 | skillCreatorHandlers.ts のIPC L3ドメイン検証（パストラバーサル防止、エラーサニタイズ、スキーマ名ホワイトリスト）を追加 |
| 完了日 | 2026-02-12 |
| ステータス | ✅ 完了 |
| テスト結果 | 116テスト全PASS（セキュリティ45 + 統合71） |

### 苦戦箇所

| # | 課題 | 原因 | 解決策 | 教訓 |
|---|------|------|--------|------|
| 1 | TDDでのセキュリティテスト先行設計の難しさ | セキュリティテストは攻撃ベクトルの網羅が必要で、実装前に全パターンを想定するのが困難 | 攻撃カテゴリ別にテストを分類（SEC-01〜SEC-07g）し、受入基準（AC-01〜AC-10）にマッピング。カテゴリ:パストラバーサル・エラーサニタイズ・ホワイトリスト・境界値・検証優先順序 | セキュリティテストは攻撃パターンの分類体系（SEC-XX）を先に設計し、受入基準にマップすることでTDDが機能する |
| 2 | 正規表現パターンのPrettier干渉 | Markdownコードブロック内の正規表現表記をPrettierが自動フォーマットし、`readonly["task-spec", ...]` のように壊れた表記になった | バックグラウンドエージェントで修正を実施。ドキュメント内の型表記はPrettierの影響を受けることを前提に、修正ステップを組み込む | Phase 12の実装ガイド作成時、コードブロック内のTypeScript表記がPrettierで変形される可能性を考慮し、PostToolUseフック後に検証を行う |
| 3 | YAGNI判断での共通化見送りの根拠付け | `validatePath`と`sanitizeErrorMessage`を共通パッケージに移動するか、現在のファイル内に留めるかの判断 | Phase 8で3つの共通化候補（validatePath共通化、sanitizeErrorMessage全ハンドラー横展開、IpcResult型統一）を検討し、全てYAGNI原則により「現状維持」と判断。理由を未タスク候補として記録 | リファクタリングPhaseでの共通化判断は、（1）現在の使用箇所数、（2）変更頻度、（3）独立性を評価し、YAGNI原則を適用。共通化しない判断も未タスクとして記録することで、将来の判断材料を残す |
| 4 | Phase 11のCLI環境での手動テスト不可 | CLI環境（Claude Code）ではElectronアプリを起動してDevToolsで手動テストができない | 自動テスト（Vitest 116テスト）で代替検証を実施。DevToolsコマンドを開発者向けリファレンスとして手動テストレポートに記載 | CLI環境でのPhase 11は、自動テストでの代替検証 + DevToolsコマンドのドキュメント化で対応する。手動テストが必要な場合は明示的にその旨を記録 |
| 5 | 複数セッション間でのPhase 12成果物整合性 | コンテキスト制限によりセッションが分割され、前セッションの成果物状態の追跡が困難になった | セッション開始時にoutputs/配下のファイル一覧を確認し、前セッションの進捗を復元。バックグラウンドエージェントの完了通知を待ってから最終整合性チェックを実施 | コンテキスト継続時は、成果物ディレクトリの `Glob` で前セッションの状態を即座に把握する。バックグラウンドエージェントは `TaskOutput` で完了確認してから次ステップに進む |

### コード例

#### セキュリティテスト分類体系（TDD先行設計）

```typescript
// テストID体系: SEC-[カテゴリ番号][テスト文字]
// SEC-01a〜SEC-03c: パストラバーサル攻撃テスト
// SEC-04a〜SEC-05b: ホワイトリスト検証テスト
// SEC-06a〜SEC-06c: 正常系回帰テスト
// SEC-07a〜SEC-07g: 境界値テスト

// 受入基準マッピング: AC-01 → SEC-01*, AC-02 → SEC-02* ...
describe("パストラバーサル攻撃テスト", () => {
  it.each([
    ["../etc/passwd", "Unixパストラバーサル"],
    ["..\\Windows\\System32", "Windowsパストラバーサル"],
    ["path\x00.txt", "NULLバイトインジェクション"],
    ["\\\\server\\share", "UNCパス"],
  ])("SEC-01: %s を検出してエラーを返す", async (maliciousPath) => {
    // 検証失敗 → サービス層に到達しないことを確認
  });
});
```

#### YAGNI判断の記録パターン

```markdown
| 検討項目 | 判定 | 理由 | 未タスク |
|---------|------|------|---------|
| validatePath を shared に移動 | 現状維持 | 使用箇所1ファイルのみ | UT-9B-H-002 |
| sanitizeErrorMessage 横展開 | 現状維持 | 他ハンドラーとの統一は別スコープ | UT-9B-H-001 |
```

### 成果物

| 成果物 | パス |
|--------|------|
| セキュリティ関数実装 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` |
| セキュリティテスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` |
| 実装ガイド | `docs/30-workflows/ut-9b-h-003-security-hardening/outputs/phase-12/implementation-guide.md` |
| IPCドキュメント | `docs/30-workflows/ut-9b-h-003-security-hardening/outputs/phase-12/ipc-documentation.md` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| security-electron-ipc.md | v1.3.0: L3ドメイン検証パターン完了記録 |
| architecture-implementation-patterns.md | IPC L3セキュリティハードニングパターン追加 |
| 06-known-pitfalls.md | P11関連: PostToolUseフックによるMarkdownコードブロック変形 |

---

## UT-FIX-IPC-RESPONSE-UNWRAP-001: IPCレスポンスラッパー未展開修正

### タスク概要

| 項目 | 値 |
|------|---|
| タスクID | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| 目的 | Preload層でIPC `{ success, data }` ラッパーを展開し、Rendererへ直接型を返す |
| 完了日 | 2026-02-14 |
| ステータス | ✅ 完了 |
| テスト結果 | 25件追加、既存回帰テストPASS |

### 苦戦箇所

| # | 課題 | 原因 | 解決策 | 教訓 |
|---|------|------|--------|------|
| 1 | 仕様書の正本参照が不一致 | `api-ipc-skill.md` という非実在ファイル参照が複数ドキュメントに残存 | 参照先を `interfaces-agent-sdk-skill.md` に統一し、index再生成で追従 | 仕様更新前に参照パスの物理存在確認を必須化する |
| 2 | Phase 10 MINORの未タスク化漏れ | 「軽微なので不要」という判断が先行し、未タスク管理が不完全化 | M-1/M-2を `UT-FIX-IPC-RESPONSE-UNWRAP-002/003` として正式起票 | MINOR判定は影響度に関わらず追跡タスク化し、判断理由を残す |
| 3 | 完了移管後のリンク不整合 | 元タスク指示書を移動後、`unassigned-task` 参照が残る | `completed-tasks` 側へ参照更新し、リンク整合を機械検証 | 完了移管時は「移動・参照更新・検証」を1セットで実施する |
| 4 | TypeScript ジェネリクスの type erasure によるバグ根本原因 | `safeInvoke<T>` の型注釈はコンパイル時に消去され、実行時は IPC レスポンスがそのまま透過 | `safeInvokeUnwrap<T>()` で実行時にラッパーを展開 | TypeScript の型注釈は実行時の値を変換しない。IPC 境界では必ず実行時バリデーション／変換を行う（P19 の拡張） |
| 5 | ハンドラ応答形式の不統一（safeInvoke vs safeInvokeUnwrap 選択） | Main Process のハンドラが全て同じレスポンス形式を使うわけではない | 各ハンドラの return 文を確認し、応答形式に応じて使い分け | IPC チャンネル修正時は必ずハンドラファイルの return 文を確認する |
| 6 | テストモック値の波及修正（19箇所） | `safeInvokeUnwrap` は `{ success, data }` 形式を期待するため既存モックが全て失敗 | grep で全モック箇所を特定し一括修正 | P21/P35 と同パターン。事前に影響範囲調査（grep）を実施してから一括修正すべき |
| 7 | Phase 10 仕様書テーブルと実装の乖離 | Phase 2 設計時のテーブルが Phase 5 実装結果を反映していなかった | Phase 10 レビューで MINOR 判定として記録 | Phase 10 レビュー時にテーブルの記載と実装を突合すべき |

### コード例

```typescript
// PreloadでIPCラッパーを展開する共通関数
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function safeInvokeUnwrap<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

### 苦戦箇所詳細（実装固有）

#### 4. TypeScript ジェネリクスの type erasure によるバグ根本原因

- **問題**: `safeInvoke<ImportedSkill[]>(channel)` と型注釈しても、TypeScript のジェネリクスはコンパイル時に消去（type erasure）される。実行時には `ipcRenderer.invoke()` が返す値がそのまま透過するため、Main Process が `{ success: true, data: skills }` ラッパーを返すと、Renderer 層が `{ success, data }` オブジェクトを `ImportedSkill[]` として受け取ってしまう
- **症状**: AgentView で `importedSkills.forEach is not a function` ランタイムエラー
- **解決策**: `safeInvokeUnwrap<T>()` 関数を追加し、実行時にラッパーを展開。`result.success` を検証し、`result.data` のみを返却する
- **教訓**: TypeScript の型注釈は実行時の値を変換しない。IPC 境界では必ず実行時バリデーション／変換を行うこと（P19 の拡張）
- **コード例**:

```typescript
// ❌ 型注釈だけでは実行時の値は変わらない
function safeInvoke<T>(channel: string): Promise<T> {
  return ipcRenderer.invoke(channel); // Main が { success, data } を返しても T として透過
}

// ✅ 実行時にラッパーを展開する
async function safeInvokeUnwrap<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

#### 5. ハンドラ応答形式の不統一（safeInvoke vs safeInvokeUnwrap 選択）

- **問題**: Main Process の IPC ハンドラが全て同じレスポンス形式を使うわけではない。`SKILL_LIST`, `SKILL_SCAN`, `SKILL_GET_IMPORTED` は `{ success, data }` ラッパーで返すが、`SKILL_IMPORT` は `skillService.importSkills()` の戻り値を直接返す（ラッパーなし）
- **影響**: `import()` に `safeInvokeUnwrap` を適用すると、ラッパーなし応答に対して `result.success` が `undefined`（falsy）となり、正常なレスポンスでもエラーがスローされる
- **解決策**: 各ハンドラの実装（`skillHandlers.ts`）を確認し、応答形式に応じて `safeInvoke`（ラッパーなし）/ `safeInvokeUnwrap`（ラッパーあり）を選択する
- **判断基準**:

| ハンドラの return 文 | Preload メソッド |
|---|---|
| `return { success: true, data: ... }` | `safeInvokeUnwrap` |
| `return service.method()` (直接返却) | `safeInvoke` |

- **教訓**: IPC チャンネルの修正時は、必ず `skillHandlers.ts` (または対応するハンドラファイル) の return 文を確認すること。ハンドラ応答形式のドキュメント化（テーブル形式）が将来的に必要

#### 6. テストモック値の波及修正（19箇所）

- **問題**: `safeInvoke` → `safeInvokeUnwrap` に変更すると、`mockInvoke.mockResolvedValue([...])` で直接値を返していた既存テストが全て失敗する。`safeInvokeUnwrap` は `{ success, data }` 形式のレスポンスを期待するため
- **影響範囲**: 3ファイル・計19箇所のモック値更新が必要
  - `skill-api.test.ts`: 11箇所
  - `skill-api.unification.test.ts`: 8箇所
  - `skill-api.permission.test.ts`: 0箇所（Permission API は未変更のため影響なし）
- **解決策**: `grep -n "mockResolvedValue\|mockResolvedValueOnce" *.test.ts` で全モック箇所を特定し、`list()`, `getImported()`, `rescan()` を呼ぶテストのモック値を `{ success: true, data: [...] }` 形式に更新
- **教訓**: P21/P35（DI追加時のテストモック大規模修正）と同パターン。内部実装の変更がテスト層に波及する場合は、事前に影響範囲調査（`grep`）を実施し、修正箇所リストを作成してから一括修正すべき

#### 7. Phase 10 仕様書テーブルと実装の乖離

- **問題**: Phase 10 仕様書の Task 1 テーブル（行83）に `import()` が `safeInvokeUnwrap` を使用すると記載されていたが、実装では正しく `safeInvoke` を使用している。仕様書のテーブルが Phase 2 設計時の初期想定のまま更新されていなかった
- **解決策**: Phase 10 レビューで MINOR 判定として記録。仕様書は Phase 5 実装結果を反映すべきだが、Phase 10 仕様書自体の修正はスコープ外
- **教訓**: タスク仕様書のテーブル・チェックリストは Phase 2 設計時に作成されるため、Phase 5 実装で判明した特殊ケース（SKILL_IMPORT の直接返却）が反映されない可能性がある。Phase 10 レビュー時にテーブルの記載と実装を突合すべき

### 成果物

| 成果物 | パス |
|--------|------|
| 実装ガイド | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/implementation-guide.md` |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/unassigned-task-report.md` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| interfaces-agent-sdk-skill.md | 完了タスク記録・苦戦箇所追記 |
| task-workflow.md | 完了反映 + MINOR由来未タスク2件登録 |
| phase-12-documentation.md | 参照パス修正・Step結果確定化 |

---

## UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 目的 | macOS ドックアイコンクリック時の IPC ハンドラ二重登録例外を防止 |
| 完了日 | 2026-02-14 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. ipcMain.handle()の二重登録は例外送出

| 項目 | 内容 |
|------|------|
| 問題 | `ipcMain.handle()` は同一チャンネルに2回登録すると `Error: Attempted to register a second handler for ...` 例外を送出する。`ipcMain.on()` は暗黙的にリスナーを追加する動作とは根本的に異なる |
| 発生条件 | macOS で全ウィンドウを閉じた後、ドックアイコンをクリック → `activate` イベント発火 → `registerAllIpcHandlers()` が再実行される |
| 原因 | `ipcMain.handle()` はプロセスレベルで登録されるため、BrowserWindow の破棄では解除されない。macOS ではアプリプロセスは終了しないため、ハンドラが残存する |
| 解決策 | `unregisterAllIpcHandlers()` 関数を新設し、activate ハンドラ内で unregister → createWindow → register の順序で実行する |
| 教訓 | Electron の IPC API は `handle`/`on` で二重登録時の動作が異なることを理解し、ライフサイクルに応じたハンドラ管理が必要 |
| 関連パターン | [architecture-implementation-patterns.md - IPC ハンドラ二重登録防止パターン](./architecture-implementation-patterns.md) |
| 関連 Pitfall | [06-known-pitfalls.md - P5: リスナー二重登録](../../../rules/06-known-pitfalls.md) |

#### 2. IPC_CHANNELS 全走査の前提を先に検証する

| 項目 | 内容 |
|------|------|
| 問題 | `Object.values(IPC_CHANNELS)` で全解除する方針は有効だが、`IPC_CHANNELS` がネスト構造の場合はチャンネル漏れが発生する可能性がある |
| 発生条件 | ライフサイクル修正を急いで実装する際に、チャンネル定数の構造確認を省略する |
| 原因 | ハンドラ解除ロジックを先に実装し、チャンネル定義のデータ構造検証を後回しにした |
| 解決策 | `channels.ts` の構造を先に確認し、フラット配列化される前提を明文化してから `unregisterAllIpcHandlers()` を実装する |
| 教訓 | 「全走査で安全」は前提条件つき。定数構造の確認を先行することで解除漏れと誤検知を防げる |
| 関連パターン | [security-electron-ipc.md - IPC ハンドラライフサイクル管理](./security-electron-ipc.md#ipc-ハンドラライフサイクル管理) |

#### 3. IPC外リスナーの解除漏れを同時に防ぐ

| 項目 | 内容 |
|------|------|
| 問題 | `IPC_CHANNELS` の全解除だけでは `setupThemeWatcher()` の `nativeTheme` リスナーは解除されず、再登録で監視が重複する |
| 発生条件 | IPC ハンドラ二重登録の修正に集中し、IPCチャネル以外のイベントリスナーを同一ライフサイクルで見落とす |
| 原因 | 解除対象を「ipcMain のみ」と誤って限定し、モジュールスコープの unsubscribe 管理を設計に含めなかった |
| 解決策 | `themeWatcherUnsubscribe` を保持し、`unregisterAllIpcHandlers()` で IPC 解除と同時に `setupThemeWatcher` の解除処理を実行する |
| 教訓 | Main Process のライフサイクル修正は「IPC + 非IPCリスナー」を1セットで扱うと再発を防ぎやすい |
| 関連パターン | [architecture-implementation-patterns.md - IPC ハンドラ二重登録防止パターン](./architecture-implementation-patterns.md#ipc-ハンドラ二重登録防止パターンut-fix-ipc-handler-double-reg-001-2026-02-14実装) |

---

## UT-SKILL-IMPORT-CHANNEL-CONFLICT-001: skill:import IPCチャネル名競合の予防的解消

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 |
| 目的 | 仕様書段階で `skill:import`（ローカル用）と外部インポート用チャネルの命名競合を解消し、実装時のP5/P44再発を予防 |
| 完了日 | 2026-02-24 |
| ステータス | **完了（仕様書修正のみ）** |
| 変更対象 | `task-022-task-9f-skill-share.md`, `task-030-ui-05-skill-center-view.md` |

### 苦戦箇所と解決策

#### 1. 仕様書修正のみタスクの完了反映が台帳から漏れた

| 項目 | 内容 |
|------|------|
| **課題** | `SKILL.md` / `LOGS.md` は更新されていたが、`task-workflow.md` の完了タスクセクションに本タスクの記録がなく、実装内容の追跡性が不足した |
| **原因** | 「コード変更なし」のため、完了反映をログ系ファイルだけで完結した誤判断 |
| **解決策** | `task-workflow.md` の完了タスクへ `spec_created` として登録し、成果物リンク（implementation-guide / documentation-changelog / unassigned-task-detection）を明示 |
| **教訓** | 仕様書修正のみでも「完了台帳（task-workflow）」への反映は必須。ログだけでは再利用できる知識にならない |

#### 2. workflow移管後の旧参照パス残存

| 項目 | 内容 |
|------|------|
| **課題** | `task-ui-00-atoms` 配下に旧パス `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md` が残存し、参照切れ状態だった |
| **原因** | ワークフローを `completed-tasks/` へ移管した際に、Phase 1-13 / index / Phase 12仕様書内の固定パスを一括更新しきれていなかった |
| **解決策** | 参照を `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` に統一し、関連する `00-1-design-tokens.md` / `task-050-ui-00-ui-design-foundation.md` も実在パスへ補正 |
| **教訓** | ワークフロー移管時は「単一ファイル修正」ではなく、同一ワークフロー配下の全Phase・indexを横断置換して参照実在チェックを行う |

#### 3. 生成ミスによる `{outputs` ゴーストディレクトリ

| 項目 | 内容 |
|------|------|
| **課題** | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/{outputs` という空ディレクトリが生成され、成果物ディレクトリ構造のノイズとなった |
| **原因** | ディレクトリ名テンプレートの展開時に `{` が残存したまま作成された |
| **解決策** | 空ディレクトリを削除し、`outputs/` 配下のみを正規成果物ディレクトリとして維持 |
| **教訓** | 仕様書生成タスク後は `find <workflow> -maxdepth 2 -type d` でディレクトリ名を監査し、テンプレート展開漏れを早期に除去する |

#### 4. IPC チャネル命名規則の体系化

- **課題**: 既存の `skill:import` と TASK-9F の外部ソースインポートが同名チャネルを使用する設計だった。P5（`ipcMain.handle()` 二重登録例外）により実装段階で100%失敗する
- **原因**: 仕様書設計段階でチャネル名の一意性検証が行われていなかった。複数タスク（TASK-9F, UT-FIX-SKILL-IMPORT-INTERFACE-001）が独立して進行し、名前空間の衝突を事前検出する仕組みがなかった
- **解決策**: チャネル命名規則を3パターンに体系化
  | パターン | 用途 | 例 |
  |---------|------|-----|
  | `skill:{動詞}` | 既存ローカル操作 | `skill:import` |
  | `skill:{動詞}FromSource` | 外部ソース操作 | `skill:importFromSource` |
  | `skill:{動詞}Source` | ソース自体への操作 | `skill:validateSource` |
- **教訓**: 新規 IPC チャネル追加時は `grep -rn "チャネル名" apps/desktop/src/` で既存チャネルとの名前衝突を事前検証する。仕様書レベルでの横断検索（`grep -rn "skill:import" docs/30-workflows/`）も必須

#### 5. grep ベース仕様書 TDD の有効性

- **課題**: コード変更がないため、Vitest 等の標準テストツールが使えない
- **原因**: 仕様書修正のみタスクに対するテスト手法が確立されていなかった
- **解決策**: Phase 4 で grep 検証コマンドを「テストケース」として10項目設計し、Phase 5 実装後に全実行。Phase 9 品質ゲートでも同じ grep コマンドを再利用
  - 旧チャネル名残存検出: `grep -rn "skill:import" | grep -v "importFromSource"` = 0件
  - 新チャネル名件数検証: `grep -c "importFromSource"` >= 5件
  - 既存互換性検証: ローカル用 `skill:import` が残存していること
- **教訓**: 仕様書修正タスクでは grep ベースのTDDが効果的。Red（設計）→ Green（修正）→ Refactor（品質ゲート）の3フェーズで品質担保できる

#### 6. Phase 4 の修正箇所数見積もり精度

- **課題**: Phase 4 仕様書で task-022 の修正箇所を「3箇所」と記載したが、実際は1箇所のみ
- **原因**: Phase 4 テスト設計時にファイル内容を `grep` で事前検証しなかった（P37パターン: ドキュメント数値の早期固定）
- **解決策**: grep 検証の期待値を「1件以上」と柔軟に設計し直した。実行結果は2件で PASS
- **教訓**: Phase 4 の期待値設計は、対象ファイルの `grep -c` 実行結果に基づくべき。概算ではなく実測値ベースで設計する

### 同種課題の簡潔解決手順（4ステップ）

1. **対象を固定**: `git diff --name-status` で今回対象ワークフローと仕様書更新対象（workflow / aiworkflow-requirements）を先に確定する。  
2. **参照を一括監査**: `rg -n "ui-overhaul|completed-task|../00-" <workflow-dir>` で旧パスを抽出し、実在パスへまとめて置換する。  
3. **台帳を同期**: 仕様書修正のみでも `task-workflow.md` 完了タスクと `lessons-learned.md` 苦戦箇所を同時更新する。  
4. **機械検証で締める**: `verify-unassigned-links.js`・`audit-unassigned-tasks.js`・`generate-index.js` を実行し、リンク・フォーマット・索引を同期する。

#### IPC チャネル名競合の検出・解消手順（5ステップ）

1. `grep -rn "新チャネル名" apps/desktop/src/main/ipc/` で既存チャネルとの名前衝突を検出
2. 衝突がある場合: `skill:{動詞}FromSource` パターンで新チャネル名を決定
3. `grep -rn "旧チャネル名" docs/30-workflows/` で仕様書内の全使用箇所を特定
4. 仕様書修正（チャネル名変更 + artifacts.modifies 追加 + 注記追加）
5. `grep -rn "旧チャネル名" | grep -v "新チャネル名"` で残存検証（0件 = 完了）

### 成果物

| 成果物 | パス |
|--------|------|
| ワークフロー一式 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/` |
| 実装ガイド | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/implementation-guide.md` |
| 更新履歴 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/unassigned-task-detection.md` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| `task-workflow.md` | 完了タスク2件（UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 / TASK-UI-00-ATOMS）を追記 |
| `lessons-learned.md` | 本教訓セクション追加（苦戦箇所3件 + 4ステップ手順） |
| `docs/30-workflows/completed-tasks/task-ui-00-atoms/*` | 旧参照パスを `tasks/completed-task` 正本へ統一 |

---

## UT-IPC-CHANNEL-NAMING-AUDIT-001: IPCチャネル命名監査の台帳同期（2026-02-25）

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 目的 | IPCチャネル命名規則の横断監査結果を台帳・仕様へ同期し、対象外ノイズを未タスク分離する |
| 完了日 | 2026-02-25 |
| ステータス | **spec_created（Phase 1-12完了）** |

### 苦戦箇所と解決策

#### 1. 対象内完了と対象外ノイズの混同

| 項目 | 内容 |
|------|------|
| 課題 | Skill命名監査は完了しているのに、`AUTH_*` 重複式が残っているため完了判定が曖昧になった |
| 原因 | 監査結果を「対象内/対象外」で分離せず、単一件数で扱っていた |
| 解決策 | `UT-IPC-AUTH-HANDLE-DUPLICATE-001` を未タスクとして切り出し、主タスクは `spec_created` で完了化 |
| 教訓 | 監査タスクは「対象内を完了」「対象外は未タスク化」で同時に閉じる |

#### 2. 参照パス移管時のリンク切れ

| 項目 | 内容 |
|------|------|
| 課題 | `unassigned-task` から `completed-tasks` へ移管したタスクの旧パスが残りやすい |
| 原因 | 台帳更新と成果物更新が分離され、先送りが発生 |
| 解決策 | `task-workflow.md` 更新と `verify-unassigned-links.js` 実行を同一ターンで実施 |
| 教訓 | 未タスク/完了タスクの移管は必ず「更新 + 機械検証」をワンセットで行う |

#### 3. Phase 12 成果物台帳の二重管理

| 項目 | 内容 |
|------|------|
| 課題 | `artifacts.json` と `outputs/artifacts.json` の同期漏れが発生しやすい |
| 原因 | 出力作成後に片方だけ更新して完了扱いにしてしまう |
| 解決策 | Phase 12 で両ファイルを同時更新し、差分確認を必須化 |
| 教訓 | 仕様書修正のみタスクでも成果物台帳は二重同期を前提にする |

### 同種課題向け簡潔解決手順（5ステップ）

1. 監査結果を「対象内/対象外」に分離して記録する。  
2. 対象外の未解決事項がある場合は未タスク指示書を作成する。  
3. `task-workflow.md` に完了化と未タスク追加を同時反映する。  
4. `verify-unassigned-links.js` を実行し、参照切れ0件を確認する。  
5. `artifacts.json` と `outputs/artifacts.json` を同期してから完了判定する。

### 成果物

| 成果物 | パス |
|--------|------|
| 監査ワークフロー | `docs/30-workflows/ut-ipc-channel-naming-audit-001/` |
| 元タスク指示書（移管先） | `docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md` |
| 新規未タスク指示書（完了移管先） | `docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md` |
| Phase 12 未タスク検出レポート | `docs/30-workflows/ut-ipc-channel-naming-audit-001/outputs/phase-12/unassigned-task-detection.md` |

---
## テンプレート（新規教訓追加用）

以下は将来のタスク記録用テンプレートです。

### 記入ガイドライン

| 項目 | 説明 | 必須 |
|------|------|:----:|
| タスクID | 一意のタスク識別子（例: TASK-FIX-XX-X） | Yes |
| 目的 | タスクの目的を1文で記述 | Yes |
| 完了日 | YYYY-MM-DD 形式 | Yes |
| 苦戦箇所 | 課題・原因・解決策・教訓をテーブルで記述 | Yes |
| コード例 | 解決策を示す具体的なコード（TypeScript） | 推奨 |
| 参照 | 関連ドキュメントへのリンク | 推奨 |
| 成果物 | 変更/追加されたファイルのパス | Yes |

### テンプレート本文

```markdown
## TASK-XXX: タスク名（YYYY-MM-DD）

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-XXX |
| 目的 | タスクの目的 |
| 完了日 | YYYY-MM-DD |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| 変更1 | ファイルパス | 説明 |

### 苦戦箇所と解決策

#### 1. [苦戦箇所のタイトル]

| 項目 | 内容 |
|------|------|
| **課題** | 課題の説明 |
| **原因** | 原因の説明 |
| **解決策** | 解決策の説明 |
| **教訓** | 今後の教訓 |

**コード例**:

```typescript
// 解決策を示すコード例
```

**参照**: [関連ドキュメント](./path/to/doc.md)

---

### 成果物

| 成果物 | パス |
|--------|------|
| 成果物名 | ファイルパス |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| ドキュメント名 | 更新内容 |
```

---

## 品質チェックリスト

新規教訓を追加する際は、以下を確認してください。

| チェック項目 | 基準 |
|-------------|------|
| [ ] タスク概要が完全 | タスクID、目的、完了日、ステータスがすべて記載 |
| [ ] 苦戦箇所が構造化 | 課題・原因・解決策・教訓の4項目がテーブルで記載 |
| [ ] コード例が具体的 | 解決策を再現可能なコード例が含まれる |
| [ ] 参照リンクが有効 | 関連ドキュメントへのリンクが正しい |
| [ ] 06-known-pitfalls.md と整合 | 汎用的な教訓は pitfalls にも追加 |
| [ ] 変更履歴を更新 | 本ドキュメント上部の変更履歴テーブルを更新 |
| [ ] 目次を更新 | 新規タスクを目次に追加 |
