# Phase 11: 手動テスト - TASK-SKILL-LIFECYCLE-06「信頼・権限・ガバナンス統合」

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| タスク ID  | TASK-SKILL-LIFECYCLE-06                                                |
| Phase      | 11: 手動テスト                                                         |
| ステータス | not_started                                                            |
| 依存成果物 | `phase-10-final-review.md`（最終レビュー PASS 判定後に開始）           |
| タスク種別 | 設計タスク（実装コードなし）                                           |
| テスト方式 | 設計文書ウォークスルー + Phase11レビュー画面のスクリーンショット証跡化 |
| 作成日     | 2026-03-16                                                             |

---

## 目的

TASK-SKILL-LIFECYCLE-06 は設計専用タスクであるため、Phase 11 は以下の方針でテストを実施する。

1. **設計文書の内部整合性検証**: Phase 1 要件定義 と Phase 2 設計の間に矛盾がないことを突合確認する
2. **既存システムとの外部整合性検証**: Task-03/05/08 の設計文書と本タスク設計文書の接続点を突合確認する
3. **網羅性検証**: DANGEROUS_PATTERNS全パターン・権限状態遷移全組み合わせ・安全性チェック全ルールが設計文書に定義されていることを確認する
4. **画面証跡検証**: TCごとのレビュー画面をPNGで取得し、`manual-test-result.md` の証跡列と1対1で対応付ける

---

## 実行タスク

- 前提確認: Phase 10 判定と参照資料の実在を確認し、実行条件を固定する
- テスト実施: TC-01〜TC-07 を順にウォークスルーして判定を記録する
- 引き継ぎ整理: 発見事項を分類し、Phase 12 へ引き継ぐ

### Task 1: 事前チェックとテスト準備

### Task 2: TC-01〜TC-07 のウォークスルー実施

### Task 3: 結果記録と Phase 12 への引き継ぎ

1. テスト前提確認（Phase 10 判定、参照資料実在、出力先初期化）
2. TC-01〜TC-07 の設計文書ウォークスルー実施
3. PASS/FAIL と根拠を `outputs/phase-11/manual-test-result.md` に記録
4. 発見事項を `outputs/phase-11/discovered-issues.md` に分類記録
5. Phase 12 に引き継ぐ修正候補を優先度付きで整理

---

## 参照資料

| 資料名                        | パス                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義              | `phase-1-requirements.md`                                                                                   |
| Phase 2 設計                  | `phase-2-design.md`                                                                                         |
| Phase 3 設計レビュー          | `phase-3-design-review.md`                                                                                  |
| Phase 5 実装成果物            | `outputs/phase-5/`                                                                                          |
| Phase 6 テスト拡充成果物      | `outputs/phase-6/`                                                                                          |
| Phase 7 カバレッジ成果物      | `outputs/phase-7/`                                                                                          |
| Phase 8 リファクタ成果物      | `outputs/phase-8/`                                                                                          |
| Phase 9 QA成果物              | `outputs/phase-9/`                                                                                          |
| Phase 10 最終レビュー         | `phase-10-final-review.md`                                                                                  |
| Task-03 Phase 2 設計          | `../../../completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/phase-2-design.md`                |
| Task-05 Phase 2 設計          | `../../../completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`                |
| Task-08 Phase 1 要件定義      | `../step-06-seq-task-08-skill-publishing-version-compatibility/phase-1-requirements.md`                     |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                             |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                |
| workflow-skill-lifecycle-05   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` |
| workflow-skill-lifecycle-04   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`     |

---

## 実行手順

### Step 1: 事前準備（所要: 約15分）

1. Phase 10 最終レビューの判定結果を `phase-10-final-review.md` で確認する
   - PASS 判定でない場合はPhase 11 を開始しない（MINOR以上の指摘が残存している場合は Phase 1-5 へ差し戻し）
