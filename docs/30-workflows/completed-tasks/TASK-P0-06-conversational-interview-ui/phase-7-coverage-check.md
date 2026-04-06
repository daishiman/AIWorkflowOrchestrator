# Phase 7: カバレッジ確認 - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| Phase名    | カバレッジ確認                         |
| 前提Phase  | Phase 6（テスト拡充）                  |
| 後続Phase  | Phase 8（リファクタリング）            |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |
| Issue      | #1889                                  |

---

## 目的

テストカバレッジが基準値（Line 80%+, Branch 60%+, Function 80%+）を満たしているかを定量的に確認する。未達の場合はPhase 6へ戻り、追加テストを作成する。

## 背景

Phase 4〜6で計71件のテスト（CT-26件 + UT-16件 + IT-6件 + EX-10件 + EH-6件 + A11Y-7件）が作成・実行され、全件PASSしている。本Phaseでは、これらのテストが変更対象ファイルに対して十分なカバレッジを提供しているかを定量的に計測する。

---

## 実行タスク

### タスク1: カバレッジ計測の実行

**目的**: 変更対象ファイルのカバレッジを計測する。

**実行手順**:

1. カバレッジレポートの生成

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- \
  --testPathPattern="skill/(ConversationalInterview|useInterviewState)" \
  --coverage \
  --coverageReporters=text \
  --coverageReporters=lcov
```

2. 変更対象ファイルのカバレッジ抽出

対象ファイル:

| ファイル                            | 変更種別 | カバレッジ対象 |
| ----------------------------------- | -------- | -------------- |
| `hooks/useInterviewState.ts`        | 拡張     | 必須           |
| `ConversationalInterview.tsx`       | 拡張     | 必須           |
| `SkillCreatorConversationPanel.tsx` | 拡張     | 必須           |

```bash
# 個別ファイルのカバレッジ確認
pnpm --filter @repo/desktop test -- \
  --testPathPattern="skill/(ConversationalInterview|useInterviewState)" \
  --coverage \
  --collectCoverageFrom="src/renderer/components/skill/hooks/useInterviewState.ts" \
  --collectCoverageFrom="src/renderer/components/skill/ConversationalInterview.tsx" \
  --collectCoverageFrom="src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx" \
  --coverageReporters=text
```

---

### タスク2: カバレッジ基準の照合

**目的**: 計測結果を基準値と照合し、合否を判定する。

#### カバレッジ基準値（NFR-03, NFR-04より）

| メトリクス | 基準値 | 根拠   |
| ---------- | ------ | ------ |
| Line       | 80%+   | NFR-03 |
| Branch     | 60%+   | NFR-04 |
| Function   | 80%+   | NFR-03 |

#### カバレッジ結果記録テンプレート

| ファイル                            | Line   | Branch | Function | 判定 |
| ----------------------------------- | ------ | ------ | -------- | ---- |
| `hooks/useInterviewState.ts`        | --%    | --%    | --%      | -    |
| `ConversationalInterview.tsx`       | --%    | --%    | --%      | -    |
| `SkillCreatorConversationPanel.tsx` | --%    | --%    | --%      | -    |
| **合計**                            | **--** | **--** | **--**   | -    |

#### 判定基準

| 判定     | 条件                                     | アクション                    |
| -------- | ---------------------------------------- | ----------------------------- |
| **PASS** | 全メトリクスが基準値以上                 | Phase 8へ進行                 |
| PARTIAL  | 一部メトリクスが基準値未満（差分5%以内） | 不足箇所を特定しPhase 6へ戻る |
| FAIL     | 複数メトリクスが基準値未満（差分5%超）   | 不足分析→Phase 6へ戻る        |

---

### タスク3: 未カバー箇所の分析

**目的**: カバレッジ未達の場合に、不足箇所を特定し補完計画を策定する。

**実行手順**:

1. カバレッジレポート（HTML）の生成

```bash
pnpm --filter @repo/desktop test -- \
  --testPathPattern="skill/(ConversationalInterview|useInterviewState)" \
  --coverage \
  --coverageReporters=html

# レポートの場所
echo "Coverage report: apps/desktop/coverage/index.html"
```

2. 未カバー行の特定

```bash
# lcov.info から未カバー行を抽出
cat apps/desktop/coverage/lcov.info | grep -A1 "DA:" | grep ",0$" | head -20
```

3. 未カバー箇所の分類

| カテゴリ           | 説明                                 | 対応方針                              |
| ------------------ | ------------------------------------ | ------------------------------------- |
| 正常系パス         | テストで到達していない通常コードパス | テスト追加（Phase 6に戻る）           |
| エラーハンドリング | catch句やフォールバック処理          | 異常系テスト追加（Phase 6に戻る）     |
| 分岐条件           | if/else/switch の未カバー分岐        | 条件網羅テスト追加（Phase 6に戻る）   |
| デッドコード       | 到達不能なコード                     | リファクタリング対象（Phase 8で対応） |

---

### タスク4: 受け入れ基準網羅率の確認

**目的**: Phase 1で定義した受け入れ基準（AC-1〜AC-9）がテストで100%カバーされていることを確認する。

#### 受け入れ基準網羅率

| AC-ID | 受け入れ基準                                   | テストID                   | カバー状態 |
| ----- | ---------------------------------------------- | -------------------------- | ---------- |
| AC-1  | 5種類のInputKindの質問→回答→送信サイクル       | CT-01〜CT-10, UT-07〜UT-11 | -          |
| AC-2  | IPCイベントでのメッセージ追加・回答送信        | UT-01, UT-02, IT-01        | -          |
| AC-3  | P0-06/P0-08スコープ境界の存在・永続化混入なし  | UT-12, UT-15, UT-16        | -          |
| AC-4  | InterviewProgressBar の current/total 正確更新 | CT-23, UT-02, UT-13, UT-14 | -          |
| AC-5  | APIキーガイダンスバナー表示と設定画面遷移      | CT-20, CT-21, CT-22, IT-03 | -          |
| AC-6  | undo後の回答値復元（secret は空文字）          | CT-11〜CT-15, UT-03〜UT-06 | -          |
| AC-7  | バリデーションエラーの `role="alert"` 表示     | CT-16〜CT-19, A11Y-01      | -          |
| AC-8  | 送信中の送信ボタン disabled                    | CT-24, EH-03               | -          |
| AC-9  | メッセージ追加後の自動スクロール               | CT-25                      | -          |

**判定**: 全AC（AC-1〜AC-9）に対応するテストIDが存在すること。

---

### タスク5: Phase 6 ループバック判定

**目的**: カバレッジ未達の場合のループバック手順を定義する。

**ループバックフロー**:

```
Phase 7（カバレッジ確認）
    │
    ├── PASS → Phase 8（リファクタリング）へ進行
    │
    └── PARTIAL / FAIL
            │
            ├── 不足箇所の特定（タスク3）
            │
            ├── 補完テストケースの設計
            │
            └── Phase 6（テスト拡充）へ戻る
                    │
                    ├── 追加テスト作成・実行
                    │
                    └── Phase 7（カバレッジ確認）を再実行
