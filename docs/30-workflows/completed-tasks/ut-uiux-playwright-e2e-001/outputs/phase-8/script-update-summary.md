# Phase 8: evaluate-ui-ux-playwright-e2e.ts 更新結果サマリー

## 概要

`evaluate-ui-ux-playwright-e2e.ts` を multi_select 向けハードコードから `test-targets.config.ts` 駆動の動的構成へ変更した。

## 実施日

2026-03-31

## 対象ファイル

| ファイル                                                                             | 操作          |
| ------------------------------------------------------------------------------------ | ------------- |
| `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 更新          |
| `.agents/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | mirror コピー |

## 主な変更点

### 1. import 追加

`test-targets.config.ts` から `TEST_TARGETS` と `TestTarget` 型を import する文を冒頭に追加した。

```typescript
import {
  TEST_TARGETS,
  type TestTarget,
} from "../../../../apps/desktop/e2e/ui-ux/test-targets.config";
```

相対パスの根拠: `.claude/skills/task-specification-creator/scripts/` から `apps/desktop/e2e/ui-ux/` への 4 階層上 (`../../../../`) が正しいパス。

### 2. test.describe ブロックの置き換え

#### Before

```
"TASK-RT-05 multi_select Phase 11: 3層評価"
  - M11-1: multi_select request を開く - 3層評価
  - M11-2: 2件選択して送信する - 3層評価
  - M11-3: kind を切り替える - 3層評価
  - M11-4: 既存 4 kind を順に確認する - 3層評価
```

#### After

```
"UI/UX 3層評価フレームワーク"
  - TEST_TARGETS の各エントリを for...of でイテレート
  - layer1 === true のターゲット: [SEM] {id}: Semantic 検証 - {description}
  - layer2 === true のターゲット: [VIS] {id}: Visual 検証 - {description}
```

### 3. 既存共通ロジックは維持

`testSemanticLayer` / `testVisualLayer` / `launchElectronApp` の 3 関数はリファクタリングせず再利用。

## 現在の TEST_TARGETS（test-targets.config.ts）

| id                 | layer1 | layer2 | 説明                             |
| ------------------ | ------ | ------ | -------------------------------- |
| chat-main          | true   | true   | メインチャット画面               |
| skill-list         | true   | true   | スキル一覧画面                   |
| settings-general   | true   | true   | 設定画面（一般タブ）             |
| sidebar-navigation | true   | true   | サイドバーナビゲーション         |
| error-display      | true   | true   | エラー表示コンポーネント         |
| loading-state      | false  | true   | ローディング状態                 |
| dark-mode          | false  | true   | ダークモード（テーマ切り替え後） |

合計: Semantic テスト 5 件、Visual テスト 7 件 = 12 テストケース

## mirror 同期確認

```
diff .claude/skills/.../evaluate-ui-ux-playwright-e2e.ts \
     .agents/skills/.../evaluate-ui-ux-playwright-e2e.ts
→ 差分ゼロ
```

## 完了条件チェック

- [x] TEST_TARGETS を参照するようにスクリプトが更新されている
- [x] ハードコードされた M11 系の前提が残っていない
- [x] .agents mirror が同期されている（diff で差分ゼロ）
- [x] TypeScript の import パスが正しい（`../../../../apps/desktop/e2e/ui-ux/test-targets.config`）