2. 各テストケースで参照する設計文書が全て存在することを確認する（7ファイル）
3. `outputs/phase-11/` ディレクトリを作成する（`mkdir -p outputs/phase-11/`）
4. `outputs/phase-11/manual-test-result.md` の作成を開始する

### Step 2: テストケースの実施（所要: 約120分）

以下の7テストケースを順番に実施する。各テストケースの結果（PASS/FAIL）と確認根拠を `manual-test-result.md` に記録する。

### Step 3: 発見事項の記録（所要: 約30分）

テスト実施中に発見した問題・改善点・整合性の懸念を `discovered-issues.md` に記録する。

---

## テストケース一覧

| TC    | テスト名                       | 優先度 | 確認方法                                                          | 合格基準                                         |
| ----- | ------------------------------ | ------ | ----------------------------------------------------------------- | ------------------------------------------------ |
| TC-01 | 権限確認ダイアログの設計整合性 | 必須   | Phase 2 ワイヤーフレーム vs Phase 2 型定義の突合                  | 全UIフィールドが ToolRiskConfig 型に対応している |
| TC-02 | リスクレベル分類の網羅性       | 必須   | DANGEROUS_PATTERNS 全パターン vs リスクレベル付与表の突合         | 未分類パターン = 0件                             |
| TC-03 | 権限状態遷移の完全性           | 必須   | 16組み合わせ（4リスクレベル × 4権限状態）の遷移表確認             | 未定義遷移 = 0件                                 |
| TC-04 | Task-03/05 接続の整合性        | 必須   | INS-01〜03 vs Task-03/05 設計文書の突合                           | 矛盾する定義 = 0件                               |
| TC-05 | Task-08 安全性ゲート契約       | 必須   | SafetyGatePort 型 vs Task-08 要件定義の突合                       | 必須フィールド全対応、型の不整合 = 0件           |
| TC-06 | 承認履歴の完全性               | 必須   | Phase 1 承認履歴仕様 vs Phase 2 Permission History Panel 設計突合 | 差異 = 0件                                       |
| TC-07 | 拒否 fallback の安全性         | 必須   | abort/skip/retry フロー vs 既存 PermissionResolver 実装の突合     | 矛盾 = 0件                                       |

---

## 画面カバレッジマトリクス

| TC-ID | 画面証跡                                              | 取得方法                                                             |
| ----- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| TC-01 | `screenshots/TC-01-risk-dialog-alignment.png`         | `outputs/phase-11/review-board/TC-01.html` を QuickLook でキャプチャ |
| TC-02 | `screenshots/TC-02-risk-classification-coverage.png`  | `outputs/phase-11/review-board/TC-02.html` を QuickLook でキャプチャ |
| TC-03 | `screenshots/TC-03-permission-state-transition.png`   | `outputs/phase-11/review-board/TC-03.html` を QuickLook でキャプチャ |
| TC-04 | `screenshots/TC-04-task03-05-connection.png`          | `outputs/phase-11/review-board/TC-04.html` を QuickLook でキャプチャ |
| TC-05 | `screenshots/TC-05-safety-gate-contract.png`          | `outputs/phase-11/review-board/TC-05.html` を QuickLook でキャプチャ |
| TC-06 | `screenshots/TC-06-approval-history-completeness.png` | `outputs/phase-11/review-board/TC-06.html` を QuickLook でキャプチャ |
| TC-07 | `screenshots/TC-07-abort-fallback-safety.png`         | `outputs/phase-11/review-board/TC-07.html` を QuickLook でキャプチャ |

---

## テストケース詳細

### TC-01: 権限確認ダイアログの設計整合性

**目的**: Phase 2 のワイヤーフレーム設計と ToolRiskConfig 型定義が完全に対応していることを確認する。

**確認手順**:

1. Phase 2 `outputs/phase-2/risk-level-design.md` の PermissionDialog ワイヤーフレームを読み込む
2. Phase 2 の `TOOL_RISK_CONFIG` 型定義を読み込む
3. 以下の項目を突合確認する:

