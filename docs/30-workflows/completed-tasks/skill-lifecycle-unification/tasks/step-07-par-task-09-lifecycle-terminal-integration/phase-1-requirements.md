# Phase 1 要件定義 - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001 |
| Phase      | 1 - 要件定義                                |
| ステータス | 未着手                                      |
| 前提 Phase | なし（本タスクの起点）                      |
| 成果物     | `outputs/phase-1/requirements-analysis.md`  |
| 次 Phase   | Phase 2 設計                                |

## 目的

`ui-ux-realization.md` が規定する terminal handoff 5契約を受入基準として整理し、SkillLifecyclePanel への Terminal 統合に必要な機能要件・非機能要件を確定する。

## 実行タスク

### Task 1-1: terminal handoff 5契約の受入基準整理

`ui-ux-realization.md` の `terminal handoff の扱い` テーブル（L44-50）から、以下の5契約を抽出し、それぞれの受入基準を具体的なチェックリスト形式に変換する。

| 契約番号 | 場面                               | UI ルール                                                         |
| -------- | ---------------------------------- | ----------------------------------------------------------------- |
| TH-01    | create を terminal へ渡す          | prompt bundle、context summary、open terminal を 1 card に置く    |
| TH-02    | execute を terminal へ渡す         | この画面では自動実行しないことを明記する                          |
| TH-03    | improve を terminal へ渡す         | 前回結果と改善観点を要約して渡す                                  |
| TH-04    | どの画面でも terminal を開く       | header か panel action に固定 `Terminal` ボタンを置く             |
| TH-05    | terminal transcript を chat へ戻す | supporting chat へは明示操作でのみ戻し、autopilot bridge にしない |

各契約に対して以下を記録すること:

- 受入基準（ユーザーが観察できる動作の記述、曖昧表現を禁止）
- 現状の実装ステータス（接続済み / 未接続 / 部分接続）
- GAP 番号との対応関係

### Task 1-2: TerminalHandoffCard コンポーネントのインターフェース調査

`apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` を読み取り、以下を記録する。

- Props インターフェース（`TerminalHandoffCardProps` の全フィールドと型）
- `guidance` オブジェクトの必須フィールド: `terminalCommand: string`、`contextSummary: string`、`reason: string`
- イベントハンドラ: `onCopyCommand: () => void`、`onDismiss: () => void`
- コンポーネントが表示する情報の一覧（reason、contextSummary、terminalCommand）
- `localizeReason` および `localizeContextSummary` の入力フォーマット制約

### Task 1-3: TerminalHandoffBuilder のメソッドと制約の調査

`apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts` を読み取り、以下を記録する。

- 既存メソッド一覧と各メソッドのシグネチャ: `build()`、`buildForAgentExecution()`、`buildForSkillExecution()`
- `buildForSkillExecution()` の入力 `SkillHandoffBuildRequest` のフィールド（skillName、skillId、prompt、workingDirectory）
- 戻り値型 `HandoffGuidance` の構造（terminalCommand、contextSummary、reason）
- `sanitizePrompt()` の制約（shell injection 対策、P55 準拠）
- improve→terminal シナリオで不足しているフィールド（前回改善結果の要約）の特定

### Task 1-4: SkillLifecyclePanel ヘッダー構造とボタン配置ルールの確認

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の L400-435 を読み取り、以下を記録する。

- ヘッダー部（`flex flex-wrap items-start justify-between` コンテナ）の既存ボタン一覧
  - 「詳細ウィザード」ボタン (`data-testid="skill-lifecycle-open-wizard"`)
  - 「一覧へ戻る」ボタン
- Terminal ボタンを追加する場合の配置位置（既存ボタンの右側 vs 左側）の判断根拠
- `lifecycleButtonStyles` の利用可能なスタイルバリアント（secondary、subtle など）
- `ui-ux-diagrams.md` の画面構成図（L27-36）が示す `[Terminal]` の位置（ヘッダー右端）との整合性

## 参照資料

