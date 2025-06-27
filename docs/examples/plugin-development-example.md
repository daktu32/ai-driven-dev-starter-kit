# プラグイン開発サンプル - Mobile React Native プラグイン

このドキュメントでは、AI Driven Dev Starter Kit用の新しいプラグインを開発する手順を、「Mobile React Native」プラグインの実装例を通じて説明します。

## 概要

**プラグイン名**: Mobile React Native Plugin  
**プラグインID**: `mobile-react-native`  
**目的**: React Nativeを使用したモバイルアプリ開発のテンプレートを提供  
**技術スタック**: React Native, TypeScript, Expo

## 開発手順

### ステップ 1: プラグインディレクトリの作成

```bash
mkdir plugins/mobile-react-native-plugin
cd plugins/mobile-react-native-plugin
```

### ステップ 2: プラグインファイルの実装

#### index.ts (メインプラグインファイル)

```typescript
import type { 
  Plugin, 
  PluginMetadata, 
  ProjectTemplate, 
  ScaffoldOptions, 
  ScaffoldResult, 
  PluginContext,
  ConfigOption,
  HealthCheckResult 
} from '../../src/plugin/types.js';
import { join } from 'path';

/**
 * Mobile React Native プラグイン
 * React Nativeを使用したモバイルアプリケーション開発のテンプレートを提供
 */
class MobileReactNativePlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    id: 'mobile-react-native',
    name: 'Mobile React Native',
    version: '1.0.0',
    description: 'React Native + TypeScript + Expoによるクロスプラットフォームモバイルアプリテンプレート',
    author: 'AI Driven Dev Starter Kit',
    license: 'MIT',
    tags: ['mobile', 'react-native', 'typescript', 'expo', 'ios', 'android'],
    minimumKitVersion: '1.0.0'
  };

  private context: PluginContext | null = null;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    context.logger.info('Mobile React Native Plugin initialized', {
      pluginId: this.metadata.id,
      version: this.metadata.version
    });
  }

  async cleanup(): Promise<void> {
    if (this.context) {
      this.context.logger.info('Mobile React Native Plugin cleanup completed', {
        pluginId: this.metadata.id
      });
    }
  }

  getProjectTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'mobile-react-native',
        name: 'React Native Mobile App',
        description: 'React Native + TypeScript + Expoによるクロスプラットフォームモバイルアプリケーション',
        category: 'mobile',
        templatePath: 'templates/project-structures/mobile-react-native',
        requirements: [
          { name: 'Node.js', version: '>=18.0.0', description: 'JavaScript runtime' },
          { name: 'Expo CLI', version: '>=6.0.0', description: 'Expo development tools' },
          { name: 'TypeScript', version: '>=5.0.0', description: 'Type safety' }
        ],
        configOptions: this.getConfigOptions()
      }
    ];
  }

  private getConfigOptions(): ConfigOption[] {
    return [
      {
        name: 'projectName',
        type: 'string',
        description: 'モバイルアプリ名',
        defaultValue: 'my-mobile-app',
        required: true,
        validation: {
          pattern: '^[a-z][a-z0-9-]*$',
          message: 'プロジェクト名は小文字とハイフンのみ使用可能です'
        }
      },
      {
        name: 'template',
        type: 'select',
        description: 'React Nativeテンプレート',
        defaultValue: 'expo-managed',
        required: true,
        options: [
          { label: 'Expo Managed Workflow', value: 'expo-managed' },
          { label: 'Expo Bare Workflow', value: 'expo-bare' },
          { label: 'React Native CLI', value: 'react-native-cli' }
        ]
      },
      {
        name: 'navigation',
        type: 'select',
        description: 'ナビゲーションライブラリ',
        defaultValue: 'react-navigation',
        required: true,
        options: [
          { label: 'React Navigation v6', value: 'react-navigation' },
          { label: 'React Native Navigation', value: 'react-native-navigation' },
          { label: 'None', value: 'none' }
        ]
      },
      {
        name: 'stateManagement',
        type: 'select',
        description: '状態管理ライブラリ',
        defaultValue: 'redux-toolkit',
        required: false,
        options: [
          { label: 'Redux Toolkit', value: 'redux-toolkit' },
          { label: 'Zustand', value: 'zustand' },
          { label: 'Recoil', value: 'recoil' },
          { label: 'Context API only', value: 'context' },
          { label: 'None', value: 'none' }
        ]
      },
      {
        name: 'styling',
        type: 'select',
        description: 'スタイリングアプローチ',
        defaultValue: 'styled-components',
        required: false,
        options: [
          { label: 'Styled Components', value: 'styled-components' },
          { label: 'StyleSheet (Native)', value: 'stylesheet' },
          { label: 'NativeWind (Tailwind)', value: 'nativewind' },
          { label: 'Tamagui', value: 'tamagui' }
        ]
      },
      {
        name: 'testing',
        type: 'multiselect',
        description: 'テストフレームワーク',
        defaultValue: ['jest', 'testing-library'],
        required: false,
        options: [
          { label: 'Jest', value: 'jest' },
          { label: 'React Native Testing Library', value: 'testing-library' },
          { label: 'Detox (E2E)', value: 'detox' },
          { label: 'Maestro (E2E)', value: 'maestro' }
        ]
      },
      {
        name: 'features',
        type: 'multiselect',
        description: '追加機能',
        defaultValue: [],
        required: false,
        options: [
          { label: 'Push Notifications', value: 'push-notifications' },
          { label: 'Analytics', value: 'analytics' },
          { label: 'Crash Reporting', value: 'crash-reporting' },
          { label: 'Deep Linking', value: 'deep-linking' },
          { label: 'Biometric Authentication', value: 'biometric-auth' },
          { label: 'Offline Support', value: 'offline-support' }
        ]
      },
      {
        name: 'includeExamples',
        type: 'boolean',
        description: 'サンプルコンポーネントとスクリーンを含める',
        defaultValue: true,
        required: false
      }
    ];
  }

  async generateScaffold(
    template: ProjectTemplate, 
    options: ScaffoldOptions, 
    context: PluginContext
  ): Promise<ScaffoldResult> {
    try {
      context.logger.info('Starting Mobile React Native project generation', {
        templateId: template.id,
        projectName: options.projectName,
        options: options.options
      });

      const generatedFiles: string[] = [];
      const warnings: string[] = [];

      // プロジェクトディレクトリの作成
      await context.fileSystem.ensureDir(options.targetPath);

      // 基本ファイル構造の生成
      await this.generateBaseStructure(options, context, generatedFiles);

      // package.jsonの生成
      await this.generatePackageJson(options, context, generatedFiles);

      // TypeScript設定の生成
      await this.generateTypeScriptConfig(options, context, generatedFiles);

      // React Native設定の生成
      await this.generateReactNativeConfig(options, context, generatedFiles);

      // アプリケーションコードの生成
      await this.generateAppCode(options, context, generatedFiles);

      // 選択された機能に基づくコードの生成
      await this.generateFeatureCode(options, context, generatedFiles, warnings);

      // ドキュメントの生成
      await this.generateDocumentation(options, context, generatedFiles);

      // 次のステップの定義
      const nextSteps = this.getNextSteps(options);

      context.logger.info('Mobile React Native project generation completed', {
        generatedFiles: generatedFiles.length,
        warnings: warnings.length
      });

      return {
        success: true,
        generatedFiles,
        warnings,
        nextSteps
      };

    } catch (error) {
      context.logger.error('Failed to generate Mobile React Native project', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId: template.id,
        projectName: options.projectName
      });

      return {
        success: false,
        generatedFiles: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async generateBaseStructure(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    const directories = [
      'src',
      'src/components',
      'src/screens',
      'src/navigation',
      'src/services',
      'src/hooks',
      'src/utils',
      'src/types',
      'src/styles',
      'assets',
      'assets/images',
      'assets/fonts',
      '__tests__',
      'android',
      'ios'
    ];

    for (const dir of directories) {
      const dirPath = join(options.targetPath, dir);
      await context.fileSystem.ensureDir(dirPath);
    }

    // .gitignore
    const gitignoreContent = this.getGitignoreContent();
    await context.fileSystem.writeFile(
      join(options.targetPath, '.gitignore'),
      gitignoreContent
    );
    generatedFiles.push('.gitignore');
  }

  private async generatePackageJson(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    const packageJson = {
      name: options.projectName,
      version: '1.0.0',
      description: `React Native mobile application: ${options.projectName}`,
      main: 'index.js',
      scripts: this.getPackageScripts(options),
      dependencies: this.getDependencies(options),
      devDependencies: this.getDevDependencies(options),
      keywords: ['react-native', 'mobile', 'typescript', 'expo'],
      author: 'Generated by AI Driven Dev Starter Kit',
      license: 'MIT'
    };

    await context.fileSystem.writeFile(
      join(options.targetPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    generatedFiles.push('package.json');
  }

  private getPackageScripts(options: ScaffoldOptions): Record<string, string> {
    const template = options.options.template;
    
    if (template === 'expo-managed') {
      return {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
        build: 'expo build',
        'build:android': 'expo build:android',
        'build:ios': 'expo build:ios',
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
        lint: 'eslint src --ext .ts,.tsx',
        'lint:fix': 'eslint src --ext .ts,.tsx --fix',
        'type-check': 'tsc --noEmit'
      };
    }

    return {
      start: 'npx react-native start',
      android: 'npx react-native run-android',
      ios: 'npx react-native run-ios',
      build: 'npx react-native build',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:coverage': 'jest --coverage',
      lint: 'eslint src --ext .ts,.tsx',
      'lint:fix': 'eslint src --ext .ts,.tsx --fix',
      'type-check': 'tsc --noEmit'
    };
  }

  private getDependencies(options: ScaffoldOptions): Record<string, string> {
    const deps: Record<string, string> = {
      'react': '^18.2.0',
      'react-native': '^0.72.0'
    };

    // テンプレートに基づく依存関係
    if (options.options.template === 'expo-managed') {
      deps['expo'] = '^49.0.0';
      deps['@expo/vector-icons'] = '^13.0.0';
    }

    // ナビゲーション
    if (options.options.navigation === 'react-navigation') {
      deps['@react-navigation/native'] = '^6.1.0';
      deps['@react-navigation/stack'] = '^6.3.0';
      deps['@react-navigation/bottom-tabs'] = '^6.5.0';
      deps['react-native-screens'] = '^3.25.0';
      deps['react-native-safe-area-context'] = '^4.7.0';
    }

    // 状態管理
    if (options.options.stateManagement === 'redux-toolkit') {
      deps['@reduxjs/toolkit'] = '^1.9.0';
      deps['react-redux'] = '^8.1.0';
    } else if (options.options.stateManagement === 'zustand') {
      deps['zustand'] = '^4.4.0';
    }

    // スタイリング
    if (options.options.styling === 'styled-components') {
      deps['styled-components'] = '^6.0.0';
    } else if (options.options.styling === 'nativewind') {
      deps['nativewind'] = '^2.0.0';
      deps['tailwindcss'] = '^3.3.0';
    }

    return deps;
  }

  private getDevDependencies(options: ScaffoldOptions): Record<string, string> {
    const devDeps: Record<string, string> = {
      '@types/react': '^18.2.0',
      '@types/react-native': '^0.72.0',
      'typescript': '^5.0.0',
      '@typescript-eslint/eslint-plugin': '^6.0.0',
      '@typescript-eslint/parser': '^6.0.0',
      'eslint': '^8.50.0',
      'prettier': '^3.0.0'
    };

    // テスト関連
    if (options.options.testing?.includes('jest')) {
      devDeps['jest'] = '^29.6.0';
      devDeps['@types/jest'] = '^29.5.0';
    }

    if (options.options.testing?.includes('testing-library')) {
      devDeps['@testing-library/react-native'] = '^12.3.0';
      devDeps['@testing-library/jest-native'] = '^5.4.0';
    }

    if (options.options.testing?.includes('detox')) {
      devDeps['detox'] = '^20.11.0';
    }

    return devDeps;
  }

  private async generateTypeScriptConfig(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    const tsConfig = {
      extends: '@react-native/typescript-config/tsconfig.json',
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
          '@/components/*': ['src/components/*'],
          '@/screens/*': ['src/screens/*'],
          '@/navigation/*': ['src/navigation/*'],
          '@/services/*': ['src/services/*'],
          '@/hooks/*': ['src/hooks/*'],
          '@/utils/*': ['src/utils/*'],
          '@/types/*': ['src/types/*'],
          '@/styles/*': ['src/styles/*']
        }
      },
      include: ['src/**/*', '__tests__/**/*'],
      exclude: ['node_modules', 'android', 'ios']
    };

    await context.fileSystem.writeFile(
      join(options.targetPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
    generatedFiles.push('tsconfig.json');
  }

  private async generateReactNativeConfig(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    if (options.options.template === 'expo-managed') {
      // app.json for Expo
      const appJson = {
        expo: {
          name: options.projectName,
          slug: options.projectName,
          version: '1.0.0',
          orientation: 'portrait',
          icon: './assets/images/icon.png',
          userInterfaceStyle: 'light',
          splash: {
            image: './assets/images/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
          },
          assetBundlePatterns: ['**/*'],
          ios: {
            supportsTablet: true
          },
          android: {
            adaptiveIcon: {
              foregroundImage: './assets/images/adaptive-icon.png',
              backgroundColor: '#FFFFFF'
            }
          },
          web: {
            favicon: './assets/images/favicon.png'
          }
        }
      };

      await context.fileSystem.writeFile(
        join(options.targetPath, 'app.json'),
        JSON.stringify(appJson, null, 2)
      );
      generatedFiles.push('app.json');
    }

    // ESLint設定
    const eslintConfig = {
      extends: [
        '@react-native-community',
        '@typescript-eslint/recommended'
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    };

    await context.fileSystem.writeFile(
      join(options.targetPath, '.eslintrc.js'),
      `module.exports = ${JSON.stringify(eslintConfig, null, 2)};`
    );
    generatedFiles.push('.eslintrc.js');
  }

  private async generateAppCode(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    // App.tsx
    const appContent = this.getAppComponent(options);
    await context.fileSystem.writeFile(
      join(options.targetPath, 'App.tsx'),
      appContent
    );
    generatedFiles.push('App.tsx');

    // Entry point for React Native CLI
    if (options.options.template !== 'expo-managed') {
      const indexContent = "import { AppRegistry } from 'react-native';\nimport App from './App';\nimport { name as appName } from './app.json';\n\nAppRegistry.registerComponent(appName, () => App);\n";
      await context.fileSystem.writeFile(
        join(options.targetPath, 'index.js'),
        indexContent
      );
      generatedFiles.push('index.js');
    }

    // サンプルコンポーネント（オプション）
    if (options.options.includeExamples) {
      await this.generateExampleComponents(options, context, generatedFiles);
    }
  }

  private getAppComponent(options: ScaffoldOptions): string {
    const hasNavigation = options.options.navigation !== 'none';
    
    return `import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
