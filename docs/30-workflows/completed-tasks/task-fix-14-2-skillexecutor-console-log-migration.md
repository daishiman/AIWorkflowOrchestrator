# TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION - タスク指示書

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION         |
| タスク名     | SkillExecutor の console ログを electron-log に移行       |
| 分類         | リファクタリング                                          |
| 対象機能     | Skill 実行ログ（Main Process）                            |
| 優先度       | 低                                                        |
| 見積もり規模 | 小規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION Phase 12 未タスク検出 |
| 発見日       | 2026-02-14                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-FIX-14-1-CONSOLE-LOG-MIGRATION` で Skill 関連サービス4ファイルの console 移行は完了したが、`SkillExecutor.ts` に `console.error` 2箇所、`console.info` 2箇所が残存している。

### 1.2 問題点・課題

- ログ出力方式が `electron-log` と `console` で混在している
- 本番環境でのログ収集・レベル制御・保守性が不統一
- `development-guidelines.md` の「console.logの本番使用禁止」方針との整合が不十分

### 1.3 放置した場合の影響

- 障害調査時にログ取得経路が分散する
- ログレベル管理が困難になる
- 同種リファクタリングの再発（Phase 12未タスク増加）を招く

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillExecutor.ts` 内の残存 console を全て `electron-log` に置換し、Skill系 Main Process ログ方式を統一する。

