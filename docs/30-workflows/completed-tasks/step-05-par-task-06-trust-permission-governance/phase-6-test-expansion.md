# Phase 6: テスト拡充 - TASK-SKILL-LIFECYCLE-06 信頼・権限・ガバナンス統合

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                                          |
| Phase      | 6                                                                |
| Phase名    | テスト拡充                                                       |
| ステータス | not_started                                                      |
| 依存成果物 | `outputs/phase-4/`（7ファイル）、`outputs/phase-5/`（8ファイル） |
| ブロック先 | `phase-7-coverage-check.md`                                      |
| タスク種別 | design（設計文書の追加検証・境界値テスト仕様の拡充）             |
| 作成日     | 2026-03-16                                                       |

---

## 目的

Phase 4 のテスト仕様と Phase 5 の型定義正本を照合し、以下3種類のカバレッジ不足箇所を特定して追加テスト仕様を作成する。

1. **境界値カバレッジ不足**: 失効タイムスタンプの境界（`expiresAt === Date.now()` の等号）、retry 回数上限（3回目の境界）等
2. **組み合わせカバレッジ不足**: リスクレベル4段階 × 権限状態4モード = 16組合せのうち Phase 4 で未定義の組合せ
3. **セッションスコープ境界**: `session` ポリシーのエントリがアプリ再起動時に正しく削除されることの検証

---

## 実行タスク

- 追加テスト設計: Phase 4 の不足カバレッジを明示して拡張する
- 境界値強化: 失効ポリシー・retry・履歴上限の境界を追加検証する

### Task 1: カバレッジギャップ抽出

### Task 2: 境界値・組合せテストの拡張設計

1. Phase 4 テストケースのカバレッジギャップ分析（Phase 5 型定義との照合）
2. `approved_once` セッションスコープ境界テストの追加設計
3. 失効ポリシー4種 × リスクレベル4段階 = 16組合せの境界値テスト設計
4. リスクレベル分類の境界値テスト（Medium の `allowPermanent=true` vs High の `allowPermanent=false`）
5. 拒否後再試行の境界値テスト（2回目 OK → 3回目 abort 移行の境界）
6. 承認履歴フィルタの境界値テスト（0件・1件・1000件・1001件）
7. SafetyGatePort の安全性チェックルール優先度境界テスト
8. INS-01〜INS-03 挿入点の発火条件境界テスト
9. 追加テスト仕様を `outputs/phase-6/` に配置する

---

## 参照資料

| 資料名                                | パス                                                | 読む理由                                                             |
| ------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------- |
| Phase 4 テストシナリオインデックス    | `outputs/phase-4/test-scenario-index.md`            | 既存テストケースのカバレッジを把握し、追加が必要な箇所を特定するため |
| Phase 4 状態遷移テスト仕様            | `outputs/phase-4/tc-state-transition.md`            | 既存の状態遷移テストを把握するため                                   |
| Phase 4 デシジョンテーブル            | `outputs/phase-4/decision-table-risk-permission.md` | 組合せカバレッジのギャップ分析のため                                 |
| Phase 5 権限状態遷移図                | `outputs/phase-5/permission-state-machine.md`       | 正式化された遷移定義との照合                                         |
| Phase 5 AllowedToolEntryV2 型定義正本 | `outputs/phase-5/permission-store-interface.ts`     | 境界値テストの検証対象の確認                                         |

---

## 実行手順

### ステップ 1: カバレッジギャップ分析

Phase 4 のテストケース（TC-T/TC-ST/TC-R/TC-F の全カテゴリ）と Phase 5 の成果物を照合し、以下の観点でギャップを特定する。

| 分析観点                                                 | Phase 4 でのカバレッジ状況              | Phase 6 での追加必要性                      |
| -------------------------------------------------------- | --------------------------------------- | ------------------------------------------- |
| `expiresAt === Date.now()` の等号境界                    | TC-ST-001c（`<`）のみ                   | 追加必要（`===` の境界）                    |
| retry 回数 = 3回目の境界                                 | TC-F-003（上限到達時 abort）のみ        | 追加必要（2回目と3回目の差分）              |
| session ポリシーのアプリ再起動後削除                     | TC-ST-002a（`expiresAt=undefined`）のみ | 追加必要（再起動トリガー）                  |
| Medium/High の `allowPermanent` 境界                     | TC-T-001（値確認）のみ                  | 追加必要（ダイアログへの表示/非表示境界）   |
| 承認履歴1000件上限の等号境界                             | TC-ST-005e（1001件目）のみ              | 追加必要（999件・1000件・1001件の3点）      |
| SafetyGrade 優先度の境界（UNSAFE vs SAFE_WITH_WARNINGS） | TC-R-002（複合チェック）のみ            | 追加必要（2チェックが異なるグレードの場合） |
| INS-01 High/Critical の境界                              | Phase 4 で未定義                        | 追加必要                                    |

