# Phase 12: ドキュメント

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 12                               |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

実装内容を開発者・運用者向けにドキュメント化し、reason code カタログ・トラブルシューティングガイド・仕様書更新を行う。

## 実行タスク

- 実装ガイドを作成する（何をどう変えたか）
- reason code カタログを最終化する
- システム仕様書の更新サマリーを作成する
- 未割り当てタスクの検出結果を記録する
- スキルフィードバックレポートを作成する

## 参照資料

| 資料名              | パス                        | 説明                 |
| ------------------- | --------------------------- | -------------------- |
| index.md            | `index.md`                  | タスク概要・スコープ |
| Phase 5 実装        | `phase-5-implementation.md` | 実装内容             |
| Phase 10 レビュー   | `phase-10-final-review.md`  | AC 充足確認          |
| Phase 11 手動テスト | `phase-11-manual-test.md`   | 手動テスト結果       |

## 実行手順

### ステップ1: 実装ガイドを作成する

`{outputs/phase-12/implementation-guide.md` に以下を記載:

- **変更概要**: スタブレスポンスを明示的エラーに変換
- **変更ファイル一覧**: 型定義・Facade・IPC handler・renderer
- **reason code カタログ**: `llm_adapter_unavailable` / `resource_loader_unavailable`
- **エラーフロー図**: Facade → IPC handler → renderer のデータフロー

### ステップ2: reason code カタログを最終化する

| reason code                   | 発火条件                                                     | ユーザー向けメッセージ                               | 対処方法                         |
| ----------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------- |
| `llm_adapter_unavailable`     | `!this.llmAdapter`                                           | LLM アダプタが利用できません。設定を確認してください | API キー設定を確認               |
| `resource_loader_unavailable` | `!this.resourceLoader && !this.hasDynamicResourcePipeline()` | リソースローダーが利用できません                     | アプリを再起動、または設定を確認 |

### ステップ3: 概念説明（中学生レベル）

**「スタブレスポンスとは何か」**:

アプリが「本来やるべき処理」をできない状態のとき、空っぽのデータを返すことがあります。これを「スタブレスポンス」と呼びます。スタブレスポンスは、ユーザーから見ると「何も起きない」ように見えるため、何が問題なのかわかりません。

この改善では、空っぽのデータの代わりに「何が問題か」を伝えるエラーメッセージを返すようにしました。例えば「LLM アダプタが利用できません」というメッセージを表示することで、ユーザーは設定を確認すれば良いことがわかります。

### ステップ4: システム仕様書更新サマリーを作成する

`{outputs/phase-12/system-spec-update-summary.md` に以下を記載:

- `RuntimeSkillCreatorPlanResponse` 型に `status` / `degradedReason` / `userMessage` を追加
- `RuntimeSkillCreatorExecuteResponse` / `RuntimeSkillCreatorImproveResponse` にも同様追加
- `SkillCreatorDegradedReason` / `SkillCreatorResponseStatus` 型を新規追加
- IPC handler のエラー変換パターンを追加

### ステップ5: 未割り当てタスクの検出

- i18n 対応（follow-up task）
- degraded status のユースケース定義（follow-up task）
- `{outputs/phase-12/unassigned-task-detection.md` に記録する。

## 統合テスト連携

- Phase 13 で PR 本文にドキュメント参照を含める。

## 成果物

| 成果物               | パス                                              | 説明                         |
| -------------------- | ------------------------------------------------- | ---------------------------- |
| 実装ガイド           | `{outputs/phase-12/implementation-guide.md`       | 変更内容のガイド             |
| 仕様書更新サマリー   | `{outputs/phase-12/system-spec-update-summary.md` | 型定義・API 変更サマリー     |
| ドキュメント変更ログ | `{outputs/phase-12/documentation-changelog.md`    | ドキュメント更新一覧         |
| 未割り当てタスク検出 | `{outputs/phase-12/unassigned-task-detection.md`  | follow-up task 一覧          |
| スキルフィードバック | `{outputs/phase-12/skill-feedback-report.md`      | 実装プロセスのフィードバック |

## 完了条件

- [ ] 実装ガイドが作成されている
- [ ] reason code カタログが最終化されている
- [ ] 概念説明（中学生レベル）が記載されている
- [ ] システム仕様書更新サマリーが作成されている
- [ ] 未割り当てタスクが検出・記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
