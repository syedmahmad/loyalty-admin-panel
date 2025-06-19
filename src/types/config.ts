export type FontFamily = `'Inter', sans-serif` | `'Poppins', sans-serif` | `'Roboto', sans-serif` | `'Public Sans', sans-serif`;
export type PresetColor = 'default' | 'theme1' | 'theme2' | 'theme3' | 'theme4' | 'theme5' | 'theme6' | 'theme7' | 'theme8';

export const DRAWER_WIDTH = 260;

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export enum MenuOrientation {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal'
}

export enum ThemeDirection {
  LTR = 'ltr',
  RTL = 'rtl'
}

// ==============================|| CONFIG TYPES ||============================== //

export type CustomizationActionProps = {
  type: string;
  payload?: CustomizationProps;
};

export type DefaultConfigProps = {
  /**
   * The props used for the theme font-style.
   * We provide static below options -
   * `'Inter', sans-serif`
   * `'Poppins', sans-serif`
   * `'Roboto', sans-serif`
   * `'Public Sans', sans-serif` (default)
   */
  fontFamily: FontFamily;

  /**
   * the props used for menu orientation (diffrent theme layout).
   * we provide static below options -
   * 'vertical' (default) - MenuOrientation.VERTICAL
   * 'horizontal' - MenuOrientation.HORIZONTAL
   */
  menuOrientation: MenuOrientation;

  /**
   * the props used for show mini variant drawer
   * the mini variant is recommended for apps sections that need quick selection access alongside content.
   * default - false
   */
  miniDrawer: boolean;

  /**
   * the props used for theme container.
   * the container centers your content horizontally. It's the most basic layout element.
   * default - true which show container
   * false - will show fluid
   */
  container: boolean;

  /**
   * the props used for default theme palette mode
   * explore the default theme
   * below theme options -
   * 'light' (default) - ThemeMode.LIGHT
   * 'dark' - ThemeMode.DARK
   */
  mode: ThemeMode;

  /**
   * the props used for theme primary color variants
   * we provide static below options thoe s are already defaine in src/themes/theme -
   * 'default'
   * 'theme1'
   * 'theme2'
   * 'theme3'
   * 'theme4'
   * 'theme5'
   * 'theme6'
   * 'theme7'
   * 'theme8'
   */
  presetColor: PresetColor;

  /**
   * the props used for default theme direction
   * explore the default theme
   * below theme options -
   * 'ltr' (default) - ThemeDirection.LTR
   * 'rtl' - ThemeDirection.RTL
   */
  themeDirection: ThemeDirection;
};

export type CustomizationProps = {
  fontFamily: FontFamily;
  miniDrawer: boolean;
  container: boolean;
  menuOrientation: MenuOrientation;
  mode: ThemeMode;
  presetColor: PresetColor;
  themeDirection: ThemeDirection;
  onChangeContainer: VoidFunction;
  onChangeMode: (mode: ThemeMode) => void;
  onChangePresetColor: (theme: PresetColor) => void;
  onChangeDirection: (direction: ThemeDirection) => void;
  onChangeMiniDrawer: (miniDrawer: boolean) => void;
  onChangeMenuOrientation: (menuOrientation: MenuOrientation) => void;
  onChangeFontFamily: (fontFamily: FontFamily) => void;
};

// ==============================|| THEME CONFIG  ||============================== //

const config: DefaultConfigProps = {
  fontFamily: `'Public Sans', sans-serif`,
  menuOrientation: MenuOrientation.VERTICAL,
  miniDrawer: false,
  container: true,
  mode: ThemeMode.LIGHT,
  presetColor: 'default',
  themeDirection: ThemeDirection.LTR
};

export default config;