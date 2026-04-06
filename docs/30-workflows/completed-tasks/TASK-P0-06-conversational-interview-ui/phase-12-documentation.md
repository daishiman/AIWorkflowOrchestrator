# Phase 12: ドキュメント更新 - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| Phase名    | ドキュメント更新                       |
| 前提Phase  | Phase 11（手動テスト）                 |
| 後続Phase  | Phase 13（PR作成・CI確認）             |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |
| Issue      | #1889                                  |

---

## 目的

TASK-P0-06 の実装内容を正式なプロジェクトドキュメントとして記録し、後続タスク（P0-08、RT-05）への引き継ぎ情報を整備する。未タスク（UT-P0-06-CANONICAL-SYNC-001、UT-P0-06-PHASE11-EVIDENCE-001）の検出・記録を行い、aiworkflow-requirements との仕様同期を実施する。

## 背景

会話型インタビューUIは既存コンポーネントの拡張が中心であり、変更の影響範囲が広い。以下の理由からドキュメント整備が特に重要である：

1. **5種InputKindの型マッピング**が複数ファイルに分散しており、後続開発者が全体像を把握しにくい
2. **P0-06（一時状態）とP0-08（永続状態）の責務境界**を明文化しないと、セッション復元実装時に混乱が生じる
3. **RT-05（multi_select canonical化）**が未完了であり、現状のworkaroundを記録する必要がある
4. Phase 11 で検出された Minor 問題の追跡が必要

---

## 実行タスク

### タスク1: implementation-guide.md 作成

**目的**: 実装詳細を後続開発者向けにドキュメント化する。

**記載内容**:

1. **アーキテクチャ概要**
   - コンポーネント階層図（ConversationalInterview を頂点とした階層）
   - 状態管理フロー（useInterviewState の責務と一時状態のライフサイクル）

2. **InputKind 型マッピング表**

   | InputKind     | ウィジェットコンポーネント | 送信トリガー       | ユーザーメッセージ表示形式 |
   | ------------- | -------------------------- | ------------------ | -------------------------- |
   | single_select | ChipSelector               | 送信ボタン         | 選択ラベル                 |
   | multi_select  | MultiCheckbox              | 送信ボタン         | カンマ区切りラベル         |
   | free_text     | TextArea                   | Enter / 送信ボタン | 入力テキスト               |
   | secret        | PasswordInput              | 送信ボタン         | ●●●● (マスク)              |
   | confirm       | YesNoButtons               | ボタンクリック即時 | はい / いいえ              |

3. **IPC接続フロー**
   - Renderer → Main: 回答送信パス（チャンネル名、ペイロード型）
   - Main → Renderer: 次質問・進捗更新パス
   - エラーハンドリング: safeInvoke タイムアウト、リトライポリシー

4. **APIキーガイダンスバナーの実装詳細**
   - apiKeyStatus の取得元と更新トリガー
   - RT-04 との連携ポイント

5. **中学生レベル概念説明**
   - 「会話型インタビューUI」とは何か（チャットアプリのように質問に答えていく画面）
   - 「InputKind」とは何か（質問の種類ごとに異なる入力方法）
   - 「IPC」とは何か（画面とアプリの裏側が手紙をやり取りする仕組み）
   - 「undo」とは何か（前の質問に戻ってやり直せる機能）
   - 「バリデーション」とは何か（入力内容が正しいかチェックする仕組み）

**出力先**: `outputs/phase-12/implementation-guide.md`

---

### タスク2: system-spec-update-summary.md 作成

**目的**: aiworkflow-requirements（正本仕様）との同期状況を current facts ベースで記録する。

**実行手順**:

1. `indexes/resource-map.md` で TASK-P0-06 に対応する current canonical set を特定する
2. `indexes/quick-reference.md` と `indexes/topic-map.md` で current facts の該当箇所を確認する
3. 以下の観点で同期状況を確認する：

   | 同期対象             | 正本 / current fact                                                                                                                                                                                  | 同期ステータス | 確認ポイント                                                                                               |
   | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
   | Session Bridge 型    | `packages/shared/src/types/skillCreatorSession.ts`, `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                                                       | 要確認         | `UserInputQuestion` / `UserInputAnswer` の形状                                                             |
   | Workflow UI 型・状態 | `packages/shared/src/types/skillCreator.ts`, `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                                                       | 要確認         | `SkillCreatorUserInputRequest` / `InterviewUserAnswer` / `workflowSnapshot` の所有権                       |
   | IPC チャンネル定義   | `packages/shared/src/ipc/channels.ts`, `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`, `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | 要確認         | `skill-creator:get-workflow-state` / `submit-user-input` / `workflow-state-changed` / external API channel |
   | 完了記録             | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`                    | 要確認         | TASK-P0-06 相当の current facts と Phase 12 close-out                                                      |
   | 再利用ルール         | `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-create-multi-select-kind.md`                                                                                                | 要確認         | `selectedOptionIds` 追加と `workflowSnapshot` 監視による stale state 防止                                  |

