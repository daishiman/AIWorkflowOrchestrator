# TASK-P0-06: conversational-interview-ui

## 概要

スキルクリエイターの UX をフォームベースからチャット風の会話型インタビューに刷新する。SkillCreatorWorkflowEngine の plan フェーズと連携し、ユーザーの熟練度に応じた段階的質問フローを提供する。single_select / multi_select / free_text / confirm / secret の全 UserInputKind を統合し、初心者からエンジニアまで対応する適応型 UI を実現する。

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| タスクID   | TASK-P0-06                                                   |
| タスク種別 | 機能追加                                                     |
| 優先度     | P0 (High)                                                    |
| ステータス | completed                                                    |
| 上流ゲート | なし                                                         |
| 依存タスク | TASK-RT-04 (API キー管理 UI), TASK-RT-05 (multi_select 対応) |
| 後続タスク | なし                                                         |
| 作成日     | 2026-03-29                                                   |
| 更新日     | 2026-03-30                                                   |

## 受入基準

| ID    | 基準                                                                                      |
| ----- | ----------------------------------------------------------------------------------------- |
| AC-1  | チャット風 UI コンポーネントが表示され、質問→回答の会話フローが動作する                   |
| AC-2  | 全 UserInputKind (single_select, multi_select, free_text, confirm, secret) が UI 上で動作 |
| AC-3  | インタビュー進捗インジケーターが表示され、完了率がリアルタイムで更新される                |
| AC-4  | 前の回答に戻る（undo）操作が可能                                                          |
| AC-5  | ユーザー熟練度（初心者/エンジニア）に応じた質問粒度の適応が動作する                       |
| AC-6  | インタビュー中の一時状態が維持され、同一アプリセッション内で画面再描画後も継続できる      |
| AC-7  | SkillCreatorWorkflowEngine の plan フェーズと IPC 経由で正しく連携する                    |
| AC-8  | `single_select` はラジオボタンまたは選択チップとして、1クリックで選択できる               |
| AC-9  | `multi_select` はチェックボックスリストとして、複数候補を直感的にトグルできる             |
| AC-10 | `confirm` は Yes/No の2択CTAとして表示され、選択結果が即時反映される                      |
| AC-11 | `free_text` はインラインテキスト入力で、その場で入力・送信できる                          |
| AC-12 | `secret` はマスク付き入力で表示/非表示切り替えを備える                                    |
| AC-13 | マウス操作とキーボード操作の両方で回答可能である                                          |

## スコープ

**含む**:

- 会話型インタビュー UI コンポーネント（チャットバブル形式）
- ステップバイステップの質問フロー制御
- 全 UserInputKind に対応する入力ウィジェット
- `single_select` 用のラジオボタンまたは選択チップ UI
- `multi_select` 用のチェックボックスリスト UI
- `confirm` 用の Yes/No CTA UI
- `free_text` 用のインラインテキスト入力 UI
- `secret` 用のマスク付き入力 UI（表示/非表示切り替え）
- インタビュー進捗インジケーター
- 回答の undo/back 機能
- ユーザー熟練度に応じた適応ロジック
- インタビュー中の一時状態保持（同一アプリセッション内）
- SkillCreatorWorkflowEngine との IPC 連携
- キーボード操作とクリック操作の両対応

**含まない**:

- SkillCreatorWorkflowEngine の内部ロジック変更（質問生成ロジックは既存）
- multi_select の型定義追加（TASK-RT-05 の責務）
- アプリ再起動をまたぐセッション復元 UI / 永続化（TASK-P0-08 の責務）
- スキルファイル書き出し（TASK-P0-05 の責務）
- LLM アダプターのエラーハンドリング（TASK-RT-01 の責務）

## 依存関係

| 種別        | 参照先                           | 役割                                             | 開始条件/影響                                  |
| ----------- | -------------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| predecessor | TASK-RT-04                       | API キー設定導線と認証前提 UX                    | 未完了の場合は UI 導線が成立しないため着手不可 |
| predecessor | TASK-RT-05                       | multi_select UserInputKind の型と UI             | 型と UI contract の前提が欠けるため着手不可    |
| upstream    | `../root-workflow-pack/index.md` | lane 共通不変条件と責務分離方針                  | 依存マトリクスと責務境界の正本                 |
| downstream  | なし                             | session 永続化やファイル出力は別タスク境界で管理 | scope からは除外し、境界だけ明示する           |
| parallel    | なし                             | 現時点の並列対象は未確定                         | 依存が確定した場合は Phase 1 で更新する        |

## 現行コードアンカー

| ファイル                                                               | 現状の役割                                | TASK-P0-06 での扱い                    |
| ---------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | 既存のスキル作成 UI パネル                | 会話型 UI コンポーネントを追加・統合   |
| `apps/desktop/src/renderer/components/skill/`                          | スキル関連 UI コンポーネントディレクトリ  | 新規コンポーネントを配置               |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 質問生成・フロー制御のステートマシン      | 変更なし（IPC 経由で質問を取得）       |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | Facade パターンによるオーケストレーション | submitUserInput の呼び出し元として利用 |
| `packages/shared/src/types/skillCreator.ts`                            | UserInputKind 等の型定義                  | 型を import して使用                   |
| `apps/desktop/src/preload/skill-creator-api.ts`                        | preload API 定義                          | 必要に応じて会話状態取得 API を追加    |

## Current Canonical Facts From Branch

