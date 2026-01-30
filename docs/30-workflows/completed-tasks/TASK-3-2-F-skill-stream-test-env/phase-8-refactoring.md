# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 8                                |
| Phase名    | リファクタリング                 |
| カテゴリ   | TDD-Refactor                     |
| 前提Phase  | Phase 7                          |
| 後続Phase  | Phase 9                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-30                       |
| 機能名     | TASK-3-2-F-skill-stream-test-env |
| タスクID   | TASK-3-2-F                       |
| Issue      | #559                             |

---

## 目的

TDD-Refactorフェーズとして、テスト環境改善に伴うコードの整理と最適化を行う。テストが全件PASSする状態を維持しながら、コード品質を向上させる。

## 背景

Phase 5-6でテスト環境の切り替えとテスト有効化を実施した。本Phaseでは、実装中に生じた技術的負債の解消、テストコードの重複排除、Clipboard APIモック実装の最適化を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Clipboard APIモックの共通化

**目的**: Clipboard APIモックのコードを共通テストユーティリティに集約し、重複を排除する。

**実行手順**:

1. 全テストファイルでのClipboard APIモック使用箇所を検索する
   ```bash
   grep -rn "clipboard" apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay*
   ```
2. モックの実装が複数箇所に散在している場合、共通ユーティリティに集約する
   - 配置場所: `apps/desktop/src/renderer/test-utils/`（既存の`i18n-test-utils.tsx`と同階層）
   - ファイル名: `clipboard-test-utils.ts`（必要な場合のみ作成）
3. 各テストファイルから共通ユーティリティを参照するよう変更する
4. 変更後、全テストがPASSすることを確認する
   ```bash
   pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay
   ```

**期待される成果物**:

- 共通ユーティリティファイル（必要な場合のみ作成）
- 更新されたテストファイル

---

### タスク2: テストセットアップの整理

**目的**: `apps/desktop/src/test/setup.ts`の不要なhappy-dom固有コードを削除し、新環境に最適化する。

**実行手順**:

1. `apps/desktop/src/test/setup.ts`を確認する
2. 以下の観点で整理する
   - 不要になったhappy-dom固有設定の削除
   - Clipboard APIモックの配置位置の最適化（グローバル vs テストファイル個別）
   - コメント（TODO/FIXME/HACK）の削除または更新
3. 変更後、全テスト（desktopパッケージ全体）がPASSすることを確認する
   ```bash
   pnpm --filter @repo/desktop vitest run
   ```

**期待される成果物**:

- `apps/desktop/src/test/setup.ts`（整理済み）

---

### タスク3: テストコードのTODO/FIXMEクリーンアップ

**目的**: テスト環境改善に関連するTODO/FIXMEコメントを削除する。

**実行手順**:

1. TASK-3-2-F関連のTODO/FIXMEコメントを検索する
   ```bash
   grep -rn "TASK-3-2-F\|TODO.*clipboard\|TODO.*happy-dom\|TODO.*jsdom\|FIXME.*act()" apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay*
   ```
2. 解決済みのTODO/FIXMEコメントを削除する
3. 未解決のものがある場合は、理由を記録し未完了タスクの候補とする
4. 変更後、全テストがPASSすることを確認する

**期待される成果物**:

- 更新されたテストファイル

---

### タスク4: リファクタリング後の全テスト確認

**目的**: リファクタリング後もTDD-Greenの状態（全テストPASS）が維持されていることを確認する。

**実行手順**:

1. 全SkillStreamDisplayテストを実行する
   ```bash
   pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay
   ```
2. desktopパッケージ全体のテストを実行する
   ```bash
   pnpm --filter @repo/desktop vitest run
   ```
3. 全テストがPASSすることを確認する
4. `act()`警告がないことを確認する
5. 結果を成果物に記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-result.md`（リファクタリング結果レポート）

---

## 参照資料

| 参照資料             | パス                                                       | 内容                 |
| -------------------- | ---------------------------------------------------------- | -------------------- |
| Phase 6成果物        | `outputs/phase-6/test-activation-result.md`                | テスト有効化結果     |
| Phase 7成果物        | `outputs/phase-7/coverage-report.md`                       | カバレッジレポート   |
| テストユーティリティ | `apps/desktop/src/renderer/test-utils/i18n-test-utils.tsx` | 既存ユーティリティ   |
| テストセットアップ   | `apps/desktop/src/test/setup.ts`                           | セットアップファイル |

---

## 統合テスト連携

### このPhaseでの統合テスト観点

- リファクタリング後も統合テスト（i18n Integration）がPASSすることを確認する
- 共通ユーティリティ化が統合テストの保守性を向上させることを確認する

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay
```

**確認項目**:

- [ ] リファクタリング後もテストが全件PASSする
- [ ] テストカバレッジが低下していない

---

## 成果物

| 成果物               | パス                                    | 内容                 | タイプ   |
| -------------------- | --------------------------------------- | -------------------- | -------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md` | リファクタリング結果 | document |

---

## 完了条件

- [ ] Clipboard APIモック実装が適切な場所に集約されている（重複がない）
- [ ] テストセットアップファイルが新環境に最適化されている（不要なhappy-dom固有コードが削除されている）
- [ ] TASK-3-2-F関連のTODO/FIXMEコメントが解決済みのものは削除されている
- [ ] 全SkillStreamDisplayテストがPASSする
- [ ] desktopパッケージ全体のテストがPASSする
- [ ] `act()`警告がゼロである
- [ ] リファクタリング結果レポートが生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（テストカバレッジ確認）がPASS判定であること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-F-skill-stream-test-env/phase-9-quality-assurance.md`