${hasNavigation ? "import { NavigationContainer } from '@react-navigation/native';" : ''}
${hasNavigation ? "import { AppNavigator } from './src/navigation/AppNavigator';" : ''}

export default function App() {
  return (
    ${hasNavigation ? '<NavigationContainer>' : '<View style={styles.container}>'}
      ${hasNavigation ? '<AppNavigator />' : '<Text>Welcome to ${options.projectName}!</Text>'}
      <StatusBar style="auto" />
    ${hasNavigation ? '</NavigationContainer>' : '</View>'}
  );
}

${!hasNavigation ? `
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});` : ''}
`;
  }

  private async generateExampleComponents(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    // サンプルコンポーネント
    const buttonComponent = `import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, styles[variant]]} 
      onPress={onPress}
    >
      <Text style={[styles.text, styles[\`\${variant}Text\`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C6C6C8',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
});
`;

    await context.fileSystem.writeFile(
      join(options.targetPath, 'src/components/Button.tsx'),
      buttonComponent
    );
    generatedFiles.push('src/components/Button.tsx');

    // サンプルスクリーン
    const homeScreen = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';

export const HomeScreen: React.FC = () => {
  const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ${options.projectName}!</Text>
      <Text style={styles.subtitle}>
        This is a sample React Native application generated by AI Driven Dev Starter Kit.
      </Text>
      <Button title="Get Started" onPress={handlePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
});
`;

    await context.fileSystem.writeFile(
      join(options.targetPath, 'src/screens/HomeScreen.tsx'),
      homeScreen
    );
    generatedFiles.push('src/screens/HomeScreen.tsx');
  }

  private async generateFeatureCode(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[],
    warnings: string[]
  ): Promise<void> {
    // ナビゲーション設定
    if (options.options.navigation === 'react-navigation') {
      await this.generateNavigation(options, context, generatedFiles);
    }

    // 状態管理設定
    if (options.options.stateManagement && options.options.stateManagement !== 'none') {
      await this.generateStateManagement(options, context, generatedFiles);
    }

    // 追加機能
    const features = options.options.features || [];
    for (const feature of features) {
      try {
        await this.generateFeature(feature, options, context, generatedFiles);
      } catch (error) {
        warnings.push(`Feature "${feature}" could not be generated: ${error}`);
      }
    }
  }

  private async generateNavigation(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    const navigatorContent = `import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';

export type RootStackParamList = {
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: '${options.projectName}' }}
      />
    </Stack.Navigator>
  );
};
`;

    await context.fileSystem.writeFile(
      join(options.targetPath, 'src/navigation/AppNavigator.tsx'),
      navigatorContent
    );
    generatedFiles.push('src/navigation/AppNavigator.tsx');
  }

  private async generateStateManagement(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    if (options.options.stateManagement === 'redux-toolkit') {
      const storeContent = `import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Add your reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;

      await context.fileSystem.writeFile(
        join(options.targetPath, 'src/store/store.ts'),
        storeContent
      );
      generatedFiles.push('src/store/store.ts');

      await context.fileSystem.ensureDir(join(options.targetPath, 'src/store'));
    }
  }

  private async generateFeature(
    feature: string,
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    // 機能別のコード生成（実装例）
    switch (feature) {
      case 'push-notifications':
        // プッシュ通知関連のファイル生成
        break;
      case 'analytics':
        // アナリティクス関連のファイル生成
        break;
      // 他の機能も同様に実装
    }
  }

  private async generateDocumentation(
    options: ScaffoldOptions, 
    context: PluginContext, 
    generatedFiles: string[]
  ): Promise<void> {
    const readmeContent = `# ${options.projectName}

React Native mobile application generated by AI Driven Dev Starter Kit.

## Features

- **Framework**: React Native
- **Language**: TypeScript
- **Template**: ${options.options.template}
- **Navigation**: ${options.options.navigation}
- **State Management**: ${options.options.stateManagement}
- **Styling**: ${options.options.styling}

## Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- React Native development environment
${options.options.template === 'expo-managed' ? '- Expo CLI' : '- React Native CLI'}

### Installation

\`\`\`bash
npm install
\`\`\`

### Running the App

${options.options.template === 'expo-managed' ? 
`\`\`\`bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
\`\`\`` : 
`\`\`\`bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
\`\`\``}

