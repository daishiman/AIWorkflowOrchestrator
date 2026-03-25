# Phase 7 Integration Gate

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 7                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 4-6                                       |

## Gate 判定基準

Phase 7 から Phase 8 へ進行するための判定基準を定義する。

---

## 1. カバレッジ Gate

### 1.1 数値基準

| 指標              | 最低基準 | 目標基準 | 判定                |
| ----------------- | -------- | -------- | ------------------- |
| Line Coverage     | 80%      | 90%      | 未達 → Phase 6 戻り |
| Branch Coverage   | 60%      | 70%      | 未達 → Phase 6 戻り |
| Function Coverage | 80%      | 90%      | 未達 → Phase 6 戻り |

### 1.2 ファイル別基準

全対象ファイルが最低基準を満たすこと。1ファイルでも未達の場合は Phase 6 に戻る。

| 対象ファイル                | Line 最低 | Branch 最低 | Function 最低 |
| --------------------------- | --------- | ----------- | ------------- |
| ApprovalSheet.tsx           | 80%       | 60%         | 80%           |
| SessionDisclosureBanner.tsx | 80%       | 60%         | 80%           |
| AdvancedConsolePanel.tsx    | 80%       | 60%         | 80%           |
| ApprovalGate.ts             | 80%       | 60%         | 80%           |
| approvalHandlers.ts         | 80%       | 60%         | 80%           |
| disclosureHandlers.ts       | 80%       | 60%         | 80%           |
| useApprovalFlow.ts          | 80%       | 60%         | 80%           |
| useAdvancedConsole.ts       | 80%       | 60%         | 80%           |

---

## 2. AC Gate（受入基準カバレッジ）

各 AC に対応するテストケースが存在し、全て PASS であること。

| AC   | 必須テスト ID                                | 必須 PASS 数 | 判定                |
| ---- | -------------------------------------------- | ------------ | ------------------- |
| AC-1 | APR-01〜APR-18, REG-A01〜A05                 | 23           | 未達 → Phase 4 戻り |
| AC-2 | DSC-01〜DSC-11, REG-D01〜D09                 | 20           | 未達 → Phase 4 戻り |
| AC-3 | NAS-01〜NAS-06, CAG-01〜CAG-03, REG-S01〜S10 | 19           | 未達 → Phase 4 戻り |
| AC-4 | ADV-01〜ADV-15, CTA-01〜CTA-05, REG-P04〜P08 | 25           | 未達 → Phase 4 戻り |

---

## 3. Security Gate（セキュリティ検証）

### 3.1 Approval Enforcement 検証

| 検証項目                                 | テスト ID | PASS 必須 |
| ---------------------------------------- | --------- | --------- |
| 承認なしで危険操作が Main で拒否される   | APR-11    | 必須      |
| 承認なしで外部送信が Main で拒否される   | NAS-04    | 必須      |
| 期限切れ token が拒否される              | APR-12    | 必須      |
| 別セッション token が拒否される          | APR-13    | 必須      |
| 単一操作で token が失効する              | REG-A01   | 必須      |
| 異なる operationId で token が拒否される | REG-A03   | 必須      |

**判定**: 上記6項目が全て PASS → Security Gate PASS

### 3.2 Secret 非露出検証

| 検証項目                                    | テスト ID | PASS 必須 |
| ------------------------------------------- | --------- | --------- |
| copy command に API key が含まれない        | ADV-13    | 必須      |
| Disclosure Data Flow で secret が渡されない | DSC-07    | 必須      |
| エラーメッセージに内部パスが含まれない      | NFR-01    | 必須      |
| エラーメッセージにトークンが含まれない      | NFR-02    | 必須      |

**判定**: 上記4項目が全て PASS → Secret Gate PASS

### 3.3 Consumer Auth Guard 検証

| 検証項目                                 | テスト ID | PASS 必須 |
| ---------------------------------------- | --------- | --------- |
| claude.ai session token が拒否される     | CAG-01    | 必須      |
| cookie API が Preload で公開されていない | CAG-02    | 必須      |
| consumer 認証 IPC が存在しない           | CAG-03    | 必須      |

**判定**: 上記3項目が全て PASS → Consumer Auth Gate PASS

---

## 4. DENY / MUST Gate

### 4.1 DENY 完全カバー Gate

