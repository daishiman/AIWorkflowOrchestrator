# Phase 4: テスト作成（Red）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 4                     |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

設計に基づいて失敗するテストを先に書く（TDDのRedフェーズ）。

## 実行タスク

- ユニットテスト作成: 各コンポーネント・関数のテスト
- 統合テスト作成: コンポーネント間連携のテスト
- セキュリティテスト作成: sandbox/CSP動作確認テスト

## 参照資料

| 資料名       | パス                                     | 説明            |
| ------------ | ---------------------------------------- | --------------- |
| 設計書       | `outputs/phase-2/architecture-design.md` | アーキテクチャ  |
| 型定義       | `outputs/phase-2/type-definitions.md`    | TypeScript型    |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md` | Given-When-Then |

### システム仕様（aiworkflow-requirements）

> テスト作成時に以下の仕様を参照してください。

| 参照資料               | パス                                                                     | 内容           |
| ---------------------- | ------------------------------------------------------------------------ | -------------- |
| テスト戦略             | `.claude/skills/aiworkflow-requirements/references/test-msw-coverage.md` | Vitest/MSW設定 |
| UIコンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`  | RTL使用方法    |

---

## テスト対象一覧

### ユニットテスト

| テスト対象                 | テストファイル                                                             | 優先度 |
| -------------------------- | -------------------------------------------------------------------------- | ------ |
| EnvironmentType型          | `types/__tests__/agent.test.ts`                                            | 高     |
| sanitizeHTML関数           | `utils/__tests__/sanitize.test.ts`                                         | 高     |
| SplitLayout                | `components/organisms/SplitLayout/__tests__/index.test.tsx`                | 高     |
| EnvironmentSelector        | `components/molecules/EnvironmentSelector/__tests__/index.test.tsx`        | 中     |
| ExecutionEnvironment       | `components/organisms/ExecutionEnvironment/__tests__/index.test.tsx`       | 高     |
| HTMLPreviewEnvironment     | `components/organisms/HTMLPreviewEnvironment/__tests__/index.test.tsx`     | 高     |
| MarkdownPreviewEnvironment | `components/organisms/MarkdownPreviewEnvironment/__tests__/index.test.tsx` | 中     |

### 統合テスト

| テスト対象             | テストファイル                                            | 優先度 |
| ---------------------- | --------------------------------------------------------- | ------ |
| agentSlice拡張         | `store/slices/__tests__/agentSlice.test.ts`               | 高     |
| AgentExecutionView統合 | `views/__tests__/AgentExecutionView.integration.test.tsx` | 高     |

### セキュリティテスト

| テスト対象 | テストファイル | 優先度 |
| ---------------------- | ---------------------------------------------------- | 高 |
| iframe sandbox | `security/__tests__/iframe-sandbox.test.tsx` | 高 |
| CSP適用 | `security/__tests__/csp.test.tsx` | 高 |
| HTMLサニタイズ | `security/__tests__/sanitize.test.ts` | 高 |

---

## テストケース詳細

### 1. SplitLayout

```typescript
// apps/desktop/src/renderer/components/organisms/SplitLayout/__tests__/index.test.tsx

describe("SplitLayout", () => {
  describe("レンダリング", () => {
    it("左右のパネルが表示される", () => {
      // Given: leftPanelとrightPanelが渡される
      // When: SplitLayoutをレンダリング
      // Then: 両方のパネルが表示される
    });

    it("右パネルを非表示にできる", () => {
      // Given: showRightPanel=false
      // When: SplitLayoutをレンダリング
      // Then: 左パネルのみ表示される
    });
  });

  describe("分割比率", () => {
    it("初期比率が適用される", () => {
      // Given: initialRatio=30
      // When: SplitLayoutをレンダリング
      // Then: 左パネルが30%幅になる
    });

    it("ドラッグで比率を変更できる", () => {
      // Given: ディバイダーが表示されている
      // When: ディバイダーをドラッグ
      // Then: onRatioChangeが新しい比率で呼ばれる
    });

    it("最小/最大比率を超えない", () => {
      // Given: minRatio=20, maxRatio=80
      // When: ディバイダーを端までドラッグ
      // Then: 比率は20-80の範囲内に制限される
    });
  });

  describe("アクセシビリティ", () => {
    it("キーボードで比率を調整できる", () => {
      // Given: ディバイダーにフォーカス
      // When: 矢印キーを押す
      // Then: 比率が変更される
    });
  });
});
```

### 2. HTMLPreviewEnvironment

