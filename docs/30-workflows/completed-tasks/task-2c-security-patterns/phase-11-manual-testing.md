# Phase 11: 手動テスト検証

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| フェーズ     | 11                           |
| フェーズ名   | 手動テスト検証               |
| 目的         | UX・実環境動作確認           |
| 前提フェーズ | Phase 10: 最終レビューゲート |
| 次フェーズ   | Phase 12: ドキュメント更新   |
| 想定成果物   | 手動テストレポート           |

---

## 1. 目的

自動テストでカバーできない実環境での動作確認を行う。本タスクは定数・ユーティリティ関数のみのため、手動テストの対象は限定的。

---

## 2. 実行タスク

### Task 11-1: 関連自動テストの実行確認

**目的**: 自動テストが全てパスしていることを最終確認する

**手順**:

```bash
# 全テスト実行
pnpm --filter @repo/shared test -- --run

# カバレッジ付き実行
pnpm --filter @repo/shared test -- --run --coverage
```

**確認項目**:

- [ ] 全テストがパス
- [ ] カバレッジ目標達成

### Task 11-2: 他パッケージからのインポート動作確認

**目的**: 実際の使用シナリオでのインポートを確認する

**手順**:

1. desktop パッケージで以下のようなテストコードを作成・実行

```typescript
// apps/desktop/src/test-security-import.ts (一時ファイル)
import {
  DANGEROUS_PATTERNS,
  ALLOWED_TOOLS_WHITELIST,
  isDangerousCommand,
  isProtectedPath,
  validateAllowedTools,
  filterAllowedTools,
  type AllowedTool,
} from "@repo/shared";

// 動作確認
console.log("BASH_COMMANDS count:", DANGEROUS_PATTERNS.BASH_COMMANDS.length);
console.log(
  "PROTECTED_PATHS count:",
  DANGEROUS_PATTERNS.PROTECTED_PATHS.length,
);
console.log("WHITELIST count:", ALLOWED_TOOLS_WHITELIST.length);

console.log("isDangerousCommand('rm -rf /'):", isDangerousCommand("rm -rf /"));
console.log("isDangerousCommand('ls'):", isDangerousCommand("ls"));

console.log("isProtectedPath('/etc/passwd'):", isProtectedPath("/etc/passwd"));
console.log("isProtectedPath('/tmp/test'):", isProtectedPath("/tmp/test"));

console.log("validateAllowedTools(['Read']):", validateAllowedTools(["Read"]));
console.log(
  "validateAllowedTools(['Unknown']):",
  validateAllowedTools(["Unknown"]),
);

const filtered: AllowedTool[] = filterAllowedTools(["Read", "Invalid"]);
console.log("filterAllowedTools:", filtered);
```

2. TypeScript でコンパイル・実行

```bash
npx ts-node apps/desktop/src/test-security-import.ts
```

**確認項目**:

- [ ] インポートが成功
- [ ] 型が正しく解決される
- [ ] 関数が期待通りに動作

### Task 11-3: エッジケース手動確認

**目的**: 自動テストで確認しにくいエッジケースを手動確認する

**確認項目**:

| ケース             | 入力                 | 期待結果 | 確認 |
| ------------------ | -------------------- | -------- | ---- |
| 実際のHOMEパス展開 | `~/.ssh/id_rsa`      | true     | [ ]  |
| 空文字列コマンド   | `""`                 | false    | [ ]  |
| 空配列ツール検証   | `[]`                 | true     | [ ]  |
| 大文字小文字区別   | `["read"]`（小文字） | false    | [ ]  |

---

## 3. テスト結果レポート

### 3.1 自動テスト結果

| テストスイート   | テスト数 | パス  | 失敗  | スキップ |
| ---------------- | -------- | ----- | ----- | -------- |
| security.test.ts | -        | -     | -     | -        |
| **合計**         | **-**    | **-** | **-** | **-**    |

### 3.2 手動テスト結果（カテゴリ別）

#### 機能テスト（正常系）

| TC-ID  | 機能                     | 期待結果 | 結果 | 備考 |
| ------ | ------------------------ | -------- | ---- | ---- |
| TC-001 | インポート動作           | 成功     | -    | -    |
| TC-002 | 型解決                   | 正常     | -    | -    |
| TC-003 | isDangerousCommand動作   | 正常     | -    | -    |
| TC-004 | isProtectedPath動作      | 正常     | -    | -    |
| TC-005 | validateAllowedTools動作 | 正常     | -    | -    |
| TC-006 | filterAllowedTools動作   | 正常     | -    | -    |
| TC-007 | HOME展開                 | 正常     | -    | -    |

#### エラーハンドリングテスト（異常系）

| TC-ID  | 状況             | 期待結果         | 結果 | 備考 |
| ------ | ---------------- | ---------------- | ---- | ---- |
| TC-101 | 空文字列コマンド | false を返す     | -    | -    |
| TC-102 | 空文字列パス     | false を返す     | -    | -    |
| TC-103 | 無効なツール名   | false/空配列     | -    | -    |
| TC-104 | HOME未設定時     | 空文字として処理 | -    | -    |

#### アクセシビリティテスト

| TC-ID  | 要件     | 結果 | WCAG違反 |
| ------ | -------- | ---- | -------- |
| TC-201 | 該当なし | N/A  | N/A      |

> **注**: 本タスクはバックエンド定数・関数のため、アクセシビリティテストは対象外です。

#### 統合テスト連携

| テスト項目          | 結果 | 課題有無 |
| ------------------- | ---- | -------- |
| @repo/shared ビルド | -    | -        |
| 他パッケージ参照    | -    | -        |

> **注**: 実際の統合テストは TASK-3-1-B（Hooks実装）で実施予定。

---

## 4. 発見課題

| 課題ID | 重要度 | 内容 | 対応 |
| ------ | ------ | ---- | ---- |
| -      | -      | -    | -    |

---

## 5. 参照資料

| 資料名     | パス                            |
| ---------- | ------------------------------- |
| テスト     | `./phase-4-test-creation.md`    |
| 追加テスト | `./phase-6-test-enhancement.md` |
| 実装       | `./phase-5-implementation.md`   |

---

## 6. 完了条件

- [ ] Task 11-1 完了: 関連自動テストの実行確認
- [ ] Task 11-2 完了: 他パッケージからのインポート動作確認
- [ ] Task 11-3 完了: エッジケース手動確認
- [ ] テスト結果レポート作成
- [ ] 発見課題の記録（該当する場合）

---

## 7. 統合テスト連携【必須】

> **N/A**: 本タスクは定数・ユーティリティ関数のみのため、統合テスト連携は対象外です。
>
> 実際の統合テストは TASK-3-1-B（Hooks実装）で以下を実施：
>
> - PreToolUseフックでのセキュリティチェック統合テスト
> - 危険コマンドブロックの動作確認
> - 保護パスブロックの動作確認

---

## 8. 成果物

| 成果物             | パス                                        | 状態     |
| ------------------ | ------------------------------------------- | -------- |
| 手動テストレポート | `outputs/phase-11-manual-testing-report.md` | 作成待ち |
| 発見課題レポート   | `outputs/discovered-issues.md`              | 該当時   |

---

## 9. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 10. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. Task 11-1: 関連自動テストの実行確認
2. Task 11-2: 他パッケージからのインポート動作確認
3. Task 11-3: エッジケース手動確認
4. テスト結果レポート作成
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
