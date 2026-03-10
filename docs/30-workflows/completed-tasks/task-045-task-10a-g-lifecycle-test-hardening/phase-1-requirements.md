# Phase 1: 要件定義 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 1 - 要件定義                        |
| 機能名     | task-10a-g-lifecycle-test-hardening |
| タスクID   | TASK-10A-G                          |
| 作成日     | 2026-03-10                          |
| 前提タスク | TASK-10A-E, TASK-10A-F              |
| ステータス | completed                           |

## 目的

TASK-10A-E と TASK-10A-F で定義された契約・状態遷移を、Main IPC 契約テスト、Store 駆動ライフサイクルテスト、ChatPanel 結線テストで保護する仕様を定義する。G2 は Store / hook / preload 契約を中心に扱い、G3 は ChatPanel の toggle / visibility / disable / panel wiring に責務を限定する。

### スコープ

- Main Process: `skill:create` IPC ハンドラの契約テスト（入力バリデーション・正常系委譲・エラー系・sender 検証）
- Renderer: Store 駆動のスキルライフサイクル統合テスト（`createSkill -> fetchSkills -> analyzeSkill -> applySkillImprovements`）
- ChatPanel: SkillManagementPanel との結線テスト（toggle / visibility / disable / wiring）
- 品質ゲート: targeted regression と coverage gate の統合

### スコープ外

- `skill:create` ハンドラ自体の実装変更
- ChatPanel / SkillManagementPanel のUI実装変更
- E2Eテスト（Playwright）の追加

## 受け入れ基準

| ID   | 基準                                                                                    | 検証方法                                                       |
| ---- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| AC-1 | `skill:create` の入力バリデーションテストが P42準拠3段バリデーションを検証する          | テストコードに3パターン（型・空文字列・trim空文字列）が存在    |
| AC-2 | `skill:create` の正常系テストが `skillService.createSkillFromWizard` への委譲を検証する | モック呼び出し引数の一致確認テストが存在                       |
| AC-3 | `skill:create` のエラー系テストが `sanitizeErrorMessage` 経由のエラー返却を検証する     | エラーコード `CREATE_ERROR` の検証テストが存在                 |
| AC-4 | Store 駆動で create 成功後の `fetchSkills` 連鎖が検証される                             | `createSkill` 成功後の再取得テストが存在                       |
| AC-5 | Store 駆動で analyze / improve 時の状態遷移が検証される                                 | `isAnalyzing` / `isImproving` / `currentAnalysis` の検証が存在 |
| AC-6 | ChatPanel が SkillManagementPanel と正しく結線され、実行中ガードを守る                  | toggle / visibility / disable / wiring テストが存在            |
| AC-7 | 既存テストとの整合性が確認され、回帰がゼロである                                        | `pnpm vitest run` で既存テスト全PASS                           |
| AC-8 | テストカバレッジが Line 80%以上、Branch 60%以上を達成する                               | カバレッジレポートで確認                                       |

## 実行タスク

- Task 1: 既存仕様からテスト要件を抽出する
- Task 2: FR/NFR と受け入れ基準を定義する

### Task 1: 要件抽出

#### 1.1 Main IPC `skill:create` 契約テスト要件（SubAgent G1）

対象ハンドラ: `apps/desktop/src/main/ipc/skillHandlers.ts` L684-732

**入力バリデーション要件:**

| テストケース                  | 入力                   | 期待結果                                                   |
| ----------------------------- | ---------------------- | ---------------------------------------------------------- |
| description が非文字列        | `description = 123`    | `VALIDATION_ERROR`: description must be a non-empty string |
| description が空文字列        | `description = ""`     | `VALIDATION_ERROR`: description must be a non-empty string |
| description が空白のみ（P42） | `description = "   "`  | `VALIDATION_ERROR`: description must be a non-empty string |
| options が null               | `options = null`       | `VALIDATION_ERROR`: options must be an object              |
| options が非オブジェクト      | `options = "string"`   | `VALIDATION_ERROR`: options must be an object              |
| sender 検証失敗               | 不正な送信元ウィンドウ | `toIPCValidationError` でエラー返却                        |

**正常系委譲要件:**

| テストケース                 | 入力                                                                   | 期待結果                                                    |
| ---------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| 正常な description + options | `description = "テストスキル"`, `options = {generateTasks: true, ...}` | `skillService.createSkillFromWizard` が正しい引数で呼ばれる |
| description の trim          | `description = "  テスト  "`                                           | trim済み `"テスト"` が委譲される                            |

**エラー系要件:**

| テストケース              | 入力     | 期待結果                                                   |
| ------------------------- | -------- | ---------------------------------------------------------- |
| skillService が例外送出   | 正常入力 | `CREATE_ERROR` + `sanitizeErrorMessage` 適用済みメッセージ |
| skillService が null 返却 | 正常入力 | 戻り値が null（エラーではない）                            |

#### 1.2 Renderer統合（Store駆動）テスト要件（SubAgent G2）

