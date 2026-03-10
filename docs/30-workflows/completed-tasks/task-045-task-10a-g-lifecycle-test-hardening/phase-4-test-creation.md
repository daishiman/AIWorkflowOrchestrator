# Phase 4: テスト作成

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 4                                   |
| タスクID  | TASK-10A-G                          |
| 機能名    | task-10a-g-lifecycle-test-hardening |
| 作成日    | 2026-03-10                          |
| 前提Phase | Phase 3 PASS                        |
| 次Phase   | Phase 5                             |

## 目的

G1/G2/G3 のテスト仕様をコードへ落とし込み、既存実装に対する検証可能性を確保する。TASK-10A-G はテスト専用タスクのため、Phase 4 時点で必ずしも全件 Red である必要はなく、既実装コードにより Red/Green が混在し得る前提で進める。重要なのは、契約・状態遷移・責務境界を漏れなく固定したテストを作成すること。

## 実行タスク

- G1: Main IPC `skill:create` 契約テストを作成する
- G2: Store 駆動ライフサイクル統合テストを作成または拡張する
- G3: ChatPanel 結線テストと品質ゲート前提を補強する

### Task 1: G1 テスト作成

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`

**観点**: `skill:create` は `description: unknown, options: unknown` を受け取り、`validateIpcSender` を通過した後、`skillService.createSkillFromWizard(description.trim(), typedOptions)` に委譲する。失敗時は `VALIDATION_ERROR` / `CREATE_ERROR` / `toIPCValidationError` のいずれかで表現される。

#### テストケース一覧

| ID        | カテゴリ       | テスト名                                          | 検証内容                 |
| --------- | -------------- | ------------------------------------------------- | ------------------------ |
| G1-VAL-01 | バリデーション | `description` が非文字列なら拒否する              | 型チェック               |
| G1-VAL-02 | バリデーション | `description` が空文字列なら拒否する              | 空文字列チェック         |
| G1-VAL-03 | バリデーション | `description` が空白のみなら拒否する              | P42 `.trim()` チェック   |
| G1-VAL-04 | バリデーション | `options` が `null` なら拒否する                  | object/null チェック     |
| G1-VAL-05 | バリデーション | `options` が非オブジェクトなら拒否する            | object 型チェック        |
| G1-VAL-06 | セキュリティ   | sender 検証失敗時に `toIPCValidationError` を返す | `validateIpcSender` 連携 |
| G1-DEL-01 | 委譲           | 正常入力で `createSkillFromWizard` が呼ばれる     | 引数委譲                 |
| G1-DEL-02 | 委譲           | `description` が trim 済みで委譲される            | 値整形                   |
| G1-DEL-03 | 委譲           | service 戻り値を透過して返す                      | 正常レスポンス           |
| G1-ERR-01 | エラー         | service 例外時に `CREATE_ERROR` を返す            | catch 契約               |
| G1-ERR-02 | エラー         | service 例外メッセージがサニタイズされる          | `sanitizeErrorMessage`   |
| G1-ERR-03 | 境界           | service が `null` を返してもそのまま返す          | 戻り値境界               |

#### モック戦略

```typescript
vi.mock("../../services/skillService");
vi.mock("../../security/validateIpcSender");

beforeEach(() => {
  vi.clearAllMocks();
  mockSkillService = {
    createSkillFromWizard: vi.fn(),
  };
  mockValidateIpcSender.mockReturnValue({ valid: true });
});
```

### Task 2: G2 テスト作成

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`

**観点**: G2 は直 IPC 呼び出しの画面遷移テストではなく、Store action と関連 hook を中心に `createSkill -> fetchSkills -> analyzeSkill -> applySkillImprovements` の状態遷移を検証する。

#### テストケース一覧

| ID        | カテゴリ | テスト名                                                                   | 検証内容       |
| --------- | -------- | -------------------------------------------------------------------------- | -------------- |
| G2-CRT-01 | 作成     | `createSkill` 成功後に `fetchSkills` が呼ばれる                            | lifecycle 連鎖 |
| G2-CRT-02 | 作成     | `createSkill` 失敗時に `skillError` が設定される                           | 異常系         |
| G2-CRT-03 | 作成     | `createSkill` が description/options を preload API に渡す                 | 契約透過       |
| G2-ANL-01 | 分析     | `analyzeSkill` 実行中に `isAnalyzing` が true になる                       | 状態遷移       |
| G2-ANL-02 | 分析     | `analyzeSkill` 成功後に `currentAnalysis` が設定される                     | 成功系         |
| G2-ANL-03 | 分析     | `analyzeSkill` 開始時に既存 `currentAnalysis` がクリアされる               | 前状態消去     |
| G2-IMP-01 | 改善     | `applySkillImprovements` 実行中に `isImproving` が true になる             | 状態遷移       |
| G2-IMP-02 | 改善     | 改善成功後に `currentAnalysis` がクリアされる                              | 後処理         |
| G2-IMP-03 | 改善     | 改善失敗時に `skillError` が設定される                                     | 異常系         |
| G2-SEL-01 | selector | `useCreateSkill` が必要最小限の state/action を購読する                    | P31            |
| G2-SEL-02 | selector | `useAnalyzeSkill` / `useApplySkillImprovements` の selector が安定している | P48            |
| G2-SEL-03 | 分離     | `beforeEach` で Store 状態が初期化され、テスト間リークしない               | P9             |

