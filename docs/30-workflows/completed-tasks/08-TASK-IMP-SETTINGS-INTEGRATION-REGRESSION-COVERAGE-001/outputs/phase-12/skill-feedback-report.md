# Phase 12: スキル改善レポート

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 12                                                       |
| 作成日   | 2026-03-08                                               |

---

## 改善提案サマリ

| ID    | 対象                          | 分類         | 優先度 |
| ----- | ----------------------------- | ------------ | ------ |
| FB-01 | testing-component-patterns.md | パターン追加 | Medium |
| FB-02 | lessons-learned.md            | 教訓追加     | Medium |
| FB-03 | phase-templates.md            | テンプレ改善 | Low    |
| FB-04 | 06-known-pitfalls.md          | Pitfall 追加 | Low    |

---

## FB-01: testing-component-patterns.md への統合テストハーネスパターン追加

### 対象

`.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`

### 提案内容

本タスクで確立した「settings-test-harness パターン」を、再利用可能な実装パターンとして文書化する。

#### 追加すべきセクション: 統合テスト用ハーネスパターン

```markdown
### 統合テスト用ハーネスパターン（S-INT-HARNESS）

**適用場面**: 複数のコンポーネントを real composition で統合テストする際に、
store mock と外部 API mock を一本化する。

**構成要素**:

1. `createXxxHarness(options: HarnessOptions)` -- ハーネス生成関数
2. `MockStoreState` -- store 全セレクタのデフォルト値を型安全に定義
3. `HarnessOptions` -- テストケースごとのカスタマイズパラメータ
4. モジュールスコープ変数 -- vi.mock hoist 対策

**vi.mock hoist 対策のパターン**:

- vi.mock のファクトリ関数はファイル先頭に hoist されるため、
  beforeEach で再初期化する変数はモジュールスコープで宣言する
- ハーネスの createStoreMockFactory() はファクトリ関数の雛形を提供するが、
  テストファイル側では直接モジュールスコープ変数を参照する vi.mock を記述する
```

### 根拠

settings-test-harness.ts は本タスク固有のものだが、パターン自体は他の View 統合テスト（AgentView、ChatView 等）にも適用可能である。パターンを文書化することで、今後の統合テスト実装時の設計判断を効率化する。

---

## FB-02: lessons-learned.md への「過剰モックによる統合テスト空洞化」教訓追加

### 対象

`.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 提案内容

本タスクの動機となった「過剰モックによる統合テスト空洞化」を教訓として記録する。

#### 追加すべきエントリ

```markdown
### L-XX: 過剰モックによる統合テスト空洞化（08-TASK）

**発生状況**: SettingsView.test.tsx で AccountSection, ApiKeysSection,
AuthModeSelector の3コンポーネントを全て vi.mock() でモックしていた。
その結果、設定画面の主要セクションが全て偽物に置き換わり、
実際の画面構成で発生する不具合（auth-mode 切替の連動、
apiKey.list() の異常レスポンス処理）を検知できなかった。

**教訓**:

1. 統合テストでは、テスト対象の主要子コンポーネントをモックしない
2. モックは外部副作用境界（store, IPC, ネットワーク）に限定する
3. 「全コンポーネントをモックした統合テスト」は単体テストと実質同じ

**検知方法**: 統合テストファイル内の vi.mock 呼び出し数をレビュー時に確認する。
テスト対象の直接子コンポーネントを3つ以上モックしている場合は、
テスト設計を見直す。

**関連タスク**: 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001
```

### 根拠

task-03, task-04 の手動検証が SettingsView 実統合を通っていなかった背景として、既存テストが過剰モックで検知力を失っていたことが原因である。同様のパターンが他の View テストでも発生する可能性があるため、教訓として記録する。

---

## FB-03: phase-templates.md の Phase 12 テンプレートへのテスト専用ガイダンス追加

### 対象

`.claude/skills/task-specification-creator/references/phase-templates.md`

### 提案内容

Phase 12 テンプレートに「テストコードのみのタスクにおける Step 1-A ~ 1-D の該当/非該当判定ガイダンス」を追加する。

#### 追加すべき記載

```markdown
### テストコードのみのタスクにおける Step 判定

テストコードの追加・修正のみで、プロダクションコードの変更を伴わないタスクでは、
以下の Step が「該当なし」となる場合がある:

| Step     | 判定基準                                 |
| -------- | ---------------------------------------- |
| Step 1-A | LOGS.md 更新は PR マージ後に実施可       |
| Step 1-B | API/IPC 変更がなければ「該当なし」       |
| Step 1-C | テストパターン仕様への追加推奨を検討     |
| Step 1-D | 仕様書変更がなければ「不要」             |
| Step 2   | アーキテクチャ変更がなければ「該当なし」 |
| Step 3   | IPC 変更がなければ「該当なし」           |

「該当なし」と判定した場合でも、documentation-changelog.md にその旨を明記すること。
```

### 根拠

本タスクの Phase 12 実行時に、各 Step の該当/非該当判定に迷いが生じた。テストのみのタスクは一定頻度で発生するため、ガイダンスがあれば判定の効率が上がる。

---

## FB-04: 06-known-pitfalls.md への P50 追加検討

### 対象

`.claude/rules/06-known-pitfalls.md`

### 提案内容

「過剰モックによる統合テスト空洞化」を P50 として追加する。

#### 追加すべきエントリ

```markdown
### P50: 過剰モックによる統合テスト空洞化

- **教訓**: SettingsView のテストで AccountSection, ApiKeysSection,
  AuthModeSelector を全て vi.mock() でモックした結果、
  実画面構成で発生する不具合を検知できなかった。
  統合テストの主要子コンポーネントをモックすると、
  テストの検知力が単体テストと同等に低下する
- **症状**: テストは全 PASS だが、実画面で auth-mode 切替や
  apiKey.list() 異常レスポンスの不具合が発生する
- **解決策**: 統合テストでは外部副作用境界（store, IPC）のみモックし、
  テスト対象の子コンポーネントは real composition で使用する
- **検知方法**: 統合テストファイル内の vi.mock 呼び出し数が
  子コンポーネント数の半数を超える場合は設計見直し
- **関連タスク**: 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001
```

### 根拠

FB-02 の lessons-learned.md への記録と対になる形で、06-known-pitfalls.md にも登録することで、Claude Code ルールとしてのプロアクティブな防止が可能になる。

---

## 改善不要と判定した項目

| 項目                               | 不要判定の理由                                                 |
| ---------------------------------- | -------------------------------------------------------------- |
| arch-state-management.md の更新    | store アーキテクチャへの変更なし                               |
| security-electron-ipc.md の更新    | IPC ハンドラの変更なし                                         |
| ui-ux-settings.md の更新           | UI 実装の変更なし（テストコードのみ）                          |
| development-guidelines.md の更新   | テストヘルパーの配置規則に変更なし（既存ディレクトリ内に配置） |
| ipc-contract-checklist.md への追記 | IPC 契約の変更なし                                             |
