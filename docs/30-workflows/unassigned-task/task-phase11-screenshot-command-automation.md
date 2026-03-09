# UT-IMP-PHASE11-SCREENSHOT-COMMAND-AUTOMATION-001 Phase 11 screenshot コマンド自動登録基盤 - タスク指示書

## メタ情報

```yaml
issue_number: 1113
```

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UT-IMP-PHASE11-SCREENSHOT-COMMAND-AUTOMATION-001 |
| タスク名     | Phase 11 screenshot コマンド自動登録基盤         |
| 分類         | 改善                                             |
| 対象機能     | Phase 11 手動テスト基盤                          |
| 優先度       | 中                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | TASK-10A-G Phase 12                              |
| 発見日       | 2026-03-09                                       |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-G で Phase 11 の screenshot 証跡を取得する際、タスク固有の screenshot コマンドが `apps/desktop/package.json` に登録されておらず、毎回手動で `scripts/capture-task-xxx-phase11.mjs` を作成し、`package.json` の `scripts` セクションに `screenshot:task-xxx` を追加する作業が必要だった。この作業は属人的で、手順を知らない開発者が再監査時に同じ壁にぶつかる。

### 1.2 現在の問題

1. 各タスクごとに screenshot スクリプト（`.mjs`）を手動作成している
2. `package.json` への script 登録も手動
3. テストケース ID（TC-11-01 等）とスクリーンショットファイル名の対応を手動管理
4. Phase 11 の `phase-11-manual-test.md` に記載するコマンドと実際のスクリプトが乖離しやすい

### 1.3 放置した場合の影響

1. 新しいタスクの Phase 11 で毎回 screenshot 基盤を再構築する手戻りが発生
2. テストケースと証跡ファイルの対応が不整合になり、`validate-phase11-screenshot-coverage` が失敗する
3. 再監査時に「どのコマンドで screenshot を取得したか」が不明になる

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 の screenshot 証跡取得を自動化し、タスクごとの手動スクリプト作成・登録作業を不要にする。

### 2.2 完了イメージ

1. タスク仕様書生成時に screenshot スクリプトテンプレートが自動生成される
2. `package.json` への script 登録が自動化されている
3. `phase-11-manual-test.md` のテストケーステーブルから TC-ID を抽出し、`phase11-capture-metadata.json` が自動生成される
4. `validate-phase11-screenshot-coverage` が自動生成されたメタデータで正常動作する

### 2.3 スコープ（含む / 含まない）

#### 含むもの

- screenshot スクリプトテンプレートの自動生成スクリプト
- `package.json` への script 自動登録スクリプト
- TC-ID からメタデータ JSON を自動生成するスクリプト
- 既存の `validate-phase11-screenshot-coverage` との整合性維持

#### 含まないもの

- スクリーンショット撮影ツール（Playwright / Electron capturePage）そのものの刷新
- Phase 11 手動テスト手順の根本的な再設計
- 既存タスクの screenshot スクリプトの遡及的な書き換え

### 2.4 成果物

- `apps/desktop/scripts/generate-screenshot-template.js` - テンプレート自動生成スクリプト
- `apps/desktop/scripts/register-screenshot-command.js` - package.json 自動登録スクリプト
- `apps/desktop/scripts/generate-phase11-metadata.js` - メタデータ JSON 自動生成スクリプト
- 本未タスク指示書

## 3. どのように実行するか（How）

### 3.1 技術方針

1. `task-specification-creator` の create モードに、Phase 11 用 screenshot スクリプトテンプレートの自動生成を組み込む
2. テンプレートは `apps/desktop/scripts/capture-task-{taskId}-phase11.mjs` を生成する
3. `package.json` への `screenshot:{taskId}` 登録を自動化するスクリプトを追加する
4. `phase-11-manual-test.md` のテストケーステーブルから TC-ID を抽出し、`phase11-capture-metadata.json` を自動生成する

### 3.2 実装課題と解決策（親タスクからの教訓）

| 課題                        | 発見経緯                                                                | 解決策                                                             | 教訓                                                                     |
| --------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| screenshot コマンド未登録   | Phase 11 で証跡を取ろうとしたら実行経路がなかった                       | `capture-task-045-lifecycle-test-hardening-phase11.mjs` を手動作成 | タスク仕様書生成時に screenshot スクリプトのテンプレートも同時生成すべき |
| TC-ID と png の対応手動管理 | `validate-phase11-screenshot-coverage` で未紐付けが検出された           | `phase11-capture-metadata.json` を手動作成                         | メタデータも自動生成すべき                                               |
| `NON_VISUAL` 固定の判断ミス | tests-only タスクだから screenshot 不要と判断したが、ユーザーが要求した | 再監査で TC 単位証跡を追加                                         | 「非視覚だから不要」という前提を禁止し、要求ベースで判断する             |

## 4. 実行手順

### Phase 構成

- Phase A: テンプレート生成スクリプト作成
- Phase B: package.json 自動登録スクリプト作成
- Phase C: メタデータ JSON 自動生成スクリプト作成
- Phase D: 統合テスト・既存検証ツールとの整合性確認

### Phase A: テンプレート生成スクリプト作成

#### 目的

タスクIDを指定するだけで、Phase 11 用 screenshot スクリプト（`.mjs`）を自動生成する。

#### 手順

1. 既存の `capture-task-045-lifecycle-test-hardening-phase11.mjs` をベースにテンプレートを抽出する
2. `generate-screenshot-template.js` を作成し、`--task-id` オプションでタスクIDを受け取る
3. 出力先を `apps/desktop/scripts/capture-task-{taskId}-phase11.mjs` とする

#### 成果物

- `apps/desktop/scripts/generate-screenshot-template.js`

