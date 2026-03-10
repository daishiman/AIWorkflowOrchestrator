# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 11                     |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-10             |

## 目的

自動テストでは検証できないユーザー体験・UI/UX・実環境動作を手動で確認し、**UI/UX品質の問題を発見・修正する**。AIアシスタント画面（Tap & Discover リデザイン）の全コンポーネントについて、レイアウト・マイクロインタラクション・アクセシビリティ・ダークモード対応を網羅的に検証する。スクリーンショットは品質改善のための手段であり、撮影自体が目的ではない。

## 実行タスク

- 機能テスト: Level 1（ツール選択・実行ボタン・最近の実行）の正常系/異常系/境界値/状態遷移の手動検証
- UI/UXテスト: シングルカラムレイアウト・マイクロインタラクション・Apple HIG準拠・WCAG 2.1 AA準拠の確認
- 統合テスト: IPC連携（skill:list, skill:execute, skill:abort）・状態管理（agentSlice拡張）の手動確認
- リグレッションテスト: 既存AgentExecutionView・SkillStreamDisplay・CopyHistoryPanelへの影響確認
- UI/UX品質評価: 全画面状態を撮影 → 品質基準で評価 → 問題発見 → 修正 → 再検証

## 参照資料

| 資料名                         | パス                                                                                                         | 説明                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| タスク仕様書                   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058a-ui-03-agent-view-enhancement.md` | 元タスク仕様書（画面構成図・完了条件含む）    |
| Phase 5 実装成果物             | `outputs/phase-5/implementation-summary.md`                                                                  | 依存Phase 5成果物                             |
| Phase 6 テスト拡充成果物       | `outputs/phase-6/test-expansion-report.md`                                                                   | 依存Phase 6成果物                             |
| Phase 7 カバレッジ成果物       | `outputs/phase-7/coverage-report.md`                                                                         | 依存Phase 7成果物                             |
| Phase 8 リファクタリング成果物 | `outputs/phase-8/refactoring-report.md`                                                                      | 依存Phase 8成果物                             |
| Phase 9 品質成果物             | `outputs/phase-9/quality-report.md`                                                                          | 依存Phase 9成果物                             |
| 最終レビュー                   | `outputs/phase-10/final-review-result.md`                                                                    | Phase 10成果物（判定結果）                    |
| 設計書                         | `outputs/phase-2/architecture-design.md`                                                                     | Phase 2成果物（画面設計・コンポーネント設計） |
| 実行ガイダンス                 | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                  | 撮影コマンド詳細・レポート形式                |
| Apple HIG デザイン原則         | `.claude/rules/01-architecture.md`（UI/UXデザイン哲学セクション）                                            | カラーパレット・スペーシング基準              |
| UIコンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                      | コンポーネント設計仕様                        |
| 状態管理仕様                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                 | Zustand Store設計                             |
| アクセシビリティ試験仕様       | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                 | WCAG 2.1 AA 検証基準                          |
| UI実行仕様                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                 | 実行中/完了/失敗状態の期待仕様                |
| モデル選択UI                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                                    | AdvancedSettingsPanel のモデル選択期待仕様    |
| 許可設定UI                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                        | remembered permissions / reset の期待仕様     |
| スキル実行セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                              | permission mode と allowed tools の前提       |

## 依存Phase成果物参照

依存の正本は `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/requirements-traceability-matrix.md` の「依存関係トレース」を参照する。

## テストカテゴリ

- **機能テスト**: 正常系/異常系/境界値/状態遷移
- **UI/UXテスト**: レイアウト/マイクロインタラクション/フィードバック/アクセシビリティ
- **統合テスト**: IPC連携/状態管理（agentSlice）/画面遷移
- **リグレッションテスト**: 既存AgentExecutionView/SkillStreamDisplay/CopyHistoryPanel

## テストケース

### 機能テスト（正常系）

| テストケース | カテゴリ   | テスト項目                               | 前提条件                             | 操作手順                                                              | 期待結果                                                                                                                                                                                                                                                                                                                                 | スクリーンショット                                                         |
| ------------ | ---------- | ---------------------------------------- | ------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| TC-01        | 機能テスト | Level 1 メイン画面表示                   | インポート済みスキルが3件以上存在    | AIアシスタント画面を開く                                              | シングルカラム（中央寄せ max-width 600px）で「できること」セクション・実行ボタン・最近の実行の3要素が表示される。画面タイトルは「AIアシスタント」、セクションヘッダーは「できること」                                                                                                                                                    | `TC-01-main-view-light.png`                                                |
| TC-02        | 機能テスト | SkillChip 選択操作                       | インポート済みスキルが表示されている | SkillChipをタップする                                                 | (1) タップ時 `scale(0.97)`（100ms） → (2) バウンス `scale(1.05)`（150ms） → (3) 着地 `scale(1.0)`（100ms） → (4) ボーダーカラーが `transparent` → `var(--status-primary)` にフェード（200ms）。`aria-checked="true"` に変化                                                                                                              | `TC-02-chip-selected-light.png`                                            |
| TC-03        | 機能テスト | ExecuteButton 状態遷移                   | AIアシスタント画面が表示されている   | (1) 未選択状態を確認 → (2) SkillChipを選択 → (3) 実行ボタンをクリック | (1) 未選択時: テキスト「ツールを選んでください」、`disabled`状態、`opacity-50` → (2) 選択時: テキスト「実行する」、enabled → (3) クリック: AgentExecutionViewに遷移                                                                                                                                                                      | `TC-03-button-disabled-light.png`, `TC-03-button-enabled-light.png`        |
| TC-04        | 機能テスト | FloatingExecutionBar 表示（実行中→完了） | スキルを選択して実行開始             | 実行ボタンをクリックし、実行完了を待つ                                | (1) 画面下部にスライドイン（`translateY(100%) -> translateY(0)`, 300ms） → (2) スキル名・「実行中...」・経過時間（mm:ss形式）・プログレスバー・停止ボタンが表示 → (3) 完了時: success-bounce（チェックマーク `scale(0->1.2->1)`, 300ms）+ プログレスバー緑色 → (4) 1.5秒後にスライドアウト（`translateY(0) -> translateY(100%)`, 200ms） | `TC-04-floating-executing-light.png`, `TC-04-floating-completed-light.png` |
| TC-05        | 機能テスト | FloatingExecutionBar エラー              | スキル実行が失敗する条件を設定       | エラーが発生するスキルを実行する                                      | (1) shake アニメーション（`translateX(0, -4px, 4px, -4px, 4px, 0)`, 300ms） → (2) 赤色表示（`border-top-color: var(--status-error)`） → (3) 3秒後にスライドアウト                                                                                                                                                                        | `TC-05-floating-error-light.png`                                           |
| TC-06        | 機能テスト | AdvancedSettingsPanel 開閉               | AIアシスタント画面が表示されている   | (1) 歯車アイコンをタップ → (2) パネル内容を確認 → (3) ESCキーで閉じる | (1) 背景オーバーレイ `opacity 0->0.3`（200ms）+ パネル `translateX(100%) -> 0`（300ms） → (2) 「AIの種類」ラジオ選択 + 「許可設定」モードセレクタ表示 → (3) パネル `translateX(0) -> 100%`（200ms）+ オーバーレイ `opacity 0.3->0`（150ms）                                                                                              | `TC-06-panel-open-light.png`                                               |
| TC-07        | 機能テスト | RecentExecutionList 表示                 | 過去に3件以上のスキル実行履歴がある  | AIアシスタント画面で「最近の実行」セクションを確認                    | (1) 最大3件が表示される → (2) 各エントリにスキル表示名・ステータスアイコン（check/x/spinner）・相対時間（「2分前」「1時間前」）が表示 → (3) クリックでAgentExecutionViewに遷移                                                                                                                                                           | `TC-07-recent-list-light.png`                                              |

### エラーハンドリングテスト（異常系）

| テストケース | カテゴリ | テスト項目                | 前提条件                  | 操作手順                 | 期待結果                                                                                                                    | スクリーンショット            |
| ------------ | -------- | ------------------------- | ------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| TC-08        | 異常系   | 空状態テスト（ツール0件） | インポート済みスキルが0件 | AIアシスタント画面を開く | 「できること」セクションに「Skill Centerでツールをインポート」リンクが表示される。リンククリックでSkillCenter画面に遷移する | `TC-08-empty-state-light.png` |

### 境界値テスト

| テストケース | カテゴリ | テスト項目       | 前提条件                                | 操作手順                                           | 期待結果                                                                                                                                     | スクリーンショット                                         |
| ------------ | -------- | ---------------- | --------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| TC-09        | 境界値   | 検索バー条件分岐 | (A) インポート済みスキル10個 / (B) 11個 | AIアシスタント画面を開き、検索バーの表示有無を確認 | (A) 10個以下: 検索バーが非表示 → (B) 11個以上: 「できること」セクション上部にインライン検索バーが出現し、SkillChipのフィルタリングが動作する | `TC-09-no-search-light.png`, `TC-09-with-search-light.png` |

### アクセシビリティテスト

| テストケース | カテゴリ         | テスト項目               | 前提条件                           | 操作手順                                                 | 期待結果                                                                                                                                                                                                                                                                                                             | スクリーンショット  |
| ------------ | ---------------- | ------------------------ | ---------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| TC-10        | アクセシビリティ | キーボードナビゲーション | AIアシスタント画面が表示されている | Tabキーで全要素をフォーカス移動し、Enter/Spaceで操作する | (1) Tab: SkillChip群 → 実行ボタン → 最近の実行エントリ → 歯車アイコンの順にフォーカス → (2) SkillChipでSpace: 選択状態が切り替わる → (3) 実行ボタンでEnter: AgentExecutionViewに遷移 → (4) SkillChip群が `role="radiogroup"` + `aria-label="ツール選択"` で囲まれ、各チップが `role="radio"` + `aria-checked` を持つ | N/A（非視覚テスト） |

### テーマテスト

| テストケース | カテゴリ | テスト項目           | 前提条件             | 操作手順                                   | 期待結果                                                                                                                                                                                                                                                                                                                           | スクリーンショット         |
| ------------ | -------- | -------------------- | -------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| TC-11        | テーマ   | ダークモード対応確認 | ダークモードを有効化 | AIアシスタント画面の全コンポーネントを確認 | (1) 背景色がCSS変数 `var(--bg-primary)` でダークモード値（`#000000`）に切り替わる → (2) テキストが `var(--text-primary)` でダークモード値（`#FFFFFF`）に切り替わる → (3) SkillChip背景が `var(--bg-secondary)` でダークモード値（`#1C1C1E`）に切り替わる → (4) コントラスト比 4.5:1 以上（通常テキスト）、3:1 以上（UI部品）を維持 | `TC-11-main-view-dark.png` |