| 資料                           | パス                                                                                         | 参照目的                              |
| ------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------- |
| UI/UX 正本（terminal handoff） | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L42-50                  | terminal handoff 5契約の抽出          |
| UI/UX 図解（画面構成図）       | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md` L27-36                     | Terminal ボタン配置位置の確認         |
| TerminalHandoffCard            | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` | props・イベントのインターフェース確認 |
| TerminalHandoffBuilder         | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                           | 既存メソッドと不足機能の確認          |
| SkillLifecyclePanel            | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` L400-435                | ヘッダー構造とボタン配置ルールの確認  |
| agentSlice（handoffGuidance）  | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L179、L408、L796-824、L1038-1040      | handoffGuidance 状態管理の確認        |
| ストアセレクタ                 | `apps/desktop/src/renderer/store/index.ts` L805-812                                          | useHandoffGuidance の利用可否確認     |

## 実行手順

1. `ui-ux-realization.md` を読み取り、terminal handoff 5契約を表形式で抽出する
2. 各契約に対して受入基準を「ユーザーが ○○ すると、△△ が表示される」の形式で記述する
3. `TerminalHandoffCard.tsx` を読み取り、Props インターフェースを記録する
4. `TerminalHandoffBuilder.ts` を読み取り、既存メソッドのシグネチャと戻り値を記録する
5. `SkillLifecyclePanel.tsx` の L400-435 を読み取り、ヘッダー構造を図示する
6. `agentSlice.ts` の handoffGuidance 関連箇所（L179、L408、L796-824）を読み取り、状態管理フローを記録する
7. GAP C-02・C-03・C-07・D-02 と各契約の対応表を作成する
8. 機能要件・非機能要件をチェックリスト形式で整理する
9. `outputs/phase-1/requirements-analysis.md` に記録する

## 統合テスト連携

Phase 1 は要件定義フェーズのため実装コードを作成しない。ただし、Phase 4 テスト作成の入力として以下を確定する。

- TerminalHandoffCard の表示条件（handoffGuidance が null でない場合に表示）
- Terminal ボタンのクリック動作（手動 handoff のトリガー）
- buildForSkillImprovement() の入力・出力形式

## 多角的チェック観点

| 観点                   | チェック内容                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------- |
| 要件完全性             | terminal handoff 5契約（TH-01〜TH-05）が全て受入基準に変換されているか                  |
| UX 禁止事項遵守        | 「terminal 入口を画面ごとに別名へばらさない」（ui-ux-realization.md L71）に抵触しないか |
| インターフェース整合性 | TerminalHandoffCard の props と agentSlice の handoffGuidance 型が一致しているか        |
| 後続 Phase 依存性      | Phase 2 設計が本 Phase の成果物のみを前提とできるか                                     |

## 成果物テーブル

| 成果物                   | パス                                       | 完了条件                                             |
| ------------------------ | ------------------------------------------ | ---------------------------------------------------- |
| requirements-analysis.md | `outputs/phase-1/requirements-analysis.md` | terminal handoff 5契約の受入基準が全件記録されている |

## 完了条件チェックリスト

- [ ] terminal handoff 5契約（TH-01〜TH-05）が全て抽出され、受入基準が具体的に記述されている
- [ ] TerminalHandoffCard の Props インターフェース（guidance.terminalCommand、guidance.contextSummary、guidance.reason、onCopyCommand、onDismiss）が記録されている
- [ ] TerminalHandoffBuilder の既存メソッド（build、buildForAgentExecution、buildForSkillExecution）のシグネチャが記録されている
- [ ] improve→terminal シナリオで不足しているフィールド（前回改善結果要約）が特定されている
- [ ] SkillLifecyclePanel ヘッダーの現状構造（L400-435）が図示または列挙されている
- [ ] GAP C-02・C-03・C-07・D-02 と terminal handoff 5契約の対応表が作成されている
- [ ] 機能要件と非機能要件がチェックリスト形式で整理されている
- [ ] `outputs/phase-1/requirements-analysis.md` が作成されている

## 次 Phase

Phase 2 設計 (`phase-2-design.md`)

- 入力: `outputs/phase-1/requirements-analysis.md`
- 目的: Terminal 統合のコンポーネント設計・インターフェース設計