---

### ステップ 2: `approved_once` セッションスコープ境界テスト設計

#### TC-ST-006: session ポリシーのアプリ再起動後削除の3検証

| テストID   | シナリオ                                                               | 期待結果                                                                                    |
| ---------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| TC-ST-006a | アプリ起動中に `session` ポリシーで `Bash` を許可後、再起動            | 再起動後に `isToolAllowed("Bash") === false` を返す                                         |
| TC-ST-006b | アプリ起動中に `permanent` ポリシーで `Write` を許可後、再起動         | 再起動後に `isToolAllowed("Write") === true` を返す（持続性確認）                           |
| TC-ST-006c | `session` ポリシーのエントリが electron-store に書き込まれていないこと | `electron-store.get("allowedTools")` に `expiryPolicy: "session"` のエントリが0件であること |

#### TC-ST-007: `approved_once` 状態のセッション間分離

- **テストシナリオ**: セッション A で `Bash` を `approved_once` で承認後、セッション B（新しいアプリ起動）で同じツールを使用
- **検証内容**:
  - セッション A での `isToolAllowed("Bash") === true`
  - セッション B 開始後の `isToolAllowed("Bash") === false`
  - セッション B で再度 PermissionDialog が表示されること

---

### ステップ 3: 失効ポリシー × リスクレベル組合せ境界値テスト設計

Phase 4 の TC-ST-002 は失効ポリシー単体の `expiresAt` 計算を検証した。Phase 6 ではリスクレベルとの組み合わせ制約を検証する。

#### TC-ST-008: 失効ポリシー4種 × リスクレベル4段階の許可可否マトリクス

| テストID   | リスクレベル | 失効ポリシー | 許可ボタン表示 | 期待結果                                                             |
| ---------- | ------------ | ------------ | -------------- | -------------------------------------------------------------------- |
| TC-ST-008a | critical     | session      | 非表示         | PermissionDialog で承認ボタンが全て非表示（自動拒否）                |
| TC-ST-008b | critical     | time_24h     | 非表示         | 恒久許可ボタンが存在しないため time_24h 選択不可                     |
| TC-ST-008c | critical     | permanent    | 非表示         | 恒久許可禁止（TOOL_RISK_CONFIG.critical.allowPermanent=false）       |
| TC-ST-008d | high         | session      | 表示           | 「今回のみ」選択可能。electron-store に書き込まない                  |
| TC-ST-008e | high         | permanent    | 非表示         | 恒久許可ボタンが非表示（TOOL_RISK_CONFIG.high.allowPermanent=false） |
| TC-ST-008f | medium       | permanent    | 表示           | 恒久許可ボタンが表示。electron-store に永続化                        |
| TC-ST-008g | low          | permanent    | 表示           | 恒久許可ボタンが表示。electron-store に永続化                        |
| TC-ST-008h | medium       | time_24h     | 表示           | `expiresAt = allowedAt + 86400000` で保存                            |
| TC-ST-008i | low          | time_7d      | 表示           | `expiresAt = allowedAt + 604800000` で保存                           |

---

### ステップ 4: リスクレベル分類の境界値テスト設計

Medium と High の境界（`allowPermanent` の差分）に着目して検証する。

#### TC-T-007: Medium/High 境界の `allowPermanent` 差分検証

- **テストシナリオ**: PermissionDialog のボタン表示制御ロジックに Medium ツールと High ツールを入力した場合
- **検証内容**:
  - Medium ツール（例: `Write`）のダイアログに「常に許可」ボタンが表示されること
  - High ツール（例: `Bash` + `chmod 777` 相当）のダイアログに「常に許可」ボタンが非表示であること
  - 境界判定ロジック: `TOOL_RISK_CONFIG[riskLevel].allowPermanent === true` の条件がダイアログ表示制御に正しく使われていること

#### TC-T-008: ツール名からリスクレベルへのマッピング境界テスト

`security-skill-execution.md` の DANGEROUS_PATTERNS を参照し、パターンマッチングの境界を検証する。

