/**
 * @file サンプルJavaScriptファイル
 * @description 手動テスト用のJavaScriptコードサンプル
 */

// クラス定義
class Calculator {
  /**
   * 加算
   */
  add(a, b) {
    return a + b;
  }

  /**
   * 減算
   */
  subtract(a, b) {
    return a - b;
  }

  /**
   * 乗算
   */
  multiply(a, b) {
    return a * b;
  }

  /**
   * 除算
   */
  divide(a, b) {
    if (b === 0) {
      throw new Error("Division by zero");
    }
    return a / b;
  }
}

// 関数定義
function greet(name) {
  return `Hello, ${name}!`;
}

const multiply = (a, b) => a * b;

// エクスポート（ESM形式）
export { Calculator, greet, multiply };
