# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 12                                 |
| Phase名    | ドキュメント更新                   |
| 前提Phase  | Phase 11（手動検証）               |
| 後続Phase  | Phase 13（PR作成）                 |
| ステータス | 完了                               |
| 作成日     | 2026-02-24                         |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001     |
| 機能名     | データフロー型ギャップ解消         |
| タスク種別 | 仕様書修正のみ（実コード変更なし） |

---

## 目的

実装内容（仕様書修正）を文書化し、システム仕様書を更新する。
未タスクがあれば検出・記録する。

## 背景

ドキュメントは将来のメンテナンスに不可欠である。
仕様書修正と同時にシステム仕様書を更新することで、知識の散逸を防ぐ。

---

## ⚠️ Phase 12 漏れやすいポイント

> **最重要**: Phase 12 は漏れが最も発生しやすい Phase。必ず全項目を逐次確認。

| ID  | ポイント                         | 対策                                                      |
| --- | -------------------------------- | --------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ        | aiworkflow-requirements + task-specification-creator 両方 |
| P2  | topic-map.md 再生成忘れ          | `node generate-index.js` 実行                             |
| P27 | 再生成トリガー判断ミス           | 削除・更新も再生成トリガー                                |
| P29 | SKILL.md 変更履歴更新漏れ        | LOGS.md とは別に SKILL.md も                              |
| P3  | 未タスク3ステップ不完全          | 指示書→残課題テーブル→関連仕様書リンク                    |
| P4  | documentation-changelog 早期完了 | 全 Step 完了前に「完了」と記載しない                      |
| P43 | サブエージェント rate limit 中断 | 仕様書更新は3ファイル以下/エージェントに分割              |

---

## 実行タスク

> 以下のタスクを全て実行してください（5タスク全て必須）。

### タスク1: 実装ガイド作成

**目的**: データフロー型ギャップ解消の概念と技術詳細を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する

#### Part 1: 概念的説明（中学生レベル）

以下の日常的な例えを使って、各Gap修正の概念を説明する:

| Gap | 修正内容                     | 日常の例え                                                                                                       |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | Date型を文字列にする         | 手紙に書く日付は「2026年2月24日」という文字列。コンピュータ内部の日付オブジェクトを手紙に書ける形式に変換する    |
| 2   | DebugSessionにidleを追加     | 信号機に「消灯」状態を追加するようなもの。赤・青・黄だけでなく「まだ電源が入っていない」状態が必要               |
| 3   | onExportの引数を明確にする   | 荷物の発送伝票に「何を」「どこに」「どの形式で」送るかを全部書くようなもの                                       |
| 4   | 変換ロジックを記載する       | レストランの注文で、厨房からの「完成/失敗」報告を、お客様向けの「お待たせしました/申し訳ございません」に翻訳する |
| 5   | イベント購読パターンを記載   | 教室で先生の話を聞く時、入室時に耳を傾け、退室時に聞くのをやめる。2回入室しても2重に聞かない                     |
| 6   | 引数をオブジェクトにまとめる | 注文票に「名前」「品物」「数量」をまとめて書く。バラバラに口頭で伝えると順番を間違えるリスクがある               |

#### Part 2: 技術者向け詳細

以下の技術的トピックを説明する:

1. **Date型のIPC境界での型変換パターン**
   - `Date` オブジェクトが `contextBridge` を通過する際の自動シリアライズの挙動
   - ISO 8601文字列形式への明示的変換の必要性
   - バックエンド型（`Date`）とフロントエンド型（`string`）の明示的な区別

2. **DebugSession.status の拡張と影響範囲**
   - `idle` 状態追加の根拠（デバッグセッション未開始状態の表現）
   - バックエンド（task-9h）とフロントエンド（05B）の両方での型定義統一
   - `switch` 文の網羅性チェックへの影響

3. **docIdベースのデータフロー設計**
   - `onExport` コールバックにおける `docId` パラメータの追加根拠
   - Renderer → IPC → Main → ファイルシステムのデータフロー全体像
   - `ExportResult` から UI コールバック（`onSuccess`/`onError`）への変換ロジック

4. **safeOn購読パターンとP5対策**
   - `useEffect` + cleanup 関数によるリスナー管理
   - React StrictMode での二重実行対策
   - `safeOn` の戻り値（cleanup関数）を `useEffect` の return で使用するパターン

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirements のシステム仕様を更新する

> **重要**: 📖 `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照してください。

**⚠️ 複数ステップで実行:**

#### Step 1-A: タスク完了記録（必須）

以下の全ファイルを更新する:

| 更新対象                                             | 更新内容                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| 関連仕様書（task-workflow.md 等）                    | タスク完了記録を追加                                              |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | UT-IPC-DATA-FLOW-TYPE-GAPS-001 の完了エントリを追加（**P1対策**） |
| `.claude/skills/task-specification-creator/LOGS.md`  | 同上（**P1/P25対策: 2ファイル両方**）                             |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルを更新（**P29対策**）                             |
| `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴テーブルを更新（**P29対策**）                             |

