# UT-UIUX-PLAYWRIGHT-E2E-COMPLETE-001

```yaml
issue_number: 1797
task_id: UT-UIUX-PLAYWRIGHT-E2E-COMPLETE-001
task_name: Playwright E2E テスト骨格の実装完成（UI/UX 3層評価 Layer1/2）
category: 改善
target_feature: evaluate-ui-ux-playwright-e2e.ts
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UIUX-FEEDBACK-001 Phase 5
created_date: 2026-03-31
dependencies: []
```

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| ステータス | 未着手                                            |
| 優先度     | Medium                                            |
| 起票日     | 2026-03-31                                        |
| 起票元     | TASK-UIUX-FEEDBACK-001 Phase 5 / ブランチ状況分析 |
| 関連タスク | TASK-UIUX-FEEDBACK-001, TASK-RT-05                |
| Issue番号  | #TBD                                              |

## 1. なぜこのタスクが必要か（Why）

TASK-UIUX-FEEDBACK-001 の Phase 5 実装で作成された `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` は、関数定義・型定義のみのスケルトン状態で存在している。
Layer 1 Semantic テスト（SEM-001〜007）および Layer 2 Visual regression テスト（VIS-001〜007）の実測ロジックが未実装のため、UI/UX品質の定量的な evidence を自動取得できない状況にある。
このままでは TASK-UIUX-FEEDBACK-001 の品質目標（ARIA属性・キーボードナビゲーション・視覚的一貫性）を継続的に検証する手段がなく、リグレッションが発生しても検知できないリスクがある。

## 2. 何を達成するか（What）

以下のスケルトン関数に実際のロジックを実装し、テストスイートを完全稼働状態にする：

- `launchElectronApp()` 関数（行 175-185）: `_electron` API を用いた Electron アプリの実際の起動ロジック
- Layer 1 Semantic テスト（SEM-001〜007）: ARIA属性検証・キーボードナビゲーション・tabindex の実測テスト
- Layer 2 Visual regression テスト（VIS-001〜007）: スナップショット baseline 生成と比較ロジック
- `runAllTests()` のテストオーケストレーション実装

## 3. どのように実行するか（How）

1. `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` の現状スケルトン箇所を洗い出す
2. Playwright `_electron` API を使用した `launchElectronApp()` を実装する
   - `NODE_ENV=test` / `ELECTRON_IS_TEST=1` 環境変数付きで起動
   - sandbox-aware window bridge は使用しない
3. SEM-001〜007 の Semantic テストを実装する
   - ARIA属性（`role`, `aria-label`, `aria-describedby`）の検証
   - `Tab` / `Shift+Tab` キーボードナビゲーションの実測
   - tabindex 順序の検証
4. VIS-001〜007 の Visual regression テストを実装する
   - `--update-snapshots` フラグで baseline 画像を生成
   - スナップショット比較の閾値設定
5. `runAllTests()` のオーケストレーションロジックを実装する
6. `pnpm --filter @repo/desktop test:e2e` でテストスイートが起動することを確認する
7. CI環境での `--update-snapshots` 初回実行手順をドキュメント化する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                          | 原因                                                                                                                               | 解決策                                                                                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Playwright + Electron 連携                        | `_electron` API は通常の Playwright browser context と異なるため、window bridge の扱いが異なる                                     | `NODE_ENV=test` / `ELECTRON_IS_TEST=1` を設定した上で `_electron.launch()` を使用し、sandbox-aware window bridge は経由しない        |
| Visual テスト初回実行時の baseline 生成           | CI環境では baseline 画像が存在しないため、初回実行時に比較対象がなくテストが失敗する                                               | 初回は `--update-snapshots` フラグを付けて実行し、生成した baseline 画像をリポジトリにコミットする手順を README に明記する           |
| sandbox 環境での `ANTHROPIC_API_KEY` アクセス失敗 | preload context 経由で `ANTHROPIC_API_KEY` を参照する場合、sandbox モード下では `process.env` へのアクセスが制限される可能性がある | テスト起動時に `ANTHROPIC_API_KEY=dummy` をダミー値で設定し、API 呼び出しが実際に発生しないよう LLM 呼び出しをモックまたは skip する |
| テスト環境での Electron ウィンドウ安定待機        | `launchElectronApp()` 後にウィンドウが完全にレンダリングされる前にテストが開始されるとフレーク発生リスクがある                     | `waitForEvent('window')` と `waitForLoadState('domcontentloaded')` を組み合わせて、ウィンドウ準備完了を確認してからテストを開始する  |

## 4. 実行手順

1. 現状の `evaluate-ui-ux-playwright-e2e.ts` のスケルトン箇所を確認する
   ```bash
   # スケルトン関数の一覧確認
   grep -n "TODO\|throw new Error\|// stub" \
     .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts
   ```
