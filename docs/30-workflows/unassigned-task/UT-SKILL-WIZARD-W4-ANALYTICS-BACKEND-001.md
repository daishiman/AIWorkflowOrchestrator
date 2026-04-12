# UT-SKILL-WIZARD-W4-ANALYTICS-BACKEND-001

## メタ情報

| 項目       | 値                                                                             |
| ---------- | ------------------------------------------------------------------------------ |
| ステータス | 未着手                                                                         |
| 優先度     | Medium（P2）                                                                   |
| 起票日     | 2026-04-11                                                                     |
| 起票元     | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001 Phase 12（unassigned-task-detection.md） |
| 関連タスク | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001（trackEvent 計装基盤）                   |
| Issue番号  | #2091                                                                          |

## 1. なぜこのタスクが必要か（Why）

`UT-SKILL-WIZARD-W3-USAGE-TRACKING-001` では `trackEvent` を renderer-local のスタブとして実装した。
dev 環境では `console.info` にログ出力し、prod 環境では no-op となっている。

この設計は計装ポイントの安定化を優先した意図的なステップであり、
「どのイベントを計測すべきか」「どのコンポーネントが計装を担うか」の設計を先に固めることで、
analytics backend への接続と計装設計が混在する複雑さを回避した。

しかし現時点では、実際の利用傾向データを収集することができない。
スキルウィザードの使用率・ステップ完了率・離脱率・フィードバック傾向等の定量データは
製品改善の意思決定に直結するため、analytics sink への実送信が必要である。

## 2. 何を達成するか（What）

`trackEvent` の送信先を renderer-local スタブから実際の analytics backend へ接続し、
スキルウィザードの使用率データを収集可能にする。

**スコープ内:**

- `trackEvent` 関数のインターフェースを拡張し、pluggable な sink 設計に移行する
- analytics backend（IPC 経由 or 直接 HTTP）への送信実装
- dev/prod 環境での送信先切り替え機構
- 送信失敗時のフォールバック（console.info へのデグレード）
- 既存の計装ポイント（5 イベント）が破壊されないことの検証

**スコープ外:**

- 計装ポイントの追加・変更（別タスク）
- analytics dashboard の構築（別タスク）
- A/B テスト基盤（別タスク）

**成果物:**

- `apps/desktop/src/renderer/utils/trackEvent.ts` の更新（pluggable sink 設計）
- analytics backend 接続実装（IPC bridge or HTTP）
- 対応するテストケースの追加・更新

## 3. どのように実行するか（How）

1. analytics backend の種別を確認する（既存の AnalyticsStore / 外部サービス / IPC 経由 Main プロセス）
2. `trackEvent` に pluggable sink interface を導入する
3. 本番環境向け sink 実装を追加する
4. IPC bridge が必要な場合は Preload API 経由で Main プロセスへ送信する
5. 環境変数による送信先切り替えを実装する
6. フォールバック動作（送信失敗時の console.info デグレード）を実装する
7. 既存テストが維持されることを確認し、新しい sink のテストを追加する

## 3.5 苦戦箇所と解決策（前タスクからの知見）

| 苦戦箇所                                                                           | 原因                                                                                 | 解決策                                                                          |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| trackEvent を既存の AnalyticsStore / SkillAnalytics に接続しようとすると責務が混在 | 既存 Store は execution-centric 計装設計で、wizard UI 操作イベントと粒度が一致しない | renderer-local の薄い抽象として独立実装。Store との接続は本タスクで別途判断する |
| dev/prod 環境分岐のテストカバレッジ 100% 達成が困難                                | `process.env.NODE_ENV` 分岐により、両方のパスを通常のテストで網羅しにくい            | `process.env.NODE_ENV` を jest で mock し、dev / prod ケースを分離テスト        |

**将来への知見:**

- pluggable sink 設計（sink interface + 実装差し替え）にしておくと、将来の analytics backend 変更時の影響範囲が testable な形で閉じる
- 計装ポイントが安定した後に sink 接続を別タスクとする分割方針は正しく、同様のパターンは他の計装実装でも採用すること

## 4. 実行手順

1. 既存の analytics 関連実装を調査する（AnalyticsStore, SkillAnalytics, IPC channel 有無）
2. `trackEvent` の sink interface を定義する（`AnalyticsSink` 型）
3. 本番向け sink 実装を追加する（IPC / HTTP を選択）
4. `trackEvent.ts` を pluggable 設計に更新する
5. 環境変数 / 設定による sink 切り替えを実装する
6. 失敗時フォールバック（console.info デグレード）を実装する
7. テストを更新・追加する（sink mock での単体テスト）
8. 手動テストで 5 イベントが実際に送信されることを確認する

## 5. 完了条件チェックリスト

- [ ] `trackEvent` が pluggable sink 設計に移行している
- [ ] prod 環境で analytics backend に送信されることが確認できる
- [ ] 送信失敗時に console.info へフォールバックする
- [ ] 既存の 5 イベント計装ポイントが破壊されていない（既存テスト全 pass）
- [ ] 新しい sink 実装のテストが追加されている
- [ ] `pnpm lint` / `pnpm typecheck` が通る

## 6. 検証方法

```bash
# 既存テストが通ることを確認
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/trackEvent.test.ts
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx

# 型チェック
pnpm --filter @repo/desktop typecheck
```

## 7. リスクと対策

| リスク                                           | 影響度 | 対策                                                            |
| ------------------------------------------------ | ------ | --------------------------------------------------------------- |
| analytics backend の仕様が未定のまま実装を進める | High   | Phase 1 要件定義で送信先 backend を確定させてから実装に入る     |
| IPC bridge 追加が必要な場合の設計コスト増        | Medium | renderer-local HTTP での直接送信を初期選択肢に含める            |
| 既存計装ポイントとの互換性破壊                   | Medium | sink interface 導入時は既存テストを先に読んで影響範囲を確認する |

## 8. 参照情報

- `apps/desktop/src/renderer/utils/trackEvent.ts`
- `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`
- `docs/30-workflows/completed-tasks/UT-SKILL-WIZARD-W3-USAGE-TRACKING-001/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/UT-SKILL-WIZARD-W3-USAGE-TRACKING-001/outputs/phase-12/skill-feedback-report.md`
- 関連 lessons-learned: `.claude/skills/aiworkflow-requirements/references/lessons-learned-w3-usage-tracking-2026-04.md`

## 9. 備考

本タスクは `UT-SKILL-WIZARD-W3-USAGE-TRACKING-001` の Phase 12 未タスク検出（`unassigned-task-detection.md`）で P2 として起票が決定されたもの。

計装設計（どのイベントを計測するか、どのコンポーネントが担うか）は前タスクで完了済み。
本タスクでは既存の計装ポイントを維持したまま、送信先を実際の analytics backend に接続することに集中する。