| ワイヤーフレームの要素              | 対応する ToolRiskConfig フィールド | Critical | High | Medium | Low  |
| ----------------------------------- | ---------------------------------- | -------- | ---- | ------ | ---- |
| ヘッダー背景色                      | `headerColorToken`                 | 確認     | 確認 | 確認   | 確認 |
| ダイアログ幅（640/480/400px）       | `dialogWidth`                      | 確認     | 確認 | 確認   | 確認 |
| 「今回のみ許可」ボタンの表示/非表示 | `allowApproveOnce`                 | 確認     | 確認 | 確認   | 確認 |
| 「恒久許可」ボタンの表示/非表示     | `allowPermanent`                   | 確認     | 確認 | 確認   | 確認 |
| 自動拒否フラグ                      | `autoDenyDefault`                  | 確認     | 確認 | 確認   | 確認 |

**合格基準**:

- 全 4 リスクレベル × 5 項目 = 20 組み合わせで ToolRiskConfig との不整合が 0 件であること
- Critical リスクで `allowApproveOnce === false` かつ `allowPermanent === false` であること（セキュリティ必須要件）

---

### TC-02: リスクレベル分類の網羅性

**目的**: `security-skill-execution.md` の DANGEROUS_PATTERNS 全パターンにリスクレベルが付与されていることを確認する。

**確認手順**:

1. `security-skill-execution.md` の `DANGEROUS_PATTERNS.BASH_COMMANDS`（24パターン）を全件読み込む
2. `security-skill-execution.md` の `DANGEROUS_PATTERNS.PROTECTED_PATHS`（25パターン）を全件読み込む
3. Phase 1 `outputs/phase-1/risk-level-classification.md` のリスクレベル付与表を読み込む
4. BASH_COMMANDS 24件の全パターンがリスクレベル付与表に存在することを確認する
5. PROTECTED_PATHS 25件の全パターンがリスクレベル付与表に存在することを確認する

**合格基準**:

- BASH_COMMANDS 24件: 未分類 = 0件
- PROTECTED_PATHS 25件: 未分類 = 0件
- 各パターンのリスクレベル分類に設計根拠（コメント）が記述されていること
- Critical 分類のパターン（`rm -rf`・`sudo`・`curl|sh`・フォークボム等）が Phase 2 の ToolRiskConfig と整合していること

---

### TC-03: 権限状態遷移の完全性

**目的**: 4リスクレベル × 4権限状態 = 16組み合わせの遷移が全て設計文書に定義されていることを確認する。

**確認手順**:

1. Phase 1 の権限状態4モード定義（approved/denied/approved_once/pending）を読み込む
2. Phase 2 の失効ポリシー定義（session/time_24h/time_7d/permanent）を読み込む
3. 以下の遷移マトリクスを突合確認する:

| リスクレベル | denied → pending | pending → approved | pending → approved_once | pending → denied | approved → revoked |
| ------------ | ---------------- | ------------------ | ----------------------- | ---------------- | ------------------ |
| Critical     | 定義確認         | 不可（設計禁止）   | 定義確認                | 定義確認         | 定義確認           |
| High         | 定義確認         | 不可（設計禁止）   | 定義確認                | 定義確認         | 定義確認           |
| Medium       | 定義確認         | 定義確認           | 定義確認                | 定義確認         | 定義確認           |
| Low          | 定義確認         | 定義確認           | 定義確認                | 定義確認         | 定義確認           |

**合格基準**:

- 16組み合わせ全ての遷移が Phase 1 または Phase 2 の設計文書に定義されていること
- Critical/High リスクで `approved`（恒久許可）への遷移が設計上禁止されていること
- タイムアウト（300000ms = 5分）発生時のフォールバックが `denied` として定義されていること

---

### TC-04: Task-03/05 接続の整合性

