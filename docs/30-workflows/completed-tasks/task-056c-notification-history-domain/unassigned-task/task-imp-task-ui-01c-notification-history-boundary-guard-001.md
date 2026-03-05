# UT-IMP-TASK-UI-01C-NOTIFICATION-HISTORY-BOUNDARY-GUARD-001 - タスク指示書

## メタ情報

```yaml
task_id: UT-IMP-TASK-UI-01C-NOTIFICATION-HISTORY-BOUNDARY-GUARD-001
task_name: Notification/History ドメイン境界の回帰ガード強化
category: 改善
target_feature: TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-01-C Phase 12（実装苦戦箇所の抽出）
created_date: 2026-03-05
dependencies:
  - TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN
```

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-UI-01C-NOTIFICATION-HISTORY-BOUNDARY-GUARD-001             |
| タスク名     | Notification/History ドメイン境界の回帰ガード強化                      |
| 分類         | 改善                                                                   |
| 対象機能     | NotificationCenter + HistorySearchView + notification/history IPC 境界 |
| 優先度       | 中                                                                     |
| 見積もり規模 | 中規模                                                                 |
| ステータス   | 未実施                                                                 |
| 発見元       | TASK-UI-01-C Phase 12 の苦戦箇所整理（Main/Store/UI 境界）             |
| 発見日       | 2026-03-05                                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN` で通知履歴と履歴検索の実装自体は完了したが、実装中に難所となった「Main push 正規化」「Store dedupe」「検索 filter 維持」は、複数境界をまたぐため再発しやすい。

既存テストは各層の単体保証はある一方、境界連携（初期履歴同期 + push 競合、ページング時の filter 継承、購読解除の漏れ）を同時に固定する回帰ガードが薄い。

### 1.2 問題点・課題

- `notification:new` の payload 正規化と送信前ガードが将来の変更で欠落するリスクがある
- `setNotificationHistory` と `ingestNotification` の競合で重複表示が再発しうる
- `loadMoreHistory` で `historySearchFilter` を引き継がない改修が入りやすい
- 境界ルールが仕様書にあるだけで、回帰テストと同時運用されていない

### 1.3 放置した場合の影響

- 通知表示順の不安定化や重複表示が再発し、UXが劣化する
- 履歴検索の結果整合が崩れ、調査コストが増大する
- Phase 12 で毎回同種の苦戦箇所を再学習する非効率が継続する

---

## 2. 何を達成するか（What）

### 2.1 目的

Notification/History ドメインの境界契約を「仕様 + テスト + 未タスク運用」の3点で固定し、同種回帰を短時間で防止できる状態にする。

### 2.2 最終ゴール

1. Main/Store/UI の境界回帰テストが追加され、3つの難所（正規化・dedupe・filter継承）を自動検証できる
2. 仕様書の残課題導線（task-workflow / lessons / ui-ux-feature）が同一IDで同期される
3. `audit-unassigned-tasks` の対象監査で `currentViolations=0` を維持できる

### 2.3 スコープ

#### 含むもの

- `notificationHandlers.test.ts` の push送信ガード・timestamp正規化の境界ケース拡充
- `notificationSlice.test.ts` の履歴同期 + push競合 dedupe ケース追加
- `historySearchSlice.test.ts` / `HistorySearchView.test.tsx` の filter継承ケース拡充
- `task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` の未タスク導線同期

#### 含まないもの

- 新規 UI 機能追加（通知種別追加、検索UIデザイン刷新など）
- DB スキーマ変更
- Phase 13（PR作成/マージ）

### 2.4 成果物

| 成果物           | 内容                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 回帰テスト差分   | Main/Store/UIの境界回帰ケース追加                                                                                                                         |
| 仕様同期差分     | `task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` への同一ID登録                                                                  |
| 実行ログ         | テストと監査コマンドの実行結果                                                                                                                            |
| 本未タスク指示書 | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/unassigned-task/task-imp-task-ui-01c-notification-history-boundary-guard-001.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN` の実装が main ブランチ相当で取り込み済み
- `apps/desktop` のテスト環境（Vitest）が実行可能
- `task-specification-creator` の監査スクリプトが利用可能

### 3.2 依存タスク

- `TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN`（完了）

### 3.3 必要な知識

- Main IPCハンドラ（`notificationHandlers.ts`）と push イベント契約
- Zustand slice（`notificationSlice.ts`, `historySearchSlice.ts`）の状態遷移
- `task-specification-creator` の未タスク監査ルール

