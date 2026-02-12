# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 7                                      |
| 機能名 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 作成日 | 2026-02-12                             |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。

## 実行タスク

- カバレッジ再測定: テストカバレッジの再計測
- 統合テスト実行: 統合テストの実行と結果確認
- 無限ループ防止検証: P31対策の最終確認

## カバレッジ基準

### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 判定 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | -    |
| Branch Coverage   | 60%      | 70%      | -    |
| Function Coverage | 80%      | 90%      | -    |

### 結合テストカバレッジ基準

| 指標                   | 目標 | 判定 |
| ---------------------- | ---- | ---- |
| Store セレクタ         | 100% | -    |
| コンポーネント状態連携 | 100% | -    |
| 無限ループ防止パターン | 100% | -    |
| 異常系シナリオ         | 80%+ | -    |

## 参照資料

| 資料名            | パス                                                                    | 説明               |
| ----------------- | ----------------------------------------------------------------------- | ------------------ |
| Phase 6成果物     | `outputs/phase-6/coverage-report.md`                                    | カバレッジ分析結果 |
| Phase 6統合テスト | `outputs/phase-6/integration-test.md`                                   | 統合テスト結果     |
| セレクタテスト    | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts`           | セレクタテスト     |
| 無限ループテスト  | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` | 堅牢性テスト       |

## 実行手順

### ステップ1: カバレッジ再測定

```bash
# カバレッジ測定コマンド（詳細レポート出力）
pnpm --filter @repo/desktop test:coverage -- --reporter=verbose

# HTMLレポート生成（オプション）
pnpm --filter @repo/desktop test:coverage -- --coverage.reporter=html

# 対象ファイル別カバレッジ確認
# 以下のファイルのカバレッジを確認
```

### ステップ2: 対象ファイル別カバレッジ確認

#### 2.1 Store セレクタ

**ファイル**: `apps/desktop/src/renderer/store/index.ts`

| セレクタカテゴリ     | Line | Branch | Function | 判定 |
| -------------------- | ---- | ------ | -------- | ---- |
| LLM個別セレクタ      | -    | -      | -        | -    |
| Skill個別セレクタ    | -    | -      | -        | -    |
| AuthMode個別セレクタ | -    | -      | -        | -    |
| **合計**             | -    | -      | -        | -    |

#### 2.2 LLMSelectorPanel

**ファイル**: `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`

| 項目             | Line | Branch | Function | 判定 |
| ---------------- | ---- | ------ | -------- | ---- |
| コンポーネント   | -    | -      | -        | -    |
| イベントハンドラ | -    | -      | -        | -    |
| useEffect        | -    | -      | -        | -    |
| **合計**         | -    | -      | -        | -    |

#### 2.3 SkillSelector

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

| 項目             | Line | Branch | Function | 判定 |
| ---------------- | ---- | ------ | -------- | ---- |
| コンポーネント   | -    | -      | -        | -    |
| イベントハンドラ | -    | -      | -        | -    |
| キーボード処理   | -    | -      | -        | -    |
| **合計**         | -    | -      | -        | -    |

#### 2.4 SettingsView

**ファイル**: `apps/desktop/src/renderer/views/SettingsView/index.tsx`

| 項目           | Line | Branch | Function | 判定 |
| -------------- | ---- | ------ | -------- | ---- |
| コンポーネント | -    | -      | -        | -    |
| 認証モード連携 | -    | -      | -        | -    |
| **合計**       | -    | -      | -        | -    |

### ステップ3: 統合テスト実行

```bash
# 統合テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="integration|migration|infinite-loop"

# 実行結果サマリ
```

### ステップ4: 無限ループ防止の最終検証

#### 4.1 自動テスト結果

| テストID       | テスト内容                                              | 結果 |
| -------------- | ------------------------------------------------------- | ---- |
| TC-LLM-MIG-001 | マウント時にfetchProvidersが1回のみ呼ばれる             | -    |
| TC-LLM-MIG-002 | re-renderしてもfetchProvidersは追加呼び出しなし         | -    |
| TC-LLM-MIG-003 | selectedProviderIdが同じ場合checkHealthは再呼び出しなし | -    |
| TC-LLM-MIG-004 | useRefガードなしでも無限ループしない                    | -    |
| TC-SK-MIG-001  | マウント時にrescanSkillsは呼ばれない                    | -    |
| TC-SK-MIG-002  | handleRescanコールバックが安定している                  | -    |
| TC-SK-MIG-003  | isScanning変更時に無限ループしない                      | -    |
| TC-SK-MIG-004  | selectedSkillName変更時に無限ループしない               | -    |
| TC-SV-MIG-001  | initializeAuthModeが1回のみ呼ばれる                     | -    |
| TC-SV-MIG-002  | mode変更後も追加の初期化呼び出しなし                    | -    |
| TC-SV-MIG-003  | useRefガードなしでも無限ループしない                    | -    |
| TC-LOOP-001    | StrictModeでも無限ループしない                          | -    |
| TC-LOOP-002    | 高頻度のstate更新でも無限ループしない                   | -    |

