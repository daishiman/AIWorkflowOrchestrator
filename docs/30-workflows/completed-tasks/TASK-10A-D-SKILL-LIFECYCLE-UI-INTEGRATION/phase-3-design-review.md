# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 3                                     |
| 機能名 | TASK-10A-D スキルライフサイクルUI統合 |
| 作成日 | 2026-03-03                            |
| 状態   | 未着手                                |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、実装に進む前に設計の妥当性・整合性・セキュリティを検証する。

## 実行タスク

- 要件妥当性レビュー: FR/NFR の網羅性と受け入れ基準の検証可能性を確認する。
- 設計妥当性レビュー: コンポーネント構成と状態管理設計の整合性を確認する。
- セキュリティレビュー: IPC 境界、P42 バリデーション、sender 検証方針を確認する。
- P31 対策レビュー: 個別セレクタ設計と合成 Hook 不使用を確認する。
- 互換性レビュー: agentSlice 拡張が既存機能を破壊しないことを確認する。
- レビュー判定: PASS / MINOR / MAJOR の判定と後続アクションを決定する。

## 参照資料

| 資料名                   | パス                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義         | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-1-requirements.md` |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-2-design.md`       |
| P31 対策ルール           | `.claude/rules/06-known-pitfalls.md#P31`                                                              |
| P42 バリデーションルール | `.claude/rules/06-known-pitfalls.md#P42`                                                              |
| 状態管理ルール           | `.claude/rules/03-state-management.md`                                                                |
| セキュリティルール       | `.claude/rules/04-electron-security.md`                                                               |
| アーキテクチャルール     | `.claude/rules/01-architecture.md`                                                                    |

## 実行手順

### Step 1: 要件の妥当性検証

以下のチェック項目を検証する:

- [ ] FR-1〜FR-6 の全機能要件が Phase 2 設計でカバーされている
- [ ] NFR-1〜NFR-5 の全非機能要件が Phase 2 設計でカバーされている
- [ ] AC-1〜AC-7 の全受け入れ基準がテスト可能な形式で定義されている
- [ ] スコープ定義（含む/含まない）が明確で、実装者による解釈の揺れがない

#### 検証マトリクス

| 要件                                           | Phase 2 設計箇所                                | カバー状態 |
| ---------------------------------------------- | ----------------------------------------------- | ---------- |
| FR-1: analysis ビューで SkillAnalysisView 表示 | コンポーネント設計 §1 analysis ビューの差し替え | 検証対象   |
| FR-2: create ビューで SkillCreateWizard 表示   | コンポーネント設計 §1 create ビューの差し替え   | 検証対象   |
| FR-3: agentSlice に4アクション追加             | 状態管理設計 §アクション実装                    | 検証対象   |
| FR-4: 個別セレクタ7件公開                      | 個別セレクタ設計                                | 検証対象   |
| FR-5: ChatPanel にスキル管理アクセス追加       | コンポーネント設計 §2 ChatPanel 統合設計        | 検証対象   |
| FR-6: 全ビュー遷移が連携                       | 状態フロー図                                    | 検証対象   |
| NFR-1: P31 対策                                | 個別セレクタ設計（合成 Hook 不使用）            | 検証対象   |
| NFR-2: P42 3段バリデーション                   | 各アクション実装コード内                        | 検証対象   |
| NFR-3: エラーハンドリング                      | 各アクション実装コード内 try/catch              | 検証対象   |
| NFR-4: Apple HIG 準拠                          | ChatPanel トグルボタンの CSS                    | 検証対象   |
| NFR-5: アクセシビリティ                        | aria-label, aria-expanded, data-testid          | 検証対象   |

### Step 2: 設計の妥当性検証

以下の観点でレビューする:

#### 2-1: コンポーネント構成

- [ ] SkillManagementPanel の条件分岐が既存構造を維持している
- [ ] analysis ビューで `selectedSkill` の null チェックが追加されている
- [ ] SkillAnalysisView / SkillCreateWizard に渡す Props が各コンポーネントのインターフェースと一致している
- [ ] data-testid が既存テストとの後方互換性を維持している

#### 2-2: 状態管理設計

- [ ] `currentAnalysis`, `isAnalyzing`, `isImproving` の状態遷移が競合しない
- [ ] `showSkillManagement` が ChatPanel 固有のローカルステートとして責務に沿って配置されている（03-state-management.md 準拠）
- [ ] agentSlice の初期状態が既存状態と整合している（新規追加フィールドの初期値が安全な値である）

#### 2-3: 型設計

- [ ] `SkillAnalysis` 型と `Suggestion` 型のインポート元が `@repo/shared/types/skill-improver` であり、幽霊依存（P8）がない
- [ ] `createSkill` アクションの引数型がインライン定義であり、コンポーネント固有型（WizardOptions）への依存がない
- [ ] AgentSlice 統合インターフェース（`AgentSlice extends AgentState, AgentActions`）が拡張後も成立する

