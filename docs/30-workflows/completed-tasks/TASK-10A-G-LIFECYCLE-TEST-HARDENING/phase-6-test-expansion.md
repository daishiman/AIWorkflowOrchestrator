# Phase 6: テスト拡充 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| タスクID  | TASK-10A-G                      |
| Phase     | 6                               |
| 名称      | テスト拡充                      |
| 依存Phase | Phase 5（実装）                 |
| 次Phase   | Phase 7（テストカバレッジ確認） |

---

## 目的

Phase 5 で Green になった28テストケースに加え、境界値テスト、非同期エラーハンドリングテスト、テスト間独立性検証を追加し、テストの堅牢性を高める。

---

## 実行タスク

### Task 1: 境界値テスト追加（Layer 1: skillHandlers.create.test.ts）

#### Step 1-1: description の境界値テスト

既存の `describe("入力バリデーション")` ブロック内に以下のテストケースを追加する:

| テストケースID | テスト内容                                                   | 入力値               |
| -------------- | ------------------------------------------------------------ | -------------------- |
| TC-G01-015     | description が1文字の場合に成功する                          | `"a"`                |
| TC-G01-016     | description が超長文（10,000文字）の場合の動作               | `"a".repeat(10000)`  |
| TC-G01-017     | description に特殊文字（日本語、絵文字）を含む場合に成功する | `"スキル作成テスト"` |
| TC-G01-018     | description に改行を含む場合の動作                           | `"line1\nline2"`     |

#### Step 1-2: options の境界値テスト

| テストケースID | テスト内容                                 | 入力値              |
| -------------- | ------------------------------------------ | ------------------- |
| TC-G01-019     | options が空オブジェクトの場合に成功する   | `{}`                |
| TC-G01-020     | options に未知のプロパティを含む場合の動作 | `{ unknown: true }` |

### Task 2: 非同期エラーハンドリングテスト追加（Layer 1）

#### Step 2-1: サービス層の非同期エラーパターン

既存の `describe("エラー系")` ブロック内に以下を追加する:

| テストケースID | テスト内容                                                  |
| -------------- | ----------------------------------------------------------- |
| TC-G01-021     | サービスが非同期で拒否される場合にCREATE_ERRORを返す        |
| TC-G01-022     | サービスがタイムアウト的に長時間かかる場合の動作（5秒以上） |

- TC-G01-021: `mockSkillService.createSkillFromWizard.mockRejectedValue(new Error("async error"))` を使用する
- TC-G01-022: `mockSkillService.createSkillFromWizard.mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 100)))` を使用する（実テストでは短縮時間）

### Task 3: エラーサニタイズの追加テスト（Layer 1）

#### Step 3-1: サニタイズパターンの網羅

| テストケースID | テスト内容                   | 入力値                                         |
| -------------- | ---------------------------- | ---------------------------------------------- |
| TC-G01-023     | Windowsパスが除去される      | `"Error at C:\\Users\\user\\file.ts"`          |
| TC-G01-024     | 複数パスが同時に除去される   | `"/path/a error /path/b"`                      |
| TC-G01-025     | スタックトレースが除去される | `"Error\n    at Function (/app/index.js:1:1)"` |

### Task 4: Renderer統合テストの拡充（Layer 2: SkillLifecycle.integration.test.tsx）

#### Step 4-1: エラーシナリオの拡充

| テストケースID | テスト内容                                                     |
| -------------- | -------------------------------------------------------------- |
| TC-G02-011     | 下位 API がネットワークエラー相当で reject した場合の UI 動作  |
| TC-G02-012     | create成功後の一覧同期で store action が失敗した場合の UI 動作 |

- 統合ハーネス下位の API 応答を `mockRejectedValue` で制御し、UIがクラッシュしないことを検証する

#### Step 4-2: 状態遷移の整合性テスト

| テストケースID | テスト内容                                                                    |
| -------------- | ----------------------------------------------------------------------------- |
| TC-G02-013     | ウィザード表示中に別の store 更新（一覧再取得）が割り込んでもクラッシュしない |
| TC-G02-014     | create を連続送信した場合に in-flight ガードが効く                            |