### 2.2 最終ゴール

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` の実行コードで `console.` 使用が0件
- 既存テストが回帰しない
- ログメッセージのプレフィックス・ログレベルが既存規約に一致

### 2.3 スコープ

#### 含むもの

- `SkillExecutor.ts` の `console.error` / `console.info` 置換
- 必要に応じたテスト更新（モック/アサーション）
- 仕様書・残課題テーブルの完了反映（Phase 12）

#### 含まないもの

- SkillExecutor の機能仕様変更
- ログ出力内容の意味変更（文言の大幅改変）
- electron-log transport 設定の変更

### 2.4 成果物

- 修正済み `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- 更新済み関連テスト（必要時）
- Phase 12成果物（implementation-guide / documentation-changelog / unassigned-task-detection）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-14-1-CONSOLE-LOG-MIGRATION` の成果物一式が存在すること
- `SkillExecutor.ts` の現行ログ出力箇所を特定済みであること

### 3.2 依存タスク

- なし（独立実行可能）

### 3.3 必要な知識

- Electron Main Process のログ運用（`electron-log`）
- SkillExecutor の実行フローとエラーハンドリング
- Vitest のモック・アサーション

### 3.4 推奨アプローチ

1. `SkillExecutor.ts` の console 使用箇所を4件すべて列挙
2. ログレベルを既存方針に合わせて `log.error` / `log.info` に移行
3. 回帰テストでログ出力の整合を検証
4. Phase 12 で仕様反映（完了記録・変更履歴・リンク整合）

### 3.5 実装課題と解決策（親タスク TASK-FIX-14-1 からの教訓）

> 詳細: [lessons-learned.md - TASK-FIX-14-1 セクション](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md#task-fix-14-1-console--electron-log-移行)

#### 苦戦箇所一覧

| #   | 課題                                                                    | 発見経緯                                              | 解決策                                                                                                                         | 関連Pitfall |
| --- | ----------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 1   | Phase 12成果物に実装対象と異なるファイル名が混入                        | TASK-FIX-14-1成果物監査で発覚                         | `git diff --name-only` を正として成果物内のファイル名を全件修正                                                                | -           |
| 2   | Phase 12 Step 1-A/1-C/1-D を「PR時対応」として先送り誤判定              | documentation-changelog.md の整合性チェックで発覚     | Step 1-A〜1-D を同一ターン内で即時完了。`LOGS.md x2`・`SKILL.md x2`・`generate-index.js` 実行を固定化                          | P1, P25     |
| 3   | 未タスク検出後、検出レポート作成のみで登録漏れ                          | Phase 12完了条件チェックで発覚                        | 3ステップを同一ターンで実施（指示書作成 → task-workflow.md 登録 → 関連仕様書残課題更新）                                       | P3          |
| 4   | 本番コード4ファイル移行で関連テスト9ファイルにモック追加が必要          | テスト実行時にstdoutにログが漏れて発覚（P20パターン） | `grep -rn` で影響テストを特定し、バックグラウンドエージェントで一括追加                                                        | P20, P21    |
| 5   | `this.debug` プロパティが移行後に未使用化したが、25箇所のテスト参照あり | コードレビューで検出                                  | 後方互換性を優先し設定のみ残して維持。TASK-FIX-14-2完了後に段階的削除を検討                                                    | -           |
| 6   | `vitest run --coverage <source-file-path>` でカバレッジ0%               | Phase 7でカバレッジ計測時に発覚                       | テストディレクトリを指定して出力をgrepでフィルタリング                                                                         | P40         |
| 7   | 条件ガード削除による予想外の簡素化効果                                  | 移行作業中に発見                                      | `if (this.debug)` ガード3箇所と `process.env.NODE_ENV !== "test"` ガード2箇所を同時削除。循環的複雑度低下・コード行数約10%削減 | -           |

#### 本タスクへの適用ポイント

- **苦戦箇所4の再現可能性が高い**: SkillExecutor.ts は5つのテストファイル（test, auth, retry, integration, permission, performance）から参照されるため、electron-log モック追加が必須
- **苦戦箇所5は本タスクで解決**: SkillExecutor.ts の移行完了後、`debug` プロパティの段階的削除を検討可能
- **苦戦箇所7も適用可能**: SkillExecutor.ts 内にも条件ガードが存在する場合、同様の簡素化効果が期待できる

---

## 4. 実行手順

### Phase構成

- Phase 1: 要件確認
- Phase 2: 影響範囲設計
- Phase 4-5: テスト作成・実装
- Phase 6-10: 回帰検証
- Phase 12: 仕様更新

### Phase 1: 要件確認

#### 目的

移行対象 console 箇所と受入基準を確定する。

#### 手順

1. `rg -n "console\\.(error|info)" apps/desktop/src/main/services/skill/SkillExecutor.ts` を実行
2. 各箇所の用途を分類（異常系/状態通知）
3. ログレベルの割り当て表を作成

#### 成果物

- 移行マッピング（箇所→logレベル）

#### 完了条件

- 移行対象4箇所が漏れなく列挙されている

### Phase 5: 実装

#### 目的

`SkillExecutor.ts` の console 出力を `electron-log` に統一する。

#### 手順

1. `import log from "electron-log"` を追加（未追加の場合）
2. `console.error` / `console.info` を `log.error` / `log.info` へ置換
3. ログメッセージのプレフィックスを `[SkillExecutor]` で統一

#### 成果物

- 修正済み `SkillExecutor.ts`

#### 完了条件

- `SkillExecutor.ts` の実行コードで `console.` が0件

### Phase 12: ドキュメント更新

#### 目的

完了記録と関連未タスク管理を仕様書へ反映する。

#### 手順

1. `task-workflow.md` の完了タスク/残課題を更新
2. `interfaces-agent-sdk-history.md` の残課題テーブルを更新
3. `LOGS.md` / `SKILL.md`（両スキル）を更新

#### 成果物

- 更新済み仕様書・ログ・スキル履歴

#### 完了条件

- `verify-unassigned-links.js` が `ALL_LINKS_EXIST`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillExecutor.ts` の `console.error` / `console.info` が0件
- [ ] 既存の挙動（ストリーム送信・権限永続化）が変化しない

### 品質要件

- [ ] 影響範囲テストがPASS
- [ ] ログレベルとメッセージが既存規約に一致

### ドキュメント要件

- [ ] `task-workflow.md` の完了/残課題が更新済み
- [ ] 関連仕様書の残課題テーブルが更新済み
- [ ] `LOGS.md`/`SKILL.md` の4ファイルを更新済み

---

## 6. 検証方法

### テストケース

