# Phase 9: 品質検証 - TASK-SKILL-LIFECYCLE-06 信頼・権限・ガバナンス統合

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスク ID    | TASK-SKILL-LIFECYCLE-06                                |
| Phase        | 9: 品質検証                                            |
| ステータス   | not_started                                            |
| 担当         | 設計専門エージェント                                   |
| 依存成果物   | `outputs/phase-8/` の4成果物（Phase 8 完了が前提条件） |
| ブロック対象 | `phase-10-final-review.md`                             |
| 作成日       | 2026-03-16                                             |
| 仕様書分類   | 設計タスク（実装なし）                                 |

---

## 目的

説明責任・誤操作防止・ユーザビリティ・セキュリティの4つの観点から、Phase 1-8 の設計成果物が受入基準 AC-1〜AC-4 を完全に充足しているかを多角的に検証する。

本 Phase は実装コードを生成しない。検証の対象は以下の3カテゴリである。

1. **Lint 相当**: 設計文書の構造・用語・参照リンクの形式的な正確性（Phase 8 で修正済みの内容を最終確認）
2. **型チェック相当**: 型定義 `ToolRiskConfig` / `AllowedToolEntryV2` / `SafetyGatePort` の内部整合性と相互依存の正確性
3. **テスト相当**: Phase 4-6 で定義したテストシナリオ（設計レベル）が全て合格基準を満たすかの確認

---

## 実行タスク

### Task 1: Lint 相当 — 設計文書の構造・用語・参照リンク検証

Phase 8 のリファクタリング後の状態を最終確認する。

#### 1-1. 構造検証

| 検証項目                                        | 確認対象ファイル群                       | 合格基準                                                                       |
| ----------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| テンプレート必須セクションが全て存在する        | Phase 1-8 の全仕様書ファイル             | タイトル・メタ情報・目的・実行タスク・成果物・完了条件・次Phase が全て存在する |
| 成果物テーブルに ファイルパス・内容の両列がある | `outputs/phase-1/` ～ `outputs/phase-8/` | 全成果物テーブルに ID・ファイルパス・内容の3列が揃っている                     |
| 完了条件がチェックボックス形式（`- [ ]`）である | Phase 1-8 の全仕様書ファイル             | 全完了条件が `- [ ]` で始まる行として記述されている                            |

#### 1-2. 用語検証

Phase 8 で確定した正規表記のみが使用されていることを検証する。

```bash
# 廃止表記が残存していないことの最終確認（合格基準: 全コマンドの出力が空）
grep -rn "dangerLevel\|risk_level\|riskClass\|threatLevel\|DangerLevel\|RiskLevel" \
  outputs/phase-1/ outputs/phase-2/

grep -rn "approve_once\|approveOnce\|session_approval" \
  outputs/phase-1/ outputs/phase-2/

grep -rn "expiry_policy\|expirationPolicy\|expireMode" \
  outputs/phase-1/ outputs/phase-2/

grep -rn "SafetyStatus\|PublishStatus\|SecurityGrade" \
  outputs/phase-1/ outputs/phase-2/
```

#### 1-3. 参照リンク検証

`outputs/phase-8/link-audit.md` に記録された断絶リンクが0件（または全件「未作成 - Phase XX で作成予定」注記付き）であることを確認する。

---

### Task 2: 型チェック相当 — 型定義の内部整合性検証

Phase 2 で設計した型定義が相互に矛盾なく参照できるかを検証する。実装コードは存在しないため、型定義の文書上での整合性を確認する。

#### 2-1. `ToolRiskConfig` の整合性チェック

