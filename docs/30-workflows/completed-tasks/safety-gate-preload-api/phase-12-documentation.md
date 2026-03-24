# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 12                         |
| 機能名   | safety-gate-preload-api    |
| タスクID | UT-06-003-PRELOAD-API-IMPL |
| 作成日   | 2026-03-23                 |
| 前提     | Phase 11 手動テスト完了    |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12 実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成

## 実行タスク

| Task      | 内容                               | 主成果物                                         |
| --------- | ---------------------------------- | ------------------------------------------------ |
| Task 12-1 | 技術ドキュメント作成（実装ガイド） | `outputs/phase-12/implementation-guide.md`       |
| Task 12-2 | システムドキュメント更新           | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴作成           | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出                       | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート作成   | `outputs/phase-12/skill-feedback-report.md`      |

- Task 12-1: 技術ドキュメント作成（実装ガイド — Part 1: 概念説明 + Part 2: 開発者向け詳細）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements 等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録 — 0件でも必須）
- Task 12-5: スキルフィードバックレポート作成（改善点なしでも必須）

## 参照資料

| 資料名                | パス                                   | 説明                   |
| --------------------- | -------------------------------------- | ---------------------- |
| Phase 10 レビュー     | `phase-10-final-review.md`             | MINOR 追跡テーブル     |
| Phase 11 手動テスト   | `phase-11-manual-test.md`              | 発見事項               |
| spec-update-workflow  | `references/spec-update-workflow.md`   | 仕様書更新手順         |
| Phase 12 テンプレート | `references/phase-template-phase12.md` | 必須タスク・成果物定義 |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`   | P1-P4, P25-P28         |

## 実行手順

### Task 12-1: 実装ガイド作成

#### Part 1: 概念説明（中学生レベル）

SafetyGate Preload API は「お店（Renderer）と工場（Main Process）の間にある受付窓口（Preload）に新しいサービス窓口を追加する」イメージ。

- **お店（Renderer）**: ユーザーが「このスキルは安全？」と質問する場所
- **受付窓口（Preload）**: 質問を工場に安全に取り次ぐ場所。ここに `evaluateSafety` 窓口を新設
- **工場（Main Process）**: 実際にスキルの安全性をチェックして結果を返す場所

たとえば、お店のお客さんが直接工場に入ると危険なので、必ず受付窓口を通す仕組みになっている。

#### Part 2: 開発者向け実装詳細

変更箇所:

1. `apps/desktop/src/preload/skill-api.ts` — `SkillAPI` interface + `skillAPI` object に `evaluateSafety` メソッド追加
2. `apps/desktop/src/preload/__tests__/skill-api.evaluateSafety.test.ts` — Preload テスト（T-1〜T-6）

設計判断:

- `safeInvoke`（ラップ形式透過）を選択。`safeInvokeUnwrap` を使用しない理由: Renderer 側で `success`/`error` を個別ハンドリングする必要があるため

### Task 12-2: システムドキュメント更新

#### Step 1-A: タスク完了記録

- [x]`aiworkflow-requirements/LOGS.md` 更新
- [x]`task-specification-creator/LOGS.md` 更新（**2ファイル両方必須** — P1, P25）
- [x]`aiworkflow-requirements/SKILL.md` 変更履歴更新
- [x]`task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル

- [x]`api-ipc-agent-core.md` の `skill:evaluate-safety` ステータスを「Main + Preload 実装済み」に更新

#### Step 1-C: 関連タスクテーブル

```bash
grep -rn "UT-06-003-PRELOAD-API-IMPL\|UT-06-003" references/
```

- [x]関連仕様書のタスクテーブルを更新

#### Step 1-D: topic-map.md 再生成

