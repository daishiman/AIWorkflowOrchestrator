# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 1                                      |
| 機能名 | ut-sdk-07-approval-request-surface-001 |
| 作成日 | 2026-04-06                             |

## 目的

`SkillCreatorAPI` に `onApprovalRequest` surface を追加し、disclosure と同水準で approval flow を Skill Creator の public surface に接続するための要件・受入基準を確定する。

---

## 実行タスク

- P50 チェック: 対象ファイルの実装状態を確認し、既実装コードの重複作成を防止する
- 受入基準作成: AC-1〜AC-5 を検証可能な形で定義する
- 影響ファイル一覧: 変更・追加対象ファイルを確定する
- Phase 4 開始条件: Phase 3 PASS 後のみ Phase 4 へ進む gate を明記する

## タスク分類・canonical artifact

| 項目                       | 内容                                                                                                                                                                                                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスク分類                 | 実装（preload / renderer / test / documentation sync を含む）                                                                                                                                                                                                                                       |
| workflow root canonical    | `index.md`, `phase-1-requirements.md`〜`phase-13-pr-creation.md`, `artifacts.json`                                                                                                                                                                                                                  |
| Phase 12 canonical outputs | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 台帳 parity                | root `artifacts.json` と `outputs/artifacts.json` を同一 wave で同期する                                                                                                                                                                                                                            |

---

## Step 0: P50 チェック（既実装状態の確認）

### 確認コマンド

```bash
# skill-creator-api.ts の現状確認
grep -n "onApprovalRequest\|respondToApproval\|getDisclosureInfo\|safeOn" \
  apps/desktop/src/preload/skill-creator-api.ts

# APPROVAL_REQUEST チャンネルの登録確認
grep -n "APPROVAL_REQUEST" apps/desktop/src/preload/channels.ts

# SkillCreatorAPI インターフェースの最後の部分を確認
grep -n "getDisclosureInfo\|respondToApproval" apps/desktop/src/preload/skill-creator-api.ts

# ExecutionAPI の onApprovalRequest パターン確認
grep -n "onApprovalRequest" apps/desktop/src/preload/types.ts
```

### 確認結果

| 確認項目                                    | 状態       | 詳細                                                                                        |
| ------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `respondToApproval` 実装                    | 実装済み   | `skill-creator-api.ts` に `safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, ...)` 実装済み         |
| `getDisclosureInfo` 実装                    | 実装済み   | `skill-creator-api.ts` に `safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO)` 実装済み |
| `onApprovalRequest` 実装                    | **未実装** | `SkillCreatorAPI` インターフェース・実装オブジェクトともに欠如                              |
| `APPROVAL_REQUEST` チャンネル登録           | 登録済み   | `ALLOWED_ON_CHANNELS` に登録済み（`channels.ts` 行777）                                     |
| `safeOn` ヘルパー                           | 実装済み   | `skill-creator-api.ts` 行405〜 に実装済み                                                   |
| `ExecutionAPI.onApprovalRequest` 型パターン | 参照可能   | `preload/types.ts` 行1038 に payload 型定義あり                                             |
| `SkillLifecyclePanel.tsx` disclosure UI     | 実装済み   | `data-testid="skill-lifecycle-disclosure-summary"` が存在                                   |
| `SkillLifecyclePanel.tsx` approval UI       | **未実装** | approval request 購読・表示が欠如                                                           |

**P50 チェック結論**: インターフェース・実装オブジェクトへの `onApprovalRequest` 追加と、`SkillLifecyclePanel.tsx` への購読 + UI 実装のみが未完成。既存のチャンネル・safeOn 基盤は利用可能。

---

## タスク分類と並列化方針

- タスク分類: `preload` + `renderer` の実装タスク
- canonical artifact: `index.md` / `phase-*.md` / `artifacts.json` の命名を固定する
- 並列 lane: Phase 1〜3 は `skill準拠検証` と `多角的思考分析` を並列化し、Phase 4〜5 は `preload` / `renderer` を分割して進める

---

## 機能要件

| ID    | 要件                                                                                                           | 優先度 |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `SkillCreatorAPI` インターフェースに `onApprovalRequest` メソッドが追加されること                              | must   |
| FR-02 | 実装オブジェクトで `safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)` を使って購読すること                      | must   |
| FR-03 | コールバックは `{ operationType, description, destination?, sessionId, operationId }` ペイロードを受け取ること | must   |
| FR-04 | 戻り値はリスナー解除関数 `() => void` であること                                                               | must   |
| FR-05 | `SkillLifecyclePanel.tsx` が `onApprovalRequest` を購読し、approval request 受信時に UI を表示すること         | must   |
| FR-06 | approval UI と disclosure UI が対称な責務（同水準のサーフェス）で実装されること                                | must   |

## 非機能要件