- `UserInputKind` の対象は `single_select` / `multi_select` / `free_text` / `confirm` / `secret` を前提とする
- 質問生成と進行の owner は `SkillCreatorWorkflowEngine`、Renderer は表示・入力・一時状態保持に責務を限定する
- `submitUserInput` は `RuntimeSkillCreatorFacade` 経由の IPC 連携を前提とする
- セッション跨ぎの永続化/復元は本タスク外（`TASK-P0-08` の責務）であり、対象は同一セッション内に限定する
- `multi_select` の型定義は `TASK-RT-05` が供給済みであることを前提にする

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | UI刷新そのものではなく、会話入力の契約と状態所有権を固定し、Renderer/Preload/Main/Shared の責務境界を誤らせないこと                                               |
| 依存関係・責務境界   | Renderer は表示/入力/一時状態、Main は質問生成/進行、Shared は型、Preload は IPC surface。永続化/再起動復元は `TASK-P0-08` に分離し本タスクから除外する           |
| 価値とコストの不均衡 | UIの詳細記述を増やすほどコストが増大するため、見た目ではなく入力契約/状態境界/IPC連携を先に固定し、UI表現は最小限の拘束に留める                                   |
| 改善優先順位         | 1. 入力種別ごとの契約表 2. 会話状態コントラクト 3. IPC/Preload 境界 4. UI合成 5. 進捗/undo 6. キーボード/アクセシビリティ 7. 永続化は別タスクへ分離               |
| 4条件評価            | 価値性: 高（UX直結）/ 実現性: 中（Renderer集中）/ 整合性: 状態所有権を分離することで担保 / 運用性: Phase 11 evidence と Phase 12 close-out を前提に運用可能にする |

### 因果ループ（補足）

- 契約不足 → 実装判断のばらつき増 → Phase 12 の仕様更新範囲が肥大 → ドリフト → 追加契約が必要になる
- 依存未確定 → UI詳細先行 → upstream 変更で再修正 → phase gate の遅延

### 戦略仮説（補足）

- 契約 first で状態境界を固定し、UI表現は最小拘束に留めることで、spec_created の監査性と実装自由度を両立する

### KJ法クラスタ（補足）

- 契約/状態所有権
- UI挙動/入力体験
- 検証/close-out
- 依存境界/未タスク

## ディレクトリ構成

```text
step-09-par-task-p0-06-conversational-interview-ui/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
```

## outputs/ 想定成果物

```text
outputs/
├── artifacts.json
├── verification-report.md
├── phase-1/spec-extraction-map.md
├── phase-1/scope-definition.md
├── phase-2/conversation-state-contract.md
├── phase-2/input-widget-contract-matrix.md
├── phase-3/design-review-gate.md
├── phase-3/skill-compliance-and-elegance-review.md
├── phase-4/test-matrix.md
├── phase-7/coverage-report.md
├── phase-7/integration-test.md
├── phase-11/manual-test-checklist.md
├── phase-11/manual-test-result.md
├── phase-11/manual-test-report.md
├── phase-11/discovered-issues.md
├── phase-11/screenshot-plan.json
├── phase-12/implementation-guide.md
├── phase-12/system-spec-update-summary.md
├── phase-12/documentation-changelog.md
├── phase-12/unassigned-task-detection.md
├── phase-12/skill-feedback-report.md
├── phase-12/phase12-task-spec-compliance-check.md
├── phase-13/local-check-result.md
└── phase-13/change-summary.md
```

## 実装者向けクイックガイド

### 着手条件

- TASK-RT-04 が完了し API キー設定導線が利用可能
- TASK-RT-05 が完了し multi_select UserInputKind が利用可能
- `SkillLifecyclePanel.tsx` の現行 UI 構造を読了している
- `SkillCreatorWorkflowEngine` の plan フェーズの質問生成ロジックを把握している
- `submitUserInput` IPC の呼び出しフローを把握している

### 想定変更ポイント

- `apps/desktop/src/renderer/components/skill/` — 会話型 UI コンポーネント新規作成
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — 会話 UI コンポーネントの統合
- `apps/desktop/src/preload/skill-creator-api.ts` — 会話状態取得 API（同一セッション内の一時状態のみ）
- `packages/shared/src/types/skillCreator.ts` — インタビュー状態型の追加（同一セッション内の一時状態のみ）
- 選択チップ / ラジオ / チェックボックス / YesNo CTA / secret input の各 UI 部品

### 非対象

- SkillCreatorWorkflowEngine の質問生成ロジック変更
- multi_select 型定義（TASK-RT-05）
- アプリ再起動をまたぐセッション復元 UI / 永続化（TASK-P0-08）
- ファイル書き出し（TASK-P0-05）

### 完了イメージ

- チャットバブル形式で質問→回答が表示される
- `single_select` はラジオボタンまたは選択チップで1クリック選択できる
- `multi_select` はチェックボックスリストで複数選択できる
- `confirm` は Yes/No CTA で選択できる
- `free_text` はその場で入力・送信できる
- `secret` はマスク付きで安全に入力できる
- 進捗バーでインタビューの完了度がわかる
- 「戻る」ボタンで前の回答を修正できる
- 初心者モードでは詳しい説明付き、エンジニアモードでは簡潔な質問

### 並列実行メモ

- TASK-P0-06 は TASK-RT-04 / TASK-RT-05 完了後に着手
- レンダラー側のみの変更のため、他の main プロセス系タスクとの競合は少ない
- `SkillLifecyclePanel.tsx` の編集は TASK-RT-03 / TASK-P0-08 と競合する可能性あり

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed   |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed   |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed   |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed   |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed   |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed   |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed   |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed   |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed   |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed   |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | pending     |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | in_progress |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked     |
