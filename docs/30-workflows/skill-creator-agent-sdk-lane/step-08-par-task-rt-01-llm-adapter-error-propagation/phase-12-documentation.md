# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 12                            |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

implementation guide（Part 1 中学生レベル概念説明 + Part 2 技術詳細）、system spec update summary、その他必須成果物を作成する。

## 実行タスク

| Task      | 名称                       | 内容                                                                              |
| --------- | -------------------------- | --------------------------------------------------------------------------------- |
| Task 12-1 | implementation guide       | Part 1: 中学生レベルの概念説明、Part 2: 技術詳細の 2 部構成で実装ガイドを作成する |
| Task 12-2 | system spec update summary | 型追加、Facade 変更、IPC 変更の exact path 付き記録                               |
| Task 12-3 | documentation changelog    | 更新ファイル、validation、current/baseline を記録する                             |
| Task 12-4 | unassigned detection       | follow-up 候補の有無を 0件でも記録する                                            |
| Task 12-5 | skill feedback report      | 2 skill への改善提案を記録する                                                    |

## 参照資料

| 資料名                | パス                           | 説明                         |
| --------------------- | ------------------------------ | ---------------------------- |
| Phase 1 要件          | `phase-1-requirements.md`      | ステータス・エラーレスポンス |
| Phase 2 設計          | `phase-2-design.md`            | Facade / IPC 設計            |
| Phase 5 実装          | `phase-5-implementation.md`    | 実装対象                     |
| Phase 6 テスト拡充    | `phase-6-test-expansion.md`    | edge case                    |
| Phase 7 coverage      | `phase-7-coverage-check.md`    | coverage 観点                |
| Phase 8 refactoring   | `phase-8-refactoring.md`       | 共通化方針                   |
| Phase 9 QA            | `phase-9-quality-assurance.md` | quality gate                 |
| Phase 10 最終レビュー | `phase-10-final-review.md`     | AC matrix                    |
| Phase 11 手動テスト   | `phase-11-manual-test.md`      | walkthrough evidence         |

## Phase 10 MINOR 追跡

| MINOR ID | 指摘内容                        | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| -------- | ------------------------------- | ------------- | ------------- | -------- | ---------- |
| なし     | Phase 10 gate で MINOR 指摘なし | --            | --            | --       | --         |

## 実行手順

### ステップ1: Task 12-1 implementation guide を作成する

**Part 1: 中学生レベル概念説明**

- 「AI にスキルを作ってもらうには、まず AI のサービスにつなぐための"鍵"（API キー）が必要です」として説明する
- 今まで: 鍵がないときにエラーが見えず、空っぽの結果が返ってきて「壊れてる？」と思ってしまう
- これから: 鍵がないときは「鍵を設定してください」と教えてくれるようになる
- 例え: レストランで注文したのに料理が来ない（今まで）→ 「申し訳ありません、材料がありません」と教えてくれる（これから）

**Part 2: 技術詳細**

- `LLMAdapterStatus` 型と状態遷移パターン
- `RuntimeSkillCreatorFacade` のステータスプロパティ設計
- `plan()` のエラーレスポンス分岐と errorCode 体系
- `ipc/index.ts` の fire-and-forget パターン維持と catch ブロック拡張
- `RuntimeSkillCreatorPlanResponse` の型拡張（後方互換）
- テスト戦略（ステータス遷移、エラーレスポンス、既存テスト互換性）

### ステップ2: Task 12-2〜12-3 を作成する

- `outputs/phase-12/system-spec-update-summary.md` に型追加・Facade 変更・IPC 変更を exact path 付きで記録する
  - `packages/shared/src/types/skillCreator.ts` — `LLMAdapterStatus` 型追加、レスポンス型拡張
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — ステータスプロパティ、`setLLMAdapterFailed()`、`plan()` エラー分岐
  - `apps/desktop/src/main/ipc/index.ts` — catch ブロック拡張
- `outputs/phase-12/documentation-changelog.md` に validation と current / baseline を記録する

### ステップ3: Task 12-4〜12-5 を作成する

- `outputs/phase-12/unassigned-task-detection.md` で follow-up 候補を記録する
  - LLMAdapter リトライロジック
  - actionable メッセージの i18n 対応
  - `execute()` / `improve()` の同様のエラーチェック
  - Discriminated union パターンへのリファクタリング
- `outputs/phase-12/skill-feedback-report.md` で `task-specification-creator` と `aiworkflow-requirements` への改善提案を記録する

## 成果物

| 成果物                     | パス                                             | 説明                              |
| -------------------------- | ------------------------------------------------ | --------------------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`       | Part 1 概念説明 + Part 2 技術詳細 |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md` | 変更対象 exact path 一覧          |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`    | 変更履歴と validation             |
| unassigned detection       | `outputs/phase-12/unassigned-task-detection.md`  | follow-up 候補                    |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`      | skill への改善フィードバック      |

## サブタスク管理

1. Phase 11 walkthrough 結果の反映
2. Task 12-1 の作成（Part 1 + Part 2）
3. Task 12-2〜12-3 の作成
4. Task 12-4〜12-5 の作成
5. 完了条件の確認

## 完了条件

- [ ] implementation guide が Part 1（中学生レベル）と Part 2（技術詳細）を含む
- [ ] system spec update summary が exact path 付きで記録されている
- [ ] follow-up 候補の有無が整理されている
- [ ] Phase 12 の必須5成果物が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認

- [ ] Task 12-1〜12-5 を更新済み
- [ ] 計画系の仮置き表現を除去済み
- [ ] current / baseline と validation 結果を記録済み
- [ ] Phase 11 walkthrough 結果と矛盾しない