## スクリーンショット撮影ガイドライン

### 適用判断

本タスクはUI/UX変更タスクのため、スクリーンショット撮影は**必須**。

### 撮影規定

| 項目           | 規定                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| 命名規則       | `TC-{番号}-{状態ラベル}-{テーマ}.png`（例: `TC-01-main-view-light.png`） |
| 配置先         | `outputs/phase-11/screenshots/`                                          |
| 必須タイミング | (1) 操作後の結果状態 (2) エラー発生時のUI                                |
| 紐付け規定     | `manual-test-result.md` のテスト結果表で各TCに最低1枚の証跡を紐付ける    |

### 仕様照合チェックリスト

- [ ] レイアウトがPhase 2設計書の画面設計と一致（シングルカラム、中央寄せ、max-width: 600px）
- [ ] カラーパレットがApple HIG準拠（`.claude/rules/01-architecture.md` 参照）
- [ ] スペーシングが8pxグリッドに従っている（コンポーネント間: 24px、チップ間: 16px、コンテナpadding: 24px）
- [ ] ダークモード/ライトモード両方で確認
- [ ] エラー状態のUI表示が設計書と一致（shake + 赤色 + 3秒スライドアウト）

### 撮影コマンド

```bash
# Step 1: dev serverを起動（別ターミナル or バックグラウンド）
cd apps/desktop && npx vite --config vite.e2e.config.ts &

# Step 2: screenshot-plan.json から全状態を一括撮影
node .agents/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement \
  --plan outputs/phase-11/screenshot-plan.json

# Step 3: カバレッジレポートを確認
cat docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-11/screenshot-coverage.md

# dev server停止
kill %1 2>/dev/null
```

