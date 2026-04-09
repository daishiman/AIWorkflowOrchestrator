# trackEvent analytics adapter差し替え（本番分析基盤への接続）- タスク指示書

## メタ情報

```yaml
issue_number: 2058
```

## メタ情報

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-W3-ANALYTICS-ADAPTER-001                                                       |
| タスク名     | trackEvent analytics adapter差し替え（本番分析基盤への接続）                      |
| 分類         | 実装                                                                              |
| 対象機能     | renderer-local analytics stub → 本番 analytics sink 接続                          |
| 優先度       | 中                                                                                |
| 見積もり規模 | 中規模                                                                            |
| ステータス   | 未実施                                                                            |
| 発見元       | W3-seq-04（usage tracking）Phase 12 unassigned-task-detection.md の将来潜在タスク |
| 発見日       | 2026-04-08                                                                        |
| タスク分類   | NON_VISUAL（renderer 内部の adapter 差し替えのみ / 視覚差分なし）                 |
| 参照レーン   | `docs/30-workflows/W3-seq-04-usage-tracking/`                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

W3-seq-04 で実装した `trackEvent` は renderer-local の no-op / `console.info` スタブである。
開発環境では `[trackEvent]` プレフィックスのコンソール出力が行われるが、本番環境
（`NODE_ENV=production`）では何も行われず、イベントデータはどこにも送信されない。

実装ガイド（W3-seq-04 Phase 12）の「将来の sink 差し替え」セクションには、以下のように
明記されている：

> 現在は `console.info` のみの no-op スタブ。将来の分析基盤接続時は `trackEvent.ts` の
> 実装のみ変更すればよく、呼び出し側（`SkillCreateWizard.tsx`）の変更は不要。

また `apps/desktop/src/renderer/utils/trackEvent.ts` の L44 付近には以下の TODO コメントが
存在する：

```typescript
// 将来: execution-centric 基盤とは独立した sink に差し替える
```

本タスクは、この stub を実際の analytics sink（Amplitude / Mixpanel / PostHog 等）への
接続に差し替え、W3-seq-04 で構築した計装を本番で活用可能にする実装タスクである。

### 1.2 問題点・課題

- 本番環境で `skill_wizard_started` / `skill_wizard_step1_completed` 等のイベントが
  一切収集されておらず、ウィザード改善の効果測定ができない
- analytics provider が未選定（Amplitude / Mixpanel / PostHog / IPC 経由カスタム等）
- Electron Renderer からの外部 API 直接呼び出しは CSP（Content Security Policy）制限に
  抵触する可能性がある
- オフライン時のイベントキューイング設計が存在しない
- ユーザーのプライバシー設定（オプトイン/アウト）との連動が未実装

### 1.3 放置した場合の影響

- W3-seq-04 で計装した 5 計装ポイントのデータが本番で永遠に収集されない
- ウィザード設計の改善根拠となるデータが蓄積されず、次のイテレーションが主観的判断に
  なる
- CSP 対策なしに将来 analytics を接続しようとした場合、本番クラッシュのリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`apps/desktop/src/renderer/utils/trackEvent.ts` の sink 部分を実際の analytics adapter に
差し替え、本番環境で `SkillWizardEvents` のイベントデータを外部分析基盤へ送信できる
状態にする。呼び出し側（`SkillCreateWizard.tsx`）の変更は最小化または不要とする。

### 2.2 受入条件（AC）

