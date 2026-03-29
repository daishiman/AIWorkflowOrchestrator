# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目      | 内容     |
| --------- | -------- |
| Phase     | 13       |
| Phase名   | PR作成   |
| カテゴリ  | 完了     |
| 前提Phase | Phase 12 |
| 後続Phase | なし     |

## 目的

ユーザーの明示的な許可を得た上で、コミットと PR を作成する。

## ⚠️ 重要: ユーザー承認必須

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

## 実行タスク

### タスク1: 変更差分の確認

**目的**: コミット対象の変更内容を確認する

**手順**:

```bash
git status
git diff --stat
```

### タスク2: コミット作成（ユーザー承認後）

**目的**: 適切なコミットメッセージで変更をコミットする

**コミットメッセージ案**:

```
refactor(desktop): SkillExecutor/sdkMessageNormalizer 型ガード重複解消

- sdkMessageUtils.ts に `SdkMessageRecord` / `asSdkMessageRecord()` / `getSdkMessageType()` を集約
- SkillExecutor.ts のローカル型ガードを共通ユーティリティに置換
- sdkMessageNormalizer.ts のインライン検証を共通ユーティリティに置換

Closes #1692
```

### タスク3: PR作成（ユーザー承認後）

**目的**: GitHub PR を作成する

**PR テンプレート**:

```markdown
## Summary

- SkillExecutor.convertToStreamMessage() と sdkMessageNormalizer.normalizeSdkMessage() の型ガード重複を解消
- 共通ユーティリティ `sdkMessageUtils.ts` を新規作成し、`asSdkMessageRecord()` / `getSdkMessageType()` を集約
- 実装 wave の targeted tests は PASS、現ワークツリーでは `typecheck` PASS / `lint` 0 errors / `vitest` は環境依存で blocked

## Test plan

- [ ] sdkMessageUtils.test.ts 全件 PASS
- [ ] sdkMessageNormalizer.test.ts 回帰テスト PASS
- [ ] SkillExecutor.sdk-types.test.ts 回帰テスト PASS
- [ ] pnpm typecheck PASS
- [ ] pnpm lint PASS

Closes #1692
```

## 参照資料

| 参照資料        | パス                | 内容             |
| --------------- | ------------------- | ---------------- |
| Phase 12 成果物 | `outputs/phase-12/` | ドキュメント一式 |

## 成果物

| 成果物      | パス                             |
| ----------- | -------------------------------- |
| PR サマリー | `outputs/phase-13/pr-summary.md` |

## 完了条件

- [ ] ユーザーからコミット・PR作成の明示的な許可を得ていること
- [ ] コミットが作成されていること
- [ ] PR が作成されていること
- [ ] CI が PASS していること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: 変更差分の確認 → 完了
- [ ] タスク2: コミット作成 → 完了（ユーザー承認後）
- [ ] タスク3: PR作成 → 完了（ユーザー承認後）
