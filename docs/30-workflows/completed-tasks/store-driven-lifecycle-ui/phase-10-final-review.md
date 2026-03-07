# Phase 10: 最終レビュー

## メタ情報

| 項目           | 値                                                                                                                                                                                                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスク ID      | TASK-10A-F                                                                                                                                                                                                                                                                                                            |
| タスク名       | スキルライフサイクル UI の Store 駆動統合                                                                                                                                                                                                                                                                             |
| 機能名         | store-driven-lifecycle-ui                                                                                                                                                                                                                                                                                             |
| Phase          | 10                                                                                                                                                                                                                                                                                                                    |
| 作成日         | 2026-03-07                                                                                                                                                                                                                                                                                                            |
| 前 Phase       | Phase 9（品質検証）                                                                                                                                                                                                                                                                                                   |
| 次 Phase       | Phase 11（手動テスト）                                                                                                                                                                                                                                                                                                |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`, `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`, `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`, `apps/desktop/src/renderer/store/slices/agentSlice.ts`, `apps/desktop/src/renderer/store/index.ts` |
| テストファイル | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`, `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`, `apps/desktop/src/renderer/components/skill/hooks/__tests__/useSkillAnalysis.test.ts`                                                                       |
| 状態           | 未着手                                                                                                                                                                                                                                                                                                                |

## 目的

7 つの観点（要件充足・直接 IPC 排除・セキュリティ・状態管理・TASK-10A-G 回帰基盤・コード品質・アクセシビリティ）から多角的に品質と整合性を検証し、PASS / MINOR / MAJOR / CRITICAL の判定を下す。

---

## 実行タスク

- 要件充足レビュー: Phase 1 の受け入れ基準との一致を確認する
- 直接 IPC 呼び出し完全排除レビュー: 4 箇所の直接呼び出しが全て Store アクション経由に置換されたことを確認する
- セキュリティレビュー: IPC 境界の P42/P44/P45 準拠を監査する
- 状態管理レビュー: P31/P48 対策の遵守を確認する
- TASK-10A-G 回帰テスト基盤引き渡しレビュー: 後続タスクで利用可能な回帰テスト資産を確認する
- コード品質レビュー: lint/type/test/coverage の結果を再確認する
- アクセシビリティレビュー: WCAG 2.1 AA 準拠を確認する
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
| PASS     | 7 観点の全チェック項目で問題なし             | Phase 11 へ進行                                                 |
| MINOR    | 機能影響のない軽微な問題が 1-3 件            | 全指摘を未タスク仕様書に変換後、Phase 11 へ進行（**省略不可**） |
| MAJOR    | 機能影響のある問題（設計レベルの修正が必要） | 問題の影響範囲に応じて Phase 2-5 へ戻る                         |
| CRITICAL | 要件未充足またはセキュリティ上の重大な問題   | Phase 1 へ戻り要件を再確認                                      |

---

## 実行手順

### 観点 1: 要件充足

Phase 1 で定義した機能要件が実装に反映されていることを確認する。

