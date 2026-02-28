# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 6                   |
| Phase名    | テスト拡充          |
| 前提Phase  | Phase 5             |
| 後続Phase  | Phase 7             |
| ステータス | 未実施              |
| 作成日     | 2026-02-27          |
| 機能名     | TASK-9H-skill-debug |

---

## 目的

Phase 5 の実装完了後、SkillDebugger・DebugSession・IPC ハンドラのテストカバレッジ目標達成に向けた追加テストを作成し、エッジケース・境界値・異常系を網羅する。

## 背景

Phase 4-5 で作成した基本テストに加え、デバッグ機能特有のエッジケース（同時セッション制限、セッションタイムアウト、不正状態遷移、深いネスト変数パス、式評価エラー）を追加することで、品質を担保する。

---

## 実行タスク

### タスク1: 未網羅シナリオ抽出

- Phase 4 テストと Phase 5 実装を突合し、未網羅の異常系・境界値を抽出する

### タスク2: 追加テスト実装

- SkillDebugger / DebugSession / IPC ハンドラの順に追加テストを実装する

### タスク3: セキュリティ・競合ケース強化

- 条件式ブレークポイント、同時ブレーク競合、P42/P41 観点のテストを追補する

### タスク4: 実行結果記録

- 追加テスト結果を `outputs/phase-6/` に出力し、次 Phase の入力を確定する

---

## SubAgent 分担

| SubAgent                | 関心ごと                          | 参照先                                                                                     | 期待成果物           |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------------------------ | -------------------- |
| `coverage-case-agent`   | 境界値・異常系テスト抽出          | `.claude/skills/task-specification-creator/SKILL.md` / `references/coverage-standards.md`  | 追加テストケース一覧 |
| `ipc-contract-agent`    | IPC/P42/P44/P45 観点のテスト補強  | `.claude/skills/aiworkflow-requirements/SKILL.md` / `references/ipc-contract-checklist.md` | IPC異常系テスト追加  |
| `hooks-stability-agent` | Hook/イベント連携とフラッキー対策 | `.claude/skills/claude-agent-sdk/SKILL.md` / `references/error-handling.md`                | 安定実行可能なテスト |

SubAgent は担当関心ごとだけを処理し、完了後に `outputs/phase-6/coverage-report.md` へ統合記録する。

---

## 参照資料

| 参照資料       | パス                                                                   | 内容                 |
| -------------- | ---------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト | `apps/desktop/src/main/services/skill/__tests__/SkillDebugger.test.ts` | SkillDebugger テスト |
| Phase 4 テスト | `apps/desktop/src/main/services/skill/__tests__/DebugSession.test.ts`  | DebugSession テスト  |
| Phase 4 テスト | `apps/desktop/src/main/ipc/__tests__/skillDebugHandlers.test.ts`       | IPC ハンドラテスト   |
| Phase 4 テスト | `packages/shared/src/types/__tests__/skill-debug.test.ts`              | 共有型定義テスト     |
| Phase 5 実装   | `apps/desktop/src/main/services/skill/SkillDebugger.ts`                | SkillDebugger 実装   |
| Phase 5 実装   | `apps/desktop/src/main/services/skill/DebugSession.ts`                 | DebugSession 実装    |
| Phase 5 実装   | `packages/shared/src/types/skill-debug.ts`                             | 共有型定義           |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                                        | 内容               |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------ |
| カバレッジ基準     | `.claude/skills/task-specification-creator/references/coverage-standards.md`                | カバレッジ基準     |
| 品質基準           | `.claude/skills/task-specification-creator/references/quality-standards.md`                 | 品質基準           |
| IPC Agent仕様      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC契約の正本      |
| Skill I/F仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 型契約の正本       |
| IPC契約チェック    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P42/P44/P45検証    |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ   |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | TDD/性能要件       |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ     |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テスト設計パターン |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                        | Pitfall 対策       |

---

## テストカバレッジ基準

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テストカバレッジ

| 指標                         | 目標 |
| ---------------------------- | ---- |
| IPC チャネル（7本）          | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| デバッグイベント通知         | 100% |

---

## 追加テストケース

### 1. SkillDebugger エッジケーステスト