| AC   | 内容                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------- |
| AC-1 | 本番環境（`NODE_ENV=production`）で `trackEvent` が analytics sink に対してイベントを送信できる   |
| AC-2 | 選定した analytics provider への接続が CSP 制限に抵触しない（Electron の webSecurity 設定と整合） |
| AC-3 | オフライン時にイベントがキューに保持され、オンライン復帰後に送信される                            |
| AC-4 | ユーザーのオプトアウト設定が有効な場合、`trackEvent` がイベントを送信しない                       |
| AC-5 | `trackEvent.ts` の公開 API シグネチャ（`trackEvent<K>(eventName, payload): void`）が変更されない  |
| AC-6 | `SkillCreateWizard.tsx` の計装ポイントへの変更が不要（または最小）である                          |
| AC-7 | analytics adapter のユニットテストカバレッジが 90% 以上である                                     |
| AC-8 | `pnpm typecheck` / `pnpm lint` / `pnpm test` が全て PASS する                                     |
| AC-9 | analytics provider の初期化失敗時に `trackEvent` がエラーをスローせず no-op にフォールバックする  |

### 2.3 スコープ

含むもの:

- analytics provider の選定（Amplitude / Mixpanel / PostHog / IPC 経由カスタム等）
- `apps/desktop/src/renderer/utils/trackEvent.ts` の sink 実装差し替え
- analytics adapter モジュール（`apps/desktop/src/renderer/utils/analyticsAdapter.ts` 等）の新規作成
- オフライン時イベントキューイングの設計・実装
- ユーザーのプライバシー設定（オプトイン/アウト）との連動実装
- CSP 設定の確認・更新（Electron の `webSecurity` / `Content-Security-Policy` ヘッダ）
- analytics adapter のユニットテスト作成
- IPC 経由アプローチを選択する場合の Main プロセス側ハンドラ実装

含まないもの:

- `SkillWizardEvents` 型定義の変更（W3-seq-04 完了済み）
- analytics ダッシュボード UI や集計機能
- `SkillAnalytics` / `AnalyticsStore`（execution-centric 既存基盤）との統合

### 2.4 analytics provider 選択肢

| 方式                       | 特徴                                   | CSP 対策                          |
| -------------------------- | -------------------------------------- | --------------------------------- |
| Amplitude SDK              | 広く使われる。Electron SDK あり        | preload / IPC 経由で呼び出す      |
| Mixpanel SDK               | 柔軟なプロパティ管理                   | preload / IPC 経由で呼び出す      |
| PostHog SDK                | OSS / セルフホスト可                   | preload / IPC 経由で呼び出す      |
| IPC 経由カスタム           | 外部依存なし・Main プロセスで制御      | CSP 問題なし・Main から HTTP 送信 |
| ElectronStore + 定期バッチ | 完全オフライン対応・プライバシー最優先 | CSP 問題なし・ローカル保存のみ    |

### 2.5 成果物

| 種別      | ファイルパス                                                                  |
| --------- | ----------------------------------------------------------------------------- |
| 修正      | `apps/desktop/src/renderer/utils/trackEvent.ts`                               |
| 新規      | `apps/desktop/src/renderer/utils/analyticsAdapter.ts`（または相当モジュール） |
| 新規      | `apps/desktop/src/renderer/utils/__tests__/analyticsAdapter.test.ts`          |
| 新規/修正 | IPC 経由アプローチの場合: `apps/desktop/src/main/ipc/analyticsHandler.ts`     |
| 修正      | CSP 設定ファイル（`apps/desktop/src/main/` 配下の Electron 設定）             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- **ブロッカー**: W3-seq-04（`trackEvent` 実装・5 計装ポイント）が完了していること（完了済み）
- analytics provider の選定が完了していること（Phase 1 で実施）
- Electron の CSP 設定ファイルの場所が特定されていること

### 3.2 依存タスク

| タスク ID                            | 状態   | 内容                                                          |
| ------------------------------------ | ------ | ------------------------------------------------------------- |
| W3-seq-04（UT-SKILL-WIZARD-W3）      | 完了   | `trackEvent` stub 実装・5 計装ポイント                        |
| IPC チャネル定義（プロジェクト全体） | 確認要 | IPC 経由アプローチを選択した場合、既存 IPC 構造との整合が必要 |

依存グラフ:

```
W3-seq-04（完了）→ UT-W3-ANALYTICS-ADAPTER-001（本タスク）
```