対象ファイル: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`

**ライフサイクル要件:**

| テストケース          | 前提状態     | 操作                                             | 期待結果                                           |
| --------------------- | ------------ | ------------------------------------------------ | -------------------------------------------------- |
| create -> fetchSkills | 初期状態     | `createSkill("desc", options)`                   | 成功後に `fetchSkills` が呼ばれる                  |
| create failure        | 初期状態     | `createSkill` が失敗                             | `skillError` が設定される                          |
| analyze start         | 分析前       | `analyzeSkill("skill-1")`                        | `isAnalyzing === true`, `currentAnalysis === null` |
| analyze success       | 分析中       | 分析成功                                         | `currentAnalysis` が設定される                     |
| improve start         | 分析結果あり | `applySkillImprovements("skill-1", suggestions)` | `isImproving === true`                             |
| improve success       | 改善中       | 改善成功                                         | `currentAnalysis === null`                         |

**Store駆動検証要件（P31/P48対策）:**

| テストケース           | 検証内容                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| 個別セレクタ使用の確認 | `useCreateSkill` / `useAnalyzeSkill` / `useApplySkillImprovements` が必要最小限を購読する |
| 派生セレクタの安定性   | selector stability / `useShallow` 前提が崩れない                                          |
| テスト間の状態分離     | `beforeEach` で Store が初期化される                                                      |

#### 1.3 ChatPanel 結線・品質ゲート要件（SubAgent G3）

| ゲート項目     | 基準                                                 | 失敗時アクション                    |
| -------------- | ---------------------------------------------------- | ----------------------------------- |
| ChatPanel 結線 | toggle / visibility / disable / wiring が PASS       | ChatPanel mock / Store 境界を見直す |
| TypeCheck      | `pnpm typecheck` PASS                                | Phase 5 へ差し戻し                  |
| 対象テスト     | G1/G2/G3 の対象 suite 全 PASS                        | テスト修正後再実行                  |
| 既存テスト回帰 | 既存テスト全 PASS（回帰ゼロ）                        | 回帰原因調査、モック整合修正        |
| カバレッジ     | G1 handler-scope, G2/G3 targeted coverage が基準以上 | Phase 6 でテスト拡充                |
| テスト実行時間 | 全テスト30秒以内                                     | テスト分割または並列化              |

### Task 2: FR/NFR 分類

#### 機能要件（FR）

| ID   | 要件                                                       | 受入基準 | SubAgent |
| ---- | ---------------------------------------------------------- | -------- | -------- |
| FR-1 | Main IPC `skill:create` ハンドラの入力バリデーションテスト | AC-1     | G1       |
| FR-2 | Main IPC `skill:create` ハンドラの正常系委譲テスト         | AC-2     | G1       |
| FR-3 | Main IPC `skill:create` ハンドラのエラー系テスト           | AC-3     | G1       |
| FR-4 | Store 駆動の create -> fetchSkills 遷移統合テスト          | AC-4     | G2       |
| FR-5 | Store 駆動の analyze / improve 状態遷移テスト              | AC-5     | G2       |
| FR-6 | ChatPanel の toggle / disable / wiring テスト              | AC-6     | G3       |
| FR-7 | 既存テストとの整合性確認テスト                             | AC-7     | G3       |

#### 非機能要件（NFR）

| ID    | 要件                              | 基準                                | 受入基準 |
| ----- | --------------------------------- | ----------------------------------- | -------- |
| NFR-1 | テストカバレッジ基準              | Line 80%+, Branch 60%+              | AC-8     |
| NFR-2 | テスト実行時間                    | 全テスト30秒以内                    | -        |
| NFR-3 | P42準拠の3段バリデーション検証    | 型・空文字列・trim空文字列          | AC-1     |
| NFR-4 | P31/P48対策の個別セレクタ使用検証 | 合成Hook未使用・selector 安定性確認 | AC-4-6   |

## 参照資料

| 参照資料               | パス                                                                                        | 使用目的                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| resource-map           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | テスト実装/コンポーネントテスト導線抽出                           |
| UI実装記録             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | `skill:create` の4層同期と SkillCreateWizard 契約確認             |
| UI機能別実装記録       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillAnalysisView / SkillCreateWizard / TASK-10A-F の画面責務確認 |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | ChatPanel 導線と SkillManagementPanel 状態遷移確認                |
| UI統合インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | ChatPanel の公開インターフェースと統合境界確認                    |
| Skillインターフェース  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | UI側期待契約確認                                                  |
| IPCセキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender/P42検証観点                                                |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | 最小権限と境界防御の観点を固定                                    |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | 統合テスト構成                                                    |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ・品質ゲート                                            |
| エラー仕様             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 異常系期待値                                                      |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Store駆動状態境界と個別セレクタ条件確認                           |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Handler Map と Main IPC 間接テスト設計                            |
| タスク運用台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | TASK-10A-C/D/F の完了記録と同期観点確認                           |
| 教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | `skill:create` 契約同期漏れと coverage 誤読の再発防止             |

## 実行手順

### Step 1: 既存実装の調査

1. `apps/desktop/src/main/ipc/skillHandlers.ts` の `skill:create` ハンドラ実装を確認する
2. 既存テストファイル（`skillHandlers.test.ts`, `skillHandlers.contract.test.ts`, `skillHandlers.validation.test.ts`）で `skill:create` のカバレッジ有無を確認する
3. `ChatPanel.skill-management.test.tsx` の既存テストケース構成を確認する

### Step 2: テスト要件の定義

1. FR-1〜FR-3: Main IPC `skill:create` 契約テスト要件を上記テーブルに基づき定義する
2. FR-4〜FR-6: Store 駆動 lifecycle と ChatPanel 結線テスト要件を上記テーブルに基づき定義する
3. FR-7: 既存テストとの整合性確認要件を定義する

### Step 3: 品質ゲートの定義

1. NFR-1〜NFR-4 の検証基準と失敗時アクションを定義する
2. 切り分け順序（Main -> Renderer -> 統合）を定義する
3. 回帰テスト戦略を定義する

### Step 4: 受け入れ基準の検証可能性確認

1. 各 AC が具体的なテストコードまたはコマンド出力で検証可能であることを確認する
2. 曖昧な表現（例: 抽象語や条件未定義の表現）がないことを確認する

## 統合テスト連携

### テスト階層構造

```
Layer 1: Main IPC 単体テスト（G1）
  └─ skillHandlers.create.test.ts
       ├─ 入力バリデーション（P42準拠3段）
       ├─ sender検証（validateIpcSender）
       ├─ 正常系委譲（skillService.createSkillFromWizard）
       └─ エラー系（sanitizeErrorMessage）