### Step 3: セキュリティ観点検証

- [ ] agentSlice の各アクションで Preload API 呼び出し前に `window.electronAPI?.skill` の存在チェックがある
- [ ] P42 準拠の3段バリデーション（型チェック → 空文字列 → trim() 空文字列）が全文字列引数に適用されている
- [ ] エラーメッセージに内部情報（スタックトレース、ファイルパス）が含まれない
- [ ] 本タスクで IPC ハンドラを変更しないため、既存の sender 検証が維持される

#### P42 バリデーション検証チェックリスト

| アクション               | skillName             | description           | suggestions                             |
| ------------------------ | --------------------- | --------------------- | --------------------------------------- |
| `analyzeSkill`           | 3段バリデーション必須 | -                     | -                                       |
| `applySkillImprovements` | 3段バリデーション必須 | -                     | Array.isArray + length > 0 チェック必須 |
| `autoImproveSkill`       | 3段バリデーション必須 | -                     | -                                       |
| `createSkill`            | -                     | 3段バリデーション必須 | -                                       |

### Step 4: P31 対策の妥当性検証

- [ ] 新規追加する7件の個別セレクタが全て `useAppStore((state) => state.xxx)` パターンである
- [ ] 合成 Hook（オブジェクトを返す形式）が作成されていない
- [ ] 既存の `useSkillAnalysis` フック内で Zustand Store を直接参照していないことが確認されている（`useSkillAnalysis` は `window.electronAPI.skill` を直接呼び出すため、P31 の影響を受けない）

### Step 5: 既存コードとの整合性検証

- [ ] agentSlice の既存アクション（fetchSkills, removeSkill, executeSkill 等）が新規追加によって影響を受けない
- [ ] `AgentState` の既存フィールド名と新規フィールド名が衝突しない（`isAnalyzing` と既存の `isLoading`, `isLoadingSkills` の区別が明確）
- [ ] store/index.ts の既存セレクタが変更されない
- [ ] SkillManagementPanel の既存テスト（editor ビュー、リストビュー、削除確認ダイアログ）が影響を受けない
- [ ] ChatPanel の既存テスト（SkillSelector 表示、SkillStreamingView 表示、PermissionDialog 表示）が影響を受けない

### Step 6: レビュー判定

#### 判定基準

| 判定              | 条件                                                                   | 対応                                                                        |
| ----------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| PASS              | Step 1〜5 の全チェック項目が合格                                       | Phase 4 へ進む                                                              |
| MINOR             | 機能影響のない指摘がある（命名改善、ドキュメント追記等）               | 指摘対応後 Phase 4 へ。MINOR 指摘は全て未タスク仕様書に変換する（省略不可） |
| MAJOR（要件問題） | 要件の欠落・矛盾がある                                                 | Phase 1 へ戻る                                                              |
| MAJOR（設計問題） | 設計がアーキテクチャルールに違反している、またはセキュリティ問題がある | Phase 2 へ戻る                                                              |

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

### 指摘事項

| #   | 重要度      | カテゴリ                          | 内容               | 対応方針   |
| --- | ----------- | --------------------------------- | ------------------ | ---------- |
| 1   | MINOR/MAJOR | 要件/設計/セキュリティ/P31/互換性 | [具体的な指摘内容] | [対応方針] |

### MINOR 指摘の未タスク化

| 指摘# | 未タスクID | 指示書パス |
| ----- | ---------- | ---------- |
```

## 統合テスト連携

- Phase 4 で作成する4つのテストファイルに対して、Step 1〜5 の検証項目を 1:1 で対応付ける。
- `outputs/phase-3/design-review-result.md` に、各指摘のテスト化対象（どのテストで再発防止するか）を明記する。
- 判定が MAJOR の場合は、Phase 1/2 へ差し戻す理由と再テスト範囲をレビュー結果へ記録する。

## 成果物

| 成果物           | パス                                      | 説明                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー判定結果と指摘事項 |

## 完了条件

- [ ] Step 1〜5 の全チェック項目が検証されている
- [ ] 検証マトリクス（FR-1〜FR-6, NFR-1〜NFR-5）の全行にカバー状態が記入されている
- [ ] P42 バリデーション検証チェックリストの全行が検証されている
- [ ] レビュー判定（PASS / MINOR / MAJOR）が決定されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている
- [ ] レビュー結果テンプレートが完成した結果で埋められている

## 次のPhase

- PASS / MINOR 対応後 → Phase 4: テスト作成 → `phase-4-test-creation.md`
- MAJOR（要件問題） → Phase 1: 要件定義 → `phase-1-requirements.md`
- MAJOR（設計問題） → Phase 2: 設計 → `phase-2-design.md`