**目的**: Phase 2 の説明責任 UI 挿入点 INS-01〜INS-03 が Task-03/05 の設計文書と矛盾しないことを確認する。

**確認手順**:

1. Phase 2 `outputs/phase-2/accountability-ui-design.md` の INS-01〜INS-03 定義を読み込む
2. Task-03 Phase 2 設計の preflight/permission 挿入点定義を読み込む
3. Task-05 Phase 2 設計の CTA 画面・ScoringGate 契約を読み込む
4. 以下の接続点を突合確認する:

| 挿入点 | 挿入先               | Phase 2 定義の挿入タイミング               | Task-03/05 設計での対応箇所        | 整合判定 |
| ------ | -------------------- | ------------------------------------------ | ---------------------------------- | -------- |
| INS-01 | Task-05 CTA 画面     | 「今すぐ使う」ボタン上部                   | Task-05 CTA 画面コンポーネント定義 | 確認     |
| INS-02 | Task-03 実行中画面   | PermissionResolver.pendingCount > 0 の場合 | Task-03 ストリーミング UI 定義     | 確認     |
| INS-03 | Task-05 実行結果画面 | 実行完了後                                 | Task-05 実行結果コンポーネント定義 | 確認     |

**合格基準**:

- INS-01〜03 の全挿入点で、Task-03/05 設計文書の対応箇所と矛盾がないこと
- INS-01 の表示条件「スキルが High/Critical ツールを1件以上含む場合」が Task-05 の ScoringGate 条件と整合していること
- INS-02 の発火条件「PermissionResolver.pendingCount > 0」が Task-03 の既存 API と整合していること
- 新規画面遷移が追加されていないこと（既存画面への表示追加のみ）

---

### TC-05: Task-08 安全性ゲート契約

**目的**: Phase 2 の SafetyGatePort 型定義が Task-08 の要件定義と完全に対応していることを確認する。

**確認手順**:

1. Phase 2 `outputs/phase-2/safety-gate-contract.md` の SafetyGateResult・SafetyGatePort 型定義を読み込む
2. Task-08 Phase 1 要件定義の公開前安全性ゲート要件を読み込む
3. 以下の項目を突合確認する:

| SafetyGatePort のフィールド/メソッド             | Task-08 での消費箇所                           | 整合判定 |
| ------------------------------------------------ | ---------------------------------------------- | -------- |
| `evaluate(skillName): Promise<SafetyGateResult>` | 公開前チェックフローで呼び出し                 | 確認     |
| `SafetyGateResult.overallGrade`                  | 公開可否判定（SAFE/SAFE_WITH_WARNINGS/UNSAFE） | 確認     |
| `SafetyGateResult.details`                       | 公開警告メッセージの生成に使用                 | 確認     |
| `SafetyCheckDetail.riskLevel`                    | リスクレベル別の公開条件に使用                 | 確認     |
| `SafetyCheckDetail.message`                      | ユーザー向け警告メッセージに使用               | 確認     |

**合格基準**:

- SafetyGatePort の全フィールド・メソッドが Task-08 の要件定義で消費される用途が定義されていること
- `SafetyGatePort.evaluate()` が `Promise` として定義されており、非同期チェックを Task-08 側で待機できること
- CRITICAL_TOOL_REQUIRED チェックが `UNSAFE` Grade に対応し、公開ブロックとなること
- HIGH_TOOL_REQUIRED チェックが `SAFE_WITH_WARNINGS` Grade に対応し、ユーザー確認後に公開可能であること

---

### TC-06: 承認履歴の完全性

**目的**: Phase 1 の承認履歴仕様と Phase 2 の Permission History Panel 設計が完全に対応していることを確認する。

**確認手順**:

1. Phase 1 `outputs/phase-1/approval-history-policy.md` の履歴エントリ必須フィールド定義を読み込む
2. Phase 2 `outputs/phase-2/permission-persistence-design.md` の Permission History Panel 拡張設計を読み込む
3. 以下の項目を突合確認する:

