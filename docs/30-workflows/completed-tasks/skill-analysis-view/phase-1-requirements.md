# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 1                                     |
| 機能名   | SkillAnalysisView（スキル分析ビュー） |
| タスクID | TASK-10A-B                            |
| 作成日   | 2026-03-02                            |

## 目的

SkillAnalysisView の要件を明確化し、受け入れ基準を定義する。ユーザーがスキルの品質を定量的に把握し、改善提案を確認・適用できるUIに必要な機能要件・非機能要件を網羅的に抽出する。

## 実行タスク

- 要件抽出: バックエンド（TASK-9C: SkillAnalyzer/SkillImprover）が提供するAPI機能からUI要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準をGherkin形式で定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定
- IPC連携要件定義: 既存IPCチャネル（skill:analyze, skill:improve, skill:optimize）の利用要件を定義
- データフロー定義: Renderer → Preload → Main → SkillAnalyzer → Renderer のフローを定義

## 参照資料

| 資料名                         | パス / タスクID                                                  | 説明                               |
| ------------------------------ | ---------------------------------------------------------------- | ---------------------------------- |
| タスク原本                     | `docs/30-workflows/completed-tasks/skill-analysis-view/index.md` | 本タスク仕様の正本                 |
| バックエンド型定義             | `packages/shared/src/types/skill-improver.ts`                    | SkillAnalysis/ImprovementResult等  |
| IPCチャネル定義                | `apps/desktop/src/preload/channels.ts`                           | SKILL_ANALYZE/IMPROVE/OPTIMIZE定義 |
| Preload API                    | `apps/desktop/src/preload/skill-api.ts`                          | 既存safeInvokeパターン             |
| デザイン基盤                   | TASK-UI-00                                                       | 共通コンポーネント・トークン       |
| UIアーキテクチャ               | `.claude/rules/01-architecture.md`                               | Atomic Design・Apple HIG準拠       |
| 状態管理ルール                 | `.claude/rules/03-state-management.md`                           | Zustand設計原則                    |
| セキュリティルール             | `.claude/rules/04-electron-security.md`                          | IPC入力バリデーション              |
| P42: trimバリデーション漏れ    | `.claude/rules/06-known-pitfalls.md#P42`                         | 3段バリデーション                  |
| P46: HTMLAttributes型衝突      | `.claude/rules/06-known-pitfalls.md#P46`                         | Omitによる回避                     |
| P47: CSS変数テストアサーション | `.claude/rules/06-known-pitfalls.md#P47`                         | variantStyles Record定数           |

## aiworkflow-requirements 仕様抽出結果（resource-map準拠）

| 関心領域               | 仕様書                                                                            | このPhaseでの利用目的                   |
| ---------------------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| 抽出ナビ               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | 今回必要な仕様書を漏れなく特定          |
| UI実装                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | SkillAnalysisView のUI要件基準          |
| UIデザイン基盤         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | デザイントークン、配色、タイポグラフィ  |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG / WCAG 準拠観点               |
| 機能別コンポーネント   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Skill系コンポーネント責務               |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | ローカルstate配置方針                   |
| アーキテクチャ全体     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | 依存方向（Renderer→Preload→Main）の確認 |
| IPC/API契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | skill系チャネル契約（引数/戻り値）      |
| API一覧                | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | チャネル命名と用途の正本確認            |
| API共通設計            | `.claude/skills/aiworkflow-requirements/references/api-core.md`                   | OperationResult・エラー応答契約の確認   |
| 型インターフェース     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillAnalysis/ImprovementResult型       |
| Preload/IPC境界        | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | contextBridge公開範囲と境界防御の確認   |
| セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC sender検証と入力検証要件            |
| セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | skill関連IPCの検証ルール                |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 脅威モデルと防御方針の整合              |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 分析/改善失敗時のエラー契約確認         |
| テスト品質             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ/品質基準                     |
| コンポーネントテスト   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト方針（TDD, モック, 検証軸）       |
| アクセシビリティテスト | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | WCAG観点の試験項目抽出                  |
| テストフィクスチャ     | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`           | 再利用可能なテストデータ設計            |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`      | 既存UI/IPC実装パターンの再利用          |

## 実行手順

### 1. 機能要件（FR）抽出

#### FR-1: スキル分析実行

