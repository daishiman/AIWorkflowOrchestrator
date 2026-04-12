# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 4                                                            |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 3（設計レビューPASS）                                  |
| 後続Phase  | Phase 5                                                      |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

TDD Red: `analyticsAdapter.test.ts`を先行作成し、実装前にテストが失敗する状態（Red）を確認する。
Phase 2のテスト戦略に従い、全テストカテゴリを網羅する。

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド（Red確認）
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/analyticsAdapter.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態 - analyticsAdapter.tsが存在しないため）

## 実行タスク

### タスク1: analyticsAdapter.test.ts 作成

**目的**: `analyticsAdapter.ts`のテストファイルを作成し、TDD Redを確立する

**実行手順**:

1. Phase 2のテスト戦略を参照し、テストカテゴリを確認する
2. 命名規則を既存テストファイルと照合する（[FB-SDK-07-4]対策）
3. テストファイルを作成する（`apps/desktop/src/renderer/utils/__tests__/analyticsAdapter.test.ts`）
4. 以下のテストケースを実装する:
   - 初期化成功テスト
   - 初期化失敗→no-opフォールバックテスト（AC-9）
   - イベント送信成功テスト（AC-1）
   - オプトアウト時送信停止テスト（AC-4）
   - オフライン時キューイングテスト（AC-3）
   - キュードレイン（オンライン復帰後送信）テスト（AC-3）
   - `trackEvent`公開APIシグネチャ不変確認テスト（AC-5）
5. テストが失敗することを確認する（Red状態）

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

### タスク2: trackEvent.test.ts 回帰テスト確認

**目的**: 既存の`trackEvent.test.ts`が実装変更後も通過することを確認するための回帰テスト計画を立てる

**実行手順**:

1. 既存の`trackEvent.test.ts`の内容を確認する
2. Phase 5実装後に回帰確認が必要なテストケースをリストアップする
3. `SkillCreateWizard.tracking.test.tsx`の計装テストが影響を受けないか評価する
4. 回帰テスト計画を文書化する

**期待される成果物**:

- `outputs/phase-4/integration-test-plan.md`

### タスク3: IPCハンドラーテスト作成（IPC経由の場合）

**目的**: Mainプロセス側の`analyticsHandler.ts`テストを作成する

**実行手順**:

1. 既存IPCハンドラーテストのパターンを確認する
2. `analyticsHandler.test.ts`のテストケースを設計する:
   - イベント受信・HTTP送信成功
   - HTTP送信失敗時のキューイング
   - オプトアウト時の送信スキップ
3. テストファイルを作成する（`apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`）
4. テストが失敗することを確認する（Red状態）

**期待される成果物**:

- `outputs/phase-4/test-specification.md`（IPCハンドラーセクション）

## モック設計方針

```typescript
// 正しいwindow.apiモック（[Feedback VSCPKR-02]対策）
Object.defineProperty(window, "api", {
  value: {
    analytics: {
      send: vi.fn().mockResolvedValue(undefined),
    },
  },
  writable: true,
});

// 禁止: vi.stubGlobal("window", ...) は使用しない
// 理由: React内部のinstanceof HTMLElement判定が常にfalseになる
```

## private methodテスト方針

private methodのテストが必要な場合（[Feedback P0-09-U1]対策）:

```typescript
// パターン1: キャストアクセス
import type { AnalyticsAdapterPrivate } from "../analyticsAdapter";
(adapter as unknown as AnalyticsAdapterPrivate).privateMethod();

// パターン2: public callback経由
// privateロジックをpublicコールバックで検証する
```

## 参照資料

| 参照資料                        | パス                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| Phase 2 テスト戦略              | `outputs/phase-2/test-strategy.md`                                                         |
| Phase 3 ゲート判定              | `outputs/phase-3/gate-decision.md`                                                         |
| 既存trackEventテスト            | `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`                             |
| 既存SkillCreateWizard計装テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx` |
| 既存IPCハンドラーパターン       | `apps/desktop/src/main/ipc/`                                                               |
| FB-P0-09-U1: privateテスト方針  | `.claude/skills/task-specification-creator/SKILL.md`                                       |
| FB-VSCPKR-02: window APIモック  | `.claude/skills/task-specification-creator/SKILL.md`                                       |

## 成果物

| 成果物         | パス                                       | 内容                         |
| -------------- | ------------------------------------------ | ---------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | テストケース一覧・モック設計 |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 回帰テスト計画               |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`       | TDD Redの確認結果            |

## 完了条件

- [ ] `analyticsAdapter.test.ts`作成完了（初期化・送信・オフライン・オプトアウト・フォールバック）
- [ ] `analyticsHandler.test.ts`作成完了（IPC経由の場合）
- [ ] TDD Red確認済み（テストが意図的に失敗している）
- [ ] 回帰テスト対象リスト作成完了
- [ ] 命名規則がPhase 1-3で確認したパターンと整合していること
- [ ] `window.api`モックが`vi.stubGlobal`非使用で設計されていること
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## TDD Red確認

```bash
# Red確認コマンド
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/analyticsAdapter.test.ts
# 期待: テスト失敗（analyticsAdapter.tsが存在しないため）
```

## 次のPhase

Phase 5: 実装（TDD Green）
