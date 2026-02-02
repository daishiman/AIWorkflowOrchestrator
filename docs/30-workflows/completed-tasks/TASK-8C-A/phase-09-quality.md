# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 9                           |
| Phase名    | 品質保証                    |
| 前提Phase  | Phase 8（リファクタリング） |
| 後続Phase  | Phase 10（最終レビュー）    |
| ステータス | 未実施                      |
| 作成日     | 2026-02-01                  |
| 機能名     | TASK-8C-A: IPC統合テスト    |

---

## 目的

全成果物（テストコード・追加実装コード・ドキュメント）の品質を包括的に検証する。機能面・コード品質・テスト品質・セキュリティの各観点で品質ゲートを適用する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能検証

**目的**: テストコードが受け入れ基準（AC-001〜AC-010）を全て満たすことを確認する

**実行手順**:

1. Phase 1 で定義した受け入れ基準を1つずつ検証する：

| 基準ID | 検証方法                                                                      | 結果   |
| ------ | ----------------------------------------------------------------------------- | ------ |
| AC-001 | `skillIpc.integration.test.ts` 内の `it()` ブロック数を数え、基本12件を確認   | \_\_\_ |
| AC-002 | IMP-002 追加の `it()` ブロック数を数え、10件を確認                            | \_\_\_ |
| AC-003 | `pnpm --filter @repo/desktop vitest run ...skillIpc.integration.test.ts` 実行 | \_\_\_ |
| AC-004 | `vitest --coverage` で `skillHandlers.ts` 行カバレッジ90%以上を確認           | \_\_\_ |
| AC-005 | テストコード内で `validateIpcSender` の検証箇所を確認                         | \_\_\_ |
| AC-006 | `pnpm --filter @repo/desktop tsc --noEmit` 実行                               | \_\_\_ |
| AC-007 | ファイル名が `skillIpc.integration.test.ts` であることを確認                  | \_\_\_ |
| AC-008 | ファイルが `apps/desktop/src/main/ipc/__tests__/` に配置されていることを確認  | \_\_\_ |
| AC-009 | 各チャネルの正常系・異常系テストが両方存在することを確認                      | \_\_\_ |
| AC-010 | 戻り値の `success` / `data` / `error` フィールドが検証されていることを確認    | \_\_\_ |

2. `outputs/phase-09/quality-report.md` に検証結果を記録する

**期待される成果物**:

- `outputs/phase-09/quality-report.md`

---

### タスク2: コード品質検証

**目的**: コードが品質基準を満たすことを確認する

**実行手順**:

1. ESLint を実行する：

   ```bash
   pnpm --filter @repo/desktop lint
   ```

2. Prettier でフォーマットを確認する：

   ```bash
   pnpm --filter @repo/desktop prettier --check "src/main/ipc/__tests__/skillIpc.integration.test.ts"
   ```

3. TypeScript の strict モードコンパイルを確認する：

   ```bash
   pnpm --filter @repo/desktop tsc --noEmit
   ```

4. 結果を `outputs/phase-09/quality-report.md` に追記する

**期待される成果物**:

- コード品質検証結果（`outputs/phase-09/quality-report.md` に含む）

---

### タスク3: セキュリティ検証

**目的**: テストコードと追加実装がセキュリティ基準を満たすことを確認する

**実行手順**:

1. 以下のセキュリティ観点を確認する：

| 観点                     | 確認内容                                                  | 結果   |
| ------------------------ | --------------------------------------------------------- | ------ |
| validateIpcSender テスト | 全ハンドラーで sender 検証のテストが存在するか            | \_\_\_ |
| チャネルホワイトリスト   | 追加チャネルが `channels.ts` のホワイトリストに含まれるか | \_\_\_ |
| パストラバーサル         | テストデータにパストラバーサルパターンが含まれないか      | \_\_\_ |
| 機密情報                 | テストコードに機密情報がハードコードされていないか        | \_\_\_ |

2. 結果を `outputs/phase-09/quality-report.md` に追記する

**期待される成果物**:

- セキュリティ検証結果（`outputs/phase-09/quality-report.md` に含む）

---

### タスク4: 全テスト統合実行

**目的**: デスクトップアプリ全体のテストが影響なく実行されることを確認する

**実行手順**:

1. デスクトップアプリ全体のテストを実行する：

   ```bash
   pnpm --filter @repo/desktop vitest run
   ```

2. 失敗テストがないことを確認する
3. 結果を `outputs/phase-09/quality-report.md` に追記する

**期待される成果物**:

- 統合テスト結果（`outputs/phase-09/quality-report.md` に含む）

---

## 参照資料

| 参照資料             | パス                                                | 内容             |
| -------------------- | --------------------------------------------------- | ---------------- |
| Phase 1 受け入れ基準 | `outputs/phase-01/acceptance-criteria.md`           | 検証対象基準     |
| カバレッジレポート   | `outputs/phase-07/coverage-report.md`               | カバレッジ基準   |
| リファクタリングログ | `outputs/phase-08/refactoring-log.md`               | 変更内容         |
| 品質基準             | `task-specification-creator: quality-standards.md`  | 品質ゲート基準   |
| セキュリティ仕様     | `aiworkflow-requirements: security-electron-ipc.md` | セキュリティ基準 |

---

## 成果物

| 成果物       | パス                                 | 内容         |
| ------------ | ------------------------------------ | ------------ |
| 品質レポート | `outputs/phase-09/quality-report.md` | 品質検証結果 |

---

## 統合テスト連携

- デスクトップアプリ全体のテスト実行で失敗がないことを確認する
- カバレッジが Phase 7 の測定値から低下していないことを確認する

---

## 多角的チェック観点

| 観点         | 確認内容                                           |
| ------------ | -------------------------------------------------- |
| 機能完全性   | 受け入れ基準（AC-001〜AC-010）を全て満たしているか |
| コード品質   | ESLint / Prettier / TypeScript strict がパスするか |
| セキュリティ | IPC セキュリティ基準を満たしているか               |
| テスト品質   | テストが意味のある検証を行っているか               |
| 統合品質     | 全体テストに影響がないか                           |

---

## 完了条件

- [ ] 受け入れ基準（AC-001〜AC-010）が全てPASSしている
- [ ] ESLint / Prettier / TypeScript strict が全てパスする
- [ ] セキュリティ検証が全項目パスする
- [ ] デスクトップアプリ全体のテストがパスする
- [ ] `outputs/phase-09/quality-report.md` が配置されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 機能検証
3. タスク2: コード品質検証
4. タスク3: セキュリティ検証
5. タスク4: 全テスト統合実行
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-10-final-review.md`
