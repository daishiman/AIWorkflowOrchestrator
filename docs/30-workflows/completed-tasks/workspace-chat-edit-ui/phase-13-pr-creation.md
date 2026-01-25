# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（完了）                 |
| ステータス | 未実施                       |
| 作成日     | 2026-01-24                   |
| 機能名     | workspace-chat-edit-ui       |

---

## 目的

`/ai:diff-to-pr` スキルを使用してコミット・PR作成・CI確認を行い、マージ準備を完了させる。

## 背景

ドキュメント更新が完了し、全ての成果物が揃った状態。
PRを作成してCIを通過させ、マージ可能な状態にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認

**目的**: PR作成前にローカルで全てのチェックが通ることを確認する

**チェックリスト**:

- [ ] ビルドが成功する: `pnpm --filter @repo/desktop build`
- [ ] 全テストがパスする: `pnpm --filter @repo/desktop test`
- [ ] 型チェックがパスする: `pnpm --filter @repo/desktop typecheck`
- [ ] Lintエラーがない: `pnpm --filter @repo/desktop lint`

**期待される成果物**:

- ローカル確認完了

---

### タスク2: コミット作成

**目的**: 変更をコミットする

**実行手順**:

1. 変更ファイルをステージング
2. コミットメッセージを作成
3. コミット実行

**コミットメッセージ形式**:

```
feat(workspace-chat-edit): UIコンポーネント6種類の実装

- FileContextBadge: 添付ファイルバッジ
- ApplyControls: 適用/却下ボタン
- FileContextDropZone: D&Dドロップゾーン
- DiffPreview: 差分プレビューパネル
- DiffEditor: Monaco Diff Editor統合
- EditCommandInput: 編集コマンド入力UI

Closes #468
```

**期待される成果物**:

- コミット完了

---

### タスク3: PR作成

**目的**: GitHub Pull Requestを作成する

**実行手順**:

1. ブランチをリモートにプッシュ
2. PR作成

**PR本文形式**:

```markdown
## Summary

- workspace-chat-edit機能のUIコンポーネント6種類を実装
- useFileContext、useDiffApplyとの統合完了
- WCAG 2.1 AA準拠のアクセシビリティ対応

## Changes

- FileContextBadge: 添付ファイルバッジ
- ApplyControls: 適用/却下ボタン
- FileContextDropZone: ドラッグ&ドロップ
- DiffPreview: 差分プレビューパネル
- DiffEditor: Monaco Diff Editor統合
- EditCommandInput: 編集コマンド入力

## Test plan

- [ ] pnpm --filter @repo/desktop test
- [ ] pnpm --filter @repo/desktop typecheck
- [ ] pnpm --filter @repo/desktop lint
- [ ] 手動テスト（Phase 11のテストケース）

## Related

- Closes #468
- タスク仕様書: docs/30-workflows/workspace-chat-edit-ui/

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**期待される成果物**:

- PR URL

---

### タスク4: CI確認

**目的**: GitHub Actions CIが全て成功することを確認する

**実行手順**:

1. PRページでCI状況を確認
2. 失敗した場合は修正してpush
3. 全CIが成功するまで繰り返し

**確認対象**:

- [ ] lint
- [ ] typecheck
- [ ] test
- [ ] build

**期待される成果物**:

- CI全成功

---

### タスク5: マージ準備完了報告

**目的**: マージ準備が完了したことを報告する

**実行手順**:

1. 全タスク完了を確認
2. マージ準備完了を報告

**報告内容**:

- PR URL
- CI状態
- レビュー依頼（必要に応じて）

**期待される成果物**:

- `outputs/phase-13/completion-report.md`

---

## 参照資料

| 参照資料   | パス                            | 内容           |
| ---------- | ------------------------------- | -------------- |
| diff-to-pr | `.claude/skills/ai:diff-to-pr/` | PRワークフロー |

---

## 成果物

| 成果物       | パス                                    | 内容     |
| ------------ | --------------------------------------- | -------- |
| 完了レポート | `outputs/phase-13/completion-report.md` | 最終報告 |

---

## 完了条件

- [ ] ローカル確認が全て成功している
- [ ] コミットが作成されている
- [ ] PRが作成されている
- [ ] CIが全て成功している
- [ ] マージ準備完了報告が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 重要な注意事項

⚠️ **PR作成は自動実行しない**

PR作成は必ずユーザーの明示的な許可を得てから実行すること。

| 禁止事項                   | 理由                                           |
| -------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する         | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする | 動作確認されていないコードがPRに含まれる       |

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

全Phaseが完了すると、workspace-chat-edit-ui機能の実装が完了し、
マージ可能な状態になります。

**最終成果物**:

- 6種類のUIコンポーネント
- コンポーネントテスト
- 実装ガイド
- GitHub Pull Request