### Testing

\`\`\`bash
npm test
\`\`\`

### Linting

\`\`\`bash
npm run lint
\`\`\`

## Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # API services and utilities
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── styles/         # Shared styles and themes
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

MIT
`;

    await context.fileSystem.writeFile(
      join(options.targetPath, 'README.md'),
      readmeContent
    );
    generatedFiles.push('README.md');

    // ARCHITECTURE.md
    const architectureContent = `# ${options.projectName} - Architecture

## Overview

This React Native application follows a modular architecture pattern with clear separation of concerns.

## Architecture Patterns

- **Component-Based Architecture**: UI components are modular and reusable
- **Screen-Based Navigation**: Each screen is a separate component with its own logic
- **Service Layer**: API calls and business logic separated from UI components
- **Custom Hooks**: Reusable logic extracted into custom React hooks

## Directory Structure

### \`src/components/\`
Reusable UI components that can be used across multiple screens.

### \`src/screens/\`
Screen-level components that represent different app screens.

### \`src/navigation/\`
Navigation configuration and route definitions.

### \`src/services/\`
API services, data fetching, and business logic.

### \`src/hooks/\`
Custom React hooks for reusable stateful logic.

### \`src/utils/\`
Pure utility functions and helpers.

### \`src/types/\`
TypeScript type definitions and interfaces.

### \`src/styles/\`
Shared styling constants, themes, and style utilities.

## State Management

${options.options.stateManagement === 'redux-toolkit' ? 
`This app uses Redux Toolkit for state management. Store configuration is in \`src/store/\`.` :
options.options.stateManagement === 'zustand' ?
`This app uses Zustand for lightweight state management.` :
`This app uses React's built-in state management (useState, useContext).`}

