# Phase 10: 最終レビュー - TASK-10A-G スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 10（最終レビュー）                  |
| 機能名     | task-10a-g-lifecycle-test-hardening |
| タスクID   | TASK-10A-G                          |
| 作成日     | 2026-03-10                          |
| 前提Phase  | Phase 9: 品質検証                   |
| 依存タスク | TASK-10A-E, TASK-10A-F              |

## 目的

Phase 1〜9 の全成果物に対して多角的な品質・整合性検証を行い、PASS/MINOR/MAJOR/CRITICAL 判定を記録する。要件-実装の整合性、テスト品質、既知の落とし穴対策、セキュリティ、パフォーマンスの5観点で包括的にレビューする。

## 実行タスク

- Task 1: 要件と実装の整合性をレビューする
- Task 2: テスト品質をレビューする
- Task 3: 既知の落とし穴対策の反映状況を確認する
- Task 4: セキュリティ観点をレビューする
- Task 5: パフォーマンス観点をレビューする
- Task 6: ドキュメント整合性をレビューする

### Task 1: 要件-実装整合性レビュー

Phase 1 で定義した FR-1〜FR-7、NFR-1〜NFR-4 が全て実装されているかを検証する。

### Task 2: テスト品質レビュー

テストケースの網羅性、可読性、保守性を検証する。

### Task 3: 既知の落とし穴対策確認

P9/P13/P31/P39/P40/P42/P48 の対策が実装に反映されているかを検証する。

### Task 4: セキュリティレビュー

IPC sender 検証、入力バリデーションの完全性を検証する。

### Task 5: パフォーマンスレビュー

テスト実行時間が NFR-2（30秒以内）を満たしていることを検証する。

### Task 6: ドキュメント整合性レビュー

テスト仕様（Phase 2 設計）と実装の一致を確認する。

---

## レビュー判定ルール

| 判定     | 条件                                     | 対応                                               |
| -------- | ---------------------------------------- | -------------------------------------------------- |
| PASS     | 全レビュー観点で不整合なし               | Phase 11 へ進行                                    |
| MINOR    | 軽微な改善点のみ（機能影響なし）         | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 機能要件・テスト品質に根本的問題         | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | 要件定義に重大な欠陥、セキュリティ脆弱性 | Phase 1 へ戻り要件再確認                           |

---

## レビュー観点と確認手順

### 観点 1: 要件-実装整合性（Task 1）

#### FR 網羅性チェック

| FR ID | 要件                                             | 実装ファイル                          | 確認方法                                 | 判定 |
| ----- | ------------------------------------------------ | ------------------------------------- | ---------------------------------------- | ---- |
| FR-1  | Main IPC `skill:create` 入力バリデーションテスト | `skillHandlers.create.test.ts`        | G1-VAL-1〜6 の存在と PASS を確認         |      |
| FR-2  | Main IPC `skill:create` 正常系委譲テスト         | `skillHandlers.create.test.ts`        | G1-DEL-1〜3 の存在と PASS を確認         |      |
| FR-3  | Main IPC `skill:create` エラー系テスト           | `skillHandlers.create.test.ts`        | G1-ERR-1〜3 の存在と PASS を確認         |      |
| FR-4  | ChatPanel 起点 create -> list 遷移統合テスト     | `SkillLifecycle.integration.test.tsx` | G2-CL-1〜3 の存在と PASS を確認          |      |
| FR-5  | ChatPanel 起点 list -> analyze 遷移統合テスト    | `SkillLifecycle.integration.test.tsx` | G2-LA-1〜3 の存在と PASS を確認          |      |
| FR-6  | ChatPanel 起点 analyze -> improve 遷移統合テスト | `SkillLifecycle.integration.test.tsx` | G2-AI-1〜3 の存在と PASS を確認          |      |
| FR-7  | 既存テストとの整合性確認テスト                   | `ChatPanel.skill-management.test.tsx` | G3-INT/G3-ISO の存在と既存テスト回帰ゼロ |      |

#### NFR 網羅性チェック