### 3.3 推奨アプローチ

1. `trackEvent.ts` の現状スタブと L44 付近の TODO コメントを確認する
2. CSP 設定ファイルを調査し、外部 URL への通信が許可されているか確認する
3. analytics provider を選定し、Electron Renderer からの呼び出し方式（直接 / IPC 経由）を決定する
4. `analyticsAdapter.ts` を作成し、`trackEvent.ts` から内部の sink として呼び出す設計にする
5. オフライン時のキューイング設計を実装する（ElectronStore または in-memory queue）
6. ユーザーのオプトアウト設定を参照する API を確認し、`analyticsAdapter` に統合する
7. TDD: adapter のユニットテストを先に作成し（Red）、実装で Green にする
8. CSP 設定を更新し、Electron セキュリティポリシーとの整合を確認する

---

## 4. 実行手順（Phase 1-13 の概要）

詳細は `docs/30-workflows/W3-seq-04-usage-tracking/` の実装ガイドと
`task-specification-creator` スキルの Phase テンプレートを正とし、ここでは要点のみ記述する。

| Phase | 名称             | 主な作業（要点）                                                                                                                                                                                        |
| ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義         | CSP 設定調査、analytics provider 選定（Amplitude / Mixpanel / PostHog / IPC カスタム）、オフラインキュー要件確認、プライバシー設定 API 調査、AC-1〜AC-9 固定                                            |
| 2     | 設計             | `analyticsAdapter.ts` インターフェース設計、sink 差し替えパターン確定、オフラインキュー設計、オプトアウト連動設計、IPC チャネル設計（IPC 経由の場合）                                                   |
| 3     | 設計レビュー     | CSP 整合性確認、既存 `trackEvent` 公開 API への影響確認（Breaking Change なし）、フォールバック設計確認、Phase 4 進行可否判定                                                                           |
| 4     | テスト作成       | TDD Red: `analyticsAdapter.test.ts` 作成（初期化・送信・オフライン時キュー・オプトアウト・フォールバック）                                                                                              |
| 5     | 実装             | `analyticsAdapter.ts` 作成、`trackEvent.ts` の sink 差し替え、オフラインキュー実装、オプトアウト連動実装、IPC ハンドラ実装（IPC 経由の場合）                                                            |
| 6     | テスト拡充       | ネットワーク障害シミュレーション・キュードレイン・初期化失敗フォールバック・複数イベントバッチ送信のテスト追加                                                                                          |
| 7     | カバレッジ確認   | `analyticsAdapter.ts` 90% 以上、`trackEvent.ts` 100%、IPC ハンドラ 90% 以上の達成確認                                                                                                                   |
| 8     | リファクタリング | adapter コードの重複除去・命名揺れ修正・フォールバック処理の統一（`対象/Before/After/理由` テーブル形式で記録）                                                                                         |
| 9     | 品質保証         | `pnpm typecheck` / `pnpm lint` / `pnpm test` の全通過確認、CSP 設定の E2E 動作確認                                                                                                                      |
| 10    | 最終レビュー     | AC-1〜AC-9 の充足確認、既存 W3-seq-04 計装ポイントへの影響なし確認、CSP セキュリティポリシーの最終確認                                                                                                  |
| 11    | 手動テスト       | NON_VISUAL: analytics 送信ログ確認・オフライン→オンライン復帰時のキュードレイン確認・オプトアウト時の送信停止確認・Electron DevTools の Network タブで送信確認                                          |
| 12    | ドキュメント更新 | `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` 作成 |
| 13    | PR 作成          | ユーザー明示承認後のみ実施（blocked 維持）                                                                                                                                                              |

---

## 5. 完了条件チェックリスト

### 機能要件（AC）

