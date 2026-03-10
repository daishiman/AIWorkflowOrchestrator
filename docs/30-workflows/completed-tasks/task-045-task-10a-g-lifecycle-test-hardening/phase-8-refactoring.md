# Phase 8: リファクタリング - TASK-10A-G スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 8（リファクタリング）               |
| 機能名     | task-10a-g-lifecycle-test-hardening |
| タスクID   | TASK-10A-G                          |
| 作成日     | 2026-03-10                          |
| 前提Phase  | Phase 7: カバレッジ確認             |
| 依存タスク | TASK-10A-E, TASK-10A-F              |

## 目的

Phase 5-7 で作成・拡充したテストコードの品質を改善する。G1/G2/G3 間で重複するモックセットアップ・テストデータ生成を共通化し、テストの可読性・保守性・再利用性を向上させる。リファクタリング後も全テストが Green であることを保証する。

## 実行タスク

- Task 1: テストヘルパーを抽出して重複を削減する
- Task 2: テストデータファクトリを整理する
- Task 3: テスト構造を最適化する
- Task 4: 命名規則を統一する
- Task 5: マジックナンバーを除去する

### Task 1: テストヘルパー抽出

G1/G2/G3 で重複するモックセットアップをヘルパー関数に抽出する。

### Task 2: テストデータファクトリ作成

テスト入力データの生成を共通化するファクトリ関数を作成する。

### Task 3: テスト構造最適化

describe/it ブロックの階層構造を整理し、テストの論理的な分類を明確化する。

### Task 4: 命名規則統一

テストケース名を「条件 -> 期待結果」形式に統一する。

### Task 5: マジックナンバー除去

テストで使用する定数を named constants に置換する。

---

## リファクタリング対象パターン

### パターン一覧

| パターン               | 対象ファイル | 改善方針                                 | 優先度 |
| ---------------------- | ------------ | ---------------------------------------- | ------ |
| モックセットアップ重複 | G1/G2 共通   | `createMockSkillService()` ヘルパー      | 高     |
| テストデータ生成       | G1/G2        | `createTestSkillInput()` ファクトリ      | 高     |
| Store 初期化パターン   | G2/G3        | `setupTestStore()` ヘルパー              | 中     |
| アサーション共通化     | G1           | `expectValidationError()` ユーティリティ | 中     |
| マジックナンバー       | G1/G2/G3     | テスト定数オブジェクトへの置換           | 低     |

### パターン詳細

#### 1. createMockSkillService() ヘルパー

**対象**: G1（`skillHandlers.create.test.ts`）と G2（`SkillLifecycle.integration.test.tsx`）

```typescript
// 抽出候補: テスト共通ヘルパー
function createMockSkillService(overrides?: Partial<MockSkillService>) {
  return {
    createSkillFromWizard: vi.fn(),
    scanAvailableSkills: vi.fn(),
    getImportedSkills: vi.fn(),
    importSkills: vi.fn(),
    removeSkill: vi.fn(),
    getSkillById: vi.fn(),
    getSkillByName: vi.fn(),
    executeSkill: vi.fn(),
    setSkillExecutor: vi.fn(),
    getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
    ...overrides,
  };
}
```

**配置先候補**: 各テストファイル内のヘルパーセクション（テストファイル間の import は避ける）

#### 2. createTestSkillInput() ファクトリ

**対象**: G1/G2 のテストデータ生成

```typescript
// 抽出候補: テスト入力ファクトリ
const TEST_DEFAULTS = {
  DESCRIPTION: "テストスキル",
  OPTIONS: { generateTasks: true, targetAudience: "developer" },
} as const;

function createTestSkillInput(overrides?: {
  description?: unknown;
  options?: unknown;
}) {
  return {
    description: overrides?.description ?? TEST_DEFAULTS.DESCRIPTION,
    options: overrides?.options ?? TEST_DEFAULTS.OPTIONS,
  };
}
```

#### 3. setupTestStore() ヘルパー

**対象**: G2/G3 の Store 初期化

```typescript
// 抽出候補: Store 初期化ヘルパー（P9 準拠リセット込み）
function setupTestStore(overrides?: Partial<AppStoreState>) {
  const store = useAppStore.getState();
  // 全状態をリセット後にオーバーライド適用
  useAppStore.setState({
    ...initialState,
    ...overrides,
  });
  return store;
}
```

