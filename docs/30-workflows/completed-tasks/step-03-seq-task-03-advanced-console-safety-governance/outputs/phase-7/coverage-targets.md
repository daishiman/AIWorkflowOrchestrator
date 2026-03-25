# Phase 7 Coverage Targets

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 7                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 4-6                                       |

## カバレッジ基準（プロジェクト標準準拠）

| 指標              | 最低基準 | 推奨基準 | 本タスク目標 |
| ----------------- | -------- | -------- | ------------ |
| Line Coverage     | 80%      | 90%      | 90%          |
| Branch Coverage   | 60%      | 70%      | 70%          |
| Function Coverage | 80%      | 90%      | 90%          |

本タスクは safety governance 設計のため、推奨基準を目標とする。特に Branch Coverage はセキュリティ分岐（approval gate、consumer auth guard 等）を網羅するために 70% を目標とする。

---

## 1. 受入基準（AC）カバレッジマッピング

### AC-1: Approval Sheet が危険操作と外部送信の承認面として定義されている

| カバレッジ対象                   | テスト ID                  | Line | Branch | Function |
| -------------------------------- | -------------------------- | ---- | ------ | -------- |
| ApprovalSheet コンポーネント     | APR-01〜APR-09, APR-17〜18 | 95%  | 80%    | 95%      |
| ApprovalGate（Main enforcement） | APR-10〜APR-16             | 90%  | 75%    | 90%      |
| useApprovalFlow hook             | （Phase 5 で作成）         | 90%  | 70%    | 90%      |
| approvalHandlers IPC             | REG-A06〜A10               | 85%  | 70%    | 85%      |

**Branch Coverage 重点対象**:

- ApprovalGate.checkApproval(): approved / not_requested / rejected / expired の4分岐
- ApprovalSheet: operationType による表示分岐（external_send / dangerous_operation）
- Approval Flow: approval 必要/不要の判定分岐

### AC-2: セッション開始時に AI 利用と外部送信可能性を開示する契約が定義されている

| カバレッジ対象                         | テスト ID            | Line | Branch | Function |
| -------------------------------------- | -------------------- | ---- | ------ | -------- |
| SessionDisclosureBanner コンポーネント | DSC-01〜DSC-08       | 95%  | 80%    | 95%      |
| Disclosure 異常系                      | DSC-09〜DSC-11       | 90%  | 75%    | 90%      |
| disclosureHandlers IPC                 | REG-D04              | 85%  | 70%    | 85%      |
| State 遷移連携                         | REG-D01〜D03, NFR-03 | 85%  | 70%    | 85%      |

**Branch Coverage 重点対象**:

- SessionDisclosureBanner: dismiss / reopen / guidance-only の表示分岐
- Disclosure Data Flow: secret 非含有の検証分岐
- State 別の表示/非表示分岐（8 state x banner 有無）

### AC-3: No auto-send、no hidden parsing、no consumer auth embedding が明記されている

| カバレッジ対象              | テスト ID                    | Line | Branch | Function |
| --------------------------- | ---------------------------- | ---- | ------ | -------- |
| No auto-send IPC 非存在     | NAS-01〜NAS-06, REG-S01〜S04 | 100% | N/A    | 100%     |
| Consumer auth guard         | CAG-01〜CAG-03, REG-A11〜A12 | 90%  | 75%    | 90%      |
| Manual Share Rail integrity | NAS-05, REG-S08〜S10         | 85%  | 70%    | 85%      |

**特記**: No auto-send テストは「存在しないこと」の検証のため、Line/Function は 100% を目標とする（テスト対象コードが存在しないため、アサーション自体のカバレッジ）。

### AC-4: Advanced console が opt-in detail layer であり、front の default surface ではない

| カバレッジ対象                      | テスト ID          | Line | Branch | Function |
| ----------------------------------- | ------------------ | ---- | ------ | -------- |
| AdvancedConsolePanel コンポーネント | ADV-01〜ADV-11     | 95%  | 80%    | 95%      |
| Advanced Console IPC                | ADV-12〜ADV-15     | 85%  | 70%    | 85%      |
| CTA 階層                            | CTA-01〜CTA-05     | 90%  | 75%    | 90%      |
| useAdvancedConsole hook             | （Phase 5 で作成） | 90%  | 70%    | 90%      |