- [ ] AC-1: 本番環境で `trackEvent` が analytics sink にイベントを送信できる
- [ ] AC-2: analytics provider への接続が CSP 制限に抵触しない
- [ ] AC-3: オフライン時にイベントがキューに保持され、オンライン復帰後に送信される
- [ ] AC-4: ユーザーのオプトアウト設定が有効な場合、送信が停止される
- [ ] AC-5: `trackEvent` 公開 API シグネチャが変更されていない
- [ ] AC-6: `SkillCreateWizard.tsx` の変更が不要（または最小）である
- [ ] AC-9: analytics adapter 初期化失敗時に `trackEvent` が no-op にフォールバックする

### テストカバレッジ要件

- [ ] AC-7: `analyticsAdapter.ts` のテストカバレッジが 90% 以上
- [ ] AC-8: `pnpm typecheck` / `pnpm lint` / `pnpm test` が全て PASS

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm --filter @repo/desktop test:run` が PASS
- [ ] 既存 `trackEvent` 呼び出し箇所（`SkillCreateWizard.tsx`）への影響がない（回帰なし）
- [ ] CSP ポリシーが Electron セキュリティ要件を満たしている

### ドキュメント要件（Phase 12）

- [ ] `outputs/phase-12/implementation-guide.md`
- [ ] `outputs/phase-12/system-spec-update-summary.md`
- [ ] `outputs/phase-12/documentation-changelog.md`
- [ ] `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）
- [ ] `outputs/phase-12/skill-feedback-report.md`（改善点なしでも必須）
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 6. 検証方法

### ユニットテスト実行

```bash
# analyticsAdapter.ts のテスト
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/analyticsAdapter.test.ts

# trackEvent.ts の回帰確認
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/trackEvent.test.ts

# IPC ハンドラのテスト（IPC 経由の場合）
pnpm --filter @repo/desktop test:run -- src/main/ipc/__tests__/analyticsHandler.test.ts
```

### カバレッジ確認

```bash
# analyticsAdapter.ts の 90% 以上カバレッジ確認
pnpm --filter @repo/desktop test:coverage -- src/renderer/utils/analyticsAdapter.ts

# trackEvent.ts の 100% カバレッジ維持確認
pnpm --filter @repo/desktop test:coverage -- src/renderer/utils/trackEvent.ts
```

### CSP 設定確認

```bash
# Electron の webSecurity / Content-Security-Policy 設定確認
# analytics provider ドメインが CSP の connect-src に含まれているか確認
```

### オフライン動作確認

```bash
# Electron DevTools の Network タブでオフラインモードに切り替え
# trackEvent を発火させ、キューに保持されることを確認
# オンラインに戻し、キューがフラッシュされることを確認
```

---

## 7. リスクと対策

| リスク                                                        | 影響度 | 発生確率 | 対策                                                                                                           |
| ------------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------- |
| Electron Renderer から外部 API を直接呼ぶと CSP 制限に抵触    | 高     | 高       | IPC 経由（Main プロセスで HTTP 送信）を優先検討し、CSP 変更を最小化する                                        |
| analytics provider 選定が長引く                               | 中     | 中       | Phase 1 で OSS・セルフホスト可能な PostHog を暫定候補とし、差し替えを容易にする設計を優先する                  |
| オフライン時のキューがメモリを圧迫する                        | 中     | 低       | キューの上限件数（例: 500件）を設けて古いイベントを破棄するポリシーを実装する                                  |
| ユーザーのプライバシー設定 API が未整備                       | 高     | 中       | Phase 1 でプライバシー設定ストアの有無を調査し、未整備の場合はデフォルトオプトアウト（送信なし）で安全側に倒す |
| analytics provider SDK が Electron と非互換                   | 中     | 中       | Phase 2 で SDK の Electron 対応状況を確認し、非互換の場合は IPC 経由カスタム方式に切り替える                   |
| `trackEvent` 公開 API 変更による `SkillCreateWizard.tsx` 影響 | 高     | 低       | `trackEvent` の引数シグネチャを変えず、内部実装のみ差し替えるアーキテクチャを設計段階で確定する                |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                      | パス                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| W3-seq-04 実装ガイド              | `docs/30-workflows/W3-seq-04-usage-tracking/outputs/phase-12/implementation-guide.md`      |
| W3-seq-04 未タスク検出レポート    | `docs/30-workflows/W3-seq-04-usage-tracking/outputs/phase-12/unassigned-task-detection.md` |
| task-specification-creator スキル | `.claude/skills/task-specification-creator/SKILL.md`                                       |
| aiworkflow-requirements スキル    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                          |

