# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| Phase名    | 設計                             |
| カテゴリ   | 設計                             |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-30                       |
| 機能名     | TASK-3-2-F-skill-stream-test-env |
| タスクID   | TASK-3-2-F                       |
| Issue      | #559                             |

---

## 目的

Phase 1の調査結果に基づき、テスト環境改善の具体的な設計を行う。DOM環境の選定、Clipboard APIモックの設計、既存テストへの影響範囲を明確化する。

## 背景

Phase 1で特定された問題（happy-dom環境のconcurrent mode非対応、Clipboard APIモック制限、act()警告）に対して、最適な解決アプローチを設計する。推奨アプローチはhappy-dom→jsdom切り替えだが、Phase 1の調査結果を踏まえて最終決定する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト環境切り替えアプローチの選定

**目的**: Phase 1の調査結果に基づき、テスト環境改善アプローチを選定する。

**実行手順**:

1. Phase 1の成果物（`outputs/phase-1/dom-environment-comparison.md`）を読み込む
2. 以下の2つのアプローチを比較評価する

| 評価軸               | アプローチA: jsdom切り替え | アプローチB: happy-domモック強化 |
| -------------------- | -------------------------- | -------------------------------- |
| concurrent mode対応  | 評価結果を記載             | 評価結果を記載                   |
| Clipboard API対応    | 評価結果を記載             | 評価結果を記載                   |
| act()警告解消        | 評価結果を記載             | 評価結果を記載                   |
| 既存テストへの影響   | 評価結果を記載             | 評価結果を記載                   |
| パフォーマンス影響   | 評価結果を記載             | 評価結果を記載                   |
| 実装コスト           | 評価結果を記載             | 評価結果を記載                   |
| 長期的メンテナンス性 | 評価結果を記載             | 評価結果を記載                   |

3. 選定したアプローチと理由を文書化する

**期待される成果物**:

- `outputs/phase-2/approach-selection.md`（アプローチ選定書）

---

### タスク2: Vitest設定変更の設計

**目的**: 選定アプローチに基づき、vitest.config.tsの変更内容を設計する。

**実行手順**:

1. `apps/desktop/vitest.config.ts`の現在の設定を確認する
2. 変更が必要な設定項目を特定する
   - `environment`: `happy-dom` → `jsdom`（アプローチAの場合）
   - テストセットアップファイル: `./src/test/setup.ts`の変更点
   - その他の環境依存設定
3. 変更前後の差分を擬似コードで記載する
4. 変更による副作用（他テストファイルへの影響）を分析する
   - `apps/desktop/src/`配下の全テストファイルを`grep -r "happy-dom"` で検索し、環境依存コードを特定する
   - `apps/desktop/src/test/setup.ts`のhappy-dom固有設定を特定する

**期待される成果物**:

- `outputs/phase-2/vitest-config-design.md`（Vitest設定変更設計書）

---

### タスク3: Clipboard APIモック設計

**目的**: テスト環境でClipboard APIを正常にモックする方法を設計する。

**実行手順**:

1. 現在のClipboard APIモック実装を確認する
   - テストファイル内のモック定義を検索する
   - `navigator.clipboard`の使用箇所を特定する
2. 新環境でのClipboard APIモック方式を設計する
   - **モック対象**: `navigator.clipboard.writeText`
   - **モック配置場所**: テストセットアップファイル（`src/test/setup.ts`）またはテストファイル内
   - **モック方式**: `vi.fn()` によるグローバルモック or テストファイル個別モック
3. モック実装の擬似コードを記載する

```typescript
// 設計例（最終的な実装はPhase 5で実施）
// src/test/setup.ts に追加
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
  writable: true,
});
```

4. モックのリセット戦略を定義する（各テスト前にリセット or beforeEach）

**期待される成果物**:

- `outputs/phase-2/clipboard-mock-design.md`（Clipboard APIモック設計書）

---

### タスク4: 既存テスト互換性影響分析

**目的**: テスト環境変更が既存テスト（スキップ以外）に与える影響を事前に分析する。

**実行手順**:

