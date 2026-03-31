# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 3                                       |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

Phase 1-2 の設計を受け、Phase 4 へ進行可能かを判定する設計レビューゲートを通過する。
設計の品質（4条件：矛盾なし・漏れなし・整合性あり・依存関係整合）を確認し、
各実装 Phase のタスク分解・実行順序・SubAgent 割り当てを確定する。

## 設計レビューゲート

Phase 4（テスト作成）へ進む前に以下の4条件をすべて満たしていることを確認する。

| 条件         | 確認内容                                                                 | 判定                |
| ------------ | ------------------------------------------------------------------------ | ------------------- |
| 矛盾なし     | Phase 1（要件）と Phase 2（設計）の間に相反する記述がないか              | [ ] PASS / [ ] FAIL |
| 漏れなし     | FR-001〜FR-005 / NFR-001〜005 がすべて Phase 2 設計に反映されているか    | [ ] PASS / [ ] FAIL |
| 整合性あり   | TestTarget 型定義・SEM/VIS テスト ID・ディレクトリ構成が一貫しているか   | [ ] PASS / [ ] FAIL |
| 依存関係整合 | Phase 4→5/6/8 の並列依存、Phase 5/6→7 の直列依存が正しく定義されているか | [ ] PASS / [ ] FAIL |

**ゲート判定**:

- 4条件すべて PASS → Phase 4（テスト作成）へ進む
- 1条件以上 FAIL → Phase 1/2 を修正してから再レビュー

**真の論点確認**:

1. 主問題: ハードコード依存を設定駆動フレームワークへ変えること — 確認済み
2. 依存境界: `test-targets.config.ts` の所有権が Phase 4 に固定されていること — 確認済み
3. 破棄判断: 既存実装がパッチで閉じない場合はユーザー承認を得ること — 記録済み

## 事前監査ゲート

1. Lane 0 で `task-specification-creator` 準拠監査を実施する。
2. Lane 1 で `aiworkflow-requirements` と 30思考法の多角的分析を実施する。
3. どちらかが FAIL の場合は Phase 4 へ進まず、改善方針を再策定する。
4. 既存実装の破棄が必要と判断された場合は、ユーザー承認を得るまで実装を開始しない。

## 実行順序とSubAgent割り当て

### フェーズ依存グラフ

```
Phase 4（設定・共通）
  ├── Phase 5（Layer 1 実装）  ─┐
  ├── Phase 6（Layer 2 実装）  ─┼──→ Phase 7（baseline 生成）──→ Phase 9（統合テスト）
  └── Phase 8（スクリプト更新）─┘
```

Phase 4 完了後、Phase 5 / 6 / 8 は**並列実行可能**。
Phase 7 は Phase 5 と Phase 6 の両方が完了してから実行。

### Phase 4: テスト作成 — SubAgent-A

**担当**: SubAgent-A（設計・設定）
**実行形態**: 直列（他の Phase の前提）

| ステップ | タスク                                                                              | 変更ファイル                                    |
| -------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| 4-1      | `playwright.config.ts` に `ui-ux-layer1` / `ui-ux-layer2` プロジェクト追加          | `apps/desktop/playwright.config.ts`             |
| 4-2      | `e2e/ui-ux/` ディレクトリ作成                                                       | ディレクトリ作成のみ                            |
| 4-3      | `test-targets.config.ts` 実装（型定義 + 初期対象7画面 + semanticTargets 初期定義）  | `apps/desktop/e2e/ui-ux/test-targets.config.ts` |
| 4-4      | `helpers.ts` 実装（navigateToTarget / setupApiKeyMock / captureAccessibleElements） | `apps/desktop/e2e/ui-ux/helpers.ts`             |
| 4-5      | `global-setup.ts` に `ANTHROPIC_API_KEY` ダミー設定を追加                           | `apps/desktop/e2e/global-setup.ts`              |

**完了条件**:

- `playwright.config.ts` に `ui-ux-layer1` / `ui-ux-layer2` が定義されている
- `test-targets.config.ts` が型安全に実装されている
- `test-targets.config.ts` の初期対象7画面と `semanticTargets` が Phase 4 で定義されている
- `helpers.ts` がエクスポートされ型チェックが通る

