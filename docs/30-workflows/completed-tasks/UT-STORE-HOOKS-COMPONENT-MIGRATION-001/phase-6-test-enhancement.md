# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 6                                      |
| 機能名 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 作成日 | 2026-02-12                             |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。特に無限ループ防止パターンの堅牢性を検証する。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- 統合テスト追加: コンポーネント間連携テストの追加
- エッジケーステスト: 境界値・異常系のテスト追加
- リグレッションテスト: 既存機能の継続動作確認

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                   | 目標 |
| ---------------------- | ---- |
| Store セレクタ         | 100% |
| コンポーネント状態連携 | 100% |
| 無限ループ防止パターン | 100% |
| 異常系シナリオ         | 80%+ |

## 参照資料

| 資料名        | パス                                       | 説明               |
| ------------- | ------------------------------------------ | ------------------ |
| Phase 4成果物 | `outputs/phase-4/test-specification.md`    | テスト設計         |
| Phase 5成果物 | `apps/desktop/src/renderer/store/index.ts` | 個別セレクタ実装   |
| 既存テスト    | `apps/desktop/src/renderer/**/*.test.tsx`  | 既存テストファイル |

## 実行手順

### ステップ1: カバレッジ測定

```bash
# カバレッジ測定コマンド
pnpm --filter @repo/desktop test:coverage

# 対象ファイルのカバレッジ確認
# - apps/desktop/src/renderer/store/index.ts
# - apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx
# - apps/desktop/src/renderer/components/skill/SkillSelector.tsx
# - apps/desktop/src/renderer/views/SettingsView/index.tsx
```

### ステップ2: ギャップ分析

#### 2.1 未到達コードの特定

| ファイル                 | 想定される未到達領域                       |
| ------------------------ | ------------------------------------------ |
| `store/index.ts`         | 新規追加セレクタの使用箇所                 |
| `LLMSelectorPanel.tsx`   | エラー表示、リトライ、ヘルスチェック更新   |
| `SkillSelector.tsx`      | キーボードナビゲーション一部、エッジケース |
| `SettingsView/index.tsx` | 認証状態表示、エラーハンドリング           |

#### 2.2 追加テストリスト

**Store セレクタテスト拡充**

| テストID       | テスト内容                 | 優先度 |
| -------------- | -------------------------- | ------ |
| TC-SEL-EXT-001 | LLM個別セレクタ全網羅      | High   |
| TC-SEL-EXT-002 | Skill個別セレクタ全網羅    | High   |
| TC-SEL-EXT-003 | AuthMode個別セレクタ全網羅 | High   |
| TC-SEL-EXT-004 | 合成Hookとの互換性確認     | Medium |
| TC-SEL-EXT-005 | state更新時の参照安定性    | High   |

**LLMSelectorPanel テスト拡充**

| テストID       | テスト内容                             | 優先度 |
| -------------- | -------------------------------------- | ------ |
| TC-LLM-EXT-001 | マウント→アンマウント→再マウントの挙動 | High   |
| TC-LLM-EXT-002 | 複数回のprovider切り替え               | Medium |
| TC-LLM-EXT-003 | エラー状態からの回復                   | Medium |
| TC-LLM-EXT-004 | ローディング中の操作防止               | High   |
| TC-LLM-EXT-005 | 非表示状態（isVisible=false）の挙動    | Low    |

**SkillSelector テスト拡充**

| テストID      | テスト内容                            | 優先度 |
| ------------- | ------------------------------------- | ------ |
| TC-SK-EXT-001 | 連続した再スキャン要求の挙動          | Medium |
| TC-SK-EXT-002 | インポート済み/未インポートの混合状態 | Medium |
| TC-SK-EXT-003 | スキャン中のUI状態遷移                | High   |
| TC-SK-EXT-004 | 大量スキル（50+）でのパフォーマンス   | Low    |
| TC-SK-EXT-005 | 選択中スキルの削除時の挙動            | Medium |

**SettingsView テスト拡充**

| テストID      | テスト内容                       | 優先度 |
| ------------- | -------------------------------- | ------ |
| TC-SV-EXT-001 | 認証モード切り替えの連続実行     | High   |
| TC-SV-EXT-002 | 認証状態ステータスの表示切り替え | Medium |
| TC-SV-EXT-003 | ローディング中のUI無効化         | High   |
| TC-SV-EXT-004 | 他のセクションとの状態干渉なし   | Medium |

### ステップ3: 統合テスト追加

#### 3.1 Store→コンポーネント統合テスト

