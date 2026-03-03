# Phase 10: 最終レビュー

## メタ情報

| 項目           | 値                                                                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスク ID      | TASK-10A-D                                                                                                                                                                                                                            |
| タスク名       | スキルライフサイクル UI 統合                                                                                                                                                                                                          |
| Phase          | 10                                                                                                                                                                                                                                    |
| 作成日         | 2026-03-03                                                                                                                                                                                                                            |
| 前 Phase       | Phase 9（品質検証）                                                                                                                                                                                                                   |
| 次 Phase       | Phase 11（手動テスト）                                                                                                                                                                                                                |
| 対象ファイル   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`, `apps/desktop/src/renderer/store/index.ts`, `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`, `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`  |
| テストファイル | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`, `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`, `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` |
| 状態           | 未着手                                                                                                                                                                                                                                |

## 目的

6 つの観点（要件充足・設計準拠・セキュリティ・アクセシビリティ・状態管理・コード品質）から多角的に品質と整合性を検証し、PASS / MINOR / MAJOR / CRITICAL の判定を下す。

---

## 実行タスク

- 要件充足レビュー: Phase 1 の受け入れ基準（FR-1〜FR-6）との一致を確認する
- 設計準拠レビュー: Phase 2 の設計決定事項との差分を検証する
- セキュリティレビュー: IPC 境界の P42/P44/P45 準拠を監査する
- アクセシビリティレビュー: WCAG 2.1 AA 準拠を確認する
- 状態管理レビュー: P31 対策（個別セレクタ）と Zustand 設計原則の遵守を確認する
- コード品質レビュー: lint/type/test/coverage の結果を再確認する
- 総合判定と後続アクション決定: PASS/MINOR/MAJOR/CRITICAL を決定する

---

## 参照資料