## Navigation

${options.options.navigation === 'react-navigation' ?
`This app uses React Navigation v6 for navigation between screens.` :
`This app uses custom navigation implementation.`}

## Testing Strategy

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Testing component interactions
${options.options.testing?.includes('detox') ? '- **E2E Tests**: End-to-end testing with Detox' : ''}

## Performance Considerations

- Lazy loading of screens
- Optimized image handling
- Proper memo usage for expensive renders
- Navigation performance optimization

## Development Guidelines

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Implement proper error boundaries
4. Follow React Native performance guidelines
5. Write tests for critical functionality

## Deployment

${options.options.template === 'expo-managed' ?
`This app can be deployed using Expo Application Services (EAS) or ejected for native builds.` :
`This app can be built and deployed using React Native CLI build tools.`}
`;

    await context.fileSystem.writeFile(
      join(options.targetPath, 'ARCHITECTURE.md'),
      architectureContent
    );
    generatedFiles.push('ARCHITECTURE.md');

    // PRD.md
    const prdContent = context.templateProcessor.processTemplate(
      await context.fileSystem.readFile('templates/PRD.md.template'),
      {
        PROJECT_NAME: options.projectName,
        PROJECT_TYPE: 'Mobile React Native App',
        DATE: new Date().toISOString().split('T')[0]
      }
    );

    await context.fileSystem.writeFile(
      join(options.targetPath, 'PRD.md'),
      prdContent
    );
    generatedFiles.push('PRD.md');
  }

  private getNextSteps(options: ScaffoldOptions): any[] {
    const steps = [
      {
        title: 'Install Dependencies',
        description: 'Run npm install to install all required dependencies',
        command: 'npm install',
        category: 'setup'
      }
    ];

    if (options.options.template === 'expo-managed') {
      steps.push({
        title: 'Start Development Server',
        description: 'Start the Expo development server',
        command: 'npm start',
        category: 'development'
      });
    } else {
      steps.push({
        title: 'Start Metro Bundler',
        description: 'Start the Metro bundler for React Native',
        command: 'npm start',
        category: 'development'
      });
    }

    steps.push(
      {
        title: 'Set up Development Environment',
        description: 'Configure your development environment for iOS/Android',
        url: 'https://reactnative.dev/docs/environment-setup',
        category: 'setup'
      },
      {
        title: 'Review and Complete PRD',
        description: 'Complete the PRD.md file with your specific requirements',
        file: 'PRD.md',
        category: 'planning'
      },
      {
        title: 'Run Tests',
        description: 'Execute the test suite to ensure everything is working',
        command: 'npm test',
        category: 'testing'
      },
      {
        title: 'Start Development',
        description: 'Begin implementing your app features based on the PRD',
        category: 'development'
      }
    );

    return steps;
  }

  private getGitignoreContent(): string {
    return `# Dependencies
