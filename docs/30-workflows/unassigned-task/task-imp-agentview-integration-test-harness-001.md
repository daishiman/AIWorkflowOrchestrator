# AgentView 統合テストハーネス展開（S-INT-01 横展開） - タスク指示書

## メタ情報

```yaml
issue_number: 1075
```

## メタ情報

| 項目         | 内容                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| タスクID     | UT-08-SINT01-AGENTVIEW-INTEGRATION-HARNESS                                               |
| タスク名     | AgentView 統合テストハーネス展開（S-INT-01 横展開）                                      |
| 分類         | テストカバレッジ拡充                                                                     |
| 対象機能     | AgentView 統合テスト                                                                     |
| 優先度       | 中                                                                                       |
| 見積もり規模 | 大規模                                                                                   |
| ステータス   | 未実施                                                                                   |
| 発見元       | Phase 12 S-INT-01 横展開検討（08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001） |
| 発見日       | 2026-03-08                                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

08-TASK で SettingsView の統合テストハーネス（S-INT-01 パターン）を確立した。このパターンは「store mock + 外部 API mock を一本化し、子コンポーネントを real composition でレンダーする」もので、P50（過剰モックによるテスト空洞化）を防止する。

AgentView は SettingsView と同様に、複数の子コンポーネント（SkillSelectorPanel, LLMSelectorPanel, AgentExecutionView 等）と Zustand store の多数のセレクタに依存する View レベルのコンポーネントである。現在の AgentView テストが P50 パターンに陥っていないか検証し、必要であれば S-INT-01 パターンで統合テストハーネスを構築する。

### 1.2 問題点・課題

1. **P50 リスク**: AgentView のテストが過剰モックで子コンポーネント間の連携を検証していない可能性
2. **Store 依存の複雑性**: AgentView は LLMSlice, AgentSlice, SkillSlice の3スライスに依存し、セレクタ数が SettingsView 以上に多い
3. **IPC 依存**: AgentView は agent SDK 実行、スキルインポート等の IPC 通信に依存しており、mock 境界が複雑

### 1.3 放置した場合の影響

- AgentView のコンポーネント間連携バグ（スキル選択 → LLM 設定 → エージェント実行の連動）が検出されない
- SettingsView で確立したテストパターンの知見が活用されない
- 手動テストへの依存が続く

---

## 2. 何を達成するか（What）

### 2.1 目的

S-INT-01 パターンを AgentView に適用し、子コンポーネントを real composition でレンダーする統合テストハーネスを構築する。

### 2.2 最終ゴール

- `agent-test-harness.ts` が作成され、AgentView 統合テストの store + IPC mock を一元管理している
- `AgentView.integration.test.tsx` が作成され、主要シナリオ（スキル選択、LLM設定、エージェント実行）がテストされている
- 既存 AgentView テストとの責務分離が明確

### 2.3 スコープ

#### 含むもの

- `agent-test-harness.ts` の作成（S-INT-01 パターン準拠）
- `AgentView.integration.test.tsx` の作成（5-8 テストケース）
- 既存テストの P50 評価

#### 含まないもの

- 既存 AgentView テストの変更
- ChatView の統合テスト（別タスク）
- E2E テスト

### 2.4 成果物

- `apps/desktop/src/renderer/views/AgentView/__tests__/agent-test-harness.ts`
- `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.integration.test.tsx`

---

## 3. どのように実行するか（How）

### 3.1 実装手順

#### Step 1: AgentView の依存関係調査

```bash
grep -rn "useAppStore\|use[A-Z].*Store\|use[A-Z].*Slice" apps/desktop/src/renderer/views/AgentView/
grep -rn "electronAPI\|window\." apps/desktop/src/renderer/views/AgentView/
```

#### Step 2: 既存テストの P50 評価

```bash
grep -c "vi.mock" apps/desktop/src/renderer/views/AgentView/__tests__/*.test.tsx
```

コンポーネントモック数が3以上の場合、P50 に該当。

#### Step 3: agent-test-harness.ts 作成

settings-test-harness.ts を参考に:

- `createAgentHarness(options)` ファクトリ関数
- `MockAgentStoreState` 型定義（LLMSlice + AgentSlice + SkillSlice の全セレクタ）
- `createDefaultAgentStoreState(overrides)` デフォルト値生成
- `setupElectronApi()` IPC mock 注入

#### Step 4: AgentView.integration.test.tsx 作成

vi.mock hoisting + モジュールスコープ変数パターン（S29）を適用。

### 3.2 実装時の苦戦箇所と解決策（08-TASK 知見）

#### 苦戦箇所1: vi.mock hoisting + モジュールスコープ変数パターン

**問題**: vi.mock はファイル先頭に hoist されるため、beforeEach で設定した値をファクトリ内で参照できない。08-TASK で最も苦戦した課題。

**解決策**: モジュールスコープの `let` 変数を宣言し、vi.mock ファクトリ内でその変数を参照。beforeEach で再代入。詳細は S29（architecture-implementation-patterns.md）を参照。

#### 苦戦箇所2: M-01（全セレクタのデフォルト値網羅）

**問題**: AccountSection が17個のセレクタに依存しており、1つでもデフォルト値が欠けると TypeError。AgentView では LLMSlice + AgentSlice + SkillSlice の合計セレクタ数がさらに多い可能性。

**解決策**: `grep -rn "use[A-Z]" AgentView/` で全セレクタを列挙し、`createDefaultAgentStoreState()` に網羅的にデフォルト値を定義する。

#### 苦戦箇所3: P39（happy-dom での userEvent 非互換）

**問題**: `@testing-library/user-event` は happy-dom で Symbol 操作エラー。

**解決策**: `fireEvent` + `act()` パターンを使用。

#### 苦戦箇所4: P31（Zustand Store Hooks 無限ループ）

**問題**: 合成 Store Hook の戻り値を useEffect 依存配列に含めると無限ループ。

**解決策**: 個別セレクタ（`useLLMFetchProviders()` 等）を vi.mock でモック。harness 内でモジュールスコープ変数として管理。

---

## 4. 受け入れ基準

- [ ] `agent-test-harness.ts` が S-INT-01 パターンに準拠して作成されている
- [ ] `AgentView.integration.test.tsx` が5テスト以上 PASS する
- [ ] 既存 AgentView テストに変更がない
- [ ] LLMSlice + AgentSlice + SkillSlice の全セレクタにデフォルト値が設定されている

---

## 5. 参照資料

| 資料                            | パス                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| S-INT-01 パターン               | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           |
| S29 vi.mock hoisting            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| settings-test-harness（実装例） | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`           |
| P50 pitfall                     | `.claude/rules/06-known-pitfalls.md#P50`                                                    |
| P31, P39 pitfalls               | `.claude/rules/06-known-pitfalls.md`                                                        |

---

## 6. 関連タスク

| タスクID                                                 | 関係                   |
| -------------------------------------------------------- | ---------------------- |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | パターン確立元         |
| UT-08-004                                                | ハーネスパターン仕様化 |
