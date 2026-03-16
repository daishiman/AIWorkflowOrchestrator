# TC-T-006 詳細仕様: 設計文書完全性チェックスクリプト

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-06            |
| Phase    | 4: テスト作成                      |
| 対象TC   | TC-T-006                           |
| 作成日   | 2026-03-16                         |
| 検証対象 | `outputs/phase-2/` 配下の5ファイル |

---

## 1. スクリプト概要

| 項目           | 値                                                         |
| -------------- | ---------------------------------------------------------- |
| スクリプトパス | `scripts/validate-trust-governance-design.ts`              |
| 実行コマンド   | `pnpm ts-node scripts/validate-trust-governance-design.ts` |
| 検証件数       | 6項目                                                      |
| 成功時exitCode | 0                                                          |
| 失敗時exitCode | 1                                                          |

---

## 2. 検証対象ファイル

| #   | ファイル名                                         | 略称 |
| --- | -------------------------------------------------- | ---- |
| 1   | `outputs/phase-2/risk-level-design.md`             | RLD  |
| 2   | `outputs/phase-2/permission-persistence-design.md` | PPD  |
| 3   | `outputs/phase-2/safety-gate-contract.md`          | SGC  |
| 4   | `outputs/phase-2/accountability-ui-design.md`      | AUD  |
| 5   | `outputs/phase-2/abort-fallback-design.md`         | AFD  |

---

## 3. 6項目の検証内容

### V-01: ToolRiskLevel 4値の網羅性（TOOL_RISK_CONFIGの全4キー存在確認）

- **検証内容**: `"critical"`, `"high"`, `"medium"`, `"low"` の4値が全5ファイルで参照されており、参照値が同一であることを確認する
- **検証手順**:
  1. 各ファイルから `ToolRiskLevel` または `riskLevel` を含む行を抽出する
  2. 抽出した値が `{"critical", "high", "medium", "low"}` の部分集合であることを確認する
  3. 5ファイル全てで4値が定義または参照されていることを確認する
- **合格条件**: 5ファイル全てで `critical`, `high`, `medium`, `low` の4値が矛盾なく使用されている
- **失敗時出力例**: `V-01: FAIL - abort-fallback-design.md に "critical" が見つからない`

### V-02: CSS変数トークン名の一貫性（critical.allowPermanent === false）

- **検証内容**: RLD の `critical.allowPermanent` が `false` であり、AUD で使用されているCSS変数トークン名がRLDと同一であることを確認する
- **検証手順**:
  1. RLD のセクション「ヘッダー背景色トークン定義表」から4つのトークン名を抽出する: `--status-destructive`, `--status-warning`, `--status-caution`, `--status-info`
  2. RLD で `critical.allowPermanent === false` が明示されていることを確認する
  3. AUD で参照されているトークン名を抽出する
  4. 両者の集合が一致することを確認する
- **合格条件**: RLD と AUD で同一の4トークン名が使用されている
- **失敗時出力例**: `V-02: FAIL - accountability-ui-design.md L169: "--status-desctructive" は risk-level-design.md の "--status-destructive" と不一致`

### V-03: SafetyCheckId 5件の一貫性（critical.allowApproveOnce === false）

- **検証内容**: SGC 内で定義されている `SafetyCheckId` 5件と、デシジョンテーブル・テスト検証項目での参照が一致することを確認する。またRLD で `critical.allowApproveOnce === false` が明示されていることを確認する
- **検証手順**:
  1. SGC セクションの TypeScript 型定義から5つの `SafetyCheckId` リテラルを抽出する
  2. SGC の「チェック定義表」の `チェックID` 列から5件を抽出する
  3. SGC の「検証項目」で参照されている `checkId` を抽出する
  4. 3つの抽出結果が全て `{"CRITICAL_TOOL_REQUIRED", "HIGH_TOOL_REQUIRED", "NO_PERMANENT_APPROVAL", "ALL_LOW_TOOLS", "PROTECTED_PATH_ACCESS"}` と一致することを確認する
- **合格条件**: 3箇所の抽出結果が完全に一致する
- **失敗時出力例**: `V-03: FAIL - safety-gate-contract.md: 型定義は6件だがチェック定義表は5件`

### V-04: SafetyGatePort.evaluateのシグネチャ確認

- **検証内容**: SGC 内で `SafetyGatePort.evaluate` のシグネチャが `(skillName: string) => Promise<SafetyGateResult>` として定義されていることを確認する
- **検証手順**:
  1. SGC から `SafetyGatePort` インターフェース定義を抽出する
  2. `evaluate` メソッドの引数型が `string` であることを確認する
  3. 戻り値の型が `Promise<SafetyGateResult>` であることを確認する
  4. AFD 内の `DEFAULT_TIMEOUT_MS` または `300000` の全使用箇所が300000msを指していることを確認する
- **合格条件**: SGC に `evaluate(skillName: string): Promise<SafetyGateResult>` のシグネチャが存在し、AFD 内の全タイムアウト値が 300000ms で統一されている
- **失敗時出力例**: `V-04: FAIL - abort-fallback-design.md L42: タイムアウト値 "60000" は期待値 300000 と不一致`