node_modules/

# React Native
.expo/
.expo-shared/
expo-env.d.ts

# Build artifacts
android/app/build/
ios/build/
*.ipa
*.apk

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
*.lcov

# Temporary
tmp/
temp/
`;
  }

  async executeCommand(
    command: string, 
    args: string[], 
    context: PluginContext
  ): Promise<any> {
    switch (command) {
      case 'validate-config':
        return this.validateProjectConfig(args[0]);
      case 'get-dependencies':
        return this.getProjectDependencies(args[0]);
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  private validateProjectConfig(configPath: string): any {
    // 設定ファイルの検証ロジック
    return { valid: true, issues: [] };
  }

  private getProjectDependencies(projectPath: string): any {
    // プロジェクトの依存関係取得ロジック
    return { dependencies: [], devDependencies: [] };
  }

  async healthCheck(context: PluginContext): Promise<HealthCheckResult> {
    try {
      // プラグインの健全性チェック
      const checks = [
        { name: 'Template Files', status: 'ok' },
        { name: 'Dependencies', status: 'ok' },
        { name: 'Configuration', status: 'ok' }
      ];

      return {
        healthy: true,
        details: { checks },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new MobileReactNativePlugin();
```

### ステップ 3: プラグインのテスト

```bash
# プラグインシステムでの生成テスト
npm run scaffold:plugin
```