```typescript
describe("SkillDebugger エッジケース", () => {
  describe("同時デバッグセッション制限", () => {
    it("既存セッションが実行中に新規セッション開始を試みた場合、エラーを返す", async () => {
      // セッション数上限=1の場合
    });

    it("既存セッションを終了後に新規セッションを開始できる", async () => {
      // セッション終了→新規開始の正常系
    });
  });

  describe("セッションタイムアウト", () => {
    it("タイムアウト時間を超えたセッションが自動終了される", async () => {
      // advanceTimersByTime で1ステップずつ進める（P13対策）
    });

    it("タイムアウト直前のコマンド実行でタイマーがリセットされる", async () => {
      // タイマーリセットの確認
    });
  });

  describe("不正状態遷移", () => {
    it("停止済みセッションへのコマンド実行がエラーを返す", async () => {
      // 状態: stopped → command → error
    });

    it("一時停止中でないセッションへの resume がエラーを返す", async () => {
      // 状態: running → resume → error
    });

    it("ブレークポイント未到達でのステップ実行がエラーを返す", async () => {
      // 状態: running → stepOver → error
    });
  });
});
```

### 2. DebugSession エッジケーステスト

```typescript
describe("DebugSession エッジケース", () => {
  describe("変数パスの深いネスト", () => {
    it("ネスト深度5のオブジェクトパスを正常にインスペクトできる", async () => {
      // パス: "a.b.c.d.e"
    });

    it("存在しないネストパスに対して undefined を返す", async () => {
      // パス: "a.b.nonexistent"
    });

    it("配列インデックスを含むパスを正常に解決できる", async () => {
      // パス: "items[0].name"
    });
  });

  describe("大量ブレークポイント", () => {
    it("100個のブレークポイントを追加しても正常に動作する", async () => {
      // 上限テスト
    });

    it("同一行への重複ブレークポイント追加がエラーを返す", async () => {
      // 重複検出
    });
  });

  describe("コールスタック", () => {
    it("コールスタック深度が上限に達した場合にエラー情報を含む", async () => {
      // スタック上限テスト
    });

    it("空のコールスタックで stepOut がエラーを返す", async () => {
      // 空スタック時のガード
    });
  });

  describe("式評価", () => {
    it("有効な式を評価して結果を返す", async () => {
      // "x + y" のような単純な式
    });

    it("構文エラーのある式に対してエラーを返す", async () => {
      // "x ++" のような不正な式
    });

    it("禁止されたキーワードを含む式を拒否する", async () => {
      // "require('fs')" のような危険な式
    });
  });
});
```

### 3. IPC ハンドラ異常系テスト

```typescript
describe("IPC デバッグハンドラ異常系", () => {
  describe("skill:debug:start", () => {
    it("skillName が空文字列の場合に VALIDATION_ERROR を返す", async () => {
      // P42 準拠: 空文字列チェック
    });

    it("skillName がスペースのみの場合に VALIDATION_ERROR を返す", async () => {
      // P42 準拠: trim 空文字列チェック
    });

    it("skillName が string 以外の型の場合に VALIDATION_ERROR を返す", async () => {
      // P42 準拠: 型チェック
    });
  });

  describe("skill:debug:command", () => {
    it("存在しないセッション ID に対してエラーを返す", async () => {
      // セッション不在エラー
    });

    it("不正なコマンド名に対してエラーを返す", async () => {
      // 未定義コマンド
    });
  });

  describe("skill:debug:breakpoint:add", () => {
    it("負の行番号に対してエラーを返す", async () => {
      // 行番号: -1
    });

    it("ファイルパスが空の場合にエラーを返す", async () => {
      // ファイルパス: ""
    });
  });

  describe("skill:debug:breakpoint:remove", () => {
    it("存在しないブレークポイント ID に対してエラーを返す", async () => {
      // ID 不在エラー
    });
  });

  describe("skill:debug:inspect", () => {
    it("セッション ID が不正な場合にエラーを返す", async () => {
      // 型チェックエラー
    });
  });

  describe("skill:debug:evaluate", () => {
    it("式が空文字列の場合にエラーを返す", async () => {
      // P42 準拠: 空文字列
    });

    it("式がスペースのみの場合にエラーを返す", async () => {
      // P42 準拠: trim 空文字列
    });
  });

  describe("送信元検証", () => {
    it("全7チャネルで validateIpcSender が呼び出される", async () => {
      // セキュリティ検証
    });

    it("validateIpcSender の getAllowedWindows コールバックが正しく動作する", async () => {
      // P41 対策: インラインアロー関数のカバレッジ
    });
  });
});
```

### 4. 条件式ブレークポイント・同時ブレーク競合テスト