2. `launchElectronApp()` を実装する（行 175-185）
   ```typescript
   // NODE_ENV=test / ELECTRON_IS_TEST=1 付きで起動
   const electronApp = await _electron.launch({
     args: ["dist/main/index.js"],
     env: { ...process.env, NODE_ENV: "test", ELECTRON_IS_TEST: "1" },
   });
   ```
3. SEM-001〜007 の Semantic テストを実装する
   - 各テストで `page.locator('[role="..."]')` を用いた ARIA属性検証を追加
   - `page.keyboard.press('Tab')` で tabindex 順序を実測
4. VIS-001〜007 の Visual regression テストを実装する
   - `expect(page).toHaveScreenshot('sem-xxx-baseline.png')` で比較
   - `playwright.config.ts` に `threshold: 0.1` 等の閾値を設定
5. `runAllTests()` のオーケストレーションを実装する
6. baseline 画像を初回生成する
   ```bash
   pnpm --filter @repo/desktop test:e2e -- --update-snapshots --project=ui-ux-layer2
   ```
7. CI 環境用の初回実行手順をドキュメント化する
   - `docs/` または `apps/desktop/e2e/README.md` に手順を追記

## 5. 完了条件チェックリスト

- [ ] `launchElectronApp()` 関数が実装されており、実際に Electron アプリを起動できる
- [ ] SEM-001〜007 の全テストが実行可能で、実測 evidence（pass/fail ログ）が取得できる
- [ ] VIS-001〜007 のスナップショット baseline 画像が生成されており、比較テストが動作する
- [ ] `pnpm --filter @repo/desktop test:e2e -- --project=ui-ux-layer1` が完走する
- [ ] `pnpm --filter @repo/desktop test:e2e -- --project=ui-ux-layer2` が完走する
- [ ] CI環境での `--update-snapshots` 初回実行手順がドキュメント化されている
- [ ] `ANTHROPIC_API_KEY` 未設定環境でもテストが正常に完走する（モック/ダミー対応済み）

## 6. 検証方法

```bash
# Layer 1 Semantic テスト実行
pnpm --filter @repo/desktop test:e2e -- --project=ui-ux-layer1

# Layer 2 Visual regression テスト実行
pnpm --filter @repo/desktop test:e2e -- --project=ui-ux-layer2

# baseline 画像の初回生成（CI初回セットアップ時）
pnpm --filter @repo/desktop test:e2e -- --update-snapshots --project=ui-ux-layer2

# スケルトン残存チェック（TODO/stub が残っていないことを確認）
grep -n "TODO\|throw new Error.*not implemented" \
  .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts
```

## 7. リスクと対策

- リスク: `_electron` API の使用方法が Playwright バージョンによって異なり、既存の設定と衝突する
  - 対策: `apps/desktop/package.json` の `@playwright/test` バージョンを確認し、公式ドキュメントの該当バージョンの API を参照する
- リスク: Visual regression テストの baseline 画像が OS・解像度・フォント環境によって差異が生じ、CI で常に失敗する
  - 対策: `playwright.config.ts` の `threshold` を適切に設定し、必要に応じて Docker ベースの固定環境で baseline を生成する
- リスク: Electron アプリの起動に時間がかかり、テストがタイムアウトする
  - 対策: `playwright.config.ts` の `timeout` を延長し、`launchElectronApp()` 内で `waitForEvent('window')` を使ってウィンドウ準備完了を待機する
- リスク: sandbox 環境での API key 問題が他の IPC ハンドラにも影響し、テスト範囲が想定より広がる
  - 対策: テスト対象を UI/UX レイヤーに限定し、LLM 呼び出しが発生するパスはモックアウトする方針を明確化する

## 8. 参照情報

- `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`
- `.agents/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`
- `apps/desktop/playwright.config.ts`（存在する場合）
- `apps/desktop/e2e/` ディレクトリ（既存 E2E テストの実装パターン参照）
- [Playwright Electron 公式ドキュメント](https://playwright.dev/docs/api/class-electronapplication)
- `TASK-UIUX-FEEDBACK-001` の Phase 5 実装ログ

## 9. 備考

本タスクは TASK-UIUX-FEEDBACK-001 の Phase 5 で未完了となったテスト実装の続きであり、独立して着手可能。
TASK-RT-05 との直接的な依存はないが、RT-05 の実装で影響を受ける UI コンポーネントがある場合は SEM/VIS テストの対象範囲に含めること。
Visual regression テストの baseline 画像はリポジトリにコミットし、差分レビューを PR のチェックリストに組み込む運用を推奨する。
`--update-snapshots` の実行は意図的な UI 変更時のみ行い、意図しない視覚的リグレッションを検知できる状態を維持すること。
