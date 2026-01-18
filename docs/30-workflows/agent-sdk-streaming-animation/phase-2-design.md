# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-streaming-animation |

---

## 目的

Phase 1で定義した要件に基づき、アニメーション仕様・CSSクラス設計・React統合パターンを設計する。

## 背景

パフォーマンスとアクセシビリティを両立するアニメーション設計が必要。GPU加速CSSプロパティの選択とreduced-motion対応が鍵となる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アニメーション仕様設計

**目的**: 各アニメーション効果の詳細仕様を設計する

**実行手順**:

1. 以下のアニメーションを設計:

**フェードイン効果**:

- duration: 150ms
- timing-function: ease-out
- プロパティ: opacity, transform

**カーソルブリンキング**:

- duration: 1000ms
- iteration: infinite
- プロパティ: opacity

**ローディングインジケーター**:

- duration: 1500ms
- timing-function: linear
- iteration: infinite

2. @keyframes定義を作成
3. 仕様を文書化

**期待される成果物**:

- `outputs/phase-2/animation-specification.md`

---

### タスク2: CSSアーキテクチャ設計

**目的**: CSSクラス構成とパフォーマンス最適化方針を設計する

**実行手順**:

1. CSSクラス命名規則を定義:
   - `.streaming-chunk--fade-in`
   - `.streaming-cursor--blink`
   - `.streaming-loader--spin`
2. GPU加速プロパティを選定:
   - `transform`
   - `opacity`
   - `will-change`
3. reduced-motion対応パターンを設計
4. アーキテクチャを文書化

**期待される成果物**:

- `outputs/phase-2/css-architecture.md`

---

### タスク3: React統合パターン設計

**目的**: Reactコンポーネントとのアニメーション統合方法を設計する

**実行手順**:

1. アニメーション適用方法を設計:
   - classNameベースの切り替え
   - CSS変数によるカスタマイズ
2. useReducedMotion カスタムフックを設計
3. コンポーネント構成を設計:
   - StreamingChunk
   - StreamingCursor
   - StreamingLoader
4. 設計を文書化

**期待される成果物**:

- `outputs/phase-2/react-integration.md`

---

### タスク4: 設計書作成

**目的**: 全設計を統合した設計書を作成する

**実行手順**:

1. タスク1〜3の成果物を統合
2. 実装順序を決定
3. 設計書を完成

**期待される成果物**:

- `outputs/phase-2/design-document.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容       |
| ------------------------- | --------------------------------------------------------------------------- | ---------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK型定義  |
| UI/UX設計                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design.md`         | UI設計基準 |

### Phase 1成果物

| 参照資料   | パス                              | 内容   |
| ---------- | --------------------------------- | ------ |
| 要件定義書 | `outputs/phase-1/requirements.md` | 全要件 |

---

## 成果物

| 成果物             | パス                                         | 内容               |
| ------------------ | -------------------------------------------- | ------------------ |
| アニメーション仕様 | `outputs/phase-2/animation-specification.md` | 効果仕様           |
| CSSアーキテクチャ  | `outputs/phase-2/css-architecture.md`        | CSS設計            |
| React統合          | `outputs/phase-2/react-integration.md`       | コンポーネント設計 |
| 設計書             | `outputs/phase-2/design-document.md`         | 統合設計           |

---

## 統合テスト連携（Phase 1〜11は必須）

- アニメーション設計が既存UIコンポーネントと整合していることを確認
- パフォーマンステストの計測ポイントを設計に含める

---

## 完了条件

- [ ] アニメーション仕様が設計されている
- [ ] CSSアーキテクチャが設計されている
- [ ] React統合パターンが設計されている
- [ ] reduced-motion対応が設計に含まれている
- [ ] 設計書が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-streaming-animation/phase-3-design-review.md`