| Phase 1 定義フィールド | Phase 2 UI/型定義での対応                   | 整合判定 |
| ---------------------- | ------------------------------------------- | -------- |
| `id`                   | 履歴エントリの一意識別子                    | 確認     |
| `toolName`             | Panel 表示列・フィルタ項目                  | 確認     |
| `skillId`              | Panel 表示列                                | 確認     |
| `skillVersion`         | バージョン変更時の再確認条件に使用          | 確認     |
| `decision`             | バッジ表示（approved/denied/approved_once） | 確認     |
| `timestamp`            | Panel 表示列・期間フィルタに使用            | 確認     |
| `riskLevel`            | Phase 2 追加フィールド・フィルタ項目        | 確認     |
| `triggerContext`       | 手動実行/自動実行/preflight の区別          | 確認     |

**合格基準**:

- Phase 1 定義の必須フィールド 7件（+ riskLevel）が Phase 2 設計に全て対応していること
- `revoked` 状態（Phase 2 追加）が Phase 1 の取り消し方針と整合していること
- FIFO 上限 1000件超過時の挙動が Phase 1・Phase 2 で同一の記述であること
- `clearAll` 操作の条件（設定画面からの明示的操作のみ）が Phase 2 UI 設計に反映されていること

---

### TC-07: 拒否 fallback の安全性

**目的**: Phase 2 の abort/skip/retry フロー設計が既存の SkillExecutor および PermissionResolver の実装と矛盾しないことを確認する。

**確認手順**:

1. Phase 2 `outputs/phase-2/abort-fallback-design.md` の fallback フロー①②③を読み込む
2. `interfaces-agent-sdk-executor-details.md` の SkillExecutor abort 契約と PermissionResolver 8ステップフローを読み込む
3. 以下の項目を突合確認する:

| fallback フロー | SkillExecutor への指示                            | 既存 API 対応                  | 整合判定 |
| --------------- | ------------------------------------------------- | ------------------------------ | -------- |
| ① abort         | `PermissionResolver.cancelAll()` → 実行中止エラー | `cancelAll()` メソッド存在確認 | 確認     |
| ② skip          | `{ approved: false, skip: true }` を返す          | 既存レスポンス型との互換確認   | 確認     |
| ③ retry         | PermissionDialog を再表示（最大3回）              | 既存 dialog 再表示 API 確認    | 確認     |

**合格基準**:

- abort フロー① の4ステップクリーンアップ（cancelAll → approve_once削除 → ログ記録 → IPC送信）が既存 SkillExecutor と矛盾しないこと
- skip フロー② の `{ approved: false, skip: true }` レスポンスが既存 PermissionResolver の戻り値型と互換であること
- retry フロー③ の最大3回制限がタイムアウト（300000ms）の計算範囲内に収まることが確認されていること
- タイムアウト発生時が abort フロー①に自動フォールバックすることが明記されていること

---

## 統合テスト連携

本 Phase は手動ウォークスルーであり、コード実装テストは行わない。結果は Phase 12 の未タスク検出と仕様同期の入力にする。

| 連携先                                    | 引き継ぐ内容                 |
| ----------------------------------------- | ---------------------------- |
| `phase-12-documentation.md` Task 2        | 接続矛盾・仕様不足の指摘一覧 |
| `phase-12-documentation.md` Task 4        | FAIL/保留項目の未タスク候補  |
| `outputs/phase-12/spec-update-summary.md` | TCごとの最終判定と証跡パス   |

---

## 成果物

| 成果物 ID | ファイルパス                             | 内容                                                 |
| --------- | ---------------------------------------- | ---------------------------------------------------- |
| OUT-11-1  | `outputs/phase-11/manual-test-result.md` | 7テストケースの実施結果（PASS/FAIL・確認根拠・証跡） |
| OUT-11-2  | `outputs/phase-11/discovered-issues.md`  | テスト中に発見した問題・改善点・整合性懸念の一覧     |