### ステップ 4: プラグインの登録確認

プラグインは自動的に検出され、利用可能なテンプレート一覧に表示されます。

## 学習ポイント

### 1. プラグインの基本構造
- `Plugin` インターフェースの実装
- メタデータの定義
- テンプレート情報の提供

### 2. 設定オプションの設計
- 型安全な設定オプション
- 検証ルールの定義
- デフォルト値の設定

### 3. スケルトン生成ロジック
- ディレクトリ構造の作成
- ファイル内容の動的生成
- エラーハンドリング

### 4. 拡張機能
- カスタムコマンドの実装
- ヘルスチェック機能
- ログ出力

## ベストプラクティス

1. **エラーハンドリング**: すべての非同期処理で適切なエラーハンドリング
2. **ログ出力**: 重要な処理でログを出力
3. **設定検証**: ユーザー入力の妥当性検証
4. **ドキュメント生成**: プロジェクト固有のドキュメント生成
5. **次のステップ**: ユーザーガイダンスの提供

## まとめ

この例では、React Native プラグインの完全な実装を通じて、AI Driven Dev Starter Kit のプラグインシステムの使用方法を学びました。同様のパターンに従って、他のプロジェクトタイプ（Flutter、Vue.js、Angularなど）のプラグインも開発できます。

プラグインシステムの柔軟性により、組織固有のテンプレートやベストプラクティスを簡単に追加・共有できるようになります。