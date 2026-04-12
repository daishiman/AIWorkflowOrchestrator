# Phase 1: 受け入れ基準（Acceptance Criteria）

## タスクID: UT-W3-ANALYTICS-ADAPTER-001

| AC   | 内容                                                                                             | 検証方法                                  | 検証コマンド                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| AC-1 | 本番環境（`NODE_ENV=production`）で `trackEvent` が analytics sink にイベントを送信できる        | Main プロセスのログでイベント受信確認     | `NODE_ENV=production` でアプリ起動し開発ツールで確認                                                            |
| AC-2 | 選定した analytics provider への接続が CSP 制限に抵触しない                                      | DevTools コンソールにCSPエラーなし        | Electron DevTools → Console タブ確認                                                                            |
| AC-3 | オフライン時にイベントがキューに保持され、オンライン復帰後に送信される                           | キューへの蓄積とドレイン動作確認          | ネットワーク断→イベント発火→接続回復→ログ確認                                                                   |
| AC-4 | ユーザーのオプトアウト設定が有効な場合、`trackEvent` がイベントを送信しない                      | オプトアウト後のイベント送信なし確認      | Store に `analyticsOptOut: true` 設定後確認                                                                     |
| AC-5 | `trackEvent.ts` の公開 API シグネチャ（`trackEvent<K>(eventName, payload): void`）が変更されない | TypeScript 型チェック・既存テスト回帰なし | `pnpm --filter @repo/desktop typecheck`                                                                         |
| AC-6 | `SkillCreateWizard.tsx` の計装ポイントへの変更が不要（または最小）である                         | git diff 確認・既存計装テスト回帰なし     | `git diff apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                     |
| AC-7 | analytics adapter のユニットテストカバレッジが 90% 以上である                                    | カバレッジレポート確認                    | `pnpm --filter @repo/desktop test:coverage`                                                                     |
| AC-8 | `pnpm typecheck` / `pnpm lint` / `pnpm test` が全て PASS する                                    | CI相当コマンド全通過                      | `pnpm --filter @repo/desktop typecheck && pnpm --filter @repo/desktop lint && pnpm --filter @repo/desktop test` |
| AC-9 | analytics provider 初期化失敗時に `trackEvent` が no-op にフォールバックする                     | 初期化失敗シミュレーションテスト          | `analyticsAdapter.test.ts` の初期化失敗テスト                                                                   |

---

_生成日: 2026-04-11 / Phase 1 完了_