| 参照資料                | パス                                                                                        | 内容                     |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件定義        | `phase-1-requirements.md`                                                                   | 受け入れ基準の照合       |
| Phase 2 設計            | `phase-2-design.md`                                                                         | 設計準拠の確認           |
| Phase 5 実装            | `phase-5-implementation.md`                                                                 | 実装内容の確認           |
| Phase 9 品質検証        | `phase-9-quality-assurance.md`                                                              | 品質ゲート結果の照合     |
| UI コンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI 仕様                  |
| UI 機能仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能仕様の照合           |
| UI デザインシステム     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | HIG トークン整合の照合   |
| IPC API 契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC 契約の整合確認       |
| コード品質              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準                 |
| セキュリティ            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ         |
| スキル IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキル操作の防御観点     |
| 実装パターン            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集           |
| 開発ガイドライン        | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | コーディング規約         |
| 状態管理アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand 設計原則         |
| タスク運用台帳          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 未タスク登録先の正本確認 |
| レビューゲート基準      | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`              | レビュー判定基準         |

---

## 判定基準

| 判定     | 条件                                         | 対応                                                            |
| -------- | -------------------------------------------- | --------------------------------------------------------------- |
| PASS     | 6 観点の全チェック項目で問題なし             | Phase 11 へ進行                                                 |
| MINOR    | 機能影響のない軽微な問題が 1-3 件            | 全指摘を未タスク仕様書に変換後、Phase 11 へ進行（**省略不可**） |
| MAJOR    | 機能影響のある問題（設計レベルの修正が必要） | 問題の影響範囲に応じて Phase 2-5 へ戻る                         |
| CRITICAL | 要件未充足またはセキュリティ上の重大な問題   | Phase 1 へ戻り要件を再確認                                      |

---

## 実行手順

### 観点 1: 要件充足

Phase 1 で定義した機能要件（FR-1〜FR-6）が実装に反映されていることを確認する。

| #   | 機能要件 | 受入基準                                                                                                  | 確認方法                                                                                                                                                  | 結果 |
| --- | -------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | FR-1     | SkillManagementPanel の analysis ビューでプレースホルダーではなく SkillAnalysisView が表示される          | `grep -n "SkillAnalysisView" apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` で import と使用を確認する                              | ✓/✗  |
| 2   | FR-2     | SkillManagementPanel の create ビューでプレースホルダーではなく SkillCreateWizard が表示される            | `grep -n "SkillCreateWizard" apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` で import と使用を確認する                              | ✓/✗  |
| 3   | FR-3     | agentSlice に analyzeSkill アクションが存在し、IPC 経由でスキル分析を実行する                             | `grep -n "analyzeSkill" apps/desktop/src/renderer/store/slices/agentSlice.ts` でアクション定義を確認する                                                  | ✓/✗  |
| 4   | FR-4     | agentSlice に applyImprovements / autoImproveSkill アクションが存在し、改善提案の適用と自動改善を実行する | `grep -n "applyImprovements\|autoImproveSkill" apps/desktop/src/renderer/store/slices/agentSlice.ts` でアクション定義を確認する                           | ✓/✗  |
| 5   | FR-5     | agentSlice に createSkill アクションが存在し、IPC 経由でスキル新規作成を実行する                          | `grep -n "createSkill" apps/desktop/src/renderer/store/slices/agentSlice.ts` でアクション定義を確認する                                                   | ✓/✗  |
| 6   | FR-6     | ChatPanel からスキル管理パネル（SkillManagementPanel）にアクセスするボタンまたはトリガーが存在する        | `grep -n "SkillManagementPanel\|showSkillManagement\|skill.*management\|skill.*panel" apps/desktop/src/renderer/components/chat/ChatPanel.tsx` で確認する | ✓/✗  |

### 観点 2: 設計準拠

Phase 2 の設計に沿った実装であることを確認する。

| #   | 設計要件                                                                                                  | 確認方法                                                                                                                                                                  | 結果 |
| --- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | Atomic Design 階層: SkillManagementPanel は organisms 層に配置されている                                  | ファイルパスが `components/skill/` 配下にあり、atoms/molecules を組み合わせた構成であること                                                                               | ✓/✗  |
| 2   | 個別セレクタ使用（P31 対策）: Zustand Store からの状態取得に個別セレクタを使用している                    | `grep -n "useAnalyzeSkill\|useApplyImprovements\|useAutoImproveSkill\|useCreateSkill" apps/desktop/src/renderer/store/index.ts` で個別セレクタの export を確認する        | ✓/✗  |
| 3   | Apple HIG カラーパレット使用: CSS 変数またはデザイントークン経由で Apple HIG システムカラーを使用している | コンポーネント内で `#007AFF` 等のハードコード色値ではなく、CSS 変数（`var(--accent-primary)` 等）またはデザイントークンを使用していること                                 | ✓/✗  |
| 4   | ChatPanel 統合: スキル管理パネルへのアクセスが ChatPanel の既存 UI フローを破壊していない                 | ChatPanel.tsx のメッセージ送信・受信・ストリーミング表示のテストが全 PASS であること（Phase 9 Gate 4 結果を参照）                                                         | ✓/✗  |
| 5   | agentSlice 拡張が既存セレクタに影響していない                                                             | `grep -n "useImportedSkills\|useIsLoadingSkills\|useFetchSkills\|useRemoveSkill" apps/desktop/src/renderer/store/index.ts` で既存セレクタが引き続き export されていること | ✓/✗  |

### 観点 3: セキュリティ

IPC 通信の安全性と入力検証を監査する。

| #   | セキュリティ要件                                                                                                                                                | 確認方法                                                                                                                                                                                                                                | 結果 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | P42 準拠 3 段バリデーション: agentSlice の新規アクションで IPC に渡す引数が文字列型チェック → 空文字列チェック → trim 空文字列チェックの 3 段階で検証されている | `grep -B2 -A5 "trim()" apps/desktop/src/renderer/store/slices/agentSlice.ts` で 3 段バリデーションの有無を確認する（Renderer 側で検証する場合）。または Main Process 側ハンドラで検証されている場合は「Main 側で実装済み」と記録する    | ✓/✗  |
| 2   | P44/P45 対策: スキル操作で `skill.name` を使用している（`skill.id` ハッシュ値を使用していない）                                                                 | `grep -rn "skill\.id\b" apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx apps/desktop/src/renderer/store/slices/agentSlice.ts` で `skill.id` の使用がないことを確認する（`skill.id` はスキル一意識別には使用しない） | ✓/✗  |
| 3   | IPC チャンネル名が定数で参照されている（P27 対策）                                                                                                              | agentSlice.ts 内の IPC 呼び出しで `window.electronAPI.skill.xxx()` のメソッド呼び出し形式を使用していること。文字列リテラルでの直接 `ipcRenderer.invoke("channel-name")` 呼び出しがないこと                                             | ✓/✗  |
| 4   | ユーザー入力のサニタイズ: 検索クエリ、ウィザード入力が XSS を引き起こす文字列を含まない形で処理されている                                                       | `grep -n "dangerouslySetInnerHTML" apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx apps/desktop/src/renderer/components/chat/ChatPanel.tsx` で 0 件であること                                                       | ✓/✗  |

