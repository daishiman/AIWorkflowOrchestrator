# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| Phase名    | 実装                             |
| カテゴリ   | TDD-Green                        |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-30                       |
| 機能名     | TASK-3-2-F-skill-stream-test-env |
| タスクID   | TASK-3-2-F                       |
| Issue      | #559                             |

---

## 目的

Phase 2で設計したアプローチに基づき、テスト環境を改善する。Phase 4で作成した環境検証テストがPASSする状態（Green）を達成する。

## 背景

TDD-Greenフェーズとして、Phase 4で確認したRed状態のテストをPASSさせるための実装を行う。主な変更はvitest.config.tsの環境設定、Clipboard APIモックの実装、テストセットアップファイルの更新である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: vitest.config.tsのテスト環境切り替え

**目的**: テスト実行環境をPhase 2の設計に基づいて変更する。

**実行手順**:

1. `apps/desktop/vitest.config.ts`を開く
2. `environment`設定を変更する
   - **変更前**: `environment: 'happy-dom'`
   - **変更後**: Phase 2のアプローチ選定結果に従う（例: `environment: 'jsdom'`）
3. jsdomに切り替える場合、必要に応じてjsdomパッケージを追加する
   ```bash
   pnpm --filter @repo/desktop add -D jsdom
   ```
4. 環境変更に伴うその他の設定変更をPhase 2設計書に従って実施する
5. 変更後、既存テスト（スキップ以外）が引き続きPASSすることを確認する
   ```bash
   pnpm --filter @repo/desktop vitest run
   ```

**期待される成果物**:

- `apps/desktop/vitest.config.ts`（更新済み）

---

### タスク2: テストセットアップファイルの更新

**目的**: 新テスト環境に対応したセットアップ処理を実装する。

**実行手順**:

1. `apps/desktop/src/test/setup.ts`を開く
2. happy-dom固有の設定を特定する
3. 新環境に必要なセットアップを追加する
   - DOM環境の初期化処理（必要に応じて）
   - グローバルオブジェクトの設定（必要に応じて）
4. 不要になったhappy-dom固有の設定を削除する（存在する場合）
5. 変更後、既存テスト（スキップ以外）がPASSすることを確認する

**期待される成果物**:

- `apps/desktop/src/test/setup.ts`（更新済み）

---

### タスク3: Clipboard APIモックの実装

**目的**: Phase 2のモック設計に基づき、Clipboard APIのモックを実装する。

**実行手順**:

1. Phase 2の設計書（`outputs/phase-2/clipboard-mock-design.md`）を確認する
2. モック配置場所（テストセットアップファイルまたは個別テストファイル）に実装する
3. **テストセットアップファイルにグローバルモックを配置する場合**:

```typescript
// apps/desktop/src/test/setup.ts に追加
// Clipboard API モック
if (!navigator.clipboard) {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(""),
    },
    writable: true,
    configurable: true,
  });
}
```

4. **各テストファイル内で個別にモックする場合**:
   - 各テストファイルの`beforeEach`でモックをセットアップする
   - `afterEach`でモックをリセットする
5. Phase 4の環境検証テストを実行し、Clipboard API関連テストがPASSすることを確認する

```bash
pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.env-check.test.tsx
```

**期待される成果物**:

- Clipboard APIモック実装（`setup.ts`内またはユーティリティファイル）

---

### タスク4: 既存テストの互換性修正

**目的**: 環境変更により影響を受ける既存テストを修正し、全テスト（スキップ以外）がPASSする状態を維持する。

**実行手順**:

1. Phase 2の互換性分析（`outputs/phase-2/compatibility-analysis.md`）を確認する
2. 環境変更後、全テスト（スキップ以外）を実行する
   ```bash
   pnpm --filter @repo/desktop vitest run
   ```
3. 失敗するテストがある場合、Phase 2の修正方針に基づいて修正する
4. 修正後、全テスト（スキップ以外）がPASSすることを確認する
5. テスト実行時間を記録し、ベースラインと比較する
   - 許容範囲: +20%以内

**期待される成果物**:

- 修正されたテストファイル（必要な場合のみ）

---

### タスク5: Green状態の確認

**目的**: Phase 4で失敗していた環境検証テストがPASSすることを確認する（Green状態）。

**実行手順**:

1. 環境検証テストを実行する
   ```bash
   pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.env-check.test.tsx
   ```
2. 全テストケースがPASSすることを確認する
3. 既存テスト（スキップ以外）も含めて全体テストを実行する
   ```bash
   pnpm --filter @repo/desktop vitest run
   ```
4. Green状態の証拠として実行結果を記録する

**期待される成果物**:

- `outputs/phase-5/tdd-green-evidence.md`（Green状態の証拠記録）

---

## 参照資料

| 参照資料           | パス                                        | 内容                    |
| ------------------ | ------------------------------------------- | ----------------------- |
| Phase 2成果物      | `outputs/phase-2/approach-selection.md`     | アプローチ選定結果      |
| Phase 2成果物      | `outputs/phase-2/vitest-config-design.md`   | Vitest設定変更設計      |
| Phase 2成果物      | `outputs/phase-2/clipboard-mock-design.md`  | Clipboard APIモック設計 |
| Phase 2成果物      | `outputs/phase-2/compatibility-analysis.md` | 互換性影響分析          |
| Phase 4成果物      | `outputs/phase-4/tdd-red-evidence.md`       | Red状態証拠             |
| Vitest設定         | `apps/desktop/vitest.config.ts`             | 変更対象                |
| テストセットアップ | `apps/desktop/src/test/setup.ts`            | 変更対象                |

---

## 統合テスト連携

### このPhaseでの統合テスト観点

- Clipboard APIモックが統合テストシナリオ（コピー → フィードバック表示）で正常に機能することを確認する
- 環境変更後の統合テスト基盤が整っていることを確認する（Phase 6で本格的に検証）

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド（環境検証テスト）
pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.env-check.test.tsx

# テスト実行コマンド（全テスト）
pnpm --filter @repo/desktop vitest run
```

**確認項目**:

- [ ] 環境検証テストが全件PASSする（Green状態）
- [ ] 既存テスト（スキップ以外）が全件PASSする

---

## Electron アーキテクチャ観点

| 層               | 本Phaseでの考慮事項                                               |
| ---------------- | ----------------------------------------------------------------- |
| Renderer Process | vitest.config.tsのenvironment設定はRenderer層テスト全体に影響する |
| テスト環境       | jsdom/happy-domはRendererプロセスのDOMをエミュレートする          |

---

## 成果物

| 成果物             | パス                                    | 内容                 | タイプ   |
| ------------------ | --------------------------------------- | -------------------- | -------- |
| Vitest設定         | `apps/desktop/vitest.config.ts`         | 更新済み設定ファイル | code     |
| テストセットアップ | `apps/desktop/src/test/setup.ts`        | 更新済みセットアップ | code     |
| Green状態証拠      | `outputs/phase-5/tdd-green-evidence.md` | テスト実行結果の記録 | document |

---

## 完了条件

- [ ] vitest.config.tsの環境設定が変更されている
- [ ] テストセットアップファイルが新環境に対応している
- [ ] Clipboard APIモックが実装されている
- [ ] 環境検証テスト（Phase 4作成）が全件PASSする（Green状態）
- [ ] 既存テスト（スキップ以外）が全件PASSする
- [ ] テスト実行時間がベースライン比+20%以内である
- [ ] Green状態の証拠が記録されている
- [ ] 成果物が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-F-skill-stream-test-env/phase-6-test-expansion.md`
