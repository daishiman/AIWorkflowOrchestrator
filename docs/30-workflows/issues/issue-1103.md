# [#1103] "[UT-10A-G-003] スキルライフサイクル E2E テスト追加"

## メタ情報

```yaml
task_id: UT-10A-G-003
task_name: スキルライフサイクル E2E テスト追加
category: テスト強化
target_feature: SkillCreateWizard / SkillAnalysisView
priority: 低
scale: 大規模
status: 未実施
source_phase: TASK-10A-G Phase 12 未タスク検出
created_date: 2026-03-09
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-10a-g-003-skill-lifecycle-e2e-test.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 大規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-G で Layer 1（IPC契約）、Layer 2（Store統合）、Layer 3（既存テスト拡張）の3層テストを実装したが、E2E（End-to-End）テストは含まれていない。

### 1.2 問題点・課題

ユーザーの操作フロー（SkillCreateWizard でスキルを作成 → SkillAnalysisView で分析結果を確認 → 改善を実行）の全経路がブラウザレベルで検証されていない。

### 1.3 放置した場合の影響

UIの回帰バグ（ボタンが反応しない、フォーム送信が失敗する等）がユニットテストでは検出できず、リリース後に初めて顕在化するリスクがある。

## 2. 何を達成するか（What）

### 2.1 目的

Playwright を使用して、スキルライフサイクルの主要ユーザーフローをE2Eテストで保護する。

### 2.2 最終ゴール

スキル作成→分析→改善のhappy pathが自動E2Eテストで検証される。

### 2.3 スコープ

#### 含むもの

- SkillCreateWizard の入力→送信フロー
- SkillAnalysisView の表示・操作フロー
- スキル作成→一覧表示→分析の一連のユーザーフロー

#### 含まないもの

- エラー系の網羅的E2Eテスト（ユニットテストでカバー済み）
- 実装ロジックの機能拡張

### 2.4 成果物

- Playwright E2Eテストファイル
- Page Objectクラス（SkillCreateWizard / SkillAnalysisView）
- E2Eテスト実行結果レポート

## 3. どのように実行するか（How）

### 3.1 前提条件

1. Playwright のセットアップが完了していること
2. Electron アプリのE2Eテスト環境が構築されていること

### 3.2 依存タスク

既存の E2E テスト拡張タスク群との整合確認が必要。

### 3.3 必要な知識

Playwright E2Eテスト設計、Page Objectパターン、Electron IPC通信のE2Eテスト戦略。

### 3.4 推奨アプローチ

1. 既存の Playwright E2E テスト構成（`apps/desktop/e2e/`）を確認する
2. スキル作成のhappy pathシナリオを設計する
3. Page Object パターンで SkillCreateWizard / SkillAnalysisView のページオブジェクトを作成する
4. スキル作成→一覧表示→分析のフローテストを実装する

## 4. 実行手順

### Phase構成

E2E環境確認 → シナリオ設計 → Page Object作成 → テスト実装 → 検証。

### Phase 1: E2E環境確認・シナリオ設計

#### 目的

既存のE2Eテスト構成を把握し、テストシナリオを設計する。

#### 手順

1. `apps/desktop/e2e/` の既存テスト構成を確認する。
2. スキルライフサイクルのhappy pathシナリオを定義する。
3. テスト対象のユーザー操作フローを明文化する。

#### 成果物

テストシナリオ定義書。

#### 完了条件

テスト対象のユーザーフローが明確に定義されている。

### Phase 2: Page Object作成

#### 目的

SkillCreateWizard / SkillAnalysisView のPage Objectクラスを作成する。

#### 手順

1. SkillCreateWizard のPage Objectを作成する（フォーム入力・送信操作を抽象化）。
2. SkillAnalysisView のPage Objectを作成する（分析結果表示・改善操作を抽象化）。
3. 共通ナビゲーション操作をヘルパーとして抽出する。

#### 成果物

Page Objectクラスファイル。

#### 完了条件

各Page Objectが主要操作をメソッドとして公開している。

### Phase 3: E2Eテスト実装・検証

#### 目的

happy pathのE2Eテストを実装し、全テストがPASSすることを確認する。

#### 手順

1. スキル作成フローのE2Eテストを実装する。
2. スキル一覧表示の確認テストを実装する。
3. スキル分析フローのE2Eテストを実装する。
4. 全テストを実行し、PASSを確認する。

#### 成果物

E2Eテストファイル、実行結果レポート。

#### 完了条件

全E2Eテストがhappy pathでPASSする。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] スキル作成フローのE2Eテストが実装されている
- [ ] スキル分析フローのE2Eテストが実装されている
- [ ] スキル作成→一覧→分析の一連フローが検証されている

### 品質要件

- [ ] Page Objectパターンでテストコードが構造化されている
- [ ] テストが独立して実行可能である（テスト間の状態依存がない）

### ドキュメント要件

- [ ] テストシナリオが明文化されている
- [ ] 変更履歴へ理由を追記する

## 6. 検証方法

### テストケース

- `pnpm --filter @repo/desktop exec playwright test e2e/skill-lifecycle`

### 検証手順

1. Electron アプリをE2Eテストモードで起動する。
2. Playwright E2Eテストを実行し、全テストがPASSすることを確認する。
3. テスト実行レポートで各シナリオの結果を確認する。

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                            |
| -------------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| Electron E2E環境の構築が未完了         | 高     | 中       | 既存E2E構成を確認し、不足分を先行整備する                       |
| IPC通信のモック戦略が不明確            | 中     | 中       | 実IPC通信を使用し、テスト用データをフィクスチャで管理する       |
| 実ファイルシステム操作によるテスト汚染 | 中     | 高       | テスト用一時ディレクトリを使用し、afterEachでクリーンアップする |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/e2e/`: 既存E2Eテスト構成
- `ui-ux-feature-components.md`: SkillCreateWizard / SkillAnalysisView のUI仕様

### 参考資料

- `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`: Playwright E2Eテストパターン
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`: テストパターン参照
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`: v1.29.51

## 9. 備考

### 苦戦箇所（TASK-10A-G で得た教訓）

- **P53（CLI環境でのスクリーンショット取得制約）**: CLI環境ではElectronアプリの実画面キャプチャができない。E2Eテストでは `page.screenshot()` をスクリプト化して取得する方式が推奨される
- **P39（happy-dom環境でのuserEvent非互換）**: ユニットテストの問題であり、Playwright E2Eでは実ブラウザ環境のため userEvent 互換性の問題は発生しない。ただし Electron 固有の IPC 通信を E2E でテストする場合は、preload スクリプトのモック戦略が異なる
- **Layer 2 Store action 検証済み**: TASK-10A-G で Store action 経由のフローを検証済みだが、E2E ではモックを使わない（または最小限にする）ため、実際のファイルシステム操作が発生する点に注意が必要

### 補足事項

TASK-10A-G で Layer 1-3 のテストは十分にカバーされており、本タスクはE2Eレベルでの追加保護が目的である。優先度は低く、E2Eテスト基盤の整備状況に応じて着手時期を判断する。
