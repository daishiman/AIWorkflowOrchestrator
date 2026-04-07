# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 12                                          |
| Phase名    | ドキュメント更新                            |
| タスクID   | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001   |
| タスク名   | Skill Creator runtime channel shared 正本化 |
| 前提Phase  | Phase 11: 手動テスト                        |
| 後続Phase  | Phase 13: PR 作成                           |
| ステータス | completed                                   |
| 作成日     | 2026-04-06                                  |

## 目的

implementation guide・spec sync・未タスク・feedback を完了し、Phase 12 の 5 タスクを全て実行する。

## 背景

`SKILL_CREATOR_RUNTIME_CHANNELS` の shared 正本化と `apps/desktop/src/preload/channels.ts` の import 切り替えについて、ドキュメントレベルで記録・総括を行い、後続作業者への引き継ぎ資料を整備する。

## Phase 12 記録分離方針（plan/current fact 分離）

- 成果物に「予定・計画（plan）」と「実際の結果（current fact）」を混在させない
- 各成果物は実行後の事実のみを記録する
- plan は仕様書（本ファイル）に記載し、outputs/ 配下の成果物は current fact のみとする

## 実行タスク

### タスク1: 実装ガイド作成

**目的**: 実装内容を技術者・非技術者の両方が理解できる形で文書化する

**Part 1: 中学生レベルの概念説明**

- なぜこの変更が必要だったのか、背景を非技術者でも分かる言葉で説明する
- 「電話帳への内線番号追加」の例え話を使い、channel の概念を伝える（既存実装ガイドの例を踏襲）
  - 例: 「アプリの各部屋が連絡を取り合うために使う『内線番号』が、部屋ごとに個別のメモに書かれていた状態から、全員が共有できる『共通の電話帳』に移した」
- Part 1 では技術用語の使用を最小限に抑える
- 今回作ったもの（成果物の概要）を平易に説明する

**Part 2: 技術詳細**

- `SKILL_CREATOR_RUNTIME_CHANNELS` の TypeScript 定義を記載する
- 使用例（コードスニペット）を示す：
  - shared 側での定義方法
  - preload 側での import・使用方法
  - cross-layer parity テストの書き方
- エラーハンドリングの方針を記述する（import パス誤り、循環依存等）
- エッジケース（channel 未定義・重複定義・typo）を記述する
- 設定項目と定数一覧（3 チャンネルの文字列値）を表形式で示す

**成果物**: `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新

**目的**: Step 1-A〜1-C と Step 2 の実施結果を、正本仕様書の更新有無と合わせて記録する

**Step 1-A: 完了タスク記録**

- 本タスク（UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001）の完了を記録する
- 関連ドキュメント（shared channels、preload channels、governance test）へのリンクを付ける
- 関連テスト（`apps/desktop/src/preload/channels.test.ts`）へのリンクを付ける
- `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` を同一ターンで更新する
- `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の変更履歴を同一ターンで更新する
- `topic-map.md` を再生成して、関連セクションの行番号を同期する

**Step 1-B: 実装状況テーブル更新**

- `SKILL_CREATOR_RUNTIME_CHANNELS` の 3 チャンネルの shared 側定義ステータスを「完了」に更新する
- `apps/desktop/src/preload/channels.ts` の import 元変更ステータスを「完了」に更新する

**Step 1-C: 関連タスクテーブル更新**

- TASK-SDK-07 との関連を記録する
- 前タスク（#1696 / step-ut-sdk-07-shared-ipc-channel-contract）との関連を記録する
- 後続タスク（もしあれば）との関連を記録する

**Step 2: ドメイン仕様更新（要再判定）**

- 新規 exported constants `SKILL_CREATOR_RUNTIME_CHANNELS` の追加により、semantic 変更の有無を canonical spec に限定して再判定する
- `resource-map.md` / `topic-map.md` / `api-ipc-system-core.md` / `quick-reference.md` で current canonical の到達先を確認する
- `security-*` は allowlist セマンティクスが変わる場合にのみ判定対象にする
- 更新の有無にかかわらず `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して index/topic-map を同期する
- 更新不要の場合はその理由を `system-spec-update-summary.md` に明記する

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

---

### タスク3: ドキュメント更新履歴作成

**目的**: 変更履歴と validator 実行結果を、後続の監査が辿れる形で記録する

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md` のテンプレートを使用する
3. 変更者・関連 Issue / PR・validator 実行結果・current / baseline・artifacts 同期結果を記録する
4. 変更したファイル一覧と更新不要だったファイルの理由を記録する
5. `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` / `topic-map.md` の同期結果を記録する

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成

**目的**: 未割り当てタスクを検出する（0 件でも必ず出力する）

**検出ソース**:

