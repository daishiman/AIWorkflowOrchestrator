# Phase 10: 最終レビュー - TASK-SKILL-LIFECYCLE-06 信頼・権限・ガバナンス統合

## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスク ID    | TASK-SKILL-LIFECYCLE-06                                                 |
| Phase        | 10: 最終レビュー                                                        |
| ステータス   | not_started                                                             |
| 担当         | 設計専門エージェント                                                    |
| 依存成果物   | `outputs/phase-9/qa-summary.md`（Phase 9 パス判定が `PASS` であること） |
| ブロック対象 | `phase-11-manual-test.md`                                               |
| 作成日       | 2026-03-16                                                              |
| 仕様書分類   | 設計タスク（実装なし）                                                  |

---

## 目的

TASK-SKILL-LIFECYCLE-06 の設計成果物が、以下の4つの品質基準を全て満たすかを多角的に最終判定する。

1. **AC 充足**: 受入基準 AC-1〜AC-4 を完全に充足しているか
2. **接続整合**: Task-03/05/08 に適用しても権限設計が過不足ないか
3. **セキュリティ保証**: 設計にセキュリティホールが存在しないか
4. **後方互換性**: 既存の `PermissionResolver`・`PermissionStore`・`permissionHistorySlice` を破壊しないか

最終レビューの判定結果（PASS/MINOR/MAJOR/CRITICAL）に応じて、Phase 11 に進むか、前の Phase に差し戻すかを決定する。

---

## レビューゲート判定基準

| 判定     | 条件                                                                                                | 対応                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| PASS     | AC-1〜AC-4 全充足、型定義整合（Task 2 全 PASS）、Task-03/05/08 接続確認済み（Task 3 全 OK）         | Phase 11 へ進む                                                                      |
| MINOR    | 文言の曖昧表現残存、用語統一の漏れ、参照リンク切れ、テーブルの軽微な記述不足                        | 全 MINOR 指摘を未タスク仕様書に変換後、Phase 11 へ進む（変換前に Phase 11 進行禁止） |
| MAJOR    | 権限境界の設計不備（例: High ツールへの恒久許可経路が残存）、Task-03/05/08 との契約不整合           | 影響範囲に応じて Phase 1（要件問題）または Phase 2（設計問題）へ戻る                 |
| CRITICAL | セキュリティホール（例: Critical 操作への恒久許可が可能な設計になっている、approved_once の永続化） | Phase 1 へ戻り要件から再確認する                                                     |

**MINOR 指摘の処理ルール（省略不可）:**

- 「機能への影響なし」と判断した場合でも、未タスク仕様書への変換を省略してはならない
- 未タスク仕様書の作成先: `../unassigned-task/` 配下
- 未タスク仕様書作成後、`task-workflow.md` の残課題テーブルへの登録と関連仕様書への参照リンク追加が必須

---

## 実行タスク

### Task 1: 受入基準（AC-1〜AC-4）の最終突合

Phase 1-9 の全成果物を対象に、各 AC が設計成果物によって充足されているかを最終確認する。

#### AC-1: 危険操作の権限境界が明確

| 確認項目                                                                                     | 確認対象ファイル                               | 充足判定 |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------- |
| Critical/High/Medium/Low の4段階が条件式で定義されている（「危険な操作」等の曖昧表現がない） | `outputs/phase-1/risk-level-classification.md` | 要確認   |
| BASH_COMMANDS の全パターン（24件）にリスクレベルが付与されている                             | `outputs/phase-1/risk-level-classification.md` | 要確認   |
| PROTECTED_PATHS の全パターン（25件）にリスクレベルが付与されている                           | `outputs/phase-1/risk-level-classification.md` | 要確認   |
| `ToolRiskConfig` の4レベルに対応するダイアログ表現が設計されている                           | `outputs/phase-2/risk-level-design.md`         | 要確認   |
| Critical レベルに恒久許可経路が設計上存在しない（`allowPermanent === false`）                | `outputs/phase-2/risk-level-design.md`         | 要確認   |
| High レベルに恒久許可経路が設計上存在しない（`allowPermanent === false`）                    | `outputs/phase-2/risk-level-design.md`         | 要確認   |

**AC-1 判定**: `PASS` / `FAIL`（全項目が「充足判定: OK」の場合に PASS）

#### AC-2: 承認履歴と取り消し方針が定義されている

