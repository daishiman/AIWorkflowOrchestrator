# Phase 12: スキルフィードバックレポート

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 12                                             |
| 作成日   | 2026-04-07                                     |

---

## フィードバック概要

| カテゴリ       | 件数 |
| -------------- | ---- |
| 設計改善提案   | 2件  |
| テスト実行環境 | 1件  |
| スキルプロセス | 2件  |

---

## フィードバック詳細

### FB-01: vitest.config.ts の `@repo/shared` resolve alias 標準化

**発見フェーズ**: Phase 11  
**内容**: `packages/shared/` 内のテストファイルが `@repo/shared` をインポートする場合、`vitest.config.ts` に `resolve.alias` が必要だが、この設定が標準テンプレートに含まれていなかった。  
**影響**: フックによる自動 import パス変換後にテストが解決不可になる。  
**改善案**: `packages/shared/vitest.config.ts` テンプレートに `resolve.alias` を標準で含める。

### FB-02: post-tool-use フックによるテストファイル改変の検出

**発見フェーズ**: Phase 11  
**内容**: ESLint フックが import パスを `../smartDefaultReasoningService` から `@repo/shared` へ自動変換した。また別のフックがテストケースの入力値を変更したが、期待値が更新されず矛盾が発生した。  
**影響**: テスト件数が 0件として扱われ、フォールバックテストが意味の異なる仕様を検証するものになった。  
**改善案**: フックが変更したテストファイルの diff を人間がレビューする手順をワークフローに組み込む。

### FB-03: AC-4 フォールバック仕様の明確化

**発見フェーズ**: Phase 4〜11  
**内容**: AC-4「推論不能時のフォールバック」において、`purpose` が空でも `category` が有効な場合に `format` を推論するか否かが仕様書内で一度揺れた（フック改変が引き金）。  
**影響**: テスト #27 の期待値が一時的に test #17 と矛盾した。  
**改善案**: 各フィールドの独立推論性をフォールバック定義に明示する。現状の実装（`purpose` と `category` は完全独立）を仕様書テンプレートに反映する。

### FB-04: workflow ledger と lane index の same-wave 同期を明文化

**発見フェーズ**: Phase 12  
**内容**: `task-workflow-backlog.md` は「completed へ移管済みで backlog エントリなし」という扱いだが、`task-workflow-completed.md` / `skill-wizard-redesign-lane/index.md` / `artifacts.json` の同期関係を明示しないと、次回の close-out で同じ見落としが再発しやすい。  
**影響**: 仕様書・台帳・lane index の片側更新が発生しやすくなる。  
**改善案**: Phase 12 の完了条件に「lane index / backlog / artifacts parity を同波で更新する」を追加する。

### FB-05: 33件テストと edge case を検証証跡へ固定する

**発見フェーズ**: Phase 12  
**内容**: `purpose` が空白のみのケースは空文字と同一視する実装へ収束したが、その判断が `implementation-guide.md` / `manual-test-result.md` / `unassigned-task-detection.md` に分散している。  
**影響**: 既存の件数表記のズレや未検出の edge case が残ると、後続レビューで false green を起こしやすい。  
**改善案**: Phase 11 証跡と Phase 12 ガイドに「空白のみ purpose は空文字扱い」「テスト 33件」の2点を明文化し、検証経路を一本化する。

---

## 結論

5件の改善提案を記録した。いずれも次回タスクまたはスキルテンプレート改善として formalize を推奨する。本タスク自体の品質に影響する未解決事項はなし。