```

**ループバック上限**: 最大2回。2回のループバックでも基準未達の場合は、未達理由を記録し、Phase 8へ進行する（デッドコード等の構造的理由による未達を許容）。

---

### タスク6: 統合テストの再実行とゲート判定

**目的**: 統合テスト（IT-01〜IT-06）を含む全テストスイートを再実行し、最終的なゲート判定を行う。

**実行手順**:

```bash
# 全テストスイート実行（統合テスト含む）
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState|interview-widgets)"

# skill-creator 関連テストも実行（regression check）
pnpm --filter @repo/desktop test -- --testPathPattern="skill-creator"
```

**ゲート判定テーブル**:

| ゲート項目           | 基準                | 判定 |
| -------------------- | ------------------- | ---- |
| Line Coverage        | 80%以上             | -    |
| Branch Coverage      | 60%以上             | -    |
| Function Coverage    | 80%以上             | -    |
| 全テスト PASS        | FAIL 0件            | -    |
| 受け入れ基準網羅率   | AC-1〜AC-9 全カバー | -    |
| Regression           | 既存テスト FAIL 0件 | -    |
| TypeScript型チェック | エラー 0件          | -    |
| ESLint               | エラー 0件          | -    |

**総合判定**:

- 全ゲート項目PASS → Phase 8へ進行
- いずれかFAIL → Phase 6へ戻る（ループバック上限まで）

---

## 参照資料

| 資料名             | パス                        | 説明                             |
| ------------------ | --------------------------- | -------------------------------- |
| Phase 1 要件定義   | `phase-1-requirements.md`   | NFR-03, NFR-04（カバレッジ基準） |
| Phase 4 テスト仕様 | `phase-4-test-creation.md`  | CT/UT/IT テストケース一覧        |
| Phase 5 実装       | `phase-5-implementation.md` | 変更対象ファイル一覧             |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md` | EX/EH/A11Y テストケース一覧      |
| Issue #1889        | GitHub Issue                | TASK-P0-06の詳細仕様             |

---

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 確認項目                      | 実行コマンド                                                                                                 | 基準       | 判定 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- | ---- |
| 統合テスト全件 PASS           | `pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview\|useInterviewState)"` | FAIL 0件   | -    |
| 隣接コンポーネント regression | `pnpm --filter @repo/desktop test -- --testPathPattern="skill-creator"`                                      | FAIL 0件   | -    |
| interview-widgets regression  | `pnpm --filter @repo/desktop test -- --testPathPattern="interview-widgets"`                                  | FAIL 0件   | -    |
| TypeScript型チェック          | `pnpm --filter @repo/desktop typecheck`                                                                      | エラー 0件 | -    |
| ESLint                        | `pnpm --filter @repo/desktop lint`                                                                           | エラー 0件 | -    |

---

## 成果物

| 成果物                     | パス                                              | 説明                                    |
| -------------------------- | ------------------------------------------------- | --------------------------------------- |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`              | Line/Branch/Function カバレッジ計測結果 |
| 未カバー箇所分析           | `outputs/phase-7/uncovered-analysis.md`           | 未達箇所の特定と分類（該当する場合）    |
| 受け入れ基準網羅率レポート | `outputs/phase-7/acceptance-criteria-coverage.md` | AC-1〜AC-9 のテスト対応確認             |
| ゲート判定結果             | `outputs/phase-7/gate-decision.md`                | 全ゲート項目の合否判定と総合判定        |

---

## 完了条件

- [ ] カバレッジ計測が実行され、結果が記録されている
- [ ] Line Coverage が 80%以上を達成している（NFR-03）
- [ ] Branch Coverage が 60%以上を達成している（NFR-04）
- [ ] Function Coverage が 80%以上を達成している（NFR-03）
- [ ] 受け入れ基準（AC-1〜AC-9）が全てテストでカバーされている
- [ ] 全テスト（Phase 4 + Phase 6）が PASS している
- [ ] 統合テスト（IT-01〜IT-06）が PASS している
- [ ] 既存テストに regression が発生していない
- [ ] TypeScript型チェック・ESLintがエラーなしで通過している
- [ ] ゲート判定が PASS である（未達の場合はPhase 6へループバック済み、またはループバック上限到達の記録あり）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 8: リファクタリング → `phase-8-refactoring.md`