| NFR ID | 要件                          | 確認方法                                          | 判定 |
| ------ | ----------------------------- | ------------------------------------------------- | ---- |
| NFR-1  | テストカバレッジ基準          | Phase 9 QG-8 のカバレッジレポートで確認           |      |
| NFR-2  | テスト実行時間30秒以内        | Phase 9 テスト実行ログの実行時間を確認            |      |
| NFR-3  | P42 準拠3段バリデーション検証 | G1-VAL テストケースで型・空文字列・trim を確認    |      |
| NFR-4  | P31/P48 個別セレクタ使用検証  | G2-SD テストケースで個別セレクタ・useShallow 確認 |      |

### 観点 2: テスト品質（Task 2）

| 確認項目         | 確認方法                                    | 判定基準                     | 判定 |
| ---------------- | ------------------------------------------- | ---------------------------- | ---- |
| テストケース数   | `grep -c "it(" ファイル名` で3ファイル合計  | G1:14 + G2:21 + G3:17 = 52件 |      |
| テスト構造       | describe/it の階層がカテゴリごとに分離      | 論理的なグルーピング         |      |
| 命名規則         | テストケース名が「条件 -> 期待結果」形式    | 全テストで統一               |      |
| モック分離（P9） | `beforeEach` で全モック・状態リセット       | テスト間の状態リーク無し     |      |
| テストデータ管理 | ファクトリ関数または定数による一元管理      | マジックナンバー不使用       |      |
| アサーション品質 | 具体的な期待値（正規表現マッチ含む）        | 曖昧なアサーション不使用     |      |
| エッジケース網羅 | 境界値（空文字列、null、undefined）のテスト | 全境界条件がカバー           |      |

### 観点 3: 既知の落とし穴対策（Task 3）

| Pitfall | 対策内容                                   | 確認方法                                                | 判定 |
| ------- | ------------------------------------------ | ------------------------------------------------------- | ---- |
| P9      | モジュールスコープ変数のテスト間リーク防止 | `beforeEach` で `vi.clearAllMocks()` が全ファイルに存在 |      |
| P13     | タイマーテストの無限ループ防止             | `runAllTimers` 未使用、`advanceTimersByTime` のみ使用   |      |
| P31     | Zustand Store Hooks 無限ループ防止         | テスト内で合成 Hook（`useXxxStore()`）が未使用          |      |
| P39     | happy-dom での userEvent 非互換            | G2/G3 テストで `userEvent` が未使用、`fireEvent` のみ   |      |
| P40     | テスト実行ディレクトリ依存                 | Phase 9 の実行コマンドが `cd apps/desktop` 前提         |      |
| P42     | 文字列引数 .trim() バリデーション          | G1-VAL-4 でスペースのみ入力のテストが存在               |      |
| P48     | 派生セレクタ useShallow 適用               | G2-SD-3 で `useShallow` 適用の安定性テストが存在        |      |

**確認コマンド例:**

```bash
# P9: beforeEach でのリセット確認
grep -n "vi.clearAllMocks\|vi.resetAllMocks" apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts
grep -n "vi.clearAllMocks\|vi.resetAllMocks" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# P39: userEvent 未使用確認
grep -rn "userEvent" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
grep -rn "userEvent" apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx

# P13: runAllTimers 未使用確認
grep -rn "runAllTimers\|runAllTicks" apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts
grep -rn "runAllTimers\|runAllTicks" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# P42: trim バリデーションテスト存在確認
grep -n "trim\|spaces\|whitespace\|\"   \"" apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts
```

### 観点 4: セキュリティ（Task 4）

| 確認項目                  | 確認方法                                              | 判定基準                     | 判定 |
| ------------------------- | ----------------------------------------------------- | ---------------------------- | ---- |
| sender 検証テスト         | G1-SEC-1/G1-SEC-2 の存在と PASS                       | validateIpcSender が検証済み |      |
| P42 準拠3段バリデーション | G1-VAL-1〜4 で型・空文字列・trim 空文字列の全パターン | 全パターンがテスト済み       |      |
| options 型検証            | G1-VAL-5/G1-VAL-6 で null/非オブジェクトの検証        | typeof + null チェック済み   |      |
| エラーサニタイズ          | G1-ERR-2 でパス情報のマスク検証                       | 内部パス情報が漏洩しない     |      |
| IPC チャンネル定数使用    | テスト内で `IPC_CHANNELS.SKILL_CREATE` 定数を使用     | ハードコード文字列未使用     |      |

### 観点 5: パフォーマンス（Task 5）