| #   | 受入基準                                                                                                   | 確認方法                                                                                                                                                           | 結果 |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | SkillCreateWizard.tsx 内に `window.electronAPI.skill.create` の直接呼び出しが存在しない                    | `grep -n "window.electronAPI" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` で 0 件                                                            | Y/N  |
| 2   | useSkillAnalysis.ts 内に `window.electronAPI.skill.analyze` の直接呼び出しが存在しない                     | `grep -n "window.electronAPI" apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で 0 件                                                        | Y/N  |
| 3   | useSkillAnalysis.ts 内に `window.electronAPI.skill.applyImprovements` の直接呼び出しが存在しない           | 上記 grep の結果に含まれていないこと                                                                                                                               | Y/N  |
| 4   | useSkillAnalysis.ts 内に `window.electronAPI.skill.autoImprove` の直接呼び出しが存在しない                 | 上記 grep の結果に含まれていないこと                                                                                                                               | Y/N  |
| 5   | agentSlice に analyzeSkill / applyImprovements / autoImproveSkill / createSkill アクションが定義されている | `grep -n "analyzeSkill\|applyImprovements\|autoImproveSkill\|createSkill" apps/desktop/src/renderer/store/slices/agentSlice.ts` で 4 アクションの定義を確認する    | Y/N  |
| 6   | 上記 4 アクションに対応する個別セレクタが store/index.ts から export されている                            | `grep -n "useAnalyzeSkill\|useApplyImprovements\|useAutoImproveSkill\|useCreateSkill" apps/desktop/src/renderer/store/index.ts` で個別セレクタの export を確認する | Y/N  |

### 観点 2: 直接 IPC 呼び出し完全排除

本タスクの核心要件を二重確認する。

| #   | 確認項目                                                                                                     | 確認方法                                                                                                                                                                             | 結果 |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | SkillCreateWizard.tsx:46 の `window.electronAPI.skill.create({...})` が Store アクション呼び出しに置換された | `grep -n "window.electronAPI" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` で 0 件                                                                              | Y/N  |
| 2   | useSkillAnalysis.ts:94 の `window.electronAPI.skill.analyze(skillName)` が置換された                         | `grep -n "window.electronAPI" apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で 0 件                                                                          | Y/N  |
| 3   | useSkillAnalysis.ts:140 の `window.electronAPI.skill.applyImprovements(...)` が置換された                    | 上記 grep の結果に含まれていないこと                                                                                                                                                 | Y/N  |
| 4   | useSkillAnalysis.ts:171 の `window.electronAPI.skill.autoImprove(skillName)` が置換された                    | 上記 grep の結果に含まれていないこと                                                                                                                                                 | Y/N  |
| 5   | Store アクション内で IPC 呼び出しが実行されている（Store が IPC の唯一の呼び出し元）                         | `grep -n "window.electronAPI.skill" apps/desktop/src/renderer/store/slices/agentSlice.ts` で analyze/applyImprovements/autoImprove/create のメソッド呼び出しが存在することを確認する | Y/N  |
| 6   | skill/ ディレクトリ配下で agentSlice 以外に直接 IPC 呼び出しが残存していない                                 | `grep -rn "window.electronAPI" apps/desktop/src/renderer/components/skill/` で agentSlice 経由以外の呼び出しが 0 件であること                                                        | Y/N  |

### 観点 3: セキュリティ

IPC 通信の安全性と入力検証を監査する。

| #   | セキュリティ要件                                                                                                                       | 確認方法                                                                                                                                                                                                                  | 結果 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | P42 準拠 3 段バリデーション: Store アクションで IPC に渡す skillName 引数が型チェック → 空文字列チェック → trim 空文字列チェックで検証 | `grep -B2 -A5 "trim()" apps/desktop/src/renderer/store/slices/agentSlice.ts` で 3 段バリデーションを確認する。Renderer 側で検証しない場合は Main Process 側ハンドラで検証されている旨を記録する                           | Y/N  |
| 2   | P44/P45 対策: スキル操作で `skillName` を使用している（`skillId` ハッシュ値を使用していない）                                          | `grep -rn "skillId\b" apps/desktop/src/renderer/store/slices/agentSlice.ts apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で 0 件 | Y/N  |
| 3   | IPC チャンネル呼び出しが `window.electronAPI.skill.xxx()` のメソッド呼び出し形式（文字列リテラルでの直接 invoke なし）                 | agentSlice.ts 内の IPC 呼び出しで `ipcRenderer.invoke("channel-name")` のような文字列リテラル直接呼び出しがないこと                                                                                                       | Y/N  |
| 4   | `dangerouslySetInnerHTML` 不使用                                                                                                       | `grep -rn "dangerouslySetInnerHTML" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で 0 件                                        | Y/N  |

### 観点 4: 状態管理（P31/P48 対策）

Zustand 設計原則と無限ループ対策の遵守を確認する。

