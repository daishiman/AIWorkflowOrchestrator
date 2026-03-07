# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 3                                        |
| 機能名 | TASK-10A-F Store駆動ライフサイクルUI統合 |
| 作成日 | 2026-03-07                               |
| 状態   | 未着手                                   |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、実装に進む前に設計の妥当性・整合性・セキュリティ・P31/P48 対策の十分性を検証する。

## 実行タスク

- 要件妥当性レビュー: FR/NFR の網羅性と受け入れ基準の検証可能性を確認する
- 設計妥当性レビュー: 案B（内部セレクタ方式）の妥当性と状態統合設計の整合性を確認する
- P31 対策レビュー: 個別セレクタ設計と合成 Hook 不使用を確認する
- P48 対策レビュー: useShallow 適用判定の妥当性を確認する
- IPC 契約整合性レビュー: store action が既存 Preload API を正しく呼び出す設計であることを確認する
- TASK-10A-G 連携レビュー: 回帰テスト基盤への引き渡し設計の十分性を確認する
- 既存コードとの互換性レビュー: 後方互換性が維持されることを確認する
- レビュー判定: PASS / MINOR / MAJOR の判定と後続アクションを決定する

## 参照資料

| 資料名                   | パス                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| Phase 1 要件定義         | `docs/30-workflows/store-driven-lifecycle-ui/phase-1-requirements.md` |
| Phase 2 設計             | `docs/30-workflows/store-driven-lifecycle-ui/phase-2-design.md`       |
| P31 対策ルール           | `.claude/rules/06-known-pitfalls.md#P31`                              |
| P48 対策ルール           | `.claude/rules/06-known-pitfalls.md#P48`                              |
| P42 バリデーションルール | `.claude/rules/06-known-pitfalls.md#P42`                              |
| 状態管理ルール           | `.claude/rules/03-state-management.md`                                |
| セキュリティルール       | `.claude/rules/04-electron-security.md`                               |
| アーキテクチャルール     | `.claude/rules/01-architecture.md`                                    |

## 実行手順

### Step 1: 要件の妥当性検証

以下のチェック項目を検証する:

- [ ] FR-1〜FR-6 の全機能要件が Phase 2 設計でカバーされている
- [ ] NFR-1〜NFR-5 の全非機能要件が Phase 2 設計でカバーされている
- [ ] AC-1〜AC-7 の全受け入れ基準がテスト可能な形式で定義されている
- [ ] スコープ定義（含む/含まない）が明確で、実装者による解釈の揺れがない

#### 検証マトリクス

| 要件                                            | Phase 2 設計箇所                                             | カバー状態 |
| ----------------------------------------------- | ------------------------------------------------------------ | ---------- |
| FR-1: SkillCreateWizard の直接IPC排除           | コンポーネント設計 §2 SkillCreateWizard リファクタリング設計 | 検証対象   |
| FR-2: useSkillAnalysis の分析呼び出し排除       | コンポーネント設計 §1 useSkillAnalysis リファクタリング設計  | 検証対象   |
| FR-3: useSkillAnalysis の改善適用呼び出し排除   | コンポーネント設計 §1 handleApplySelected 書き換え           | 検証対象   |
| FR-4: useSkillAnalysis の全自動改善呼び出し排除 | コンポーネント設計 §1 handleAutoImprove 書き換え             | 検証対象   |
| FR-5: テストファイルのモック対象変更            | テストモック戦略設計                                         | 検証対象   |
| FR-6: 直接IPC呼び出しゼロの検証                 | Phase 1 AC-5（grep コマンド）                                | 検証対象   |
| NFR-1: P31 対策                                 | P31/P48 対策設計 §P31 対策: 個別セレクタの使用               | 検証対象   |
| NFR-2: P48 対策                                 | P31/P48 対策設計 §P48 対策: useShallow 適用基準              | 検証対象   |
| NFR-3: 後方互換性                               | 設計方針 §判断根拠（後方互換性の完全維持）                   | 検証対象   |
| NFR-4: エラーハンドリング                       | コンポーネント設計 §設計上の注意点                           | 検証対象   |
| NFR-5: テスト品質                               | テストモック戦略設計 §テスト設計上の注意                     | 検証対象   |

### Step 2: 設計の妥当性検証

以下の観点でレビューする:

#### 2-1: 案B（内部セレクタ方式）の妥当性