Layer 2: Renderer 統合テスト（G2）
  ├─ SkillLifecycle.integration.test.tsx（新規）
  │    ├─ create -> fetchSkills
  │    ├─ analyze 状態遷移
  │    └─ improve 状態遷移

Layer 3: ChatPanel 結線テスト（G3）
  └─ ChatPanel.skill-management.test.tsx（拡張）
       ├─ toggle / visibility
       ├─ executing guard
       └─ SkillManagementPanel wiring

Layer 4: 品質ゲート
  └─ TypeCheck + 全テスト + カバレッジ + 回帰ゼロ
```

### テスト間の依存関係

- Layer 1 が PASS しなければ Layer 2 の失敗原因が IPC 契約違反か UI ロジックか切り分けできない
- Layer 2 は Layer 1 の PASS を前提として、Store 駆動の遷移ロジックを検証する
- Layer 3 は Layer 2 の state/action を利用するが、ChatPanel 自身の責務に限定する
- Layer 4 は Layer 1〜3 の全 PASS を前提として、回帰がないことを最終確認する

## 多角的チェック観点

### セキュリティ観点

- [ ] `validateIpcSender` による送信元ウィンドウ検証がテストされている
- [ ] P42準拠の3段バリデーション（型チェック -> 空文字列 -> trim空文字列）が網羅されている
- [ ] `sanitizeErrorMessage` による内部情報マスクが検証されている
- [ ] `options` パラメータの型検証（`typeof === "object" && !== null`）がテストされている

### IPC通信観点

- [ ] `IPC_CHANNELS.SKILL_CREATE` 定数経由のチャンネル名使用が確認されている
- [ ] ハンドラの引数形式（`description: unknown, options: unknown`）が正しくモック化されている
- [ ] `ipcMain.handle` の登録/解除ライフサイクルがテストに影響しない

### テスト設計観点

- [ ] テスト間で状態が共有されていない（`beforeEach` でリセット）（P9対策）
- [ ] happy-dom 環境で `fireEvent` を使用している（`userEvent` 未使用）（P39対策）
- [ ] 個別セレクタのみ使用し合成Hook未使用（P31対策）
- [ ] 派生セレクタに `useShallow` 適用済み（P48対策）
- [ ] タイマーテストで `advanceTimersByTime` 使用（P13対策）

## 成果物テーブル

| 成果物          | パス                                                                                       | 種別 | SubAgent |
| --------------- | ------------------------------------------------------------------------------------------ | ---- | -------- |
| IPC契約テスト   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | 新規 | G1       |
| 統合テスト      | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 新規 | G2       |
| ChatPanelテスト | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | 修正 | G2       |

## 完了条件

- [ ] Main IPC `skill:create` テスト要件が入力バリデーション・正常系・エラー系の3カテゴリで定義されている
- [ ] Store 駆動 lifecycle と ChatPanel 結線テスト要件が分離定義されている
- [ ] 既存テストとの整合条件と切り分け手順（Main -> Renderer -> 統合）が定義されている
- [ ] 最終品質ゲート（TypeCheck + 対象テスト + 回帰ゼロ + カバレッジ基準）が定義されている
- [ ] 全 FR/NFR に検証可能な受け入れ基準が紐付けられている
- [ ] P42/P31/P48/P39/P9/P13 の既知落とし穴への対策が明記されている
- [ ] SubAgent G1/G2/G3 の分担と実行順序（G1/G2並列 -> G3直列）が定義されている

## 次のPhase

Phase 2: 設計 - テストアーキテクチャ設計、モック戦略、テストファイル構成の詳細設計を行う。
