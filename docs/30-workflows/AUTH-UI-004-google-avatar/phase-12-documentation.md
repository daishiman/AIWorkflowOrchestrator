# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 12                        |
| 機能名 | AUTH-UI-004-google-avatar |
| 作成日 | 2026-02-04                |
| 状態   | **未着手**                |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## Task 1: 実装ガイド作成【必須】

### Part 1: 概念的説明（中学生レベル）

#### プロバイダーによるアバターURLの違いとは？

**日常生活での例え:**

SNSアプリにログインするとき、GoogleやGitHubなど様々なサービスのアカウントを使えますよね。それぞれのサービスはあなたの情報（名前やプロフィール写真）を持っていますが、その情報の**呼び方（ラベル）**がサービスごとに違うんです。

例えば:

- **Google**: プロフィール写真を「picture」と呼ぶ
- **GitHub**: プロフィール写真を「avatar_url」と呼ぶ

これは、日本で「名前」と呼ぶものを、英語圏では「name」と呼ぶのと同じようなものです。

**今回の修正でやったこと:**

私たちのアプリは最初、「avatar_url」という名前でしかプロフィール写真を探していませんでした。だから、Googleのユーザーは「picture」という名前で情報を持っていても、アプリは「見つからない」と判断していたんです。

修正後は、「avatar_url」で見つからなかったら「picture」も探す、というフォールバック（代替手段）を追加しました。

### Part 2: 技術的詳細

#### 型定義

```typescript
export interface SupabaseIdentity {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    name?: string;
    avatar_url?: string; // GitHub, Discord
    picture?: string; // Google
  };
  created_at: string;
}
```

#### フォールバック実装

```typescript
const avatarUrl =
  identity.identity_data?.avatar_url ?? identity.identity_data?.picture ?? null;
```

**優先順位の理由:**

1. `avatar_url` を優先: GitHub/Discordで一般的なキー名
2. `picture` をフォールバック: Googleで使用されるキー名
3. 両方なければ `null`

---

## Task 2: システムドキュメント更新【必須】

### Step 1: タスク完了記録【必須】

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加

**更新対象ファイル:**

| ファイル                               | 更新内容                                    |
| -------------------------------------- | ------------------------------------------- |
| `references/interfaces-auth.md`        | SupabaseIdentity型の`picture`プロパティ追記 |
| `LOGS.md` (aiworkflow-requirements)    | AUTH-UI-004完了エントリ追加                 |
| `LOGS.md` (task-specification-creator) | AUTH-UI-004完了記録追加                     |

### Step 2: システム仕様更新【条件付き】

**更新要否判断:**

| 変更内容                        | 更新必要か | 理由                                       |
| ------------------------------- | ---------- | ------------------------------------------ |
| SupabaseIdentity型にpicture追加 | ✅ 必要    | 新規プロパティ追加                         |
| toLinkedProvider関数修正        | ❌ 不要    | 内部実装の変更のみ（インターフェース不変） |

**更新対象:**

- `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
  - SupabaseIdentity型定義に`picture`プロパティを追記

---

## Task 3: ドキュメント更新履歴【必須】

### documentation-changelog.md

| 更新対象ドキュメント | 変更種別 | 変更内容                                |
| -------------------- | -------- | --------------------------------------- |
| interfaces-auth.md   | 追加     | SupabaseIdentityにpictureプロパティ追加 |
| LOGS.md (両方)       | 追加     | AUTH-UI-004完了エントリ                 |

---

## Task 4: 未タスク検出【必須】

### 検出ソース確認

| #   | ソース                 | 確認結果       |
| --- | ---------------------- | -------------- |
| 1   | Phase 3レビュー結果    | MINOR指摘なし  |
| 2   | Phase 10レビュー結果   | MINOR指摘なし  |
| 3   | Phase 11手動テスト結果 | 未実行         |
| 4   | 各Phase成果物          | TODO/FIXMEなし |
| 5   | コードベース           | 該当なし       |

### 未タスク検出結果

**検出件数: 0件**

（Phase 11手動テスト実施後に再確認すること）

---

## 成果物

| 成果物               | パス                                            | 必須 | ステータス |
| -------------------- | ----------------------------------------------- | ---- | ---------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 未作成     |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 未作成     |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 未作成     |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 2】interfaces-auth.mdにpictureプロパティを追記した**
- [ ] **未タスク検出レポートが出力されている**
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