#### 4. expectValidationError() ユーティリティ

**対象**: G1 の入力バリデーションテスト

```typescript
// 抽出候補: バリデーションエラーアサーション
async function expectValidationError(
  handler: (...args: unknown[]) => Promise<unknown>,
  args: unknown[],
  expectedMessagePattern: RegExp,
) {
  await expect(handler(...args)).rejects.toMatchObject({
    code: "VALIDATION_ERROR",
    message: expect.stringMatching(expectedMessagePattern),
  });
}
```

---

## リファクタリング手順

### Step 1: テストヘルパー抽出（Task 1）

1. G1 テストファイル内で `mockSkillService` の構築パターンを `createMockSkillService()` に抽出する
2. G2 テストファイル内で同様のヘルパーを作成する（ファイル間 import は避ける）
3. `beforeEach` 内で `createMockSkillService()` を使用するようリファクタリングする
4. テスト実行: G1/G2 全 PASS を確認する

### Step 2: テストデータファクトリ作成（Task 2）

1. G1/G2 で使用するテスト入力データを `TEST_DEFAULTS` 定数と `createTestSkillInput()` に抽出する
2. 各テストケースで `createTestSkillInput({ description: "..." })` 形式に書き換える
3. テスト実行: G1/G2 全 PASS を確認する

### Step 3: テスト構造最適化（Task 3）

1. G1: `describe` ブロックを以下の階層に整理する
   - `skill:create` > `入力バリデーション` > 個別テスト
   - `skill:create` > `正常系委譲` > 個別テスト
   - `skill:create` > `エラー系` > 個別テスト
   - `skill:create` > `セキュリティ` > 個別テスト
2. G2: `describe` ブロックを以下の階層に整理する
   - `SkillLifecycle` > `create -> list` > 個別テスト
   - `SkillLifecycle` > `list -> analyze` > 個別テスト
   - `SkillLifecycle` > `analyze -> improve` > 個別テスト
   - `SkillLifecycle` > `Store駆動検証` > 個別テスト
3. G3: 既存構造を維持しつつ、追加テストの位置を整理する
4. テスト実行: 全テスト PASS を確認する

### Step 4: 命名規則統一（Task 4）

1. 全テストケース名を「{条件} の場合 {期待結果}」形式に統一する
2. 例: `"description が空文字列の場合 VALIDATION_ERROR を返す"`
3. テスト実行: 全テスト PASS を確認する

### Step 5: マジックナンバー除去（Task 5）

1. テスト内のハードコード値（エラーコード、タイムアウト値等）を named constants に置換する
2. 例: `"VALIDATION_ERROR"` -> `ERROR_CODES.VALIDATION_ERROR`
3. テスト実行: 全テスト PASS を確認する

### Step 6: 最終検証

1. 全テスト（G1/G2/G3）を実行し Green を確認する
2. 既存テストの回帰がないことを確認する
3. リファクタリング前後でテスト数が変わっていないことを確認する

---

## リファクタリング制約

### 禁止事項

- テストケースの追加・削除（テスト数は Phase 7 時点と同一を維持）
- テストの期待値・検証ロジックの変更
- テストファイル間の共有ヘルパーモジュール作成（各ファイル内で完結させる）
- プロダクションコードの変更

### 許容事項

- テストファイル内でのヘルパー関数・定数の抽出
- `describe`/`it` ブロックの階層再構成
- テストケース名の変更（検証ロジックは維持）
- `beforeEach`/`afterEach` 内のモック初期化コードの整理

---

## 既知の落とし穴への対策確認

| Pitfall | 確認項目                                                       | リファクタリング時の注意                          |
| ------- | -------------------------------------------------------------- | ------------------------------------------------- |
| P9      | ヘルパー抽出後も `beforeEach` でモックがリセットされること     | `createMockSkillService()` は毎回新規インスタンス |
| P13     | タイマー関連テストのリファクタリングで無限ループを発生させない | `advanceTimersByTime` の呼び出し順序を変更しない  |
| P31     | Store セレクタのリファクタリングで合成 Hook を導入しない       | 個別セレクタの使用を維持                          |
| P39     | Renderer テストのリファクタリングで `userEvent` を導入しない   | `fireEvent` の使用を維持                          |
| P40     | テスト実行コマンドを変更しない                                 | `cd apps/desktop` 前提を維持                      |
| P42     | バリデーションテストの期待値を変更しない                       | 3段バリデーションの検証を維持                     |
| P48     | 派生セレクタのリファクタリングで `useShallow` を外さない       | `useShallow` の適用を維持                         |