#### 完了条件

- `node scripts/generate-screenshot-template.js --task-id test-001` で `.mjs` ファイルが生成される

### Phase B: package.json 自動登録スクリプト作成

#### 目的

生成した screenshot スクリプトを `package.json` の `scripts` セクションに自動登録する。

#### 手順

1. `register-screenshot-command.js` を作成する
2. `package.json` を読み込み、`scripts` に `screenshot:{taskId}` を追加して書き戻す
3. 既存エントリとの重複チェックを実装する

#### 成果物

- `apps/desktop/scripts/register-screenshot-command.js`

#### 完了条件

- `node scripts/register-screenshot-command.js --task-id test-001` で `package.json` に `screenshot:test-001` が登録される

### Phase C: メタデータ JSON 自動生成スクリプト作成

#### 目的

`phase-11-manual-test.md` のテストケーステーブルから TC-ID を抽出し、`phase11-capture-metadata.json` を自動生成する。

#### 手順

1. `generate-phase11-metadata.js` を作成する
2. `phase-11-manual-test.md` を Markdown パーサーでテーブル行を抽出する
3. TC-ID と対応するスクリーンショットファイル名を JSON 形式で出力する

#### 成果物

- `apps/desktop/scripts/generate-phase11-metadata.js`

#### 完了条件

- TC-ID を含むテストケーステーブルから `phase11-capture-metadata.json` が生成される

### Phase D: 統合テスト・既存検証ツールとの整合性確認

#### 目的

生成されたスクリプト群と既存の `validate-phase11-screenshot-coverage` が正常に連携することを確認する。

#### 手順

1. テスト用タスクIDで Phase A-C を一通り実行する
2. `validate-phase11-screenshot-coverage` で PASS を確認する
3. 不整合があれば修正する

#### 成果物

- 統合テスト結果ログ

#### 完了条件

- 全スクリプトが連携して動作し、coverage 検証が PASS する

## 5. 完了条件チェックリスト

### 機能要件

- [ ] screenshot スクリプトテンプレートの自動生成が動作する
- [ ] `package.json` への script 登録が自動化されている
- [ ] TC-ID からメタデータ JSON を自動生成できる
- [ ] 既存の `validate-phase11-screenshot-coverage` との整合性が維持されている

### 品質要件

- [ ] 生成されたスクリプトが `pnpm lint` を通過する
- [ ] 重複登録時にエラーハンドリングされる
- [ ] 不正なタスクIDに対してバリデーションエラーが返る

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に作成済み
- [ ] `task-workflow.md` に残課題として登録済み
- [ ] `lessons-learned.md` に関連教訓として追記済み

## 6. 検証方法

### テストケース

| 対象                  | コマンド                                                                  | 合格条件                                                 |
| --------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| テンプレート生成      | `node scripts/generate-screenshot-template.js --task-id test-001`         | `scripts/capture-task-test-001-phase11.mjs` が生成される |
| package.json 登録     | `grep "screenshot:test-001" apps/desktop/package.json`                    | 1件ヒットする                                            |
| メタデータ生成        | `test -f outputs/phase-11/phase11-capture-metadata.json`                  | ファイルが存在する                                       |
| coverage 検証         | `validate-phase11-screenshot-coverage --workflow <dir>`                   | PASS                                                     |
| 重複登録ガード        | `node scripts/register-screenshot-command.js --task-id test-001`（2回目） | エラーまたはスキップメッセージが出力される               |
| 不正ID バリデーション | `node scripts/generate-screenshot-template.js --task-id ""`               | バリデーションエラーが返る                               |

## 7. リスクと対策

| リスク                                                             | 影響度 | 発生確率 | 対策                                                                                     |
| ------------------------------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------------- |
| テンプレートの抽象度が不足し、タスク固有のカスタマイズが必要になる | 中     | 中       | テンプレートにカスタマイズポイント（TC-ID リスト、出力ディレクトリ等）を変数化しておく   |
| `phase-11-manual-test.md` のテーブル形式がタスクごとに異なる       | 中     | 低       | テーブル形式を正規表現で柔軟にパースし、認識できない形式の場合はエラーを返す             |
| `package.json` の手動編集との競合                                  | 低     | 低       | JSON パーサーで読み書きし、フォーマット保持に `JSON.stringify(data, null, 2)` を使用する |
| 既存タスクのスクリプトとの命名衝突                                 | 低     | 低       | 生成前に既存ファイルの存在チェックを行い、上書き確認を求める                             |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/scripts/capture-task-045-lifecycle-test-hardening-phase11.mjs` - TASK-10A-G で手動作成した実例
- `apps/desktop/package.json` - `screenshot:task-045-lifecycle-test-hardening` の登録例
- `.claude/skills/task-specification-creator/references/execute-workflow.md` - Phase 11 実行ガイド
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` - screenshot 関連教訓

### 関連 Pitfall

- P53: CLI 環境でのスクリーンショット取得制約

### 関連未タスク

- `task-10a-b-phase11-screenshot-freshness-guard.md` - Phase 11 画面証跡鮮度ガード（関連する証跡品質改善タスク）

## 9. 備考

### 発見経緯

TASK-10A-G（lifecycle test hardening）の Phase 11 で screenshot 証跡を取得しようとした際、実行経路が存在せず手動でスクリプトを作成する必要があった。この手戻りは全タスクの Phase 11 で繰り返し発生するため、自動化基盤として切り出した。

### 補足事項

本タスクは Phase 11 の screenshot 基盤自動化であり、スクリーンショット撮影ツールそのもの（Playwright / Electron capturePage）の刷新は対象外とする。「非視覚だから screenshot 不要」という前提は禁止し、要求ベースで判断するルールを組み込む。