```bash
node ./.claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [x]topic-map.md が最新であることを確認

#### Step 2: システム仕様更新（該当する場合）

更新要否の判断:

| 更新必要                 | 更新不要           |
| ------------------------ | ------------------ |
| 新規インターフェース追加 | 内部実装の変更のみ |
| 既存インターフェース変更 | リファクタリング   |

#### Step 3: IPC 契約検証（IPC修正タスクのため実施）

- [x]`ipc-contract-checklist.md` Phase 1-6 を実施
  - Phase 1: チャンネル定義確認 → 完了（`channels.ts:371`）
  - Phase 2: ホワイトリスト確認 → 完了（`channels.ts:647`）
  - Phase 3: Main ハンドラ確認 → 完了（`safetyGateHandlers.ts`）
  - Phase 4: Preload API 確認 → 本タスクで追加
  - Phase 5: 型整合確認 → `SafetyGateResult` を `@repo/shared` から共有
  - Phase 6: テスト確認 → Main + Preload テスト完了

### Task 12-3: ドキュメント更新履歴

- [x]更新した全仕様書の変更内容を記録
- [x]各 Step の完了結果を詳細に記録（漏れの可視化）

### Task 12-4: 未タスク検出

- [x]`unassigned-task-detection.md` 作成（**0件でも必須**）
- [x]検出した未タスクの3ステップ完了（P3 準拠）:
  1. `docs/30-workflows/unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加

### Task 12-5: スキルフィードバックレポート

- [x]ワークフロー改善点を記録（**改善点なしでも「改善点なし」と明記** — P28 対策）
- [x]技術的教訓を記録
- [x]新規 Pitfall 候補を検討

### Phase 10 MINOR 追跡テーブル（キャリーフォワード）

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| -------- | -------- | ------------- | ------------- | -------- | ---------- |
| （なし） | -        | -             | -             | -        | -          |

## 統合テスト連携

| 確認項目              | 内容                                | 結果 |
| --------------------- | ----------------------------------- | ---- |
| IPC 契約検証          | Phase 1-6 チェックリスト完了        | PASS |
| LOGS.md 2ファイル更新 | aiworkflow-requirements + task-spec | PASS |
| topic-map.md 再生成   | generate-index.js 実行              | PASS |

## 多角的チェック観点（AIが判断）

| 観点         | 適用 | 確認内容                         |
| ------------ | ---- | -------------------------------- |
| セキュリティ | 該当 | IPC 契約検証（Step 3）           |
| API設計      | 該当 | 実装ガイドの技術詳細             |
| IPC通信      | 該当 | IPC 契約チェックリスト Phase 1-6 |

## サブタスク管理

1. 事前チェック（P1-P28 確認）
2. Task 12-1: 実装ガイド作成（Part 1 + Part 2）
3. Task 12-2: システムドキュメント更新（Step 1-A〜1-D, Step 2, Step 3）
4. Task 12-3: ドキュメント更新履歴作成
5. Task 12-4: 未タスク検出
6. Task 12-5: スキルフィードバックレポート
7. 完了条件の検証

## 成果物

| 成果物                       | パス                                             | 必須 | 説明               |
| ---------------------------- | ------------------------------------------------ | ---- | ------------------ |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`       | 必須 | Part 1 + Part 2    |
| 仕様書更新サマリー           | `outputs/phase-12/system-spec-update-summary.md` | 必須 | Step 1/2 の結果    |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`    | 必須 | 変更履歴           |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`  | 必須 | 0件でも出力        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`      | 必須 | 改善点なしでも出力 |

## 完了条件

- [x]事前チェック（P1-P28）が完了している
- [x]Task 12-1: 実装ガイド（Part 1 + Part 2）が作成されている
- [x]Task 12-2 Step 1-A: LOGS.md 2ファイル + SKILL.md 2ファイルが更新されている
- [x]Task 12-2 Step 1-B: 実装状況テーブルが更新されている
- [x]Task 12-2 Step 1-D: topic-map.md が再生成されている
- [x]Task 12-2 Step 3: IPC 契約検証が完了している
- [x]Task 12-3: ドキュメント更新履歴が作成されている
- [x]Task 12-4: `unassigned-task-detection.md` が作成されている（0件でも必須）
- [x]Task 12-5: `skill-feedback-report.md` が作成されている（改善点なしでも必須）
- [x]Phase 10 MINOR 追跡テーブルが記録されている
- [x]**本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x]本Phase内の全タスクを100%実行完了
- [x]各タスクの成果物が生成されている
- [x]Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 13: 完了・PR準備