#### UI 操作ルール

```typescript
// happy-dom 環境では fireEvent を使用する
fireEvent.click(screen.getByRole("button", { name: /作成/i }));
```

### Task 3: G3 テスト作成

**対象ファイル**: `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`

**観点**: G3 の責務は ChatPanel が SkillManagementPanel との結線境界を守ることの検証であり、`skill:create` の内部契約や Store action の詳細は G1/G2 に委譲する。

#### テストケース一覧

| ID        | カテゴリ | テスト名                                               | 検証内容     |
| --------- | -------- | ------------------------------------------------------ | ------------ |
| G3-UI-01  | toggle   | スキル管理ボタンで panel 表示を切り替える              | visibility   |
| G3-UI-02  | toggle   | panel 表示中は message list が隠れる                   | 排他表示     |
| G3-UI-03  | guard    | `isExecuting=true` の間は toggle が無効化される        | 実行中ガード |
| G3-UI-04  | wiring   | panel を開いた状態で SkillManagementPanel が描画される | 結線確認     |
| G3-ISO-01 | 分離     | テスト間で Store / mock が独立している                 | P9           |

## テスト実行コマンド

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

## 参照資料

| 参照資料                 | パス                                                                                        | 使用目的                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Phase 2 設計書           | `phase-2-design.md`                                                                         | G1/G2/G3 テスト観点確認                                     |
| UI実装記録               | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | `skill:create` の4層同期確認                                |
| UI機能別実装記録         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCreateWizard / SkillAnalysisView / TASK-10A-F 導線確認 |
| UIアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | ChatPanel / SkillManagementPanel 責務境界確認               |
| UI統合インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | ChatPanel 公開境界確認                                      |
| Skill インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill UI 契約確認                                           |
| 状態管理設計             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Store action / selector 観点確認                            |
| テストパターン           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | test isolation / happy-dom 観点確認                         |
| エラー仕様               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` / `CREATE_ERROR` 契約確認                |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender / `toIPCValidationError` 観点確認                    |
| 実装パターン集           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | handler map と indirect test 観点確認                       |
| 教訓                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | Phase 4-5 統合運用前提確認                                  |
| Phase 1 要件分析         | `outputs/phase-1/requirements-analysis.md`                                                  | 受け入れ基準と FR/NFR の追跡                                |
| Phase 3 設計レビュー結果 | `outputs/phase-3/design-review-result.md`                                                   | MINOR 指摘のテスト化反映                                    |

## 成果物

| 成果物         | パス                                                                                       | 説明                        |
| -------------- | ------------------------------------------------------------------------------------------ | --------------------------- |
| G1テストコード | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | Main IPC 契約テスト         |
| G2テストコード | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | Store 駆動 lifecycle テスト |
| G3テスト修正   | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | ChatPanel 結線テスト        |

## 既知の落とし穴チェックリスト

- [ ] P9: `beforeEach` / `afterEach` で mock と Store を初期化する
- [ ] P13: タイマーを使う場合のみ `advanceTimersByTime` を使う
- [ ] P31: 個別 selector / hook 単位で検証する
- [ ] P39: `fireEvent` を使う
- [ ] P40: `cd apps/desktop &&` で実行する
- [ ] P42: `description.trim()` の空文字拒否を含める
- [ ] P48: selector stability / `useShallow` 観点を含める

## 統合テスト連携

### SubAgent 間の依存関係

```text
G1: Main handler 契約固定
G2: Store action / hook / lifecycle 固定
G3: ChatPanel toggle / wiring 固定
```

### 多角的チェック観点

| 観点            | G1     | G2                    | G3                |
| --------------- | ------ | --------------------- | ----------------- |
| 入力契約        | G1-VAL | -                     | -                 |
| service 委譲    | G1-DEL | -                     | -                 |
| 異常系          | G1-ERR | G2-CRT-02 / G2-IMP-03 | -                 |
| 状態遷移        | -      | G2-ANL / G2-IMP       | G3-UI / G3-guard  |
| selector 安定性 | -      | G2-SEL                | -                 |
| 結線境界        | -      | 一部参照              | G3-UI / G3-wiring |

## 完了条件

- [ ] G1 テストが契約漏れなく実装されている
- [ ] G2 テストが Store 駆動 lifecycle をカバーしている
- [ ] G3 テストが ChatPanel の責務境界に留まっている
- [ ] テストケース ID がトレーサブルである
- [ ] P9/P31/P39/P40/P42/P48 の対策が反映されている

## 次Phase

Phase 5: 実装
