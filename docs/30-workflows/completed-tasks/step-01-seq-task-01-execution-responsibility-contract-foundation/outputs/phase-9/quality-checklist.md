# Phase 9 品質チェックリスト

## メタ情報

| 項目       | 値                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                   |
| Phase      | 9 - 品質検証                                                                |
| 作成日     | 2026-03-20                                                                  |
| 依存成果物 | outputs/phase-8/refactor-boundaries.md, outputs/phase-7/integration-gate.md |

---

## 1. 5 軸品質チェックリスト

### UX 軸

| チェック項目 | 確認内容                                                              | 結果 | 根拠                                                                                                                           |
| ------------ | --------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| UX-1         | capability × state × CTA テーブルが contract-matrix.md と一致している | PASS | resolveCtaContract() の実装が contract-matrix 全 8 セルと一致することを cta-contract.test.ts（24 件）で検証済み                |
| UX-2         | `blocked` 状態の CTA に設定画面への誘導リンクが含まれている           | PASS | resolveCtaContract() の blocked パスが `{ label: "設定を開く", action: "openSettings" }` を返すことを CC-4 で検証済み          |
| UX-3         | `unavailable` 状態の CTA がユーザーに不要な操作を促していない         | PASS | resolveCtaContract() の unavailable パスが `primary: null` を返すことを CC-5 で検証済み。assertNoPrimaryCta() ガードで二重確認 |

**軸判定**: PASS

---

### Architecture 軸

| チェック項目 | 確認内容                                                                                                                              | 結果 | 根拠                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| ARCH-1       | Concern A（resolveCapability）、Concern B（resolveUiState）、Concern C（resolveCtaContract）の ownership が SRP に違反していない      | PASS | 3 concern がすべて `execution-capability.ts` 内の独立した pure function として実装。相互呼び出しなし                          |
| ARCH-2       | レイヤー依存方向が正しい。`execution-capability.ts` は `packages/shared` に配置され、Renderer → shared の正しい依存方向を維持している | PASS | `chatSlice.ts` が `@repo/shared/types/execution-capability` から AccessCapability を re-export。shared → desktop の逆依存なし |
| ARCH-3       | resolveCapability() に capability 判定以外の責務が混入していない                                                                      | PASS | 入力: `ExecutionCapabilityInput`、出力: `AccessCapability`。副作用・IO なし                                                   |
| ARCH-4       | AuthModeStatus DTO が Pure Data Object として機能している（ビジネスロジックなし）                                                     | PASS | `auth-mode.ts` の AuthModeStatus は interface（データ定義のみ）。capability / uiState フィールドを optional で追加済み        |

**軸判定**: PASS

---

### IPC 軸

| チェック項目 | 確認内容                                                                                                       | 結果 | 根拠                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------- |
| IPC-1        | AuthModeStatus DTO の capability フィールドが optional で追加されており、既存バリデーションに干渉しない        | PASS | `auth-mode.ts` L88-107: `capability?` / `uiState?` / `blockedReason?` / `blockedAction?` を optional で定義 |
| IPC-2        | AuthModeStatus DTO が P60 準拠の wrapper 形式（`IPCResponse<AuthModeStatus>`）を維持している                   | PASS | `AuthModeStatusResponse = IPCResponse<AuthModeStatus>` として定義済み。success/data/error 構造を維持        |
| IPC-3        | 本 Task01 は IPC ハンドラを変更しない（contract 定義フェーズ）。IPC チャンネル名変更なし                       | PASS | `file-change-scope.md` に「IPC チャンネル名を変更しない」と明記。変更対象外                                 |
| IPC-4        | `execution-capability.ts` の pure function は IPC を使用しない。引数名と実際の値のセマンティクスが一致している | PASS | 全関数が純粋な型変換のみ。P45 の命名 drift リスクなし                                                       |

**軸判定**: PASS

---

### Security 軸