### 3.4 推奨アプローチ

1. 境界ごとに責務を分離して Red テストを先行追加する（Main / Store / UI）
2. 回帰再現ケースを最小セットで固定する（timestamp不正値、同一ID競合、filter欠落）
3. テストGreen化後、仕様書3点（task-workflow / lessons / ui-ux-feature）を同一ターンで同期する
4. `--diff-from HEAD` の差分監査で `currentViolations=0` を確認する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                              | 発見経緯                                                  | 解決策                                                                        | 教訓                                                |
| --------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| push送信時の壊れた timestamp 混入 | `TASK-UI-01-C` 実装中に通知順序が不安定化                 | `emitNotificationNew` 送信前ガード + ISO正規化、Store側でも最小正規化を重ねた | Push payload は Main/Renderer 両境界で正規化する    |
| 初期履歴同期と push の競合重複    | `getHistory` 直後に同一ID push が到着して重複             | `ingestNotification` で ID dedupe を固定                                      | 履歴同期 + push は dedupe を必須契約にする          |
| load more 時の filter 喪失        | `loadMore` が filter を再利用しない経路で検索結果が崩れた | `historySearchFilter` を slice 単一真実源に固定                               | query/filter/pagination は同一 slice で一元管理する |
| 仕様同期の片側更新                | 実装反映後に台帳/教訓更新が分離しやすい                   | `task-workflow` / `lessons` / `ui-ux-feature` を同一ターン更新                | 境界タスクは3仕様書同時更新を完了条件にする         |

### 3.6 aiworkflow-requirements から抽出した必須仕様

| 仕様書                                                          | 抽出要件                                                                   | 本タスクでの適用                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| `references/api-ipc-system.md`                                  | `notification:new` は送信前ガード・timestamp正規化・購読解除契約を保持する | Main契約テストで失敗先行（Red）を追加して固定            |
| `references/arch-state-management.md`                           | `historySearchFilter` 一元化と `ingestNotification` dedupe を維持する      | Store回帰テストで競合ケースと filter継承を固定           |
| `references/ui-ux-feature-components.md`                        | Notification/History の実装難所を UI 観点でも再利用可能化する              | UIテストと残課題導線を同期                               |
| `references/security-electron-ipc.md`                           | IPC境界で sender/入力検証の破壊を防ぐ                                      | ハンドラ拡張時に既存セキュリティ契約を壊さない検証を追加 |
| `references/task-workflow.md` / `references/lessons-learned.md` | 苦戦箇所を未タスクとして追跡可能に記録する                                 | 同一IDで残課題テーブルへ登録                             |

---

## 4. 実行手順

### Phase構成

| Phase   | 目的                 | 担当SubAgent                                                 | 並列可否 |
| ------- | -------------------- | ------------------------------------------------------------ | -------- |
| Phase A | 仕様抽出とテスト設計 | SubAgent-Main / SubAgent-Store / SubAgent-UI / SubAgent-Docs | 並列可   |
| Phase B | Redテスト追加        | SubAgent-Main / SubAgent-Store / SubAgent-UI                 | 並列可   |
| Phase C | Green化と回帰確認    | SubAgent-Main / SubAgent-Store / SubAgent-UI                 | 並列可   |
| Phase D | 仕様書同期と監査     | SubAgent-Docs                                                | 順次     |

### Phase A: 仕様抽出とテスト設計

#### 目的

境界契約の必須ケースを漏れなく定義する。

#### 手順

1. `api-ipc-system.md` / `arch-state-management.md` / `ui-ux-feature-components.md` から境界要件を抽出する
2. SubAgentごとに対象テストファイルを確定する
3. テストケースマトリクス（Main/Store/UI）を作成する

#### 成果物

- 境界テストケース一覧
- SubAgent別担当表

#### 完了条件

- Redテスト対象ケースが3境界で定義されている

### Phase B: Redテスト追加（並列）

#### 目的

回帰ポイントを失敗テストとして先に固定する。

#### 手順

1. SubAgent-Main: `notificationHandlers.test.ts` に送信前ガード・timestamp不正値ケースを追加
2. SubAgent-Store: `notificationSlice.test.ts` に履歴同期+push競合 dedupe ケースを追加
3. SubAgent-UI: `historySearchSlice.test.ts` / `HistorySearchView.test.tsx` に filter継承ケースを追加

#### 成果物

- 失敗するテスト差分（Red）

#### 完了条件

