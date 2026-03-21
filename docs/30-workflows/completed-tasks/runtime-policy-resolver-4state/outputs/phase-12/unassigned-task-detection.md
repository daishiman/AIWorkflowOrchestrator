# 未タスク検出レポート（Phase 12 Task 4）

## 検出サマリー

| 項目       | 値         |
| ---------- | ---------- |
| 検出日     | 2026-03-21 |
| 検出件数   | 2件        |
| ステータス | formalized |

---

## UT-01: public Skill Creator IPC surface と internal capability bridge が未統合

### 概要

`creatorHandlers.ts` で direct caller lane 向け capability bridge は実装されたが、実アプリが登録しているのは依然 `registerSkillCreatorHandlers` / `skill-creator:*` であり、public preload surface までは接続されていない。

### 詳細

- **対象ファイル**:
  - `apps/desktop/src/main/ipc/creatorHandlers.ts`
  - `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
  - `apps/desktop/src/main/ipc/index.ts`
  - `apps/desktop/src/preload/channels.ts`
- **問題**: internal `creator:*` adapter と public `skill-creator:*` contract の責務分担が未確定で、RuntimeSkillCreatorFacade の capability bridge が public surface から到達できない
- **影響範囲**: IPC boundary、preload contract、system spec、Skill Creator 統合テスト

### 対応方針

- formalized task: `docs/30-workflows/unassigned-task/UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001.md`
- backlog / workflow 正本 / lessons に同一ターンで導線を追加した
- 本 workflow では public contract を誤って「更新済み」と記録しない方針に修正した

### ステータス

**未タスク登録済み**

---

## UT-02: `resolveFromServices()` の subscription 判定 service 未統合

### 概要

`RuntimePolicyResolver.resolveFromServices()` において `subscriptionValid` が常に `false` にハードコードされている。`authKeyService` 以外に subscription 状態を判定する service が DI されていないため、service 経由では `terminalSurface` / `both` を再現できない。

### 詳細

- **対象ファイル**: `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- **問題コード**:
  ```typescript
  // 現状: 常に false にハードコード
  const subscriptionValid = false;
  ```
- **影響範囲**: service ベース判定では subscription プランの runtime policy を再現できず、`resolveFromServices()` が API キー偏重になる
- **根本原因**: subscription 状態を判定する専用 service interface / DI / テストが未実装

### 対応方針

- formalized task: `docs/30-workflows/unassigned-task/UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001.md`
- capability bridge 本体は完了とし、service integration は follow-up で DI 契約ごと閉じる
- public IPC wiring task とは分離し、原因と責務を混ぜない

### ステータス

**未タスク登録済み**

---

## 備考

- direct caller lane 自体は完了しているため、本レポートは「未完の広域収束」ではなく「境界外の follow-up 2件」を示す
- 2件とも独立指示書、backlog、workflow 正本、lessons への導線を同一ターンで追加した