### Phase 5: 実装 — SubAgent-B

**担当**: SubAgent-B（Layer 1 実装）
**実行形態**: Phase 4 完了後に並列実行可能

| ステップ | タスク                                      | 変更ファイル                                     |
| -------- | ------------------------------------------- | ------------------------------------------------ |
| 5-1      | `layer1-semantic.spec.ts` のスケルトン作成  | `apps/desktop/e2e/ui-ux/layer1-semantic.spec.ts` |
| 5-2      | SEM-001: role 属性検証ロジック実装          | 同上                                             |
| 5-3      | SEM-002: aria-label 検証ロジック実装        | 同上                                             |
| 5-4      | SEM-003: フォーム label 関連付け検証実装    | 同上                                             |
| 5-5      | SEM-004: Tab キーナビゲーション実装         | 同上                                             |
| 5-6      | SEM-005: tabindex 順序検証実装              | 同上                                             |
| 5-7      | SEM-006: モーダルフォーカストラップ検証実装 | 同上                                             |
| 5-8      | SEM-007: aria-live / role=alert 検証実装    | 同上                                             |

**実装指針**:

```typescript
// TEST_TARGETS を forEach でイテレートし動的にテストを生成
for (const target of TEST_TARGETS.filter((t) => t.layer1)) {
  test.describe(`[SEM] ${target.id} - ${target.description}`, () => {
    let page: Page;

    test.beforeEach(async ({ browser }) => {
      // 既存 launchElectronApp() を再利用
      const { electronApp, page: p } = await launchElectronApp();
      page = p;
      await navigateToTarget(page, target.navigation);
    });

    test.afterEach(async () => {
      await closeElectronApp();
    });

    test("SEM-001: インタラクティブ要素に role 属性が存在する", async () => {
      for (const t of target.semanticTargets ?? []) {
        if (t.expectedRole) {
          await expect(page.locator(t.selector)).toHaveAttribute(
            "role",
            t.expectedRole,
          );
        }
      }
    });
    // ... SEM-002〜007
  });
}
```

**完了条件**:

- `layer1-semantic.spec.ts` が TypeScript エラーなしでコンパイルされる
- 全 SEM-001〜007 のテストケースが `test.describe` ブロック内に実装されている
- `TEST_TARGETS` を読み取り専用で利用し、`test-targets.config.ts` を Phase 5 で変更しない

### Phase 6: テスト拡充 — SubAgent-C

**担当**: SubAgent-C（Layer 2 実装）
**実行形態**: Phase 4 完了後に並列実行可能

| ステップ | タスク                                            | 変更ファイル                                            |
| -------- | ------------------------------------------------- | ------------------------------------------------------- |
| 6-1      | `layer2-visual.spec.ts` のスケルトン作成          | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`          |
| 6-2      | VIS-001〜007 のスクリーンショット比較ロジック実装 | 同上                                                    |
| 6-3      | `snapshots/` ディレクトリ作成と `.gitkeep`        | `apps/desktop/e2e/ui-ux/snapshots/.gitkeep`             |
| 6-4      | `.gitattributes` に PNG を binary 指定追加        | `apps/desktop/.gitattributes` または プロジェクトルート |

**実装指針**:

```typescript
// VIS テストは TEST_TARGETS をイテレートしてスナップショット比較
for (const target of TEST_TARGETS.filter((t) => t.layer2)) {
  test(`[VIS] ${target.id}: ${target.description}`, async () => {
    await navigateToTarget(page, target.navigation);
    const clip = target.screenshotClip;
    await expect(page).toHaveScreenshot(`${target.id}-baseline.png`, {
      maxDiffPixels: 50,
      ...(clip ? { clip } : { fullPage: true }),
    });
  });
}
```

**完了条件**:

- `layer2-visual.spec.ts` が TypeScript エラーなしでコンパイルされる
- VIS-001〜007 の全テストケースが実装されている
- `layer2-visual.spec.ts-snapshots/` に baseline が生成され、`snapshots/` はプレースホルダ維持である

### Phase 7: カバレッジ確認 — SubAgent-C

**担当**: SubAgent-C（引き続き）
**実行形態**: Phase 5 + Phase 6 完了後

| ステップ | タスク                                                     | 実行方法                                                                            |
| -------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 7-1      | アプリをビルドする                                         | `pnpm --filter @repo/desktop build`                                                 |
| 7-2      | baseline 画像を初回生成する                                | `pnpm --filter @repo/desktop test:e2e -- --update-snapshots --project=ui-ux-layer2` |
| 7-3      | 生成された画像ファイルを確認する                           | `ls apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/`                        |
| 7-4      | `.gitattributes` で PNG が binary 指定されていることを確認 | 目視確認                                                                            |

**完了条件**:

- `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` に 7枚の PNG が生成されている
- `--update-snapshots` なしで `test:e2e -- --project=ui-ux-layer2` が PASS する

### Phase 8: リファクタリング — SubAgent-D

**担当**: SubAgent-D（スクリプト更新）
**実行形態**: Phase 4 完了後に並列実行可能

| ステップ | タスク                                                                 | 変更ファイル                                                                         |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 8-1      | 既存スクリプトの現状確認                                               | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` |
| 8-2      | `test-targets.config.ts` を参照するよう import を更新                  | 同上                                                                                 |
| 8-3      | ハードコードされた M11-1〜M11-4 テストを `TEST_TARGETS` 駆動に書き換え | 同上                                                                                 |
| 8-4      | 同ファイルを `.agents/skills/` にも同期コピー                          | `.agents/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` |