| テストID  | ツール名/コマンド                    | 期待リスクレベル | 境界内容                                        |
| --------- | ------------------------------------ | ---------------- | ----------------------------------------------- |
| TC-T-008a | `rm -rf /tmp/test`（限定的パス）     | `critical`       | パス限定でも `rm -rf` パターン自体が Critical   |
| TC-T-008b | `chmod 644 /tmp/test`（安全な権限）  | `high`           | ファイル権限変更は `chmod 777` 以外でも High    |
| TC-T-008c | `bash -c "echo hello"`（無害な内容） | `high`           | `bash -c` パターン自体が High（内容に関係なし） |
| TC-T-008d | `WebFetch https://api.example.com`   | `low`            | 外部 HTTP は Low（`WebFetch` ツール）           |

---

### ステップ 5: 拒否後再試行の境界値テスト設計

Phase 4 の TC-F-003 は「3回目で abort 移行」を検証した。Phase 6 では「2回目 OK → 3回目 abort」の境界を詳細に検証する。

#### TC-F-005: retry 回数の境界値検証

| テストID  | 試行回数    | 操作                             | 期待結果                                                           |
| --------- | ----------- | -------------------------------- | ------------------------------------------------------------------ |
| TC-F-005a | 1回目       | 拒否 → 「別の方法で実行」        | PermissionDialog が再表示される（retry count = 1）                 |
| TC-F-005b | 2回目       | 拒否 → 「別の方法で実行」        | PermissionDialog が再表示される（retry count = 2）                 |
| TC-F-005c | 3回目       | 拒否 → 「別の方法で実行」        | abort フロー①が起動される（MAX_PERMISSION_RETRY_COUNT = 3 に到達） |
| TC-F-005d | 2回目で許可 | 拒否 → 再表示 → 「今回のみ許可」 | retry count がリセットされること（次回は再び1から）                |

#### TC-F-006: タイムアウト境界値検証

| テストID  | 経過時間                         | 期待結果                                                    |
| --------- | -------------------------------- | ----------------------------------------------------------- |
| TC-F-006a | `DEFAULT_TIMEOUT_MS - 1` ms 経過 | タイムアウトが発生しないこと（PermissionDialog が継続表示） |
| TC-F-006b | `DEFAULT_TIMEOUT_MS` ms 経過     | abort フロー①が自動起動されること                           |
| TC-F-006c | タイムアウト前に許可操作         | タイムアウトタイマーがキャンセルされること                  |

---

### ステップ 6: 承認履歴フィルタの境界値テスト設計

Phase 4 の TC-ST-005e は「1001件目の追加時に最古エントリが削除される」を検証した。Phase 6 では前後の境界を詳細に検証する。

#### TC-ST-009: 承認履歴上限の3点境界値テスト

| テストID   | 操作                       | 期待結果                                               |
| ---------- | -------------------------- | ------------------------------------------------------ |
| TC-ST-009a | 999件の状態でエントリ追加  | 全1000件保持（削除なし）                               |
| TC-ST-009b | 1000件の状態でエントリ追加 | 全1000件保持（最古エントリが削除されて1000件に戻る）   |
| TC-ST-009c | 0件の状態でエントリ削除    | エラーが発生しないこと（空配列の削除を安全に処理する） |

#### TC-ST-010: フィルタ条件の組み合わせ境界値テスト

| テストID   | フィルタ条件                         | 期待結果                                             |
| ---------- | ------------------------------------ | ---------------------------------------------------- |
| TC-ST-010a | ツール名フィルタ（一致0件）          | 空配列を返すこと（null や undefined ではない）       |
| TC-ST-010b | 判断結果フィルタ（`revoked`）        | `revokedAt` フィールドを持つエントリのみ返すこと     |
| TC-ST-010c | ツール名 + 判断結果の複合フィルタ    | 両条件を満たすエントリのみ返すこと（AND 条件）       |
| TC-ST-010d | 期間フィルタ（`allowedAt` の境界値） | 期間境界の等号（`>=` と `<=`）が正しく処理されること |

---

### ステップ 7: SafetyGatePort 安全性チェックルール優先度境界テスト設計

Phase 4 の TC-R-002 は CRITICAL + HIGH の複合チェックを検証した。Phase 6 では全組合せの優先度境界を検証する。

#### TC-R-005: SafetyGrade 優先度の全組合せテスト

