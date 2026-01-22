# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 13                    |
| Phase名    | PR作成                |
| 前提Phase  | Phase 12              |
| 後続Phase  | -                     |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | shared-type-export-01 |

---

## 目的

コミット、PR作成、CI確認を行い、マージ準備を完了する。

## 背景

Phase 1-12 の成果物を main ブランチにマージするための準備を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認

**目的**: PR作成前の最終確認

**実行手順**:

1. 以下のコマンドを実行し、全てパスすることを確認:

```bash
# ビルド
pnpm --filter @repo/shared build

# テスト
pnpm --filter @repo/shared test -- --run

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

2. 全てパスすることを確認

**期待される成果物**:

- ローカル確認結果（全てパス）

---

### タスク2: コミット準備

**目的**: 変更をコミットするための準備

**実行手順**:

1. 変更ファイルを確認:

```bash
git status
git diff
```

2. 変更内容を確認:
   - `packages/shared/src/services/graph/index.ts` - 型エクスポート追加
   - `packages/shared/src/services/graph/index.test.ts` - テスト追加
   - `docs/30-workflows/shared-type-export-01/` - タスク仕様書

**期待される成果物**:

- 変更ファイル一覧

---

### タスク3: ユーザー確認を待つ

**目的**: PR作成前にユーザーの許可を得る

**実行手順**:

1. **重要**: ユーザーに以下を確認:
   - 変更内容が正しいか
   - PR を作成してよいか
   - コミットメッセージの内容

2. ユーザーの許可を得てから次に進む

**期待される成果物**:

- ユーザーからの許可

---

### タスク4: コミット・PR作成

**目的**: `/ai:diff-to-pr` を使用してコミット・PR作成

**実行手順**:

1. **ユーザーの明示的な許可を得た後**、`/ai:diff-to-pr` を実行
2. コミットメッセージ例:

```
feat(shared): add Community type exports from services/graph

- Add barrel file exports for Community-related types
- Export type-only: Community, CommunitySummary, StoredEntity, etc.
- Export values: CommunityErrorCode, CommunityDetectionError, etc.
- Add tests for export verification

Closes #371
```

3. PR 本文に以下を含める:
   - Summary: 変更の概要
   - Test plan: テスト計画
   - 関連 Issue: #371

**期待される成果物**:

- コミット
- Pull Request

---

### タスク5: CI確認

**目的**: CI が成功することを確認

**実行手順**:

1. PR の CI ステータスを確認
2. 全 CI ジョブが成功することを確認
3. 失敗した場合は修正

**期待される成果物**:

- CI 成功確認

---

### タスク6: マージ準備完了報告

**目的**: マージ準備が完了したことを報告

**実行手順**:

1. ユーザーに以下を報告:
   - PR URL
   - CI ステータス
   - マージ可能状態

2. **マージはユーザーが GitHub UI で手動実行**

**期待される成果物**:

- マージ準備完了報告

---

## 参照資料

| 参照資料   | パス                                       | 内容             |
| ---------- | ------------------------------------------ | ---------------- |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` | 変更内容サマリー |

---

## 成果物

| 成果物       | パス       | 内容      |
| ------------ | ---------- | --------- |
| Pull Request | GitHub URL | PR リンク |

---

## 完了条件

- [ ] ローカル確認（ビルド、テスト、型チェック、Lint）全てパス
- [ ] ユーザーからの PR 作成許可を取得
- [ ] コミット完了
- [ ] PR 作成完了
- [ ] CI 全てパス
- [ ] マージ準備完了をユーザーに報告

---

## 重要な注意事項

⚠️ **PR作成は自動実行しない**

- 必ずユーザーの明示的な許可を得てから実行すること
- `/ai:diff-to-pr` はユーザー確認後のみ実行

⚠️ **マージはユーザーが手動実行**

- Claude はマージを実行しない
- ユーザーが GitHub UI でマージを行う

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（このPhaseでタスク完了）

---

## タスク完了

このPhaseが完了すると、SHARED-TYPE-EXPORT-01 タスクは完了です。

後続タスク:

- SHARED-TYPE-EXPORT-02: メイン index.ts からのエクスポート
- SHARED-TYPE-EXPORT-03: 型チェック検証
