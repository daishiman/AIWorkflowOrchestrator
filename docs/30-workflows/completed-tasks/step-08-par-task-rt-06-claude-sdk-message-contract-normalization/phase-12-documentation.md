# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| Phase名    | ドキュメント更新                          |
| 対象機能   | claude-sdk-message-contract-normalization |
| 前提Phase  | Phase 11（手動テスト）                    |
| 後続Phase  | Phase 13（PR作成）                        |
| ステータス | pending                                   |
| 作成日     | 2026-03-29                                |

---

## 目的

SDK 正規化契約（`SkillCreatorSdkEvent`）の implementation guide 作成、システム仕様書更新、ドキュメント更新履歴、未タスク検出、スキルフィードバックの 5 タスクを完了する。

## 背景

TASK-RT-06 は Claude Code SDK の `SDKMessage` を lane 正規化イベントへ変換する契約安定化タスクである。Phase 12 では実装成果を仕様書・ガイド・監査記録として定着させ、後続タスク（RT-03, P0-05, P0-08, P0-09）が参照可能な状態にする。

---

## 実行タスク

> 以下の 5 タスクを順番に実行してください。**全て完了必須**です。

### Task 1: 実装ガイド作成（2パート構成）

**目的**: SDK 正規化契約を初学者と開発者の両方が理解できるドキュメントにする。

**実行手順**:

1. **Part 1（初学者・中学生レベル）** を作成する
   - 日常生活での例え話を**必ず**含める（例: 「翻訳機」「郵便局の仕分け」など）
   - 専門用語は使わない（使う場合は即座に説明）
   - 「なぜ SDK 正規化が必要か」を先に説明してから「何をするか」を説明
   - SDKMessage → SkillCreatorSdkEvent の変換を身近な例で解説
2. **Part 2（開発者・技術者レベル）** を作成する
   - `SkillCreatorSdkEvent` インターフェース/型定義（TypeScript）を含める
   - normalizer の API シグネチャと使用例を記載
   - `session_id` 欠損、permission denial、`system/init` 不在のエラーハンドリングを説明
   - Facade / IPC / renderer の統合ポイントと設定パラメータを一覧化

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### Task 2: システム仕様書更新（4サブステップ + 条件付き Step 2）

**目的**: タスク完了記録と実装状況をシステム仕様書へ反映する。

**実行手順**:

1. **Step 1-A**: タスク完了記録
   - 「完了タスク」セクション追加（テスト結果サマリー + 成果物テーブル）
   - 関連ドキュメントリンク追加
   - 変更履歴追加
   - LOGS.md × 2 ファイル更新（`aiworkflow-requirements/LOGS.md` + `task-specification-creator/LOGS.md`）
   - `topic-map.md` 更新
2. **Step 1-B**: 実装状況テーブル更新
   - 仕様書作成のみの場合: `spec_created` を記録
   - 実装完了の場合: 「未実装」→「完了」へ更新
3. **Step 1-C**: 関連タスクテーブル更新
   - 仕様書内の「関連タスク」「未タスク候補」テーブルのステータス更新
4. **Step 2**（条件付き）: システム仕様更新
   - 新規インターフェース追加時のみ実施（`SkillCreatorSdkEvent` 型追加がある場合は必須）
   - 既存インターフェースの変更がある場合も実施

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`

---

### Task 3: ドキュメント更新履歴作成

**目的**: 全 Step の結果を個別に記録し、変更の追跡可能性を確保する。

**実行手順**:

1. Step 1-A / 1-B / 1-C / Step 2 の各結果を個別に明記する（「該当なし」も記録）
2. `scripts/generate-documentation-changelog.js` を実行して自動生成部分を取得
3. 手動追記部分と統合する

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 残課題を漏れなく検出し、formalize する。

**実行手順**:

1. 以下のソースを確認:
   - 元タスク仕様書の「スコープ外」項目
   - Phase 3 / Phase 10 レビュー結果の MINOR 判定指摘事項
   - Phase 11 手動テストのスコープ外発見事項
   - コードコメント（TODO/FIXME/HACK/XXX）
2. 検出された未タスクを `current` と `baseline` に分離して記録
3. **0 件の場合も「0 件である」ことを明示的に出力**

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --scan packages/shared/src --output .tmp/unassigned-candidates.json
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

**目的**: タスク実行を通じて得られた skill 改善フィードバックを記録する。

**実行手順**:

1. 以下の観点で改善点を記録:
   - テンプレート改善: Phase テンプレートの漏れや曖昧さ
   - ワークフロー改善: 機械検証や手順分岐の改善余地
   - ドキュメント改善: 再利用しやすい横断ガイドライン化の候補
2. **改善点が 0 件の場合も「改善点なし」を明示的に出力**

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 資料名                      | パス                                                                                        | 説明                     |
| --------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 5 実装結果            | `phase-5-implementation.md`                                                                 | 実装成果の入力           |
| Phase 12 ドキュメントガイド | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Phase 12 詳細手順        |
| 仕様更新ワークフロー        | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1-A〜Step 2 手順    |
| 未タスクガイドライン        | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | 未タスク検出基準         |
| Phase 12 準拠チェック       | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 準拠チェックテンプレート |

---

## 成果物

| 成果物                             | パス                                                     | 説明                 |
| ---------------------------------- | -------------------------------------------------------- | -------------------- |
| implementation guide               | `outputs/phase-12/implementation-guide.md`               | Part 1/2 実装ガイド  |
| system spec update summary         | `outputs/phase-12/system-spec-update-summary.md`         | 仕様更新サマリー     |
| documentation changelog            | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴 |
| unassigned task detection          | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート |
| skill feedback report              | `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバック |
| phase12 task spec compliance check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 準拠チェック結果     |

---

## 完了条件

- [ ] Task 1: `implementation-guide.md` が Part 1（中学生レベル）/ Part 2（技術者レベル）の 2 パート構成を満たす
- [ ] Task 2: Step 1-A / 1-B / 1-C の判定が記録され、Step 2 の要否判定が完了している
- [ ] Task 3: `documentation-changelog.md` が全 Step の結果を個別に記録している
- [ ] Task 4: `unassigned-task-detection.md` が出力されている（0 件でも必須）
- [ ] Task 5: `skill-feedback-report.md` が出力されている（改善点なしでも必須）
- [ ] `phase12-task-spec-compliance-check.md` が root evidence として存在する
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 1〜5）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認（6ファイル）

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-13-pr-creation.md`
