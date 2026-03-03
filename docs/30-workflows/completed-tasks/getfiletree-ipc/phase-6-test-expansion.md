# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                        |
| --------- | ------------------------- |
| Phase     | 6                         |
| タスクID  | UT-UI-05A-GETFILETREE-001 |
| タスク名  | skill:getFileTree IPC実装 |
| 機能名    | getfiletree-ipc           |
| 作成日    | 2026-03-03                |
| 状態      | 未着手                    |
| 前提Phase | phase-5-implementation.md |
| Issue     | #948                      |

## 目的

Phase 5 の実装に対してテストを拡充し、カバレッジ不足箇所を補完する。エラーパス・エッジケース・セキュリティ関連テストを追加し、カバレッジ目標の達成基盤を構築する。

## 実行タスク

### Task 6-1: カバレッジレポート実行・分析

**目的**: 現在のカバレッジ状況を計測し、不足箇所を特定する

**実行手順**:

1. カバレッジ付きテスト実行:

   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/main/ipc/skillFileHandlers.ts src/main/services/skill/SkillFileManager.ts
   ```

2. カバレッジレポートから以下を特定する:
   - 未カバーの行（Line Coverage の不足箇所）
   - 未カバーの分岐（Branch Coverage の不足箇所）
   - 未カバーの関数（Function Coverage の不足箇所）

3. 分析結果を `outputs/phase-6/coverage-analysis.md` に記録する

**期待される成果物**: カバレッジ分析レポート

---

### Task 6-2: 未カバー分岐のテスト追加

**目的**: Task 6-1 で特定した未カバー箇所のテストを追加する

**追加テストケース**:

#### エラーパステスト

| テストID | シナリオ                                  | 入力                               | 期待結果                                                  |
| -------- | ----------------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| GT-E01   | 存在しないスキル名でのgetFileTree呼び出し | skillName: `"nonexistent-skill"`   | SkillNotFoundError 相当のエラーが返される                 |
| GT-E02   | 空文字列のスキル名                        | skillName: `""`                    | バリデーションエラーが返される                            |
| GT-E03   | スペースのみのスキル名（P42対策）         | skillName: `"   "`                 | バリデーションエラーが返される（`.trim() === ""` で拒否） |
| GT-E04   | パストラバーサル攻撃パターン              | skillName: `"../../../etc/passwd"` | バリデーションエラーまたはサニタイズされた結果            |
| GT-E05   | ファイルシステムアクセス権限エラー        | 読み取り不可ディレクトリ           | PermissionError 相当のエラーが返される                    |

#### エッジケーステスト

| テストID | シナリオ                             | 入力                                   | 期待結果                                             |
| -------- | ------------------------------------ | -------------------------------------- | ---------------------------------------------------- |
| GT-EC01  | 空ディレクトリのスキル               | ファイルなしのスキルディレクトリ       | 空の children 配列を持つルートノードが返される       |
| GT-EC02  | シンボリックリンクを含むディレクトリ | symlinkを含むスキルディレクトリ        | シンボリックリンクが安全に処理される（循環参照なし） |
| GT-EC03  | 非常に深いネスト（10階層以上）       | 深くネストされたディレクトリ構造       | 再帰制限またはタイムアウトで安全に打ち切られる       |
| GT-EC04  | 特殊文字を含むファイル名             | ファイル名に日本語・スペースを含む     | 正しくエンコードされたノードが返される               |
| GT-EC05  | 大量ファイル（100+）のディレクトリ   | 多数のファイルを持つスキルディレクトリ | パフォーマンス劣化なく全ファイルが返される           |

#### isKnownSkillFileError の false パステスト

| テストID | シナリオ                                        | 入力                   | 期待結果           |
| -------- | ----------------------------------------------- | ---------------------- | ------------------ |
| GT-EF01  | 未知のエラー型がisKnownSkillFileErrorに渡される | `new Error("unknown")` | `false` が返される |
| GT-EF02  | null/undefined がエラーとして渡される           | `null`, `undefined`    | `false` が返される |

**テスト実装先**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`

---

### Task 6-3: validateIpcSender コールバック関数の呼び出し検証（P41対策）