| チェック項目                                                               | 期待値                                                |
| -------------------------------------------------------------------------- | ----------------------------------------------------- |
| `ToolRiskLevel` の値セットが4種類（critical/high/medium/low）で過不足ない  | `TOOL_RISK_CONFIG` の key が4種類                     |
| `critical.allowApproveOnce` が `false` である                              | Critical ツールの「今回のみ許可」表示が禁止されている |
| `critical.allowPermanent` が `false` である                                | Critical ツールの恒久許可が禁止されている             |
| `critical.autoDenyDefault` が `true` である                                | Critical ツールのデフォルト自動拒否が有効になっている |
| `high.allowPermanent` が `false` である                                    | High ツールの恒久許可が禁止されている                 |
| `medium.allowPermanent` が `true` かつ `medium.allowApproveOnce` が `true` | Medium ツールに両方のオプションが表示される           |
| `low.allowPermanent` が `true` かつ `low.allowApproveOnce` が `true`       | Low ツールに両方のオプションが表示される              |
| `headerColorToken` の値がCSS変数（`--` プレフィックス）で統一されている    | 全4レベルで `--status-*` 形式                         |
| `dialogWidth` の値が 400/480/640 のいずれか                                | 全4レベルでテーブルの仕様通り                         |

#### 2-2. `AllowedToolEntryV2` の整合性チェック

| チェック項目                                                               | 期待値                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `expiresAt` が `optional`（`?` 付き）フィールドである                      | 既存 `AllowedToolEntry` の後方互換が維持されている            |
| `expiryPolicy` の値セットが4種類（session/time_24h/time_7d/permanent）     | Phase 2 ステップ 3-2 の失効ポリシー定義と一致している         |
| `session` ポリシーが electron-store に書き込まれないことが明記されている   | `approve_once` のセッション内のみ有効という要件が保たれている |
| `time_24h` のタイムアウト値が `allowedAt + 86400000ms` で計算される        | `86400000 = 24 × 3600 × 1000` の計算が正しい                  |
| `time_7d` のタイムアウト値が `allowedAt + 604800000ms` で計算される        | `604800000 = 7 × 24 × 3600 × 1000` の計算が正しい             |
| `skillName` フィールドが `optional` で、`undefined` の場合は全スキルに適用 | スキル横断の恒久許可も AllowedToolEntryV2 で表現できる        |

#### 2-3. `SafetyGatePort` の整合性チェック

| チェック項目                                                               | 期待値                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `SafetyGatePort.evaluate()` が `async`（`Promise<SafetyGateResult>` 返し） | Task-08 が非同期で安全性チェックを待機できる                       |
| `SafetyGrade` の値セットが3種類（SAFE/SAFE_WITH_WARNINGS/UNSAFE）          | 公開可否の3段階判定が表現できる                                    |
| `CRITICAL_TOOL_REQUIRED` チェックが `UNSAFE` に直結している                | Critical ツール要求は公開ブロックされる                            |
| `HIGH_TOOL_REQUIRED` チェックが `SAFE_WITH_WARNINGS` に留まる              | High ツール要求は公開可能（警告付き）                              |
| `PROTECTED_PATH_ACCESS` チェックが `UNSAFE` に直結している                 | 保護パスへの Write/Edit 要求は公開ブロックされる                   |
| `SafetyCheckDetail.message` フィールドに曖昧表現が含まれていない           | 「危険な操作を含みます」ではなく操作の具体的な影響が記述されている |

---

### Task 3: テスト相当 — Phase 4-6 テストシナリオの合格確認

Phase 4 で定義したテストシナリオの設計レベルでの合格状況を確認する。各シナリオについて、Phase 1-2 の設計成果物に根拠となる定義が存在するかを確認する。

#### 3-1. 権限境界（AC-1）のテストシナリオ確認

| シナリオ ID | シナリオ内容                                                                   | 根拠の所在                                                                    | 合格判定 |
| ----------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | -------- |
| TC-AC1-01   | `rm -rf /` が Critical に分類され、デフォルトで拒否される                      | `risk-level-classification.md` の BASH_COMMANDS テーブル                      | 要確認   |
| TC-AC1-02   | `sudo` コマンドが Critical に分類され、恒久許可ボタンが非表示になる            | `TOOL_RISK_CONFIG.critical.allowPermanent === false`                          | 要確認   |
| TC-AC1-03   | `chmod 777` が High に分類され、「今回のみ許可」は表示されるが恒久許可は非表示 | `TOOL_RISK_CONFIG.high.allowApproveOnce === true && allowPermanent === false` | 要確認   |
| TC-AC1-04   | `Write` ツールが Medium に分類され、恒久許可ボタンが表示される                 | `TOOL_RISK_CONFIG.medium.allowPermanent === true`                             | 要確認   |
| TC-AC1-05   | `Read` ツールが Low に分類され、インライン確認（ミニダイアログ）が表示される   | `TOOL_RISK_CONFIG.low.dialogWidth === 400` の低インパクトUI                   | 要確認   |