- ユーザーが「分析」ボタンをクリックすると、`window.electronAPI.skill.analyze(skillName)` を呼び出す
- 分析中はローディングスピナーまたはスケルトンを表示する
- 分析完了後、`SkillAnalysis` オブジェクトの結果を画面に表示する
- 分析にかかる時間が長い場合（3秒以上）、プログレス表示を行う

#### FR-2: 分析結果表示

- **総合スコア表示**: `overallScore`（0-100）を円形プログレスバーまたは数値 + カラーインジケータで表示する
  - 80-100: 成功色（`--status-success`）
  - 60-79: 警告色（`--status-warning`）
  - 0-59: エラー色（`--status-error`）
- **カテゴリ別スコア表示**: `categories[]` 配列の各カテゴリを水平バーチャートで表示する
  - カテゴリ名、スコア（0-100）、詳細テキスト、課題リスト
- **改善提案リスト表示**: `suggestions[]` 配列を優先度別にグループ化して表示する
  - high / medium / low の3グループ
  - 各提案: タイプアイコン、優先度バッジ、説明文、自動修正可能フラグ
- **リスク情報表示**: `risks[]` 配列をレベル別に色分けして表示する
  - critical: エラー色、high: 警告色、medium: 情報色、low: テキスト色

#### FR-3: 改善提案の選択・適用

- 各改善提案にチェックボックスを表示し、ユーザーが個別に選択できる
- 「自動修正可能」な提案のみを一括選択するフィルタボタンを提供する
- 「選択した提案を適用」ボタンで `window.electronAPI.skill.applyImprovements(skillName, selectedSuggestions)` を呼び出す
- 適用中はボタンをdisabledにし、ローディングインジケータを表示する
- 適用完了後、`ImprovementResult` の内容（適用数・スキップ数・エラー数）をトースト通知で表示する
- 適用完了後、分析結果を自動で再取得して画面を更新する

#### FR-4: 全自動改善

- 「全自動改善」ボタンで `window.electronAPI.skill.autoImprove(skillName)` を呼び出す
- 実行前に確認ダイアログを表示する（破壊的操作の保護）
- 実行中はボタンをdisabledにし、プログレスインジケータを表示する
- 完了後、結果サマリーを表示し、分析結果を再取得する

#### FR-5: エラーハンドリング

- 分析失敗時: エラーメッセージを表示し、「再試行」ボタンを提供する
- 改善適用失敗時: 失敗した提案と成功した提案を区別して表示する
- ネットワークエラー時: オフライン状態のメッセージを表示する
- バリデーションエラー時: 入力値の問題を明示する

### 2. 非機能要件（NFR）抽出

#### NFR-1: レスポンシブUI

- 分析実行中はスケルトンローダーまたはスピナーを表示する
- ボタンクリック後200ms以内にUI状態が変化する（ローディング表示開始）
- スクロール可能なリスト表示で大量の改善提案に対応する

#### NFR-2: アクセシビリティ（WCAG 2.1 AA）

- 全インタラクティブ要素にキーボード操作でアクセス可能
- スコア表示にARIA属性（`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`）を付与
- チェックボックスに適切な`aria-label`を付与（「{提案の説明}を選択」）
- エラーメッセージに`role="alert"`を付与
- コントラスト比4.5:1以上（通常テキスト）、3:1以上（大テキスト/UI部品）
- スクリーンリーダーでスコア値を読み上げ可能にする

#### NFR-3: Apple HIG準拠のビジュアルデザイン

- 8pxグリッドでスペーシングを統一
- 角丸は8px〜12px
- 影は繊細に（カード: `0 1px 3px rgba(0,0,0,0.04)`）
- システムフォント（`-apple-system`, `BlinkMacSystemFont`）を使用
- アニメーションは200-300ms
- ボタンにホバー/アクティブ/フォーカス状態のフィードバック

#### NFR-4: ダークモード対応

- CSS変数ベースのデザイントークンでライト/ダーク両モードに対応
- Apple HIG System Colorsに準拠した配色

### 3. 受け入れ基準

詳細は `outputs/phase-1/acceptance-criteria.md` に記載。

### 4. IPC連携要件定義

#### 利用するIPCチャネル