```typescript
// apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/__tests__/index.test.tsx

describe("HTMLPreviewEnvironment", () => {
  describe("レンダリング", () => {
    it("HTMLコンテンツがiframe内に表示される", () => {
      // Given: HTML文字列
      // When: コンポーネントをレンダリング
      // Then: iframeにHTMLが表示される
    });
  });

  describe("セキュリティ", () => {
    it("sandbox属性が設定される", () => {
      // Given: HTMLコンテンツ
      // When: コンポーネントをレンダリング
      // Then: iframeにsandbox属性がある
    });

    it("スクリプトが無効化される", () => {
      // Given: <script>タグを含むHTML
      // When: コンポーネントをレンダリング
      // Then: スクリプトは実行されない
    });

    it("悪意のあるイベントハンドラが除去される", () => {
      // Given: onerror属性を含むHTML
      // When: コンポーネントをレンダリング
      // Then: イベントハンドラが除去される
    });
  });

  describe("コールバック", () => {
    it("読み込み完了時にonLoadが呼ばれる", () => {
      // Given: onLoadコールバック
      // When: iframeが読み込み完了
      // Then: onLoadが呼ばれる
    });

    it("エラー時にonErrorが呼ばれる", () => {
      // Given: onErrorコールバック
      // When: 読み込みエラー発生
      // Then: onErrorがエラー情報とともに呼ばれる
    });
  });
});
```

### 3. EnvironmentSelector

```typescript
// apps/desktop/src/renderer/components/molecules/EnvironmentSelector/__tests__/index.test.tsx

describe("EnvironmentSelector", () => {
  describe("環境選択", () => {
    it("現在の環境が表示される", () => {
      // Given: currentEnvironment="html"
      // When: コンポーネントをレンダリング
      // Then: "HTML"が選択状態で表示される
    });

    it("環境を切り替えられる", () => {
      // Given: 複数の環境が利用可能
      // When: ドロップダウンから別の環境を選択
      // Then: onEnvironmentChangeが呼ばれる
    });
  });

  describe("アクションボタン", () => {
    it("更新ボタンでonRefreshが呼ばれる", () => {
      // Given: onRefreshコールバック
      // When: 更新ボタンをクリック
      // Then: onRefreshが呼ばれる
    });

    it("全画面ボタンでonFullscreenが呼ばれる", () => {
      // Given: onFullscreenコールバック
      // When: 全画面ボタンをクリック
      // Then: onFullscreenが呼ばれる
    });
  });

  describe("無効状態", () => {
    it("disabled時は操作不可", () => {
      // Given: disabled=true
      // When: ドロップダウンをクリック
      // Then: 開かない
    });
  });
});
```

### 4. agentSlice拡張

```typescript
// apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts

describe("agentSlice拡張", () => {
  describe("previewContent", () => {
    it("初期値はnull", () => {
      // Given: 初期状態
      // When: 状態を取得
      // Then: previewContentがnull
    });

    it("setPreviewContentで更新できる", () => {
      // Given: 新しいPreviewContent
      // When: setPreviewContent呼び出し
      // Then: 状態が更新される
    });

    it("clearPreviewでnullになる", () => {
      // Given: previewContentが設定されている
      // When: clearPreview呼び出し
      // Then: previewContentがnullになる
    });
  });

  describe("selectedEnvironment", () => {
    it("初期値は'none'", () => {
      // Given: 初期状態
      // When: 状態を取得
      // Then: selectedEnvironmentが'none'
    });

    it("setSelectedEnvironmentで更新できる", () => {
      // Given: 環境タイプ
      // When: setSelectedEnvironment呼び出し
      // Then: 状態が更新される
    });
  });

  describe("splitRatio", () => {
    it("初期値は50", () => {
      // Given: 初期状態
      // When: 状態を取得
      // Then: splitRatioが50
    });

    it("setSplitRatioで更新できる", () => {
      // Given: 新しい比率
      // When: setSplitRatio呼び出し
      // Then: 状態が更新される
    });
  });
});
```

### 5. sanitizeHTML