### 観点 4: アクセシビリティ（WCAG 2.1 AA）

| #   | アクセシビリティ要件                                                                                         | 確認方法                                                                                                                                                                           | 結果 |
| --- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | キーボード操作: 全てのインタラクティブ要素（ボタン、入力フィールド）に Tab キーでフォーカスが移動する        | `<div onClick>` のようなアクセシビリティ非対応パターンがないこと。`<button>` タグまたは `role="button"` が使用されていること                                                       | ✓/✗  |
| 2   | ARIA 属性: 検索入力フィールドとウィザードステップに `aria-label` または `<label>` が紐付いている             | `grep -n "aria-label\|htmlFor\|role=" apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` で確認する                                                              | ✓/✗  |
| 3   | コントラスト比 4.5:1 以上: Apple HIG システムカラーを使用している場合は自動的に基準を満たす                  | カスタムカラーを使用している箇所がある場合はコントラスト比を計算する。`grep -n "bg-\[#\|text-\[#\|border-\[#" SkillManagementPanel.tsx ChatPanel.tsx` でハードコード色値を検索する | ✓/✗  |
| 4   | 色だけで情報を伝えていない: 分析結果のスコア・リスクレベルがテキストまたはアイコンと色の併用で表現されている | analysis ビューの ScoreDisplay と RiskPanel でテキストラベルが色と併用されていること                                                                                               | ✓/✗  |

### 観点 5: 状態管理

Zustand 設計原則と P31 対策の遵守を確認する。

| #   | 状態管理要件                                                                                                                            | 確認方法                                                                                                                                                                                                                   | 結果 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | 個別セレクタが store/index.ts から export されている: analyzeSkill, applyImprovements, autoImproveSkill, createSkill に対応するセレクタ | `grep -n "export const use.*Skill\|export const use.*Improve" apps/desktop/src/renderer/store/index.ts` で個別セレクタの export を確認する                                                                                 | ✓/✗  |
| 2   | 合成 Hook（`useAgentStore()`）の戻り値関数を useEffect 依存配列に含めていない（P31 対策）                                               | `grep -B5 -A5 "useEffect" apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx apps/desktop/src/renderer/components/chat/ChatPanel.tsx` で useEffect の依存配列に合成 Hook の戻り値関数が含まれていないこと | ✓/✗  |
| 3   | 新規 state フィールドがドメイン単位で agentSlice 内に配置されている（isAnalyzing, analysisResult 等）                                   | agentSlice.ts 内の state 定義で、analysis/create 関連の state が既存のスキル関連 state とは分離されて定義されていること                                                                                                    | ✓/✗  |
| 4   | ローディング・エラー状態の管理: 新規アクションごとにローディングとエラー状態が独立して管理されている                                    | `grep -n "isAnalyzing\|isCreating\|analyzeError\|createError" apps/desktop/src/renderer/store/slices/agentSlice.ts` で独立した状態管理を確認する                                                                           | ✓/✗  |

### 観点 6: コード品質

| #   | 品質要件                                                        | 確認方法                                                                                                                                                                                                                      | 結果 |
| --- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | 全テスト PASS                                                   | Phase 9 の Gate 4 結果を参照する                                                                                                                                                                                              | ✓/✗  |
| 2   | カバレッジ基準達成: Line >= 80%, Branch >= 60%, Function >= 80% | Phase 9 の Gate 5 結果を参照する                                                                                                                                                                                              | ✓/✗  |
| 3   | ESLint エラー 0 件                                              | Phase 9 の Gate 1 結果を参照する                                                                                                                                                                                              | ✓/✗  |
| 4   | TypeScript 型エラー 0 件                                        | Phase 9 の Gate 2 結果を参照する                                                                                                                                                                                              | ✓/✗  |
| 5   | `any` 型不使用                                                  | `grep -rn ": any\|as any" apps/desktop/src/renderer/store/slices/agentSlice.ts apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx apps/desktop/src/renderer/components/chat/ChatPanel.tsx` で 0 件であること | ✓/✗  |
| 6   | テスト間状態共有なし（P9 対策）                                 | テストファイルの `beforeEach` で状態リセットが行われていること。モジュールスコープの変数がテスト間で共有されていないこと                                                                                                      | ✓/✗  |
| 7   | fireEvent 使用（P39 対策）                                      | テストファイルで `userEvent` ではなく `fireEvent` が使用されていること（happy-dom 環境）                                                                                                                                      | ✓/✗  |