| 確認項目          | 確認方法               | 判定基準 | 判定 |
| ----------------- | ---------------------- | -------- | ---- |
| G1 テスト実行時間 | Phase 9 テスト実行ログ | 10秒以内 |      |
| G2 テスト実行時間 | Phase 9 テスト実行ログ | 15秒以内 |      |
| G3 テスト実行時間 | Phase 9 テスト実行ログ | 10秒以内 |      |
| 全テスト合計時間  | Phase 9 テスト実行ログ | 30秒以内 |      |

### 観点 6: ドキュメント整合性（Task 6）

| 確認項目           | 確認方法                                         | 判定基準                   | 判定 |
| ------------------ | ------------------------------------------------ | -------------------------- | ---- |
| テストケースID一致 | Phase 2 設計の G1/G2/G3 ID と実装テスト名の対応  | 全 ID が実装に反映         |      |
| テスト数一致       | Phase 2 設計の初期31件と Phase 6拡充後52件の実績 | G1:14, G2:21, G3:17 で整合 |      |
| モック構成一致     | Phase 2 設計のモック構成と実装のモック           | 設計通りのモック構成       |      |
| 品質ゲート一致     | Phase 2 QG-1〜QG-6 と Phase 9 QG-1〜QG-8 の整合  | ゲート基準が一貫           |      |
| 成果物パス一致     | Phase 1 成果物テーブルと実装ファイルパス         | 全パスが一致               |      |

---

## レビュー結果記録テンプレート

```markdown
## 最終レビュー結果

### レビュー日時: YYYY-MM-DD HH:MM

### 観点別判定

| #   | 観点               | 判定                      | 指摘事項 |
| --- | ------------------ | ------------------------- | -------- |
| 1   | 要件-実装整合性    | PASS/MINOR/MAJOR          | 詳細     |
| 2   | テスト品質         | PASS/MINOR/MAJOR          | 詳細     |
| 3   | 既知落とし穴対策   | PASS/MINOR/MAJOR          | 詳細     |
| 4   | セキュリティ       | PASS/MINOR/MAJOR/CRITICAL | 詳細     |
| 5   | パフォーマンス     | PASS/MINOR/MAJOR          | 詳細     |
| 6   | ドキュメント整合性 | PASS/MINOR                | 詳細     |

### 総合判定: PASS / MINOR / MAJOR / CRITICAL

### 指摘事項一覧（MINOR 以上）

| #   | 観点 | 指摘内容 | 影響度 | 対応方針 | 未タスクID |
| --- | ---- | -------- | ------ | -------- | ---------- |
| 1   |      |          |        |          |            |

### 未タスク仕様書（MINOR 指摘の場合）

- [ ] 未タスク仕様書が `unassigned-task/` に作成されている
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録されている
- [ ] 関連仕様書に参照リンクが追加されている
```

---

## MINOR 指摘時の必須対応

MINOR 判定の場合、以下の3ステップを**全て**完了する（P3 準拠、省略不可）:

1. **未タスク仕様書作成**: `unassigned-task/` に指示書を作成する
2. **残課題テーブル登録**: `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに行を追加する
3. **関連仕様書リンク**: 関連する仕様書に未タスク参照リンクを追加する

---

## 参照資料

| 参照資料               | パス                                                                              | 使用目的                                                      |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Phase 1 要件定義       | `phase-1-requirements.md`                                                         | FR/NFR 確認                                                   |
| Phase 2 設計           | `phase-2-design.md`                                                               | テスト設計確認                                                |
| Phase 3 設計レビュー   | `phase-3-design-review.md`                                                        | レビュー基準確認                                              |
| Phase 5 Green レポート | `outputs/phase-5/g1-g2-g3-green-report.md`                                        | 実装完了基準の確認                                            |
| Phase 9 品質検証       | `outputs/phase-9/quality-verification-report.md`                                  | テスト結果確認                                                |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準                                                      |
| タスク運用台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 判定ルール                                                    |
| 教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 再監査観点                                                    |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | セキュリティ基準                                              |
| UI実装記録             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | `skill:create` 契約の正本                                     |
| UI機能別実装記録       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | SkillAnalysisView / SkillCreateWizard / TASK-10A-F の画面責務 |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | ChatPanel 導線と状態遷移の正本                                |
| UI統合インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`    | ChatPanel 公開インターフェースと UI 統合境界                  |
| エラー仕様             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | エラーコード検証                                              |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト品質基準                                                |