| #   | 状態管理要件                                                                                | 確認方法                                                                                                                                                                                                                             | 結果 |
| --- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | 個別セレクタが store/index.ts から export されている（P31 対策）                            | `grep -n "export const use.*Skill\|export const use.*Improve" apps/desktop/src/renderer/store/index.ts` で analyzeSkill / applyImprovements / autoImproveSkill / createSkill に対応するセレクタの export を確認する                  | Y/N  |
| 2   | 合成 Hook（`useAgentStore()`）の戻り値関数を useEffect 依存配列に含めていない（P31 対策）   | `grep -B5 -A5 "useEffect" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で useEffect の依存配列に合成 Hook の戻り値関数が含まれていないこと | Y/N  |
| 3   | `.filter()` / `.map()` で配列を返す派生セレクタに `useShallow` が適用されている（P48 対策） | `grep -n "useShallow" apps/desktop/src/renderer/store/index.ts` で派生セレクタのラップを確認する                                                                                                                                     | Y/N  |
| 4   | ローディング・エラー状態が新規アクションごとに独立して管理されている                        | `grep -n "isAnalyzing\|isCreating\|analyzeError\|createError" apps/desktop/src/renderer/store/slices/agentSlice.ts` で独立した状態管理を確認する                                                                                     | Y/N  |

### 観点 5: TASK-10A-G 回帰テスト基盤の引き渡し

後続タスク TASK-10A-G（Store 駆動回帰テスト強化）で利用可能な回帰テスト資産の充足を確認する。

| #   | 引き渡し要件                                                                                               | 確認方法                                                                                                                                                                       | 結果 |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | agentSlice.test.ts に analyzeSkill / applyImprovements / autoImproveSkill / createSkill のテストが存在する | `grep -c "analyzeSkill\|applyImprovements\|autoImproveSkill\|createSkill" apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts` で 4 アクションのテスト存在確認 | Y/N  |
| 2   | SkillCreateWizard.test.tsx に Store アクション経由のスキル作成テストが存在する                             | `grep -c "createSkill" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` で 1 件以上                                                            | Y/N  |
| 3   | useSkillAnalysis.test.ts に Store アクション経由の分析・改善テストが存在する                               | `grep -c "analyzeSkill\|applyImprovements\|autoImproveSkill" apps/desktop/src/renderer/components/skill/hooks/__tests__/useSkillAnalysis.test.ts` で 1 件以上                  | Y/N  |
| 4   | テストが `window.electronAPI` のモックではなく Store のモックを使用している                                | テストファイル内で Store アクションが正しくモック/スパイされていること                                                                                                         | Y/N  |

### 観点 6: コード品質

| #   | 品質要件                                                        | 確認方法                                                                                                                 | 結果 |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | 全テスト PASS                                                   | Phase 9 の Gate 4 結果を参照する                                                                                         | Y/N  |
| 2   | カバレッジ基準達成: Line >= 80%, Branch >= 60%, Function >= 80% | Phase 9 の Gate 5 結果を参照する                                                                                         | Y/N  |
| 3   | ESLint エラー 0 件                                              | Phase 9 の Gate 1 結果を参照する                                                                                         | Y/N  |
| 4   | TypeScript 型エラー 0 件                                        | Phase 9 の Gate 2 結果を参照する                                                                                         | Y/N  |
| 5   | `any` 型不使用                                                  | Phase 9 の Gate 6 結果を参照する                                                                                         | Y/N  |
| 6   | テスト間状態共有なし（P9 対策）                                 | テストファイルの `beforeEach` で状態リセットが行われていること。モジュールスコープの変数がテスト間で共有されていないこと | Y/N  |
| 7   | fireEvent 使用（P39 対策）                                      | テストファイルで `userEvent` ではなく `fireEvent` が使用されていること（happy-dom 環境）                                 | Y/N  |

### 観点 7: アクセシビリティ（WCAG 2.1 AA）

| #   | アクセシビリティ要件                                                                                       | 確認方法                                                                                                                                                  | 結果 |
| --- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | キーボード操作: 全てのインタラクティブ要素（ボタン、入力フィールド）に Tab キーでフォーカスが移動する      | `<div onClick>` のようなアクセシビリティ非対応パターンがないこと。`<button>` タグまたは `role="button"` が使用されていること                              | Y/N  |
| 2   | ARIA 属性: ウィザードのステップ表示に適切な `aria-label` が付与されている                                  | `grep -n "aria-label\|aria-current\|role=" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` で確認する                                   | Y/N  |
| 3   | コントラスト比 4.5:1 以上: Apple HIG システムカラーを使用している場合は自動的に基準を満たす                | `grep -n "bg-\[#\|text-\[#\|border-\[#" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` でハードコード色値を検索する。0 件であれば PASS | Y/N  |
| 4   | 色だけで情報を伝えていない: 分析結果のスコア・ステータスがテキストまたはアイコンと色の併用で表現されている | SkillAnalysisView のスコア表示でテキストラベルが色と併用されていること                                                                                    | Y/N  |

### Step 8: 総合判定

7 観点の全チェック結果を集計し、以下のルールで判定する:

- **全項目 Y**: PASS
- **N が 1-3 件かつ全て機能影響なし**: MINOR → 全指摘を未タスク仕様書に変換後 Phase 11 へ
- **N が機能影響あり**: MAJOR → 影響範囲に応じて Phase 2-5 へ戻る
- **観点 1 または観点 2 で N（直接 IPC 排除の未達成）またはセキュリティ問題**: CRITICAL → Phase 1 へ戻る

### Step 9: MINOR 指摘の未タスク化（判定が MINOR の場合のみ）

MINOR 指摘が 1 件でもある場合、以下の 3 ステップを**全て**完了する（P3 対策: 3 ステップ不完全の防止）:

1. `docs/30-workflows/unassigned-task/` に指摘ごとの指示書を作成する
   - 命名規則: task-10a-f-minor-{連番}-{内容の英語要約}
   - 必須セクション: メタ情報、目的、実行タスク、完了条件
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

### Step 10: 最終レビューレポートの作成

`outputs/phase-10/final-review-result.md` に以下を記録する:

```markdown
# Phase 10 最終レビューレポート

