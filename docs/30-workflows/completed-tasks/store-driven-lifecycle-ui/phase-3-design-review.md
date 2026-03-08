# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 3                                                |
| 機能名 | TASK-10A-F スキルライフサイクルUIのStore駆動統合 |
| 作成日 | 2026-03-08                                       |
| 状態   | 未着手                                           |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、実装に進む前に設計の妥当性・整合性・セキュリティ・P31 対策を検証する。

## 実行タスク

- 要件妥当性レビュー: FR-1〜FR-6 / NFR-1〜NFR-5 の網羅性と AC-1〜AC-7 の検証可能性を確認する。
- 設計妥当性レビュー: Store 駆動統合設計の整合性と状態遷移表の網羅性を確認する。
- セキュリティレビュー: P42 バリデーション、Preload API 存在チェック、エラーサニタイズを確認する。
- P31 対策レビュー: 個別セレクタパターン準拠と合成 Hook 不使用を確認する。
- 互換性レビュー: 既存コンポーネント・テストへの影響がないことを確認する。
- 回帰観点レビュー: TASK-10A-G 回帰テストマトリクス（RT-01〜RT-07）の妥当性を確認する。
- レビュー判定: PASS / MINOR / MAJOR の判定と後続アクションを決定する。

## 参照資料

| 資料名                   | パス                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Phase 1 要件定義         | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-1-requirements.md`       |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`             |
| 状態管理仕様             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| Skill インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           |
| IPC API 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| エラー仕様               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| UI 設計原則              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |
| P31 対策ルール           | `.claude/rules/06-known-pitfalls.md#P31`                                                    |
| P42 バリデーションルール | `.claude/rules/06-known-pitfalls.md#P42`                                                    |
| P48 useShallow ルール    | `.claude/rules/06-known-pitfalls.md#P48`                                                    |
| 状態管理ルール           | `.claude/rules/03-state-management.md`                                                      |
| セキュリティルール       | `.claude/rules/04-electron-security.md`                                                     |
| アーキテクチャルール     | `.claude/rules/01-architecture.md`                                                          |

## 実行手順

### Step 1: 要件の妥当性検証

以下のチェック項目を検証する:

- [ ] FR-1〜FR-6 の全機能要件が Phase 2 設計でカバーされている
- [ ] NFR-1〜NFR-5 の全非機能要件が Phase 2 設計でカバーされている
- [ ] AC-1〜AC-7 の全受け入れ基準がテスト可能な形式で定義されている
- [ ] スコープ定義（含む/含まない）が明確で、実装者による解釈の揺れがない

#### 検証マトリクス

| 要件                                                | Phase 2 設計箇所                                                      | カバー状態 |
| --------------------------------------------------- | --------------------------------------------------------------------- | ---------- |
| FR-1: CreateWizard が store action 経由でスキル作成 | コンポーネント設計 §1 SkillCreateWizard の Store 駆動設計             | 検証対象   |
| FR-2: useSkillAnalysis が store action 経由で分析   | コンポーネント設計 §2 useSkillAnalysis の Store 駆動設計              | 検証対象   |
| FR-3: useSkillAnalysis が store action 経由で改善   | コンポーネント設計 §2 + 状態遷移表 applySkillImprovements/autoImprove | 検証対象   |
| FR-4: 処理中フラグが store 状態で一元管理           | 状態遷移表 全 action                                                  | 検証対象   |
| FR-5: エラー状態が store で一元管理                 | 状態遷移表 バリデーション失敗時 + 各 action 失敗時                    | 検証対象   |
| FR-6: ローカル UI 状態の独立性                      | P31 再発防止条件 ルール 4 ローカル/Store 状態境界                     | 検証対象   |
| NFR-1: P31 対策                                     | P31 再発防止条件 ルール 1〜3                                          | 検証対象   |
| NFR-2: P42 3段バリデーション                        | 状態遷移表 バリデーション失敗時                                       | 検証対象   |
| NFR-3: P48 useShallow 対策                          | P31 再発防止条件 ルール 3 useShallow 適用基準テーブル                 | 検証対象   |
| NFR-4: エラーハンドリング                           | 状態遷移表 各 action Preload API 失敗時                               | 検証対象   |
| NFR-5: パフォーマンス                               | 設計方針 §4 改善後自動再分析方式                                      | 検証対象   |

### Step 2: 設計の妥当性検証

