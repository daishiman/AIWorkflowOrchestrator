# IPCチャネル名ハードコード解消 - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-12-1-IPC-HARDCODE-FIX     |
| タスク名     | SkillExecutorのIPCチャネル名定数化 |
| 分類         | リファクタリング                   |
| 対象機能     | IPC チャネル名管理                 |
| 優先度       | 低                                 |
| 見積もり規模 | 小規模                             |
| ステータス   | 完了                               |
| 完了日       | 2026-02-09                         |
| 実行順序     | 02c（並列可能 — グループ01完了後） |
| 発見元       | skill-system-conflict-report #12   |
| 発見日       | 2026-02-05                         |
| 関連Phase    | Phase 4（品質向上）                |
| 関連Issue    | -                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillExecutor.ts` L871 で IPCチャネル名 `"skill:stream"` がハードコードされている。`preload/channels.ts` に `SKILL_CHANNELS.SKILL_STREAM` 定数が定義済みだが使用されていない。

### 1.2 問題点・課題

| 問題                            | 影響                                        |
| ------------------------------- | ------------------------------------------- |
| `"skill:stream"` がハードコード | チャネル名変更時にSkillExecutorが追従しない |
| 定数が利用可能なのに未使用      | IPC セキュリティルール違反                  |

### 1.3 放置した場合の影響

- IPC チャネル名の変更時にランタイムエラー
- コードレビューで指摘される品質問題
- `.claude/rules/04-electron-security.md` の「ハードコード文字列でチャンネル名を指定しない」ルール違反

---

## 2. 何を達成するか（What）

### 2.1 目的

ハードコードされたIPCチャネル名を定数参照に置き換える。

### 2.2 最終ゴール

1. `"skill:stream"` → `IPC_CHANNELS.SKILL_STREAM` （または適切な定数）に置き換え
2. SkillExecutor.ts 内の他のハードコードチャネル名も確認・修正

### 2.3 スコープ

#### 含むもの

- `SkillExecutor.ts` L871 のハードコード修正
- 同ファイル内の他のハードコードチャネル名の確認

#### 含まないもの

- 他ファイルのハードコード修正
- チャネル定義の変更

### 2.4 成果物

| 成果物                      | 説明               |
| --------------------------- | ------------------ |
| 修正された SkillExecutor.ts | 定数参照に置き換え |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-1-1-TYPE-ALIGNMENT 完了（完了済み）

### 3.2 依存タスク

- なし（独立して着手可能。ただし Layer 1 で #6 と並列実行推奨）

### 3.3 推奨アプローチ

1. `SkillExecutor.ts` 内の文字列リテラルでIPC関連のものを `grep`
2. 対応する定数が `channels.ts` に存在するか確認
3. 定数参照に置き換え

---

## 4. 実行手順

### Step 1: ハードコード箇所の特定

#### 手順

1. `grep -n '"skill:' apps/desktop/src/main/services/skill/SkillExecutor.ts` で全箇所を特定
2. 各箇所に対応する `IPC_CHANNELS` 定数を確認

### Step 2: 定数への置き換え

#### 手順

1. L871 の `"skill:stream"` → `IPC_CHANNELS.SKILL_STREAM` に置き換え
2. import 文に `IPC_CHANNELS` を追加（未 import の場合）
3. 他のハードコード箇所も同様に修正

### Step 3: テスト

#### 手順

1. 既存テスト PASS 確認
2. TypeScript コンパイル成功確認

---

## 5. 完了条件チェックリスト

- [ ] `"skill:stream"` ハードコードが定数参照に置き換え
- [ ] SkillExecutor.ts 内に他のハードコードチャネル名がない
- [ ] 全テストが PASS

---

## 6. 検証方法

1. `grep '"skill:' apps/desktop/src/main/services/skill/SkillExecutor.ts` で該当なし
2. テストスイート PASS

---

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                       |
| ----------------------- | ------ | -------- | -------------------------- |
| import パスの解決エラー | 低     | 低       | 既存の import パターン参照 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/04-electron-security.md`（IPCセキュリティ原則）
- `apps/desktop/src/main/services/skill/SkillExecutor.ts` L871
- `apps/desktop/src/preload/channels.ts`

---

## 9. 備考

### ルール準拠

`.claude/rules/04-electron-security.md` に「ハードコード文字列（`"skill:complete"` 等）を使わない」と明記されている。本タスクはそのルール準拠を徹底するもの。
