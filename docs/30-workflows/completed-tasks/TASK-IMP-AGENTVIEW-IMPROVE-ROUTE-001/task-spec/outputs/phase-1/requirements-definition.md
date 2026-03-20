# Phase 1: 要件定義書

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## 1. 現状分析

### 1.1 因果ループ断絶の根拠

**断絶3: AgentView -> SkillAnalysis**

- `skillLifecycleJourney.ts` は Agent の handoff を「改善が必要なら Skill Analysis へ戻す」と定義
- 現行 AgentView には `setCurrentView` / `setCurrentSkillName` の使用箇所がゼロ
- 実行完了後は `FloatingExecutionBar` が1500ms表示されるだけで、改善導線への CTA が存在しない
- `PostExecutionActionBar` は設計意図として仕様書に言及があるが未実装

**断絶4: SkillAnalysis -> Agent**

- 現行 SkillAnalysisView の Props は `skillName` と `onClose` のみ
- `onClose` は `setCurrentView("skillCenter"); setCurrentSkillName(null);` 固定
- Agent 起点で入った場合に戻る導線が存在しない
- 再実行導線も存在しない

### 1.2 既存実装状態（P50チェック結果）

| 対象                                  | 状態     | 判定     |
| ------------------------------------- | -------- | -------- |
| AgentView 改善 CTA                    | 未実装   | 新規実装 |
| SkillAnalysisView `onNavigateBack`    | 未実装   | 新規実装 |
| SkillAnalysisView `onNavigateToAgent` | 未実装   | 新規実装 |
| App.tsx Agent 起点判定                | 未実装   | 新規実装 |
| `selectedSkillName` 個別セレクタ      | 実装済み | 再利用   |
| `skillExecutionStatus` 個別セレクタ   | 実装済み | 再利用   |
| `isExecuting` 個別セレクタ            | 実装済み | 再利用   |
| `viewHistory` / `goBack()`            | 実装済み | 再利用   |
| `handleAnalyzeSkill` (SkillCenter)    | 実装済み | 回帰禁止 |

## 2. 機能要件

### FR-1: AgentView 改善 CTA バナー

- 実行完了スキルに対して改善提案への CTA を表示する
- 表示条件: `selectedSkillName.trim().length > 0 && skillExecutionStatus === "completed" && !isExecuting`
- CTA ラベル: 「スキルを分析・改善する」
- CTA クリック時: `setCurrentSkillName(trimmedSelectedSkillName)` -> `setCurrentView("skillAnalysis")` の順序で handoff

### FR-2: SkillAnalysisView Agent 起点戻り導線

- Agent 起点で SkillAnalysisView に入った場合のみ「戻る」リンクを表示
- クリック時: `goBack()` で AgentView に戻る
- 配置: ヘッダー左

### FR-3: SkillAnalysisView Agent 起点再実行導線

- Agent 起点で SkillAnalysisView に入った場合のみ「エージェントで再実行」ボタンを表示
- クリック時: `setCurrentView("agent")` で AgentView に戻る
- 配置: 既存フッターの右端（「選択を適用」「全自動改善」と競合しない位置）

### FR-4: App.tsx handoff 注入

- `skillAnalysis` case で `viewHistory` から前画面が `agent` かどうかを判定
- Agent 起点の場合のみ `onNavigateBack` / `onNavigateToAgent` を注入
- それ以外は `undefined` を渡し、既存 `onClose -> skillCenter` 契約を維持

## 3. 非機能要件

### NFR-1: 後方互換性

- 既存 `onClose -> skillCenter + setCurrentSkillName(null)` 契約を破壊しない
- SkillCenter / DetailPanel の既存呼び出し元では `onNavigateBack` / `onNavigateToAgent` は未注入

### NFR-2: 状態整合性

- AgentView -> SkillAnalysisView -> AgentView の往復で `currentSkillName` と `selectedSkillName` が不整合を起こさない
- `viewHistory` は正しく push/pop される

### NFR-3: Apple HIG 準拠

- 8px グリッドスペーシング
- 既存 CSS 変数トークン使用（ハードコード色禁止）
- 200-300ms の軽いアニメーション
- WCAG 2.1 AA（コントラスト比 4.5:1 以上）

### NFR-4: P31/P39/P42/P48 対策

- 個別セレクタのみ使用（合成 Hook 禁止）
- happy-dom 環境では `fireEvent` のみ（`userEvent` 禁止）
- 文字列引数は `.trim()` バリデーション必須
- non-null assertion 禁止

## 4. 受入基準（検証可能な条件）

| AC   | 条件                                                                                                   | 検証方法                                             |
| ---- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| AC-1 | `selectedSkillName` 非空 + `skillExecutionStatus === "completed"` + `!isExecuting` のときだけ CTA 表示 | ユニットテスト: 条件分岐の全パターン                 |
| AC-2 | CTA クリックで `setCurrentSkillName(trimmedName)` -> `setCurrentView("skillAnalysis")` 順序実行        | ユニットテスト: モック呼び出し順序検証               |
| AC-3 | Agent 起点のときだけ戻り導線表示、既存 `onClose` と両立                                                | ユニットテスト: `onNavigateBack` 有無での描画差分    |
| AC-4 | Agent 起点のときだけ再実行導線表示                                                                     | ユニットテスト: `onNavigateToAgent` 有無での描画差分 |
| AC-5 | 往復後の `currentSkillName` / `selectedSkillName` 整合                                                 | 統合テスト: 遷移後の state 検証                      |
| AC-6 | null/undefined/空文字/空白のみ/実行中/completed以外で CTA 非表示                                       | ユニットテスト: 境界値テスト                         |
| AC-7 | Apple HIG 準拠                                                                                         | 目視確認 + アクセシビリティテスト                    |

## 5. スコープ

### 対象ファイル

- `apps/desktop/src/renderer/views/AgentView/index.tsx` - CTA バナー追加
- `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` - Props 拡張
- `apps/desktop/src/renderer/App.tsx` - `skillAnalysis` case の prop 注入更新

### 除外範囲

- `agentSlice.ts` への新規 state 追加（既存 state で十分）
- `navigationSlice.ts` への新規 state 追加（`viewHistory` で判定可能）
- SkillCenter / DetailPanel の既存 analyze handoff の変更
- `skillLifecycleJourney.ts` の変更

### 依存タスクとの責務境界

- **Task01** (TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001): `skillAnalysis` ViewType / renderView 基盤 -> 完了済み、前提として利用
- **Task02** (TASK-IMP-SKILLCENTER-CREATE-ROUTE-001): SkillCenter 側の analyze handoff -> 重複しない（Agent 起点のみ）
- **Task03** (TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001): DetailPanel の analyze handoff -> 重複しない（Agent 起点のみ）