```typescript
describe("条件式ブレークポイント", () => {
  it("条件式が true を返す場合にブレークする", async () => {
    // condition: "x > 10" で x=11
  });

  it("条件式が false を返す場合にブレークしない", async () => {
    // condition: "x > 10" で x=5
  });

  it("条件式が評価エラーの場合にブレークしてエラー情報を含む", async () => {
    // condition: "undefinedVar.prop"
  });

  it("条件式が空文字列の場合に無条件ブレークとして扱う", async () => {
    // condition: ""
  });
});

describe("同時ブレーク競合", () => {
  it("同一行に条件付きと無条件のブレークポイントがある場合、無条件が優先される", async () => {
    // 優先順位の確認
  });
});
```

---

## v8 カバレッジプロバイダ注意事項（P41 対策）

Vitest の v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする。以下の対策を実施:

- `validateIpcSender` のオプションオブジェクト内の `getAllowedWindows` コールバックをテストで明示的に呼び出す
- `mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` で呼び出し確認
- IPC ハンドラの全7チャネルでコールバックの戻り値を検証する

---

## 実行手順

1. SubAgent 分担に従って追加テストを実装する。
2. 下記コマンドで対象テストとカバレッジを確認する。
3. カバレッジ基準と統合テスト連携の完了を確認し、成果物を出力する。

### 実行コマンド

```bash
# SkillDebugger ユニットテスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillDebugger.test.ts

# DebugSession ユニットテスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/DebugSession.test.ts

# IPC ハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillDebugHandlers.test.ts

# 共有型定義テスト
cd packages/shared && pnpm vitest run src/types/__tests__/skill-debug.test.ts

# カバレッジ測定（デバッグ関連ファイル）
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/__tests__/SkillDebugger.test.ts src/main/services/skill/__tests__/DebugSession.test.ts src/main/ipc/__tests__/skillDebugHandlers.test.ts

# 全テスト実行
cd apps/desktop && pnpm vitest run -- --grep "SkillDebugger|DebugSession|debug"
```

---

## 成果物

| 成果物             | パス                                                                        | 内容               |
| ------------------ | --------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-6/coverage-report.md`  | カバレッジ測定結果 |
| 統合テスト結果     | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-6/integration-test.md` | 統合テスト実行結果 |

---

## 統合テスト連携（Phase 1〜11 は必須）

Phase 6 では以下の統合テスト連携アクションを実施:

- [ ] 全7 IPC チャネルの異常系テスト追加
- [ ] SkillDebugger → DebugSession 間の連携テスト追加
- [ ] デバッグイベント通知（skill:debug:event）のデータフロー確認
- [ ] セッション開始→ブレークポイント設定→実行→ブレーク→インスペクション→終了 の E2E テスト
- [ ] エラーハンドリング: セッション異常終了時の Renderer 通知確認

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（IPC 7チャネル 100%、正常系 100%、異常系 80%+）
- [ ] SkillDebugger のエッジケーステスト（同時セッション制限、タイムアウト、不正状態遷移）が追加されている
- [ ] DebugSession のエッジケーステスト（深いネスト変数パス、大量ブレークポイント、コールスタック上限）が追加されている
- [ ] IPC ハンドラの全7チャネルで P42 準拠3段バリデーションの異常系テストが追加されている
- [ ] 条件式ブレークポイントの評価エラーテストが追加されている
- [ ] P41 対策（v8 カバレッジプロバイダのインライン関数カバレッジ）が実施されている
- [ ] カバレッジレポートが出力されている
- [ ] 統合テスト連携アクションが完了している
- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] SubAgent 実行記録が記録されている

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. SubAgent 分担タスクの実行（各担当ごとに1タスク）
3. SkillDebugger エッジケーステスト追加
4. DebugSession エッジケーステスト追加
5. IPC ハンドラ異常系テスト追加
6. 条件式・同時ブレーク競合テスト追加
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## SubAgent 100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各担当の成果物が生成されている
- [ ] SubAgent 実行記録が `outputs/phase-6/coverage-report.md` に記録されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9H-skill-debug --phase 6
```

---

## SubAgent 実行記録（全 Phase 共通）

Phase 完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### SubAgent 実行結果

- coverage-case-agent: [success/failure/partial]
- ipc-contract-agent: [success/failure/partial]
- hooks-stability-agent: [success/failure/partial]

### カバレッジ結果

- Line Coverage: [数値]%
- Branch Coverage: [数値]%
- Function Coverage: [数値]%

### テスト追加数

- SkillDebugger: [数値]件
- DebugSession: [数値]件
- IPC ハンドラ: [数値]件
- 共有型定義: [数値]件

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次 Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9H-skill-debug/phase-7-coverage-verification.md`
