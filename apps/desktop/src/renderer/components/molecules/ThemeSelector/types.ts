// Theme Selector Types
import type { ThemeMode } from "../../../store/types";

export interface ThemeSelectorProps {
  /**
   * 現在選択されているテーマモード
   */
  value: ThemeMode;

  /**
   * テーマ変更時のコールバック
   */
  onChange: (mode: ThemeMode) => void;

  /**
   * コンポーネントのサイズ
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * 無効状態
   * @default false
   */
  disabled?: boolean;

  /**
   * 横幅を親要素に合わせる
   * @default false
   */
  fullWidth?: boolean;

  /**
   * ラベルを表示するか
   * @default true
   */
  showLabels?: boolean;

  /**
   * 追加のCSSクラス
   */
  className?: string;

  /**
   * アクセシビリティ用のラベルID
   */
  "aria-labelledby"?: string;
}

export interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: "sun" | "moon" | "monitor";
  description: string;
}
