# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| タスク ID  | TASK-AUTH-MODE-SELECTION-001                                          |
| Phase      | 12 / 13                                                               |
| 前 Phase   | [Phase 11: 手動テスト](./phase-11-manual-test.md)                     |
| 次 Phase   | [Phase 13: 完了](./phase-13-completion.md)                            |
| Issue      | [#750](https://github.com/your-org/AIWorkflowOrchestrator/issues/750) |
| 作成日     | 2026-02-08                                                            |
| 依存成果物 | Phase 11 手動テスト完了                                               |

---

## 目的

認証方式選択機能の実装ガイド作成、システム仕様書の更新、未タスクの検出を行い、将来のメンテナンス性と知識継承を担保する。

> **最重要**: Phase 12 は漏れが最も発生しやすい Phase。必ず全項目を逐次確認すること。

---

## Task 1: 実装ガイド作成【必須】

### Part 1: 概念説明（中学生レベル）

**出力先**: `outputs/phase-12/implementation-guide.md`

**必須要素**:

- 認証方式選択機能とは何か（日常の例えを使用）
- サブスクリプション認証と API キー認証の違い（図書館カードと入場券の例え等）
- なぜ複数の認証方式が必要なのか
- 概念図（Mermaid または ASCII アート）

**例**:

```markdown
## 認証方式って何？

図書館で本を借りるとき、図書館カードを見せますよね？
これは「あなたが誰か」を確認するためです。

AIWorkflowOrchestrator でも同じように、
「あなたが本当にこのサービスを使える人か」を確認します。

### 2つの認証方式

1. **サブスクリプション認証**（月額会員証）
   - Claude の月額プランに入っている人向け
   - 一度ログインすれば、毎回カードを見せなくてOK

2. **API キー認証**（使った分だけ払う券）
   - 使った分だけ料金を払いたい人向け
   - 毎回「この券を持っています」と見せる必要がある
```

---

### Part 2: 技術詳細（開発者向け）

**必須セクション**:

1. **アーキテクチャ概要**
   - コンポーネント構成図
   - データフロー図
   - 状態管理の仕組み

2. **インターフェース定義**

   ```typescript
   // AuthMode 型定義
   type AuthMode = "subscription" | "api-key";

   // IPC チャンネル一覧
   // Zustand Store 構造
   ```

3. **コード例**
   - 認証方式の切り替え方法
   - 認証状態の取得方法
   - エラーハンドリング

4. **トラブルシューティング**
   - よくある問題と解決方法

---

### IPC/API ドキュメント

**出力先**: `outputs/phase-12/ipc-documentation.md`

**必須項目**:

| チャンネル名         | 方向            | パラメータ         | 戻り値              | 説明               |
| -------------------- | --------------- | ------------------ | ------------------- | ------------------ |
| auth-mode:get        | Renderer → Main | なし               | AuthMode            | 現在の認証方式取得 |
| auth-mode:set        | Renderer → Main | { mode: AuthMode } | Result<void, Error> | 認証方式設定       |
| auth-mode:get-status | Renderer → Main | なし               | AuthModeStatus      | 認証状態取得       |
| auth-mode:validate   | Renderer → Main | なし               | ValidationResult    | 認証方式検証       |
| auth-mode:changed    | Main → Renderer | { mode: AuthMode } | -                   | 方式変更通知       |

---

### コンポーネントドキュメント

**出力先**: `outputs/phase-12/component-documentation.md`

**必須項目**:

| コンポーネント名    | パス                                        | Props                    | 説明                 |
| ------------------- | ------------------------------------------- | ------------------------ | -------------------- |
| AuthModeSelector    | components/settings/AuthModeSelector.tsx    | AuthModeSelectorProps    | 認証方式選択 UI      |
| AuthStatusIndicator | components/settings/AuthStatusIndicator.tsx | AuthStatusIndicatorProps | 認証状態表示         |
| ApiKeyInput         | components/settings/ApiKeyInput.tsx         | ApiKeyInputProps         | API キー入力フォーム |

---

## Task 2: システムドキュメント更新【必須】

### Step 1-A: タスク完了記録

- [ ] `interfaces-auth.md` に完了タスクセクション追加

  ```markdown
  ## 完了タスク

  ### TASK-AUTH-MODE-SELECTION-001（2026-02-08）

  - 認証方式選択 UI の実装
  - サブスクリプション/API キー認証の切り替え機能
  - 認証状態の可視化
  ```

- [ ] `aiworkflow-requirements/LOGS.md` 更新

  ```markdown
  ## 2026-02-08

  - TASK-AUTH-MODE-SELECTION-001: 認証方式選択機能の実装完了
  ```

- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方を忘れずに**）

  ```markdown
  ## 2026-02-08

  - TASK-AUTH-MODE-SELECTION-001: Phase 12 ドキュメント更新完了
  ```

- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新

- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

---

### Step 1-B: 実装状況テーブル更新（該当する場合）

`api-endpoints.md` または `ipc-channels.md` に新規チャンネルを追加:

```markdown
| auth:get-mode | Renderer → Main | 認証方式取得 | ✅ 実装済み |
| auth:set-mode | Renderer → Main | 認証方式設定 | ✅ 実装済み |
```

---

### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-AUTH-MODE-SELECTION-001" references/
```

検索結果に基づき、関連仕様書のタスクテーブルを更新。

---

### Step 1-D: topic-map.md 再生成

```bash
node generate-index.js
```

> **P2 防止**: 仕様書更新後は必ず topic-map.md を再生成すること。

---

### Step 2: システム仕様更新（該当する場合）

新規インターフェース・アーキテクチャ変更がある場合のみ:

- [ ] `architecture-auth-security.md` の更新
- [ ] `security-principles.md` への追記
- [ ] 関連するアーキテクチャ図の更新

---

## Task 3: ドキュメント更新履歴【必須】

**出力先**: `outputs/phase-12/documentation-changelog.md`

**記録内容**:

```markdown
# Documentation Changelog

## TASK-AUTH-MODE-SELECTION-001

### 更新日: 2026-02-08

### Step 1-A: タスク完了記録

- [ ] interfaces-auth.md:
- [ ] aiworkflow-requirements/LOGS.md:
- [ ] task-specification-creator/LOGS.md:
- [ ] SKILL.md (両方):

### Step 1-B: 実装状況テーブル

- [ ] 対象ファイル:
- [ ] 更新内容:

### Step 1-C: 関連タスクテーブル

- [ ] 検索結果:
- [ ] 更新したファイル:

### Step 1-D: topic-map.md

- [ ] 再生成実行:
- [ ] 差分確認:

### Step 2: システム仕様

- [ ] 該当: あり / なし
- [ ] 更新内容:

### 完了確認

- [ ] 全 Step 確認完了
```

> **P4 防止**: 全 Step 確認前に「完了」と記載しないこと。

---

## Task 4: 未タスク検出【必須】

> 0 件でも検出プロセスの実行と結果出力は必須。

### 検出対象

1. **Phase 3/10 レビューの MINOR 指摘**
   - Phase 3 設計レビューの未対応指摘
   - Phase 10 最終レビューの未対応指摘

2. **Phase 11 手動テストのスコープ外発見**
   - テスト中に発見した関連問題
   - 改善提案

3. **コードコメントの TODO/FIXME**
   ```bash
   grep -rn "TODO\|FIXME" apps/desktop/src/
   ```

---

### 未タスク登録プロセス（3ステップ全完了必須）

検出した未タスクは以下の3ステップを全て完了すること:

#### Step 1: 指示書作成

```
unassigned-task/TASK-AUTH-MODE-SELECTION-001-UNASSIGNED-{連番}.md
```

**テンプレート**:

```markdown
# 未タスク: [タイトル]

## 検出元

- タスク ID: TASK-AUTH-MODE-SELECTION-001
- 検出 Phase: Phase 10/11/コードコメント
- 検出日: 2026-02-08

## 内容

[詳細説明]

## 影響範囲

[影響を受けるファイル・機能]

## 推奨対応時期

- [ ] 即時（次スプリント）
- [ ] 中期（1-2ヶ月以内）
- [ ] 長期（余裕があるとき）

## 関連ファイル

- `path/to/file.ts`
```

#### Step 2: 残課題テーブルに登録

`task-workflow.md` の残課題テーブルに追加。

#### Step 3: 関連仕様書にリンク追加

検出元の仕様書に未タスクへの参照リンクを追加。

---

### 未タスク検出結果レポート

**出力先**: `outputs/phase-12/unassigned-task-report.md`

```markdown
# 未タスク検出結果

## 検出サマリー

| 検出元              | 件数 |
| ------------------- | ---- |
| Phase 3 MINOR       |      |
| Phase 10 MINOR      |      |
| Phase 11 スコープ外 |      |
| TODO/FIXME          |      |
| **合計**            |      |

## 検出一覧

（0件の場合も「検出なし」と明記）
```

---

### artifacts.json 更新

Phase 12 のステータスを更新:

```json
{
  "phases": {
    "12": {
      "status": "completed",
      "artifacts": [
        "implementation-guide.md",
        "ipc-documentation.md",
        "component-documentation.md",
        "documentation-changelog.md",
        "unassigned-task-report.md"
      ]
    }
  }
}
```

---

## 成果物

| 成果物                     | パス                                          |
| -------------------------- | --------------------------------------------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`    |
| IPC ドキュメント           | `outputs/phase-12/ipc-documentation.md`       |
| コンポーネントドキュメント | `outputs/phase-12/component-documentation.md` |
| 更新履歴                   | `outputs/phase-12/documentation-changelog.md` |
| 未タスクレポート           | `outputs/phase-12/unassigned-task-report.md`  |
| 未タスク指示書             | `unassigned-task/` (該当する場合)             |

---

## 統合テスト連携【必須】

ドキュメント更新時に統合テスト関連ドキュメントを確認:

| 確認項目               | 確認内容                                            | 結果 |
| ---------------------- | --------------------------------------------------- | ---- |
| IPC ドキュメント       | auth-mode:\* チャンネルの API ドキュメント作成      | [ ]  |
| テストガイド           | 統合テスト実行手順がドキュメント化されている        | [ ]  |
| アーキテクチャ図       | Renderer → Main → Store のフロー図が更新されている  | [ ]  |
| 認証フロー説明         | subscription/api-key 切り替えフローが説明されている | [ ]  |
| トラブルシューティング | 認証エラー時の対処法がドキュメント化されている      | [ ]  |

---

## 完了条件

### Task 1: 実装ガイド

- [ ] Part 1（概念説明）作成完了
- [ ] Part 2（技術詳細）作成完了
- [ ] IPC ドキュメント作成完了
- [ ] コンポーネントドキュメント作成完了

### Task 2: システムドキュメント

- [ ] Step 1-A: タスク完了記録（5項目全て）
- [ ] Step 1-B: 実装状況テーブル（該当する場合）
- [ ] Step 1-C: 関連タスクテーブル
- [ ] Step 1-D: topic-map.md 再生成
- [ ] Step 2: システム仕様更新（該当する場合）

### Task 3: 更新履歴

- [ ] documentation-changelog.md 作成
- [ ] 各 Step の完了結果記録

### Task 4: 未タスク検出

- [ ] 検出プロセス実行
- [ ] unassigned-task-report.md 作成（0件でも必須）
- [ ] 検出した未タスクの3ステップ完了（該当する場合）
- [ ] artifacts.json 更新

---

## 次 Phase

**Phase 13: 完了**

全ドキュメント更新を完了したら、[Phase 13](./phase-13-completion.md) で最終確認と PR 作成を実施する。