#### 3-2. 承認履歴・取り消し（AC-2）のテストシナリオ確認

| シナリオ ID | シナリオ内容                                                                                            | 根拠の所在                                                  | 合格判定 |
| ----------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------- |
| TC-AC2-01   | `approved` 状態のツールに「取り消す」ボタンが表示される                                                 | `permission-persistence-design.md` の取り消し UI フロー設計 | 要確認   |
| TC-AC2-02   | 取り消し後に `permissionHistorySlice` の該当エントリに `revokedAt` が追加される                         | `revokedAt: number` フィールドの追加設計                    | 要確認   |
| TC-AC2-03   | `approved_once` のエントリがセッション終了後に electron-store に残存しない                              | `expiryPolicy === "session"` の非永続化設計                 | 要確認   |
| TC-AC2-04   | 履歴エントリが1001件になった時に先頭エントリが削除され1000件に維持される                                | `PERMISSION_HISTORY_MAX_ENTRIES = 1000` の FIFO ポリシー    | 要確認   |
| TC-AC2-05   | `time_24h` ポリシーで許可されたツールが `allowedAt + 86400001ms` 後に `isToolAllowed` で `false` を返す | 失効チェックロジックのステップ4                             | 要確認   |

#### 3-3. 説明責任（AC-3）のテストシナリオ確認

| シナリオ ID | シナリオ内容                                                                                               | 根拠の所在                                             | 合格判定 |
| ----------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------- |
| TC-AC3-01   | High/Critical ツールを含むスキルの CTA 画面に INS-01 権限サマリーバナーが表示される                        | INS-01 の表示条件「High/Critical ツールを1件以上含む」 | 要確認   |
| TC-AC3-02   | `ScoringGate === NEEDS_IMPROVEMENT` の場合、権限ダイアログに「改善が推奨されています」テキストが挿入される | Phase 1 Task 4 の ScoringGate連動ルール                | 要確認   |
| TC-AC3-03   | `PermissionResolver.pendingCount > 0` の場合、実行中画面に INS-02 インジケーターが表示される               | INS-02 の表示条件の設計                                | 要確認   |
| TC-AC3-04   | 実行完了後、セッション中に1件以上の権限承認があった場合に INS-03 サマリーが表示される                      | INS-03 の表示条件「1件以上の権限承認」                 | 要確認   |

#### 3-4. 安全性ゲート（AC-4）のテストシナリオ確認

| シナリオ ID | シナリオ内容                                                                       | 根拠の所在                                                     | 合格判定 |
| ----------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------- |
| TC-AC4-01   | Critical ツールを含むスキルに対して `SafetyGatePort.evaluate()` が `UNSAFE` を返す | `CRITICAL_TOOL_REQUIRED` チェックの設計                        | 要確認   |
| TC-AC4-02   | High ツールのみを含むスキルに対して `evaluate()` が `SAFE_WITH_WARNINGS` を返す    | `HIGH_TOOL_REQUIRED` チェックの設計                            | 要確認   |
| TC-AC4-03   | Low ツールのみを含むスキルに対して `evaluate()` が `SAFE` を返す                   | `ALL_LOW_TOOLS` チェックの設計                                 | 要確認   |
| TC-AC4-04   | `PROTECTED_PATHS` に該当するパスへの Write/Edit を含むスキルが `UNSAFE` を返す     | `PROTECTED_PATH_ACCESS` チェックの設計                         | 要確認   |
| TC-AC4-05   | `SafetyGateResult.evaluatedAt` が `Date.now()` のタイムスタンプを持つ              | `SafetyGateResult` の型定義に `evaluatedAt: number` が存在する | 要確認   |

---

### Task 4: セキュリティ観点の最終確認

以下のセキュリティホールが設計に存在しないことを確認する。