| 確認項目                                                                                                                            | 確認対象ファイル                                   | 充足判定 |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------- |
| 履歴エントリの必須フィールドが7件全て定義されている（id/toolName/skillId/skillVersion/decision/timestamp/riskLevel/triggerContext） | `outputs/phase-1/approval-history-policy.md`       | 要確認   |
| 取り消し条件が3点明記されている（`approved` のみ対象・`denied` は再許可で上書き・`approved_once` はセッション失効）                 | `outputs/phase-1/approval-history-policy.md`       | 要確認   |
| FIFO 上限ポリシー（1001件目追加時に先頭エントリが削除される）が明記されている                                                       | `outputs/phase-1/approval-history-policy.md`       | 要確認   |
| `AllowedToolEntryV2` の `expiresAt` フィールドが `optional` で定義されている                                                        | `outputs/phase-2/permission-persistence-design.md` | 要確認   |
| 失効ポリシー4種（session/time_24h/time_7d/permanent）がタイムアウト値付きで定義されている                                           | `outputs/phase-2/permission-persistence-design.md` | 要確認   |
| 取り消し UI フロー（`revokedAt` フィールド追加・バッジ変更）が Permission History Panel 拡張として設計されている                    | `outputs/phase-2/permission-persistence-design.md` | 要確認   |

**AC-2 判定**: `PASS` / `FAIL`

#### AC-3: 実行導線に説明責任が組み込まれている

| 確認項目                                                                                      | 確認対象ファイル                                  | 充足判定 |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------- |
| INS-01（CTA 画面の権限サマリーバナー）の挿入先・タイミング・表示条件が定義されている          | `outputs/phase-2/accountability-ui-design.md`     | 要確認   |
| INS-02（実行中の権限確認中インジケーター）の挿入先・タイミング・表示条件が定義されている      | `outputs/phase-2/accountability-ui-design.md`     | 要確認   |
| INS-03（実行結果画面の権限承認サマリー）の挿入先・タイミング・表示条件が定義されている        | `outputs/phase-2/accountability-ui-design.md`     | 要確認   |
| `ScoringGate === NEEDS_IMPROVEMENT` 時の説明責任テキスト挿入ルールが条件式で定義されている    | `outputs/phase-1/accountability-insertion-map.md` | 要確認   |
| 3つの挿入点が新規画面遷移を追加せず、既存画面への表示追加に限定されていることが明記されている | `outputs/phase-2/accountability-ui-design.md`     | 要確認   |

**AC-3 判定**: `PASS` / `FAIL`

#### AC-4: 共有/公開前の安全性ゲートと接続されている

| 確認項目                                                                                                                                                      | 確認対象ファイル                           | 充足判定 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------- |
| `SafetyGatePort` インターフェースが `async evaluate(skillName: string): Promise<SafetyGateResult>` で定義されている                                           | `outputs/phase-2/safety-gate-contract.md`  | 要確認   |
| `SafetyGrade` の3段階（SAFE/SAFE_WITH_WARNINGS/UNSAFE）が定義されている                                                                                       | `outputs/phase-2/safety-gate-contract.md`  | 要確認   |
| 安全性チェックルール5件（CRITICAL_TOOL_REQUIRED/HIGH_TOOL_REQUIRED/NO_PERMANENT_APPROVAL/ALL_LOW_TOOLS/PROTECTED_PATH_ACCESS）が Grade 影響まで定義されている | `outputs/phase-2/safety-gate-contract.md`  | 要確認   |
| `SkillSafetyContract` の全フィールドの型と説明が定義されている                                                                                                | `outputs/phase-1/skill-safety-contract.md` | 要確認   |
| 公開不可条件（Critical/High リスク含有）と公開警告条件（denied 率50%以上）に設計根拠が記述されている                                                          | `outputs/phase-1/skill-safety-contract.md` | 要確認   |

**AC-4 判定**: `PASS` / `FAIL`

---

### Task 2: 型定義の整合性最終確認

Phase 9 の型チェック相当検証に加えて、型定義間の相互依存が正しく設計されているかを確認する。

| 依存関係                                                    | 期待される整合状態                                                                  | 確認結果 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| `SafetyGateResult.details[].riskLevel` → `ToolRiskLevel`    | `SafetyCheckDetail.riskLevel` の型が `ToolRiskLevel` と一致している                 | 要確認   |
| `AllowedToolEntryV2.expiryPolicy` → 失効ポリシー値セット    | `"session" \| "time_24h" \| "time_7d" \| "permanent"` の4種で統一されている         | 要確認   |
| `SkillSafetyContract.maxRiskLevel` → `ToolRiskLevel`        | `"critical" \| "high" \| "medium" \| "low"` の型と一致している                      | 要確認   |
| `PermissionDecisionExtended` → `"revoked"` 追加             | `revoked` バッジ色が `var(--text-secondary)` で定義されている                       | 要確認   |
| abort フローのクリーンアップ → `approved_once` エントリ削除 | `PermissionStore` から `session` ポリシーのエントリが削除される手順が明記されている | 要確認   |