---

## 参照資料

| 参照資料                   | パス                                                                                        | 使用目的                 |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| テストパターン             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | リファクタリング指針     |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | コード品質基準           |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 共通パターン             |
| Phase 2 設計               | `phase-2-design.md`                                                                         | テストケースID体系確認   |
| Phase 1 要件分析           | `outputs/phase-1/requirements-analysis.md`                                                  | 受け入れ基準の維持確認   |
| Phase 5 Green レポート     | `outputs/phase-5/g1-g2-g3-green-report.md`                                                  | リファクタ前の成功基準   |
| Phase 6 カバレッジレポート | `outputs/phase-6/coverage-report.md`                                                        | 追加テスト観点の維持確認 |
| Phase 7 結果               | `outputs/phase-7/coverage-final-report.md`                                                  | テスト数の不変性確認     |

---

## 統合テスト連携

### リファクタリング影響範囲

- G1（Main IPC）: モックヘルパー抽出、テスト構造整理
- G2（Renderer 統合）: Store 初期化ヘルパー抽出、テスト構造整理
- G3（ChatPanel 整合）: テスト構造整理のみ（既存テストへの影響最小化）

### 品質ゲート（リファクタリング後の再検証）

| ゲートID | 検証項目           | コマンド                                                                                                         | 合格基準 |
| -------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- | -------- |
| RF-1     | G1 テスト全 PASS   | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | 全 PASS  |
| RF-2     | G2 テスト全 PASS   | `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 全 PASS  |
| RF-3     | G3 テスト全 PASS   | `cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | 全 PASS  |
| RF-4     | テスト数不変       | リファクタリング前後で `grep -c "it(" ファイル名` の結果が一致                                                   | 数値一致 |
| RF-5     | 既存テスト回帰ゼロ | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers`                                        | 全 PASS  |

---

## 多角的チェック観点

| 観点         | 確認内容                                                    |
| ------------ | ----------------------------------------------------------- |
| 可読性       | ヘルパー関数名が意図を明確に伝えている                      |
| 保守性       | テストデータ変更が1箇所（ファクトリ/定数）で完結する        |
| 一貫性       | G1/G2/G3 間で命名規則・構造が統一されている                 |
| 安全性       | リファクタリングでテストの検証範囲が縮小していない          |
| 既知落とし穴 | P9/P13/P31/P39/P40/P42/P48 の対策がリファクタリング後も維持 |

---

## 成果物

| 成果物                          | パス                                                                                       | 種別 |
| ------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| G1 テスト（リファクタリング済） | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | 修正 |
| G2 テスト（リファクタリング済） | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 修正 |
| G3 テスト（リファクタリング済） | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | 修正 |

---

## 完了条件

- [ ] テストヘルパー（`createMockSkillService()` 等）が各テストファイル内に抽出されている
- [ ] テストデータファクトリ（`createTestSkillInput()` 等）が作成されている
- [ ] describe/it 構造がカテゴリ（バリデーション/委譲/エラー等）ごとに整理されている
- [ ] テストケース名が「条件 -> 期待結果」形式に統一されている
- [ ] マジックナンバーが named constants に置換されている
- [ ] RF-1〜RF-5 の品質ゲートが全て PASS している
- [ ] リファクタリング前後でテスト数が変わっていない
- [ ] 既知の落とし穴（P9/P13/P31/P39/P40/P42/P48）の対策が維持されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

1. テストヘルパー抽出（Task 1）
2. テストデータファクトリ作成（Task 2）
3. テスト構造最適化（Task 3）
4. 命名規則統一（Task 4）
5. マジックナンバー除去（Task 5）
6. 最終検証（Step 6）
7. 完了条件確認

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次の Phase

Phase 9: 品質検証 - Lint・型チェック・全テスト実行により品質基準の充足を検証する。
