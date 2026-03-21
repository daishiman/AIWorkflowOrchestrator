# Phase 1: 要件定義 - Runtime Policy Centralization

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| タスク種別   | design（設計タスク）                       |
| 作成日       | 2026-03-21                                 |
| ステータス   | Phase 1 完了                               |
| 依存タスク   | Task01 Contract Foundation                 |
| 後続フェーズ | Phase 2 設計                               |

---

## 目的

surface（AI Chat / Agent / Skill / Skill Creator）ごとに散在している runtime 判定ロジック（integrated_api vs terminal_handoff の決定、health check の実行、authMode の参照）を、単一の shared runtime policy 層に集約する。

Renderer 側での local 判定（authMode 参照・health 判定）を禁止し、Main Process が単一の権威ある判定源（Single Source of Truth）となる契約を設計する。

---

## 機能要件（FR）

### FR-1: Runtime Policy の単一所有者定義

- Main Process（`RuntimePolicyResolver`）を runtime 判定の唯一の権威とする
- Renderer は policy 判定を自ら行わず、IPC 経由で判定結果のみを受け取る
- policy 判定の入力（authMode・apiKey）は Main Process 内部でのみ参照・評価する

### FR-2: RuntimePolicyResolver と RuntimeResolver の責務統合

- 現在並存する `RuntimePolicyResolver`（authMode + apiKey → RuntimeDecision）と `RuntimeResolver`（IAuthKeyService + IAuthModeService DI → RuntimeResolution）を単一の正規リゾルバーに統合する
- 正規リゾルバーは `integrated_api` / `terminal_handoff` の二値を返す `RuntimeDecision` 型を採用する
- `RuntimeResolution`（`integrated` / `handoff`）型は非推奨とし、移行後に削除する

### FR-3: Health Route の一本化

- health check の一次ルートを `llm:check-health`（IPC チャンネル）に確定する
- `AI_CHECK_CONNECTION` ルートを legacy 互換残置と明示し、新規実装での使用を禁止する
- `llm:check-health` が primary となる ownership table を定義する

### FR-4: surface-local 判定の禁止ルール定義

- Renderer 側での `authMode` 直接参照による runtime 分岐を禁止する
- `llmSlice.checkHealth()` が `llm:check-health` を呼ぶ現行パターンを維持しつつ、UI 表示目的に限定する
- 実行可否（integrated / handoff）の判定は必ず Main Process で行い、結果を IPC レスポンスに含める

### FR-5: policy consumption contract の定義

- Step 03 以降（Chat / Agent / Skill / Skill Creator）が参照する共通型定義を確立する
- 各 surface のハンドラーが受け取る policy 結果の形式（`RuntimeDecision`）を統一する
- contract は `packages/shared` または Main Process の型定義ファイルに配置する

### FR-6: HandoffGuidance の責務境界定義

- `TerminalHandoffBuilder.buildForAgentExecution` / `buildForSkillExecution` の surface 分岐を整理する
- surface 名（`surface=agent` / `surface=skill`）の付与ルールを ownership table に記載する
- `HandoffGuidance`（`terminalCommand` / `contextSummary` / `reason`）の必須フィールドを確定する

### FR-7: Health DTO の形式定義

- `HealthCheckResult`（status / providerId / errorMessage / checkedAt）の正規形式を定義する
- `llm:check-health` が返す DTO と Renderer の `healthStatus` Store に格納する型の整合を保証する
- health 判定の鮮度（checkedAt）の扱いを policy 層の責務外として明示する

### FR-8: ownership table の作成

- 以下の判定ごとに「判定を行う層」「入力」「出力」「禁止事項」を表形式で定義する:
  - runtime 実行可否（integrated / handoff）
  - health check の実行
  - handoff bundle の構築
  - authMode の参照

---

## 非機能要件（NFR）

### NFR-1: 性能

- runtime policy の解決は同期的に完了可能な設計とする（I/O ブロックを policy 解決の内部に隠蔽しない）
- health check は非同期 IPC として実行され、UI のブロッキングは発生しない

### NFR-2: セキュリティ

- `authMode`・`apiKey` は Main Process 内部にのみ存在し、Renderer に渡さない（04-electron-security.md 準拠）
- policy 判定結果（`RuntimeDecision`）に `apiKey` の生値を含めない
  - `integrated_api` 型では `apiKey` フィールドを保持するが、IPC レスポンスとして Renderer に送信する場合は除外する
- ownership table の「禁止事項」列に上記を明記する

### NFR-3: 保守性

- `RuntimePolicyResolver` と `RuntimeResolver` の二重管理を解消し、変更箇所を1ファイルに集約する
- ownership table は `packages/shared/types/` または `apps/desktop/src/main/services/runtime/` の型定義ファイルと同期して管理する
- 新規 surface 追加時の変更箇所が ownership table の参照1箇所で完結するよう設計する

### NFR-4: テスタビリティ

- 正規リゾルバーはインターフェース（`IRuntimePolicyResolver`）経由で DI されるため、テスト用モックに差し替え可能とする
- ownership table が定義する契約は型定義として表現し、コンパイル時に検証可能とする

---

## 受入基準の詳細化（AC-1〜AC-4）

### AC-1: surface-local 判定禁止の ownership table

**検証可能な条件:**

- ownership table が以下の4判定カテゴリを網羅していること:
  1. runtime 実行可否（integrated / handoff）
  2. health check の実行主体
  3. handoff bundle の構築
  4. authMode の参照権限
- 各行に「所有層」「入力」「出力」「禁止層」が明記されていること
- Renderer が禁止層として明記されている判定カテゴリが最低3つあること

### AC-2: health route の primary 確定と legacy 残置条件

**検証可能な条件:**

- `llm:check-health` が primary route として ownership table に明記されていること
- `AI_CHECK_CONNECTION` が legacy route として、以下の条件付きで残置が認められていること:
  - 「新規コードでの参照禁止」が明示されていること
  - 削除予定時期または削除トリガー条件が記載されていること
- legacy route の廃止条件（例: Step N 完了後）が定義されていること

### AC-3: RuntimePolicy / HandoffGuidance / Health DTO の責務境界

**検証可能な条件:**

- Phase 2 設計書（`phase-2-design.md`）において以下の図示があること:
  - 各型（`RuntimeDecision` / `HandoffGuidance` / `HealthCheckResult`）の所有層
  - 型間の依存方向
  - IPC 境界（Main ↔ Renderer）の通過可否
- 各型の必須フィールド定義が型定義ファイルと整合していること

### AC-4: policy consumption contract の完成

**検証可能な条件:**

- Step 03 以降のハンドラーが参照する型定義が `packages/shared` または `apps/desktop/src/main/` に配置されていること
- 各 surface のハンドラーが `RuntimeDecision` を受け取る際の型が統一されていること
- contract ファイルに「この型を変更する場合は Step 03-09 の全 surface に影響する」旨の警告コメントが含まれていること

---

## 完了条件

- [ ] 本ファイル（requirements-definition.md）が全セクション記載済みであること
- [ ] FR-1〜FR-8 が全て定義されていること
- [ ] NFR-1〜NFR-4 が全て定義されていること
- [ ] AC-1〜AC-4 が検証可能な条件として展開されていること
- [ ] Phase 2（設計）への入力として `scope-definition.md` および `current-state-inventory.md` が揃っていること

## 次フェーズ

Phase 2: 設計（`phase-2-design.md`）にて ownership table・型定義・responsibility diagram を作成する。
