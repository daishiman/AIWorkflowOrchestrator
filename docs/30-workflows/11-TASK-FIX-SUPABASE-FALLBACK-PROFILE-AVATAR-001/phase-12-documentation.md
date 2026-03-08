# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 12                                            |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 11 手動テスト                           |

## 目的

実装ガイド（Part 1/Part 2）、システム仕様書の更新、documentation-changelog の作成、未タスク検出を実施する。

## 実行タスク

### Task 1: 実装ガイド

#### Part 1: 中学生レベル概念説明（`implementation-guide.md`）

**アナロジー: 「受付が不在の窓口」**

> 市役所に行くと、いくつかの窓口があります。「住民票」「税金」「福祉」といった担当窓口があります。
>
> でも、ある日「福祉」の窓口に行ったら、担当者がいません。受付もいません。
> あなたが話しかけても、誰も答えてくれません。困ってしまいますよね。
>
> これが「フォールバックハンドラ未登録」の状態です。
> アプリが「Profile情報をください」とリクエストしても、誰も応答しないのでエラーになってクラッシュします。
>
> **解決策**: 担当者がいなくても、窓口に「本日休業です。環境設定が必要です。」という案内板を置いておきます。
> これなら、誰かが窓口に来ても、案内板が応答してくれます。クラッシュしません。
>
> この「案内板」が、今回追加する **フォールバックハンドラ** です。
> 本物のサービスが使えなくても、「使えません」と丁寧に教えてくれる最低限の応答を用意します。

**含めるべき内容**:

1. フォールバックとは何か（案内板のアナロジー）
2. なぜ必要なのか（誰も応答しないとクラッシュする）
3. どう動くのか（サービスがない → 案内板が応答 → クラッシュしない）

#### Part 2: 開発者向け実装詳細

**含めるべき内容**:

1. `registerProfileFallbackHandlers()` / `registerAvatarFallbackHandlers()` の実装パターン
2. `registerAuthFallbackHandlers()` との構造的一貫性
3. チャンネル列挙方式（`IPC_CHANNELS` 定数 + `ReadonlyArray` タプル）
4. レスポンス構造（`{ success: false, error: { code, message } }`）
5. if/else排他分岐によるP5（二重登録）対策

#### IPC Documentation（該当する場合）

- Profile/Avatar フォールバックチャンネルの仕様を `ipc-documentation.md` に追加

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `.claude/skills/task-specification-creator/LOGS.md` 更新（2ファイル両方 - P1/P25対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル（該当する場合）

- [ ] `api-ipc-auth.md` のフォールバックハンドラ一覧にProfile/Avatar行を追加

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成（P2/P27対策）

#### Step 2: システム仕様更新（該当する場合）

- [ ] `api-ipc-auth.md` にフォールバックチャンネル仕様を追加（Profile 11 + Avatar 3）
- [ ] `error-handling.md` に `PROFILE_NOT_CONFIGURED` / `AVATAR_NOT_CONFIGURED` エラーコードを追加

#### Step 3: IPC契約検証（IPC修正タスクのため必須）

- [ ] `ipc-contract-checklist.md` Phase 1-6 を実施
- [ ] フォールバックハンドラのレスポンス形式がPreload側の期待と一致

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録（漏れの可視化）
- [ ] 全 Step 確認前に「完了」と記載しない（P4対策）

### Task 4: 未タスク検出

- [ ] `outputs/phase-12/unassigned-task-report.md` 作成（0件でも必須）
- [ ] 検出した未タスクは3ステップ全完了（P3対策）:
  1. `unassigned-task/` に指示書作成
  2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータス更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新

#### 検出すべき未タスク候補

- Renderer側のProfile/Avatar画面で `success: false` レスポンスを明示的な分岐で処理しているか
- 他のSupabase依存チャンネル（存在する場合）にもフォールバックが必要ではないか

## 参照資料

| 資料名                  | パス                                                                           | 説明                |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------- |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                           | Phase 12 必須項目   |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P28, P43 |
| 仕様書更新ワークフロー  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-3 手順       |

### システム仕様（aiworkflow-requirements）

- `references/api-ipc-auth.md` - フォールバックチャンネル仕様の更新先
- `references/error-handling.md` - エラーコード追加先
- `LOGS.md` - タスク完了記録
- `SKILL.md` - 変更履歴

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

1. Task 1: 実装ガイド（Part 1/Part 2）を作成
2. Task 2: Step 1-A〜1-D、Step 2、Step 3 を順次実行
3. Task 3: documentation-changelog.md を作成（全Step確認後に完了記載）
4. Task 4: 未タスク検出と3ステップ管理
5. 仕様書更新は3ファイル以下/エージェントに分割（P43対策）

## 成果物

| 成果物                  | パス                                                                                                            | 説明                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 実装ガイド              | `docs/30-workflows/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/implementation-guide.md`                    | Part 1/Part 2           |
| IPC Documentation       | `docs/30-workflows/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/ipc-documentation.md`                       | フォールバックIPC仕様   |
| documentation-changelog | `docs/30-workflows/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/documentation-changelog.md`                 | 変更記録                |
| 未タスクレポート        | `docs/30-workflows/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/outputs/phase-12/unassigned-task-report.md` | 検出結果（0件でも作成） |

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル概念説明）が「案内板」アナロジーを含んで作成済み
- [ ] 実装ガイド Part 2（開発者向け技術詳細）が作成済み
- [ ] LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）更新済み（P1/P25対策）
- [ ] SKILL.md 2ファイル更新済み
- [ ] topic-map.md 再生成済み（P2/P27対策）
- [ ] documentation-changelog.md に全Step完了結果が記録済み
- [ ] 未タスクレポート作成済み（0件でも必須）
- [ ] 検出未タスクの3ステップ管理が全完了（P3対策）

## 次のPhase

Phase 13: PR作成
