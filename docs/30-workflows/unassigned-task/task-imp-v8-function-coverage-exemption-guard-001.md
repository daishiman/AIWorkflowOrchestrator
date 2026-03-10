# v8 Function Coverage P41 exemption の自動検出・管理ガード - タスク指示書

## メタ情報

```yaml
issue_number: 1136
```

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-IMP-V8-FUNCTION-COVERAGE-EXEMPTION-GUARD-001           |
| タスク名     | v8 Function Coverage P41 exemption の自動検出・管理ガード |
| 分類         | 改善                                                      |
| 対象機能     | テスト品質基盤（Vitest カバレッジ計測）                   |
| 優先度       | 低                                                        |
| 見積もり規模 | 中規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | TASK-10A-G Phase 7（カバレッジ確認）                      |
| 発見日       | 2026-03-10                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-G の Phase 7 で G1（Main IPC skill:create 契約テスト）の Function Coverage が 0% となった。原因は P41（v8 カバレッジプロバイダのインライン関数カウント）で、`validateIpcSender` のオプションオブジェクト内 `getAllowedWindows: () => [mainWindow]` が独立関数としてカウントされるため。

現状は「Phase 7 レポートに exemption として手動記載」する運用だが、以下の問題がある:

- P41 該当箇所を手動で発見する必要があり、見落としリスクがある
- Phase 10 レビューで「Function Coverage 0% は本当に P41 か？」の議論が毎回発生する
- handler-scope coverage と file-scope coverage の使い分けが属人的

### 1.2 放置した場合の影響

- 新規 IPC ハンドラテスト作成時に P41 該当箇所を見逃し、Phase 7/10 で無駄な調査・議論が発生
- カバレッジレポートの信頼性が低下し、実際のカバレッジ不足を P41 と誤認するリスク
- Phase 7 ゲート判定が曖昧になり、品質基準の実効性が低下

---

## 2. 何を達成するか（What）

### 2.1 目的

P41 該当箇所（オプションオブジェクト内のインラインアロー関数）の自動検出と、カバレッジレポートへの自動注記を実現し、Phase 7 ゲート判定の属人性を排除する。

### 2.2 最終ゴール

- P41 該当箇所を AST 解析で自動検出するスクリプトが存在する
- カバレッジレポート生成時に P41 exemption が自動注記される
- Phase 7 テンプレートに P41 自動検出結果の記載欄が追加されている

### 2.3 スコープ（含むもの / 含まないもの）

#### 含むもの

- P41 該当箇所を自動検出するスクリプト（`detect-p41-inline-functions.ts`）の作成
- `coverage-by-handler.ts` との連携による P41 exemption 自動注記
- Phase 7 テンプレートへの P41 自動検出結果セクション追加

#### 含まないもの

- v8 カバレッジプロバイダ自体の修正・変更
- Vitest のバージョンアップ対応
- handler-scope coverage スクリプト（`coverage-by-handler.ts`）の新規作成（既存前提）
- P41 以外のカバレッジ exemption パターンへの対応

### 2.4 成果物

| 成果物                          | 説明                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| detect-p41-inline-functions.ts  | AST 解析で P41 該当箇所を自動検出するスクリプト            |
| coverage-by-handler.ts 連携機能 | handler-scope coverage レポートへの P41 exemption 自動注記 |
| Phase 7 テンプレート更新        | P41 自動検出結果セクションの追加                           |
| テストファイル                  | 検出スクリプト自体のテスト                                 |
| Phase 1-12 成果物               | 各Phaseの標準出力ドキュメント                              |

---

## 3. どのように実現するか（How）

### 3.1 技術方針

1. **`apps/desktop/scripts/detect-p41-inline-functions.ts` を作成**
   - AST 解析で `{ key: () => value }` パターンのインラインアロー関数を検出
   - 対象ファイル: `src/main/ipc/*.ts`（IPC ハンドラファイル）
   - 出力: P41 該当箇所のファイル名・行番号・関数名リスト

2. **`coverage-by-handler.ts` と連携**
   - handler-scope coverage レポートに P41 exemption を自動注記
   - `--p41-check` オプションで P41 検出結果を組み込み

3. **Phase 7 テンプレートの更新**
   - 「P41 自動検出結果」セクションを追加
   - 検出された exemption の一覧と、exemption 適用後の補正カバレッジを記載

### 3.2 検出ロジック

| 検出対象                                         | 判定条件                                                             | 例                                      |
| ------------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------- |
| オプションオブジェクト内のアロー関数             | ObjectExpression > Property > ArrowFunctionExpression                | `getAllowedWindows: () => [mainWindow]` |
| validateIpcSender のオプション引数内のアロー関数 | CallExpression(validateIpcSender) > ObjectExpression > ArrowFunction | `validateIpcSender(event, { ... })`     |

