# Phase 7: 詳細カバレッジレポート

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 7                                 |
| タスク番号 | 1                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 測定環境

- **Vitest**: v2.1.9
- **Coverage Provider**: v8
- **レポーター**: text, json, html, lcov

---

## 対象ファイルのカバレッジ詳細

### DrizzleChatSessionRepository.ts

| 指標       | カバー数 | 全体数 | カバレッジ |
| ---------- | -------- | ------ | ---------- |
| Functions  | 9        | 9      | 100%       |
| Lines      | 181      | 183    | 98.9%      |
| Branches   | 44       | 49     | 89.8%      |
| Statements | 181      | 183    | 98.9%      |

**メソッド別カバレッジ**:

| メソッド     | Lines | Branches | 備考                  |
| ------------ | ----- | -------- | --------------------- |
| constructor  | 100%  | -        | -                     |
| findById     | 100%  | 80%      | Mapper エラー未カバー |
| findByUserId | 100%  | 100%     | -                     |
| findPinned   | 100%  | 100%     | -                     |
| search       | 100%  | 100%     | -                     |
| save         | 100%  | 100%     | -                     |
| delete       | 100%  | 100%     | -                     |
| exists       | 100%  | 100%     | -                     |
| countPinned  | 100%  | 100%     | -                     |

### DrizzleChatMessageRepository.ts

| 指標       | カバー数 | 全体数 | カバレッジ |
| ---------- | -------- | ------ | ---------- |
| Functions  | 9        | 9      | 100%       |
| Lines      | 177      | 181    | 97.8%      |
| Branches   | 41       | 46     | 89.1%      |
| Statements | 177      | 181    | 97.8%      |

**メソッド別カバレッジ**:

| メソッド              | Lines | Branches | 備考                  |
| --------------------- | ----- | -------- | --------------------- |
| constructor           | 100%  | -        | -                     |
| findById              | 100%  | 80%      | Mapper エラー未カバー |
| findBySessionId       | 100%  | 100%     | -                     |
| findLatestBySessionId | 100%  | 100%     | -                     |
| countBySessionId      | 100%  | 100%     | -                     |
| save                  | 100%  | 100%     | -                     |
| saveMany              | 100%  | 100%     | -                     |
| delete                | 100%  | 100%     | -                     |
| deleteBySessionId     | 100%  | 100%     | -                     |

---

## 全体サマリ

| ファイル                        | Functions | Lines  | Branches | 状態    |
| ------------------------------- | --------- | ------ | -------- | ------- |
| DrizzleChatSessionRepository.ts | 100%      | 98.9%  | 89.8%    | ✅ PASS |
| DrizzleChatMessageRepository.ts | 100%      | 97.8%  | 89.1%    | ✅ PASS |
| **平均**                        | 100%      | 98.35% | 89.45%   | ✅ PASS |

---

## 次のタスク

タスク 2: カバレッジ目標達成判定