### 関連ソースコード

| 対象                           | パス                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| trackEvent 現状実装            | `apps/desktop/src/renderer/utils/trackEvent.ts`                                            |
| trackEvent テスト              | `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`                             |
| SkillCreateWizard（計装済み）  | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                         |
| SkillCreateWizard 計装テスト   | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx` |
| Electron Main IPC ディレクトリ | `apps/desktop/src/main/ipc/`                                                               |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                                               | 原因・背景                                                                                                                                          | 推奨アプローチ                                                                                                                                                  |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Electron Renderer から外部 API を直接呼ぶと CSP 制限に引っかかる可能性 | Electron アプリの `webSecurity` 設定や `Content-Security-Policy` ヘッダにより、Renderer から特定ドメインへの通信がブロックされる場合がある          | IPC 経由（Renderer → Main → HTTP）の方式を優先する。Main プロセスはブラウザプロセスと異なり CSP 制限を受けないため、analytics HTTP 送信を Main で行う設計が安全 |
| analytics provider の選定（Amplitude / Mixpanel / PostHog / IPC 経由） | 各 SDK の Electron 対応状況・バンドルサイズ・プライバシーコンプライアンス要件が異なり、単純な npm install で解決しないケースがある                  | Phase 1 でプロトタイプ PoC（Proof of Concept）を作成し、Electron 実機で動作確認してから決定する。OSS の PostHog はセルフホスト可能でプライバシー要件に柔軟      |
| オフライン時のイベントキューイング設計                                 | Electron アプリはネットワーク切断状態での使用が想定され、イベントロストを防ぐためにキューの永続化が必要。一方でキューが際限なく増大するリスクもある | `ElectronStore` やローカルファイルへのキュー永続化を検討する。上限件数（例: 500件）と TTL（例: 7日）を設けて自動削除ポリシーを実装する                          |
| ユーザーのプライバシー設定との連動（オプトイン/アウト）                | アプリ全体のプライバシー設定ストアが整備されていない場合、`trackEvent` がオプトアウト状態を参照できない。設定 API が未整備だと実装が複雑化する      | Phase 1 でプライバシー設定ストアの有無と API を調査する。未整備の場合はデフォルト no-op（送信なし）で実装し、設定 API が整備された時点で接続する                |

### W3-seq-04 実装から得た知見（参考）

W3-seq-04 の実装では、`trackEvent` を renderer-local の関数として閉じることで
`@repo/shared` や IPC への影響を完全にゼロにするアプローチが有効だった。
本タスクでも `trackEvent.ts` の内部実装のみを変更し、公開 API シグネチャを維持することで
`SkillCreateWizard.tsx` 等の呼び出し側への影響を最小化できる。

また W3-seq-04 の実装ガイドに記載の通り、`trackEvent.ts` の内部 sink は差し替え可能な
設計になっているため、本タスクは設計の意図通りの拡張作業である：

```typescript
// 将来の差し替えイメージ（実装ガイド記載）
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload);
  }
  // 差し替え先: analyticsAdapter.send(eventName, payload);
}
```

### 実行時の注意事項

- Phase 13（PR 作成）はユーザーの明示的な承認があるまで blocked 状態を維持する
- コミット・push は禁止（承認後のみ）
- analytics SDK の導入は `pnpm --filter @repo/desktop add <package>` で行う（npm / yarn 禁止）
- Electron のセキュリティポリシーを緩める方向の変更は最小限にとどめ、セキュリティレビューを実施する