| ID     | 要件                                                                                                 | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------------- | ------ |
| NFR-01 | `ExecutionAPI.onApprovalRequest` の型定義（`preload/types.ts` 行1038）と互換性のある型を使用すること | must   |
| NFR-02 | 既存の `respondToApproval` / `getDisclosureInfo` テストが引き続き PASS すること                      | must   |
| NFR-03 | `safeOn` 内の `ALLOWED_ON_CHANNELS` チェックを通過すること（既登録チャンネルを使用）                 | must   |
| NFR-04 | コンポーネントのアンマウント時にリスナーが確実に解除されること                                       | must   |

---

## 受入基準

| ID   | 基準                                                                                                       | 確認方法                                               |
| ---- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| AC-1 | `SkillCreatorAPI` インターフェースに `onApprovalRequest` メソッドが型定義されていること                    | TypeScript コンパイル通過                              |
| AC-2 | `skill-creator-api.ts` 実装オブジェクトで `safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)` が呼ばれること | ユニットテスト `skill-creator-api.approval.test.ts`    |
| AC-3 | `SkillLifecyclePanel.tsx` が `onApprovalRequest` を useEffect 内で購読し、受信時に state を更新すること    | ユニットテスト `SkillLifecyclePanel.approval.test.tsx` |
| AC-4 | approval / disclosure の UI surface が対称な構造（同一水準のバナー/サマリー表示）で確認できること          | コードレビュー・手動テスト                             |
| AC-5 | renderer テストで approval request の経路（受信 → state 更新 → UI 表示）が固定されること                   | `SkillLifecyclePanel.approval.test.tsx`                |

---

## 影響ファイル一覧

| ファイル                                                                                     | 変更種別     | 理由                                                                   |
| -------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                                              | 修正（主要） | `SkillCreatorAPI` インターフェース + 実装への `onApprovalRequest` 追加 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | 修正         | approval request 購読 + UI 表示の追加                                  |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | 新規         | `onApprovalRequest` のユニットテスト                                   |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | 新規         | `SkillLifecyclePanel` の approval 経路テスト                           |

**変更しないファイル:**

| ファイル                                        | 理由                                  |
| ----------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/preload/channels.ts`          | `APPROVAL_REQUEST` は既登録・変更不要 |
| `apps/desktop/src/preload/types.ts`             | `ExecutionAPI` の型は変更しない       |
| `apps/desktop/src/main/ipc/approvalHandlers.ts` | Main 側の実装は変更不要               |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                         | パス                                                                              | 内容                                     |
| -------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| ExecutionAPI 型定義              | `apps/desktop/src/preload/types.ts` 行1038                                        | `onApprovalRequest` ペイロード型の参照元 |
| ALLOWED_ON_CHANNELS 登録         | `apps/desktop/src/preload/channels.ts` 行777                                      | `APPROVAL_REQUEST` の許可チャンネル登録  |
| safeOn ヘルパー                  | `apps/desktop/src/preload/skill-creator-api.ts` 行405                             | 購読実装パターン                         |
| onApprovalRequest テストパターン | `apps/desktop/src/preload/__tests__/index.execution.test.ts` 行169, 250, 498      | テスト記述の参照パターン                 |
| disclosure UI 参照               | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` 行1803〜1848 | 対称実装のベースライン                   |

---

## 統合テスト連携【必須】

IPC 接続要件（`APPROVAL_REQUEST` チャンネル・safeOn 経由）を要件として明記する:

| 判定項目                     | 基準 | 結果           |
| ---------------------------- | ---- | -------------- |
| ユニットテスト Line          | 80%+ | Phase 7 で確認 |
| ユニットテスト Branch        | 60%+ | Phase 7 で確認 |
| ユニットテスト Function      | 80%+ | Phase 7 で確認 |
| IPC 経路テスト（統合）       | 100% | Phase 7 で確認 |
| 正常系シナリオ               | 100% | Phase 7 で確認 |
| 異常系（コンポーネント破棄） | 80%+ | Phase 7 で確認 |

---

## 成果物

| 成果物   | パス                      | 説明       |
| -------- | ------------------------- | ---------- |
| 要件定義 | `phase-1-requirements.md` | 本ファイル |

---

## 完了条件

- [ ] P50 チェックを実施し、既実装状態が確認されている
- [ ] 機能要件（FR-01〜FR-06）が明記されている
- [ ] 非機能要件（NFR-01〜NFR-04）が明記されている
- [ ] 受入基準（AC-1〜AC-5）が検証可能な形で定義されている
- [ ] 影響ファイル一覧が確定されている
- [ ] Phase 4 は Phase 3 PASS 後のみ開始する gate が明記されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## Phase 4 開始条件

**Phase 4 への進行は Phase 3（設計レビューゲート）が PASS 判定を得た後のみ許可される。**

Phase 3 で MAJOR 指摘が発生した場合:

- MAJOR: 設計変更 → Phase 2 へ戻る
- MAJOR: 要件変更 → 本 Phase 1 へ戻る

## 次の Phase

Phase 2: 設計 → [phase-2-design.md](phase-2-design.md)
