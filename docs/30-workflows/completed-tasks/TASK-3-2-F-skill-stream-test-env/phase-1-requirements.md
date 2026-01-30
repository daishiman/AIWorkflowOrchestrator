# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| Phase名    | 要件定義                         |
| カテゴリ   | 要件                             |
| 前提Phase  | なし                             |
| 後続Phase  | Phase 2                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-30                       |
| 機能名     | TASK-3-2-F-skill-stream-test-env |
| タスクID   | TASK-3-2-F                       |
| Issue      | #559                             |

---

## 目的

SkillStreamDisplayコンポーネントのテスト環境に存在する問題を調査・分析し、要件と受け入れ基準を明確化する。

## 背景

TASK-3-2-B（SkillStreamDisplay i18n対応）の実装中、happy-dom環境特有の問題（React concurrent mode非対応、Clipboard APIモック制限）が発生し、5つの`describe.skip`ブロックがテストコードに残存している。本Phaseでは、この問題の根本原因を調査し、解決に必要な要件を定義する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現状テスト環境の問題分析

**目的**: スキップされているテストの詳細情報と、happy-dom環境の制限事項を特定する。

**実行手順**:

1. 以下の4テストファイルを読み込み、`describe.skip`箇所を特定する
   - `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`（3箇所: L973, L1426, L1610）
   - `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx`（1箇所: L248）
   - `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx`（1箇所: L64）
2. 各`describe.skip`ブロックの内容を分析し、以下を記録する
   - テスト名
   - テスト件数
   - スキップ理由（コメントまたはTODO記載）
   - 依存するAPI（navigator.clipboard等）
3. `apps/desktop/vitest.config.ts`を読み込み、現在のテスト環境設定を記録する
   - 環境: `happy-dom`
   - テストプール: `forks`（maxForks: 2, isolate: true）
   - タイムアウト: 10000ms
4. `apps/desktop/package.json`のdevDependenciesからテスト関連パッケージのバージョンを記録する
   - happy-dom: v20.0.11
   - vitest: v2.1.9
   - @testing-library/react: v16.3.0

**期待される成果物**:

- `outputs/phase-1/test-environment-analysis.md`（テスト環境問題分析レポート）

---

### タスク2: happy-domの制限事項調査

**目的**: happy-domがサポートしていないAPIと、jsdomとの機能差を明確化する。

**実行手順**:

1. happy-dom GitHubリポジトリ（https://github.com/capricorn86/happy-dom）のIssuesで以下を検索する
   - 「concurrent mode」関連Issue
   - 「navigator.clipboard」関連Issue
   - 「act() warning」関連Issue
2. jsdomの対応状況を調査する
   - Clipboard API対応状況（https://github.com/jsdom/jsdom）
   - React concurrent mode互換性
   - act()警告の発生状況
3. 調査結果を以下の形式で整理する

| 機能                  | happy-dom | jsdom       | 備考           |
| --------------------- | --------- | ----------- | -------------- |
| React concurrent mode | 非対応    | 対応/非対応 | 調査結果を記載 |
| navigator.clipboard   | 制限あり  | 対応/非対応 | 調査結果を記載 |
| act() 互換性          | 警告発生  | 正常/警告   | 調査結果を記載 |

**期待される成果物**:

- `outputs/phase-1/dom-environment-comparison.md`（DOM環境比較レポート）

---

### タスク3: 受け入れ基準の定義

**目的**: テスト環境改善の受け入れ基準を検証可能な形で定義する。

**実行手順**:

1. 以下の受け入れ基準を定義する（全て検証可能な形式）
   - AC-1: 全SkillStreamDisplayテスト（現在5つの`describe.skip`含む）が`pnpm --filter @repo/desktop test`で全件PASSする
   - AC-2: `grep -r "describe.skip" apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay*`の結果が0件
   - AC-3: `navigator.clipboard.writeText`を使用するテストが正常にPASSする
   - AC-4: テスト実行ログに`act()`警告が出力されない
   - AC-5: テストカバレッジが100%維持（スキップテスト除外なし）
   - AC-6: 既存テスト（スキップ以外）の実行時間が+20%以内に収まる
