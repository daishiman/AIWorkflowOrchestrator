# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 6                  |
| Phase名    | テスト拡充         |
| 前提Phase  | Phase 5            |
| 後続Phase  | Phase 7            |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

Phase 5で実装した基本テストに加え、境界値・エッジケース・エラーパスのテストを追加し、カバレッジ80%達成に向けたテスト網羅性を向上させる。

## 背景

Phase 5の44テストケースは仕様書で定義された基本ケースをカバーするが、実装コードの全分岐を網羅するには追加のテストが必要な場合がある。カバレッジ目標（Line 80%, Branch 60%, Function 80%）を達成するため、未カバーのコードパスを特定し追加テストを作成する。

## 実行タスク

### Task 1: カバレッジ予備計測

**目的**: Phase 5完了時点のカバレッジを計測し、追加テストが必要な箇所を特定する。

**実行手順**:

1. 以下のコマンドでカバレッジを計測する：
   ```bash
   pnpm --filter @repo/desktop vitest run --coverage \
     src/main/services/skill/__tests__/SkillScanner.test.ts \
     src/main/services/skill/__tests__/SkillImportManager.test.ts \
     src/main/services/skill/__tests__/SkillExecutor.test.ts \
     src/main/services/skill/__tests__/PermissionResolver.test.ts \
     src/renderer/store/slices/__tests__/skillSlice.test.ts
   ```
2. 各モジュールのカバレッジ（Line, Branch, Function, Statement）を記録する
3. 80%未満のモジュールを特定し、未カバーの行番号・分岐を洗い出す
4. 結果を `outputs/phase-6/preliminary-coverage.md` に出力する

**期待される成果物**:

- `outputs/phase-6/preliminary-coverage.md`

### Task 2: 境界値テスト追加

**目的**: 各モジュールの入力境界値に対するテストを追加する。

**実行手順**:

1. Task 1の結果から未カバーの境界値パスを特定する
2. 以下の境界値テストを検討し、必要なものを追加する：

**SkillScanner 境界値**:

- 空文字列のスキル名
- 非常に長いスキル名（256文字以上）
- 特殊文字を含むスキル名（日本語、スペース、記号）
- frontmatter の `allowed_tools` が空配列の場合
- SKILL.md のサイズが0バイトの場合

**SkillImportManager 境界値**:

- スキル名が空文字列の場合
- 大量のスキル（100件以上）が登録されている場合
- メタデータフィールドが欠損している場合

**SkillExecutor 境界値**:

- プロンプトが空文字列の場合
- 同時に複数のexecuteを呼び出した場合
- abort後に再度executeを呼び出した場合

**PermissionResolver 境界値**:

- 同一requestIdで複数回waitForResponseを呼び出した場合
- resolveRequest後に再度resolveRequestを呼び出した場合

**skillSlice 境界値**:

- fetchSkills中に再度fetchSkillsを呼び出した場合
- importSkill中にremoveSkillを呼び出した場合

3. 追加テストを各テストファイルに実装する

**期待される成果物**:

- 各テストファイル（更新）

### Task 3: エラーパステスト追加

**目的**: 各モジュールのエラーハンドリングパスを網羅するテストを追加する。

**実行手順**:

1. Task 1のカバレッジ結果から、未カバーのcatch/errorパスを特定する
2. 以下のエラーパステストを検討し、必要なものを追加する：

**SkillScanner エラーパス**:

- `fs.readdir` がENOENT以外のエラーを返す場合（EACCES等）
- `fs.readFile` がENOENT以外のエラーを返す場合
- YAML パースエラー（不正なYAML構文）

**SkillExecutor エラーパス**:

- SDK呼び出しがタイムアウトした場合
- SDK呼び出しがネットワークエラーを返した場合
- コールバック関数内でエラーが発生した場合

**skillSlice エラーパス**:

- `window.electronAPI.skill.list` がundefinedの場合
- IPC呼び出しがタイムアウトした場合

3. 追加テストを各テストファイルに実装する

**期待される成果物**:

- 各テストファイル（更新）

### Task 4: カバレッジ再計測と記録

**目的**: 追加テスト後のカバレッジを計測し、目標達成状況を確認する。

**実行手順**:

1. Task 2, Task 3の追加テスト実装後、再度カバレッジを計測する：
   ```bash
   pnpm --filter @repo/desktop vitest run --coverage
   ```
2. Phase 5時点とのカバレッジ差分を記録する
3. 80%未満のモジュールが残っている場合、追加テストの候補をリストアップする
4. 結果を `outputs/phase-6/coverage-report.md` に出力する

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`

## 参照資料

| 参照資料          | パス                                                    | 説明              |
| ----------------- | ------------------------------------------------------- | ----------------- |
| 実装サマリー      | `outputs/phase-5/implementation-summary.md`             | Phase 5テスト結果 |
| テスト設計書      | `outputs/phase-2/test-design.md`                        | テスト構造設計    |
| カバレッジ基準    | aiworkflow-requirements `quality-requirements.md`       | カバレッジ目標    |
| SkillScanner実装  | `apps/desktop/src/main/services/skill/SkillScanner.ts`  | カバレッジ対象    |
| SkillExecutor実装 | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | カバレッジ対象    |
| テスト仕様書      | `outputs/phase-4/test-specification.md`                 | Phase 4 成果物    |

## 成果物

| 成果物             | パス                                      | 説明                     |
| ------------------ | ----------------------------------------- | ------------------------ |
| 予備カバレッジ     | `outputs/phase-6/preliminary-coverage.md` | Phase 5時点のカバレッジ  |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`      | 拡充後のカバレッジと差分 |

## 統合テスト連携

- 境界値テストの追加が統合テスト（TASK-8B, TASK-8C）のテスト範囲と重複しないことを確認する
- エラーパステストのうち、IPC通信エラーに起因するものは統合テストの範囲として除外する

## 完了条件

- [ ] Phase 5時点のカバレッジが計測・記録されている
- [ ] 未カバーの境界値・エラーパスが特定されている
- [ ] 境界値テストが各モジュールに追加されている
- [ ] エラーパステストが各モジュールに追加されている
- [ ] 追加テスト後のカバレッジが計測・記録されている
- [ ] 全テスト（既存＋追加）が通過している
- [ ] 2つの成果物ファイルが `outputs/phase-6/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 6 \
  --artifacts "outputs/phase-6/preliminary-coverage.md:予備カバレッジ,outputs/phase-6/coverage-report.md:カバレッジレポート"
```

## 依存関係

| 項目      | 内容    |
| --------- | ------- |
| 前提Phase | Phase 5 |
| 後続Phase | Phase 7 |

## 次のPhase

→ [phase-7-coverage-check.md](phase-7-coverage-check.md)