| 確認項目                                                                                                  | 確認方法                                              | 合格基準                                                           |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| Critical ツールへの恒久許可経路が存在しない                                                               | `TOOL_RISK_CONFIG.critical.allowPermanent` の値確認   | 値が `false` で記述されている                                      |
| `approved_once` がセッションをまたいで永続化される経路が存在しない                                        | `expiryPolicy === "session"` の非永続化設計の記述確認 | electron-store への書き込みが禁止と明記されている                  |
| `SkillSafetyContract.requiresExplicitConsent` が Critical/High スキルで `true` になる条件が定義されている | `skill-safety-contract.md` の設計確認                 | 条件が条件式で記述されている（「場合がある」禁止）                 |
| abort フロー実行時に `approved_once` エントリが削除される契約が存在する                                   | `abort-fallback-design.md` のクリーンアップ契約確認   | 4ステップのクリーンアップ手順が定義されている                      |
| タイムアウト（300秒）時のフォールバックが `denied` として処理される設計になっている                       | Phase 1 Task 2 のタイムアウト定義確認                 | `DEFAULT_TIMEOUT_MS = 300000ms` かつ `denied` 処理が明記されている |

---

## 参照資料

| 資料名                                                       | パス                                                                                                                | 用途                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 8 リファクタ結果                                       | `outputs/phase-8/*.md`                                                                                              | lint/type/security の入力       |
| Phase 4-7 検証成果物                                         | `outputs/phase-4/`, `outputs/phase-5/`, `outputs/phase-6/`, `outputs/phase-7/`                                      | テスト相当判定の根拠            |
| security-skill-execution                                     | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                     | 危険パターンと許可境界の正本    |
| interfaces-agent-sdk-executor-details                        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                        | PermissionResolver/timeout 契約 |
| arch-state-management-reference-permissions-import-lifecycle | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | permissionHistorySlice 契約     |
| workflow-skill-lifecycle-evaluation-scoring-gate             | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`             | ScoringGate 連動要件            |

---

## 実行手順

### Step 1: Lint 相当検証の実施（所要: 約30分）

1. Task 1-1 の構造検証チェック項目を全仕様書ファイルで確認する
2. Task 1-2 の用語検証 grep コマンドを実行し、全て出力が空であることを確認する
3. Task 1-3 の参照リンク確認を行い、断絶リンク0件を確認する
4. 検証結果を `outputs/phase-9/lint-report.md` に記録する

### Step 2: 型チェック相当検証の実施（所要: 約40分）

1. Task 2-1 の `ToolRiskConfig` チェック項目を `risk-level-design.md` で1項目ずつ確認する
2. Task 2-2 の `AllowedToolEntryV2` チェック項目を `permission-persistence-design.md` で確認する
3. Task 2-3 の `SafetyGatePort` チェック項目を `safety-gate-contract.md` で確認する
4. 全チェック項目の判定結果（`PASS` / `FAIL`）を `outputs/phase-9/type-check-report.md` に記録する
5. `FAIL` が1件でも存在する場合は Phase 5 の設計成果物を修正してから再確認する

### Step 3: テスト相当検証の実施（所要: 約50分）

1. Task 3-1〜3-4 のテストシナリオ（合計17件）を1件ずつ確認する
2. 各シナリオについて、根拠の所在が実際に設計成果物に存在するかを確認する
3. 存在する場合は「合格判定: PASS（根拠: [ファイル名] L[行番号]）」と記録する
4. 存在しない場合は「合格判定: FAIL（欠落: [欠落している設計要素の説明]）」と記録する
5. 全17件の判定結果を `outputs/phase-9/test-scenario-report.md` に記録する

### Step 4: セキュリティ最終確認（所要: 約20分）

1. Task 4 の5項目を順番に確認する
2. 合格基準を満たさない項目は即座に設計成果物を修正する
3. 全5項目の確認結果を `outputs/phase-9/security-check-report.md` に記録する

### Step 5: 品質検証サマリーの作成（所要: 約10分）

4つの報告書（lint / type-check / test-scenario / security-check）の結果を集約し、`outputs/phase-9/qa-summary.md` にサマリーを作成する。

サマリーに含める内容:

- 各検証カテゴリの `PASS` / `FAIL` 件数
- `FAIL` が0件であることの確認
- Phase 10 最終レビューへのパス可否の判定

---

## 統合テスト連携

本 Phase はコードを生成しないため、実装テストは存在しない。品質検証の観点は以下の通り。

| 検証カテゴリ     | 実施方法                                 | 合格基準           |
| ---------------- | ---------------------------------------- | ------------------ |
| Lint 相当        | grep コマンドによる廃止表記・構造確認    | 全検出件数 = 0     |
| 型チェック相当   | 型定義の手動整合性確認（全チェック項目） | `FAIL` 件数 = 0    |
| テスト相当       | テストシナリオ17件の根拠有無確認         | `FAIL` 件数 = 0    |
| セキュリティ確認 | セキュリティホール5項目の手動確認        | 合格基準未達 = 0件 |

---

## 成果物

成果物はすべて `outputs/phase-9/` 配下に配置する。

| 成果物 ID | ファイルパス                               | 内容                                                                                |
| --------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| OUT-9-1   | `outputs/phase-9/lint-report.md`           | Lint 相当検証の結果（構造・用語・参照リンクの全確認結果）                           |
| OUT-9-2   | `outputs/phase-9/type-check-report.md`     | 型チェック相当検証の結果（ToolRiskConfig/AllowedToolEntryV2/SafetyGatePort 全項目） |
| OUT-9-3   | `outputs/phase-9/test-scenario-report.md`  | テストシナリオ17件の合格判定一覧（根拠の所在と行番号付き）                          |
| OUT-9-4   | `outputs/phase-9/security-check-report.md` | セキュリティ確認5項目の判定結果と証跡                                               |
| OUT-9-5   | `outputs/phase-9/qa-summary.md`            | 品質検証サマリー（全カテゴリの PASS/FAIL 集計と Phase 10 へのパス可否判定）         |

---

## 完了条件

以下の全チェックボックスを満たすことで Phase 9 完了とする。

- [ ] `outputs/phase-9/lint-report.md` が作成されており、廃止表記の検出件数が0件と記録されている
- [ ] `outputs/phase-9/type-check-report.md` が作成されており、全チェック項目の判定が `PASS` である（`FAIL` が0件）
- [ ] `outputs/phase-9/test-scenario-report.md` が作成されており、17件全てのシナリオが `PASS` である
- [ ] `outputs/phase-9/security-check-report.md` が作成されており、5項目全てが合格基準を満たしている
- [ ] `outputs/phase-9/qa-summary.md` が作成されており、Phase 10 へのパス可否が `PASS` と記録されている
- [ ] 上記の確認中に発見した設計不備が Phase 1-8 の成果物で修正されている

---

## タスク100%実行確認【必須】

Phase 9 完了前に以下を逐次確認する。

1. **全5成果物の存在確認**: `ls outputs/phase-9/` を実行し、OUT-9-1〜OUT-9-5 の全ファイルが存在することを確認する
2. **型チェック FAIL 0件確認**: `type-check-report.md` に `FAIL` の記述が存在しないことを `grep -c "FAIL" outputs/phase-9/type-check-report.md` で確認し、結果が `0` であることを記録する
3. **テストシナリオ FAIL 0件確認**: `test-scenario-report.md` の全17件が `PASS` であることを確認する
4. **セキュリティホール0件確認**: `security-check-report.md` に合格基準未達の項目が存在しないことを確認する
5. **qa-summary のパス判定確認**: `qa-summary.md` に「Phase 10 へのパス可否: PASS」と明記されていることを確認する

---

## 次 Phase

Phase 10: 最終レビュー

- 成果物パス: `phase-10-final-review.md`
- 前提条件: 本ファイルの「完了条件」チェックリストが全項目チェック済みであること、かつ `qa-summary.md` に Phase 10 パス可否が `PASS` と記録されていること
- Phase 10 でのインプット: `outputs/phase-9/` の5成果物と、リファクタリング・品質検証済みの Phase 1-8 の全成果物