### manual-test-result.md の必須記載項目

```markdown
# 手動テスト結果 - TASK-SKILL-LIFECYCLE-06 Phase 11

実施日: YYYY-MM-DD
テスト実施者: [エージェント名]

## テストサマリー

| TC    | テスト名                       | 判定      | 確認方法         |
| ----- | ------------------------------ | --------- | ---------------- |
| TC-01 | 権限確認ダイアログの設計整合性 | PASS/FAIL | [確認根拠の要約] |
| TC-02 | リスクレベル分類の網羅性       | PASS/FAIL | [確認根拠の要約] |
| TC-03 | 権限状態遷移の完全性           | PASS/FAIL | [確認根拠の要約] |
| TC-04 | Task-03/05 接続の整合性        | PASS/FAIL | [確認根拠の要約] |
| TC-05 | Task-08 安全性ゲート契約       | PASS/FAIL | [確認根拠の要約] |
| TC-06 | 承認履歴の完全性               | PASS/FAIL | [確認根拠の要約] |
| TC-07 | 拒否 fallback の安全性         | PASS/FAIL | [確認根拠の要約] |

## 総合判定: PASS / FAIL

## 各TCの詳細確認結果

（各TCごとに突合確認表・根拠・差異を記録）
```

---

## 完了条件

以下のチェックボックスを全て満たすことで Phase 11 完了とする。

- [ ] Phase 10 最終レビューの PASS 判定を `phase-10-final-review.md` で確認した
- [ ] `outputs/phase-11/manual-test-result.md` が作成されており、TC-01〜TC-07 の判定（PASS/FAIL）と確認根拠が全て記録されている
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている（発見事項 0件の場合もファイルを作成し「発見事項なし」と記録する）
- [ ] TC-01: 全20組み合わせで ToolRiskConfig との不整合が 0件であることを確認した
- [ ] TC-02: BASH_COMMANDS 24件・PROTECTED_PATHS 25件の全パターンにリスクレベルが付与されていることを確認した
- [ ] TC-03: 16遷移組み合わせが設計文書に定義されており、Critical/High の恒久許可が禁止されていることを確認した
- [ ] TC-04: INS-01〜03 が Task-03/05 設計文書と矛盾しないこと、新規画面遷移がないことを確認した
- [ ] TC-05: SafetyGatePort の全フィールド・メソッドが Task-08 要件で消費される用途が定義されていることを確認した
- [ ] TC-06: Phase 1 の必須フィールド 7件が Phase 2 設計に全て対応していることを確認した
- [ ] TC-07: abort フロー①の4ステップクリーンアップが既存 PermissionResolver と矛盾しないことを確認した
- [ ] 総合判定が PASS であること（FAIL が1件でもある場合は Phase 12 に進まず、該当 Phase に差し戻す）

---

## FAIL 発生時の差し戻し先

| TC    | FAIL 原因                                       | 差し戻し先 |
| ----- | ----------------------------------------------- | ---------- |
| TC-01 | ワイヤーフレームと型定義の不整合                | Phase 2    |
| TC-02 | DANGEROUS_PATTERNS の未分類パターンが存在       | Phase 1    |
| TC-03 | 権限状態遷移の未定義が存在                      | Phase 2    |
| TC-04 | INS-01〜03 と Task-03/05 の矛盾                 | Phase 2    |
| TC-05 | SafetyGatePort と Task-08 要件の不整合          | Phase 2    |
| TC-06 | 承認履歴フィールドの差異                        | Phase 1    |
| TC-07 | fallback フローと既存 PermissionResolver の矛盾 | Phase 2    |

---

## 次 Phase

**Phase 12: ドキュメント** (`phase-12-documentation.md`)

Phase 12 開始条件: 本ファイルの完了条件チェックリストが全項目 CHECKED であり、総合判定が PASS であること。