#### 4.2 ESLint依存配列検証

```bash
# ESLint exhaustive-deps ルール確認
pnpm --filter @repo/desktop lint -- --rule 'react-hooks/exhaustive-deps: error'

# 警告/エラーがないことを確認
```

### ステップ5: 未達の場合の対応

#### 5.1 カバレッジ未達時のアクション

| 項目                    | 未達時のアクション                      |
| ----------------------- | --------------------------------------- |
| Line Coverage < 80%     | Phase 6へ戻り、未カバー行のテスト追加   |
| Branch Coverage < 60%   | Phase 6へ戻り、分岐条件のテスト追加     |
| Function Coverage < 80% | Phase 6へ戻り、未テスト関数のテスト追加 |
| 無限ループテスト失敗    | Phase 5へ戻り、実装を修正               |

#### 5.2 Phase 6へ戻る基準

- カバレッジ基準の**いずれか**が未達の場合
- 無限ループ関連テストが**1つでも**失敗した場合
- ESLint依存配列の警告が**1つでも**ある場合

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目               | 基準 | 結果 |
| ---------------------- | ---- | ---- |
| ユニットテストLine     | 80%+ | -    |
| ユニットテストBranch   | 60%+ | -    |
| ユニットテストFunction | 80%+ | -    |
| Store セレクタ         | 100% | -    |
| コンポーネント状態連携 | 100% | -    |
| 無限ループ防止パターン | 100% | -    |
| 異常系シナリオ         | 80%+ | -    |

## 検証コマンド一覧

```bash
# === カバレッジ測定 ===
pnpm --filter @repo/desktop test:coverage

# === 特定ファイルのカバレッジ ===
pnpm --filter @repo/desktop test:coverage -- \
  --collectCoverageFrom='src/renderer/store/index.ts' \
  --collectCoverageFrom='src/renderer/components/llm/LLMSelectorPanel.tsx' \
  --collectCoverageFrom='src/renderer/components/skill/SkillSelector.tsx' \
  --collectCoverageFrom='src/renderer/views/SettingsView/index.tsx'

# === 移行テストのみ実行 ===
pnpm --filter @repo/desktop test -- --testPathPattern="migration"

# === 無限ループテストのみ実行 ===
pnpm --filter @repo/desktop test -- --testPathPattern="infinite-loop"

# === 統合テストのみ実行 ===
pnpm --filter @repo/desktop test -- --testPathPattern="integration"

# === ESLint依存配列チェック ===
pnpm --filter @repo/desktop lint

# === 全テスト実行（最終確認） ===
pnpm --filter @repo/desktop test
```

## 成果物

| 成果物             | パス                                     | 説明               |
| ------------------ | ---------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`     | 再測定結果         |
| 統合テスト結果     | `outputs/phase-7/integration-test.md`    | 統合テスト実行結果 |
| 判定結果           | `outputs/phase-7/verification-result.md` | 最終判定           |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] Store セレクタのテストカバレッジが100%
- [ ] コンポーネント状態連携のテストカバレッジが100%
- [ ] 無限ループ防止パターンのテストカバレッジが100%
- [ ] 異常系シナリオのテストカバレッジが80%+
- [ ] 全ての無限ループ関連テスト（TC-_-MIG-_, TC-LOOP-\*）がパス
- [ ] ESLint exhaustive-deps ルールで警告/エラーなし
- [ ] 統合テストが全て成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 判定結果サマリ

### 最終判定

| 判定項目                 | 結果      | 備考 |
| ------------------------ | --------- | ---- |
| ユニットテストカバレッジ | PASS/FAIL | -    |
| 結合テストカバレッジ     | PASS/FAIL | -    |
| 無限ループ防止検証       | PASS/FAIL | -    |
| ESLint依存配列           | PASS/FAIL | -    |
| **総合判定**             | **-**     | -    |

### 次のアクション

- **PASS**: Phase 8（リファクタリング）へ進行
- **FAIL**: 影響範囲に応じてPhase 5またはPhase 6へ戻る

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
