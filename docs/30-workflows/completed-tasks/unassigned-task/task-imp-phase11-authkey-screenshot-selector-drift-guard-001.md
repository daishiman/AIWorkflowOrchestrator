# UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001 |
| 種別       | 改善（Phase 11 運用ガード）                                |
| 優先度     | 中                                                         |
| ステータス | 完了（2026-03-06 / Phase 12完了移管）                      |
| 作成日     | 2026-03-05                                                 |
| 作成者     | Codex                                                      |
| 関連       | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 再監査              |

## 1. なぜこのタスクが必要か（Why）

`apps/desktop/scripts/capture-auth-key-handler-registration-phase11.mjs` 実行時に、`button[aria-label="Settings"]` 待機がタイムアウトし、Phase 11 画面証跡を自動取得できないケースを確認した。画面構造変更に対してセレクタが固定化されており、再監査時の証跡取得が不安定になる。

## 2. 何を達成するか（What）

- 認証キー系スクリーンショット取得スクリプトのセレクタを現行UIへ追従可能にする。
- Phase 11 スクリーンショット取得の失敗を事前検知する preflight を追加する。
- 失敗時ログの読解を容易にする（どのセレクタで失敗したか明示）。

## 3. どのように実行するか（How）

- 既存セレクタを `data-testid` ベースへ置換し、複数候補のフォールバックを導入する。
- `waitForSelector` 失敗時に現在URL・主要DOM断片・対象セレクタをログへ出力する。
- スクリプト実行前に `baseUrl` 疎通と必須ルート到達を確認する preflight を追加する。

## 4. 実行手順

1. `capture-auth-key-handler-registration-phase11.mjs` のシナリオ定義を見直し、固定セレクタを現行UI向けに更新する。
2. セレクタ候補の優先順位（`data-testid` -> role/name -> fallback CSS）を実装する。
3. 失敗時デバッグ情報（URL/selector/DOMスナップショット）を出力する。
4. ローカルで再実行し、3枚のスクリーンショット生成を確認する。
5. 関連仕様書の苦戦箇所・再利用手順へ反映する。

## 5. 完了条件チェックリスト

- [ ] `capture-auth-key-handler-registration-phase11.mjs` が再現可能に成功する
- [ ] 失敗時ログにセレクタとURLが含まれる
- [ ] 画面証跡3件が生成される
- [ ] 関連仕様書（task-workflow / lessons-learned）の更新が完了する

## 6. 検証方法

- `pnpm --filter @repo/desktop exec node scripts/capture-auth-key-handler-registration-phase11.mjs`
- 生成物確認: `docs/30-workflows/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-11/screenshots/*.png`
- ログ確認: タイムアウト時にセレクタ/URL/補助情報が出力される

## 7. リスクと対策

| リスク                         | 対策                                                  |
| ------------------------------ | ----------------------------------------------------- |
| UI変更で再度セレクタが壊れる   | `data-testid` 優先 + フォールバックセレクタを併用する |
| 取得失敗時の原因切り分けが困難 | 失敗ログにURL/selector/DOM断片を必須出力する          |
| 実行環境依存（port/route）     | preflight で疎通確認し、失敗時は即終了する            |

## 8. 参照情報

- `apps/desktop/scripts/capture-auth-key-handler-registration-phase11.mjs`
- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/outputs/phase-11/screenshot-capture-rerun.log`
- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/outputs/phase-11/screenshots/`

## 9. 備考

本タスクは今回の実装本体（AuthKeyService DI統一）ではなく、再監査で検出した証跡取得運用の安定化課題である。
