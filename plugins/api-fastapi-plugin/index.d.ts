/**
 * API FastAPI プラグイン
 *
 * FastAPI を使用した REST API プロジェクトのテンプレートを提供するプラグイン
 */
import { Plugin, PluginMetadata, ProjectTemplate, ScaffoldOptions, ScaffoldResult, PluginContext } from '../../src/plugin/types.js';
/**
 * API FastAPI プラグイン実装
 */
declare class ApiFastapiPlugin implements Plugin {
    readonly metadata: PluginMetadata;
    private context;
    private templatePath;
    initialize(context: PluginContext): Promise<void>;
    cleanup(): Promise<void>;
    getProjectTemplates(): ProjectTemplate[];
    generateScaffold(template: ProjectTemplate, options: ScaffoldOptions, context: PluginContext): Promise<ScaffoldResult>;
    private prepareTemplateVariables;
    private collectGeneratedFiles;
    private applyProjectSpecificConfig;
    private generateRequirementsTxt;
    private generatePyprojectToml;
    private generateConfigFiles;
    private generateDockerFiles;
    private prepareNextSteps;
    healthCheck(context: PluginContext): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, any>;
    }>;
}
declare const _default: ApiFastapiPlugin;
export default _default;
//# sourceMappingURL=index.d.ts.map