### 網羅性検証コマンド

```bash
node .agents/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement \
  --allow-non-visual-tc TC-10
```

### 撮影不可時の代替

CI/ビルド環境制約でElectronを起動できない場合:

1. `outputs/phase-11/screenshots/NOTE.txt` に理由を記載（自動生成）
2. DevToolsログまたはテスト実行結果をエビデンスとして記録

## 画面カバレッジマトリクス

### Step 1: 変更コンポーネント一覧

```bash
git diff main --name-only -- '*.tsx' '*.jsx' | grep -E '(components|views|pages)/'
```

| #   | コンポーネント          | 種別 | 配置ルート | 表示トリガー                     |
| --- | ----------------------- | ---- | ---------- | -------------------------------- |
| 1   | SkillChip               | 新規 | /agent     | 常時表示（Level 1）              |
| 2   | ExecuteButton           | 新規 | /agent     | 常時表示（Level 1）              |
| 3   | FloatingExecutionBar    | 新規 | /agent     | 実行中/完了/失敗時のみ表示       |
| 4   | AdvancedSettingsPanel   | 新規 | /agent     | 歯車アイコンタップでスライドイン |
| 5   | RecentExecutionList     | 新規 | /agent     | 常時表示（Level 1）              |
| 6   | AgentView（レイアウト） | 変更 | /agent     | 常時表示                         |