**完了条件**:

- スクリプトが `TEST_TARGETS` を参照しており、ハードコード部分がない
- TypeScript エラーなし

### Phase 9: 品質保証

**実行形態**: Phase 7 + Phase 8 完了後

```bash
# Layer 1 完走確認
pnpm --filter @repo/desktop test:e2e -- --project=ui-ux-layer1

# Layer 2 完走確認
pnpm --filter @repo/desktop test:e2e -- --project=ui-ux-layer2

# 既存テストが壊れていないことを確認
pnpm --filter @repo/desktop test:e2e -- --project=chromium
```

### Phase 10: 最終レビュー

`index.md` の完了定義（8項目）と acceptance criteria を照合し、Phase 11（手動テスト）へ進むかを判定する。
あわせて `apps/desktop/e2e/README.md` を作成または更新し、以下を記載：

- テスト実行コマンド一覧
- baseline 画像の初回生成手順（CI 環境含む）
- 新しい対象画面の追加手順（`test-targets.config.ts` の編集方法）
- トラブルシューティング（よくある失敗パターンと対処）
- system spec / skill feedback / unassigned detection は Phase 12 に寄せる

## 変更ファイル一覧（全Phase）

| ファイル                                                                             | 変更種別 | Phase |
| ------------------------------------------------------------------------------------ | -------- | ----- |
| `apps/desktop/playwright.config.ts`                                                  | 更新     | 4     |
| `apps/desktop/e2e/global-setup.ts`                                                   | 更新     | 4     |
| `apps/desktop/e2e/ui-ux/test-targets.config.ts`                                      | 新規     | 4     |
| `apps/desktop/e2e/ui-ux/helpers.ts`                                                  | 新規     | 4     |
| `apps/desktop/e2e/ui-ux/layer1-semantic.spec.ts`                                     | 新規     | 5     |
| `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`                                       | 新規     | 6     |
| `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/*.png`（7枚）                | 新規     | 7     |
| `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 更新     | 8     |
| `.agents/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 更新     | 8     |
| `apps/desktop/e2e/README.md`                                                         | 新規     | 10    |
| `.gitattributes`                                                                     | 更新     | 6     |

## 成果物

| 成果物                       | パス                                   | 説明                             |
| ---------------------------- | -------------------------------------- | -------------------------------- |
| 設計レビュー書（本ファイル） | phase-3-implementation-plan.md         | レビューゲート結果 + Phase別計画 |
| 実装手順サマリー             | outputs/phase-3/implementation-plan.md | SubAgent向け手順書               |

## 完了条件

- [x] Phase 4〜10 の全ステップが定義されている
- [x] SubAgent 割り当てと並列実行可能範囲が明確である
- [x] 変更ファイル一覧が全 Phase にわたって整理されている
- [x] 各 Phase の完了条件が明確に定義されている
- [x] **本Phase内の全タスクを100%実行完了**
