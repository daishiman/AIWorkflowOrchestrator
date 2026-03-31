# UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001: Session Resume Renderer 統合の Phase 11 screenshot evidence 取得

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| ステータス | 未着手                                             |
| 優先度     | High                                               |
| 起票日     | 2026-03-30                                         |
| 起票元     | TASK-P0-08 Phase 12 / unassigned-task-detection.md |
| 関連タスク | TASK-P0-08 (session-resume-renderer-integration)   |
| Issue番号  | #1785                                              |

## 1. なぜこのタスクが必要か（Why）

TASK-P0-08（Session Resume Renderer 統合）は UI タスクであるが、Phase 11 の手動テストにおいて
representative screenshots 6 件が未取得のまま Phase 12 に進んだ。

UI タスクでは実動作の目視確認と証跡（スクリーンショット）が Phase 12 close-out の必須要件であり、
これが欠如した状態では Phase 11 の完了を正式に宣言できない。

`validate-phase11-screenshot-coverage.js` が FAIL している（representative screenshot が 0 件）のは
CLI 環境のみで実施したため Electron UI の実起動ができなかったことが直接原因。

## 2. 何を達成するか（What）

Electron アプリ上で `SessionResumePrompt` / `SessionIndicator` を実際に操作し、以下を取得・整備する：

- TC-01〜TC-06 の representative screenshots（各主要状態・テーマごと）
- 手動テスト結果（Phase 11 テストプランに基づく実行ログ）
- `manual-test-result.md` / `screenshot-coverage.md` / `phase11-capture-metadata.json` の実測値更新
- Phase 11 完了宣言（manual-test-result: passed）

### 取得対象スクリーンショット一覧

| TC ID | コンポーネント      | 状態    | テーマ | ファイル名              |
| ----- | ------------------- | ------- | ------ | ----------------------- |
| TC-01 | SessionResumePrompt | default | light  | TC-01-default-light.png |
| TC-02 | SessionResumePrompt | default | dark   | TC-02-default-dark.png  |
| TC-03 | SessionResumePrompt | data    | light  | TC-03-data-light.png    |
| TC-04 | SessionResumePrompt | hidden  | light  | TC-04-hidden-light.png  |
| TC-05 | SkillLifecyclePanel | error   | light  | TC-05-error-light.png   |
| TC-06 | SessionIndicator    | active  | light  | TC-06-active-light.png  |

## 3. どのように実行するか（How）

1. Electron アプリをローカルで起動する
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. Phase 11 テストプランを参照する
   - `docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/screenshot-plan.json`
3. 各 TC の状態を再現し、スクリーンショットを取得する
   - TC-01/02: セッション一覧が空の初期状態（light/dark 切り替え）
   - TC-03: 複数の未完了セッションが存在する状態
   - TC-04: セッションが 0 件のとき prompt が非表示になることを確認
   - TC-05: resumeSession が失敗してエラーバナーが表示される状態
   - TC-06: SessionIndicator が pulse アニメーションで表示される active 状態
4. スクリーンショットを以下に保存する
   ```
   docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/screenshots/
   ```
5. テスト結果を更新する
   ```
   docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/manual-test-result.md
   ```
6. coverage / metadata を実測値に更新する
   ```
   docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/screenshot-coverage.md
   docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/phase11-capture-metadata.json
   ```
7. `artifacts.json` を更新する
   ```json
   "11": { "status": "completed", ... }
   ```

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                     | 原因                                                                                   | 解決策                                                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| CLI 環境での UI 証跡取得の不可               | Electron のレンダラーは実際に起動しないと描画されず、CLI だけでは視覚的確認が不可能    | `pnpm --filter @repo/desktop dev` でデスクトップアプリを起動し、実環境で手動操作して取得する             |
| 複数セッション状態の再現                     | テスト用の checkpoint データを直接 storage に注入しないと複数セッション状態が作れない  | `SkillCreatorWorkflowSessionRepository` の storage に fixture checkpoint を直接書き込んでから起動する    |
| SessionIndicator の pulse アニメーション取得 | タイミングによってアニメーション状態が静止画では伝わりにくい                           | GIF や動画キャプチャか、アニメーション中のフレームを複数枚取得する                                       |
| compatibility badge の色差分                 | `var(--status-warning)` 等の CSS 変数はテーマ切り替えで異なるため、dark で再撮影が必要 | light/dark 両テーマでの badge 色を TC-01/TC-02 で必ず両方取得する                                        |
| Phase 12 進行後の Phase 11 gap               | completion-report.md が存在するだけで完了と誤判定され、screenshot 未取得が見落とされた | `artifacts.json` の Phase 単位ステータスを常に確認し、`in_progress` があれば Phase 12 進行をブロックする |

## 4. 実行手順

1. ローカルの Electron アプリを起動する
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. Phase 11 テストプランを確認する
   ```bash
   cat docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/screenshot-plan.json
   ```
3. TC-01 から TC-06 を順番に実施し、各状態のスクリーンショットを取得する
4. 取得した PNG を `outputs/phase-11/screenshots/` に格納する
5. `manual-test-result.md` に各 TC の pass/fail と証跡ファイル名を記録する
6. `screenshot-coverage.md` と `phase11-capture-metadata.json` を実測値に更新する
7. `artifacts.json` の Phase 11 ステータスを `completed` に更新する

## 5. 完了条件チェックリスト

- [ ] Electron アプリで `SessionResumePrompt` / `SessionIndicator` が正常に動作することを目視確認
- [ ] `outputs/phase-11/screenshots/` に TC-01〜TC-06 の PNG が存在する（計 6 件）
- [ ] `manual-test-result.md` に各 TC の実測結果と証跡ファイル名が記録されている
- [ ] `screenshot-coverage.md` が実測値に更新されている
- [ ] `phase11-capture-metadata.json` が実測値に更新されている
- [ ] `artifacts.json` の Phase 11 が `completed` に更新されている
- [ ] `validate-phase11-screenshot-coverage.js` が PASS する

## 6. 検証方法

```bash
# artifacts.json 確認
cat docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/artifacts.json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['phases']['11'])"
# → "completed" であること

# screenshots ディレクトリ確認
ls docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/screenshots/
# → TC-01-default-light.png 〜 TC-06-active-light.png が存在すること

# coverage スクリプト実行
node docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration
# → PASS であること
```

## 7. リスクと対策

- リスク: Electron アプリのビルドが壊れていて UI が起動できない
  - 対策: `pnpm --filter @repo/desktop build` を先に実行してエラーを確認する
- リスク: macOS の「画面収録」権限エラーでスクリーンショットが取得できない
  - 対策: システム環境設定 > プライバシーとセキュリティ > 画面収録 でターミナル/Electron に権限を付与する
- リスク: 複数セッション状態の再現が困難
  - 対策: `SkillCreatorWorkflowSessionRepository` の storage に直接 fixture データを注入する

## 8. 参照情報

- `docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/screenshot-plan.json`
- `docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration/outputs/phase-11/screenshot-coverage.md`
- `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx`
- `apps/desktop/src/renderer/components/skill/SessionIndicator.tsx`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

## 9. 備考

本タスクは UI の目視確認系（High）。representative screenshots が揃うまで TASK-P0-08 の Phase 11 close-out は達成不可。
Phase 12 ドキュメントは先行して完了しているが、Phase 11 が `in_progress` のままでは formal な完了宣言ができない。
