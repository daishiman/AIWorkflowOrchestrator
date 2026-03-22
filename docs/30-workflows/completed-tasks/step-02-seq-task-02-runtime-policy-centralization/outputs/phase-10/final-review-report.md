# Phase 10: 最終レビュー報告 - Runtime Policy Centralization

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| Phase        | 10 - 最終レビュー                          |
| 作成日       | 2026-03-21                                 |
| 前提成果物   | Phase 1-9 全成果物                         |
| レビュー対象 | AC-1〜AC-4 + Phase 3 MINOR（M-1〜M-3）     |

---

## 1. Phase 9 成果物の確認

### quality-checklist.md

| 確認項目                       | 結果                                             |
| ------------------------------ | ------------------------------------------------ |
| 5観点全て「確認済み」          | 確認                                             |
| implementation_ready 判定      | 着手可（条件付き）                               |
| 前提条件 C-1（M-1 型定義）     | Phase 5 sanitize-type-addendum.md で仕様確定済み |
| 前提条件 C-2（M-2 シグネチャ） | Phase 4 resolve-signature-decision.md で確定済み |

### risk-register.md

| 確認項目                             | 結果                              |
| ------------------------------------ | --------------------------------- |
| 高深刻度リスク                       | 0件（ブロッキングなし）           |
| 中深刻度リスク（R-1, R-4, R-7）      | 3件（全て実装タスク内で対応可能） |
| 低深刻度リスク（R-2, R-3, R-5, R-6） | 4件（後続タスクで対応予定）       |
| 実装着手をブロックするリスク         | なし                              |

---

## 2. AC-1〜AC-4 最終照合

### AC-1: surface-local 判定禁止の ownership table

validation-matrix.md Phase 10 チェックリスト全5項目を実行した。

| チェック項目                                         | 結果 | 根拠                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ownership table に4カテゴリ全記載                    | PASS | contract-matrix.md &sect; 1-1（runtime 実行可否）/ &sect; 1-2（health check）/ &sect; 1-3（handoff bundle）/ &sect; 1-4（authMode 参照権限）の4行が存在                                                                                                                    |
| 各カテゴリに所有層/入力/出力型/禁止層/禁止事項が明記 | PASS | 4カテゴリ全てに「判定主体」「所有層」「入力」「出力型」「呼出元」「禁止層」「禁止事項」の7項目が記載                                                                                                                                                                       |
| Renderer が禁止層として明記されているカテゴリ数      | PASS | 4カテゴリ全てで Renderer が禁止層（基準の3以上を満たす）                                                                                                                                                                                                                   |
| 禁止事項が具体的な違反パターンで記載                 | PASS | &sect; 1-1:「`authMode === "subscription"` 等の分岐」、&sect; 1-2:「`healthStatus.status === "healthy"` 等を条件に runtime 実行経路を切り替え」、&sect; 1-3:「`TerminalHandoffBundle` を直接生成・参照」、&sect; 1-4:「`authModeSlice.mode === "api-key"` 等を条件に分岐」 |
| createFallbackStatus の流用禁止                      | PASS | contract-matrix.md &sect; 1-4 特記事項に「`createFallbackStatus(mode, overrides)` による Renderer 側での状態生成も、実行可否判定への流用は禁止」と明記                                                                                                                     |

**AC-1 判定: PASS**

---

### AC-2: health route primary 確定

validation-matrix.md Phase 10 チェックリスト全5項目を実行した。

| チェック項目                                     | 結果 | 根拠                                                                                                 |
| ------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------- |
| `llm:check-health` が primary route として明記   | PASS | contract-matrix.md &sect; 3 テーブルで status 列が「**primary**」                                    |
| `AI_CHECK_CONNECTION` が legacy route として明記 | PASS | contract-matrix.md &sect; 3 テーブルで status 列が「**legacy 残置**」                                |
| legacy route に「新規コードでの使用禁止」が明記  | PASS | contract-matrix.md &sect; 3 テーブル「新規利用」列が「**禁止**」                                     |
| 廃止トリガー条件が検証可能な形式で記載           | PASS | `grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/` の結果が0件になった時点                  |
| 廃止手続き（cleanup タスク作成）の記述           | PASS | 「廃止トリガー成立後、専用の cleanup タスクを作成し `aiHandlers.ts` から当該ハンドラーを削除」と明記 |

**AC-2 判定: PASS**

---

### AC-3: 型の責務境界

