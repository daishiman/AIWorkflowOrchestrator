# UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001 - skillHandlers AuthKey DI境界整理ガード

## メタ情報

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001                        |
| タスク名     | skillHandlers AuthKey DI境界整理ガード                                    |
| 分類         | 改善                                                                      |
| 対象機能     | `apps/desktop/src/main/ipc/skillHandlers.ts` / `AuthKeyService` DI経路    |
| 優先度       | 中                                                                        |
| 見積もり規模 | 中規模                                                                    |
| ステータス   | 完了（2026-03-06 / Phase 12完了移管）                                     |
| 発見元       | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001（Phase 10 MINOR + Phase 12再確認） |
| 発見日       | 2026-03-06                                                                |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` で `AuthKeyService` の単一生成と `SkillExecutor` へのDI統一は完了したが、`skillHandlers.ts` 内に実行器生成責務が残っており、composition root と handler 登録責務の境界が曖昧なままになっている。

### 1.2 問題点・課題

- `skillHandlers.ts` の責務が大きく、DI経路変更時に変更点の追跡コストが高い。
- `AuthKeyService` 注入経路の修正時に、`ipc/index.ts` と `skillHandlers.ts` の同期漏れが再発しやすい。
- Phase 12 の仕様同期で「実装は更新済みだが教訓/台帳が遅れる」事象を再発しやすい。

### 1.3 放置した場合の影響

- 次回の DI 変更で preflight と実行時判定の不一致が再発する。
- `skillHandlers.ts` 由来の設計負債が継続し、テスト追加・障害調査の速度が低下する。
- 同種課題の再利用手順が蓄積されず、Phase 12 の更新漏れが反復する。

## 2. 何を達成するか（What）

### 2.1 目的

`skillHandlers.ts` の DI 境界を明確化し、`AuthKeyService` 注入経路の変更耐性を上げる。

### 2.2 最終ゴール

- `SkillExecutor` 生成責務が composition root または専用factoryに集約される。
- `skillHandlers.ts` は「ハンドラ登録責務」に限定される。
- DI経路の整合を検証するテストが追加され、ドキュメント同期手順が固定される。

### 2.3 スコープ

#### 含むもの

- `ipc/index.ts` と `skillHandlers.ts` の責務境界の再設計
- DI経路回帰テストの追加・更新
- `task-workflow.md` / `lessons-learned.md` への反映

#### 含まないもの

- `SkillExecutor` の業務ロジック変更
- auth-key IPC チャネル仕様の追加
- UI 振る舞い変更

### 2.4 成果物

- DI境界整理後の実装差分（Main/IPC）
- 回帰テスト更新（DI経路）
- Phase 12仕様同期（task-workflow / lessons）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` の現行実装を起点にする。
- `apps/desktop` のテスト実行環境（vitest/typecheck）が利用可能である。

### 3.2 依存タスク

- 参照: `UT-FIX-7-1-002`（`skillHandlers.ts` 機能別分割）
- 参照: `UT-FIX-7-1-003`（IPCレスポンス形式統一）

### 3.3 必要な知識

- Electron Main IPC 登録/解除ライフサイクル
- `SkillExecutor` と `AuthKeyService` のDI経路
- Phase 12 仕様同期ルール（current/baseline 分離）

### 3.4 推奨アプローチ

1. 先に composition root 側で依存生成責務を固定する。
2. handler 側は注入済み依存を受ける構造へ整理する。
3. テストと仕様同期を同一ターンで完了させる。

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                  | 発見経緯                                                                  | 解決策                                                                                                                | 教訓                                                            |
| ------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| DIシグネチャドリフト                  | `TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` の再監査で文書と実装の差分を検出 | `registerSkillHandlers(..., authKeyService)` と `new SkillExecutor(mainWindow, undefined, authKeyService)` を同時同期 | DI変更は「Main配線 + 実装 + 仕様」の3点同時更新が必須           |
| `phase-12-documentation` 台帳ドリフト | 成果物実体は存在するがステータス同期漏れが発生                            | Task 12-1〜12-5実体確認後に `verify-all-specs` / `validate-phase-output` を再実行                                     | Phase 12完了は「実体 + 機械検証 + ステータス同期」の3条件で判定 |
| `skillHandlers.ts` の責務肥大化       | Phase 10 最終レビューで継続課題として指摘                                 | 依存生成責務を composition root/factory へ移動し、handler登録責務へ限定                                               | DI改善と責務分離は同時に設計しないと再発する                    |

