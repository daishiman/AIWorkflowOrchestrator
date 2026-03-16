# Phase 6 カバレッジギャップ分析

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06            |
| Phase      | 6 - テスト拡充                     |
| 作成日     | 2026-03-16                         |
| 対象 Phase | Phase 4 テストケースのギャップ分析 |
| 成果物     | Phase 6 追加テストケースの根拠文書 |

## 目的

Phase 4 で作成したテストケース群に対して、境界値・組合せ条件・状態遷移の観点から不足している検証箇所を特定し、Phase 6 での追加テストケースIDと期待結果を定義する。

---

## ギャップ分析サマリー

| 分析観点                                                 | Phase 4 既存テストID                        | 不足している境界条件                                       | Phase 6 追加テストID               | 追加テスト概要                                                    |
| -------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| `expiresAt === Date.now()` の等号境界                    | TC-ST-001c（`expiresAt < Date.now()` のみ） | `expiresAt === Date.now()` の等号一致時の扱い              | TC-ST-009a, TC-ST-009b             | 等号境界を期限切れとして扱うか否かの境界検証                      |
| retry 回数 = 3回目の境界                                 | TC-F-003（上限到達時 abort のみ）           | 2回目と3回目の差分（2回目は再試行、3回目は abort）         | TC-F-005, TC-F-006                 | retry カウント 2→3 の遷移境界検証                                 |
| session ポリシーのアプリ再起動後削除                     | TC-ST-002a（`expiresAt=undefined` のみ）    | 再起動トリガーによる session エントリ削除                  | TC-ST-006a, TC-ST-006b, TC-ST-006c | 再起動前後の isToolAllowed 値変化                                 |
| Medium/High の `allowPermanent` 境界                     | TC-T-001（TOOL_RISK_CONFIG の値確認のみ）   | ダイアログへの表示/非表示の境界（high=false, medium=true） | TC-T-007, TC-T-008                 | `allowPermanent` フラグがダイアログ UI に反映されることの境界検証 |
| 承認履歴1000件上限の等号境界                             | TC-ST-005e（1001件目で上限超過）            | 999件・1000件・1001件の3点境界                             | TC-ST-010a, TC-ST-010b, TC-ST-010c | 上限等号境界での追加可否と上限超過時の削除動作                    |
| SafetyGrade 優先度の境界（UNSAFE vs SAFE_WITH_WARNINGS） | TC-R-002（複合チェックのみ）                | 2つのチェックが異なる SafetyGrade を返す場合の優先度解決   | TC-R-005a, TC-R-005b               | 混在グレード時の最終判定ロジック                                  |
| INS-01 High/Critical の境界                              | Phase 4 で未定義                            | High と Critical の境界条件（PermissionMode 影響）         | TC-F-007, TC-F-008, TC-F-009       | INS-01 High → Critical 昇格条件と分岐動作                         |

---

## 観点別詳細分析

### 観点1: `expiresAt === Date.now()` の等号境界

#### Phase 4 既存テスト

- **TC-ST-001c**: `expiresAt < Date.now()` の場合に `isToolAllowed()` が `false` を返すことを検証
  - 検証内容: 明確に過去の `expiresAt`（例: `Date.now() - 1000`）での期限切れ判定

#### 不足している境界条件

```
expiresAt = Date.now() の瞬間
```

- `<` のみのチェックは `===` の場合を未定義のまま残す
- 実装が `expiresAt < Date.now()` か `expiresAt <= Date.now()` かで動作が変わる
- 具体的な値: `expiresAt = currentTime`（テスト実行時刻と同一ミリ秒）

#### Phase 6 追加テストケース

| テストID   | シナリオ                                                       | 期待結果                             |
| ---------- | -------------------------------------------------------------- | ------------------------------------ |
| TC-ST-009a | `expiresAt === Date.now()` で `isToolAllowed()` を呼び出す     | `false` を返す（等号は期限切れ扱い） |
| TC-ST-009b | `expiresAt === Date.now() + 1` で `isToolAllowed()` を呼び出す | `true` を返す（1ms 先は有効）        |

---

### 観点2: retry 回数 = 3回目の境界

#### Phase 4 既存テスト

- **TC-F-003**: retry 上限（MAX_RETRY_COUNT=3）到達時に `abort` が呼ばれることを検証
  - 検証内容: 3回連続失敗後の状態（aborted）

#### 不足している境界条件

```
retry count = 2 → 3 の遷移
```