validation-matrix.md Phase 10 チェックリスト全5項目を実行した。

| チェック項目                                                       | 結果 | 根拠                                                                                                                                                                                                          |
| ------------------------------------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3型の所有層が図示                                                  | PASS | design-summary.md &sect; 2-2「型の所有層マッピング」に ASCII 図で packages/shared と apps/desktop/src/main/ の分類を図示                                                                                      |
| IPC 通過可否が型ごとに定義                                         | PASS | contract-matrix.md &sect; 2 の「IPC 通過可否」列で RuntimeDecision（条件付き可）/ HandoffGuidance（可）/ HealthCheckResult（可）/ RuntimeResolution（不可）/ TerminalHandoffBundle（不可）を定義              |
| TerminalHandoffBundle / RuntimeResolution が Main 内部型として分類 | PASS | contract-matrix.md &sect; 2 で所有層が「apps/desktop（Main 内部型）」、Renderer 参照可否が「禁止」と明記                                                                                                      |
| DD-2（apiKey IPC 除外）が明記                                      | PASS | contract-matrix.md &sect; 2 の RuntimeDecision 行に「`integrated_api` の場合: `apiKey` は IPC 送信前に除外」と記載。Phase 5 sanitize-type-addendum.md で `sanitizeForRenderer()` の仕様が確定                 |
| 各型の必須フィールドが定義                                         | PASS | contract-matrix.md &sect; 2 で全型の必須フィールドを列挙（RuntimeDecision: type / HandoffGuidance: terminalCommand, contextSummary, reason / HealthCheckResult: status, providerId, errorMessage, checkedAt） |

**AC-3 判定: PASS**

---

### AC-4: policy consumption contract

validation-matrix.md Phase 10 チェックリスト全5項目を実行した。

| チェック項目                                         | 結果 | 根拠                                                                                                                                                                                                                                  |
| ---------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4原則全て記載                                        | PASS | contract-matrix.md &sect; 4 に原則1（runtime 判定は resolve 経由のみ）/ 原則2（health check は llm:check-health 経由のみ）/ 原則3（handoff は buildForSurface 経由のみ）/ 原則4（型は packages/shared から import のみ）の4原則を記載 |
| 各原則に「禁止」と「必須」が明示                     | PASS | 各原則に `[禁止]` / `[必須]` のラベル付きで具体的な行為を列挙                                                                                                                                                                         |
| 「この型を変更すると全 surface に影響する」旨の警告  | PASS | contract-matrix.md &sect; 2 冒頭と &sect; 4 冒頭に警告ブロックを記載                                                                                                                                                                  |
| TypeScript コードスニペットが含まれる                | PASS | 原則1〜4それぞれに「契約型」セクションで TypeScript コードスニペットを記載                                                                                                                                                            |
| packages/shared からの import が必須であることが記載 | PASS | 原則4 に `import type { RuntimeDecision, HandoffGuidance, HealthCheckResult, SurfaceType } from "@repo/shared/types"` のコード例を記載。禁止パターン（Main 内部型の直接 import）も明示                                                |

**AC-4 判定: PASS**

---

### 全般チェックリスト

| チェック項目                                                              | 結果 | 根拠                                                                                       |
| ------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| design-summary.md / contract-matrix.md / validation-matrix.md の3ファイル | PASS | outputs/phase-2/ に3ファイルが存在                                                         |
| 設計判断 DD-1〜DD-6 が全て記録                                            | PASS | design-summary.md &sect; 4 に DD-1〜DD-6 の6件を記載                                       |
| Simpler Alternative（案A/B/C）の比較と不採用理由                          | PASS | design-summary.md &sect; 3 に案A（採用）/ 案B（不採用）/ 案C（不採用）の比較表と理由を記載 |
| Phase 3 レビュー観点が明記                                                | PASS | validation-matrix.md &sect; 1 に AC-1〜AC-4 の確認項目・drift ポイント・確認方法を記載     |
| drift しやすいポイントが各 AC に対して記載                                | PASS | validation-matrix.md &sect; 1 で各 AC に「drift しやすいポイント」列を設定                 |

---

## 3. Phase 3 MINOR 指摘（M-1〜M-3）処置状況