| テストID  | 適用チェック組合せ                                | 期待 `overallGrade`  | 優先度ルール                                 |
| --------- | ------------------------------------------------- | -------------------- | -------------------------------------------- |
| TC-R-005a | `CRITICAL_TOOL_REQUIRED` のみ                     | `UNSAFE`             | Critical 単独は UNSAFE                       |
| TC-R-005b | `CRITICAL_TOOL_REQUIRED` + `ALL_LOW_TOOLS`        | `UNSAFE`             | UNSAFE が最優先（矛盾組合せも UNSAFE）       |
| TC-R-005c | `HIGH_TOOL_REQUIRED` + `NO_PERMANENT_APPROVAL`    | `SAFE_WITH_WARNINGS` | SAFE_WITH_WARNINGS 同士 = SAFE_WITH_WARNINGS |
| TC-R-005d | `ALL_LOW_TOOLS` + `NO_PERMANENT_APPROVAL`         | `SAFE_WITH_WARNINGS` | SAFE_WITH_WARNINGS が SAFE に優先            |
| TC-R-005e | `ALL_LOW_TOOLS` のみ                              | `SAFE`               | SAFE ルールのみ = SAFE                       |
| TC-R-005f | `PROTECTED_PATH_ACCESS` + `ALL_LOW_TOOLS`         | `UNSAFE`             | PROTECTED_PATH は UNSAFE（Low でも）         |
| TC-R-005g | チェック対象ルールが0件（スキルにツール要求なし） | `SAFE`               | 空のチェックは SAFE として扱う               |

---

### ステップ 8: INS-01〜INS-03 挿入点の発火条件境界テスト設計

Phase 5 の `accountability-ui-spec.md` で確定した発火条件の境界を検証する。

#### TC-F-007: INS-01 発火条件の境界テスト（CTA 画面の権限サマリーバナー）

| テストID  | スキルのツール構成                     | 期待表示                                                |
| --------- | -------------------------------------- | ------------------------------------------------------- |
| TC-F-007a | 全ツールが `low`（dialogWidth=400）    | バナー非表示（`dialogWidth >= 480` の条件を満たさない） |
| TC-F-007b | `medium`（dialogWidth=400）のみ        | バナー非表示（medium の dialogWidth=400 < 480）         |
| TC-F-007c | `high`（dialogWidth=480）を1件含む     | バナー表示（480 >= 480 の境界等号で表示）               |
| TC-F-007d | `critical`（dialogWidth=640）を1件含む | バナー表示（640 >= 480）                                |
| TC-F-007e | `high` × 1件 + `low` × 3件             | バナー表示（high が1件でも含まれれば表示）              |

#### TC-F-008: INS-02 発火条件の境界テスト（実行中の権限確認インジケーター）

| テストID  | `pendingCount` 値              | 期待表示                               |
| --------- | ------------------------------ | -------------------------------------- |
| TC-F-008a | `0`                            | インジケーター非表示                   |
| TC-F-008b | `1`                            | インジケーター表示（0から1への境界）   |
| TC-F-008c | `pendingCount` が `0` に戻った | インジケーターが非表示に切り替わること |

#### TC-F-009: INS-03 発火条件の境界テスト（実行結果の権限サマリー）

| テストID  | セッション中の権限承認件数 | 期待表示                                                                      |
| --------- | -------------------------- | ----------------------------------------------------------------------------- |
| TC-F-009a | `0`件                      | サマリー非表示                                                                |
| TC-F-009b | `1`件                      | サマリー表示（0から1への境界）                                                |
| TC-F-009c | `denied` のみ（承認なし）  | サマリー非表示（`denied` は `sessionPermissionHistory` に含めない設計を確認） |

---

## 統合テスト連携

| 追加テストカテゴリ | 対応する Phase 5 成果物                           | 主な境界条件                                     |
| ------------------ | ------------------------------------------------- | ------------------------------------------------ |
| TC-ST-006〜007     | `outputs/phase-5/permission-state-machine.md`     | session ポリシーの再起動後削除、セッション間分離 |
| TC-ST-008          | `outputs/phase-5/security.ts`（TOOL_RISK_CONFIG） | リスクレベル × 失効ポリシーの許可可否制約        |
| TC-T-007〜008      | `outputs/phase-5/security.ts`（TOOL_RISK_CONFIG） | Medium/High 境界の `allowPermanent` 差分         |
| TC-F-005〜006      | `outputs/phase-5/abort-fallback-contract.md`      | retry 3回目の境界、タイムアウト等号境界          |
| TC-ST-009〜010     | `outputs/phase-5/permission-store-interface.ts`   | 承認履歴1000件上限の前後、フィルタ空結果         |
| TC-R-005           | `outputs/phase-5/safety-gate.ts`（SafetyCheckId） | SafetyGrade 優先度の全7組合せ                    |
| TC-F-007〜009      | `outputs/phase-5/accountability-ui-spec.md`       | INS-01〜03 の発火条件境界（等号を含む）          |