**Branch Coverage 重点対象**:

- GATE-1〜3 の AND 条件（3 gate x 2 状態 = 8 分岐）
- State 別の read-only / editable 分岐
- CTA 階層の state 依存分岐

---

## 2. Abuse / Misuse カバレッジ

### Threat Model カバレッジ（TB-01〜TB-29）

| 脅威カテゴリ                         | 脅威数 | テストカバー数 | カバー率 |
| ------------------------------------ | ------ | -------------- | -------- |
| Approval Bypass（TB-01〜06）         | 6      | 6              | 100%     |
| Disclosure Suppression（TB-07〜10）  | 4      | 4              | 100%     |
| Auto-Send Injection（TB-11〜16）     | 6      | 6              | 100%     |
| Front Surface Leakage（TB-17〜21）   | 5      | 5              | 100%     |
| Secret Exposure（TB-22〜26）         | 5      | 5              | 100%     |
| Consumer Auth Embedding（TB-27〜29） | 3      | 3              | 100%     |
| **合計**                             | **29** | **29**         | **100%** |

### Abuse Case カバレッジ（abuse-case-matrix.md）

| 攻撃面               | シナリオ数 | テストカバー数 | カバー率 |
| -------------------- | ---------- | -------------- | -------- |
| Approval 悪用        | 9          | 9              | 100%     |
| Disclosure 悪用      | 7          | 7              | 100%     |
| Auto-Send 悪用       | 10         | 10             | 100%     |
| Front Surface 悪用   | 6          | 6              | 100%     |
| Secret Exposure 悪用 | 4          | 4              | 100%     |
| Consumer Auth 悪用   | 3          | 3              | 100%     |
| **合計**             | **39**     | **39**         | **100%** |

---

## 3. UI / IPC 境界カバレッジ

### UI コンポーネント別カバレッジ目標

| コンポーネント              | テストファイル                                         | Line 目標 | Branch 目標 | Function 目標 |
| --------------------------- | ------------------------------------------------------ | --------- | ----------- | ------------- |
| ApprovalSheet.tsx           | ApprovalSheet.test.tsx                                 | 95%       | 80%         | 95%           |
| SessionDisclosureBanner.tsx | SessionDisclosureBanner.test.tsx                       | 95%       | 80%         | 95%           |
| AdvancedConsolePanel.tsx    | AdvancedConsolePanel.test.tsx                          | 95%       | 80%         | 95%           |
| ExecutionConsoleView        | ctaHierarchy.test.tsx + disclosureIntegration.test.tsx | 85%       | 70%         | 85%           |

### IPC Handler 別カバレッジ目標

| Handler               | テストファイル             | Line 目標 | Branch 目標 | Function 目標 |
| --------------------- | -------------------------- | --------- | ----------- | ------------- |
| approvalHandlers.ts   | approvalHandlers.test.ts   | 90%       | 75%         | 90%           |
| disclosureHandlers.ts | disclosureHandlers.test.ts | 90%       | 75%         | 90%           |
| ApprovalGate.ts       | approvalGate.test.ts       | 90%       | 80%         | 90%           |

### Main Process Service 別カバレッジ目標

| Service                      | テスト                      | Line 目標 | Branch 目標 | Function 目標 |
| ---------------------------- | --------------------------- | --------- | ----------- | ------------- |
| RuntimePolicyResolver.ts     | 既存テスト + 新規ケース追加 | 85%       | 70%         | 85%           |
| RuntimeSkillCreatorFacade.ts | 既存テスト + 新規ケース追加 | 85%       | 70%         | 85%           |
| terminalHandlers.ts          | 既存テスト + 新規ケース追加 | 85%       | 70%         | 85%           |

---

## 4. DENY / MUST カバレッジ

### DENY（禁止事項）カバレッジ

