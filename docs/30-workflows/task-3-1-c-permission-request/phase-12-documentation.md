# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 12                          |
| Phase名    | ドキュメント更新            |
| 前提Phase  | Phase 11                    |
| 後続Phase  | Phase 13                    |
| ステータス | 未実施                      |
| 作成日     | 2026-01-25                  |
| 機能名     | PermissionRequest Hook 統合 |

---

## 目的

ドキュメント更新、仕様反映、未タスク検出を行う。

## 背景

手動テスト検証が完了した。
本 Phase では、実装内容をドキュメントに反映し、残課題を検出する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成（2パート構成必須）

**目的**: 実装内容を説明するガイドを作成する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する

**Part 1: 概念的説明**

```markdown
# PermissionRequest Hook 統合 - 実装ガイド

## 概要

PermissionRequest Hook は、Claude Agent SDK のスキル実行時に、
ユーザーからの承認が必要なツール操作について確認を求める機能です。

## 機能の目的

- **安全性の確保**: 危険な操作の前にユーザーの確認を得る
- **透明性の向上**: 実行される操作を事前に表示する
- **制御の提供**: ユーザーが操作を許可または拒否できる

## 動作フロー

1. スキル実行中にツール操作が発生
2. 権限確認が必要な場合、ダイアログが表示される
3. ユーザーが「許可」または「拒否」を選択
4. 選択に応じて操作が続行または中止される

## 対応ツール

- Bash: コマンド実行
- Write: ファイル作成
- Edit: ファイル編集
- Read: ファイル読み取り
- その他のツール
```

**Part 2: 技術的詳細**

```markdown
## 技術的詳細

### アーキテクチャ
```

Main Process Renderer Process
┌─────────────────┐ ┌─────────────────┐
│ SkillExecutor │─────IPC────▶│ PermissionDialog│
│ │◀────────────│ │
│ Permission │ │ │
│ Resolver │ │ │
└─────────────────┘ └─────────────────┘

````

### 主要コンポーネント

1. **SkillExecutor.createHooks()**
   - PermissionRequest Hook を含む Hooks オブジェクトを作成
   - SDK の query() に渡される

2. **PermissionResolver**
   - 権限リクエストの待機と解決を管理
   - タイムアウト処理を含む

3. **IPC チャネル**
   - `skill:permission:request`: 権限リクエスト送信
   - `skill:permission:response`: 権限応答受信

### 使用方法

```typescript
// SkillExecutor の使用例
const executor = new SkillExecutor(mainWindow);

// 権限応答の処理
executor.handlePermissionResponse(requestId, true); // 承認
executor.handlePermissionResponse(requestId, false, false, "理由"); // 拒否
````

````

**期待される成果物**:

- `docs/guides/permission-request-hook.md`

---

### タスク2: システム仕様書更新（aiworkflow-requirements）【重要】

**目的**: 実装内容をシステム仕様書に反映する

> **必須**: `references/spec-update-workflow.md` を読み込む

**⚠️ 2ステップで実行:**

**Step 1: タスク完了記録（必須）**

以下のチェックリストを実行:

- [ ] 該当する仕様書（`interfaces-agent-sdk.md`）に「## 完了タスク」セクションを追加
- [ ] 「## 関連ドキュメント」に実装ガイドリンクを追加

**完了タスク記録テンプレート**:

```markdown
## 完了タスク

| タスクID   | タイトル                    | 完了日     | 実装ファイル                                |
| ---------- | --------------------------- | ---------- | ------------------------------------------- |
| TASK-3-1-C | PermissionRequest Hook 統合 | 2026-01-XX | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |

## 関連ドキュメント

- [PermissionRequest Hook 実装ガイド](../../../docs/guides/permission-request-hook.md)
````

**Step 2: システム仕様更新（条件付き）**

更新判断基準に基づき更新要否を判断:

| 更新が必要な場合             | 更新が不要な場合           |
| ---------------------------- | -------------------------- |
| 新規インターフェース/型追加  | 内部実装の詳細変更のみ     |
| 既存インターフェース変更     | リファクタリング（IF不変） |
| 新規定数/設定値追加          | バグ修正（仕様変更なし）   |
| 外部連携インターフェース追加 | テスト追加のみ             |

**本タスクの更新判断**:

- [x] IPC チャネル追加: `skill:permission:request`, `skill:permission:response`
- [x] 新規メソッド追加: `handlePermissionResponse`
- [x] 新規フック追加: `PermissionRequest`

→ **更新が必要**

**更新対象ファイル**:

| 仕様書                    | 更新内容                                      |
| ------------------------- | --------------------------------------------- |
| `interfaces-agent-sdk.md` | PermissionRequest Hook 仕様、IPC チャネル追加 |

**期待される成果物**:

- 更新されたシステム仕様書

---

### タスク3: ドキュメント更新履歴作成

**目的**: 変更履歴をドキュメント化する

**実行手順**:

自動生成スクリプトを使用（推奨）:

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/task-3-1-c-permission-request
```

生成後、以下を手動で補完:

- [ ] システム仕様更新内容の詳細
- [ ] ソースコード変更の概要

**更新履歴テンプレート**:

```markdown
# ドキュメント更新履歴 - TASK-3-1-C

## 更新日: 2026-01-XX

### 更新されたドキュメント

| ドキュメント              | 更新内容                        |
| ------------------------- | ------------------------------- |
| `interfaces-agent-sdk.md` | PermissionRequest Hook 仕様追加 |
| 実装ガイド                | 新規作成                        |

### システム仕様の変更

- IPC チャネル追加
  - `skill:permission:request`: 権限リクエスト送信用
  - `skill:permission:response`: 権限応答受信用
- 新規メソッド `handlePermissionResponse` 追加
- PermissionRequest Hook 仕様追加

### ソースコード変更

| ファイル                                                | 変更内容                    |
| ------------------------------------------------------- | --------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | PermissionRequest Hook 実装 |
| `packages/shared/src/ipc/channels.ts`                   | 権限チャネル追加            |
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 残課題を検出し記録する

**実行手順**:

1. Phase 11 のテスト結果から FAIL テストを検出
2. 発見課題から重要度「高」の課題を検出
3. アクセシビリティテストから WCAG 違反を検出
4. 結果をレポートにまとめる

**検出対象**:

| ソース           | 検出条件            |
| ---------------- | ------------------- |
| テスト結果       | FAIL となったテスト |
| 発見課題         | 重要度「高」の課題  |
| アクセシビリティ | WCAG 違反           |

**レポートテンプレート（0件の場合）**:

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

## 参照資料

| 参照資料                   | パス                                                                           | 内容                 |
| -------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| Agent SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`    | 更新対象             |
| 仕様更新ワークフロー       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準         |
| Phase 11 テスト結果        | `outputs/phase-11/`                                                            | テスト結果・発見課題 |

---

## 成果物

| 成果物           | パス                                          | 内容             |
| ---------------- | --------------------------------------------- | ---------------- |
| 実装ガイド       | `docs/guides/permission-request-hook.md`      | 実装説明         |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md` | ドキュメント変更 |
| 未タスクレポート | `outputs/phase-12/unassigned-task-report.md`  | 残課題検出結果   |

---

## 統合テスト連携（Phase 1〜11は必須）

Phase 12 では統合テスト追加は不要。

---

## 完了条件

- [ ] 実装ガイド（Part 1 + Part 2）が作成されている
- [ ] システム仕様書のタスク完了記録が更新されている
- [ ] システム仕様書の更新判断が完了している
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも必須）
- [ ] 成果物が全て生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-c-permission-request/phase-13-pr-creation.md`