2. 各受け入れ基準に対して検証コマンドを記載する
3. スコープを明確化する
   - **含む**: テスト環境設定変更、Clipboard APIモック改善、`describe.skip`解消、`act()`警告解消
   - **含まない**: 新規テストケースの追加、テスト対象コンポーネントの機能変更、E2Eテスト導入

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`（受け入れ基準定義書）

---

## 参照資料

| 参照資料                   | パス                                                                                                    | 内容                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------- |
| タスク指示書               | `docs/30-workflows/unassigned-task/task-skill-stream-test-environment-improvements.md`                  | 元タスク仕様                    |
| Vitest設定                 | `apps/desktop/vitest.config.ts`                                                                         | 現テスト環境設定                |
| テストファイル（メイン）   | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`                  | メインテスト（3 describe.skip） |
| テストファイル（i18n）     | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx`             | i18nテスト（1 describe.skip）   |
| テストファイル（i18n統合） | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx` | 統合テスト（1 describe.skip）   |
| テストユーティリティ       | `apps/desktop/src/renderer/test-utils/i18n-test-utils.tsx`                                              | i18nテストユーティリティ        |
| パッケージ設定             | `apps/desktop/package.json`                                                                             | テスト依存パッケージ            |
| SkillStreamDisplay仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                         | コンポーネント仕様              |
| SkillStream詳細仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`                       | SkillStream詳細仕様             |
| 品質要件仕様               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                             | テスト戦略・カバレッジ要件      |

---

## 統合テスト連携

### このPhaseでの統合テスト観点

- テスト環境の互換性確認: happy-domとjsdomの機能差がSkillStreamDisplayの統合テストシナリオに与える影響を分析する
- Clipboard API統合: `navigator.clipboard.writeText` → UI表示更新のフロー（コピーボタン → フィードバック表示）が統合テストで検証可能かを確認する
- React concurrent mode: 非同期レンダリングを含む統合テストシナリオが環境変更後も動作するかを確認する

---

## 多角的チェック観点

| 観点           | 本Phaseでの確認事項                                              | 該当 |
| -------------- | ---------------------------------------------------------------- | ---- |
| テスタビリティ | テスト環境変更がテスト品質に与える影響の定量化                   | Yes  |
| セキュリティ   | テストモックがセキュリティテストに影響しないことの確認           | No   |
| UI/UX          | コピー機能のUXテスト（フィードバック表示）が検証可能かの確認     | Yes  |
| アーキテクチャ | Renderer Processのテスト環境がアーキテクチャ要件を満たすかの確認 | Yes  |
| i18n           | i18n統合テストが環境変更後も正常動作するかの確認                 | Yes  |

---

## 成果物

| 成果物             | パス                                            | 内容                           |
| ------------------ | ----------------------------------------------- | ------------------------------ |
| テスト環境問題分析 | `outputs/phase-1/test-environment-analysis.md`  | 現テスト環境の問題分析レポート |
| DOM環境比較        | `outputs/phase-1/dom-environment-comparison.md` | happy-dom vs jsdom比較         |
| 受け入れ基準定義書 | `outputs/phase-1/acceptance-criteria.md`        | 検証可能な受け入れ基準         |

---

## 完了条件

- [ ] 5つの`describe.skip`ブロックの詳細（テスト名、件数、スキップ理由、依存API）が文書化されている
- [ ] happy-domとjsdomの機能比較表が作成されている（concurrent mode、Clipboard API、act()互換性）
- [ ] 受け入れ基準が6項目すべて検証可能な形式（コマンド付き）で定義されている
- [ ] スコープ（含む/含まない）が明確に記載されている
- [ ] 成果物が`outputs/phase-1/`配下に3ファイル生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（初回Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-F-skill-stream-test-env/phase-2-design.md`
