# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 8                 |
| 機能名 | skill-stream-i18n |
| 作成日 | 2026-01-28        |

---

## 目的

動作を変えずにi18n実装のコード品質を改善する。

---

## 実行タスク

### Task 1: 翻訳キーの型安全性強化

**対象**: `apps/desktop/src/renderer/i18n/`

**改善内容**:

- TypeScriptの型定義を追加して翻訳キーの型安全性を確保
- 存在しないキーへのアクセスをコンパイル時に検出

```typescript
// types/i18n.d.ts
import "react-i18next";
import skillStream from "../i18n/locales/ja/skill-stream.json";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "skill-stream";
    resources: {
      "skill-stream": typeof skillStream;
    };
  }
}
```

### Task 2: formatRelativeTimeの最適化

**対象**: `apps/desktop/src/renderer/utils/formatTime.ts`

**改善内容**:
| 改善項目 | 改善前 | 改善後 |
| -------- | ------ | ------ |
| 翻訳キャッシュ | 毎回t()呼び出し | useMemoで結果をキャッシュ |
| 条件分岐 | if-elseチェーン | 設定オブジェクトによるルックアップ |
| コード重複 | locale判定の重複 | 共通関数への切り出し |

### Task 3: コンポーネントの最適化

**対象**: `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

**改善内容**:
| 改善項目 | 改善前 | 改善後 |
| -------- | ------ | ------ |
| 翻訳結果のメモ化 | 毎レンダリングで翻訳取得 | useMemoで翻訳結果をキャッシュ |
| コンポーネント分離 | 1ファイルに全て | 翻訳関連を別hooks/utilsに分離 |

### Task 4: 将来の改善候補の特定

Phase 12の未タスク検出に備え、将来の改善候補を記録:

| 候補                     | 説明                               | 優先度 |
| ------------------------ | ---------------------------------- | ------ |
| 言語切替UI               | ユーザーが手動で言語を切り替えるUI | 低     |
| 3言語以上対応            | 中国語、韓国語等の追加             | 低     |
| 翻訳ファイル遅延読み込み | バンドルサイズ最適化               | 中     |

---

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
```

---

## 参照資料

| 資料名             | パス                                 | 説明                 |
| ------------------ | ------------------------------------ | -------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Phase 7成果物        |
| 実装コード         | Phase 5成果物                        | リファクタリング対象 |

---

## 成果物

| 成果物                   | パス                                     | 説明           |
| ------------------------ | ---------------------------------------- | -------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`  | 改善内容と結果 |
| 将来改善候補             | `outputs/phase-8/future-improvements.md` | 未タスク候補   |

---

## 完了条件

- [ ] テストが継続成功（Green維持）
- [ ] 翻訳キーの型安全性が確保されている
- [ ] formatRelativeTimeの最適化が完了している
- [ ] コンポーネントの最適化が完了している
- [ ] コード品質が改善されている（重複排除、命名改善）
- [ ] 将来の改善候補が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
# - [ ] パフォーマンス劣化がないことを確認
```

---

## 次のPhase

Phase 9: 品質保証
