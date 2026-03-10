# UT-IMP-APP-TEST-MOCK-CENTRALIZATION-001 - App.tsx テスト共有モックファクトリ集約

## メタ情報

```yaml
issue_number: 1117
task_id: UT-IMP-APP-TEST-MOCK-CENTRALIZATION-001
task_name: App.tsx テスト共有モックファクトリ集約
category: 改善
target_feature: App.tsx テストの 30+ コンポーネントモック定義を共有ファクトリに集約
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12
created_date: 2026-03-09
dependencies:
  - TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001
```

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-IMP-APP-TEST-MOCK-CENTRALIZATION-001                             |
| タスク名     | App.tsx テスト共有モックファクトリ集約                              |
| 分類         | 改善                                                                |
| 対象機能     | App.tsx テストの 30+ コンポーネントモック定義を共有ファクトリに集約 |
| 優先度       | 中                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12                  |
| 発見日       | 2026-03-09                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

App.tsx は Electron デスクトップアプリのルートコンポーネントで、30以上のビュー/コンポーネントを import している。テスト時にはこれら全てを個別にモックする必要があるが、現在のモック定義は各テストファイルに重複して記述されている。

### 1.2 問題点・課題

- `App.debug-removal.test.tsx` で 160行以上のモックセットアップが必要（テストロジック本体は約80行）
- 30以上の `vi.mock()` 呼び出しが各テストファイルに重複
- App.tsx にルート/コンポーネントが追加されるたびに全テストファイルの修正が必要
- モック定義の不統一（コンポーネントによって `mockComponent` ヘルパー使用/直書きが混在）
- テストの意図（何をテストしたいか）がモック定義に埋もれて可読性が低い

### 1.3 放置した場合の影響

- App.tsx に新ルート追加時、テスト修正コストが O(N) で増加（N = テストファイル数）
- テスト作成の心理的ハードルが上昇し、App.tsx レベルのテストが書かれなくなる
- モック定義のドリフト（テストファイル間で微妙に異なるモック設定）が発生

---

## 2. 何を達成するか（What）

### 2.1 目的

App.tsx テストに必要な 30+ コンポーネントモックを共有ファクトリとして一元管理し、テスト作成コストと保守コストを削減する。

### 2.2 最終ゴール

1. 共有モックファクトリファイル（`__tests__/__mocks__/app-mocks.ts`）が作成される
2. 既存の App.tsx テストファイルが共有ファクトリを使用するようリファクタリングされる
3. テストファイルのモックセットアップが 160行 → 10行以下に削減される
4. 新ルート追加時のモック修正が1ファイルで完結する

### 2.3 スコープ

#### 含むもの

- 共有モックファクトリの設計と実装
- `mockComponent()` ヘルパーの標準化
- Store モック（`useAppStore`）のファクトリ化
- Router モック（`BrowserRouter`, `Routes`, `Route`）の共通化
- 既存テストファイルのリファクタリング

#### 含まないもの

- App.tsx 本体のリファクタリング
- 他コンポーネントのテストモック集約（App.tsx スコープのみ）
- E2E テストの変更

### 2.4 成果物

- `apps/desktop/src/renderer/__tests__/__mocks__/app-mocks.ts`（共有モックファクトリ）
- リファクタリング済み `App.debug-removal.test.tsx`
- テストガイドラインへのパターン追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- App.tsx の現在のインポート構造を把握していること
- Vitest の `vi.mock()` のモジュールスコープ制約を理解していること

### 3.2 依存タスク

- TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001

### 3.3 必要な知識

- Vitest のモックパターン（`vi.mock()` のホイスティング動作）
- React コンポーネントのテストモック設計
- Zustand Store のテストモックパターン（P31 / P48 対策）

### 3.4 推奨アプローチ

1. App.tsx の import 一覧を抽出し、モックカテゴリを分類する
2. カテゴリ別にファクトリ関数を設計する（Views / Organisms / Molecules / Pages / Store / Router）
3. `vi.mock()` のホイスティング制約に注意してファクトリ構造を決定する
4. 既存テストを移行して動作確認する

---

## 4. 実行手順

### Phase構成

- Phase A: モック分析と設計
- Phase B: 共有ファクトリ実装
- Phase C: 既存テスト移行と検証

### Phase A: モック分析と設計

#### 手順

1. `rg -n "vi.mock" apps/desktop/src/renderer/__tests__/App*.test.tsx` でモック定義を抽出
2. モックをカテゴリ分類（View / Organism / Molecule / Page / Store / Router / Hook）
3. ファクトリ関数のインターフェースを設計

#### 完了条件

- カテゴリ分類と設計ドキュメントが作成されている

### Phase B: 共有ファクトリ実装

#### 手順

1. `__tests__/__mocks__/app-mocks.ts` を作成
2. `setupAppMocks()` / `createMockStore()` / `createMockRouter()` を実装
3. 単体テストで動作確認

