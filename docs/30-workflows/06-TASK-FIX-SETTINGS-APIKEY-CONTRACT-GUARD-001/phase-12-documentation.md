# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 12                                               |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| ステータス | 未実施                                           |

## 目的

実装内容を文書化し、システム仕様書との同期を完了する。Phase 12 は漏れが最も発生しやすい Phase であるため、全チェック項目を逐次確認する。

## 実行タスク

### Task 1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明（日常例え必須）

**テンプレート**:

> **4 層防御って何？**
>
> 宅配便で届いた荷物を想像してみてください。
>
> 1. **玄関のドアは開くか？**（`window.electronAPI?.apiKey` の存在チェック）
>    → そもそも荷物を受け取る場所がなかったら、「届きませんでした」と伝える
> 2. **荷物は届いたか？**（`result.success` のチェック）
>    → 配送業者が「配達失敗」と言ったら、理由を確認する
> 3. **中身は壊れていないか？**（`Array.isArray(result.data?.providers)` の配列型検証）
>    → 箱を開けて中身がグチャグチャだったら、中身を使わない
> 4. **壊れていたらどうする？**（フォールバック UI 表示）
>    → 壊れていても玄関のドアは壊れない。「中身に問題がありました」と表示する
>
> 大事なのは、**荷物が壊れていても家（アプリ画面）は壊れない**ということです。

#### Part 2: 開発者向け実装詳細

**データフロー図**:

```
Renderer (ApiKeysSection)
  │
  ├─ Layer 1: window.electronAPI?.apiKey 存在チェック
  │   └─ undefined → エラー表示 + 再試行ボタン
  │
  ├─ const result = await window.electronAPI.apiKey.list()
  │
  ├─ Layer 2: result.success チェック
  │   └─ false → result.error.message を表示
  │
  ├─ Layer 3: Array.isArray(result.data?.providers)
  │   └─ false → providers = [] にフォールバック + console.warn
  │
  └─ Layer 4: providers.map(p => <ProviderRow />) で表示
      └─ 空配列 → 「API キーが未登録です」を表示

Main Process (apiKeyHandlers.ts)
  │
  ├─ apiKey:list ハンドラ
  │   ├─ apiKeyValidator.listProviderStatuses() を呼び出し
  │   └─ IPCResponse<ProviderListResult> envelope で返却
  │
  └─ エラー時: IPCError { code: "INTERNAL_ERROR", message: sanitized } を返却

型定義:
  ProviderStatus { provider, displayName, status, lastValidatedAt }
  ProviderListResult { providers: ProviderStatus[], registeredCount, totalCount }
  IPCResponse<T> { success: boolean, data?: T, error?: IPCError }
```

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] `ui-ux-settings.md` にタスク完了記録を追加（v1.5.0 異常系表示仕様の実装完了）
- [ ] `security-electron-ipc.md` にタスク完了記録を追加（v1.13.0 4層防御の適用完了）
- [ ] `aiworkflow-requirements/LOGS.md` 更新 **（2 ファイルのうち 1 つ目 / P1・P25 対策）**
- [ ] `task-specification-creator/LOGS.md` 更新 **（2 ファイルのうち 2 つ目 / P1・P25 対策）**
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成 **（P2・P27 対策: セクション変更があれば必ず再生成）**

#### Step 2: システム仕様更新

- [ ] `api-ipc-system.md`: IPC contract drift と fallback 方針を同期
- [ ] `ui-ux-settings.md`: ApiKeysSection 異常系表示仕様の反映確認

### Task 3: documentation-changelog.md

以下のテンプレートで変更内容を記録する。

```markdown
## 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

### 変更した仕様書

| ファイル                           | 変更内容                                    | Step     |
| ---------------------------------- | ------------------------------------------- | -------- |
| ui-ux-settings.md                  | ApiKeysSection 異常系表示仕様の実装完了記録 | Step 1-A |
| security-electron-ipc.md           | 4層防御 ApiKeysSection 適用完了記録         | Step 1-A |
| aiworkflow-requirements/LOGS.md    | タスク完了記録追加                          | Step 1-A |
| task-specification-creator/LOGS.md | タスク完了記録追加                          | Step 1-A |
| topic-map.md                       | 再生成                                      | Step 1-D |
| api-ipc-system.md                  | apiKey:list の fallback 方針追加            | Step 2   |

### 完了ステータス

- [ ] Step 1-A 完了
- [ ] Step 1-C 完了
- [ ] Step 1-D 完了
- [ ] Step 2 完了（該当する場合）
```

**注意**: 全 Step 確認前に「完了」と記載しない（P4 対策）

### Task 4: 未タスク検出（0 件でも出力必須）

- [ ] `unassigned-task-report.md` 作成
- [ ] 検出した未タスクは 3 ステップ全完了（P3 対策）:
  1. `tasks/unassigned-task/` に指示書作成（`tasks/` 直下ではない / P38 対策）
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新

**検出候補**:

- Main Process 側 providers 配列要素バリデーション未実施（RSK-001）
- profileHandlers の identities 防御パターン不統一（RSK-002）
- 正規化ヘルパー抽出（3 箇所目発生時）

### Task 5: スキルフィードバックレポート（改善点なしでも出力必須 / P28 対策）

- [ ] `skill-feedback-report.md` 作成
- [ ] task-specification-creator への改善提案を記録
- [ ] aiworkflow-requirements への改善提案を記録

## LOGS.md 2 ファイル更新チェックリスト（P1/P25 対策）

```bash
# 更新後に必ず確認
grep -l "TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001" \
  .claude/skills/aiworkflow-requirements/LOGS.md \
  .claude/skills/task-specification-creator/LOGS.md
# → 2 ファイルが出力されること
```

## 参照資料

| 資料名                     | パス                                                                                 | 用途                        |
| -------------------------- | ------------------------------------------------------------------------------------ | --------------------------- |
| spec-update-workflow       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | 仕様書更新手順              |
| unassigned-task-guidelines | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク検出ルール          |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                | 異常系表示仕様（v1.5.0）    |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         | 4 層防御パターン（v1.13.0） |
| known-pitfalls P1/P2/P3/P4 | `.claude/rules/06-known-pitfalls.md`                                                 | Phase 12 再発防止           |

## 成果物

| 成果物             | パス                                            | 説明                         |
| ------------------ | ----------------------------------------------- | ---------------------------- |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`      | Part 1 / Part 2 のガイド     |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`   | 変更履歴                     |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md` | 残課題の抽出結果             |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`     | task-spec skill への改善提案 |

## 完了条件

- [ ] implementation-guide が Part 1（日常例え付き）/ Part 2（データフロー図付き）の 2 構成で作成されている
- [ ] LOGS.md が **2 ファイル両方** 更新されている（P1/P25 対策）
- [ ] topic-map.md が再生成されている（P2/P27 対策）
- [ ] documentation-changelog に全 Step の完了結果が記録されている（P4 対策）
- [ ] unassigned-task-detection が作成されている（0 件でも必須）
- [ ] 未タスクは 3 ステップ全完了している（P3/P38 対策）
- [ ] skill-feedback-report が作成されている（改善点なしでも必須 / P28 対策）
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次の Phase

Phase 13: PR 作成