#### Step 1-B: 実装状況テーブル更新（該当する場合）

本タスクは仕様書修正のみのため、関連する実装状況テーブル（`api-endpoints.md` 等）があれば `spec_created` ステータスで更新する。

| 対象テーブル         | 更新内容                                                |
| -------------------- | ------------------------------------------------------- |
| 該当実装状況テーブル | UT-IPC-DATA-FLOW-TYPE-GAPS-001 を `spec_created` で記録 |

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "UT-IPC-DATA-FLOW-TYPE-GAPS-001" .claude/skills/*/references/
```

検索結果に基づき、関連仕様書のタスクテーブルを更新する。

#### Step 1-D: topic-map.md 再生成（P2/P27対策）

```bash
node .claude/skills/task-specification-creator/scripts/generate-index.js
```

> **P27対策**: セクションの追加だけでなく、削除・更新も再生成トリガーに含める。仕様書に変更があれば**必ず再生成を実行**する。

#### Step 2: システム仕様更新（条件付き）

**更新判断基準**:

| 更新が必要な場合         | 更新が不要な場合           |
| ------------------------ | -------------------------- |
| 新規インターフェース追加 | 内部実装の詳細変更のみ     |
| 既存インターフェース変更 | リファクタリング（IF不変） |
| IPC型定義の方針追加      | バグ修正（仕様変更なし）   |

**本タスクの場合**: 仕様書修正のみで新規インターフェース追加はないため、基本的に**不要**。ただし、IPC型定義の方針（Date型シリアライズルール等）を横断的なガイドラインとして追加する場合は更新が**必要**。

#### Step 3: IPC契約検証（本タスクの場合）

本タスクは IPC 仕様書の型定義を修正しているため、以下を確認する:

- [ ] Gap 6 で修正した task-9a のハンドラ引数形式と Preload 側の呼び出し形式が一致していることを確認
- [ ] 引数名のセマンティクスが実際の値と一致（P45対策）
- [ ] P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が仕様書に記載されていることを確認

**期待される成果物**:

- `outputs/phase-12/spec-update-summary.md`

---

### タスク3: ドキュメント更新履歴作成

**目的**: 本タスクで行ったドキュメント更新を記録する

> **P4対策**: 全 Step 確認前に「完了」と記載しない。各 Step の完了結果を詳細に記録する。

**実行手順**:

1. `documentation-changelog.md` を作成する
2. 更新した全仕様書の変更内容を記録する
3. 各 Step（1-A, 1-B, 1-C, 1-D, 2, 3）の完了結果を詳細に記録する
4. `artifacts.json` の Phase 12 ステータスを更新する

**ドキュメント更新履歴テンプレート**:

```markdown
# UT-IPC-DATA-FLOW-TYPE-GAPS-001 ドキュメント更新履歴

## 作成日

2026-02-24

## 更新した仕様書（7ファイル）

| No  | ファイル名                               | 更新内容                             | 対応Gap   |
| --- | ---------------------------------------- | ------------------------------------ | --------- |
| 1   | task-020b-task-9a-skill-editor.md        | IPC引数をオブジェクト形式に統一      | Gap 6     |
| 2   | task-022-task-9f-skill-share.md          | Date型注記追加, ExportResult変換追加 | Gap 1, 4  |
| 3   | task-023a-task-9g-skill-schedule.md      | Date型注記追加                       | Gap 1     |
| 4   | task-023b-task-9h-skill-debug.md         | Date型注記, idle状態, safeOn追加     | Gap 1,2,5 |
| 5   | task-023d-task-9j-skill-analytics.md     | Date型注記追加                       | Gap 1     |
| 6   | task-030-ui-05-skill-center-view.md      | onExport引数, 変換ロジック追加       | Gap 3, 4  |
| 7   | task-031b-ui-05b-skill-advanced-views.md | idle状態, safeOnパターン追加         | Gap 2, 5  |

## システム仕様書更新

### Step 1-A: タスク完了記録

- [ ] 関連仕様書: {{結果}}
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md`: {{結果}}
- [ ] `.claude/skills/task-specification-creator/LOGS.md`: {{結果}}
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md`: {{結果}}
- [ ] `.claude/skills/task-specification-creator/SKILL.md`: {{結果}}

### Step 1-B: 実装状況テーブル

- [ ] {{結果}}

### Step 1-C: 関連タスクテーブル

- [ ] {{結果}}

### Step 1-D: topic-map.md 再生成

- [ ] {{結果}}

### Step 2: システム仕様更新

- [ ] {{判断根拠と結果}}

### Step 3: IPC契約検証

- [ ] {{結果}}
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`
- `artifacts.json` の Phase 12 ステータス更新

---

### タスク4: 未タスク検出レポート作成

**目的**: 残課題や未対応事項を検出・記録する（**0件でも出力必須**）

**実行手順**:

1. Phase 3/10 レビュー結果から未対応指摘を確認する
2. Phase 11 手動テストの発見課題を確認する
3. 仕様書内のコードコメント（TODO, FIXME等）を確認する
4. 検出されなくても「検出タスクなし」と明記する

**検出ソース**:

| ソース            | 確認対象                                  |
| ----------------- | ----------------------------------------- |
| Phase 3 レビュー  | `outputs/phase-3/design-review-result.md` |
| Phase 10 レビュー | `outputs/phase-10/final-review-result.md` |
| Phase 11 発見課題 | `outputs/phase-11/discovered-issues.md`   |
| コードコメント    | 修正した7仕様書内の TODO/FIXME            |

**未タスク管理3ステップ（P3対策）**:

検出した未タスクは以下の3ステップを全て完了する:

1. `docs/30-workflows/unassigned-task/` に指示書を作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

> **P38対策**: 指示書の配置先は `tasks/` 直下ではなく `unassigned-task/` 配下。

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

### タスク5: スキルフィードバックレポート作成

**目的**: 本タスクの実行を通じて得られたスキル改善点を記録する（**改善点なしでも出力必須**、P28対策）

**実行手順**:

1. タスク実行中に気づいたワークフロー改善点を記録する
2. 仕様書テンプレートの改善提案があれば記録する
3. 改善点がない場合は「改善点なし」と判断根拠を記載する

**フィードバック観点**:

| 観点             | 確認内容                                                 |
| ---------------- | -------------------------------------------------------- |
| テンプレート改善 | Phase テンプレートに型ギャップ検出チェックリストが必要か |
| ワークフロー改善 | 仕様書間の型整合性を自動検証する仕組みが必要か           |
| ドキュメント改善 | IPC型変換ルールの横断ガイドラインが必要か                |

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 参照資料              | パス                                                                           | 内容         |
| --------------------- | ------------------------------------------------------------------------------ | ------------ |
| 仕様更新フロー        | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準 |
| Phase 2 設計書        | `phase-2-design.md`                                                            | 設計根拠     |
| Phase 5 修正結果      | `phase-5-implementation.md`                                                    | 修正内容     |
| Phase 6 整合性検証    | `phase-6-test-expansion.md`                                                    | 横断整合     |
| Phase 7 網羅性確認    | `phase-7-coverage-check.md`                                                    | 網羅性       |
| Phase 8 品質改善      | `phase-8-refactoring.md`                                                       | 品質改善内容 |
| Phase 9 品質保証      | `phase-9-quality-assurance.md`                                                 | 品質保証結果 |
| Phase 1 抽出成果物    | `outputs/phase-1/aiworkflow-requirements-extraction.md`                        | 要件抽出根拠 |
| Phase 11 発見課題     | `outputs/phase-11/discovered-issues.md`                                        | 発見課題     |
| Phase 10 レビュー結果 | `outputs/phase-10/final-review-result.md`                                      | 最終レビュー |
| Phase 3 レビュー結果  | `outputs/phase-3/design-review-result.md`                                      | 設計レビュー |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                                        | 内容         |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| IPC仕様                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC定義      |
| インターフェース仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 型定義       |
| IPCセキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC安全性    |
| Skill IPCセキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | Skill安全性  |
| 実装パターン仕様          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装指針     |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約監査     |
| IPC型解決ガイド           | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | 型不整合解決 |
| エラーハンドリング仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗時方針   |
| タスクワークフロー        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 残課題管理   |

---

## 成果物

| 成果物               | パス                                          | 内容                  |
| -------------------- | --------------------------------------------- | --------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | 概念+技術詳細         |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`     | 仕様更新内容          |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 更新履歴              |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md`  | 残課題（0件でも必須） |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`   | 改善提案              |

---

## 完了条件

- [x] 実装ガイド（Part 1: 概念、Part 2: 技術）が作成されている
- [x] システム仕様更新の全 Step（1-A〜3）が実行済み
- [x] LOGS.md が**2ファイル**更新されている（P1/P25対策）
- [x] SKILL.md が**2ファイル**更新されている（P29対策）
- [x] topic-map.md が再生成されている（P2/P27対策）
- [x] ドキュメント更新履歴が作成されている（全 Step 完了後に「完了」記載: P4対策）
- [x] 未タスク検出レポートが作成されている（0件でも必須）
- [x] スキルフィードバックレポートが作成されている（改善点なしでも必須: P28対策）

---

## フォールバック手順

タスク2（システム仕様更新）で更新が不要と判断した場合:

1. `spec-update-summary.md` に「更新不要」と判断根拠を記載
2. 判断根拠例: 「仕様書修正のみで新規インターフェース追加なし。IPC型定義方針の横断ガイドラインは未タスクとして検出済み」

---

## Phase末端アクション【必須】

- [x] 本Phase内の全タスク（5タスク）を100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物（5ファイル + artifacts.json更新）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-13-pr-creation.md`