- 追加した境界ケースが意図どおり失敗する

### Phase C: Green化と回帰確認（並列）

#### 目的

Redで追加した境界ケースを最小修正でGreen化する。

#### 手順

1. Main/Store/UI の必要最小変更でテストをGreen化する
2. 追加ケースを含む対象テストを再実行する
3. 既存回帰（通知・履歴検索関連）への副作用を確認する

#### 成果物

- Green化済みコード差分
- テスト実行ログ

#### 完了条件

- 追加した境界ケースが全PASS
- 既存主要テストもPASS

### Phase D: 仕様書同期と監査

#### 目的

未タスク導線と監査結果を確定し、再利用可能な状態にする。

#### 手順

1. `task-workflow.md` 残課題テーブルに本タスクを登録する
2. `lessons-learned.md` / `ui-ux-feature-components.md` の関連未タスクへ同一IDを追加する
3. `verify-unassigned-links` と `audit-unassigned-tasks` を実行して current=0 を確認する

#### 成果物

- 更新済み system spec
- 監査結果ログ

#### 完了条件

- 残課題導線が 3仕様書で解決可能
- `currentViolations=0`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Main境界（送信前ガード・timestamp正規化）の回帰テストが追加されている
- [ ] Store境界（履歴同期+push競合 dedupe）の回帰テストが追加されている
- [ ] UI境界（filter継承 + load more）の回帰テストが追加されている

### 品質要件

- [ ] 追加テストを含む対象テスト群がPASSする
- [ ] 既存通知/履歴検索関連テストに回帰がない
- [ ] `audit-unassigned-tasks` の current 判定が 0 である

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` の残課題テーブルに登録されている
- [ ] `lessons-learned.md` / `ui-ux-feature-components.md` に同一ID導線がある

---

## 6. 検証方法

### テストケース

| テストID | 観点                  | 期待結果                                                                   |
| -------- | --------------------- | -------------------------------------------------------------------------- |
| TC-BG-01 | Main push送信前ガード | 破棄済み window 条件で安全に送信をスキップする                             |
| TC-BG-02 | timestamp正規化       | 不正 timestamp を受けても降順ソートが安定する                              |
| TC-BG-03 | 履歴同期 + push競合   | 同一ID通知が1件に保たれる                                                  |
| TC-BG-04 | filter継承            | load more 後も選択 filter が維持される                                     |
| TC-BG-05 | 仕様導線              | task-workflow / lessons / ui-ux-feature から本未タスクへのリンクが解決する |
| TC-BG-06 | 監査                  | `audit --diff-from HEAD` で current=0                                      |

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/notificationHandlers.test.ts
pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/notificationSlice.test.ts src/renderer/store/slices/historySearchSlice.test.ts
pnpm --filter @repo/desktop exec vitest run src/renderer/views/HistorySearchView/HistorySearchView.test.tsx

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                                |
| ---------------------------------------- | ------ | -------- | ------------------------------------------------------------------- |
| 境界ケース追加で既存テストが不安定化する | 中     | 中       | 失敗時は境界別に切り分け、1ケースずつ最小修正でGreen化する          |
| 実装変更が過剰になり責務分離が崩れる     | 中     | 低       | Main/Store/UIの責務境界を守り、SubAgentごとにレビューする           |
| 仕様同期の片側更新が再発する             | 中     | 中       | 3仕様書同時更新をチェックリストに含め、同一ターンで確定する         |
| baseline違反を今回差分違反と誤読する     | 中     | 中       | 合否は `currentViolations` のみで判定し、baselineは監視値として扱う |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`

### 参考ファイル

- `apps/desktop/src/main/ipc/notificationHandlers.ts`
- `apps/desktop/src/main/ipc/__tests__/notificationHandlers.test.ts`
- `apps/desktop/src/renderer/store/slices/notificationSlice.ts`
- `apps/desktop/src/renderer/store/slices/notificationSlice.test.ts`
- `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`
- `apps/desktop/src/renderer/store/slices/historySearchSlice.test.ts`
- `apps/desktop/src/renderer/views/HistorySearchView/index.tsx`
- `apps/desktop/src/renderer/views/HistorySearchView/HistorySearchView.test.tsx`

---

## 9. 備考

- 本タスクは「新機能追加」ではなく、`TASK-UI-01-C` で難所だった境界条件を再発防止として固定する改善タスクである。
- 実装中に UI/UX 観点の新規課題が発見された場合は、別未タスクとして分離して登録する。