| チャネル名       | 定数                          | 方向                     | 引数                                           | 戻り値              |
| ---------------- | ----------------------------- | ------------------------ | ---------------------------------------------- | ------------------- |
| `skill:analyze`  | `IPC_CHANNELS.SKILL_ANALYZE`  | Renderer → Main → Return | `skillName: string`                            | `SkillAnalysis`     |
| `skill:improve`  | `IPC_CHANNELS.SKILL_IMPROVE`  | Renderer → Main → Return | `skillName: string, suggestions: Suggestion[]` | `ImprovementResult` |
| `skill:optimize` | `IPC_CHANNELS.SKILL_OPTIMIZE` | Renderer → Main → Return | `skillName: string`                            | `ImprovementResult` |

#### Preload API拡張

`window.electronAPI.skill` に以下のメソッドを追加:

- `analyze(skillName: string): Promise<SkillAnalysis>` — スキル分析実行
- `applyImprovements(skillName: string, suggestions: Suggestion[]): Promise<ImprovementResult>` — 選択した改善提案の適用
- `autoImprove(skillName: string): Promise<ImprovementResult>` — 全自動改善実行

#### データフロー

```
Renderer (SkillAnalysisView)
  → Preload (skill-api.ts: safeInvoke)
    → Main Process (IPC Handler)
      → SkillAnalyzer.analyze() / SkillImprover.applyImprovements()
    ← Main Process (結果返却)
  ← Preload (IpcResult<T> アンラップ)
← Renderer (state更新 → 再レンダリング)
```

### 5. Renderer層の状態管理

| 状態名                | 型                      | 初期値  | 説明                                 |
| --------------------- | ----------------------- | ------- | ------------------------------------ |
| `analysis`            | `SkillAnalysis \| null` | `null`  | 分析結果                             |
| `isAnalyzing`         | `boolean`               | `false` | 分析中フラグ                         |
| `isImproving`         | `boolean`               | `false` | 改善適用中フラグ                     |
| `selectedSuggestions` | `Set<number>`           | 空Set   | 選択された改善提案のインデックス集合 |
| `error`               | `string \| null`        | `null`  | エラーメッセージ                     |

状態は `useState` でコンポーネントローカルに管理する（Zustand Store不要: SkillAnalysisViewは単一画面で完結し、他コンポーネントとの状態共有が不要）。

---

## 統合テスト連携

| 観点             | 方針                                                     |
| ---------------- | -------------------------------------------------------- |
| コンポーネント   | @testing-library/react + happy-dom（fireEvent使用、P39） |
| IPCモック        | skill-api.ts のモック化（safeInvoke → 直接戻り値返却）   |
| スナップショット | スコア表示・リスト表示の構造検証                         |
| アクセシビリティ | axe-core による自動チェック                              |

## 多角的チェック観点

| 観点               | 確認項目                                                      |
| ------------------ | ------------------------------------------------------------- |
| 機能網羅性         | FR-1〜FR-5の全要件がUIから実行可能                            |
| IPC整合性          | Preload API呼び出しとMain Processハンドラの引数型が一致       |
| セキュリティ       | IPC引数にP42準拠3段バリデーション（型→空文字列→trim空文字列） |
| アクセシビリティ   | WCAG 2.1 AA全項目をNFR-2で定義済み                            |
| 状態管理           | useStateベースのローカル状態で完結（P31対策不要）             |
| エラーハンドリング | 分析失敗/改善失敗/ネットワークエラーの3パターンを定義済み     |

## 成果物

| 成果物                                       | タイプ       | 説明               |
| -------------------------------------------- | ------------ | ------------------ |
| `outputs/phase-1/requirements-definition.md` | 要件定義書   | FR/NFR一覧         |
| `outputs/phase-1/acceptance-criteria.md`     | 受け入れ基準 | Gherkin形式AC      |
| `outputs/phase-1/scope-definition.md`        | スコープ定義 | スコープ内外の明示 |

## 完了条件

- [ ] FR-1〜FR-5が全て文書化され、各FRに検証可能な受け入れ基準がある
- [ ] NFR-1〜NFR-4が全て文書化され、具体的な数値基準がある
- [ ] IPC連携要件（3チャネル）の引数型・戻り値型が型定義ファイルと一致している
- [ ] データフローがRenderer→Preload→Main→Backend→Renderer で完結している
- [ ] Renderer層の状態設計（5状態）が定義されている
- [ ] outputs/phase-1/ 配下の3ファイルが全て作成されている

## 次のPhase

Phase 2（設計）へ進行する。Phase 1 の要件を実現可能なコンポーネント設計・状態管理設計・IPC連携設計に落とし込む。