**目的**: v8 カバレッジプロバイダがインライン arrow function を独立関数としてカウントする問題に対処し、validateIpcSender のコールバック関数（`getAllowedWindows` 等）のカバレッジを確保する

**実行手順**:

1. skillFileHandlers の validateIpcSender 呼び出し箇所を特定する
2. テスト内でモックの呼び出し引数からコールバックを取得し、明示的に実行する:

   ```typescript
   // P41対策: コールバック関数のカバレッジ確保
   const senderValidationCall = mockValidateIpcSender.mock.calls[0];
   const options = senderValidationCall[2]; // 第3引数のオプションオブジェクト
   const allowedWindows = options.getAllowedWindows();
   expect(allowedWindows).toContain(mockMainWindow);
   ```

3. 全ての validateIpcSender コールバックが実行されていることを検証する

**期待される成果物**: P41対策を含むテストコード

---

## 参照資料

| 資料名               | パス                                                                          | 説明                 |
| -------------------- | ----------------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト仕様書 | `docs/30-workflows/completed-tasks/getfiletree-ipc/phase-4-test-creation.md`  | Phase 4 成果物       |
| Phase 5 実装仕様書   | `docs/30-workflows/completed-tasks/getfiletree-ipc/phase-5-implementation.md` | Phase 5 成果物       |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | カバレッジ基準       |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                          | P41, P9, P40 対策    |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC セキュリティ要件 |

---

## 実行手順

1. Phase 5 の成果物（実装コード）を確認する
2. Task 6-1: カバレッジレポートを実行し、不足箇所を分析する
3. Task 6-2: 分析結果に基づき、エラーパス・エッジケーステストを追加する
4. Task 6-3: validateIpcSender コールバックの呼び出し検証を追加する（P41対策）
5. 全テストを実行し PASS を確認する
6. 成果物を所定のパスに配置する
7. 完了条件を全て満たすことを確認する

---

## カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 多角的チェック観点（AIが判断）

本Phaseの成果物に対して、以下の観点から品質を検証する:

| 観点       | 確認内容                                                           |
| ---------- | ------------------------------------------------------------------ |
| 完全性     | 全ての未カバー箇所に対するテストが追加されているか                 |
| 一貫性     | 既存テストと新規テストの命名規則・構造が統一されているか           |
| 正確性     | テストの期待値が仕様に基づいて正確に設定されているか               |
| 追跡可能性 | 各テストケースIDが Phase 4 のテスト仕様書と追跡可能か              |
| P41対策    | validateIpcSender コールバックのカバレッジが確保されているか       |
| P9対策     | テスト間で状態がリークしないよう beforeEach でリセットされているか |

---

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 6 の定義/成果物と api-ipc-agent.md を照合する          |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物                 | パス                                                            | 説明                         |
| ---------------------- | --------------------------------------------------------------- | ---------------------------- |
| カバレッジ分析レポート | `outputs/phase-6/coverage-analysis.md`                          | カバレッジ不足箇所の分析結果 |
| テスト拡充レポート     | `outputs/phase-6/test-enhancement-report.md`                    | 追加テストの一覧と結果       |
| テストコード           | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts` | 拡充テスト                   |

---

## 完了条件

- [ ] カバレッジレポートが実行され、不足箇所が特定されている
- [ ] エラーパステスト（GT-E01〜GT-E05）が追加されている
- [ ] エッジケーステスト（GT-EC01〜GT-EC05）が追加されている
- [ ] isKnownSkillFileError の false パステスト（GT-EF01〜GT-EF02）が追加されている
- [ ] validateIpcSender コールバックの呼び出し検証が追加されている（P41対策）
- [ ] 全テストが PASS している
- [ ] テスト間で状態リークがない（P9対策: beforeEach でリセット）
- [ ] テスト実行は `cd apps/desktop` から実行している（P40対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク     | 状態 | 備考 |
| -------------- | ---- | ---- |
| (実行時に記録) | -    | -    |

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクを完了した
- [ ] 全ての成果物を作成した
- [ ] 全ての完了条件を満たした
- [ ] 成果物の品質を多角的チェック観点で検証した

> **注意**: このチェックリストが全てチェックされるまで、次のPhaseに進んではならない。

## 次のPhase

Phase 7: カバレッジ確認（`phase-7-coverage-check.md`）
