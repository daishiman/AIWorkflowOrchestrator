# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                                        |
| Phase      | 3                                                              |
| Phase名    | 設計レビュー                                                   |
| 依存成果物 | `phase-1-requirements.md`（完了）、`phase-2-design.md`（完了） |
| 成果物パス | `outputs/phase-3/design-review-report.md`                      |
| ブロック先 | Phase 4（テスト作成）                                          |
| 作成日     | 2026-03-16                                                     |

---

## 目的

信頼境界設計（PermissionResolver、承認履歴、危険度表示、公開前安全性ゲート）が以下の両極を避けられているかを検証する。

- **厳しすぎて使えない**: 権限確認が多すぎてユーザーが操作を諦める
- **緩すぎて危険**: 危険操作が無確認で実行できる抜け穴がある

受入基準 AC-1〜AC-4 を設計成果物が満たすか判定し、Phase 4 進行の可否を確定する。

---

## 実行タスク

- レビュー判定実施: 6観点のチェックを完了し、PASS/MINOR/MAJORを確定する
- 指摘整理: MINOR/MAJOR を未タスクまたは差し戻し条件へ変換する

### Task 1: 観点別レビューと判定

### Task 2: MINOR/MAJOR 指摘の記録と次Phase可否判定

1. Phase 2 設計成果物の全レビュー観点チェック（6観点、各観点で PASS/MINOR/MAJOR を判定）
2. simpler alternative の検討結果を記録する
3. レビューゲート判定を確定し `design-review-report.md` に記録する
4. MINOR 指摘がある場合は未タスク化の要否を判断する
5. Phase 4 開始条件の充足確認

---

## 参照資料