### Step 7: 総合判定

6 観点の全チェック結果を集計し、以下のルールで判定する:

- **全項目 ✓**: PASS
- **✗ が 1-3 件かつ全て機能影響なし**: MINOR → 全指摘を未タスク仕様書に変換後 Phase 11 へ
- **✗ が機能影響あり**: MAJOR → 影響範囲に応じて Phase 2-5 へ戻る
- **要件未充足（FR-1〜FR-6 のいずれか）またはセキュリティ問題**: CRITICAL → Phase 1 へ戻る

### Step 8: MINOR 指摘の未タスク化（判定が MINOR の場合のみ）

MINOR 指摘が 1 件でもある場合、以下の 3 ステップを**全て**完了する（P3 対策: 3 ステップ不完全の防止）:

1. `docs/30-workflows/unassigned-task/` に指摘ごとの指示書を作成する
   - ファイル名: `task-10a-d-minor-{連番}-{内容の英語要約}.md`
   - 必須セクション: メタ情報、目的、実行タスク、完了条件
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

### Step 9: 最終レビューレポートの作成

`outputs/phase-10/final-review-result.md` に以下を記録する:

```markdown
# Phase 10 最終レビューレポート

## 総合判定: [PASS / MINOR / MAJOR / CRITICAL]

## 観点別結果サマリ

| #   | 観点             | チェック項目数 | ✓   | ✗   | 判定      |
| --- | ---------------- | -------------- | --- | --- | --------- |
| 1   | 要件充足         | 6              |     |     | PASS/FAIL |
| 2   | 設計準拠         | 5              |     |     | PASS/FAIL |
| 3   | セキュリティ     | 4              |     |     | PASS/FAIL |
| 4   | アクセシビリティ | 4              |     |     | PASS/FAIL |
| 5   | 状態管理         | 4              |     |     | PASS/FAIL |
| 6   | コード品質       | 7              |     |     | PASS/FAIL |

## 指摘事項一覧（✗ の項目）

| #                                    | 観点 | 項目 | 重大度 | 詳細 | 対応 |
| ------------------------------------ | ---- | ---- | ------ | ---- | ---- |
| （✗ がない場合は「指摘なし」と記載） |      |      |        |      |      |

## MINOR 未タスク化（該当する場合）

| #                                      | 指摘内容 | 指示書パス | task-workflow登録 | 関連仕様書リンク |
| -------------------------------------- | -------- | ---------- | ----------------- | ---------------- |
| （該当なしの場合は「該当なし」と記載） |          |            |                   |                  |

## 次の Phase

[Phase 11 / Phase X（差し戻しの場合）]
```

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、analyze/applyImprovements/autoImprove/create の入力・戻り値契約を一致させる
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する

## 成果物

| 成果物               | パス                                      | 説明                       |
| -------------------- | ----------------------------------------- | -------------------------- |
| 最終レビューレポート | `outputs/phase-10/final-review-result.md` | 6 観点の検証結果と総合判定 |

---

## 完了条件

- [ ] 観点 1（要件充足）の全 6 項目を確認した
- [ ] 観点 2（設計準拠）の全 5 項目を確認した
- [ ] 観点 3（セキュリティ）の全 4 項目を確認した
- [ ] 観点 4（アクセシビリティ）の全 4 項目を確認した
- [ ] 観点 5（状態管理）の全 4 項目を確認した
- [ ] 観点 6（コード品質）の全 7 項目を確認した
- [ ] 総合判定（PASS / MINOR / MAJOR / CRITICAL）を明記した
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換した（P3 対策: 3 ステップ完了）
- [ ] `outputs/phase-10/final-review-result.md` を作成した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 11: 手動テスト