```typescript
// apps/desktop/src/renderer/utils/__tests__/sanitize.test.ts

describe("sanitizeHTML", () => {
  describe("危険なタグの除去", () => {
    it("scriptタグを除去する", () => {
      // Given: <script>alert('xss')</script>
      // When: sanitizeHTML呼び出し
      // Then: scriptタグが除去される
    });

    it("iframeタグを除去する", () => {
      // Given: <iframe src="evil.com"></iframe>
      // When: sanitizeHTML呼び出し
      // Then: iframeタグが除去される
    });

    it("objectタグを除去する", () => {
      // Given: <object data="evil.swf"></object>
      // When: sanitizeHTML呼び出し
      // Then: objectタグが除去される
    });

    it("embedタグを除去する", () => {
      // Given: <embed src="evil.swf" />
      // When: sanitizeHTML呼び出し
      // Then: embedタグが除去される
    });
  });

  describe("危険な属性の除去", () => {
    it("onerrorを除去する", () => {
      // Given: <img onerror="alert('xss')" />
      // When: sanitizeHTML呼び出し
      // Then: onerror属性が除去される
    });

    it("onloadを除去する", () => {
      // Given: <img onload="alert('xss')" />
      // When: sanitizeHTML呼び出し
      // Then: onload属性が除去される
    });

    it("onclickを除去する", () => {
      // Given: <button onclick="alert('xss')">
      // When: sanitizeHTML呼び出し
      // Then: onclick属性が除去される
    });

    it("onmouseoverを除去する", () => {
      // Given: <div onmouseover="alert('xss')">
      // When: sanitizeHTML呼び出し
      // Then: onmouseover属性が除去される
    });
  });

  describe("javascript: URLの除去", () => {
    it("href属性のjavascript:を除去する", () => {
      // Given: <a href="javascript:alert('xss')">
      // When: sanitizeHTML呼び出し
      // Then: hrefが除去またはサニタイズされる
    });

    it("src属性のjavascript:を除去する", () => {
      // Given: <img src="javascript:alert('xss')">
      // When: sanitizeHTML呼び出し
      // Then: srcが除去またはサニタイズされる
    });
  });

  describe("安全なHTMLの保持", () => {
    it("通常のHTMLは保持される", () => {
      // Given: <h1>Title</h1><p>Content</p>
      // When: sanitizeHTML呼び出し
      // Then: 元のHTMLが保持される
    });

    it("CSSスタイルは保持される", () => {
      // Given: <div style="color: red;">
      // When: sanitizeHTML呼び出し
      // Then: style属性が保持される
    });
  });
});
```

### 6. セキュリティテスト

```typescript
// apps/desktop/src/renderer/security/__tests__/iframe-sandbox.test.tsx

describe("iframe sandbox", () => {
  it("allow-scriptsが含まれていない", () => {
    // Given: HTMLPreviewEnvironment
    // When: iframe要素を取得
    // Then: sandbox属性にallow-scriptsがない
  });

  it("allow-popupsが含まれていない", () => {
    // Given: HTMLPreviewEnvironment
    // When: iframe要素を取得
    // Then: sandbox属性にallow-popupsがない
  });

  it("allow-top-navigationが含まれていない", () => {
    // Given: HTMLPreviewEnvironment
    // When: iframe要素を取得
    // Then: sandbox属性にallow-top-navigationがない
  });
});
```

---

## テスト実行方法

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイルのテスト
pnpm --filter @repo/desktop test -- SplitLayout

# ウォッチモード
pnpm --filter @repo/desktop test:watch

# カバレッジ付き
pnpm --filter @repo/desktop test:coverage
```

---

## 統合テスト連携【必須】

統合ポイントのテストを作成する:

| 統合ポイント               | テスト内容                                               |
| -------------------------- | -------------------------------------------------------- |
| agentSlice拡張             | setPreviewContent, setSelectedEnvironment, setSplitRatio |
| SplitLayout↔親             | onRatioChangeが正しく伝播                                |
| ExecutionEnvironment       | 環境タイプに応じた正しいコンポーネント表示               |
| HTMLPreviewEnvironment     | sandbox/CSPが正しく適用                                  |
| MarkdownPreviewEnvironment | Markdownが正しくレンダリング                             |

---

## 成果物

| 成果物             | パス                                 | 説明             |
| ------------------ | ------------------------------------ | ---------------- |
| ユニットテスト     | `outputs/phase-4/unit-tests/`        | 各コンポーネント |
| 統合テスト         | `outputs/phase-4/integration-tests/` | 連携テスト       |
| セキュリティテスト | `outputs/phase-4/security-tests/`    | sandbox/CSP      |
| テスト計画書       | `outputs/phase-4/test-plan.md`       | テスト戦略       |

---

## 完了条件

- [ ] すべてのコンポーネントにテストが作成されている
- [ ] すべてのテストが「Red」状態（失敗する）
- [ ] セキュリティテストが作成されている
- [ ] 統合テストが作成されている
- [ ] テストカバレッジ計画が作成されている
- [ ] 統合ポイントのテストが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. テスト環境セットアップ確認
2. SplitLayoutテスト作成
3. EnvironmentSelectorテスト作成
4. ExecutionEnvironmentテスト作成
5. HTMLPreviewEnvironmentテスト作成
6. MarkdownPreviewEnvironmentテスト作成
7. agentSlice拡張テスト作成
8. sanitizeHTMLテスト作成
9. セキュリティテスト作成
10. 統合テスト作成
11. テストが全て失敗すること（Red）を確認
12. 成果物の作成・配置
13. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 4
```

## 次のPhase

Phase 5: 実装（Green）
