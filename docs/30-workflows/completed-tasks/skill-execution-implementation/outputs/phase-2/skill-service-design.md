# SkillService設計 - スキル実行機能

## Phase 2 - タスク4: SkillService設計

### 作成日

2026-01-18

---

## executeSkill メソッドシグネチャ

```typescript
/**
 * スキルを実行する
 *
 * @param skillId - 実行するスキルのID
 * @param params - オプションパラメータ
 * @returns スキル実行結果
 * @throws Error - スキルが見つからない場合
 */
async executeSkill(
  skillId: string,
  params?: Record<string, unknown>,
): Promise<SkillExecutionResult>;
```

---

## 処理フロー

```
┌─────────────────────────────────────────────────┐
│ executeSkill(skillId, params)                   │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ 1. 実行ID生成                                    │
│    executionId = crypto.randomUUID()            │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ 2. 開始時刻記録                                  │
│    startedAt = new Date()                       │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ 3. スキル取得                                    │
│    skill = await this.getSkillById(skillId)     │
│    if (!skill) throw Error("スキルが見つかりません") │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ 4. インポート状態確認                            │
│    if (!isImported(skillId))                    │
│      throw Error("スキルがインポートされていません") │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ 5. スキル実行処理                                │
│    try {                                        │
│      output = await executeSkillLogic(skill)    │
│      status = "success"                         │
│    } catch (error) {                            │
│      status = "failed"                          │
│      errorMessage = error.message               │
│    }                                            │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ 6. 完了時刻記録                                  │
│    completedAt = new Date()                     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ 7. 結果返却                                      │
│    return {                                     │
│      executionId,                               │
│      status,                                    │
│      output,                                    │
│      error,                                     │
│      startedAt,                                 │
│      completedAt                                │
│    }                                            │
└─────────────────────────────────────────────────┘
```

---

## 実装設計

```typescript
// apps/desktop/src/main/services/skill/SkillService.ts

import { randomUUID } from "crypto";
import type { SkillExecutionResult } from "@repo/shared";

export class SkillService {
  // ... 既存のプロパティとメソッド

  /**
   * スキルを実行する
   */
  async executeSkill(
    skillId: string,
    params?: Record<string, unknown>,
  ): Promise<SkillExecutionResult> {
    const executionId = randomUUID();
    const startedAt = new Date();

    try {
      // スキル取得
      const skill = await this.getSkillById(skillId);
      if (!skill) {
        throw new Error("スキルが見つかりません");
      }

      // インポート状態確認
      const importedIds = this.importManager.getImportedSkillIds();
      if (!importedIds.includes(skillId)) {
        throw new Error("スキルがインポートされていません");
      }

      // スキル実行ロジック
      // 注: 初期実装では、実行成功のログ記録のみを行う
      // 将来的には、スキルの種類に応じた実行ロジックを実装
      const output = `スキル "${skill.name}" を実行しました`;

      const completedAt = new Date();

      return {
        executionId,
        status: "success",
        output,
        startedAt,
        completedAt,
      };
    } catch (error) {
      const completedAt = new Date();
      return {
        executionId,
        status: "failed",
        error: error instanceof Error ? error.message : "実行に失敗しました",
        startedAt,
        completedAt,
      };
    }
  }
}
```

---

## 初期実装の範囲

### 実装する機能

| 機能               | 説明                          |
| ------------------ | ----------------------------- |
| 実行ID生成         | UUID による一意識別子の生成   |
| 時刻記録           | 開始・完了時刻の記録          |
| スキル存在確認     | getSkillById によるスキル取得 |
| インポート状態確認 | importedSkillIds との照合     |
| 成功レスポンス     | 実行成功メッセージの返却      |
| エラーハンドリング | try-catch による例外処理      |

### 将来拡張（今回は実装しない）

| 機能               | 説明                             |
| ------------------ | -------------------------------- |
| スキル種別判定     | スキルタイプに応じた実行分岐     |
| 外部プロセス実行   | Claude CLI 等の外部コマンド実行  |
| ストリーミング出力 | 実行中の出力をリアルタイムで送信 |
| 実行履歴の永続化   | 実行結果をストレージに保存       |

---

## エラーハンドリング方針

### エラー種別と対応

| エラー種別   | 発生条件                     | 対応                                   |
| ------------ | ---------------------------- | -------------------------------------- |
| スキル未発見 | getSkillById が null を返す  | status: "failed", error メッセージ返却 |
| 未インポート | importedIds に含まれない     | status: "failed", error メッセージ返却 |
| 実行時エラー | executeSkillLogic で例外発生 | status: "failed", error メッセージ返却 |

### エラーメッセージ

| エラー               | メッセージ                         |
| -------------------- | ---------------------------------- |
| スキル未発見         | "スキルが見つかりません"           |
| 未インポート         | "スキルがインポートされていません" |
| 実行失敗（詳細あり） | error.message                      |
| 実行失敗（詳細なし） | "実行に失敗しました"               |

---

## 依存関係

```typescript
// 必要なインポート
import { randomUUID } from "crypto";
import type { SkillExecutionResult } from "@repo/shared";

// 既存の依存関係
private importManager: SkillImportManager;
```

---

## テスト観点

| テストケース         | 期待される結果                           |
| -------------------- | ---------------------------------------- |
| 正常実行             | status: "success", output が設定される   |
| 存在しないスキルID   | status: "failed", 適切なエラーメッセージ |
| 未インポートのスキル | status: "failed", 適切なエラーメッセージ |
| executionId の一意性 | 毎回異なる UUID が生成される             |
| 時刻の正確性         | startedAt < completedAt                  |

---

## 完了確認

- [x] executeSkill メソッドのシグネチャを設計
- [x] 処理フローを設計
- [x] 実装コードを設計
- [x] 初期実装の範囲を明確化
- [x] エラーハンドリング方針を決定
- [x] 依存関係を特定
- [x] テスト観点を定義
- [x] outputs/phase-2/skill-service-design.md に出力
