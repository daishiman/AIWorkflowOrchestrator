# 型定義整合確認レポート

## メタ情報

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| 作成フェーズ | Phase 10（最終レビュー）                                                             |
| 検証実施日   | 2026-03-16                                                                           |
| 検証担当     | Phase 10 最終レビューエージェント                                                    |
| 根拠ファイル | Phase 5 正本ファイル（security.ts / permission-store-interface.ts / safety-gate.ts） |

---

## 型定義間の相互依存5件の整合確認

### 依存関係 1: SafetyGateResult.details[].riskLevel → ToolRiskLevel

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| 期待状態 | `SafetyCheckDetail.riskLevel` の型が `ToolRiskLevel` と完全一致                                    |
| 確認元   | `outputs/phase-5/safety-gate.ts` L58: `riskLevel: ToolRiskLevel;`                                  |
| 型定義元 | `outputs/phase-5/safety-gate.ts` L4: `import type { ToolRiskLevel } from "../constants/security";` |
| 判定     | **一致（OK）**                                                                                     |

詳細: `safety-gate.ts` L4 で `ToolRiskLevel` を `../constants/security` から import している。`SafetyCheckDetail` インターフェース（L53-71）の `riskLevel` フィールドは `ToolRiskLevel` 型として宣言されており、`security.ts` で定義された `"critical" | "high" | "medium" | "low"` ユニオン型と完全一致する。Phase 2 の `safety-gate-contract.md` セクション2でも同一の import パスが確認できる。

---

### 依存関係 2: AllowedToolEntryV2.expiryPolicy → 失効ポリシー4値

| 項目         | 内容                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 期待状態     | `expiryPolicy` の値セットが失効ポリシー4値（session/time_24h/time_7d/permanent）と一致                                    |
| 確認元       | `outputs/phase-5/permission-store-interface.ts` L32: `expiryPolicy?: "session" \| "time_24h" \| "time_7d" \| "permanent"` |
| ポリシー定義 | `outputs/phase-1/approval-history-policy.md` セクション5で同4値が定義されている                                           |
| 判定         | **一致（OK）**                                                                                                            |

詳細: `permission-store-interface.ts` L32 の `expiryPolicy` フィールドに `"session" | "time_24h" | "time_7d" | "permanent"` の4値ユニオン型が定義されている。`calcExpiresAt` 関数（L109-127）の switch 文も同4値を網羅しており、コンパイル時に `NonNullable<AllowedToolEntryV2["expiryPolicy"]>` による型チェックで網羅性が保証される。Phase 1 定義（approval-history-policy.md セクション5）の `ExpiryPolicy` 型とも完全一致。

---

### 依存関係 3: SkillSafetyContract.maxRiskLevel → ToolRiskLevel

| 項目         | 内容                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| 期待状態     | `SkillSafetyContract.maxRiskLevel` の型が `ToolRiskLevel` と完全一致                  |
| 確認元       | `outputs/phase-2/safety-gate-contract.md` セクション2: `maxRiskLevel: ToolRiskLevel;` |
| 算出ロジック | 同セクション5-2: `RISK_LEVEL_ORDER: Record<ToolRiskLevel, number>` で最大値を算出     |
| 判定         | **一致（OK）**                                                                        |

詳細: `safety-gate-contract.md` セクション2の `SkillSafetyContract` 型定義では `maxRiskLevel: ToolRiskLevel` として宣言されている。セクション5-2の `maxRiskLevel` 算出条件式でも `"low" as ToolRiskLevel` を初期値とした `reduce` 処理によって型安全性が維持されている。`RISK_LEVEL_ORDER: Record<ToolRiskLevel, number>` の定義により全4値の網羅性がコンパイル時に保証される。

---

### 依存関係 4: PermissionDecisionExtended → "revoked" 追加とバッジ色定義

| 項目                  | 内容                                                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 期待状態              | `revoked` 決定状態に対応するバッジ色定義が存在する                                                                                                  |
| 確認元（revoked定義） | `outputs/phase-5/permission-state-machine.md` 状態定義テーブル: 「revoked: 取り消し済み。履歴テーブルには decision:"revoked" として記録を保持する」 |
| 確認元（バッジ色）    | `outputs/phase-5/accountability-ui-spec.md` INS-03 セクション: decision バッジの定義表                                                              |
| 判定                  | **バッジ色定義あり（OK）**                                                                                                                          |

詳細: `permission-state-machine.md` の状態定義テーブルで `revoked` 状態が定義されている。`accountability-ui-spec.md` INS-03 の「恒久許可の取り消しボタン」セクションに「ボタン押下後: 該当エントリの decision バッジを『取り消し済み』に更新する」と定義されている。INS-03 の decision バッジ定義には `approved_once`（緑）、`approved_permanent`（青）、`denied`（赤）が明示されており、`revoked` 状態の取り消し済みバッジは `approved_permanent` エントリが取り消されると「取り消し済み」に変化する設計となっている。Phase 1 `approval-history-policy.md` の `PermissionDecision` 型（L20）には `"approved" | "denied" | "revoked"` が定義されている。

---

### 依存関係 5: abort クリーンアップ → approved_once エントリ削除の手順明記

| 項目     | 内容                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| 期待状態 | abort フロー実行後に `approved_once`（expiryPolicy: "session"）エントリが削除される手順が明記されている        |
| 確認元   | `outputs/phase-5/abort-fallback-contract.md` フロー1 Step2: `permissionStore.revokeSessionEntries(sessionId);` |
| 事後条件 | 同ファイル 契約条件テーブル: 「permissionStore に expiryPolicy:"session" のエントリが0件になること」           |
| 判定     | **手順明記（OK）**                                                                                             |

詳細: `abort-fallback-contract.md` フロー1の疑似コードに `permissionStore.revokeSessionEntries(sessionId)` が Step2 として明記されている。契約条件テーブルの事後条件に「permissionStore に expiryPolicy:"session" のエントリが0件になること」と検証可能な条件式で記載されている。`permission-store-interface.ts` の `revokeSessionEntries` メソッド（L84）のコメントにも「アプリ再起動時・abort フロー実行時に呼び出す」と記載されており、設計の一貫性が確保されている。

---

## 総合結果

| #   | 依存関係                                             | 判定                   |
| --- | ---------------------------------------------------- | ---------------------- |
| 1   | SafetyGateResult.details[].riskLevel → ToolRiskLevel | OK（型一致）           |
| 2   | AllowedToolEntryV2.expiryPolicy → 失効ポリシー4値    | OK（値セット一致）     |
| 3   | SkillSafetyContract.maxRiskLevel → ToolRiskLevel     | OK（型一致）           |
| 4   | PermissionDecisionExtended → "revoked" 追加          | OK（バッジ色定義あり） |
| 5   | abort クリーンアップ → approved_once エントリ削除    | OK（手順明記）         |

**型定義整合スコア: 5/5 全項目一致**