### Task 5: テスト間独立性検証

#### Step 5-1: ランダム順序実行

以下のコマンドでテストをランダム順序で実行し、全件PASSすることを確認する:

```bash
# Layer 1: ランダム順序実行
cd apps/desktop && pnpm vitest run --sequence.shuffle src/main/ipc/__tests__/skillHandlers.create.test.ts

# Layer 2: ランダム順序実行
cd apps/desktop && pnpm vitest run --sequence.shuffle src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# Layer 3: ランダム順序実行
cd apps/desktop && pnpm vitest run --sequence.shuffle src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

#### Step 5-2: 単独実行確認

各テストファイルを個別に実行し、他テストファイルへの依存がないことを確認する:

```bash
# 各ファイル単独実行（他ファイルを含めない）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts --no-file-parallelism
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx --no-file-parallelism
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx --no-file-parallelism
```

### Task 6: テスト拡充結果の記録

テスト拡充結果を `outputs/phase-6/test-expansion-result.md` に記録する。以下の情報を含める:

- 追加テストケースの一覧と結果（PASS/FAIL）
- ランダム順序実行の結果
- 単独実行確認の結果
- 追加テストにより発見された問題（ある場合）

---

## 参照資料

| 参照資料        | パス                                                                                              | 使用セクション        |
| --------------- | ------------------------------------------------------------------------------------------------- | --------------------- |
| Phase 5 成果物  | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-5-implementation.md` | テストコード現状      |
| Phase 2 設計書  | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`         | テストデータ設計      |
| IPC API仕様     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                              | 境界値の仕様根拠      |
| テストパターン  | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                 | テスト拡充パターン    |
| 品質要件        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                       | カバレッジ基準        |
| エラー仕様      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                             | エラーサニタイズ仕様  |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                      | P42 3段バリデーション |

---

## 統合テスト連携

### 追加テストケースのサマリ

| Layer   | 追加テスト数 | カテゴリ                        |
| ------- | ------------ | ------------------------------- |
| Layer 1 | 11           | 境界値6 + 非同期2 + サニタイズ3 |
| Layer 2 | 4            | エラー拡充2 + 状態遷移2         |
| Layer 3 | 0            | 追加なし（Phase 4 で完了）      |
| 合計    | 15           |                                 |

### Phase 5 からの累積テストケース数

| テストファイル                          | Phase 5 | Phase 6 追加 | 合計 |
| --------------------------------------- | ------- | ------------ | ---- |
| skillHandlers.create.test.ts            | 14      | 11           | 25   |
| SkillLifecycle.integration.test.tsx     | 10      | 4            | 14   |
| ChatPanel.skill-management.test.tsx追加 | 4       | 0            | 4    |
| 合計                                    | 28      | 15           | 43   |

---

## 成果物

| 成果物                              | パス                                       | 種別 |
| ----------------------------------- | ------------------------------------------ | ---- |
| テスト拡充結果レポート              | `outputs/phase-6/test-expansion-result.md` | 新規 |
| skillHandlers.create.test.ts        | 既存ファイルにテストケース追加             | 修正 |
| SkillLifecycle.integration.test.tsx | 既存ファイルにテストケース追加             | 修正 |

---

## 完了条件

- [ ] Layer 1 に11件の追加テストケース（TC-G01-015〜025）が作成され全件 PASS
- [ ] Layer 2 に4件の追加テストケース（TC-G02-011〜014）が作成され全件 PASS
- [ ] 全テスト合計43件が Green である
- [ ] ランダム順序実行（`--sequence.shuffle`）で全件 PASS
- [ ] 各テストファイルの単独実行で全件 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が成功する
- [ ] テスト実行時間が30秒以内である
- [ ] テスト拡充結果レポートが `outputs/phase-6/test-expansion-result.md` に出力されている
- [ ] Layer 3 の既存テストが回帰していない

---

## 次Phase

Phase 7（テストカバレッジ確認）: カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を確認し、未達の場合は Phase 6 に戻る。