- 2回目（count=2）では再試行が続くことの確認が欠如
- 3回目（count=3）で abort に切り替わる境界の正確な検証が欠如
- 具体的な値: `retryCount: 2` vs `retryCount: 3`

#### Phase 6 追加テストケース

| テストID | シナリオ                                     | 期待結果                                            |
| -------- | -------------------------------------------- | --------------------------------------------------- |
| TC-F-005 | retry count = 2 の状態で再度エラーが発生する | 3回目として `abort` が呼ばれる（再試行しない）      |
| TC-F-006 | retry count = 1 の状態で再度エラーが発生する | 2回目として再試行が継続する（`abort` が呼ばれない） |

---

### 観点3: session ポリシーのアプリ再起動後削除

#### Phase 4 既存テスト

- **TC-ST-002a**: `expiresAt=undefined` の session エントリが `isToolAllowed()` で `false` を返すことを検証
  - 検証内容: session エントリのメモリ上での存在確認のみ

#### 不足している境界条件

```
アプリ再起動トリガーによる session エントリのクリア動作
```

- アプリ起動時に前回 session エントリが残存していないこと
- electron-store への書き込み有無（session は永続化しないこと）
- 具体的な値: `expiryPolicy: "session"` エントリの electron-store 内件数 = 0

#### Phase 6 追加テストケース

TC-ST-006a〜c として `tc-session-scope-boundary.md` に詳細定義。概要:

| テストID   | シナリオ                                       | 期待結果                                        |
| ---------- | ---------------------------------------------- | ----------------------------------------------- |
| TC-ST-006a | session 許可後のアプリ再起動                   | `isToolAllowed()` が `false`                    |
| TC-ST-006b | permanent 許可後のアプリ再起動                 | `isToolAllowed()` が `true`（持続性の対比確認） |
| TC-ST-006c | session エントリの electron-store 書き込み確認 | `expiryPolicy: "session"` エントリが0件         |

---

### 観点4: Medium/High の `allowPermanent` 境界

#### Phase 4 既存テスト

- **TC-T-001**: `TOOL_RISK_CONFIG` の設定値（`allowPermanent: false/true`）を定数テストで確認
  - 検証内容: 設定値の数値確認のみ

#### 不足している境界条件

```
allowPermanent=false（high）と allowPermanent=true（medium）の
PermissionDialog UI への反映境界
```

- `high` リスクでは「恒久許可」ボタンが表示されないこと
- `medium` リスクでは「恒久許可」ボタンが表示されること
- 境界: `riskLevel = "high"` vs `riskLevel = "medium"`

#### Phase 6 追加テストケース

| テストID | シナリオ                                              | 期待結果                                                               |
| -------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| TC-T-007 | `riskLevel = "high"` で PermissionDialog を描画する   | 「恒久許可」ボタンが DOM に存在しない（`allowPermanent=false` のため） |
| TC-T-008 | `riskLevel = "medium"` で PermissionDialog を描画する | 「恒久許可」ボタンが DOM に存在する（`allowPermanent=true` のため）    |

---

### 観点5: 承認履歴1000件上限の等号境界

#### Phase 4 既存テスト

- **TC-ST-005e**: 1001件目の追加時に上限超過として最古エントリが削除されることを検証
  - 検証内容: 上限超過（1001件）でのトリミング動作のみ

#### 不足している境界条件

```
999件・1000件・1001件の3点境界
```

- 999件目: 上限未達（追加のみ、削除なし）
- 1000件目: 上限到達（追加可能、削除なし）
- 1001件目: 上限超過（追加後に最古エントリ削除）

#### Phase 6 追加テストケース

| テストID   | シナリオ                               | 期待結果                                                     |
| ---------- | -------------------------------------- | ------------------------------------------------------------ |
| TC-ST-010a | 承認履歴が999件の状態で1件追加する     | 合計1000件になる（削除なし）                                 |
| TC-ST-010b | 承認履歴が1000件の状態で1件追加する    | 合計1001件になった後、最古エントリが削除されて1000件に戻る   |
| TC-ST-010c | 承認履歴が1000件の状態でのエントリ内容 | 最古エントリが `history[0]` に存在し、削除対象として特定可能 |

---

### 観点6: SafetyGrade 優先度の境界（UNSAFE vs SAFE_WITH_WARNINGS）

#### Phase 4 既存テスト

- **TC-R-002**: 複数チェック（パストラバーサル + 既知マルウェア）の複合結果
  - 検証内容: 2つのチェックが同じ SafetyGrade を返す場合のみ

#### 不足している境界条件

