# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001              |
| 機能名   | skillcenter-create-route                           |
| Phase    | 11                                                 |
| 作成日   | 2026-03-17                                         |
| 依存     | Phase 10（最終レビュー PASS または MINOR）の成果物 |

## 目的

Electron アプリを実際に起動し、UI 上で CTA の表示・スタイル・遷移動作を視覚的に確認する。スクリーンショットで証跡を残す。

## 参照資料

- `phase-1-requirements.md` — AC-1〜AC-7
- `.claude/rules/01-architecture.md` — Apple HIG（ライト/ダークモード）

## 事前準備

```bash
# Electron アプリを開発モードで起動
pnpm --filter @repo/desktop dev
```

CLI 環境でスクリーンショットが取得できない場合は Playwright を使用する（P53 対策）:

```bash
cd apps/desktop && pnpm playwright test --headed e2e/skill-center-create-cta.spec.ts
```

## 実行タスク

### Task 1: ヘッダー CTA の表示確認（ライトモード）

1. Electron アプリを起動し、SkillCenter 画面を開く
2. ヘッダー右端に「+ 新しいツールを作る」ボタンが表示されていることを確認する
3. ボタンの背景色が Apple HIG systemBlue（`#007AFF`）であることを確認する
4. スクリーンショットを取得する

成果物: `outputs/phase-11/screenshot-01-header-cta-light.png`

### Task 2: ヘッダー CTA の表示確認（ダークモード）

1. システム設定をダークモードに切り替える
2. SkillCenter 画面のヘッダー CTA が ダーク systemBlue（`#0A84FF`）に切り替わっていることを確認する
3. テキストが読みやすい白色であることを確認する
4. スクリーンショットを取得する

成果物: `outputs/phase-11/screenshot-02-header-cta-dark.png`

### Task 3: JourneyPanel CTA ボタンの表示確認

1. SkillCenter 画面内の JourneyPanel を確認する
2. 各ステップカードに CTA ボタンが表示されていることを確認する
3. ボタンのスペーシングが 8px グリッドに準拠していることを目視確認する
4. スクリーンショットを取得する

成果物: `outputs/phase-11/screenshot-03-journey-panel-cta.png`

### Task 4: モバイル相当の幅での表示確認

1. DevTools で幅 375px（iPhone SE 相当）に変更する
2. ヘッダー CTA がレイアウト崩れなく表示されることを確認する
3. JourneyPanel CTA が適切に表示されることを確認する
4. スクリーンショットを取得する

成果物: `outputs/phase-11/screenshot-04-mobile-375px.png`

### Task 5: ヘッダー CTA クリック遷移の確認

1. ヘッダーの「+ 新しいツールを作る」ボタンをクリックする
2. `/skill-center/create` ルート（またはスキル作成画面）に遷移することを確認する
3. ブラウザ履歴（戻るボタン）が正常に機能することを確認する
4. スクリーンショットを取得する（遷移後の画面）

成果物: `outputs/phase-11/screenshot-05-after-cta-click.png`

### Task 6: JourneyPanel CTA クリック遷移の確認

1. JourneyPanel のステップカード CTA ボタンをクリックする
2. 対応するルートへ遷移することを確認する
3. スクリーンショットを取得する

成果物: `outputs/phase-11/screenshot-06-journey-cta-click.png`

### Task 7: キーボード操作確認

1. Tab キーでヘッダー CTA にフォーカスを移動できることを確認する
2. フォーカスリングが表示されることを確認する（`focus-visible` スタイル）
3. Enter キーでクリックと同等の遷移が発生することを確認する
4. スクリーンショットを取得する（フォーカス状態）

成果物: `outputs/phase-11/screenshot-07-keyboard-focus.png`

### Task 8: 手動テスト結果サマリー作成

`outputs/phase-11/manual-test-report.md` に以下を記録する:

- 各 Task の結果（PASS / FAIL / スキップ）
- FAIL の場合: 画面の状態と再現手順
- スクリーンショット取得方法（Playwright 使用の場合はそのログ）

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

- `outputs/phase-11/screenshot-01-header-cta-light.png`
- `outputs/phase-11/screenshot-02-header-cta-dark.png`
- `outputs/phase-11/screenshot-03-journey-panel-cta.png`
- `outputs/phase-11/screenshot-04-mobile-375px.png`
- `outputs/phase-11/screenshot-05-after-cta-click.png`
- `outputs/phase-11/screenshot-06-journey-cta-click.png`
- `outputs/phase-11/screenshot-07-keyboard-focus.png`
- `outputs/phase-11/manual-test-report.md`

## 完了条件

- [ ] ヘッダー CTA がライトモードで正しく表示されている（スクリーンショット証跡あり）
- [ ] ヘッダー CTA がダークモードで正しく表示されている（スクリーンショット証跡あり）
- [ ] JourneyPanel CTA ボタンが正しく表示されている（スクリーンショット証跡あり）
- [ ] モバイル幅（375px）でレイアウト崩れがない（スクリーンショット証跡あり）
- [ ] ヘッダー CTA クリックで正しいルートに遷移する（スクリーンショット証跡あり）
- [ ] JourneyPanel CTA クリックで正しいルートに遷移する（スクリーンショット証跡あり）
- [ ] キーボード操作で CTA に到達しクリック可能（スクリーンショット証跡あり）
- [ ] `outputs/phase-11/manual-test-report.md` に全 Task PASS が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 12: ドキュメント