- SkillExecutor のエラー系・通常系ログ出力の回帰
- Permission 永続化経路の回帰
- ストリーミング関連の例外経路回帰

### 検証手順

1. `rg -n "console\\." apps/desktop/src/main/services/skill/SkillExecutor.ts`
2. `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillExecutor*.test.ts`
3. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                                                       | 関連Pitfall |
| ---------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------ | ----------- |
| テストファイルへのモック追加漏れ（stdoutにログ漏出） | 高     | 高       | `grep -rn "from.*SkillExecutor" __tests__/` で影響テストを事前特定し全ファイルにモック追加 | P20, P21    |
| ログ引数順序変更によるテスト失敗                     | 中     | 中       | 既存アサーションを確認し、`expect.any(Error)` などで安定化                                 | -           |
| 例外時ログ欠落                                       | 中     | 低       | 置換後に異常系テストを必ず実行                                                             | -           |
| カバレッジ計測の引数誤り                             | 低     | 中       | テストディレクトリを指定（ソースファイルパスではない）                                     | P40         |
| Phase 12反映漏れ                                     | 中     | 中       | Step 1-A〜1-E をチェックリスト化して消化。特にLOGS.md 2ファイル更新必須                    | P1, P3, P25 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` — Skill系Main Processログ規約
- `.claude/skills/aiworkflow-requirements/references/logging-migration-guide.md` — ログ移行の標準手順・パターン・テストテンプレート
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — TASK-FIX-14-1 苦戦箇所7件の詳細
- `.claude/skills/aiworkflow-requirements/references/patterns.md` — ログ関連の成功/失敗パターン
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — 残課題テーブル
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md` — SDK関連残課題
- `.claude/rules/06-known-pitfalls.md` — P20(ログ出力汚染), P21(DI追加時大規模修正), P40(テスト実行ディレクトリ依存)
- `docs/30-workflows/task-fix-14-1-console-log-migration/outputs/phase-12/unassigned-task-detection.md` — 検出レポート

### 完了済み親タスク（実装パターン参照用）

- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/06c-task-fix-14-1-console-log-migration.md` — TASK-FIX-14-1 完了タスク仕様書
- `docs/30-workflows/task-fix-14-1-console-log-migration/` — TASK-FIX-14-1 全Phase成果物

### 参考ソースコード

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` — 移行対象ファイル
- `apps/desktop/src/main/services/skill/SkillImportManager.ts` — 移行済み実装の参照
- `apps/desktop/src/main/services/skill/SkillScanner.ts` — 移行済み実装の参照
- `apps/desktop/src/main/services/skill/PermissionStore.ts` — 移行済み実装の参照
- `apps/desktop/src/main/services/skill/SkillAnalyzer.ts` — 移行済み実装の参照

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
SkillExecutor.ts 内に console.error x2 / console.info x2 が残存（TASK-FIX-14-1 スコープ外）
```

### 補足事項

本タスクは「機能追加」ではなく「ログ方式統一」が目的であり、実行フローやIPC契約の変更は行わない。

### 影響テストファイル一覧（事前調査済み）

以下のテストファイルに `vi.mock("electron-log")` の追加が必要:

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/integration.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/permission.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/performance.test.ts`

### モックテンプレート（logging-migration-guide.md より）

```typescript
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
```

### 移行対象箇所（2026-02-14 時点）

| 行番号     | 種類            | コード                                     | 推奨移行先                         |
| ---------- | --------------- | ------------------------------------------ | ---------------------------------- |
| L1031-1034 | `console.error` | `logError` メソッド内                      | `log.error("[SkillExecutor] ...")` |
| L1213      | `console.error` | `sendHooksStream` 内の例外ハンドリング     | `log.error("[SkillExecutor] ...")` |
| L1434      | `console.info`  | `resolvePermissionRequest` 内の状態通知    | `log.info("[SkillExecutor] ...")`  |
| L1464-1466 | `console.info`  | `handleToolPermissionRequest` 内の状態通知 | `log.info("[SkillExecutor] ...")`  |