### 3.3 リスクと対策

| リスク                                            | 対策                                             |
| ------------------------------------------------- | ------------------------------------------------ |
| AST 解析の誤検出（通常のアロー関数を P41 と判定） | オプションオブジェクト内のプロパティ値に限定する |
| v8 プロバイダのバージョンアップで挙動変更         | Vitest バージョン固定 + CI での回帰テスト        |

---

## 4. TASK-10A-G からの教訓（苦戦箇所）

### 4.1 苦戦箇所一覧

| 苦戦箇所                                                 | 再発条件                                                               | 対処                                                                                                                                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v8 カバレッジプロバイダの関数カウント仕様                | Vitest v8 プロバイダで IPC ハンドラファイルの Function Coverage を計測 | `getAllowedWindows: () => [mainWindow]` 等のオプションオブジェクト内アロー関数が独立カウントされる。Phase 7 レポートで P41 exemption として明記し、Line/Branch Coverage を主判定とする |
| handler-scope coverage vs file-scope coverage の判定混同 | 巨大な skillHandlers.ts（400行超）のカバレッジを計測する               | `coverage-by-handler.ts` で特定ハンドラの行範囲のみを計測する handler-scope coverage を使用                                                                                            |

### 4.2 再利用手順

1. Phase 1 開始前に `grep -rn "getAllowedWindows\|validateIpcSender" apps/desktop/src/main/ipc/` で P41 該当箇所の概数を確認
2. AST 解析には `@typescript-eslint/typescript-estree` または TypeScript Compiler API を使用
3. 検出結果のテストでは skillHandlers.ts の既知の P41 箇所と照合して精度を検証
4. カバレッジ計測は `cd apps/desktop && pnpm vitest run --coverage` で実行（P40 対策）

---

## 5. 参照資料

| 参照資料                            | パス                                                                                                                                      | 内容                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| P41 v8 インライン関数カウント       | `.claude/rules/06-known-pitfalls.md#P41`                                                                                                  | v8 カバレッジプロバイダのインライン関数カウント問題 |
| S33 3層テストアーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#S33`                                           | 3層テストアーキテクチャパターン                     |
| coverage-standards.md               | `.claude/skills/task-specification-creator/references/coverage-standards.md`                                                              | P41 Exemption ルール                                |
| testing-component-patterns.md S17   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                                         | IPC ハンドラキャプチャテストパターン                |
| 06-known-pitfalls.md                | `.claude/rules/06-known-pitfalls.md`                                                                                                      | P40, P41 の詳細                                     |
| TASK-10A-G 成果物                   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-045-task-10a-g-lifecycle-test-hardening/` | 発見元タスクの全成果物                              |
| skillHandlers.ts                    | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                                                              | P41 検出対象の IPC ハンドラファイル                 |

---

## 6. 受け入れ基準

### 機能要件

- [ ] `detect-p41-inline-functions.ts` が作成されている
- [ ] skillHandlers.ts の `getAllowedWindows` が P41 として自動検出される
- [ ] `coverage-by-handler.ts` のレポートに P41 exemption が自動注記される
- [ ] Phase 7 テンプレートに P41 自動検出結果セクションが追加されている
- [ ] 既存の P41 exemption 手動記載と自動検出結果が一致している

### 検証方法

```bash
# P41 検出
cd apps/desktop && pnpm exec tsx scripts/detect-p41-inline-functions.ts --file src/main/ipc/skillHandlers.ts

# handler-scope coverage + P41 注記
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers.create.test.ts && pnpm exec tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:create --coverage coverage/coverage-final.json --p41-check
```

### 品質要件

- [ ] Line Coverage >= 80%
- [ ] Branch Coverage >= 60%
- [ ] Function Coverage >= 80%
- [ ] 全テスト PASS
- [ ] ESLint エラー / 警告なし
- [ ] TypeScript 型チェックエラーなし

### ドキュメント要件

- [ ] Phase 12 実装ガイド（Part 1: 中学生レベル概念説明 / Part 2: 開発者向け実装詳細）
- [ ] LOGS.md x 2 更新
- [ ] SKILL.md x 2 更新
- [ ] documentation-changelog.md 作成
- [ ] topic-map.md 再生成

---

## 7. 関連タスク

| タスクID     | 関係   | 状態   | 説明                                                            |
| ------------ | ------ | ------ | --------------------------------------------------------------- |
| TASK-10A-G   | 発見元 | 進行中 | G1 テスト実装（Phase 7 で P41 exemption が必要となった発見元）  |
| TASK-10A-F   | 関連   | 完了   | ライフサイクル系 API の Store 移行（同様の IPC ハンドラテスト） |
| TASK-10A-E-C | 関連   | 完了   | インポート系 API の Store 移行（同様の IPC ハンドラテスト）     |
