# Phase 4: テスト作成 - TASK-SKILL-LIFECYCLE-06 信頼・権限・ガバナンス統合

## メタ情報

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                                                               |
| Phase      | 4                                                                                     |
| Phase名    | テスト作成                                                                            |
| ステータス | not_started                                                                           |
| 依存成果物 | `phase-3-design-review.md`（PASS または MINOR 判定）、`outputs/phase-2/`（5ファイル） |
| ブロック先 | `phase-5-implementation.md`                                                           |
| タスク種別 | design（設計文書・型定義・インターフェース契約の検証テスト作成）                      |
| 作成日     | 2026-03-16                                                                            |

---

## 目的

設計タスクとして、Phase 2 で定義した型定義・インターフェース契約・状態遷移ルール・安全性チェックルールの**整合性と完全性を検証するテスト仕様**を作成する。

実コード実装ではなく、以下の3種類の検証を設計する。

1. **契約整合性チェック**: 型定義と呼び出し元の引数・戻り値の一致検証（型レベルの契約テスト）
2. **状態遷移テーブル検証**: リスクレベル × 権限状態 × 失効ポリシーの全組み合わせを網羅するデシジョンテーブル
3. **設計文書完全性チェック**: Phase 2 成果物の必須項目が漏れなく定義されていることを確認するチェックリスト形式テスト

---

## 実行タスク

- テスト設計定義: 正常系・異常系・境界値をカテゴリ単位で網羅する
- 契約検証仕様化: Phase 2設計とTask-03/05/08接続を検証可能な形にする

### Task 1: テストカテゴリ定義とケース設計

### Task 2: 契約整合チェックと成果物出力

1. 権限要求フローのテストシナリオ設計（正常系・異常系・境界値）
2. ToolRiskConfig の全4リスクレベル分岐テスト設計
3. AllowedToolEntryV2 失効チェックロジックのテスト設計
4. 拒否時 fallback フロー（abort/skip/retry）のテスト設計
5. SafetyGatePort インターフェースのテスト設計
6. 承認履歴 CRUD 操作テスト設計
7. 危険操作ブロックテスト設計（DANGEROUS_PATTERNS との照合）
8. 契約整合性チェックスクリプトの仕様定義
9. テスト成果物を `outputs/phase-4/` に配置する

---

## 参照資料

| 資料名                                | パス                                                                                                                | 読む理由                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Phase 1 要件成果物                    | `outputs/phase-1/`（5ファイル）                                                                                     | AC-1〜AC-4 をテスト観点へ変換するため            |
| Phase 2 設計成果物                    | `outputs/phase-2/`（5ファイル）                                                                                     | テスト対象の型定義・ルール定義の確認             |
| Phase 3 設計レビューレポート          | `outputs/phase-3/design-review-report.md`                                                                           | MINOR 指摘事項をテストケースに反映するため       |
| security-skill-execution              | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                     | DANGEROUS_PATTERNS の正本確認                    |
| interfaces-agent-sdk-executor-details | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                        | PermissionResolver 8ステップフローのテスト設計元 |
| arch-state-management-permissions     | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | permissionHistorySlice のスキーマ確認            |

---

## 実行手順

### ステップ 1: テストカテゴリの分類

全テストケースを以下の4カテゴリに分類する。

| カテゴリ             | 略称  | 説明                                                                |
| -------------------- | ----- | ------------------------------------------------------------------- |
| 型契約テスト         | TC-T  | TypeScript 型定義の整合性・必須フィールド・オプションフィールド検証 |
| 状態遷移テスト       | TC-ST | 権限状態遷移（denied→approved_once→approved→revoked）の検証         |
| ルールロジックテスト | TC-R  | ToolRiskConfig ルール・失効ポリシー・安全性チェックルール検証       |
| 統合フローテスト     | TC-F  | abort/skip/retry フローのエンドツーエンド検証                       |

---

### ステップ 2: ToolRiskConfig テストケース設計

#### TC-T-001: ToolRiskConfig 型定義の必須フィールド検証