1. 以下のコマンドで影響範囲を調査する

   ```bash
   # SkillStreamDisplay関連テストファイルの一覧
   find apps/desktop/src/renderer/components/AgentView/__tests__ -name "SkillStreamDisplay*"

   # happy-dom固有APIを使用しているテストの検索
   grep -r "happy-dom" apps/desktop/src/
   ```

2. 各テストファイルについて、環境変更後も動作する可能性を評価する
3. 変更が必要なテストコードがあれば、修正方針を記載する
4. パフォーマンスベンチマーク計画を策定する
   - 変更前のテスト実行時間を記録する基準値
   - 変更後の許容範囲（+20%以内）

**期待される成果物**:

- `outputs/phase-2/compatibility-analysis.md`（互換性影響分析レポート）

---

## 参照資料

| 参照資料           | パス                                                                         | 内容               |
| ------------------ | ---------------------------------------------------------------------------- | ------------------ |
| Phase 1成果物      | `outputs/phase-1/test-environment-analysis.md`                               | テスト環境問題分析 |
| Phase 1成果物      | `outputs/phase-1/dom-environment-comparison.md`                              | DOM環境比較        |
| Phase 1成果物      | `outputs/phase-1/acceptance-criteria.md`                                     | 受け入れ基準       |
| Vitest設定         | `apps/desktop/vitest.config.ts`                                              | 現テスト環境設定   |
| テストセットアップ | `apps/desktop/src/test/setup.ts`                                             | テスト初期化設定   |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | アーキテクチャ概要 |
| 品質要件仕様       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テスト戦略         |

---

## 統合テスト連携

### このPhaseでの統合テスト観点

- Clipboard API統合設計: コピー操作 → クリップボード書き込み → UIフィードバック表示の統合フローをモック設計に反映する
- i18n統合テスト: 言語切り替え時のコンポーネント再レンダリングが新テスト環境で動作する設計を確保する
- 非同期レンダリング: React concurrent modeを使用する統合テストシナリオの設計を確認する

---

## 多角的チェック観点

| 観点           | 本Phaseでの確認事項                                    | 該当 |
| -------------- | ------------------------------------------------------ | ---- |
| テスタビリティ | 新環境がテスト品質を維持・向上させる設計になっているか | Yes  |
| アーキテクチャ | テスト環境設定がモノレポ構成と整合しているか           | Yes  |
| パフォーマンス | テスト実行時間の劣化が許容範囲内に収まる設計か         | Yes  |
| i18n           | i18n統合テストが新環境で動作する設計になっているか     | Yes  |

---

## Electron アーキテクチャ観点

| 層               | 本Phaseでの考慮事項                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Renderer Process | SkillStreamDisplayはRenderer Processで動作するため、DOM環境はRenderer層のテストに直接影響する |
| テスト環境       | vitest.config.tsの`environment`設定はRenderer Processのテスト全体に影響する                   |

---

## 成果物

| 成果物                  | パス                                        | 内容                   |
| ----------------------- | ------------------------------------------- | ---------------------- |
| アプローチ選定書        | `outputs/phase-2/approach-selection.md`     | 採用アプローチと理由   |
| Vitest設定変更設計      | `outputs/phase-2/vitest-config-design.md`   | 設定変更の詳細設計     |
| Clipboard APIモック設計 | `outputs/phase-2/clipboard-mock-design.md`  | モック実装の設計       |
| 互換性影響分析          | `outputs/phase-2/compatibility-analysis.md` | 既存テストへの影響分析 |

---

## 完了条件

- [ ] アプローチA（jsdom）とアプローチB（happy-domモック強化）の比較評価表が作成されている
- [ ] 選定アプローチと理由が文書化されている
- [ ] vitest.config.tsの変更前後の差分が擬似コードで記載されている
- [ ] Clipboard APIモックの設計（モック対象、配置場所、リセット戦略）が文書化されている
- [ ] 既存テストへの影響範囲が分析され、修正が必要な箇所が特定されている
- [ ] パフォーマンスベンチマーク計画（基準値、許容範囲）が策定されている
- [ ] 成果物が`outputs/phase-2/`配下に4ファイル生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-F-skill-stream-test-env/phase-3-design-review.md`