- [ ] useSkillAnalysis 内部で個別セレクタ（`useAnalyzeSkill()` 等）を呼び出す設計が React Hooks のルール（トップレベル呼び出し）に準拠している
- [ ] 案A vs 案B の比較テーブルが5つの観点で評価されている
- [ ] 案B 採用の3つの根拠（変更範囲最小化、既存パターン統一、後方互換性完全維持）が明確である
- [ ] 案B で SkillImportDialog 等の既存パターンとの一貫性が示されている

#### 2-2: 状態統合設計

- [ ] store 状態（`currentAnalysis`, `isAnalyzing`, `isImproving`, `skillError`）とローカル状態（`selectedSuggestions`, `improvementResult`）の責務分離が明確である
- [ ] store 状態に移行する3つの状態（`analysis`, `isAnalyzing`, `isImproving`）の削除理由が記載されている
- [ ] ローカル状態を維持する2つの状態（`selectedSuggestions`, `improvementResult`）の維持理由が記載されている
- [ ] `improvementResult` が store action の void 戻り値により制限される影響が分析されている

#### 2-3: SkillCreateWizard 設計

- [ ] `useCreateSkill()` の戻り値（`Promise<string>`）の判定ロジック（truthy/falsy）が正しい
- [ ] `isGenerating` ローカルステートの維持理由（ウィザードステップ遷移制御）が記載されている
- [ ] `error` ローカルステートの維持理由（SkillCreateWizard 固有エラー表示）が記載されている
- [ ] store の `skillError` と SkillCreateWizard の `error` の二重エラー表示のリスクが評価されている

#### 2-4: 状態遷移設計

- [ ] useSkillAnalysis の状態遷移図が、初期化・分析・改善適用・全自動改善の全パスを網羅している
- [ ] SkillCreateWizard の状態遷移図が、生成成功・生成失敗の両パスを網羅している
- [ ] 競合する状態遷移（例: 分析中に改善を実行）の扱いが検討されている

### Step 3: P31 対策の妥当性検証

- [ ] useSkillAnalysis 内の7個の個別セレクタが全て `useAppStore((state) => state.xxx)` パターンである（store/index.ts の定義を確認）
- [ ] 合成 Hook（オブジェクトを返す形式）が作成されていない
- [ ] `useCallback` の依存配列に含めるアクション参照（`analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`）が Zustand の安定参照であることが確認されている
- [ ] `useCurrentAnalysis()` が `handleSelectAutoFixable` の依存配列に含まれており、分析結果変更時に再計算される
- [ ] SkillCreateWizard の `useCreateSkill()` が個別セレクタパターンである

### Step 4: P48 対策の妥当性検証

- [ ] useSkillAnalysis が返す全プロパティに対して P48 該当/非該当の判定テーブルが記載されている
- [ ] `.filter()` / `.map()` で新しい配列参照を返すセレクタが存在しないことが確認されている
- [ ] `selectedSuggestions`（`Set<number>` 型）が P48 非該当であることの根拠が明確である（Set は配列ではなく、`useShallow` の比較対象にならない）

### Step 5: IPC 契約整合性検証

- [ ] store action（agentSlice 側）が呼び出す Preload API が以下の4つであることを確認:
  - `window.electronAPI.skill.analyze(skillName)` → IPC `skill:analyze`
  - `window.electronAPI.skill.applyImprovements(skillName, suggestions)` → IPC `skill:improve`
  - `window.electronAPI.skill.autoImprove(skillName)` → IPC `skill:improve` (autoFix=true)
  - `window.electronAPI.skill.create({ description, options })` → IPC `skill:create`
- [ ] 本タスクで IPC ハンドラおよび Preload API の変更が不要であることが確認されている
- [ ] agentSlice の各アクション内で P42 準拠の3段バリデーションが既に実装されていることが確認されている

### Step 6: TASK-10A-G 連携設計の検証

- [ ] Phase 1 Step 6 で定義された4つのデータフロー検証項目が Phase 2 の統合テスト連携テーブルで網羅されている
- [ ] テストモック戦略が store action レベルでのモック化を前提としており、TASK-10A-G の回帰テストで再利用可能である
- [ ] store action 経由のデータフローが直接 IPC 呼び出しと同等の動作保証を提供する設計である

### Step 7: 既存コードとの互換性検証

- [ ] `UseSkillAnalysisReturn` インターフェースの全プロパティ型が変更されていない
- [ ] `SkillCreateWizardProps` インターフェースが変更されていない
- [ ] `SkillAnalysisView` の Props インターフェースが変更されていない
- [ ] SkillManagementPanel からの呼び出しコード（`<SkillAnalysisView skillName={...} onClose={...} />`、`<SkillCreateWizard onClose={...} />`）が変更不要である
- [ ] agentSlice の既存アクション・状態に影響がない（追加も削除もない）
- [ ] store/index.ts の既存セレクタに影響がない