## 総合判定: [PASS / MINOR / MAJOR / CRITICAL]

## 観点別結果サマリ

| #   | 観点                | チェック項目数 | Y   | N   | 判定      |
| --- | ------------------- | -------------- | --- | --- | --------- |
| 1   | 要件充足            | 6              |     |     | PASS/FAIL |
| 2   | 直接IPC排除         | 6              |     |     | PASS/FAIL |
| 3   | セキュリティ        | 4              |     |     | PASS/FAIL |
| 4   | 状態管理（P31/P48） | 4              |     |     | PASS/FAIL |
| 5   | TASK-10A-G回帰基盤  | 4              |     |     | PASS/FAIL |
| 6   | コード品質          | 7              |     |     | PASS/FAIL |
| 7   | アクセシビリティ    | 4              |     |     | PASS/FAIL |

## 指摘事項一覧（N の項目）

| #                                    | 観点 | 項目 | 重大度 | 詳細 | 対応 |
| ------------------------------------ | ---- | ---- | ------ | ---- | ---- |
| （N がない場合は「指摘なし」と記載） |      |      |        |      |      |

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
| 最終レビューレポート | `outputs/phase-10/final-review-result.md` | 7 観点の検証結果と総合判定 |

---

## 完了条件

- [ ] 観点 1（要件充足）の全 6 項目を確認した
- [ ] 観点 2（直接 IPC 排除）の全 6 項目を確認した
- [ ] 観点 3（セキュリティ）の全 4 項目を確認した
- [ ] 観点 4（状態管理 P31/P48）の全 4 項目を確認した
- [ ] 観点 5（TASK-10A-G 回帰基盤）の全 4 項目を確認した
- [ ] 観点 6（コード品質）の全 7 項目を確認した
- [ ] 観点 7（アクセシビリティ）の全 4 項目を確認した
- [ ] 総合判定（PASS / MINOR / MAJOR / CRITICAL）を明記した
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換した（P3 対策: 3 ステップ完了）
- [ ] `outputs/phase-10/final-review-result.md` を作成した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 11: 手動テスト
