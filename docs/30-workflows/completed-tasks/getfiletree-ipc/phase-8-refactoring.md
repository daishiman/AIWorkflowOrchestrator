# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                        |
| --------- | ------------------------- |
| Phase     | 8                         |
| タスクID  | UT-UI-05A-GETFILETREE-001 |
| タスク名  | skill:getFileTree IPC実装 |
| 機能名    | getfiletree-ipc           |
| 作成日    | 2026-03-03                |
| 状態      | 未着手                    |
| 前提Phase | phase-7-coverage-check.md |
| Issue     | #948                      |

## 目的

テストが全て通過した状態を維持しながら、コードの品質を改善する（TDD Refactor フェーズ）。既存ハンドラとの一貫性確保、重複コード削減、型定義の最適配置を行う。

## 実行タスク

### Task 8-1: コード一貫性チェック

**目的**: getFileTree ハンドラが既存の skillFileHandlers と命名規則・エラーメッセージ形式で統一されていることを確認する

**チェック観点**:

| 観点                   | 確認内容                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| 命名規則               | ハンドラ関数名・変数名が既存ハンドラ（readFile, writeFile 等）と統一      |
| エラーメッセージ形式   | エラーコード・メッセージ文字列が既存パターン（`VALIDATION_ERROR` 等）準拠 |
| バリデーションパターン | P42準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）が統一    |
| ログ出力形式           | ログレベル・フォーマットが既存ハンドラと統一                              |
| JSDoc/コメント         | 全 public 関数に JSDoc が付与されている                                   |

**実行手順**:

1. `skillFileHandlers.ts` 内の既存ハンドラの命名パターンを確認する
2. getFileTree ハンドラとの差分を特定する
3. 不一致箇所を修正する
4. 修正後にテストを実行し全 PASS を確認する:

   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.test.ts
   ```

---

### Task 8-2: 重複コード検出・解消

**目的**: getFileTree の実装と既存コードの間で重複を検出し、共通化を検討する

**チェック観点**:

| 対象                       | 確認内容                                                         |
| -------------------------- | ---------------------------------------------------------------- |
| walkDir と getFileTree     | ディレクトリ走査ロジックに重複がないか確認                       |
| バリデーションパターン     | スキル名バリデーション処理が複数箇所に散在していないか           |
| エラーハンドリングパターン | isKnownSkillFileError のような判定関数が一箇所に集約されているか |
| パス解決ロジック           | スキルパスの解決ロジックが共通ユーティリティとして抽出可能か     |

**判断基準**:

- 3箇所以上で同一パターンが使用されている場合: 共通関数に抽出する
- 2箇所での重複: コメントで関連性を明示し、将来の共通化候補として記録する
- 1箇所のみ: 現状維持（不要な抽象化を避ける）

**実行手順**:

1. `skillFileHandlers.ts` と `SkillFileManager.ts` のコードを読み、重複パターンを特定する
2. 共通化すべき箇所を判定する
3. 共通化を実施する（該当する場合のみ）
4. テスト実行で既存機能が壊れていないことを確認する:

   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.test.ts
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillFileManager.test.ts
   ```

---

### Task 8-3: 型定義の最適配置確認

**目的**: `SkillFileTreeNode` 型が検証可能な場所に配置されているか確認する

**判断フロー**:

| 条件                               | 配置先                                             |
| ---------------------------------- | -------------------------------------------------- |
| Renderer と Main 両方で使用される  | `packages/shared/src/types/`                       |
| Main Process 内でのみ使用される    | `apps/desktop/src/main/types/`                     |
| Preload 経由で Renderer に渡される | `apps/desktop/src/preload/types.ts` に型定義を追加 |

**チェック項目**:

- [ ] `SkillFileTreeNode` 型が P32 準拠で検証可能な場所に配置されているか
- [ ] Preload の `types.ts` と共有型定義に不整合がないか（P23対策）
- [ ] Renderer 側の型定義と Preload 側の型定義が一致しているか

**実行手順**:

1. `SkillFileTreeNode` 型の使用箇所を全て検索する:

   ```bash
   cd apps/desktop && grep -rn "SkillFileTreeNode" src/
   ```

2. 使用箇所に基づき、最適な配置先を判定する
3. 配置変更が必要な場合、P32 準拠で関連ファイルを同時に更新する
4. 型チェックを実行する:

   ```bash
   pnpm typecheck
   ```

---

## リファクタリング前の確認

```bash
# 全テスト通過を確認
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.test.ts
```

## リファクタリング後の確認

```bash
# 対象テスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.test.ts

# SkillFileManager テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillFileManager.test.ts

# 全体テスト（回帰確認）
cd apps/desktop && pnpm vitest run

# 型チェック
pnpm typecheck
```

---

## 参照資料

| 資料名             | パス                                                                          | 説明               |
| ------------------ | ----------------------------------------------------------------------------- | ------------------ |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md`                                          | Phase 7 成果物     |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | コーディング規約   |
| IPC セキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC設計原則        |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                          | P23, P32, P42 対策 |

依存Phase参照: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7

---

## 実行手順

1. リファクタリング前にテストが全 PASS することを確認する
2. Task 8-1: コード一貫性チェックを実施し、不一致を修正する
3. Task 8-2: 重複コードを検出し、要件化された場合は共通化する
4. Task 8-3: 型定義の最適配置を確認し、要件化された場合は移動する
5. 各変更後にテストを実行し、全 PASS を確認する
6. リファクタリング記録を作成する
7. 完了条件を全て満たすことを確認する

---

## 多角的チェック観点（AIが判断）

本Phaseの成果物に対して、以下の観点から品質を検証する:

| 観点       | 確認内容                                         |
| ---------- | ------------------------------------------------ |
| 完全性     | 全てのリファクタリング観点を検討したか           |
| 一貫性     | リファクタリング後もテストが全 PASS するか       |
| 正確性     | コードの可読性・保守性が向上しているか           |
| 追跡可能性 | 変更内容がリファクタリング記録に反映されているか |
| P23/P32    | 型定義の二箇所同時更新が守られているか           |

---

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 8 の定義/成果物と api-ipc-agent.md を照合する          |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物               | パス                                    | 説明                     |
| -------------------- | --------------------------------------- | ------------------------ |
| リファクタリング記録 | `outputs/phase-8/refactoring-report.md` | 変更内容と改善効果の記録 |

---

## 完了条件

- [ ] リファクタリング後も全テストが PASS している
- [ ] 既存ハンドラとの命名規則・エラーメッセージ形式が統一されている
- [ ] 重複コードの検出・解消が検討されている（共通化は必要な場合のみ）
- [ ] `SkillFileTreeNode` 型が検証可能な場所に配置されている
- [ ] P42準拠の3段バリデーションが統一されている
- [ ] ESLint/TypeScript エラーなし
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

Phase 9: 品質検証（`phase-9-quality-assurance.md`）