- スコープ外項目（Phase 1 で定義）
- Phase 3 / Phase 10 の MINOR 発見事項
- Phase 11 の発見事項
- コード内の TODO / FIXME / HACK / XXX コメント

**4 つの検出パターン**:

1. type → impl: 型定義はあるが実装がないもの
2. contract → test: 契約はあるがテストがないもの
3. UI spec → component: UI 仕様はあるがコンポーネントがないもの
4. spec inconsistency → decision: 仕様間の矛盾で決定が必要なもの

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

> **注記**: 0 件でも出力必須。1 件以上の場合は `docs/30-workflows/unassigned-task/` に指示書を作成し、`task-workflow.md` と関連仕様書へのリンクを記録する。

---

### タスク5: スキルフィードバックレポート作成

**目的**: 本タスク実行を通じた知見を次のタスクへ引き継ぐ（改善点なしでも必ず出力する）

**カテゴリ**:

1. テンプレート改善: Phase 仕様書テンプレートの改善提案
2. ワークフロー改善: Phase 実行フローの改善提案
3. ドキュメント改善: ドキュメント構造・内容の改善提案
4. ポジティブ発見: うまく機能した点の記録

**成果物**: `outputs/phase-12/skill-feedback-report.md`

> **注記**: 改善点なしでも出力必須。その理由と再発防止の観点を記録する。

---

### 最終: Phase 12 準拠チェック

**目的**: Task 1〜5 と Step 1-A〜1-C / Step 2 の準拠状況を 1 ファイルに集約する

**実行手順**:

1. `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する
2. `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` を使用して、成果物の存在だけでなく内容要件も確認する
3. `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の 5 成果物を突合する
4. validator・未タスク監査・artifacts parity・mirror parity・保留表現ゼロ化を記録する

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 参照資料                    | パス                                                                                        | 用途                          |
| --------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 11 手動テスト結果     | `outputs/phase-11/manual-test-result.md`                                                    | 実装内容の確認                |
| Phase 11 発見課題           | `outputs/phase-11/discovered-issues.md`                                                     | 未タスク入力                  |
| Phase 12 ドキュメントガイド | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | 実装ガイド・完了条件の基準    |
| 完了条件チェックリスト      | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md`     | 成果物・同期要件の確認        |
| 仕様更新ワークフロー        | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1-A〜1-C / Step 2 の確認 |
| compliance テンプレート     | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | root evidence 作成基準        |
| changelog テンプレート      | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`      | changelog 作成テンプレート    |
| resource map                | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | canonical 逆引き              |
| topic map                   | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                               | 行番号・セクション参照        |
| shared channels             | `packages/shared/src/ipc/channels.ts`                                                       | shared 側チャンネル定義       |
| desktop channels            | `apps/desktop/src/preload/channels.ts`                                                      | preload 側チャンネル          |
| desktop allowlist test      | `apps/desktop/src/preload/channels.test.ts`                                                 | runtime allowlist 回帰確認    |

## 成果物

| 成果物                 | パス                                                     | 内容                                   |
| ---------------------- | -------------------------------------------------------- | -------------------------------------- |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`               | Part 1（概念説明）/ Part 2（技術詳細） |
| 仕様更新サマリー       | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C / Step 2 記録            |
| ドキュメント変更履歴   | `outputs/phase-12/documentation-changelog.md`            | 変更一覧・changelog                    |
| 未タスク検出レポート   | `outputs/phase-12/unassigned-task-detection.md`          | 未割り当てタスクの有無と対応           |
| フィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 知見と改善提案                         |
| 準拠チェック           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 5 成果物の root evidence               |

## 完了条件

- [ ] タスク1: `implementation-guide.md` が Part 1（中学生レベル概念説明・「電話帳」の例え）/ Part 2（`SKILL_CREATOR_RUNTIME_CHANNELS` TypeScript 定義・使用例）で生成されている
- [ ] タスク2: `system-spec-update-summary.md` が Step 1-A/1-B/1-C/Step 2 で生成されている
- [ ] タスク3: `documentation-changelog.md` が生成されている
- [ ] タスク4: `unassigned-task-detection.md` が生成されている（0 件でも出力）
- [ ] タスク5: `skill-feedback-report.md` が生成されている（改善点なしでも出力）
- [ ] `phase12-task-spec-compliance-check.md` が作成されている
- [ ] 5 タスク全て完了
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 依存関係

| 依存 Phase | 依存成果物                               |
| ---------- | ---------------------------------------- |
| Phase 11   | `outputs/phase-11/manual-test-result.md` |
| Phase 11   | `outputs/phase-11/discovered-issues.md`  |

## 次のPhase

Phase 13: PR 作成 → `phase-13-pr-creation.md`