| 指摘ID | 内容                                        | 処置状況        | 根拠                                                                                                                                         |
| ------ | ------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| M-1    | RuntimeDecisionForRenderer 型未定義         | 処置完了        | Phase 5 sanitize-type-addendum.md で型定義・サニタイズ関数・配置先を確定。`packages/shared/src/types/runtime.ts` に配置予定                  |
| M-2    | resolve() シグネチャ未確定                  | 処置完了        | Phase 4 resolve-signature-decision.md で `resolve(authMode: AuthMode \| undefined, apiKey: string \| undefined): RuntimeDecision` として確定 |
| M-3    | AI_CHECK_CONNECTION cleanup タスクID 未割当 | Phase 12 追跡中 | Phase 12 未タスク検出フローで `docs/30-workflows/unassigned-task/` に cleanup タスク指示書を作成予定。risk-register.md R-3 として追跡中      |

---

## 4. 品質5観点の最終確認

Phase 9 quality-checklist.md の5観点と Phase 10 での最終確認結果を対照する。

| 観点           | Phase 9 判定 | Phase 10 最終確認                                                                                                              |
| -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| UX             | 確認済み     | 状態語彙（allowed/blocked/unknown）と CTA が HandoffGuidance に反映。sanitizeForRenderer で安全な型を Renderer に提供          |
| アーキテクチャ | 確認済み     | Ownership Table の4カテゴリが arch-state-management-core.md の状態配置原則に準拠。RuntimePolicyResolver は Main Process に配置 |
| IPC            | 確認済み     | Policy Consumption Contract 4原則が api-ipc-system-core.md と整合。llm:check-health が primary、AI_CHECK_CONNECTION が legacy  |
| セキュリティ   | 確認済み     | DD-2 により apiKey が Renderer に送信されない。TerminalHandoffBundle が Main Process 内部限定                                  |
| ワークフロー   | 確認済み     | DD-1〜DD-6 が AC-1〜AC-4 と対応し、validation-matrix.md で検証可能条件が定義済み                                               |

---

## 5. 設計成果物の網羅性確認

| Phase | 成果物ファイル                | 存在 | 内容の整合性                                                                    |
| ----- | ----------------------------- | ---- | ------------------------------------------------------------------------------- |
| 1     | requirements-definition.md    | 確認 | FR/NFR/AC 定義が Phase 2 設計に反映済み                                         |
| 1     | scope-definition.md           | 確認 | スコープが Phase 2 の Concern A-C と整合                                        |
| 1     | current-state-inventory.md    | 確認 | 棚卸し結果が Phase 2 の設計判断の根拠として参照済み                             |
| 2     | design-summary.md             | 確認 | Concern 分解・責務図・設計判断が AC-1〜AC-4 をカバー                            |
| 2     | contract-matrix.md            | 確認 | Ownership Table・型契約・Health Route・Policy Contract が AC-1〜AC-4 に直接対応 |
| 2     | validation-matrix.md          | 確認 | Phase 3/4-7/10/11 の検証チェックリストが完備                                    |
| 3     | design-review-report.md       | 確認 | AC-1〜AC-4 の個別 PASS 判定が記録                                               |
| 3     | gate-decision.md              | 確認 | MINOR 判定と M-1〜M-3 の追跡先が定義                                            |
| 4     | test-case-specification.md    | 確認 | Unit/Integration テストケースが FR/AC と対応                                    |
| 4     | resolve-signature-decision.md | 確認 | M-2 の resolve シグネチャが確定                                                 |
| 4     | mock-strategy.md              | 確認 | テストモック戦略が定義                                                          |
| 5     | implementation-plan.md        | 確認 | Task03〜Task09 の実行順序・入出力契約・Policy Consumption Contract 適用が定義   |
| 5     | sanitize-type-addendum.md     | 確認 | M-1 の RuntimeDecisionForRenderer 型が確定                                      |
| 5     | file-change-scope.md          | 確認 | 変更対象ファイルのスコープが定義                                                |
| 8     | （Phase 8 成果物）            | 確認 | simpler alternative 再評価済み（簡素化候補なし）                                |
| 9     | quality-checklist.md          | 確認 | 5観点確認済み・implementation_ready 判定                                        |
| 9     | risk-register.md              | 確認 | 7件のリスク一覧と mitigation が定義                                             |

---

## 6. 総合判定

**全 AC が PASS。Phase 3 MINOR 指摘 M-1 / M-2 は処置完了。M-3 は Phase 12 で対処予定。**

設計タスクとしてプロダクションコード変更は0件。全設計成果物が AC-1〜AC-4 の検証可能条件を満たしており、Phase 11 への移行条件を充足している。