### V-05: AllowedToolEntryV2.expiresAtがoptional

- **検証内容**: PPD 内で `AllowedToolEntryV2` の `expiresAt` フィールドが optional（`?` マーク付き）として定義されていることを確認する。また `expiryPolicy` の4種が型定義・ポリシー定義表・検証条件で一致することを確認する
- **検証手順**:
  1. PPD セクションの TypeScript 型定義から `AllowedToolEntryV2` を抽出する
  2. `expiresAt?: number` のように `?` が付いていることを確認する
  3. PPD の `expiryPolicy` のユニオン型メンバーを抽出する
  4. PPD の「失効ポリシー4種の定義」テーブルからポリシー名を抽出する
  5. 抽出結果が全て `{"session", "time_24h", "time_7d", "permanent"}` と一致することを確認する
- **合格条件**: `expiresAt` が optional であり、expiryPolicy の4種が全箇所で一致している
- **失敗時出力例**: `V-05: FAIL - permission-persistence-design.md: "expiresAt" に "?" がなくrequiredになっている`

### V-06: SafetyCheckId union型が5件全て含む（PERMISSION_HISTORY_MAX_ENTRIES値の一貫性）

- **検証内容**: SGC の `SafetyCheckId` union型が5件全てを含むことを確認する。また PPD 内で履歴上限として参照されている値が全て `1000` であることを確認する
- **検証手順**:
  1. SGC から `SafetyCheckId` 型定義の全メンバーを抽出する
  2. メンバー数が正確に5件であることを確認する
  3. PPD 内から `PERMISSION_HISTORY_MAX_ENTRIES`, `1000件`, `1000`, `1001` を含む行を抽出する
  4. 履歴上限に関する全ての記述が `1000` を指していることを確認する
  5. `1001` は「超過テスト」の文脈でのみ使用されていることを確認する
- **合格条件**: `SafetyCheckId` union型が5件であり、履歴上限値が全箇所で1000に統一されている
- **失敗時出力例**: `V-06: FAIL - permission-persistence-design.md: 上限値 "500" は期待値 1000 と不一致`

---

## 4. 出力仕様

### 4.1 成功時（exitCode === 0）

```
V-01: PASS - ToolRiskLevel 4値が全5ファイルで一貫している
V-02: PASS - CSS変数トークン4件が RLD/AUD で一致、critical.allowPermanent === false 確認済み
V-03: PASS - SafetyCheckId 5件が定義/テーブル/検証で一致、critical.allowApproveOnce === false 確認済み
V-04: PASS - SafetyGatePort.evaluate シグネチャ確認済み、DEFAULT_TIMEOUT_MS が全箇所で 300000ms
V-05: PASS - AllowedToolEntryV2.expiresAt は optional、expiryPolicy 4種が型定義/テーブル/switch で一致
V-06: PASS - SafetyCheckId union型が5件全て含む、PERMISSION_HISTORY_MAX_ENTRIES が全箇所で 1000

Result: 6/6 PASS
PASS: 全6項目が検証成功
```

### 4.2 失敗時（exitCode === 1）

失敗した検証項目名、期待値、実際値を以下の形式で出力する:

```
V-01: PASS
V-02: FAIL
  - ファイル: accountability-ui-design.md
  - 行番号: L169
  - 期待値: "--status-destructive"
  - 実際値: "--status-desctructive"
V-03: PASS
V-04: PASS
V-05: PASS
V-06: PASS

Result: 5/6 PASS, 1 FAIL
FAIL箇所:
  - V-02 (accountability-ui-design.md L169)
```

---

## 5. 判定基準

| 結果     | 条件                         | 対応                          |
| -------- | ---------------------------- | ----------------------------- |
| 全件PASS | 6/6 PASS, exitCode === 0     | Phase 5 に進む                |
| 一部FAIL | 1件以上 FAIL, exitCode === 1 | FAIL箇所を Phase 2 で修正する |
| 実行不可 | ファイルが見つからない       | Phase 2 成果物を確認する      |

---

## 6. 手動実行手順（スクリプト未実装時）

Phase 5 でスクリプトが実装されるまでの間、以下の手順で手動検証を実施する。

1. **V-01**: 各ファイルで `critical`, `high`, `medium`, `low` の4値が使用されていることを目視確認する
2. **V-02**: RLD の「ヘッダー背景色トークン定義表」と AUD の参照箇所を対照する
3. **V-03**: SGC の型定義、チェック定義表、検証項目の3箇所を対照する
4. **V-04**: SGC の `SafetyGatePort.evaluate` シグネチャと AFD のタイムアウト値を確認する
5. **V-05**: PPD の `AllowedToolEntryV2` 型定義と expiryPolicy の使用箇所を確認する
6. **V-06**: SGC の `SafetyCheckId` 型メンバー数と PPD の上限値を確認する