### Step 8: レビュー判定

#### 判定基準

| 判定              | 条件                                                                   | 対応                                                                        |
| ----------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| PASS              | Step 1〜7 の全チェック項目が合格                                       | Phase 4 へ進む                                                              |
| MINOR             | 機能影響のない指摘がある（命名改善、ドキュメント追記等）               | 指摘対応後 Phase 4 へ。MINOR 指摘は全て未タスク仕様書に変換する（省略不可） |
| MAJOR（要件問題） | 要件の欠落・矛盾がある                                                 | Phase 1 へ戻る                                                              |
| MAJOR（設計問題） | 設計がアーキテクチャルールに違反している、またはセキュリティ問題がある | Phase 2 へ戻る                                                              |

#### MAJOR 判定となる指摘の具体例

- P31 対策として合成 Hook が使用されている（設計問題）
- `UseSkillAnalysisReturn` の戻り値型が変更されている（要件問題: 後方互換性違反）
- store action 内の P42 バリデーションが欠落している（設計問題）
- テストで `window.electronAPI` の直接モックが残っている（設計問題）

#### レビュー結果テンプレート

```markdown
## レビュー結果

### 判定: [PASS / MINOR / MAJOR]

### 合格項目

- Step 1: [結果]
- Step 2: [結果]
- Step 3: [結果]
- Step 4: [結果]
- Step 5: [結果]
- Step 6: [結果]
- Step 7: [結果]

### 指摘事項

| #   | 重要度      | カテゴリ                                    | 内容               | 対応方針   |
| --- | ----------- | ------------------------------------------- | ------------------ | ---------- |
| 1   | MINOR/MAJOR | 要件/設計/P31/P48/IPC契約/互換性/TASK-10A-G | [具体的な指摘内容] | [対応方針] |

### MINOR 指摘の未タスク化

| 指摘# | 未タスクID | 指示書パス |
| ----- | ---------- | ---------- |
```

## 統合テスト連携

- Phase 4 で作成するテストファイルに対して、Step 1〜7 の検証項目を 1:1 で対応付ける
- `outputs/phase-3/design-review-result.md` に、各指摘のテスト化対象（どのテストで再発防止するか）を明記する
- 判定が MAJOR の場合は、Phase 1/2 へ差し戻す理由と再テスト範囲をレビュー結果へ記録する

### レビュー観点とテスト対応表

| レビュー観点                    | 対応するテスト                                                          |
| ------------------------------- | ----------------------------------------------------------------------- |
| FR-1: SkillCreateWizard IPC排除 | `SkillCreateWizard.test.tsx`: createSkill 呼び出し検証                  |
| FR-2〜FR-4: useSkillAnalysis    | `SkillAnalysisView.test.tsx`: store action 呼び出し検証                 |
| FR-5: テストモック変更          | 全テストファイルで `window.electronAPI` モックが存在しないことの検証    |
| FR-6: 直接IPC呼び出しゼロ       | Phase 9 品質検証で `grep` コマンド実行                                  |
| NFR-1: P31 対策                 | テスト内で個別セレクタモックが正しく動作することの検証                  |
| NFR-3: 後方互換性               | TypeScript コンパイルエラーがないことの検証（Phase 9 `pnpm typecheck`） |

## 成果物

| 成果物           | パス                                      | 説明                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー判定結果と指摘事項 |

## 完了条件

- [ ] Step 1〜7 の全チェック項目が検証されている
- [ ] 検証マトリクス（FR-1〜FR-6, NFR-1〜NFR-5）の全行にカバー状態が記入されている
- [ ] P31 対策検証の全項目（5項目）が検証されている
- [ ] P48 対策検証の全項目（3項目）が検証されている
- [ ] IPC 契約整合性検証の全項目（3項目）が検証されている
- [ ] TASK-10A-G 連携設計検証の全項目（3項目）が検証されている
- [ ] 既存コードとの互換性検証の全項目（6項目）が検証されている
- [ ] レビュー判定（PASS / MINOR / MAJOR）が決定されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている
- [ ] レビュー結果テンプレートが完成した結果で埋められている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

- PASS / MINOR 対応後 → Phase 4: テスト作成 → `phase-4-test-creation.md`
- MAJOR（要件問題） → Phase 1: 要件定義 → `phase-1-requirements.md`
- MAJOR（設計問題） → Phase 2: 設計 → `phase-2-design.md`