---

### Task 3: Task-03/05/08 接続インターフェースの最終確認

本タスクの設計成果物が、依存・ブロック先の各タスクに対して過不足なく接続されているかを確認する。

#### Task-03（Runtime Routing）との接続確認

| 接続ポイント                                                                  | 確認内容                                                            | 確認結果 |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------- |
| `execute` 入口での preflight チェックの挿入タイミング                         | スキル実行前とツール呼び出し前の2段階チェックが設計に明記されている | 要確認   |
| `PermissionResolver.waitForResponse` の呼び出しタイミング                     | ツール呼び出し前のみ（preflight は同期チェック）と明記されている    | 要確認   |
| `approved_once` のスコープが `sessionId` で管理されていることの明記           | セッション単位の `approved_once` 管理設計が存在する                 | 要確認   |
| Runtime Routing の internal role（Planner/Executor/Improver）がUIに露出しない | 権限ダイアログに internal role が表示されないことが明記されている   | 要確認   |
| INS-02（権限確認中インジケーター）が既存ストリーミング UI を破壊しない        | 既存 UI の一部として表示される設計になっている                      | 要確認   |

#### Task-05（利用導線 CTA）との接続確認

| 接続ポイント                                                                | 確認内容                                                   | 確認結果 |
| --------------------------------------------------------------------------- | ---------------------------------------------------------- | -------- |
| `ScoringGate === NEEDS_IMPROVEMENT` 時の権限ダイアログへの追加警告設計      | INS-01 の発火条件に ScoringGate 連動が含まれている         | 要確認   |
| `ScoringGate === USE_ALLOWED` 以上の場合の通常権限フロー設計                | ScoringGate 値と権限フローの分岐が設計に明記されている     | 要確認   |
| INS-01（権限サマリーバナー）が CTA 画面に追加される設計になっている         | CTA 画面の「今すぐ使う」ボタン上部への挿入が設計されている | 要確認   |
| INS-03（実行後サマリー）が Task-05 実行結果画面に追加される設計になっている | 実行結果画面への挿入が設計されている                       | 要確認   |

#### Task-08（スキル公開）との接続確認

| 接続ポイント                                                                            | 確認内容                                                             | 確認結果 |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| `SafetyGatePort.evaluate()` が async で Task-08 から呼び出し可能な形になっている        | インターフェースとして定義されており、Task-08 がモック注入可能な設計 | 要確認   |
| Critical/High ツール含有スキルの公開ブロック条件が明確に定義されている                  | `UNSAFE` 判定条件に Critical/High ツール要求が含まれている           | 要確認   |
| `SkillSafetyContract` の全フィールドが Task-08 の公開判定で消費可能な型定義になっている | 型の互換性が設計ドキュメントで示されている                           | 要確認   |

---

### Task 4: 多角的チェック

#### セキュリティ観点

| チェック項目                                                          | 確認内容                                                              | 判定   |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| Critical ツールへの恒久許可が設計上で完全に禁止されている             | `TOOL_RISK_CONFIG.critical.allowPermanent === false` が設計に存在する | 要確認 |
| `approved_once` がセッション外に永続化される設計になっていない        | `session` ポリシーが electron-store に書き込まない設計になっている    | 要確認 |
| abort フロー後に `approved_once` エントリが削除される設計になっている | クリーンアップ契約の4ステップが abort-fallback-design.md に存在する   | 要確認 |
| タイムアウト（300秒）が `denied` として処理される設計になっている     | タイムアウトフォールバックが `denied` と明記されている                | 要確認 |

#### UX・説明責任観点

| チェック項目                                                                                   | 確認内容                                                                          | 判定   |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------ |
| 権限ダイアログの説明責任テキストが具体的な影響を示している                                     | 「危険な操作を含みます」ではなく、影響範囲を具体的に記述する設計になっている      | 要確認 |
| 取り消し操作が3タップ以内で完了できる導線設計になっている                                      | Permission History Panel の「取り消す」ボタンから即座に取り消せる設計になっている | 要確認 |
| 拒否後の fallback オプション（abort/skip/retry）がユーザーに明示的に提示される設計になっている | 「拒否後オプション画面」の3択表示が abort-fallback-design.md に設計されている     | 要確認 |

#### 後方互換性観点

