# Lessons Learned（教訓集） / templates and checklist

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: templates and checklist

## 目次

0. [TASK-9H: スキルデバッグモード実装（2026-02-27）](#task-9h-スキルデバッグモード実装2026-02-27)
   - [苦戦箇所1: `registerAllIpcHandlers` への登録漏れ](#苦戦箇所1-registerallipchandlers-への登録漏れ)
   - [苦戦箇所2: Phase 12 必須成果物の不足](#苦戦箇所2-phase-12-必須成果物の不足)
   - [苦戦箇所3: `phase-12-documentation.md` のステータス未同期](#苦戦箇所3-phase-12-documentationmd-のステータス未同期)
   - [同種課題向け簡潔解決手順（4ステップ）](#同種課題向け簡潔解決手順4ステップ)

1. [TASK-9A-skill-editor: Phase 12再確認（2026-02-26）](#task-9a-skill-editor-phase-12再確認2026-02-26)
   - [苦戦箇所1: 実装ガイドのPart 1/Part 2要件不足](#苦戦箇所1-実装ガイドのpart-1part-2要件不足)
   - [苦戦箇所2: `audit-unassigned-tasks --target-file` の出力誤読](#苦戦箇所2-audit-unassigned-tasks---target-file-の出力誤読)
   - [苦戦箇所3: 未タスク指示書のメタ情報重複](#苦戦箇所3-未タスク指示書のメタ情報重複)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)

2. [UT-UI-THEME-DYNAMIC-SWITCH-001: settingsSlice テーマ動的切替対応](#ut-ui-theme-dynamic-switch-001-settingsslice-テーマ動的切替対応)
   - [苦戦箇所: `themeMode` と `resolvedTheme` の責務分離](#苦戦箇所-themeMode-と-resolvedtheme-の責務分離)
   - [苦戦箇所: Store Hook依存による再実行ループ](#苦戦箇所-store-hook依存による再実行ループ)
   - [苦戦箇所: Phase 12成果物と仕様書本体の同期漏れ](#苦戦箇所-phase-12成果物と仕様書本体の同期漏れ)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
   - [同種課題向け転記テンプレート（5分版）](#同種課題向け転記テンプレート5分版)

3. [UT-FIX-SKILL-EXECUTE-INTERFACE-001: skill:execute IPC契約ブリッジ](#ut-fix-skill-execute-interface-001-skillexecute-ipc契約ブリッジ)
   - [苦戦箇所: 正式契約（skillName）と後方互換（skillId）の同時維持](#苦戦箇所-正式契約skillnameと後方互換skillidの同時維持)
   - [苦戦箇所: `skillName -> skillId` 変換の責務配置](#苦戦箇所-skillname---skillid-変換の責務配置)
   - [苦戦箇所: 新旧契約テストの取りこぼし](#苦戦箇所-新旧契約テストの取りこぼし)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
4. [UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001: 未タスク監査の scope 分離](#ut-imp-unassigned-audit-scope-control-001-未タスク監査の-scope-分離)
   - [苦戦箇所: 全体監査結果を今回差分の失敗と誤読しやすい](#苦戦箇所-全体監査結果を今回差分の失敗と誤読しやすい)
   - [苦戦箇所: 完了済み未タスク指示書の移管漏れ](#苦戦箇所-完了済み未タスク指示書の移管漏れ)
   - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ)
5. [UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001: task-9D〜9J 仕様差分の統合是正](#ut-imp-ipc-preload-extension-spec-alignment-001-task-9d9j-仕様差分の統合是正)
   - [苦戦箇所1: 旧パスが文書内で混在し正本が不明瞭化](#苦戦箇所1-旧パスが文書内で混在し正本が不明瞭化)
   - [苦戦箇所2: artifacts必須項目の漏れがtaskごとに発生](#苦戦箇所2-artifacts必須項目の漏れがtaskごとに発生)
   - [苦戦箇所3: Date型方針がtask-9Iのみドリフト](#苦戦箇所3-date型方針がtask-9iのみドリフト)
   - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ-2)

6. [UT-IPC-DATA-FLOW-TYPE-GAPS-001: Phase 12再監査（仕様書修正タスク）](#ut-ipc-data-flow-type-gaps-001-phase-12再監査仕様書修正タスク)
   - [苦戦箇所1: Phase 12成果物の不足](#苦戦箇所1-phase-12成果物の不足)
   - [苦戦箇所2: artifactsjson 二重管理の非同期](#苦戦箇所2-artifactsjson-二重管理の非同期)
   - [苦戦箇所3: 未タスク指示書フォーマット不一致](#苦戦箇所3-未タスク指示書フォーマット不一致)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
   - [苦戦箇所4: 仕様書修正タスクのPhaseテンプレート適用困難](#苦戦箇所4-仕様書修正タスクのphaseテンプレート適用困難)
   - [苦戦箇所5: 6ギャップの横断的分析の複雑性](#苦戦箇所5-6ギャップの横断的分析の複雑性)
   - [苦戦箇所6: Date型シリアライズ方針の統一判断](#苦戦箇所6-date型シリアライズ方針の統一判断)
   - [苦戦箇所7: positional→object形式のIPC引数移行設計](#苦戦箇所7-positionalobject形式のipc引数移行設計)
   - [同種課題の簡潔解決手順（5ステップ）- 仕様書修正タスク向け](#同種課題の簡潔解決手順5ステップ-仕様書修正タスク向け)

7. [UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化](#ut-fix-ts-vitest-tsconfig-paths-001-vitest-alias-と-tsconfig-paths-の同期自動化)
   - [苦戦箇所1: Phase 12未タスク検出ソースの網羅漏れ](#苦戦箇所1-phase-12未タスク検出ソースの網羅漏れ)
   - [苦戦箇所2: validate-phase-output のセクション終端依存](#苦戦箇所2-validate-phase-output-のセクション終端依存)
   - [苦戦箇所3: 全体監査結果と今回差分の混同](#苦戦箇所3-全体監査結果と今回差分の混同)
   - [同種課題の簡潔解決手順（5ステップ・再監査版）](#同種課題の簡潔解決手順5ステップ再監査版)
8. [TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 4設定ファイル整合CIガード](#task-imp-module-resolution-ci-guard-001-reposhared-4設定ファイル整合ciガード)
   - [苦戦箇所1: Phase 10 MINORの残置（レポート仕様ドリフト）](#1-phase-10-minorの残置レポート仕様ドリフト)
   - [苦戦箇所2: Phase 12証跡と仕様書本体状態の同期漏れリスク](#2-phase-12証跡と仕様書本体状態の同期漏れリスク)
   - [苦戦箇所3: 未タスク監査結果のベースライン混同](#3-未タスク監査結果のベースライン混同)
   - [苦戦箇所4: vitest.config.ts の正規表現パース](#4-vitestconfigts-の正規表現パース)
   - [苦戦箇所5: キー形式の相互変換設計](#5-キー形式の相互変換設計)
   - [苦戦箇所6: typesVersions の "." エントリスキップロジック](#6-typesversions-の--エントリスキップロジック)
   - [苦戦箇所7: process.exitCode vs process.exit() のテスタビリティ](#7-processexitcode-vs-processexit-のテスタビリティ)
   - [同種課題の簡潔解決手順（5ステップ・CIガード版）](#同種課題の簡潔解決手順5ステップciガード版)
9. [UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog の id/name 契約不整合修正](#ut-fix-skill-import-id-mismatch-001-skillimportdialog-の-idname-契約不整合修正)
   - [苦戦箇所1: 同名コンポーネントの誤調査](#1-同名コンポーネントの誤調査)
   - [苦戦箇所2: `skill.id`/`skill.name` の文字列型混同](#2-skillidskillname-の文字列型混同)
   - [苦戦箇所3: インポート処理の偽成功ログの誤読](#3-インポート処理の偽成功ログの誤読)
   - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ)
10. [UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import インターフェース整合修正](#ut-fix-skill-import-interface-001-skillimport-インターフェース整合修正)
    - [苦戦箇所1: Phase 12成果物と仕様書本体ステータスの不一致](#1-phase-12成果物と仕様書本体ステータスの不一致)
    - [苦戦箇所2: ワークフロー移動後の旧参照パス残存](#2-ワークフロー移動後の旧参照パス残存)
    - [苦戦箇所3: Vitest実行ディレクトリ差異による偽失敗](#3-vitest実行ディレクトリ差異による偽失敗)
    - [同種課題の簡潔解決手順（5ステップ・import版）](#同種課題の簡潔解決手順5ステップimport版)
11. [UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove インターフェース整合修正](#ut-fix-skill-remove-interface-001-skillremove-インターフェース整合修正)
    - [苦戦箇所1: `skillId` / `skillName` 契約ドリフト](#1-skillid--skillname-契約ドリフト)
    - [苦戦箇所2: 未タスク配置ディレクトリのドリフト](#2-未タスク配置ディレクトリのドリフト)
    - [苦戦箇所3: Vitest実行コンテキスト差異](#3-vitest実行コンテキスト差異)
    - [苦戦箇所4: worktree環境でのStep 1-A先送り誤判断](#4-worktree環境でのstep-1-a先送り誤判断)
    - [苦戦箇所5: マルチエージェントPhase実行の依存順序違反](#5-マルチエージェントphase実行の依存順序違反)
    - [苦戦箇所6: worktree環境でのPhase 11手動テスト制約](#6-worktree環境でのphase-11手動テスト制約)
    - [苦戦箇所7: カバレッジ閾値のスコープ解釈](#7-カバレッジ閾値のスコープ解釈)
    - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ)
12. [UT-FIX-SKILL-VALIDATION-CONSISTENCY-001: skill:ハンドラP42準拠バリデーション形式統一](#ut-fix-skill-validation-consistency-001-skillハンドラp42準拠バリデーション形式統一)
    - [苦戦箇所1: 補完タスクと元未タスクの二重管理](#1-補完タスクと元未タスクの二重管理)
    - [苦戦箇所2: Phase 12成果物と仕様書本体ステータスの同期漏れ](#2-phase-12成果物と仕様書本体ステータスの同期漏れ)
    - [苦戦箇所3: 未タスクraw検出に既存TODOが混在](#3-未タスクraw検出に既存todoが混在)
    - [苦戦箇所4: 6ハンドラの引数形式の違い（オブジェクト型 vs 直接引数型）](#4-6ハンドラの引数形式の違いオブジェクト型-vs-直接引数型)
    - [苦戦箇所5: return → throw マイグレーション時のRenderer側影響分析](#5-return--throw-マイグレーション時のrenderer側影響分析)
    - [苦戦箇所6: コンテキスト枯渇による3セッション分割](#6-コンテキスト枯渇による3セッション分割)
    - [同種課題の簡潔解決手順（プロセス面4ステップ + 実装面5ステップ）](#同種課題の簡潔解決手順プロセス面4ステップ--実装面5ステップ)
13. [TASK-9A-C: SkillEditor 仕様書再監査（Phase 12準拠）](#task-9a-c-skilleditor-仕様書再監査phase-12準拠)
    - [苦戦箇所1: tasks/completed-task 参照混在](#1-taskscompleted-task-参照混在)
    - [苦戦箇所2: phase-09 と phase-9 の表記ゆれ](#2-phase-09-と-phase-9-の表記ゆれ)
    - [苦戦箇所3: Step 1-B の状態判定の曖昧さ](#3-step-1-b-の状態判定の曖昧さ)
    - [苦戦箇所4: 未タスク参照の実体不足](#4-未タスク参照の実体不足)
    - [苦戦箇所5: 並列エージェント実行時のAPIレートリミット](#5-並列エージェント実行時のapiレートリミット)
    - [苦戦箇所6: スキルスクリプトのパス解決](#6-スキルスクリプトのパス解決)
    - [苦戦箇所7: 大規模仕様書のコンテキスト管理](#7-大規模仕様書のコンテキスト管理)
    - [苦戦箇所8: 仕様書へのPitfall事前組み込みの有効性](#8-仕様書へのpitfall事前組み込みの有効性)
14. [TASK-9A-B: スキルファイル操作IPCハンドラー実装](#task-9a-b-スキルファイル操作ipcハンドラー実装)
    - [苦戦箇所1: 仕様書の実装事実ドリフト（テスト件数・エラーメッセージ）](#1-仕様書の実装事実ドリフトテスト件数エラーメッセージ)
    - [苦戦箇所2: Preload公開先パスの取り違え](#2-preload公開先パスの取り違え)
    - [苦戦箇所3: 未タスク検出raw件数の誤読防止](#3-未タスク検出raw件数の誤読防止)
    - [苦戦箇所4: handlerMap ESMモックパターン](#4-handlermap-esmモックパターン)
    - [苦戦箇所5: v8カバレッジの関数定義行カウント問題](#5-v8カバレッジの関数定義行カウント問題)
    - [苦戦箇所6: .trim()境界値バリデーション漏れ](#6-trim境界値バリデーション漏れ)
    - [苦戦箇所7: isKnownSkillFileError型ガードによるエラーサニタイズ設計](#7-isknownskillfileerror型ガードによるエラーサニタイズ設計)
15. [TASK-FIX-10-1: Vitest未処理Promise拒否検知の復元](#task-fix-10-1-vitest未処理promise拒否検知の復元)
    - [苦戦箇所1: Step 2要否判定の誤り](#1-step-2要否判定の誤り)
    - [苦戦箇所2: 未タスク検出範囲の不足](#2-未タスク検出範囲の不足)
    - [苦戦箇所3: alias運用の継続性不足](#3-alias運用の継続性不足)
    - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ)
16. [TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: @repo/shared モジュール解決エラー修正](#task-fix-ts-shared-module-resolution-001-reposhared-モジュール解決エラー修正)
    - [苦戦箇所1: exports/paths/alias 三層整合の同期漏れ](#1-exportspathsalias-三層整合の同期漏れ)
    - [苦戦箇所2: source直接参照時の補助型宣言取り込み漏れ](#2-source直接参照時の補助型宣言取り込み漏れ)
    - [苦戦箇所3: 未タスクリンク整合の既存崩れ](#3-未タスクリンク整合の既存崩れ)
    - [苦戦箇所4: TypeScript paths 定義順序の重要性](#4-typescript-paths-定義順序の重要性)
    - [苦戦箇所5: 4ファイル同期の必要性](#5-4ファイル同期の必要性packagejson--tsconfig--vitestconfig--typesversions)
    - [同種課題の簡潔解決手順（5ステップ）](#同種課題の簡潔解決手順5ステップ-1)
17. [UT-FIX-IPC-RESPONSE-UNWRAP-001: IPCレスポンスラッパー未展開修正](#ut-fix-ipc-response-unwrap-001-ipcレスポンスラッパー未展開修正)
    - [苦戦箇所1: 仕様書の正本参照が不一致](#1-仕様書の正本参照が不一致)
    - [苦戦箇所2: Phase 10 MINORの未タスク化漏れ](#2-phase-10-minorの未タスク化漏れ)
    - [苦戦箇所3: 完了移管後のリンク不整合](#3-完了移管後のリンク不整合)
    - [苦戦箇所4: TypeScript ジェネリクスの type erasure によるバグ根本原因](#4-typescript-ジェネリクスの-type-erasure-によるバグ根本原因)
    - [苦戦箇所5: ハンドラ応答形式の不統一](#5-ハンドラ応答形式の不統一safeinvoke-vs-safeinvokeunwrap-選択)
    - [苦戦箇所6: テストモック値の波及修正（19箇所）](#6-テストモック値の波及修正19箇所)
    - [苦戦箇所7: Phase 10 仕様書テーブルと実装の乖離](#7-phase-10-仕様書テーブルと実装の乖離)
18. [TASK-FIX-14-1: console → electron-log 移行](#task-fix-14-1-console--electron-log-移行)
    - [苦戦箇所1: 実変更ファイル名との乖離](#1-実変更ファイル名との乖離)
    - [苦戦箇所2: Phase 12 Step 1-A/1-C/1-D の先送り誤判定](#2-phase-12-step-1-a1-c1-d-の先送り誤判定)
    - [苦戦箇所3: 未タスク検出後の登録漏れ](#3-未タスク検出後の登録漏れ)
    - [苦戦箇所4: 大量テストファイルへのモック一括追加](#4-大量テストファイルへのモック一括追加)
    - [苦戦箇所5: debug プロパティの後方互換性判断](#5-debug-プロパティの後方互換性判断)
    - [苦戦箇所6: カバレッジ計測コマンドの引数誤り](#6-カバレッジ計測コマンドの引数誤り)
    - [苦戦箇所7: 条件ガード削除による予想外の簡素化効果](#7-条件ガード削除による予想外の簡素化効果)
19. [TASK-FIX-13-1: deprecatedプロパティ正式移行](#task-fix-13-1-deprecatedプロパティ正式移行)
    - [苦戦箇所1: 削除対象の境界判定](#1-削除対象の境界判定)
    - [苦戦箇所2: 汎用プロパティ参照の誤検出回避](#2-汎用プロパティ参照の誤検出回避)
    - [苦戦箇所3: Phase-12仕様同期漏れの防止](#3-phase-12仕様同期漏れの防止)
    - [苦戦箇所4: ドキュメント偏重による実装検証の省略](#4-ドキュメント偏重による実装検証の省略)
    - [苦戦箇所5: 並列エージェント実行時の成果物品質保証](#5-並列エージェント実行時の成果物品質保証)
20. [TASK-FIX-11-1: SDK統合テスト有効化](#task-fix-11-1-sdk統合テスト有効化)
    - [苦戦箇所1: Phase 12 Step 1-A/1-D の誤判定](#1-phase-12-step-1-a1-d-の該当なし誤判定)
    - [苦戦箇所2: 未タスク検出 raw 結果の誤読](#2-未タスク検出の-raw-結果をそのまま採用)
    - [苦戦箇所3: Vitest モック初期化の挙動差異](#3-vitest-モック初期化の挙動差異)
21. [TASK-FIX-7-1: SkillService executeSkill 委譲実装](#task-fix-7-1-skillservice-executeskill-委譲実装)
    - [苦戦箇所1: Setter Injection vs Constructor Injection](#1-setter-injection-vs-constructor-injection-の選択)
    - [苦戦箇所2: テストモックの大規模修正](#2-テストモックの大規模修正)
    - [苦戦箇所3: 型変換](#3-skill-から-skillmetadata-への型変換)
    - [苦戦箇所4: Phase間テスト数整合性問題](#4-phase間テスト数整合性問題)
    - [苦戦箇所5: 未タスク指示書の作成漏れ](#5-未タスク指示書の作成漏れ)
22. [UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行](#ut-store-hooks-component-migration-001-個別セレクタhook移行)
    - [苦戦箇所1: useStoreの参照安定性](#1-usestoreの参照安定性)
    - [苦戦箇所2: Phase 12チェックリスト管理](#2-phase-12チェックリスト管理)
23. [TASK-9B-H: SkillCreatorService IPCハンドラー登録](#task-9b-h-skillcreatorservice-ipcハンドラー登録)
    - [教訓1: Preload統合の漏れ防止](#1-preload統合の漏れ防止)
    - [教訓2: 並列Phase実行時のレビュータイミング](#2-並列phase実行時のレビュータイミング)
    - [教訓3: IPC型定義の配置戦略](#3-ipc型定義の配置戦略)
    - [教訓4: artifacts.jsonのPhaseステータス管理](#4-artifactsjsonのphaseステータス管理)
    - [教訓5: Phase 12の暗黙的要件の見落とし](#5-phase-12の暗黙的要件の見落とし)
    - [教訓6: artifacts.jsonのPhase別ステータス更新忘れ](#6-artifactsjsonのphase別ステータス更新忘れ)
    - [教訓7: 設計書と実装の乖離管理](#7-設計書と実装の乖離管理)
    - [教訓8: 複数エージェント並列実行時のシステム仕様書更新漏れ](#8-複数エージェント並列実行時のシステム仕様書更新漏れ)
    - [教訓9: 返却仕様文言・完了済み未タスク配置・artifacts最終整合](#9-返却仕様文言完了済み未タスク配置artifacts最終整合)
24. [UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行](#ut-store-hooks-test-refactor-001-renderhookパターン移行)
    - [苦戦箇所1: renderHookへの移行効果](#1-renderhookへの移行効果)
    - [苦戦箇所2: テストヘルパー関数の共通化](#2-テストヘルパー関数の共通化)
    - [苦戦箇所3: electronAPIモックの統一](#3-electronapiモックの統一)
    - [苦戦箇所4: 移行中のテスト数増加](#4-移行中のテスト数増加)
    - [苦戦箇所5: Phase 12 Step 2 の「該当なし」誤判定](#5-phase-12-step-2-の該当なし誤判定)
    - [苦戦箇所6: 実装ガイドのテストカテゴリテーブル不整合](#6-実装ガイドのテストカテゴリテーブル不整合)
25. [UT-9B-H-003: SkillCreator IPCセキュリティ強化](#ut-9b-h-003-skillcreator-ipcセキュリティ強化)
    - [苦戦箇所1: TDDでのセキュリティテスト先行設計の難しさ](#1-tddでのセキュリティテスト先行設計の難しさ)
    - [苦戦箇所2: 正規表現パターンのPrettier干渉](#2-正規表現パターンのprettier干渉)
    - [苦戦箇所3: YAGNI判断での共通化見送りの根拠付け](#3-yagni判断での共通化見送りの根拠付け)
    - [苦戦箇所4: Phase 11のCLI環境での手動テスト不可](#4-phase-11のcli環境での手動テスト不可)
    - [苦戦箇所5: 複数セッション間でのPhase 12成果物整合性](#5-複数セッション間でのphase-12成果物整合性)
26. [UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト](#ut-fix-agentview-infinite-loop-001-agentview無限ループ修正テスト)
    - [苦戦箇所1: happy-dom環境でのuserEvent非互換](#1-happy-dom環境でのuserevent非互換)
    - [苦戦箇所2: テスト実行ディレクトリ依存問題](#2-テスト実行ディレクトリ依存問題)
    - [苦戦箇所3: jsdom切り替え時の副作用](#3-jsdom切り替え時の副作用)
27. [UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止](#ut-fix-ipc-handler-double-reg-001-ipcハンドラ二重登録防止)
    - [教訓1: ipcMain.handle()の二重登録は例外送出](#1-ipcmainhandleの二重登録は例外送出)
    - [教訓2: IPC_CHANNELS 全走査の前提を先に検証する](#2-ipc_channels-全走査の前提を先に検証する)
    - [教訓3: IPC外リスナーの解除漏れを同時に防ぐ](#3-ipc外リスナーの解除漏れを同時に防ぐ)
28. [UT-SKILL-IMPORT-CHANNEL-CONFLICT-001: skill:import IPCチャネル名競合の予防的解消](#ut-skill-import-channel-conflict-001-skillimport-ipcチャネル名競合の予防的解消)
    - [苦戦箇所1: 仕様書修正のみタスクの完了反映が台帳から漏れた](#1-仕様書修正のみタスクの完了反映が台帳から漏れた)
    - [苦戦箇所2: workflow移管後の旧参照パス残存](#2-workflow移管後の旧参照パス残存)
    - [苦戦箇所3: 生成ミスによる-outputs-ゴーストディレクトリ](#3-生成ミスによる-outputs-ゴーストディレクトリ)
    - [同種課題の簡潔解決手順（4ステップ）](#同種課題の簡潔解決手順4ステップ-1)
29. [TASK-9B: SkillCreator IPC拡張同期 再監査（2026-02-26）](#task-9b-skillcreator-ipc拡張同期-再監査2026-02-26)
    - [苦戦箇所1: IPCチャンネル契約数（6/13）の混在](#1-ipcチャンネル契約数613の混在)
    - [苦戦箇所2: createハンドラーのP42 3段バリデーション未完了](#2-createハンドラーのp42-3段バリデーション未完了)
    - [苦戦箇所3: 未タスク監査のcurrent/baseline混同](#3-未タスク監査のcurrentbaseline混同)
30. [関連ドキュメント](#関連ドキュメント)
31. [テンプレート（新規教訓追加用）](#テンプレート新規教訓追加用)

---

## 関連ドキュメント

| ドキュメント                            | 目的                               | パス                                                                                   |
| --------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| architecture-implementation-patterns.md | 実装パターン集（DIパターン等）     | [./architecture-implementation-patterns.md](./architecture-implementation-patterns.md) |
| interfaces-agent-sdk-executor.md        | SkillExecutor インターフェース仕様 | [./interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md)               |
| 06-known-pitfalls.md                    | 既知の落とし穴と防止策             | [../../../rules/06-known-pitfalls.md](../../../rules/06-known-pitfalls.md)             |

---

## テンプレート（新規教訓追加用）

以下は将来のタスク記録用テンプレートです。

### 記入ガイドライン

| 項目     | 説明                                     | 必須 |
| -------- | ---------------------------------------- | :--: |
| タスクID | 一意のタスク識別子（例: TASK-FIX-XX-X）  | Yes  |
| 目的     | タスクの目的を1文で記述                  | Yes  |
| 完了日   | YYYY-MM-DD 形式                          | Yes  |
| 苦戦箇所 | 課題・原因・解決策・教訓をテーブルで記述 | Yes  |
| コード例 | 解決策を示す具体的なコード（TypeScript） | 推奨 |
| 参照     | 関連ドキュメントへのリンク               | 推奨 |
| 成果物   | 変更/追加されたファイルのパス            | Yes  |

### テンプレート本文

````markdown

## TASK-XXX: タスク名（YYYY-MM-DD）

### タスク概要

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-XXX     |
| 目的       | タスクの目的 |
| 完了日     | YYYY-MM-DD   |
| ステータス | **完了**     |

### 実装内容

| 変更内容 | ファイル     | 説明 |
| -------- | ------------ | ---- |
| 変更1    | ファイルパス | 説明 |

### 苦戦箇所と解決策

#### 1. [苦戦箇所のタイトル]

| 項目       | 内容         |
| ---------- | ------------ |
| **課題**   | 課題の説明   |
| **原因**   | 原因の説明   |
| **解決策** | 解決策の説明 |
| **教訓**   | 今後の教訓   |

**コード例**:

```typescript
// 解決策を示すコード例
```
````

**参照**: [関連ドキュメント](./path/to/doc.md)

---

### 成果物

| 成果物   | パス         |
| -------- | ------------ |
| 成果物名 | ファイルパス |

### 関連ドキュメント更新

| ドキュメント   | 更新内容 |
| -------------- | -------- |
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