以下の観点でレビューする:

#### 2-1: Store 駆動アーキテクチャ

- [ ] コンポーネント/フックから `window.electronAPI` への直接呼び出しが排除されている
- [ ] store action が Preload API 呼び出しの唯一の経路として設計されている
- [ ] レイヤー依存方向（Renderer → Store → Preload API）が一方向である

#### 2-2: 状態遷移の整合性

- [ ] 全 action（analyzeSkill, applySkillImprovements, autoImproveSkill, createSkill）の成功/失敗/再試行パスが定義されている
- [ ] バリデーション失敗時の状態遷移が定義されている
- [ ] 処理中フラグ（`isAnalyzing`, `isImproving`）がエラー時に確実にリセットされる設計になっている
- [ ] `applySkillImprovements` / `autoImproveSkill` 成功後に自動再分析が実行される設計になっている

#### 2-3: ローカル/Store 状態境界

- [ ] `currentAnalysis`, `isAnalyzing`, `isImproving`, `skillError` が Store に配置されている
- [ ] `selectedSuggestions`, `improvementResult` が useSkillAnalysis フック内のローカル `useState` で管理されている
- [ ] `description`, `options`, `isGenerating`, `error`, `skillPath` が SkillCreateWizard 内のローカル `useState` で管理されている
- [ ] 状態境界の配置理由が 03-state-management.md の原則に準拠している

#### 2-4: 既存実装との差分

- [ ] SkillCreateWizard が「変更なし」と判定されている根拠（既に `useCreateSkill` 経由）が実装コードと一致している
- [ ] useSkillAnalysis フックが「変更なし」と判定されている根拠（既に store action 経由）が実装コードと一致している
- [ ] SkillManagementPanel が「変更なし」と判定されている根拠が実装コードと一致している

### Step 3: セキュリティ観点検証

- [ ] agentSlice の各 action で `window.electronAPI?.skill` の存在チェックが設計に含まれている
- [ ] P42 準拠の 3段バリデーション（型チェック → 空文字列 → trim() 空文字列）が全文字列引数に適用されている
- [ ] エラーメッセージに内部情報（スタックトレース、ファイルパス）が含まれない設計になっている
- [ ] 本タスクで IPC ハンドラを変更しないため、既存の sender 検証が維持される

#### P42 バリデーション検証チェックリスト

| action                   | skillName             | description           | suggestions                             |
| ------------------------ | --------------------- | --------------------- | --------------------------------------- |
| `analyzeSkill`           | 3段バリデーション必須 | -                     | -                                       |
| `applySkillImprovements` | 3段バリデーション必須 | -                     | Array.isArray + length > 0 チェック必須 |
| `autoImproveSkill`       | 3段バリデーション必須 | -                     | -                                       |
| `createSkill`            | -                     | 3段バリデーション必須 | -                                       |

### Step 4: P31 対策の妥当性検証

- [ ] useSkillAnalysis フック内の全 store 状態/action が個別セレクタ（`useAppStore((state) => state.xxx)`）パターンで取得されている
- [ ] 合成 Hook（オブジェクトを返す形式）が使用されていない
- [ ] `useCallback` の依存配列に含まれる action 参照が Zustand の安定参照であることが確認されている
- [ ] `useEffect` の依存配列に含まれる `handleAnalyze` が `useCallback` でメモ化されており、`skillName` 変更時のみ再実行される設計になっている
- [ ] P48 useShallow 適用基準テーブルで全セレクタの戻り値型が確認されている

### Step 5: 既存コードとの整合性検証

- [ ] SkillCreateWizard の現在の実装が Phase 2 設計の「変更なし」判定と一致している（`useCreateSkill` import 確認）
- [ ] useSkillAnalysis フックの現在の実装が Phase 2 設計の「変更なし」判定と一致している（個別セレクタ import 確認）
- [ ] SkillManagementPanel の現在の実装が Phase 2 設計の「変更なし」判定と一致している
- [ ] 既存テスト（`SkillCreateWizard.test.tsx`, `SkillAnalysisView.test.tsx`）が本タスクの設計変更の影響を受けない
- [ ] agentSlice の既存 action（fetchSkills, removeSkill, importSkill, executeSkill）が影響を受けない

### Step 6: 回帰テスト観点の妥当性検証