- **検証対象**: `packages/shared/src/constants/security.ts` の `TOOL_RISK_CONFIG`
- **検証内容**:
  - `TOOL_RISK_CONFIG` が `critical` / `high` / `medium` / `low` の全4キーを持つこと
  - 各エントリが `level`, `allowApproveOnce`, `allowPermanent`, `autoDenyDefault`, `headerColorToken`, `dialogWidth` の全フィールドを持つこと
  - `critical.allowPermanent === false` かつ `critical.allowApproveOnce === false` であること（セキュリティ不変条件）
  - `critical.autoDenyDefault === true` であること
  - `high.allowPermanent === false` かつ `high.allowApproveOnce === true` であること
  - `medium.allowPermanent === true` かつ `medium.allowApproveOnce === true` であること
  - `low.allowPermanent === true` かつ `low.allowApproveOnce === true` であること

#### TC-T-002: dialogWidth の型制約検証

- **検証内容**:
  - `critical.dialogWidth === 640`
  - `high.dialogWidth === 480`
  - `medium.dialogWidth === 400`
  - `low.dialogWidth === 400`
  - `dialogWidth` の値が `400 | 480 | 640` の union 型以外の値を持たないこと

#### TC-T-003: headerColorToken の形式検証

- **検証内容**:
  - 全4レベルの `headerColorToken` が `--` で始まる CSS 変数名形式であること（正規表現 `/^--[a-z-]+$/` にマッチ）
  - 各レベルで異なる値が設定されていること（重複なし）

---

### ステップ 3: AllowedToolEntryV2 失効チェックテスト設計

#### TC-T-004: AllowedToolEntryV2 型定義の後方互換検証

- **検証内容**:
  - `AllowedToolEntryV2` が `AllowedToolEntry`（`toolName: string`, `allowedAt: number`）を extends していること
  - `expiresAt` フィールドが `number | undefined`（オプショナル）であること
  - `skillName` フィールドが `string | undefined`（オプショナル）であること
  - `expiryPolicy` フィールドが `"session" | "time_24h" | "time_7d" | "permanent" | undefined` であること
  - 既存の `AllowedToolEntry`（`expiresAt` なし）が `AllowedToolEntryV2` 型に代入可能であること

#### TC-ST-001: 失効チェックフロー 6分岐の網羅テスト

`isToolAllowed(toolName, skillName?)` の失効チェックフロー全分岐を検証する。

| テストID   | 条件                                           | 期待結果                                    |
| ---------- | ---------------------------------------------- | ------------------------------------------- |
| TC-ST-001a | entry が存在しない                             | `false` を返す                              |
| TC-ST-001b | entry が存在し `expiresAt` が `undefined`      | `true` を返す（無期限）                     |
| TC-ST-001c | entry が存在し `expiresAt < Date.now()`        | `false` を返し、electron-store から削除する |
| TC-ST-001d | entry が存在し `expiresAt >= Date.now()`       | `true` を返す（有効期限内）                 |
| TC-ST-001e | `skillName` が定義されており呼び出し時と不一致 | `false` を返す                              |
| TC-ST-001f | `skillName` が定義されており呼び出し時と一致   | `true` を返す                               |

#### TC-ST-002: 失効ポリシー4種の expiresAt 計算検証

| テストID   | ポリシー    | 期待する expiresAt                           |
| ---------- | ----------- | -------------------------------------------- |
| TC-ST-002a | `session`   | `undefined`（electron-store に書き込まない） |
| TC-ST-002b | `time_24h`  | `allowedAt + 86400000`（24時間後）           |
| TC-ST-002c | `time_7d`   | `allowedAt + 604800000`（7日後）             |
| TC-ST-002d | `permanent` | `undefined`（明示的取り消しまで有効）        |

---

### ステップ 4: 権限状態遷移テスト設計

#### TC-ST-003: 権限状態の有効遷移パスの網羅

| 遷移元                           | 遷移先          | トリガー操作                                    | 正常遷移 |
| -------------------------------- | --------------- | ----------------------------------------------- | -------- |
| `denied`                         | `approved_once` | PermissionDialog で「今回のみ許可」選択         | OK       |
| `denied`                         | `approved`      | PermissionDialog で「常に許可」選択（Medium+）  | OK       |
| `approved_once`                  | `denied`        | セッション終了（アプリ再起動）                  | OK       |
| `approved`                       | `revoked`       | Permission History Panel で「取り消す」クリック | OK       |
| `revoked`                        | `denied`        | 取り消し後の初回使用時                          | OK       |
| `critical`ツール→`approved`      | -               | 「常に許可」ボタンが非表示のため不可能          | 禁止     |
| `critical`ツール→`approved_once` | -               | SKILL_EXECUTOR_AUTO_DENY=ON 時は不可            | 条件付き |