## 4. 実行手順

### Phase構成

- Phase A: 現状分析と設計固定
- Phase B: 実装とテスト
- Phase C: 仕様同期と監査

### Phase A: 現状分析と設計固定

#### 目的

DI境界の現状差分を可視化し、変更方針を固定する。

#### 手順

1. `ipc/index.ts` と `skillHandlers.ts` の依存生成箇所を列挙する。
2. 生成責務を composition root 側へ寄せる設計案を作成する。
3. テスト影響範囲（`ipc-double-registration` ほか）を整理する。

#### 成果物

- 境界変更メモ
- 影響範囲一覧

#### 完了条件

- 生成責務/注入責務の境界が1案に確定している。

### Phase B: 実装とテスト

#### 目的

設計案に基づき実装を更新し、回帰を防止する。

#### 手順

1. 実装を境界方針に沿って更新する。
2. DI経路の回帰テストを追加・更新する。
3. `vitest` と `typecheck` を実行する。

#### 成果物

- 実装差分
- テスト差分

#### 完了条件

- 対象テストと型検査がPASSする。

### Phase C: 仕様同期と監査

#### 目的

システム仕様書と未タスク台帳を同期し、再利用可能状態にする。

#### 手順

1. `task-workflow.md` に残課題・変更履歴を追記する。
2. `lessons-learned.md` に苦戦箇所と簡潔手順を追記する。
3. 未タスク監査・リンク監査を実行する。

#### 成果物

- 仕様書更新差分
- 監査ログ

#### 完了条件

- `currentViolations=0` とリンク整合PASSを確認できる。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillExecutor` 生成責務が `skillHandlers.ts` 外へ整理されている
- [ ] `AuthKeyService` 注入経路が単一路で維持される

### 品質要件

- [ ] DI経路回帰テストがPASSする
- [ ] `pnpm --filter @repo/desktop typecheck` がPASSする

### ドキュメント要件

- [ ] `task-workflow.md` の残課題テーブルが更新されている
- [ ] `lessons-learned.md` に再発条件付きで教訓が追記されている
- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` 正本に配置されている

## 6. 検証方法

### テストケース

- TC-01: DI経路が単一路であることを回帰テストで確認
- TC-02: handler 登録/解除の lifecycle テストがPASSすることを確認
- TC-03: 仕様同期後に未タスク監査・リンク監査がPASSすることを確認

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts`
2. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts`
3. `pnpm --filter @repo/desktop typecheck`
4. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-skillhandlers-authkey-di-boundary-guard-001.md`
5. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                          |
| ------------------------------------ | ------ | -------- | ------------------------------------------------------------- |
| DI責務移動で既存テストが多数失敗     | 中     | 中       | 変更前に影響テストを列挙し、段階適用で回帰確認する            |
| register/unregister の対称性が崩れる | 高     | 低       | lifecycle テストを必須化し、両経路を同時更新する              |
| 仕様更新だけ遅延する                 | 中     | 中       | 実装完了と同一ターンで `task-workflow` / `lessons` を更新する |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/outputs/phase-10/final-review-result.md`
- `docs/30-workflows/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/outputs/phase-12/documentation-changelog.md`

### 参考資料

- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
改善課題: `skillHandlers.ts` の責務分割（品質改善タスクとして管理）
```

### 補足事項

本タスクは、完了済みDI統一を壊さずに「責務境界」を整理するための運用改善タスクであり、機能追加タスクではない。
