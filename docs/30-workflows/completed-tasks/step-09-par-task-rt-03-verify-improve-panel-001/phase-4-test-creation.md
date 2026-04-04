# Phase 4: テスト作成

## メタ情報

| 項目      | 内容                    |
| --------- | ----------------------- |
| Phase     | 4                       |
| 名称      | テスト作成（TDD Red）   |
| 前提Phase | Phase 3（設計レビュー） |
| 次Phase   | Phase 5（実装）         |
| 作成日    | 2026-04-03              |

## 目的

Phase 2 の設計に基づき、VerifyResultDetailPanel / ImproveResultDetailPanel の TDD Red テストケースを作成する。テストは実装前に記述し、全て FAIL することを確認する。

## 命名規則整合確認

Phase 1 で確認した命名規則との整合:

- テストファイル: `VerifyResultDetailPanel.test.tsx` / `ImproveResultDetailPanel.test.tsx` — PascalCase.test.tsx ✓
- data-testid: `verify-result-detail-panel` / `improve-result-detail-panel` — kebab-case ✓
- import: `@repo/shared/types` から型import — 既存パターン踏襲 ✓

## 実行タスク

### Task 4-1: VerifyResultDetailPanel テストケース設計

テストファイル: `apps/desktop/src/renderer/components/skill/__tests__/VerifyResultDetailPanel.test.tsx`

| TC ID   | テストケース                                           | 検証内容                             |
| ------- | ------------------------------------------------------ | ------------------------------------ |
| TC-V-01 | null 入力で何も表示しない                              | verifyDetail=null → null render      |
| TC-V-02 | isLoading=true でスケルトンを表示                      | data-testid="verify-result-skeleton" |
| TC-V-03 | error のみで ErrorBanner を表示                        | ErrorBanner コンポーネント表示       |
| TC-V-04 | status="pass" で StatusBadge(label override) を表示    | aria-label="合格"                    |
| TC-V-05 | status="fail" で StatusBadge(label override) を表示    | aria-label="不合格"                  |
| TC-V-06 | status="pending" で StatusBadge(label override) を表示 | aria-label="検証中"                  |
| TC-V-07 | checks を Layer 別にグループ化して表示                 | layer1〜layer4 のグループヘッダー    |
| TC-V-08 | severity=error のチェック項目にエラーアイコンを表示    | ✗ アイコン表示                       |
| TC-V-09 | severity=warning のチェック項目に警告アイコンを表示    | ⚠ アイコン表示                       |
| TC-V-10 | severity=info のチェック項目に情報アイコンを表示       | ℹ アイコン表示                       |
| TC-V-11 | message がある場合にメッセージを表示                   | message テキスト表示                 |
| TC-V-12 | nextAction がある場合にバッジを表示                    | nextAction タグ表示                  |
| TC-V-13 | evidenceCount をバッジで表示                           | evidenceCount 数値表示               |
| TC-V-14 | reverifyEligible=true で reverify ボタンが有効         | ボタン enabled                       |
| TC-V-15 | reverifyEligible=false で reverify ボタンが無効        | ボタン disabled                      |
| TC-V-16 | planId を DetailFooter で表示                          | "Plan ID: xxx" 表示                  |
| TC-V-17 | delegatedGovernanceNote / delegatedSessionNote を表示  | ノートテキスト表示                   |
| TC-V-18 | route 情報を表示                                       | route.type, route.summary 表示       |
| TC-V-19 | onRetry コールバックが ErrorBanner 経由で呼ばれる      | onRetry mock 検証                    |

### Task 4-2: ImproveResultDetailPanel テストケース設計

テストファイル: `apps/desktop/src/renderer/components/skill/__tests__/ImproveResultDetailPanel.test.tsx`

| TC ID   | テストケース                                       | 検証内容                              |
| ------- | -------------------------------------------------- | ------------------------------------- |
| TC-I-01 | null 入力で何も表示しない                          | improveResult=null → null render      |
| TC-I-02 | isLoading=true でスケルトンを表示                  | data-testid="improve-result-skeleton" |
| TC-I-03 | error のみで ErrorBanner を表示                    | ErrorBanner コンポーネント表示        |
| TC-I-04 | suggestions を section/before/after/reason で表示  | 各フィールドのテキスト表示            |
| TC-I-05 | 複数 suggestions を全て表示                        | suggestions.length 分のカード表示     |
| TC-I-06 | suggestions が空配列で「提案なし」を表示           | 空状態メッセージ表示                  |
| TC-I-07 | revisedSpec がある場合に折りたたみセクションを表示 | 折りたたみボタン + コードブロック     |
| TC-I-08 | revisedSpec の折りたたみを展開できる               | クリック後にコード表示                |
| TC-I-09 | revisedSpec がない場合にセクションを非表示         | revisedSpec セクション不在            |
| TC-I-10 | improveId を DetailFooter で表示                   | "Improve ID: xxx" 表示                |
| TC-I-11 | 提案数バッジに suggestions.length を表示           | "N suggestions" バッジ表示            |
| TC-I-12 | onRetry コールバックが ErrorBanner 経由で呼ばれる  | onRetry mock 検証                     |

## 参照資料

| 参照資料       | パス                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| Phase 2 設計   | `phase-2-design.md`                                                                      |
| 既存テスト参考 | `apps/desktop/src/renderer/components/skill/__tests__/PlanResultDetailPanel.test.tsx`    |
| 既存テスト参考 | `apps/desktop/src/renderer/components/skill/__tests__/ExecuteResultDetailPanel.test.tsx` |

## 成果物

| 成果物                          | 配置先                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| VerifyResultDetailPanel テスト  | `apps/desktop/src/renderer/components/skill/__tests__/VerifyResultDetailPanel.test.tsx`  |
| ImproveResultDetailPanel テスト | `apps/desktop/src/renderer/components/skill/__tests__/ImproveResultDetailPanel.test.tsx` |

**注意**: テストコードは `outputs/` ではなくプロジェクトの該当ディレクトリに配置すること。

## 完了条件

- [ ] VerifyResultDetailPanel のテストケース 19件（TC-V-01〜TC-V-19）が作成されている
- [ ] ImproveResultDetailPanel のテストケース 12件（TC-I-01〜TC-I-12）が作成されている
- [ ] 全テストが FAIL する（TDD Red 確認）
- [ ] テストファイルの命名規則が Phase 1 で確認した規則と整合している
- [ ] TypeScript 型チェックがエラー 0件である

## タスク100%実行確認【必須】

- [ ] Task 4-1: VerifyResultDetailPanel テストケース設計・作成
- [ ] Task 4-2: ImproveResultDetailPanel テストケース設計・作成

## 次Phase

Phase 5（実装）へ進む。TDD Red テストを全て PASS させる実装を行う。