#### TC-ST-004: revoked 状態のバッジ表示色検証

- **検証内容**:
  - `revokedAt` フィールドが設定されたエントリのバッジ色トークンが `--text-secondary`（灰色）であること
  - `approved` 状態のバッジ色トークンが `--status-primary`（または approved 用のトークン）であること
  - `denied` 状態のバッジ色トークンが `--status-destructive` であること

---

### ステップ 5: 拒否時 fallback フローテスト設計

#### TC-F-001: abort フロー（フロー①）の4ステップ検証

- **テストシナリオ**: PermissionDialog で「拒否」→「スキルを中断する」選択
- **検証内容**:
  1. `PermissionResolver.cancelAll()` が呼び出されること
  2. セッション中の `approve_once`（`expiryPolicy: "session"`）エントリが PermissionStore から削除されること
  3. 実行ログに `{ event: "aborted", reason: "permission_denied", timestamp: <number> }` が記録されること
  4. Renderer に `skill:execution:aborted` IPC イベントが送信されること

#### TC-F-002: skip フロー（フロー②）の検証

- **テストシナリオ**: PermissionDialog で「拒否」→「この操作をスキップして続行」選択
- **検証内容**:
  - SkillExecutor が `{ approved: false, skip: true }` を受け取ること
  - SkillExecutor が当該ツール使用をスキップして後続処理を続行すること
  - `permissionHistorySlice` に `decision: "denied"` が1件記録されること
  - スキル実行自体は完了状態になること（中断しない）

#### TC-F-003: retry フロー（フロー③）の最大3回制限検証

- **テストシナリオ**: PermissionDialog で「拒否」→「別の方法で実行する」選択 を3回繰り返す
- **検証内容**:
  - 1回目: PermissionDialog が再表示されること
  - 2回目: PermissionDialog が再表示されること
  - 3回目（上限）: PermissionDialog が表示されず abort フロー①に移行すること
  - `permissionHistorySlice` に `decision: "denied"` が1件のみ記録されること（初回のみ）

#### TC-F-004: タイムアウト（300秒）による自動 abort 検証

- **テストシナリオ**: `PermissionResolver.DEFAULT_TIMEOUT_MS`（300000ms）経過後の自動処理
- **検証内容**:
  - タイムアウト後に abort フロー①が自動実行されること
  - `PermissionResolver.DEFAULT_TIMEOUT_MS` の値が変更されていないこと（300000ms 固定）

---

### ステップ 6: SafetyGatePort テスト設計

#### TC-T-005: SafetyGatePort インターフェース契約検証

- **検証内容**:
  - `SafetyGatePort.evaluate` メソッドが `(skillName: string) => Promise<SafetyGateResult>` シグネチャであること
  - `SafetyGateResult` が `skillName`, `evaluatedAt`, `overallGrade`, `details` の全フィールドを持つこと
  - `overallGrade` が `"SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE"` の union 型であること
  - `SafetyCheckDetail` が `checkId`, `toolName`, `riskLevel`, `status`, `message` の全フィールドを持つこと
  - `status` が `"passed" | "warned" | "blocked"` の union 型であること

#### TC-R-001: 安全性チェックルール5件のデシジョンテーブルテスト

| テストID  | チェックID               | 条件                                                       | 期待 `overallGrade`  |
| --------- | ------------------------ | ---------------------------------------------------------- | -------------------- |
| TC-R-001a | `CRITICAL_TOOL_REQUIRED` | スキルが `rm -rf` 等の Critical ツールを要求する           | `UNSAFE`             |
| TC-R-001b | `HIGH_TOOL_REQUIRED`     | スキルが `Bash` 等の High ツールのみを要求する             | `SAFE_WITH_WARNINGS` |
| TC-R-001c | `NO_PERMANENT_APPROVAL`  | 全ツールが `session` または `approve_once` のみ            | `SAFE_WITH_WARNINGS` |
| TC-R-001d | `ALL_LOW_TOOLS`          | スキルが全て Low リスクツール（Read/Glob/Grep 等）のみ要求 | `SAFE`               |
| TC-R-001e | `PROTECTED_PATH_ACCESS`  | スキルが `PROTECTED_PATHS` に Write/Edit を要求する        | `UNSAFE`             |