| DENY ID | 内容                                       | テスト ID                    | カバー状態 |
| ------- | ------------------------------------------ | ---------------------------- | ---------- |
| DENY-1  | consumer 認証を統合実行レーンに流用しない  | CAG-01〜03, REG-A11〜A12     | カバー済み |
| DENY-2  | transcript を auto-send しない             | NAS-01, REG-S01〜S02         | カバー済み |
| DENY-3  | hidden parsing をしない                    | NAS-06, REG-S04              | カバー済み |
| DENY-4  | hidden prompt injection をしない           | NAS-06                       | カバー済み |
| DENY-5  | API key を Renderer に渡さない             | DSC-07, ADV-13               | カバー済み |
| DENY-6  | terminal command に API key を含めない     | ADV-13, REG-A09              | カバー済み |
| DENY-7  | advanced console を front default にしない | ADV-02, ADV-06〜08           | カバー済み |
| DENY-8  | terminal ラベルを front 主導線にしない     | CTA-02, CTA-04               | カバー済み |
| DENY-9  | 承認なしで危険操作/外部送信を実行しない    | APR-11, NAS-04               | カバー済み |
| DENY-10 | DEFAULT_CONFIG への暗黙 fallback をしない  | （Approval gate で間接保護） | カバー済み |

### MUST（遵守事項）カバレッジ

| MUST ID | 内容                                       | テスト ID            | カバー状態 |
| ------- | ------------------------------------------ | -------------------- | ---------- |
| MUST-1  | Session 開始時に AI 利用を開示する         | DSC-01, DSC-02       | カバー済み |
| MUST-2  | 外部送信は approval sheet で承認を取る     | APR-01, APR-10       | カバー済み |
| MUST-3  | 危険操作は approval sheet で承認を取る     | APR-02〜04, APR-10   | カバー済み |
| MUST-4  | transcript 共有は3操作で行う               | NAS-05, REG-S08〜S10 | カバー済み |
| MUST-5  | advanced console は opt-in で表示する      | ADV-01, ADV-02       | カバー済み |
| MUST-6  | primary CTA は常に1個                      | CTA-01               | カバー済み |
| MUST-7  | 「端末で続ける」は handoff の primary のみ | CTA-03               | カバー済み |
| MUST-8  | 「高度な表示」は secondary/tertiary        | CTA-04               | カバー済み |
| MUST-9  | エラーは sanitizeErrorMessage でサニタイズ | NFR-01, NFR-02       | カバー済み |
| MUST-10 | 新規 IPC 引数に P42 3段バリデーション      | ADV-15, REG-A07〜A08 | カバー済み |

---

## 5. カバレッジ不足時の対応方針

| 不足パターン                      | 対応                                        | 担当 Phase   |
| --------------------------------- | ------------------------------------------- | ------------ |
| Line Coverage < 80%               | 未カバー行を特定し、テストケースを追加      | Phase 6 戻り |
| Branch Coverage < 60%             | 条件分岐を特定し、boundary value テスト追加 | Phase 6 戻り |
| Function Coverage < 80%           | 未テスト関数を特定し、テストケースを追加    | Phase 6 戻り |
| DENY/MUST に未カバー項目がある    | 対応テストケースを Phase 4 マトリクスに追加 | Phase 4 戻り |
| Threat Model に未カバー脅威がある | threat-model-checklist を更新して追加       | Phase 4 戻り |

---

## カバレッジ可視化コマンド

```bash
# 対象パッケージディレクトリから実行（P40 準拠）
cd apps/desktop

# 全テスト実行 + カバレッジ取得
pnpm vitest run --coverage \
  src/renderer/components/execution/__tests__/ \
  src/main/ipc/__tests__/ \
  src/main/services/runtime/__tests__/ \
  src/renderer/views/ExecutionConsoleView/__tests__/

# 特定ファイルのカバレッジ確認
pnpm vitest run --coverage \
  --coverage.include='src/renderer/components/execution/ApprovalSheet.tsx' \
  --coverage.include='src/renderer/components/execution/SessionDisclosureBanner.tsx' \
  --coverage.include='src/renderer/components/execution/AdvancedConsolePanel.tsx' \
  --coverage.include='src/main/services/runtime/ApprovalGate.ts'
```