### Step 2: UI状態カバレッジ定義

| コンポーネント        | 表示状態                         | 優先度 | 該当                                   |
| --------------------- | -------------------------------- | ------ | -------------------------------------- |
| SkillChip             | デフォルト表示                   | [A]    | 必須                                   |
| SkillChip             | 選択済み表示                     | [A]    | 必須                                   |
| SkillChip             | 無効化状態（disabled）           | [B]    | 必須                                   |
| SkillChip             | ホバー                           | [D]    | N/A（ホバー状態の静止画撮影困難）      |
| ExecuteButton         | 未選択時（disabled）             | [A]    | 必須                                   |
| ExecuteButton         | 選択時（enabled）                | [A]    | 必須                                   |
| ExecuteButton         | ホバー                           | [D]    | N/A（ホバー状態の静止画撮影困難）      |
| FloatingExecutionBar  | 実行中表示                       | [A]    | 必須                                   |
| FloatingExecutionBar  | 完了表示（success-bounce）       | [A]    | 必須                                   |
| FloatingExecutionBar  | エラー表示（shake + 赤色）       | [B]    | 必須                                   |
| FloatingExecutionBar  | 非表示（idle）                   | [A]    | N/A（非表示状態のためTC-01で確認済み） |
| AdvancedSettingsPanel | パネル表示中                     | [A]    | 必須                                   |
| AdvancedSettingsPanel | パネル非表示                     | [A]    | N/A（TC-01のメイン画面で確認済み）     |
| RecentExecutionList   | データあり表示（3件）            | [A]    | 必須                                   |
| RecentExecutionList   | 空状態（0件）                    | [B]    | 必須                                   |
| AgentView             | シングルカラムレイアウト全体     | [A]    | 必須                                   |
| AgentView             | ツール0件（EmptyState）          | [B]    | 必須                                   |
| AgentView             | ツール10個以下（検索バー非表示） | [A]    | 必須                                   |
| AgentView             | ツール11個以上（検索バー表示）   | [A]    | 必須                                   |
| 全コンポーネント      | ライトモード                     | [A]    | 必須                                   |
| 全コンポーネント      | ダークモード                     | [A]    | 必須                                   |

### Step 3: 撮影計画

| テストケース | コンポーネント        | 状態                       | テーマ | ファイル名                           |
| ------------ | --------------------- | -------------------------- | ------ | ------------------------------------ |
| TC-01        | AgentView             | メイン画面デフォルト       | light  | `TC-01-main-view-light.png`          |
| TC-02        | SkillChip             | 選択状態                   | light  | `TC-02-chip-selected-light.png`      |
| TC-03        | ExecuteButton         | disabled状態               | light  | `TC-03-button-disabled-light.png`    |
| TC-03        | ExecuteButton         | enabled状態                | light  | `TC-03-button-enabled-light.png`     |
| TC-04        | FloatingExecutionBar  | 実行中                     | light  | `TC-04-floating-executing-light.png` |
| TC-04        | FloatingExecutionBar  | 完了                       | light  | `TC-04-floating-completed-light.png` |
| TC-05        | FloatingExecutionBar  | エラー                     | light  | `TC-05-floating-error-light.png`     |
| TC-06        | AdvancedSettingsPanel | パネル表示中               | light  | `TC-06-panel-open-light.png`         |
| TC-07        | RecentExecutionList   | 3件表示                    | light  | `TC-07-recent-list-light.png`        |
| TC-08        | AgentView             | 空状態（ツール0件）        | light  | `TC-08-empty-state-light.png`        |
| TC-09        | AgentView             | 検索バー非表示（10個以下） | light  | `TC-09-no-search-light.png`          |
| TC-09        | AgentView             | 検索バー表示（11個以上）   | light  | `TC-09-with-search-light.png`        |
| TC-11        | AgentView             | メイン画面ダークモード     | dark   | `TC-11-main-view-dark.png`           |