---

## 成果物

成果物は全て `outputs/phase-6/` 配下に配置する。

| 成果物ファイル名                                  | 内容                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| `outputs/phase-6/coverage-gap-analysis.md`        | Phase 4 テストのカバレッジギャップ分析結果（7観点の追加必要性）     |
| `outputs/phase-6/tc-session-scope-boundary.md`    | セッションスコープ境界テスト仕様（TC-ST-006〜007）                  |
| `outputs/phase-6/tc-expiry-risk-matrix.md`        | 失効ポリシー × リスクレベル組合せテスト仕様（TC-ST-008 の 9組合せ） |
| `outputs/phase-6/tc-risk-level-boundary.md`       | リスクレベル分類境界値テスト仕様（TC-T-007〜008）                   |
| `outputs/phase-6/tc-retry-timeout-boundary.md`    | retry 境界値・タイムアウト境界値テスト仕様（TC-F-005〜006）         |
| `outputs/phase-6/tc-history-boundary.md`          | 承認履歴上限境界値・フィルタ境界値テスト仕様（TC-ST-009〜010）      |
| `outputs/phase-6/tc-safety-grade-priority.md`     | SafetyGrade 優先度全組合せテスト仕様（TC-R-005 の7組合せ）          |
| `outputs/phase-6/tc-ins-boundary.md`              | INS-01〜03 発火条件境界値テスト仕様（TC-F-007〜009）                |
| `outputs/phase-6/expanded-test-scenario-index.md` | Phase 4 + Phase 6 追加分の全テストケース統合インデックス            |

---

## 完了条件

- [ ] `coverage-gap-analysis.md` に Phase 4 の7観点のカバレッジギャップが列挙されていること
- [ ] セッションスコープ境界テスト（TC-ST-006〜007）が定義されていること
- [ ] 失効ポリシー × リスクレベルの9組合せ（TC-ST-008a〜i）が全て定義されていること
- [ ] Medium/High の `allowPermanent` 境界テスト（TC-T-007）が定義されていること
- [ ] retry 3回目の境界と2回目の差分（TC-F-005b〜c）が定義されていること
- [ ] タイムアウト等号境界（TC-F-006a〜b）が定義されていること
- [ ] 承認履歴3点境界値（999件・1000件・1001件）テスト（TC-ST-009）が定義されていること
- [ ] SafetyGrade 優先度7組合せ（TC-R-005a〜g）が全て定義されていること
- [ ] INS-01 の dialogWidth 境界（400 < 480 = 480 < 640）テスト（TC-F-007）が定義されていること
- [ ] `expanded-test-scenario-index.md` に Phase 4 + Phase 6 の全テストケースが統合されていること
- [ ] 成果物9ファイルが `outputs/phase-6/` 配下に存在すること

---

## タスク100%実行確認【必須】

以下を全て確認してから「完了」と記録すること。

- [ ] Phase 4 テストのカバレッジギャップ分析を実施し、7観点を全て `coverage-gap-analysis.md` に記録したことを確認した
- [ ] `expiresAt === Date.now()` の等号境界が追加テストに含まれていることを確認した
- [ ] retry 2回目（OK）→ 3回目（abort）の境界差分が TC-F-005b/c で検証されていることを確認した
- [ ] INS-01 の `dialogWidth >= 480` 境界（high=480 が等号で表示される）が TC-F-007c で検証されていることを確認した
- [ ] SafetyGrade 優先度の矛盾組合せ（CRITICAL + ALL_LOW_TOOLS）が TC-R-005b で検証されていることを確認した
- [ ] 全9成果物ファイルが `outputs/phase-6/` 配下に存在することを `ls` で確認した

---

## 次 Phase

**Phase 7: カバレッジ確認** (`phase-7-coverage-check.md`)

Phase 7 開始条件: 本ファイルの「完了条件」チェックリストが全項目 CHECKED であること。

Phase 7 への引き継ぎ事項:

- `outputs/phase-6/expanded-test-scenario-index.md` を Phase 7 のカバレッジ確認の基準とすること
- TC-ST-008 の9組合せマトリクスを Phase 7 のカバレッジ確認テーブルに組み込むこと
- TC-R-005 の7組合せを Phase 7 の SafetyGate カバレッジ確認に使用すること