#### TC-R-002: 複合チェック（複数ルール同時適用）の優先度テスト

- **テストシナリオ**: `CRITICAL_TOOL_REQUIRED` と `HIGH_TOOL_REQUIRED` が両方マッチする場合
- **検証内容**: `overallGrade` が `UNSAFE`（Critical が優先）になること
- **テストシナリオ2**: `HIGH_TOOL_REQUIRED` と `ALL_LOW_TOOLS` が競合する場合（設計上発生しないことを確認）
- **検証内容**: エラーではなく `SAFE_WITH_WARNINGS`（High が優先）になること

---

### ステップ 7: 承認履歴 CRUD テスト設計

#### TC-ST-005: permissionHistorySlice CRUD 操作テスト

| テストID   | 操作                         | 検証内容                                                            |
| ---------- | ---------------------------- | ------------------------------------------------------------------- |
| TC-ST-005a | 承認履歴エントリ追加         | `addPermissionHistory` action で新規エントリが追加されること        |
| TC-ST-005b | 承認履歴エントリ取り消し     | `revokePermission` action で `revokedAt` フィールドが設定されること |
| TC-ST-005c | 承認履歴フィルタ（ツール名） | `toolName` でフィルタした結果が一致するエントリのみ返ること         |
| TC-ST-005d | 承認履歴フィルタ（判断結果） | `decision` でフィルタした結果が一致するエントリのみ返ること         |
| TC-ST-005e | 承認履歴上限（1000件）確認   | 1001件目の追加時に最古エントリが削除されること                      |
| TC-ST-005f | 全件クリア                   | `clearAllPermissions` action で全エントリが削除されること           |

---

### ステップ 8: 危険操作ブロックテスト設計

#### TC-R-003: DANGEROUS_PATTERNS 照合テスト（Critical ツール判定）

`security-skill-execution.md` に記載の DANGEROUS_PATTERNS と `TOOL_RISK_CONFIG.critical` の対応を検証する。

| テストID  | 操作パターン            | 期待リスクレベル |
| --------- | ----------------------- | ---------------- | ---------- |
| TC-R-003a | `rm -rf /`              | `critical`       |
| TC-R-003b | `sudo <任意のコマンド>` | `critical`       |
| TC-R-003c | `curl <URL>             | sh`              | `critical` |
| TC-R-003d | フォークボム（`: (){ :  | :& };:`）        | `critical` |
| TC-R-003e | `chmod 777 <パス>`      | `high`           |
| TC-R-003f | `eval "<コード>"`       | `high`           |
| TC-R-003g | `Write` ツール使用      | `medium`         |
| TC-R-003h | `Read` ツール使用       | `low`            |

#### TC-R-004: 自動拒否（autoDenyDefault）動作テスト

- **テストシナリオ**: `SKILL_EXECUTOR_AUTO_DENY=ON` の設定で Critical ツールを含むスキルを実行
- **検証内容**:
  - PermissionDialog が表示されずに自動的に `decision: "denied"` が返されること
  - `permissionHistorySlice` に `decision: "denied"`, `reason: "auto_deny_critical"` が記録されること
  - abort フロー①が実行されること

---

### ステップ 9: 契約整合性チェックスクリプト仕様定義

#### TC-T-006: 設計文書完全性チェックスクリプトの仕様

Phase 5 で作成する型定義ファイルを検証するスクリプト（`scripts/validate-trust-governance-design.ts`）の仕様を定義する。

```
検証スクリプトの実行内容:
1. packages/shared/src/constants/security.ts の TOOL_RISK_CONFIG を読み込み、
   全4リスクレベルが定義されていることを確認する
2. TOOL_RISK_CONFIG.critical.allowPermanent === false を検証する
3. TOOL_RISK_CONFIG.critical.allowApproveOnce === false を検証する
4. packages/shared/src/types/safety-gate.ts の SafetyGatePort.evaluate の
   シグネチャが (skillName: string) => Promise<SafetyGateResult> であることを確認する
5. AllowedToolEntryV2.expiresAt が optional (?) であることを確認する
6. 安全性チェックルール5件（CRITICAL_TOOL_REQUIRED 等）が全て定義されていることを確認する

期待する出力:
  PASS: 全6項目が検証成功
  FAIL: 検証失敗した項目名と期待値・実際値を列挙
```

