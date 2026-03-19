# Phase 11: 手動テスト

## メタ情報

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001                    |
| フェーズ | Phase 11                                                |
| 機能名   | agentview-improve-route                                 |
| 作成日   | 2026-03-17                                              |
| 依存     | Phase 10 成果物（outputs/phase-10/、PASS or MINOR済み） |

## 目的

Electron デスクトップアプリ上で実際の UI 操作を行い、CTA バナーと戻り導線が仕様通りに機能することを目視で確認する。

## 事前準備

- [ ] `pnpm --filter @repo/desktop dev` でアプリを起動
- [ ] DevTools を開く（Cmd+Option+I または View > Toggle Developer Tools）
- [ ] スクリーンショット保存先ディレクトリを作成: `outputs/phase-11/screenshots/`

> CLI 環境でスクリーンショット取得が困難な場合は、P53 対策として Playwright の `page.screenshot()` または `webContents.capturePage()` を使用する。

## 実行タスク

### Task 1: CTA バナー表示確認

#### シナリオ 1: 正常表示

- [ ] スキルを選択してエージェントを実行する
- [ ] 実行が完了する（`isExecutionComplete=true`）
- [ ] AgentView に改善 CTA バナーが表示されることを確認
- [ ] バナーに表示されているスキル名が選択したスキル名と一致することを確認
- [ ] スクリーンショット取得: `outputs/phase-11/screenshots/cta-banner-visible.png`

#### シナリオ 2: 非表示（実行中）

- [ ] スキルを選択してエージェントを実行中の状態にする
- [ ] 実行中（`isExecutionComplete=false`）は CTA バナーが表示されないことを確認
- [ ] スクリーンショット取得: `outputs/phase-11/screenshots/cta-banner-hidden-during-execution.png`

#### シナリオ 3: 非表示（スキル未選択）

- [ ] スキルを選択しない状態でエージェント画面を開く
- [ ] `selectedSkillName` が null / undefined の状態では CTA バナーが表示されないことを確認
- [ ] スクリーンショット取得: `outputs/phase-11/screenshots/cta-banner-hidden-no-skill.png`

### Task 2: CTA バナー → SkillAnalysisView 遷移確認

- [ ] CTA バナーをクリックする
- [ ] SkillAnalysisView に遷移することを確認
- [ ] SkillAnalysisView に正しいスキル情報が表示されていることを確認
- [ ] スクリーンショット取得: `outputs/phase-11/screenshots/skill-analysis-view.png`

### Task 3: 戻り導線確認（onNavigateBack）

- [ ] SkillAnalysisView で「戻る」ボタンをクリックする
- [ ] AgentView に戻ることを確認
- [ ] 戻った後の AgentView の状態が遷移前と同じであることを確認
- [ ] スクリーンショット取得: `outputs/phase-11/screenshots/navigate-back-result.png`

### Task 4: エージェントへ進む導線確認（onNavigateToAgent）

- [ ] SkillAnalysisView で「エージェントで開く」等のボタンをクリックする
- [ ] AgentView（またはエージェント実行画面）に遷移することを確認
- [ ] 遷移先で前回のスキルが選択状態になっていることを確認
- [ ] スクリーンショット取得: `outputs/phase-11/screenshots/navigate-to-agent-result.png`

### Task 5: アニメーション確認

- [ ] CTA バナーが表示される際にアニメーションが正しく動作することを目視確認
- [ ] アニメーション速度が 200〜300ms の範囲内に見えるか（Apple HIG 準拠）
- [ ] アニメーションが途中でカクつかないことを確認

### Task 6: アクセシビリティ確認

- [ ] Tab キーで CTA バナーにフォーカスが当たることを確認
- [ ] Enter キーで CTA バナーをクリック（遷移）できることを確認
- [ ] スクリーンリーダー用 ARIA ラベルが正しく読み上げられることを確認（VoiceOver on macOS）

### Task 7: レスポンシブ確認

- [ ] ウィンドウ幅を最小化した場合に CTA バナーが正しくレイアウトされることを確認
- [ ] ウィンドウ幅を最大化した場合も正しいことを確認

### Task 8: ライト/ダークモード確認

- [ ] macOS のシステム設定でライトモードに切り替えて表示を確認
- [ ] macOS のシステム設定でダークモードに切り替えて表示を確認
- [ ] 両モードで Apple HIG カラーが正しく適用されていることを確認
- [ ] スクリーンショット取得: `outputs/phase-11/screenshots/dark-mode.png`

## 参照資料

- Phase 10 レビュー結果: `outputs/phase-10/review-result.md`
- アーキテクチャルール: `.claude/rules/01-architecture.md`（Apple HIG、アクセシビリティ）
- known-pitfalls: `.claude/rules/06-known-pitfalls.md`（P53）

## 実行手順

1. アプリを `pnpm dev` で起動
2. 各シナリオを順番に実行
3. スクリーンショットを `outputs/phase-11/screenshots/` に保存
4. 問題があれば `outputs/phase-11/issues.md` に記録
5. 全シナリオ PASS → Phase 12 へ

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

```
outputs/phase-11/
  manual-test-result.md       # 手動テスト結果サマリー
  screenshots/                # スクリーンショット一覧
    cta-banner-visible.png
    cta-banner-hidden-during-execution.png
    cta-banner-hidden-no-skill.png
    skill-analysis-view.png
    navigate-back-result.png
    navigate-to-agent-result.png
    dark-mode.png
  issues.md                   # 発見した問題（0件でも作成）
```

## 完了条件

- [ ] 全シナリオが PASS
- [ ] スクリーンショットが全て保存済み
- [ ] アニメーションが正常動作
- [ ] アクセシビリティが確認済み
- [ ] ライト/ダーク両モードで表示が正常
- [ ] **本Phase内の全タスクを100%実行完了**

## 次 Phase

→ Phase 12: ドキュメント