**撮影計画JSON**: `outputs/phase-11/screenshot-plan.json`

```json
{
  "taskId": "TASK-UI-03-AGENT-VIEW-ENHANCEMENT",
  "components": [
    {
      "name": "AgentView",
      "route": "/agent",
      "states": [
        { "id": "TC-01", "label": "main-view", "theme": "light" },
        { "id": "TC-11", "label": "main-view", "theme": "dark" },
        {
          "id": "TC-08",
          "label": "empty-state",
          "theme": "light",
          "note": "インポート済みスキル0件の状態で起動"
        },
        {
          "id": "TC-09a",
          "label": "no-search",
          "theme": "light",
          "note": "スキル10個以下の状態"
        },
        {
          "id": "TC-09b",
          "label": "with-search",
          "theme": "light",
          "note": "スキル11個以上の状態"
        }
      ]
    },
    {
      "name": "SkillChip",
      "route": "/agent",
      "states": [
        {
          "id": "TC-02",
          "label": "chip-selected",
          "theme": "light",
          "action": "click",
          "actionTarget": "[role='radio']:first-child",
          "waitAfterAction": 500
        }
      ]
    },
    {
      "name": "ExecuteButton",
      "route": "/agent",
      "states": [
        {
          "id": "TC-03a",
          "label": "button-disabled",
          "theme": "light",
          "selector": "[data-testid='execute-button']"
        },
        {
          "id": "TC-03b",
          "label": "button-enabled",
          "theme": "light",
          "action": "click",
          "actionTarget": "[role='radio']:first-child",
          "selector": "[data-testid='execute-button']",
          "waitAfterAction": 300
        }
      ]
    },
    {
      "name": "FloatingExecutionBar",
      "route": "/agent",
      "states": [
        {
          "id": "TC-04a",
          "label": "floating-executing",
          "theme": "light",
          "note": "スキル実行中の状態"
        },
        {
          "id": "TC-04b",
          "label": "floating-completed",
          "theme": "light",
          "note": "スキル実行完了後の状態"
        },
        {
          "id": "TC-05",
          "label": "floating-error",
          "theme": "light",
          "note": "スキル実行失敗時の状態"
        }
      ]
    },
    {
      "name": "AdvancedSettingsPanel",
      "route": "/agent",
      "states": [
        {
          "id": "TC-06",
          "label": "panel-open",
          "theme": "light",
          "action": "click",
          "actionTarget": "[aria-label='詳細設定を開く']",
          "waitAfterAction": 400
        }
      ]
    },
    {
      "name": "RecentExecutionList",
      "route": "/agent",
      "states": [
        {
          "id": "TC-07",
          "label": "recent-list",
          "theme": "light",
          "selector": "[data-testid='recent-execution-list']"
        }
      ]
    }
  ]
}
```

### Step 4: 画面カバレッジレポート

撮影完了後に `outputs/phase-11/screenshot-coverage.md` に以下を記録する:

| カバレッジ種別                                 | 対象数 | 撮影数 | カバレッジ率 | 基準         |
| ---------------------------------------------- | ------ | ------ | ------------ | ------------ |
| コンポーネントカバレッジ                       | 6      | 6      | 100%         | **100%必須** |
| 表示状態カバレッジ（該当必須項目）             | 13     | 13     | 100%         | **100%必須** |
| インタラクション状態カバレッジ（該当必須項目） | 2      | 2      | 100%         | **100%必須** |
| テーマカバレッジ                               | 2      | 2      | 100%         | **100%必須** |
| **総合カバレッジ**                             | **23** | **23** | **100%**     | **100%必須** |

**N/A理由テーブル**:

| コンポーネント        | スキップした状態 | N/A理由                                       | 優先度 |
| --------------------- | ---------------- | --------------------------------------------- | ------ |
| SkillChip             | ホバー           | 静止画でホバー状態を撮影困難                  | [D]    |
| ExecuteButton         | ホバー           | 静止画でホバー状態を撮影困難                  | [D]    |
| FloatingExecutionBar  | 非表示（idle）   | 非表示状態のためTC-01メイン画面で間接的に確認 | [A]    |
| AdvancedSettingsPanel | パネル非表示     | TC-01のメイン画面で間接的に確認               | [A]    |

## 統合テスト連携

| テスト項目        | 確認内容                                                     | 期待結果                                | 実行結果   |
| ----------------- | ------------------------------------------------------------ | --------------------------------------- | ---------- |
| IPC skill:list    | `window.electronAPI.skill.list()` でスキル一覧取得           | インポート済みスキルの配列が返される    | {{RESULT}} |
| IPC skill:execute | `window.electronAPI.skill.execute(skillName, options)` 実行  | 実行結果が返され、FloatingBarに反映     | {{RESULT}} |
| IPC skill:abort   | `window.electronAPI.skill.abort(executionId)` 実行           | 実行が停止しFloatingBarのステータス更新 | {{RESULT}} |
| 状態管理          | agentSlice の recentExecutions / isAdvancedSettingsOpen 動作 | 状態の追加・取得・クリアが正常動作      | {{RESULT}} |
| 画面遷移          | ExecuteButton クリック → AgentExecutionView 遷移             | 遷移先が正しく表示される                | {{RESULT}} |

## 多角的チェック観点

| 観点             | 確認内容                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| UX言語マッピング | UIテキストが「AIアシスタント」「ツール」「できること」に統一されている                               |
| z-index競合      | GlobalNavStrip（z-20）/ AdvancedSettingsPanel（z-40/41）/ FloatingExecutionBar（z-50）が正しく重なる |
| パフォーマンス   | SkillChip 20個表示時にレンダリング遅延がない                                                         |
| レスポンシブ     | max-width: 600px 以下での表示崩れがない                                                              |
| フォント         | システムフォント（-apple-system, BlinkMacSystemFont）が適用されている                                |
| 角丸統一         | ExecuteButton: 12px、SkillChip: 50%（完全な丸）が正しく適用されている                                |

## 成果物

| 成果物             | パス                                      | 必須 | 説明                        |
| ------------------ | ----------------------------------------- | ---- | --------------------------- |
| テスト結果         | `outputs/phase-11/manual-test-result.md`  | 必須 | 手動テスト結果              |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md`   | 必須 | 発見した課題（0件でも出力） |
| スクリーンショット | `outputs/phase-11/screenshots/`           | 必須 | UI/UX変更タスクのため必須   |
| 撮影計画           | `outputs/phase-11/screenshot-plan.json`   | 必須 | 画面カバレッジ用撮影計画    |
| カバレッジレポート | `outputs/phase-11/screenshot-coverage.md` | 必須 | 100%達成確認用              |

## 完了条件

- [ ] 全テストケース（TC-01〜TC-11）が実行済み
- [ ] 全テストケースがPASS
- [ ] 統合テスト手動確認が完了（IPC skill:list/execute/abort、状態管理、画面遷移）
- [ ] `git diff main` で変更コンポーネント一覧を洗い出し済み
- [ ] 各コンポーネントの全UI状態（表示/インタラクション/テーマ）を列挙済み（N/A理由も記録）
- [ ] 撮影計画 `screenshot-plan.json` が作成済み
- [ ] 撮影計画の全項目のスクリーンショットが `outputs/phase-11/screenshots/` に配置済み
- [ ] 各TCにスクリーンショット証跡が紐付き、`validate-phase11-screenshot-coverage.js` がPASS
- [ ] 画面カバレッジレポートの必須項目（優先度[A][B]）が100%
- [ ] 各スクリーンショットに対してUI/UX品質評価を実施済み（仕様照合チェックリスト全項目確認）
- [ ] 品質評価で発見したUI/UX問題を全て修正済み（または `discovered-issues.md` に記録済み）
- [ ] 修正後の再撮影が完了し、品質基準をクリアしていることを確認済み
- [ ] UX言語マッピング準拠（「AIアシスタント」「できること」「ツール」のテキスト確認）
- [ ] Apple HIG準拠のスタイルが適用されている（CSS変数名が00-design-foundationと一致）
- [ ] WCAG 2.1 AA: コントラスト比 4.5:1 以上（通常テキスト）、3:1 以上（UI部品）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