| 参照資料                      | パス                                                                                                  | 用途                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------- |
| phase-1-requirements.md       | `./phase-1-requirements.md`                                                                           | 受入基準 AC-1〜AC-4 の照合 |
| phase-2-design.md             | `./phase-2-design.md`                                                                                 | レビュー対象の設計成果物   |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                       | 実行安全性の基準値         |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                  | PermissionResolver 契約    |
| ui-ux-settings                | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                 | 権限履歴パネルの既存仕様   |
| task-03設計                   | `../../../completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/phase-2-design.md`          | lifecycle 統合前提         |
| task-05設計                   | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md` | 利用導線前提               |

---

## レビュー観点

### 観点 1: 権限境界の適切さ（AC-1 対応）

**チェック項目:**

- [ ] リスクレベルが Critical / High / Medium / Low の 4 段階で定義されている
- [ ] 各リスクレベルに対して「必須の権限確認方式」が 1 対 1 で割り当てられている（例: Critical = 明示的な確認ダイアログ必須）
- [ ] 「危険操作」の定義が具体的な操作名または API パターンで列挙されている（例示表現に依存しない）
- [ ] リスクレベルが設定されていない操作カテゴリが存在しないことを確認している

**MAJOR 判定条件:** 上記 4 項目のうち 2 項目以上が未定義

### 観点 2: UX とセキュリティのバランス（AC-1、AC-3 対応）

**チェック項目:**

- [ ] 同一セッション内での権限確認頻度に上限または免除ルールが定義されている（例: 恒久許可後は再確認不要）
- [ ] 権限確認ダイアログにキャンセル・拒否・今回のみ・恒久許可の 4 選択肢が全て存在する
- [ ] 拒否時のフォールバック動作（abort / retry / 別 UI へ誘導）が各リスクレベル別に定義されている
- [ ] セキュリティ上必須の権限確認を「バイパスする設計」が存在しないことを確認している

**MAJOR 判定条件:** バイパス設計が存在する、またはフォールバック動作が未定義

### 観点 3: 既存契約との整合性

**チェック項目:**

- [ ] `PermissionResolver` の引数型・戻り値型が `interfaces-agent-sdk-executor.md` の定義と一致している
- [ ] `PermissionStore`（承認履歴の永続化）のスキーマが `ui-ux-settings.md` の Permission History Panel と整合している
- [ ] Permission History Panel の表示項目と永続化スキーマの項目が 1 対 1 で対応している
- [ ] 既存の `security-skill-execution.md` に記載のセキュリティ制約を設計が破っていない

**MAJOR 判定条件:** インターフェース型に不一致がある

### 観点 4: Task-03/05/08 との接続整合性（AC-3、AC-4 対応）

**チェック項目:**

- [ ] Task-03（スキル実行統合）の実行フロー上のどのステップで権限確認が発火するかが定義されている
- [ ] Task-05（利用導線）の UIイベントから PermissionResolver の呼び出しまでのデータフローが設計されている
- [ ] Task-08（公開前安全性チェック）に渡す「安全性判定の結果型」が定義されている
- [ ] Task-08 が受け取る結果型の必須フィールドに抜け（null になりうるが考慮されていない箇所）がない

**MAJOR 判定条件:** Task-08 に渡す結果型が未定義、または Task-03 の呼び出しポイントが未定義

### 観点 5: 失効・取り消しの完全性（AC-2 対応）

**チェック項目:**

- [ ] 恒久許可の失効条件（例: スキル更新時、N日経過後）が明示されている
- [ ] ユーザーが手動で承認を取り消す手順が定義されている（UI 上の操作フロー含む）
- [ ] 承認取り消し後のアプリケーション状態遷移（再確認要求 or 即座に権限なしに戻る）が定義されている
- [ ] 承認履歴の保持期間と削除ポリシーが定義されている

**MAJOR 判定条件:** 失効条件または手動取り消し手順のどちらかが未定義

### 観点 6: simpler alternative の検討（設計品質）

**チェック項目:**

- [ ] 「リスクレベル 4 段階より単純な 2 段階（危険/安全）」を検討し、採用/不採用の理由が記録されている
- [ ] 「承認履歴の永続化なし（セッションのみ）」を検討し、採用/不採用の理由が記録されている
- [ ] 「Task-08 への安全性ゲートなしで直接公開」を検討し、不採用とした理由が記録されている

**MINOR 判定条件:** 検討記録が存在しない（設計の意図が不透明）

---

## レビューゲート判定基準

| 判定              | 条件                                                                          | 対応                          |
| ----------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| PASS              | 全 6 観点で MAJOR なし、かつ MINOR が 2 件以下                                | Phase 4 へ進む                |
| MINOR             | MAJOR なし、かつ MINOR が 3〜5 件                                             | 指摘を未タスク化後 Phase 4 へ |
| MAJOR（要件問題） | 観点 1・観点 5 で MAJOR（AC-1 または AC-2 の受入基準を充足できない）          | Phase 1 へ戻る                |
| MAJOR（設計問題） | 観点 2・観点 3・観点 4 で MAJOR（設計が既存契約と不整合、またはバイパスあり） | Phase 2 へ戻る                |

**Phase 13 blocked 条件:** Phase 3 で MAJOR 判定のまま未解決のレビュー指摘が残る場合、Phase 13（PR 作成）は開始禁止。

---

## 実行手順

### Step 1: 成果物の読み込み（並列実行可）

1. `phase-1-requirements.md` を読み込み、受入基準 AC-1〜AC-4 を抽出する
2. `phase-2-design.md` を読み込み、設計成果物の全セクションを把握する
3. `interfaces-agent-sdk-executor.md` と `ui-ux-settings.md` を読み込み、既存契約を把握する

### Step 2: 観点別チェック実行

各観点（1〜6）について以下を実行する:

1. チェック項目を 1 つずつ確認する
2. 各チェック項目に対して PASS / MINOR / MAJOR を判定する
3. MINOR または MAJOR の場合、具体的な不足箇所（ファイル名 + セクション名）を記録する

### Step 3: simpler alternative の検討記録

観点 6 のチェック項目に対応する検討を実施し、採用/不採用の理由を 1〜3 文で記録する。

### Step 4: 総合判定の確定

全観点の結果を集計し、レビューゲート判定基準に従って PASS / MINOR / MAJOR を確定する。

### Step 5: 成果物の作成

`outputs/phase-3/design-review-report.md` を以下の構成で作成する:

- 総合判定（PASS / MINOR / MAJOR）
- 観点別判定結果一覧（表形式）
- MINOR/MAJOR 指摘の詳細（指摘ID、観点番号、不足内容、対応要否）
- simpler alternative 検討記録
- Phase 4 開始条件の充足確認結果

### Step 6: MINOR 指摘の未タスク化

MINOR 指摘が 1 件以上ある場合、各指摘を Phase 4 開始後に対応する未タスクとして記録する（`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-3/minor-tasks.md`）。

---

## 統合テスト連携

本 Phase は設計レビューのため実装テストは実施しない。以下の「レビュー検証」を Phase 4 テスト設計へ引き継ぐ。

| 連携項目                   | 引き継ぎ先                                 | 完了条件                                   |
| -------------------------- | ------------------------------------------ | ------------------------------------------ |
| AC-1〜AC-4 判定結果        | `outputs/phase-4/test-matrix.md`           | 全 AC の PASS/MINOR/MAJOR が転記されている |
| MINOR 指摘一覧             | `outputs/phase-3/minor-tasks.md`           | Phase 4 で対応要否が明示されている         |
| Task-03/05/08 接続ギャップ | `outputs/phase-4/integration-test-plan.md` | 接続ギャップの検証ケースが作成されている   |

---

## 成果物

| 成果物名                 | パス                                                                                    | 形式     |
| ------------------------ | --------------------------------------------------------------------------------------- | -------- |
| 設計レビューレポート     | `outputs/phase-3/design-review-report.md`                                               | Markdown |
| MINOR 指摘未タスクリスト | `outputs/phase-3/minor-tasks.md`（MINOR 指摘が 0 件の場合も「指摘なし」として作成する） | Markdown |

---

## 完了条件

- [ ] `outputs/phase-3/design-review-report.md` が作成されている
- [ ] `outputs/phase-3/minor-tasks.md` が作成されている（0 件でも必須）
- [ ] 総合判定が PASS または MINOR（MAJOR は Phase 4 進行禁止）
- [ ] simpler alternative の検討記録が report に含まれている
- [ ] MAJOR 判定の場合、戻り先 Phase（1 または 2）が明記されている

---

## タスク100%実行確認【必須】

以下を全て確認してから「完了」と記録すること。

- [ ] 全 6 観点の全チェック項目（計 23 項目）を確認した
- [ ] 観点別判定結果を `design-review-report.md` に記録した
- [ ] simpler alternative 3 件の検討記録を記載した
- [ ] MINOR 指摘件数にかかわらず `minor-tasks.md` を作成した
- [ ] Phase 4 開始条件（PASS または MINOR）の充足を確認した
- [ ] MAJOR 判定の場合は戻り先 Phase を明記して Phase 4 開始を停止した

---

## 次Phase

| 条件                  | 次の行動                                                                              |
| --------------------- | ------------------------------------------------------------------------------------- |
| PASS                  | Phase 4（テスト作成）へ進む                                                           |
| MINOR（未タスク化済） | MINOR 指摘を `minor-tasks.md` に記録後、Phase 4（テスト作成）へ進む                   |
| MAJOR（要件問題）     | Phase 1（要件定義）へ戻り、AC-1 または AC-2 の定義を修正してから Phase 2 を再実行する |
| MAJOR（設計問題）     | Phase 2（設計）へ戻り、観点 2・3・4 の指摘箇所を修正してから Phase 3 を再実行する     |