---

## 統合テスト連携

### レビュー対象の全テスト階層

```
Layer 1: Main IPC 契約テスト（G1）── 14テストケース
  └─ skillHandlers.create.test.ts
       ├─ G1-VAL: 入力バリデーション（6件）
       ├─ G1-DEL: 正常系委譲（3件）
       ├─ G1-ERR: エラー系（3件）
       └─ G1-SEC: セキュリティ（2件）

Layer 2: Renderer 統合テスト（G2）── 21テストケース
  └─ SkillLifecycle.integration.test.tsx
       ├─ G2-CL: create -> list（3件）
       ├─ G2-LA: list -> analyze（3件）
       ├─ G2-AI: analyze -> improve（3件）
       ├─ G2-SD: Store駆動検証（3件）
       ├─ G2-VAL: 入力/ガード検証（6件）
       └─ G2-GUARD: concurrency / executing guard（3件）

Layer 3: ChatPanel 整合テスト（G3）── 17テストケース
  └─ ChatPanel.skill-management.test.tsx
       ├─ 既存回帰: 12件
       ├─ G3-INT: ChatPanel導線（3件）
       └─ G3-ISO: テスト間分離（2件）

合計: 52テストケース
```

### レビュー結果の Phase 11 への引き渡し

- PASS: Phase 11 手動テストへ進行。テスト品質が保証済みの状態で UI 検証を実施
- MINOR: 未タスク仕様書を作成した上で Phase 11 へ進行
- MAJOR/CRITICAL: 該当 Phase へ差し戻し。差し戻し先 Phase の再実行後に Phase 10 を再実施

---

## 多角的チェック観点

| 観点             | 確認内容                                                |
| ---------------- | ------------------------------------------------------- |
| FR 網羅性        | FR-1〜FR-7 が全て実装されテスト PASS                    |
| NFR 網羅性       | NFR-1〜NFR-4 が全て対応済み                             |
| テスト品質       | 52テストケース全 PASS、構造・命名が統一                 |
| Pitfall 対策     | P9/P13/P31/P39/P40/P42/P48 の7件全て対策済み            |
| セキュリティ     | sender 検証・P42 バリデーション・エラーサニタイズが完全 |
| パフォーマンス   | テスト実行時間30秒以内                                  |
| 回帰             | 既存テスト（skillHandlers + agentSlice）全 PASS         |
| ドキュメント整合 | Phase 2 設計と実装の一致                                |

---

## 成果物

| 成果物           | パス                                                                                                                     | 種別 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ | ---- |
| レビューレポート | `docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening/outputs/phase-10/final-review-report.md` | 新規 |
| 未タスク仕様書   | `docs/30-workflows/unassigned-task/` （MINOR時のみ作成）                                                                 | 条件 |

---

## 完了条件

- [ ] 全レビュー観点（6観点）で判定が記録されている
- [ ] FR-1〜FR-7 の実装確認が完了している
- [ ] NFR-1〜NFR-4 の対応確認が完了している
- [ ] 既知の落とし穴（P9/P13/P31/P39/P40/P42/P48）の対策確認が完了している
- [ ] セキュリティレビュー（sender 検証・P42 バリデーション）が完了している
- [ ] パフォーマンスレビュー（30秒以内）が完了している
- [ ] ドキュメント整合性レビューが完了している
- [ ] PASS/MINOR/MAJOR/CRITICAL の総合判定が確定している
- [ ] MINOR 以上の指摘がある場合、未タスク仕様書が P3 準拠で作成されている
- [ ] レビューレポートが作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

1. 要件-実装整合性レビュー（Task 1）
2. テスト品質レビュー（Task 2）
3. 既知の落とし穴対策確認（Task 3）
4. セキュリティレビュー（Task 4）
5. パフォーマンスレビュー（Task 5）
6. ドキュメント整合性レビュー（Task 6）
7. 総合判定記録
8. 未タスク仕様書作成（MINOR 以上の場合）
9. レビューレポート作成
10. 完了条件確認

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次の Phase

Phase 11: 手動テスト - UI テスト・E2E シナリオ実行を行う。