| チェック項目                                                                        | 確認内容                                                                           | 判定   |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------ |
| `PermissionResolver` の既存8ステップフローを破壊しない                              | 既存フローへの追加・拡張のみで、フローの削除・置換がないことが設計に明記されている | 要確認 |
| `AllowedToolEntryV2` の `expiresAt?: number` が optional で既存エントリを破壊しない | `expiresAt` が `optional` フィールドとして定義されている                           | 要確認 |
| `PERMISSION_HISTORY_MAX_ENTRIES` (1000件) の変更禁止が設計に明記されている          | Phase 2 設計禁止事項に「変更禁止」と明記されている                                 | 要確認 |
| `ALLOWED_TOOLS_WHITELIST` (11ツール) への追加・削除禁止が設計に明記されている       | Phase 2 設計禁止事項に「Task-08 スコープ」として明記されている                     | 要確認 |

---

## 参照資料

| 資料名                                               | パス                                                                                                        | 用途                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 9 QA サマリー                                  | `outputs/phase-9/qa-summary.md`                                                                             | レビュー判定の一次入力      |
| Phase 1/2 設計成果物                                 | `outputs/phase-1/*.md`, `outputs/phase-2/*.md`                                                              | AC最終突合の正本            |
| Phase 5 実装成果物                                   | `outputs/phase-5/`                                                                                          | 実装仕様との整合確認        |
| security-skill-execution                             | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                             | リスク分類の最終照合        |
| interfaces-agent-sdk-executor-details                | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                | PermissionResolver 契約照合 |
| workflow-skill-lifecycle-created-skill-usage-journey | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | Task-05 導線接続照合        |
| workflow-skill-lifecycle-evaluation-scoring-gate     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`     | ScoringGate 契約照合        |
| task-workflow                                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                        | Phase 12 同期対象の前提確認 |

---

## 実行手順

### Step 1: AC 充足確認（所要: 約60分）

1. Task 1 の AC-1〜AC-4 のチェック項目を全件確認する（合計23件）
2. 各項目に「充足判定: OK」または「充足判定: FAIL（理由: \_\_\_）」を記入する
3. 全項目の判定結果を `outputs/phase-10/ac-fulfillment-report.md` に記録する
4. `FAIL` が1件でも存在する場合は、その深刻度に応じて MAJOR/CRITICAL を判定する

### Step 2: 型定義整合確認（所要: 約20分）

1. Task 2 の5項目を確認する
2. 整合状態が期待値と一致しない場合は「不整合（修正必要）」と記録する
3. 全5項目の確認結果を `outputs/phase-10/type-integrity-report.md` に記録する
4. 不整合が存在する場合は Phase 2 の設計成果物に修正が必要（MAJOR 判定）

### Step 3: Task-03/05/08 接続確認（所要: 約40分）

1. Task 3 の接続ポイントを全件確認する（Task-03: 5件、Task-05: 4件、Task-08: 3件、合計12件）
2. 各ポイントに「確認結果: OK」または「確認結果: MISSING（欠落内容: \_\_\_）」を記入する
3. 全12件の確認結果を `outputs/phase-10/integration-report.md` に記録する
4. `MISSING` が存在する場合は設計成果物の修正が必要（MAJOR 判定）

### Step 4: 多角的チェック（所要: 約30分）

1. Task 4 のセキュリティ・UX・後方互換性の全チェック項目（合計11件）を確認する
2. 各項目に「OK」または「NG（理由: \_\_\_）」を記入する
3. 全11件の確認結果を `outputs/phase-10/multi-angle-report.md` に記録する
4. セキュリティの `NG` はCRITICAL、UX/後方互換性の `NG` はMAJOR または MINOR の対象

### Step 5: 最終判定とレビューサマリー作成（所要: 約20分）

Step 1-4 の全確認結果を集約し、`outputs/phase-10/final-review-result.md` に最終判定を記録する。

**最終判定の決定ロジック:**

1. Task 4 のセキュリティチェックに `NG` が1件以上 → **CRITICAL**（Phase 1 へ戻る）
2. Task 1 の AC に `FAIL` が1件以上、または Task 2/3 に不整合・欠落が1件以上 → **MAJOR**
   - 要件の問題（AC-1〜AC-4 の定義が不十分）→ Phase 1 へ戻る
   - 設計の問題（型定義・接続インターフェースの不備）→ Phase 2 へ戻る
3. 文言の曖昧表現残存・用語統一漏れ・参照リンク切れ・テーブルの軽微な記述不足のみ → **MINOR**
   - 全 MINOR 指摘を未タスク仕様書に変換してから Phase 11 へ進む
4. 上記のいずれも該当しない → **PASS**（Phase 11 へ進む）

---

## 統合テスト連携

本 Phase はコードを生成しないため、実装テストは存在しない。最終レビューの観点は以下の通り。

| レビュー観点   | 実施内容                                  | 合格基準                                 |
| -------------- | ----------------------------------------- | ---------------------------------------- |
| AC 充足確認    | AC-1〜AC-4 合計23項目の充足確認           | 全23件が「充足判定: OK」                 |
| 型定義整合確認 | 型依存関係5件の整合確認                   | 全5件が期待値と一致                      |
| Task 接続確認  | Task-03/05/08 合計12接続ポイントの確認    | 全12件が「確認結果: OK」                 |
| 多角的チェック | セキュリティ・UX・後方互換性 合計11件確認 | 全11件が「OK」（セキュリティは厳格審査） |

---

## 成果物

成果物はすべて `outputs/phase-10/` 配下に配置する。

| 成果物 ID | ファイルパス                                | 内容                                                                        |
| --------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| OUT-10-1  | `outputs/phase-10/ac-fulfillment-report.md` | AC-1〜AC-4 充足確認結果（23項目の判定一覧）                                 |
| OUT-10-2  | `outputs/phase-10/type-integrity-report.md` | 型定義整合確認結果（5件の依存関係の整合状態）                               |
| OUT-10-3  | `outputs/phase-10/integration-report.md`    | Task-03/05/08 接続確認結果（12接続ポイントの確認状態）                      |
| OUT-10-4  | `outputs/phase-10/multi-angle-report.md`    | 多角的チェック結果（セキュリティ4件・UX3件・後方互換性4件の判定）           |
| OUT-10-5  | `outputs/phase-10/final-review-result.md`   | 最終レビュー判定（PASS/MINOR/MAJOR/CRITICAL）と判定根拠・次アクションの記録 |

---

## 完了条件

以下の全チェックボックスを満たすことで Phase 10 完了とする。

- [ ] `outputs/phase-10/ac-fulfillment-report.md` が作成されており、AC-1〜AC-4 の全23項目の判定結果が記録されている
- [ ] `outputs/phase-10/type-integrity-report.md` が作成されており、型定義整合5件の確認結果が記録されている
- [ ] `outputs/phase-10/integration-report.md` が作成されており、Task-03/05/08 接続12件の確認結果が記録されている
- [ ] `outputs/phase-10/multi-angle-report.md` が作成されており、11件のチェック結果が記録されている
- [ ] `outputs/phase-10/final-review-result.md` が作成されており、最終判定（PASS/MINOR/MAJOR/CRITICAL）とその根拠が記録されている
- [ ] 最終判定が `MINOR` の場合、全 MINOR 指摘の未タスク仕様書が `../unassigned-task/` 配下に作成されている
- [ ] 最終判定が `MINOR` の場合、`task-workflow.md` の残課題テーブルへの登録と関連仕様書への参照リンク追加が完了している
- [ ] 最終判定が `PASS` または `MINOR`（未タスク変換完了後）の場合のみ、Phase 11 へ進む準備が整っている

---

## タスク100%実行確認【必須】

Phase 10 完了前に以下を逐次確認する。

1. **全5成果物の存在確認**: `ls outputs/phase-10/` を実行し、OUT-10-1〜OUT-10-5 の全ファイルが存在することを確認する
2. **最終判定の記録確認**: `final-review-result.md` に `PASS` / `MINOR` / `MAJOR` / `CRITICAL` の4択のいずれかが明記されていることを確認する
3. **MINOR 処理の完了確認（判定が MINOR の場合のみ）**: `../unassigned-task/` 配下に未タスク仕様書が存在し、`task-workflow.md` への登録と関連仕様書への参照リンクが追加されていることを確認する
4. **MAJOR/CRITICAL の場合の差し戻し確認**: 判定が MAJOR の場合は戻り先 Phase（Phase 1 または Phase 2）が `final-review-result.md` に明記されていることを確認する
5. **次 Phase の進行可否確認**: Phase 11 に進む条件（判定が PASS、または MINOR かつ未タスク変換完了）が満たされていることを確認する

---

## 次 Phase

Phase 11: 手動テスト

- 成果物パス: `phase-11-manual-test.md`
- 前提条件: 本ファイルの「完了条件」チェックリストが全項目チェック済みであること、かつ `final-review-result.md` の最終判定が `PASS` または `MINOR`（未タスク変換完了済み）であること
- Phase 11 でのインプット: `outputs/phase-10/` の5成果物と最終版の Phase 1-8 全成果物
- **差し戻し時の例外**: 最終判定が `MAJOR` の場合は Phase 1 または Phase 2 へ、`CRITICAL` の場合は Phase 1 へ戻り、Phase 11 へは進まない