4. 差分があれば正本仕様の更新内容を提案する（直接更新は UT-P0-06-CANONICAL-SYNC-001 の責務）

**出力先**: `outputs/phase-12/system-spec-update-summary.md`

---

### タスク3: documentation-changelog.md 作成

**目的**: TASK-P0-06 で変更・追加された全ファイルの一覧を記録する。

**記載内容**:

| #   | ファイルパス                                                             | 変更種別 | 変更概要                                        |
| --- | ------------------------------------------------------------------------ | -------- | ----------------------------------------------- |
| 1   | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | 変更     | apiKeyStatusガイダンスバナー追加、InputKind統合 |
| 2   | `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`  | 変更     | undo/rollback機能追加、一時状態管理拡張         |
| 3   | `apps/desktop/src/renderer/components/skill/interview-widgets/`          | 変更     | 各InputKindウィジェットのフロー接続             |
| 4   | （Phase 4-9 で追加・変更されたファイルを網羅的に列挙）                   | -        | -                                               |

**出力先**: `outputs/phase-12/documentation-changelog.md`

---

### タスク4: unassigned-task-detection.md 作成

**目的**: TASK-P0-06 の実装過程で検出された未タスク（Unassigned Task）を記録・追跡する。

**確認対象**:

| 未タスクID                    | 内容                                                | 検出Phase | ステータス                | 対応方針                                                            |
| ----------------------------- | --------------------------------------------------- | --------- | ------------------------- | ------------------------------------------------------------------- |
| UT-P0-06-CANONICAL-SYNC-001   | aiworkflow-requirements 正本仕様との canonical 同期 | Phase 2   | 未着手                    | RT-05 完了後に実施。正本仕様の SkillCreatorUserInputKind 定義を更新 |
| UT-P0-06-PHASE11-EVIDENCE-001 | Phase 11 手動テストエビデンスの保管・整理           | Phase 11  | Phase 11 完了時に自動解決 | スクリーンショット・メタデータの永続保管先を確定                    |

**実行手順**:

1. 各未タスクのステータスを確認する
2. 未解決のものについて、担当タスク候補と優先度を記録する
3. GitHub Issue への紐付けが必要かを判断する

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

---

### タスク5: skill-feedback-report.md 作成

**目的**: TASK-P0-06 の実装を通じて得られた改善点・知見を記録する。

**記載セクション**:

1. **タスク仕様書の改善点**
   - Phase間の依存関係で不明確だった点
   - 手動テストシナリオの粒度に関するフィードバック
2. **技術的知見**
   - Electronアプリ上でのReactチャットUIパフォーマンスに関する知見
   - IPC経由のリアルタイム進捗更新の実装パターン
3. **プロセス改善提案**
   - UI task におけるスクリーンショットエビデンスの効率的な取得方法
   - 手動テストと自動テストの境界に関する提案

**出力先**: `outputs/phase-12/skill-feedback-report.md`

---

### タスク6: phase12-task-spec-compliance-check.md 作成

**目的**: タスク1〜5 の成果物がタスク仕様書の要件に準拠しているかチェックする。

**チェック表**:

| タスク# | 成果物                        | 準拠状態 | 不足事項 | 対応 |
| ------- | ----------------------------- | -------- | -------- | ---- |
| Task 1  | implementation-guide.md       | 未確認   | -        | -    |
| Task 2  | system-spec-update-summary.md | 未確認   | -        | -    |
| Task 3  | documentation-changelog.md    | 未確認   | -        | -    |
| Task 4  | unassigned-task-detection.md  | 未確認   | -        | -    |
| Task 5  | skill-feedback-report.md      | 未確認   | -        | -    |

**確認観点**:

- 中学生レベル概念説明が implementation-guide.md に含まれているか
- 全未タスクが unassigned-task-detection.md に記録されているか
- documentation-changelog.md が変更ファイルを網羅しているか

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

### Phase 10/11 MINOR追跡テーブル

Phase 10（最終レビューゲート）および Phase 11（手動テスト）で検出された Minor 問題を追跡する。

| #   | 検出Phase                      | 問題ID                    | 内容 | 優先度 | 対応状況 | 対応先タスク |
| --- | ------------------------------ | ------------------------- | ---- | ------ | -------- | ------------ |
| 1   | Phase 10（最終レビューゲート） | （Phase 10 実行時に記入） | -    | Minor  | 未対応   | -            |
| 2   | Phase 11（手動テスト）         | （Phase 11 実行時に記入） | -    | Minor  | 未対応   | -            |