---

## 統合テスト連携

| テスト種別 | テスト対象                                | Phase 5 成果物との対応                                         |
| ---------- | ----------------------------------------- | -------------------------------------------------------------- |
| TC-T       | `TOOL_RISK_CONFIG` 型定義                 | `outputs/phase-5/security-ts` の正式版型定義                   |
| TC-ST      | `AllowedToolEntryV2` 失効チェックロジック | `outputs/phase-5/permission-store-interface.ts` のメソッド仕様 |
| TC-R       | `SafetyGatePort.evaluate()` ルール        | `outputs/phase-5/safety-gate-ts` の正式版型定義                |
| TC-F       | abort/skip/retry フロー                   | `outputs/phase-5/abort-fallback-contract.md` のフロー定義      |

---

## 成果物

成果物は全て `outputs/phase-4/` 配下に配置する。

| 成果物ファイル名                                    | 内容                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `outputs/phase-4/test-scenario-index.md`            | 全テストケース一覧（カテゴリ別インデックス、36件）                 |
| `outputs/phase-4/tc-type-contract.md`               | 型契約テスト仕様（TC-T-001〜TC-T-006）                             |
| `outputs/phase-4/tc-state-transition.md`            | 状態遷移テスト仕様（TC-ST-001〜TC-ST-005）                         |
| `outputs/phase-4/tc-rule-logic.md`                  | ルールロジックテスト仕様（TC-R-001〜TC-R-004）                     |
| `outputs/phase-4/tc-flow.md`                        | 統合フローテスト仕様（TC-F-001〜TC-F-004）                         |
| `outputs/phase-4/validate-design-script-spec.md`    | 契約整合性チェックスクリプト仕様（TC-T-006 の詳細仕様）            |
| `outputs/phase-4/decision-table-risk-permission.md` | リスクレベル4段階 × 権限状態4モード = 16組合せのデシジョンテーブル |

---

## 完了条件

- [ ] 全テストケース（TC-T / TC-ST / TC-R / TC-F の全カテゴリ）が `test-scenario-index.md` に列挙されている
- [ ] `TOOL_RISK_CONFIG.critical.allowPermanent === false` の不変条件を検証するテストケースが存在する
- [ ] 失効チェックフロー6分岐（TC-ST-001a〜f）が全て定義されている
- [ ] 失効ポリシー4種（TC-ST-002a〜d）の `expiresAt` 計算検証が定義されている
- [ ] 安全性チェックルール5件（TC-R-001a〜e）のデシジョンテーブルが定義されている
- [ ] abort フロー①の4ステップ（TC-F-001）が全て検証対象に含まれている
- [ ] retry フロー③の最大3回制限（TC-F-003）が検証対象に含まれている
- [ ] 契約整合性チェックスクリプト仕様（TC-T-006）が定義されている
- [ ] 成果物7ファイルが `outputs/phase-4/` 配下に存在する

---

## タスク100%実行確認【必須】

以下を全て確認してから「完了」と記録すること。

- [ ] TC-T / TC-ST / TC-R / TC-F の全カテゴリにテストケースが存在することを確認した
- [ ] `TOOL_RISK_CONFIG.critical.allowPermanent === false` の不変条件テストが含まれていることを確認した
- [ ] 全テストケースが曖昧語を使わず、具体的な検証内容で定義されていることを確認した
- [ ] 設計タスクとして「型定義・設計文書の検証」が中心であり、実コード実装テストと混同していないことを確認した
- [ ] 決定テーブル（リスクレベル × 権限状態）の16組み合わせが `decision-table-risk-permission.md` に定義されていることを確認した
- [ ] Phase 5 成果物との対応表（統合テスト連携セクション）が記載されていることを確認した

---

## 次 Phase

**Phase 5: 実装** (`phase-5-implementation.md`)

Phase 5 開始条件: 本ファイルの「完了条件」チェックリストが全項目 CHECKED であること。

Phase 5 への引き継ぎ事項:

- `outputs/phase-4/tc-type-contract.md` の TC-T-001〜006 を Phase 5 の型定義作成時に参照すること
- `validate-design-script-spec.md` の仕様に従い Phase 5 で検証スクリプトを作成すること
- `decision-table-risk-permission.md` のデシジョンテーブルを Phase 5 の型定義に反映すること