#### 完了条件

- ファクトリが独立して動作する

### Phase C: 既存テスト移行

#### 手順

1. `App.debug-removal.test.tsx` を共有ファクトリに移行
2. 他の App.tsx テストファイルがあれば同様に移行
3. 全テスト PASS を確認

#### 完了条件

- 全テストが共有ファクトリを使用し PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 共有モックファクトリが作成されている
- [ ] App.tsx テストのモックセットアップが 10行以下に削減されている
- [ ] `vi.mock()` のホイスティング制約を考慮した設計になっている

### 品質要件

- [ ] 既存テストが全て PASS
- [ ] 新ルート追加時のモック修正が1ファイルで完結する
- [ ] Line Coverage 80%以上維持

### ドキュメント要件

- [ ] テストガイドラインにパターンが記録されている
- [ ] lessons-learned.md に教訓が反映されている

---

## 6. 検証方法

### テストケース

- Case 1: 共有ファクトリ使用テストで `App.debug-removal.test.tsx` の全 TC が PASS
- Case 2: 新しいルートを App.tsx に追加したとき、ファクトリ1ファイルの修正で全テスト PASS
- Case 3: モックセットアップ行数が 160行 → 10行以下

### 検証手順

```bash
# テスト実行
cd apps/desktop && pnpm exec vitest run src/renderer/__tests__/App.debug-removal.test.tsx

# モック行数確認
wc -l apps/desktop/src/renderer/__tests__/__mocks__/app-mocks.ts

# 未タスク監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --target-file docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/unassigned-task/task-imp-app-test-mock-centralization-001.md
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                                                                     |
| ------------------------------------------------ | ------ | -------- | -------------------------------------------------------------------------------------------------------- |
| vi.mock() ホイスティングでファクトリが動作しない | 高     | 中       | `vi.mock()` はモジュールスコープでホイストされるため、ファクトリ関数ではなく再エクスポートパターンを使用 |
| モックの過度な抽象化で可読性低下                 | 中     | 中       | カテゴリ別に独立したファクトリ関数にし、必要なカテゴリのみ import する                                   |
| Store モックの状態カスタマイズが困難に           | 中     | 中       | `createMockStore(overrides)` パターンで部分カスタマイズを可能にする                                      |

---

## 8. 参照情報

- `apps/desktop/src/renderer/__tests__/App.debug-removal.test.tsx`（160行超モック定義の実例）
- `apps/desktop/src/renderer/App.tsx`（30+ import のルートコンポーネント）
- `.claude/rules/06-known-pitfalls.md#P9`（テスト間状態リセット）
- `.claude/rules/06-known-pitfalls.md#P31`（Store Hooks 無限ループ）
- `.claude/rules/06-known-pitfalls.md#P39`（happy-dom で fireEvent 使用）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

---

## 9. 備考

### 実装時の苦戦箇所と5分解決カード

#### 苦戦1: vi.mock() のホイスティング制約

| 項目         | 内容                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| 症状         | ファクトリ関数内で `vi.mock()` を呼び出すと、テストファイルの最上部にホイストされず、モックが適用されない         |
| 原因         | Vitest は `vi.mock()` をコンパイル時にファイル最上部へホイストする。関数内の呼び出しはホイスト対象外              |
| 解決策       | ファクトリファイルで `vi.mock()` を直接呼び出し、テストファイルでは `import './app-mocks'` で副作用インポートする |
| 検出コマンド | `rg -n "vi.mock" apps/desktop/src/renderer/__tests__/`                                                            |
| 再発防止     | テストガイドラインに「共有モック = 副作用インポート、vi.mock() は関数内不可」を追記                               |

#### 苦戦2: Store モックの状態カスタマイズ

| 項目         | 内容                                                                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | テストごとに異なる Store 状態（`isAuthenticated: true/false`、`currentView` の値）が必要だが、共有モックだと固定値になる                                                          |
| 原因         | `vi.mock()` のモック定義はファイルスコープで1回だけ評価されるため、テストごとのカスタマイズが困難                                                                                 |
| 解決策       | `vi.fn()` でセレクタ関数をモックし、`beforeEach` 内で `mockReturnValue` を切り替える。または `useAppStore.mockImplementation((selector) => selector(customState))` パターンを使用 |
| 検出コマンド | `rg -n "useAppStore\|mockState" apps/desktop/src/renderer/__tests__/`                                                                                                             |
| 再発防止     | 共有モックに `setMockStoreState(partial)` ヘルパーを含める                                                                                                                        |

### 補足事項

- この未タスクは App.tsx 固有のモック集約に限定。プロジェクト全体のモック戦略刷新は別タスク。
- P9（テスト間状態リセット）対策として `beforeEach` での `vi.clearAllMocks()` をファクトリに組み込むことを検討。
