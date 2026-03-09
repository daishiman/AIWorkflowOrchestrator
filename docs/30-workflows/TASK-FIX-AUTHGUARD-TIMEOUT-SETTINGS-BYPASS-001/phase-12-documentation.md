# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 12                                             |
| Phase名    | ドキュメント                                   |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 11                                       |
| 後続Phase  | Phase 13                                       |

## 目的

実装ガイド・システム仕様更新・未タスク検出を行い、ドキュメントと実装の整合性を確保する。

## 重要な注意事項

> **最重要**: Phase 12 は漏れが最も発生しやすい Phase。必ず全項目を逐次確認。
> P1, P2, P3, P4, P25, P43, P51 参照。

## 実行タスク

### Task 1: 実装ガイド

#### 1-1: implementation-guide.md Part 1（中学生レベル概念説明）

**目的**: 技術に詳しくない人でも理解できる概念説明を作成する

**比喩**: 「ドアの前で鍵の確認が終わらないなら、別の入口を用意する」

**内容**:

- **AuthGuardタイムアウトとは**: 家のドアの前で鍵を探しているとき、10秒経っても見つからなかったら「鍵が見つかりません。もう一度探しますか？それとも裏口から入りますか？」と教えてくれる仕組み
- **Settings除外ルートとは**: 家の中にある電気のブレーカーのような重要な設備に、鍵がなくてもアクセスできる特別な入口を用意すること。鍵が壊れていても、ブレーカーは操作できる必要がある
- **なぜ必要か**: 鍵の確認（認証チェック）がずっと終わらないと、家に入れなくなる。でも電気のブレーカー（Settings）は鍵に関係なく操作できるべき

#### 1-2: implementation-guide.md Part 2（開発者向け実装詳細）

**内容**:

- 状態遷移図（Phase 2 の図を転載）
- 変更ファイル一覧と変更内容の要約
- `getAuthState` の拡張（`isTimedOut` パラメータ）
- `useAuthState` のタイムアウトロジック
- `AuthTimeoutFallback` のUI構成
- Settings 除外ルートのルーティング構造
- P31/P48 準拠のポイント
- テスト実装のポイント（P13/P39準拠）

#### 1-3: component-documentation.md

**内容**:

- `AuthTimeoutFallback` コンポーネントの Props/使用例/デザイントークン
- `useAuthState` フックの拡張仕様
- `getAuthState` 関数の新パラメータ仕様

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/component-documentation.md`

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方** — P1/P25対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル（該当する場合）

- [ ] 認証関連の仕様書の実装ステータス更新

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-FIX-AUTHGUARD" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成（P2/P27対策）

#### Step 2: システム仕様更新（該当する場合）

- [ ] `arch-state-management.md` — AuthGuard の状態遷移図更新
- [ ] `ui-ux-*.md` — AuthTimeoutFallback コンポーネントの追加記録
- [ ] `security-*.md` — Settings 除外ルートのセキュリティ記録

#### Step 3: IPC 契約検証（本タスクでは該当しない）

- IPC 修正タスクではないため、Step 3 はスキップ

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録（漏れの可視化）
- DON'T: 全 Step 確認前に「完了」と記載しない（P4/P51対策）

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` 作成（**0件でも必須**）
- [ ] 検出した未タスクは3ステップ全完了（P3/P38対策）:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新

**予想される未タスク候補**:

| #   | 内容                                                | 理由                                                     |
| --- | --------------------------------------------------- | -------------------------------------------------------- |
| 1   | Settings 画面内のプロファイルセクション条件付き表示 | 未認証時にプロファイルセクションを非表示にすべき可能性   |
| 2   | AuthTimeoutFallback のアニメーション追加            | LoadingScreen → AuthTimeoutFallback の遷移アニメーション |
| 3   | タイムアウト時間の設定可能化                        | 10秒固定ではなくユーザー設定可能にする可能性             |

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`
- 検出した未タスクの指示書（`docs/30-workflows/unassigned-task/` に配置）

## サブエージェント分割ガイドライン（P43対策）

- 仕様書更新は **3ファイル以下/エージェント** に分割する
- LOGS.md への「完了」記録は **全ファイル更新後の最終ステップ** とする
- 中断後は `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認

## 参照資料

| 参照資料                | パス                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| Phase 11 手動テスト結果 | `docs/30-workflows/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-11-manual-test.md` |
| spec-update-workflow.md | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`                |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                                       |

## 統合テスト連携

- 仕様書更新後に `node generate-index.js` で topic-map.md を再生成

## 成果物

| 成果物                         | パス                                          |
| ------------------------------ | --------------------------------------------- |
| 実装ガイド                     | `outputs/phase-12/implementation-guide.md`    |
| コンポーネントドキュメント     | `outputs/phase-12/component-documentation.md` |
| documentation-changelog        | `outputs/phase-12/documentation-changelog.md` |
| 未タスクレポート               | `outputs/phase-12/unassigned-task-report.md`  |
| 未タスク指示書（該当する場合） | `docs/30-workflows/unassigned-task/`          |

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル説明）が作成されていること
- [ ] 実装ガイド Part 2（開発者向け詳細）が作成されていること
- [ ] コンポーネントドキュメントが作成されていること
- [ ] LOGS.md が2ファイル両方更新されていること（P1/P25対策）
- [ ] SKILL.md が2ファイル両方更新されていること
- [ ] topic-map.md が再生成されていること（P2/P27対策）
- [ ] documentation-changelog.md が全 Step 完了後に作成されていること（P4/P51対策）
- [ ] 未タスクレポートが作成されていること（0件でも必須）
- [ ] 検出した未タスクが3ステップ全完了していること（P3/P38対策）
- [ ] artifacts.json が更新されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 13: 完了へ進む。成果物最終確認・PR準備を行う。