- [ ] RT-01〜RT-07 の全項目が Phase 1 の FR/AC に対応付けられている
- [ ] 各 RT 項目の前提条件・操作・期待結果が 100人中100人が同じ理解で実行できる粒度で記述されている
- [ ] TASK-10A-G テストケースへの対応付け（IT-CREATE-SYNC 等）が妥当である
- [ ] store action 連携テストシナリオ（5パターン）が全呼出順序パターンを網羅している

### Step 7: レビュー判定

#### 判定基準

| 判定              | 条件                                                                   | 対応                                                                        |
| ----------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| PASS              | Step 1〜6 の全チェック項目が合格                                       | Phase 4 へ進む                                                              |
| MINOR             | 機能影響のない指摘がある（命名改善、ドキュメント追記等）               | 指摘対応後 Phase 4 へ。MINOR 指摘は全て未タスク仕様書に変換する（省略不可） |
| MAJOR（要件問題） | 要件の欠落・矛盾がある                                                 | Phase 1 へ戻る                                                              |
| MAJOR（設計問題） | 設計がアーキテクチャルールに違反している、またはセキュリティ問題がある | Phase 2 へ戻る                                                              |

#### レビュー結果テンプレート

```markdown
## レビュー結果

### 判定: [PASS / MINOR / MAJOR]

### 合格項目

- Step 1 要件妥当性: [結果]
- Step 2 設計妥当性: [結果]
- Step 3 セキュリティ: [結果]
- Step 4 P31 対策: [結果]
- Step 5 既存コード整合性: [結果]
- Step 6 回帰テスト観点: [結果]

### 指摘事項

| #   | 重要度      | カテゴリ                                     | 内容               | 対応方針   |
| --- | ----------- | -------------------------------------------- | ------------------ | ---------- |
| 1   | MINOR/MAJOR | 要件/設計/セキュリティ/P31/互換性/回帰テスト | [具体的な指摘内容] | [対応方針] |

### MINOR 指摘の未タスク化

| 指摘# | 未タスクID | 指示書パス |
| ----- | ---------- | ---------- |
```

## 統合テスト連携

- Phase 4 で作成するテストファイルに対して、Step 1〜6 の検証項目を 1:1 で対応付ける
- `outputs/phase-3/design-review-result.md` に、各指摘のテスト化対象（どのテストで再発防止するか）を明記する
- 判定が MAJOR の場合は、Phase 1/2 へ差し戻す理由と再テスト範囲をレビュー結果へ記録する

## 多角的チェック観点

### セキュリティ

- P42 バリデーション検証チェックリストの全行が検証されている
- `window.electronAPI?.skill` 存在チェックが全 action に設計されている
- エラーメッセージのサニタイズが設計されている

### UI/UX

- 処理中フラグ（`isAnalyzing`, `isImproving`）の表示がユーザーに分かりやすいか
- エラー発生時のユーザーフィードバックが適切か
- 改善後自動再分析がユーザー体験を損なわないか（ローディング表示の有無）

### アーキテクチャ

- レイヤー依存方向（Renderer → Store → Preload API）の一方向性
- Store Action 一元化によるテスタビリティ向上
- ローカル/Store 状態境界の妥当性

### エラーハンドリング

- 全 action の成功/失敗パスが状態遷移表で網羅されている
- エラー回復（再試行）パスが定義されている
- 処理中フラグのリセット漏れがない

## 成果物

| 成果物           | パス                                      | 説明                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー判定結果と指摘事項 |

## 完了条件

- [ ] Step 1〜6 の全チェック項目が検証されている
- [ ] 検証マトリクス（FR-1〜FR-6, NFR-1〜NFR-5）の全行にカバー状態が記入されている
- [ ] P42 バリデーション検証チェックリストの全行が検証されている
- [ ] P31 対策の妥当性が全セレクタについて検証されている
- [ ] 既存実装との「変更なし」判定が実装コードで確認されている
- [ ] RT-01〜RT-07 の回帰テスト観点が妥当性検証されている
- [ ] レビュー判定（PASS / MINOR / MAJOR）が決定されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている
- [ ] レビュー結果テンプレートが完成した結果で埋められている

## 次のPhase

- PASS / MINOR 対応後 → Phase 4: テスト作成 → `phase-4-test-creation.md`
- MAJOR（要件問題） → Phase 1: 要件定義 → `phase-1-requirements.md`
- MAJOR（設計問題） → Phase 2: 設計 → `phase-2-design.md`
