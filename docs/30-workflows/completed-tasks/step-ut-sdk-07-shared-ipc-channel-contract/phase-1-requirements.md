# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| Phase名    | 要件定義                                   |
| 前提Phase  | -                                          |
| 後続Phase  | Phase 2                                    |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |
| タスク分類 | code task                                  |

---

## 目的

`packages/shared/src/ipc/channels.ts` と `apps/desktop/src/preload/channels.ts` 間の IPC channel 定義 parity drift を解消するための要件を明確化する。

## 背景

TASK-SDK-07 で governance bundle を実装した際、shared channel の再利用を前提としたが、実際には以下の3チャネルが shared 側に**未定義**であることが判明した：

- `APPROVAL_RESPOND` (`"approval:respond"`)
- `APPROVAL_REQUEST` (`"approval:request"`)
- `EXECUTION_GET_DISCLOSURE_INFO` (`"execution:get-disclosure-info"`)

desktop 側の `preload/channels.ts` にはこれらが定義済みだが、shared package との parity が取れていない。

既存の `apps/desktop/src/preload/channels.test.ts` では preload 側の allowlist を検証しているが、今回の3チャネルは shared 正本との突合がまだ入っていない。

---

## 実行タスク

### タスク1: P50チェック — 既存実装状態の確認

**目的**: 現在の実装状態を正確に把握し、要件のスコープを確定する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` を読み、定義済みチャネル一覧を確認する
2. `apps/desktop/src/preload/channels.ts` の `APPROVAL_RESPOND`, `APPROVAL_REQUEST`, `EXECUTION_GET_DISCLOSURE_INFO` の文字列値を確認する
3. 両ファイル間の差分（drift）を一覧化する
4. `governance-bundle.test.ts` 観点5 の現在の assertion 内容を確認する
5. `apps/desktop/src/preload/channels.test.ts` の allowlist / channel contract を確認する

**期待される成果物**:

- P50チェック結果（drift 一覧）

---

### タスク2: スコープ定義

**目的**: 本タスクで修正する範囲と除外する範囲を明確にする

**実行手順**:

1. drift 一覧をもとに修正対象チャネルを確定する
2. スコープ内外を明示する
3. 既存の `apps/desktop/src/preload/channels.test.ts` を維持しつつ、新チャネルの allowlist 追加を確認対象に含める

**期待される成果物**:

- スコープ定義書

#### スコープ（含むもの）

| 項目                                                  | 理由                          |
| ----------------------------------------------------- | ----------------------------- |
| shared 側への 3 チャネル定義追加                      | parity drift 解消の直接対象   |
| desktop 側の import 元変更（shared から import）      | single source of truth の実現 |
| desktop preload allowlist テストの拡張                | 新チャネルの公開面確認        |
| cross-layer parity テスト追加                         | drift 再発防止                |
| `governance-bundle.test.ts` 観点5 への assertion 追加 | 既存テストの実装整合性強化    |

#### スコープ外（含まないもの）

| 項目                             | 理由                              |
| -------------------------------- | --------------------------------- |
| Approval request surface UI 実装 | 別タスク（UI 実装は独立スコープ） |
| 他チャネルの parity 監査         | 本タスクは 3 チャネル限定         |
| preload allowlist の構造変更     | 既存の allowlist 構造は維持する   |

---

### タスク3: 受入基準の定義

**目的**: タスク完了の判定基準を明確にする

**受入基準**:

1. `packages/shared/src/ipc/channels.ts` に以下が定義されている：
   - `APPROVAL_RESPOND = "approval:respond"`
   - `APPROVAL_REQUEST = "approval:request"`
   - `EXECUTION_GET_DISCLOSURE_INFO = "execution:get-disclosure-info"`
2. `apps/desktop/src/preload/channels.ts` が shared package から上記を import している
3. cross-layer parity テストが通る（shared 定義 === desktop 使用値）
4. `APPROVAL_RESPOND !== EXECUTION_GET_DISCLOSURE_INFO` separation assertion が通る
5. 既存テスト（`apps/desktop/src/preload/channels.test.ts`、`governance-bundle.test.ts`、`approvalHandlers.test.ts`、`skill-creator-api.governance.test.ts`）が全て green

---

## 参照資料

| 参照資料                 | パス                                                                         | 内容                   |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------- |
| shared channels          | `packages/shared/src/ipc/channels.ts`                                        | shared 側チャネル定義  |
| preload channels test    | `apps/desktop/src/preload/channels.test.ts`                                  | preload allowlist      |
| desktop preload channels | `apps/desktop/src/preload/channels.ts`                                       | desktop 側チャネル定義 |
| governance bundle test   | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | 観点5 disclosure test  |
| approval handlers test   | `apps/desktop/src/main/ipc/__tests__/approvalHandlers.test.ts`               | approval IPC test      |
| governance preload test  | `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts`    | allowlist governance   |

---

## 統合テスト連携（Phase 1）

- 接続要件: shared → desktop の import パスが正しく解決されること
- データフロー: renderer → preload → main の IPC channel 名が shared 定義と一致すること
- 認証: APPROVAL_REQUEST は push notification（`on` チャネル）、APPROVAL_RESPOND / EXECUTION_GET_DISCLOSURE_INFO は invoke チャネルとして正しく分類されること

---

## 成果物

| 成果物       | パス                                      | 内容                 |
| ------------ | ----------------------------------------- | -------------------- |
| P50チェック  | `outputs/phase-1/requirements-summary.md` | drift 一覧と現状分析 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`     | スコープ内外の明示   |
| 受入基準     | `outputs/phase-1/acceptance-criteria.md`  | 完了判定基準一覧     |

---

## 完了条件

- [ ] P50チェックで shared/desktop 間の drift が一覧化されている
- [ ] スコープ（含む/含まない）が明確に定義されている
- [ ] 受入基準が具体的・検証可能な形で定義されている
- [ ] 統合テスト連携の接続要件が明記されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 2: 設計 → `phase-2-design.md`