```
2つのチェックが異なる SafetyGrade を返す場合の優先度解決
チェック1: SAFE_WITH_WARNINGS
チェック2: UNSAFE
```

- 最終判定は高リスク側（UNSAFE）が優先されるべき
- 境界: SAFE_WITH_WARNINGS と UNSAFE の混在時

#### Phase 6 追加テストケース

| テストID  | シナリオ                                                        | 期待結果                                                |
| --------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| TC-R-005a | チェックA が `SAFE_WITH_WARNINGS`、チェックB が `UNSAFE` を返す | 最終 SafetyGrade = `UNSAFE`（高リスク優先）             |
| TC-R-005b | チェックA が `SAFE`、チェックB が `SAFE_WITH_WARNINGS` を返す   | 最終 SafetyGrade = `SAFE_WITH_WARNINGS`（高リスク優先） |

---

### 観点7: INS-01 High/Critical の境界

#### Phase 4 既存テスト

- Phase 4 では INS-01（インスペクション結果に基づく PermissionMode への影響）が未定義
  - 検証内容: なし

#### 不足している境界条件

```
INS-01: SafetyGrade が High の場合と Critical の場合での PermissionMode 分岐
```

- `SafetyGrade = HIGH` → PermissionDialog を表示して承認を要求
- `SafetyGrade = CRITICAL` → 自動拒否（承認ダイアログを表示しない）
- 境界: `HIGH` vs `CRITICAL` の分岐点

#### Phase 6 追加テストケース

| テストID | シナリオ                                                                     | 期待結果                                                      |
| -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| TC-F-007 | SafetyGrade = `HIGH` のツール呼び出し                                        | `permissionMode = "ask"` となり PermissionDialog が表示される |
| TC-F-008 | SafetyGrade = `CRITICAL` のツール呼び出し                                    | `permissionMode = "deny"` となり自動拒否（ダイアログ非表示）  |
| TC-F-009 | SafetyGrade が `HIGH` から `CRITICAL` に昇格するケース（複数チェックの複合） | 昇格後に自動拒否が適用される                                  |

---

## Phase 6 追加テストケース一覧

| テストID      | ファイル                           | カテゴリ           | 優先度 |
| ------------- | ---------------------------------- | ------------------ | ------ |
| TC-ST-006a    | tc-session-scope-boundary.md       | セッションスコープ | 高     |
| TC-ST-006b    | tc-session-scope-boundary.md       | セッションスコープ | 高     |
| TC-ST-006c    | tc-session-scope-boundary.md       | セッションスコープ | 高     |
| TC-ST-007     | tc-session-scope-boundary.md       | セッションスコープ | 中     |
| TC-ST-008a〜i | tc-expiry-risk-matrix.md           | 失効×リスク組合せ  | 高     |
| TC-ST-009a    | coverage-gap-analysis.md（本文書） | 等号境界           | 中     |
| TC-ST-009b    | coverage-gap-analysis.md（本文書） | 等号境界           | 中     |
| TC-ST-010a    | coverage-gap-analysis.md（本文書） | 上限境界           | 中     |
| TC-ST-010b    | coverage-gap-analysis.md（本文書） | 上限境界           | 高     |
| TC-ST-010c    | coverage-gap-analysis.md（本文書） | 上限境界           | 低     |
| TC-T-007      | coverage-gap-analysis.md（本文書） | ダイアログUI境界   | 高     |
| TC-T-008      | coverage-gap-analysis.md（本文書） | ダイアログUI境界   | 高     |
| TC-F-005      | coverage-gap-analysis.md（本文書） | retry境界          | 高     |
| TC-F-006      | coverage-gap-analysis.md（本文書） | retry境界          | 中     |
| TC-F-007      | coverage-gap-analysis.md（本文書） | INS-01境界         | 高     |
| TC-F-008      | coverage-gap-analysis.md（本文書） | INS-01境界         | 高     |
| TC-F-009      | coverage-gap-analysis.md（本文書） | INS-01境界         | 中     |
| TC-R-005a     | coverage-gap-analysis.md（本文書） | SafetyGrade優先度  | 高     |
| TC-R-005b     | coverage-gap-analysis.md（本文書） | SafetyGrade優先度  | 中     |

## 参照

- Phase 4 テストケース仕様: `../phase-4/`
- Phase 5 実装成果物: `../phase-5/`
- セッションスコープ境界テスト仕様: `tc-session-scope-boundary.md`（本 Phase 6 ディレクトリ）
- 失効×リスク組合せテスト仕様: `tc-expiry-risk-matrix.md`（本 Phase 6 ディレクトリ）