Minor 問題は即時修正が不要だが、後続タスクまたは別 Issue で対応する。対応先タスクが決まり次第テーブルを更新する。

---

### 後続タスクへの引き継ぎ

#### P0-08（セッション復元）への引き継ぎ

| 引き継ぎ項目    | 内容                                                                           |
| --------------- | ------------------------------------------------------------------------------ |
| 一時状態の構造  | useInterviewState が管理する answers, currentStep, chatHistory の型定義        |
| 状態境界        | P0-06 は一時状態（メモリ上）のみ管理。永続化は P0-08 の責務                    |
| 復元ポイント    | セッション復元時に必要な最小データセット（answers + currentStep）              |
| undo との整合性 | undo 操作時の状態ロールバックは P0-06 が担当。P0-08 は復元時の初期状態設定のみ |

#### RT-05（multi_select canonical化）への引き継ぎ

| 引き継ぎ項目                | 内容                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| 現状の型定義                | P0-06 時点での multi_select の暫定型定義と workaround                         |
| canonical 化の影響          | RT-05 完了後に ConversationalInterview の multi_select 処理を更新する必要あり |
| UT-P0-06-CANONICAL-SYNC-001 | canonical 化後の正本仕様同期を実施する未タスク                                |

---

## 参照資料

| 資料                                  | パス/参照先                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 用途                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義                      | `phase-1-requirements.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | FR/NFR定義参照                 |
| Phase 2 設計                          | `phase-2-design.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | コンポーネント設計参照         |
| Phase 11 手動テスト                   | `outputs/phase-11/manual-test-report.md` / `outputs/phase-11/discovered-issues.md` / `outputs/phase-11/ui-sanity-visual-review.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | テスト結果・課題・視覚レビュー |
| aiworkflow-requirements current facts | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`, `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`, `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-create-multi-select-kind.md` | 正本仕様同期                   |
| P0-08 タスク仕様書                    | 該当ディレクトリ                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | セッション復元連携             |
| RT-05 タスク仕様書                    | 該当ディレクトリ                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | multi_select canonical化連携   |

---

## 統合テスト連携【必須】

Phase 12 はドキュメント作成フェーズのため直接的な統合テストは実施しないが、以下の確認を行う：

- **Phase 11 統合テスト結果の記録確認**: IT-01〜IT-05 の結果が `outputs/phase-11/manual-test-report.md` に記載されていることを確認
- **IPC接続フローのドキュメント正確性**: `outputs/phase-12/implementation-guide.md` に記載した IPC フローが、Phase 11 の手動統合テスト結果と整合していることを確認
- **正本仕様との差分**: `outputs/phase-12/system-spec-update-summary.md` で検出した差分が、統合テストで確認済みの実装と一致していることを確認

---

## 成果物

| 成果物           | ファイル名                                               | 説明                                                  |
| ---------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | 実装詳細・型マッピング・IPC接続・中学生レベル概念説明 |
| 仕様同期サマリー | `outputs/phase-12/system-spec-update-summary.md`         | aiworkflow-requirements との同期状況                  |
| 変更ログ         | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル一覧                                      |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | UT-P0-06-CANONICAL-SYNC-001 等の記録                  |
| 改善レポート     | `outputs/phase-12/skill-feedback-report.md`              | 改善点・知見                                          |
| 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1-5 の準拠確認                                   |

---

## 完了条件

- [ ] `outputs/phase-12/implementation-guide.md` が作成され、中学生レベル概念説明を含んでいる
- [ ] `outputs/phase-12/implementation-guide.md` に5種InputKindの型マッピング表が含まれている
- [ ] `outputs/phase-12/implementation-guide.md` にIPC接続フローが記載されている
- [ ] `outputs/phase-12/system-spec-update-summary.md` が作成され、正本仕様との差分が記録されている
- [ ] `outputs/phase-12/documentation-changelog.md` が作成され、変更ファイルが網羅されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成され、UT-P0-06-CANONICAL-SYNC-001 と UT-P0-06-PHASE11-EVIDENCE-001 が記録されている
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成され、改善点が記録されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成され、Task 1-5 の準拠状態が確認されている
- [ ] Phase 10/11 の MINOR追跡テーブルが更新されている
- [ ] P0-08 および RT-05 への引き継ぎ情報が記載されている

---

## 次のPhase

Phase 13: PR作成・CI確認に進む。Phase 12 の全成果物が完了条件を満たしていることを確認してから進行する。