| チェック項目 | 確認内容                                                                                      | 結果 | 根拠                                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------ |
| SEC-1        | silent fallback（capability 未確認での暗黙的な処理継続）の禁止がコード上で enforceable である | PASS | `assertNoSilentFallback()` ガードが `execution-capability.ts` に実装済み。capability="none" 時に例外を発生させる         |
| SEC-2        | auto-send（ユーザー確認なしの API 送信）の禁止が resolveCtaContract() の設計で保証されている  | PASS | resolveCtaContract() は CTA ラベル/アクション名を返すのみ。送信処理を含まない。auto-send 禁止は CTA consumer の責務      |
| SEC-3        | hidden injection（非表示状態での API キー挿入）の禁止が assertNoPrimaryCta() で保証されている | PASS | `assertNoPrimaryCta()` が unavailable 時の primary CTA null を強制する。DOM に含めない設計をガードで二重確認             |
| SEC-4        | 機密情報（API キー等）が `execution-capability.ts` に含まれていない                           | PASS | `execution-capability.ts` は純粋な boolean 入力（apiKeyValid / subscriptionValid）のみ受け取る。API キー文字列は扱わない |

**軸判定**: PASS

---

### Workflow 軸

| チェック項目 | 確認内容                                                                                             | 結果 | 根拠                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------- |
| WF-1         | canonical doc set が Task02-05 の gate として参照可能な状態で記録されている                          | PASS | `scope-definition.md` に 15 ファイルのリストが参照目的付きで記録済み         |
| WF-2         | Phase 3 ゲート判定が PASS 記録として保存されている                                                   | PASS | `outputs/phase-3/gate-decision.md` に PASS 判定が記録済み                    |
| WF-3         | Phase 7 カバレッジ実績（59 テスト PASS）が coverage-targets.md に記録されている                      | PASS | `outputs/phase-7/coverage-targets.md` に実際のテスト結果セクションを追加済み |
| WF-4         | Phase 8 実際の実装結果（execution-capability.ts 新規追加）が refactor-boundaries.md に記録されている | PASS | `outputs/phase-8/refactor-boundaries.md` のセクション 6 に実装結果を追記済み |

**軸判定**: PASS

---

## 2. release readiness 判定

| 条件                                                                                            | 確認元                                                          | verified |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------- |
| AC-1: contract-matrix の 4 状態定義が正確に定義されている                                       | Phase 2 成果物: outputs/phase-2/contract-matrix.md              | verified |
| AC-2: state × CTA の 1:1 マッピングが contract-matrix に明記されている                          | Phase 2 成果物: outputs/phase-2/contract-matrix.md              | verified |
| AC-3: FR-3 の禁止制約（silent fallback / auto-send / hidden injection）が要件として確定している | Phase 1 成果物: outputs/phase-1/requirements-definition.md FR-3 | verified |
| AC-4: canonical doc set の全パスが有効（リンク切れなし）                                        | タスク index 成果物パス: outputs/artifacts.json                 | verified |

### 総合判定

**implementation_ready**

本タスク（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001）は、5 軸品質チェックおよび全 AC の verified 確認が完了した。後続の実装タスク（Task02 以降）に対して contract-matrix・validation-matrix・canonical doc set を引き渡す準備が整っている。

---

## 3. Phase 10（最終レビュー）への引き継ぎ事項

| 事項             | 内容                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| リスク R-1       | 語彙 drift リスクは risk-register.md に記録済み。Phase 10 でも同一リスクを確認すること。                     |
| リスク R-2       | state drift リスクは Task02-05 の Phase 3 ゲートに組み込む必要がある。Phase 10 でその方針を確認すること。    |
| リスク R-3       | Concern A 侵食リスクは Task02 の Phase 3 MAJOR 戻りゲートとして設定されていることを確認すること。            |
| transport rename | `AuthModeStatus` の全面 rename は Phase 8 で不採用とした。後続タスクでの判断を Phase 10 でレコードすること。 |