| DENY ID | テスト ID                | カバー状態 |
| ------- | ------------------------ | ---------- |
| DENY-1  | CAG-01〜03, REG-A11〜A12 | -          |
| DENY-2  | NAS-01, REG-S01〜S02     | -          |
| DENY-3  | NAS-06, REG-S04          | -          |
| DENY-4  | NAS-06                   | -          |
| DENY-5  | DSC-07, ADV-13           | -          |
| DENY-6  | ADV-13, REG-A09          | -          |
| DENY-7  | ADV-02, ADV-06〜08       | -          |
| DENY-8  | CTA-02, CTA-04           | -          |
| DENY-9  | APR-11, NAS-04           | -          |
| DENY-10 | （間接保護）             | -          |

**判定**: DENY-1〜DENY-9 の全テストが PASS → DENY Gate PASS

### 4.2 MUST 完全カバー Gate

| MUST ID | テスト ID            | カバー状態 |
| ------- | -------------------- | ---------- |
| MUST-1  | DSC-01, DSC-02       | -          |
| MUST-2  | APR-01, APR-10       | -          |
| MUST-3  | APR-02〜04, APR-10   | -          |
| MUST-4  | NAS-05, REG-S08〜S10 | -          |
| MUST-5  | ADV-01, ADV-02       | -          |
| MUST-6  | CTA-01               | -          |
| MUST-7  | CTA-03               | -          |
| MUST-8  | CTA-04               | -          |
| MUST-9  | NFR-01, NFR-02       | -          |
| MUST-10 | ADV-15, REG-A07〜A08 | -          |

**判定**: MUST-1〜MUST-10 の全テストが PASS → MUST Gate PASS

---

## 5. Regression Gate

Phase 6 で追加した 39 regression テストが全て PASS であること。

| Regression カテゴリ    | ケース数 | PASS 必須数 |
| ---------------------- | -------- | ----------- |
| Abuse: Approval 操作   | 5        | 5           |
| Abuse: IPC 層          | 5        | 5           |
| Abuse: Consumer Auth   | 2        | 2           |
| Permission: Approval   | 3        | 3           |
| Permission: Advanced   | 3        | 3           |
| Permission: CTA        | 2        | 2           |
| Disclosure: State 遷移 | 3        | 3           |
| Disclosure: Sheet 内   | 3        | 3           |
| Disclosure: 再表示     | 2        | 2           |
| Disclosure: IPC 失敗   | 1        | 1           |
| Auto-Send: IPC 経路    | 4        | 4           |
| Auto-Send: 通信パス    | 3        | 3           |
| Auto-Send: Share Rail  | 3        | 3           |
| **合計**               | **39**   | **39**      |

**判定**: 39/39 PASS → Regression Gate PASS

---

## 6. 総合 Gate 判定

| Gate 名         | 判定基準                          | PASS 条件                          |
| --------------- | --------------------------------- | ---------------------------------- |
| Coverage Gate   | 全ファイルが最低基準以上          | Line 80%, Branch 60%, Function 80% |
| AC Gate         | AC-1〜AC-4 の全テスト PASS        | 87/87 テスト PASS                  |
| Security Gate   | Approval + Secret + Consumer Auth | 13/13 テスト PASS                  |
| DENY Gate       | DENY-1〜DENY-9 の全テスト PASS    | DENY テスト全 PASS                 |
| MUST Gate       | MUST-1〜MUST-10 の全テスト PASS   | MUST テスト全 PASS                 |
| Regression Gate | Phase 6 の 39 テスト全 PASS       | 39/39 テスト PASS                  |

### 判定フロー

```
Coverage Gate PASS?
  ├─ No → Phase 6 に戻りテスト追加
  └─ Yes → AC Gate PASS?
              ├─ No → Phase 4 に戻りテスト追加
              └─ Yes → Security Gate PASS?
                          ├─ No → Phase 5 に戻り実装修正
                          └─ Yes → DENY/MUST Gate PASS?
                                      ├─ No → Phase 5 に戻り実装修正
                                      └─ Yes → Regression Gate PASS?
                                                  ├─ No → Phase 6 に戻りテスト修正
                                                  └─ Yes → Phase 8（リファクタリング）へ進行
```

### 総合判定

- **PASS**: 全 6 Gate が PASS → Phase 8 へ進行
- **FAIL**: いずれかの Gate が FAIL → 該当 Phase に戻り対応

---

## 7. テストケース総数サマリー

| Phase        | P0     | P1     | P2    | 合計    |
| ------------ | ------ | ------ | ----- | ------- |
| Phase 4 基盤 | 40     | 21     | 1     | 62      |
| Phase 6 拡張 | 24     | 15     | 0     | 39      |
| **合計**     | **64** | **36** | **1** | **101** |

- P0（必須）: 64 ケース → 全 PASS 必須
- P1（推奨）: 36 ケース → 全 PASS 推奨（未 PASS の場合は理由を記録）
- P2（補完）: 1 ケース → PASS 推奨（未 PASS 許容）