```typescript
// apps/desktop/src/renderer/__tests__/store-integration.test.tsx
describe("Store-Component Integration", () => {
  describe("LLM Integration", () => {
    it("TC-INT-001: Store更新がLLMSelectorPanelに即座に反映される", async () => {
      // Store のprovidersを更新
      // コンポーネントが再レンダリングされることを確認
    });

    it("TC-INT-002: 複数コンポーネントがStoreを共有できる", () => {
      // 2つのLLMSelectorPanelが同じstateを参照
    });
  });

  describe("Skill Integration", () => {
    it("TC-INT-003: Store更新がSkillSelectorに即座に反映される", async () => {
      // Store のimportedSkillsを更新
      // コンポーネントが再レンダリングされることを確認
    });
  });

  describe("AuthMode Integration", () => {
    it("TC-INT-004: Store更新がSettingsViewに即座に反映される", async () => {
      // Store のmodeを更新
      // コンポーネントが再レンダリングされることを確認
    });
  });
});
```

#### 3.2 無限ループ防止の堅牢性テスト

```typescript
// apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx
describe("Infinite Loop Prevention Robustness", () => {
  it("TC-LOOP-001: StrictModeでも無限ループしない", async () => {
    // React.StrictModeでラップしてレンダリング
    // useEffectが2回呼ばれても問題ないことを確認
  });

  it("TC-LOOP-002: 高頻度のstate更新でも無限ループしない", async () => {
    // 100回連続でstate更新
    // コンポーネントが安定していることを確認
  });

  it("TC-LOOP-003: 依存配列の正しさを検証", () => {
    // ESLint exhaustive-depsルールへの準拠確認
  });
});
```

### ステップ4: エッジケーステスト

#### 4.1 境界値テスト

| テストID    | 境界条件                       | 期待結果                   |
| ----------- | ------------------------------ | -------------------------- |
| TC-EDGE-001 | providers配列が空              | 適切なプレースホルダー表示 |
| TC-EDGE-002 | skills配列が空                 | 「なし」のみ表示           |
| TC-EDGE-003 | authModeがnull/undefined       | デフォルト値使用           |
| TC-EDGE-004 | 非常に長いスキル名（100文字+） | トランケート表示           |
| TC-EDGE-005 | 特殊文字を含むスキル名         | 正常にレンダリング         |

#### 4.2 異常系テスト

| テストID   | 異常条件               | 期待結果             |
| ---------- | ---------------------- | -------------------- |
| TC-ERR-001 | fetchProviders失敗     | エラーメッセージ表示 |
| TC-ERR-002 | checkHealth失敗        | 接続エラー表示       |
| TC-ERR-003 | rescanSkills失敗       | スキャンエラー表示   |
| TC-ERR-004 | initializeAuthMode失敗 | 初期化エラー表示     |

### ステップ5: 既存テスト更新

#### 5.1 Mock更新

既存テストのStore mockを個別セレクタ対応に更新:

```typescript
// Before
vi.mock("@/renderer/store", () => ({
  useLLMStore: vi.fn(),
}));

// After
vi.mock("@/renderer/store", () => ({
  useLLMProviders: vi.fn(),
  useLLMSelectedProviderId: vi.fn(),
  useLLMIsLoading: vi.fn(),
  useLLMError: vi.fn(),
  useLLMHealthStatus: vi.fn(),
  useLLMFetchProviders: vi.fn(),
  useLLMSelectProvider: vi.fn(),
  useLLMSelectModel: vi.fn(),
  useLLMCheckHealth: vi.fn(),
  // 後方互換のため合成Hookも残す
  useLLMStore: vi.fn(),
}));
```

#### 5.2 P31対策テストの更新

既存のP31対策テストを、useRefガードなしでも動作することを確認するよう更新:

```typescript
// 更新前: useRefガードがあることを前提としたテスト
// 更新後: 個別セレクタによる参照安定性を確認するテスト
describe("無限ループ防止（P31対策・移行後）", () => {
  it("useRefガードなしでもfetchProvidersが1回のみ呼ばれる", async () => {
    // 個別セレクタ使用時の動作確認
  });
});
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                     | 目標 |
| ------------------ | ---------------------------- | ---- |
| Storeセレクタ      | 個別セレクタの参照安定性     | 100% |
| コンポーネント連携 | Store→UI反映の即時性         | 100% |
| 無限ループ防止     | useRefガードなしでの安定動作 | 100% |
| エラーハンドリング | 各種エラー状態からの回復     | 80%+ |
| エッジケース       | 境界値・異常系               | 80%+ |

## 成果物

| 成果物             | パス                                                                    | 説明                |
| ------------------ | ----------------------------------------------------------------------- | ------------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                    | カバレッジ分析結果  |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                                   | 統合テスト実行結果  |
| セレクタテスト拡充 | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts`           | セレクタ全網羅      |
| 統合テスト         | `apps/desktop/src/renderer/__tests__/store-integration.test.tsx`        | Store-Component連携 |
| 無限ループテスト   | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` | 堅牢性テスト        |
| 既存テスト更新     | `apps/desktop/src/renderer/**/*.test.tsx`                               | Mock更新            |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] Store個別セレクタのテストカバレッジが100%
- [ ] 無限ループ防止の堅牢性テストが追加されている
- [ ] 統合テストの追加が完了している
- [ ] エッジケーステストが追加されている
- [ ] 既存テストのMockが更新されている
- [ ] P31対策テストが移行後の実装に対応している
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
