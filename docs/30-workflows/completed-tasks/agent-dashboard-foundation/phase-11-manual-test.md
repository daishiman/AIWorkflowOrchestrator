# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 11                         |
| Phase名    | 手動テスト検証             |
| 前提Phase  | Phase 10                   |
| 後続Phase  | Phase 12                   |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

自動テストでカバーできない部分を手動で検証し、実際のユーザー体験を確認する。

## 背景

自動テストに加えて、実際のアプリケーション上での動作確認とユーザビリティの検証を行う。

---

## 使用スキル

> このPhaseはテスト実行フェーズのため、スキルの呼び出しは不要です。
> 手動テストシナリオに従って検証を行います。

---

## 参照資料

| 参照資料         | パス                                      | 内容           |
| ---------------- | ----------------------------------------- | -------------- |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`  | Phase 1成果物  |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Phase 10成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                    | 内容               |
| ------------------- | ----------------------------------------------------------------------- | ------------------ |
| UI/UXナビゲーション | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | ナビゲーション動作 |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` | コンポーネント動作 |

---

## 手動テストシナリオ

### シナリオ1: AppDock表示確認

```gherkin
Feature: AppDockにAgentメニュー表示

Scenario: Agentアイコンが表示される
  Given アプリケーションを起動している
  When メイン画面が表示される
  Then AppDockに「Agent」アイコンが表示される
  And アイコンにホバーすると「Agent」ラベルが表示される

検証項目:
- [ ] Agentアイコンが正しい位置に表示される
- [ ] アイコンのデザインが他のアイコンと統一されている
- [ ] ホバー時のツールチップが表示される
- [ ] ショートカットキー（Cmd+5）が表示される
```

### シナリオ2: 画面遷移確認

```gherkin
Feature: Agent画面への遷移

Scenario: クリックで遷移
  Given メイン画面を表示している
  When AppDockの「Agent」アイコンをクリックする
  Then AgentViewが表示される
  And ナビゲーションの選択状態が「Agent」になる

Scenario: キーボードショートカットで遷移
  Given アプリケーションを操作している
  When Cmd+5（Mac）を押下する
  Then AgentViewが表示される

検証項目:
- [ ] クリックで正しく遷移する
- [ ] 遷移アニメーションが適切
- [ ] Cmd+5で遷移する（Mac）
- [ ] Ctrl+5で遷移する（Windows/Linux）
- [ ] 他の画面からも遷移できる
```

### シナリオ3: AgentView表示確認

```gherkin
Feature: AgentView表示

Scenario: 初期表示
  Given AgentViewに遷移している
  When 画面が読み込まれる
  Then スキル一覧またはEmpty状態が表示される
  And レイアウトが崩れていない

検証項目:
- [ ] ローディング状態が表示される
- [ ] Empty状態のメッセージが適切
- [ ] スキル一覧が正しく表示される
- [ ] レスポンシブデザインが機能する
```

### シナリオ4: 状態永続化確認

```gherkin
Feature: 状態の永続化

Scenario: 画面遷移後の状態維持
  Given AgentViewでスキルを選択している
  When 他の画面に遷移して戻る
  Then 選択状態が維持されている

検証項目:
- [ ] 選択状態が維持される
- [ ] フィルター状態が維持される
- [ ] アプリ再起動後も状態が復元される
```

---

## テスト実行手順

```bash
# 1. 開発サーバー起動
pnpm --filter @repo/desktop dev

# 2. 手動テスト実施
# 上記シナリオに従ってテストを実施

# 3. 結果記録
# outputs/phase-11/manual-test-result.md に結果を記録
```

---

## 成果物

| 成果物             | パス                                     | 内容         |
| ------------------ | ---------------------------------------- | ------------ |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | テスト結果   |
| スクリーンショット | `outputs/phase-11/screenshots/`          | 動作確認画像 |

---

## 手動テスト結果テンプレート

```markdown
## Phase 11 手動テスト結果

### テスト実施日

- 日時: {{datetime}}
- 実施環境: {{OS}}, {{app-version}}

### シナリオ1: AppDock表示確認

- 結果: {{PASS/FAIL}}
- 備考: {{note}}
- スクリーンショット: {{path}}

### シナリオ2: 画面遷移確認

- 結果: {{PASS/FAIL}}
- 備考: {{note}}
- スクリーンショット: {{path}}

### シナリオ3: AgentView表示確認

- 結果: {{PASS/FAIL}}
- 備考: {{note}}
- スクリーンショット: {{path}}

### シナリオ4: 状態永続化確認

- 結果: {{PASS/FAIL}}
- 備考: {{note}}

### 総合判定

- 判定: {{PASS/FAIL}}
- 発見されたバグ: {{count}}

### バグ一覧（発見された場合）

1. {{bug-description}}
   - 再現手順: {{steps}}
   - 期待動作: {{expected}}
   - 実際の動作: {{actual}}
   - 重要度: {{critical/major/minor}}
```

---

## 完了条件

- [ ] 全シナリオのテストが実施されている
- [ ] テスト結果が記録されている
- [ ] スクリーンショットが保存されている
- [ ] 発見されたバグが記録されている
- [ ] 重大なバグがない（または修正済み）

---

## Phase末端アクション【必須】

- [ ] 全手動テストシナリオを実行
- [ ] テスト結果を記録
- [ ] バグがあれば修正対応

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）がPASSであること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### テスト結果

- シナリオ1: {{PASS/FAIL}}
- シナリオ2: {{PASS/FAIL}}
- シナリオ3: {{PASS/FAIL}}
- シナリオ4: {{PASS/FAIL}}
- 総合: {{PASS/FAIL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-dashboard-foundation/phase-12-documentation.md`
