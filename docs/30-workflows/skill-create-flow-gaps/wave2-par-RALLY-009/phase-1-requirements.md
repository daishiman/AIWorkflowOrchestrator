# Phase 1: 要件定義

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| 機能名     | TASK-RALLY-009                   |
| タスク名   | getSkillCreatorApi()型ガード強化 |
| 前提Phase  | -                                |
| 後続Phase  | Phase 2                          |
| 作成日     | 2026-04-21                       |
| ステータス | pending                          |

## SubAgentチーム編成

| SubAgent   | 担当                                                                             | 実行形態          |
| ---------- | -------------------------------------------------------------------------------- | ----------------- |
| SubAgent-A | getSkillCreatorApi()/getSessionResumeApi()の現状コード調査・asキャスト箇所の特定 | 並列              |
| SubAgent-B | SkillCreatorRuntimeApi/SessionResumeApiの型定義確認・必須メソッド一覧抽出        | 並列              |
| SubAgent-C | A/B結果統合・受け入れ基準策定・要件定義書完成                                    | 直列（A,B完了後） |

## 目的

`getSkillCreatorApi()`と`getSessionResumeApi()`が同一オブジェクトを異なる型（`as`キャスト）で参照しており、
実行時型保証がないという問題を解消する要件を確定する。

## 背景

`SkillLifecyclePanel.tsx`内で`window.skillCreatorAPI`オブジェクトを`as`キャストで型アサーションしている。
型ガードなしの`as`キャストはElectronプリロードが正しく読み込まれていない環境（開発中・テスト環境・プリロードロード前）では
実行時エラーが型チェックでは検出されずサイレントに発生するリスクがある。
本タスクはRALLY-004（型定義整理）完了後に着手する並列タスクである。

## 実行タスク

- SubAgent-A: `getSkillCreatorApi()`・`getSessionResumeApi()`の現状実装をコード調査する
- SubAgent-A: `as`キャストを使用している箇所と`window.skillCreatorAPI`へのアクセスパターンを特定する
- SubAgent-A: `window.electronAPI?.skillCreator`へのフォールバックパターンを確認する
- SubAgent-B: `SkillCreatorRuntimeApi`の型定義（必須メソッド一覧）を確認する
- SubAgent-B: `SessionResumeApi`の型定義（必須メソッド一覧）を確認する
- SubAgent-B: `apps/desktop/src/preload/skill-creator-api.ts`の型定義・エクスポート状況を確認する
- SubAgent-C: 受け入れ基準AC-1〜AC-7を策定する

## 参照資料

| 資料名                     | パス                                                                   | 用途                           |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| 対象ファイル（呼び出し元） | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | getSkillCreatorApi等の実装確認 |
| 対象ファイル（型定義）     | `apps/desktop/src/preload/skill-creator-api.ts`                        | 型定義・エクスポート確認       |
| 設計ドキュメント           | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` | RALLY-009設計方針参照          |
| 既存index.md               | `docs/30-workflows/skill-create-flow-gaps/p09-par-RALLY-009/index.md`  | タスク概要参照                 |

## 成果物

| 成果物         | パス                                         | 説明                                 |
| -------------- | -------------------------------------------- | ------------------------------------ |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件                 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-7一覧                       |
| コード調査結果 | `outputs/phase-1/code-investigation.md`      | 現状asキャスト箇所と型定義の調査結果 |

## 完了条件

- [ ] `getSkillCreatorApi()`・`getSessionResumeApi()`のasキャスト箇所が特定されていること
- [ ] `SkillCreatorRuntimeApi`・`SessionResumeApi`の必須メソッド一覧が確認されていること
- [ ] `apps/desktop/src/preload/skill-creator-api.ts`の型定義状況が確認されていること
- [ ] 受け入れ基準AC-1〜AC-7が策定されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
