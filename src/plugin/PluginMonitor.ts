/**
 * プラグインパフォーマンス監視・最適化システム
 * 
 * プラグインの実行時パフォーマンスを監視し、
 * ボトルネックの特定と最適化提案を行います。
 */

import type { Plugin, PluginContext } from './types.js';
import { EventEmitter } from 'events';

export interface PerformanceMetrics {
  pluginId: string;
  operationId: string;
  operationType: OperationType;
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage: MemoryUsage;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

export type OperationType = 
  | 'initialize'
  | 'getTemplates'
  | 'generateScaffold'
  | 'healthCheck'
  | 'executeCommand'
  | 'cleanup';

export interface PerformanceReport {
  pluginId: string;
  reportPeriod: {
    start: string;
    end: string;
  };
  totalOperations: number;
  averageResponseTime: number;
  successRate: number;
  operationBreakdown: OperationBreakdown[];
  recommendations: PerformanceRecommendation[];
  trends: PerformanceTrend[];
}

export interface OperationBreakdown {
  operationType: OperationType;
  count: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
}

export interface PerformanceRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'memory' | 'speed' | 'reliability' | 'scalability';
  issue: string;
  recommendation: string;
  potentialImpact: string;
}

export interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'degrading' | 'stable';
  change: number;
  timeframe: string;
}

export interface MonitoringConfig {
  enableMetrics: boolean;
  sampleRate: number; // 0.0 - 1.0
  maxHistorySize: number;
  performanceThresholds: PerformanceThresholds;
  reportInterval: number; // minutes
}

export interface PerformanceThresholds {
  maxInitializationTime: number; // ms
  maxTemplateRetrievalTime: number; // ms
  maxScaffoldGenerationTime: number; // ms
  maxMemoryUsage: number; // MB
  minSuccessRate: number; // 0.0 - 1.0
}

/**
 * プラグインパフォーマンス監視器
 */
export class PluginMonitor extends EventEmitter {
  private context: PluginContext;
  private config: MonitoringConfig;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private activeOperations: Map<string, PerformanceMetrics> = new Map();

  constructor(context: PluginContext, config?: Partial<MonitoringConfig>) {
    super();
    this.context = context;
    this.config = {
      enableMetrics: true,
      sampleRate: 1.0,
      maxHistorySize: 1000,
      performanceThresholds: {
        maxInitializationTime: 5000,
        maxTemplateRetrievalTime: 1000,
        maxScaffoldGenerationTime: 30000,
        maxMemoryUsage: 500,
        minSuccessRate: 0.95
      },
      reportInterval: 60,
      ...config
    };

    // 定期レポート生成
    if (this.config.enableMetrics) {
      setInterval(() => {
        this.generatePerformanceReports();
      }, this.config.reportInterval * 60 * 1000);
    }
  }

  /**
   * 操作の開始を記録
   */
  startOperation(
    pluginId: string,
    operationType: OperationType,
    metadata?: Record<string, any>
  ): string {
    if (!this.config.enableMetrics || Math.random() > this.config.sampleRate) {
      return '';
    }

    const operationId = `${pluginId}_${operationType}_${Date.now()}_${Math.random().toString(36)}`;
    const startTime = Date.now();
    const memoryUsage = this.getMemoryUsage();

    const metric: PerformanceMetrics = {
      pluginId,
      operationId,
      operationType,
      startTime,
      endTime: 0,
      duration: 0,
      memoryUsage,
      success: false,
      metadata
    };

    this.activeOperations.set(operationId, metric);

    this.context.logger.debug('Operation started', {
      pluginId,
      operationType,
      operationId
    });

    return operationId;
  }

  /**
   * 操作の完了を記録
   */
  endOperation(
    operationId: string,
    success: boolean = true,
    error?: string
  ): void {
    if (!operationId || !this.activeOperations.has(operationId)) {
      return;
    }

    const metric = this.activeOperations.get(operationId)!;
    const endTime = Date.now();
    const endMemoryUsage = this.getMemoryUsage();

    metric.endTime = endTime;
    metric.duration = endTime - metric.startTime;
    metric.success = success;
    metric.error = error;

    // メモリ使用量の差分を計算
    metric.memoryUsage = {
      heapUsed: endMemoryUsage.heapUsed - metric.memoryUsage.heapUsed,
      heapTotal: endMemoryUsage.heapTotal - metric.memoryUsage.heapTotal,
      external: endMemoryUsage.external - metric.memoryUsage.external,
      rss: endMemoryUsage.rss - metric.memoryUsage.rss
    };

    this.activeOperations.delete(operationId);
    this.storeMetric(metric);

    // パフォーマンス閾値チェック
    this.checkPerformanceThresholds(metric);

    this.context.logger.debug('Operation completed', {
      pluginId: metric.pluginId,
      operationType: metric.operationType,
      duration: metric.duration,
      success
    });

    // イベント発火
    this.emit('operationCompleted', metric);
  }

  /**
   * メトリクスを保存
   */
  private storeMetric(metric: PerformanceMetrics): void {
    const pluginMetrics = this.metrics.get(metric.pluginId) || [];
    pluginMetrics.push(metric);

    // 履歴サイズ制限
    if (pluginMetrics.length > this.config.maxHistorySize) {
      pluginMetrics.shift();
    }

    this.metrics.set(metric.pluginId, pluginMetrics);
  }

  /**
   * パフォーマンス閾値チェック
   */
  private checkPerformanceThresholds(metric: PerformanceMetrics): void {
    const thresholds = this.config.performanceThresholds;
    const warnings: string[] = [];

    // 実行時間チェック
    switch (metric.operationType) {
      case 'initialize':
        if (metric.duration > thresholds.maxInitializationTime) {
          warnings.push(`Initialization time exceeded threshold: ${metric.duration}ms > ${thresholds.maxInitializationTime}ms`);
        }
        break;
      case 'getTemplates':
        if (metric.duration > thresholds.maxTemplateRetrievalTime) {
          warnings.push(`Template retrieval time exceeded threshold: ${metric.duration}ms > ${thresholds.maxTemplateRetrievalTime}ms`);
        }
        break;
      case 'generateScaffold':
        if (metric.duration > thresholds.maxScaffoldGenerationTime) {
          warnings.push(`Scaffold generation time exceeded threshold: ${metric.duration}ms > ${thresholds.maxScaffoldGenerationTime}ms`);
        }
        break;
    }

    // メモリ使用量チェック
    const memoryUsageMB = metric.memoryUsage.heapUsed / (1024 * 1024);
    if (memoryUsageMB > thresholds.maxMemoryUsage) {
      warnings.push(`Memory usage exceeded threshold: ${memoryUsageMB.toFixed(2)}MB > ${thresholds.maxMemoryUsage}MB`);
    }

    // 警告がある場合はログ出力とイベント発火
    if (warnings.length > 0) {
      this.context.logger.warn('Performance threshold exceeded', {
        pluginId: metric.pluginId,
        operationType: metric.operationType,
        warnings
      });

      this.emit('performanceWarning', {
        pluginId: metric.pluginId,
        metric,
        warnings
      });
    }
  }

  /**
   * メモリ使用量取得
   */
  private getMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss
    };
  }

  /**
   * プラグインのパフォーマンスレポート生成
   */
  generateReport(pluginId: string, timeframe?: { start: Date; end: Date }): PerformanceReport | null {
    const pluginMetrics = this.metrics.get(pluginId);
    if (!pluginMetrics || pluginMetrics.length === 0) {
      return null;
    }

    // 時間範囲フィルタリング
    let filteredMetrics = pluginMetrics;
    if (timeframe) {
      filteredMetrics = pluginMetrics.filter(m => 
        m.startTime >= timeframe.start.getTime() && 
        m.startTime <= timeframe.end.getTime()
      );
    }

    if (filteredMetrics.length === 0) {
      return null;
    }

    const report: PerformanceReport = {
      pluginId,
      reportPeriod: {
        start: new Date(Math.min(...filteredMetrics.map(m => m.startTime))).toISOString(),
        end: new Date(Math.max(...filteredMetrics.map(m => m.endTime))).toISOString()
      },
      totalOperations: filteredMetrics.length,
      averageResponseTime: this.calculateAverageResponseTime(filteredMetrics),
      successRate: this.calculateSuccessRate(filteredMetrics),
      operationBreakdown: this.generateOperationBreakdown(filteredMetrics),
      recommendations: this.generateRecommendations(filteredMetrics),
      trends: this.calculateTrends(pluginId, filteredMetrics)
    };

    return report;
  }

  /**
   * 平均応答時間計算
   */
  private calculateAverageResponseTime(metrics: PerformanceMetrics[]): number {
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / metrics.length;
  }

  /**
   * 成功率計算
   */
  private calculateSuccessRate(metrics: PerformanceMetrics[]): number {
    const successCount = metrics.filter(m => m.success).length;
    return successCount / metrics.length;
  }

  /**
   * 操作別パフォーマンス分析
   */
  private generateOperationBreakdown(metrics: PerformanceMetrics[]): OperationBreakdown[] {
    const operationGroups = new Map<OperationType, PerformanceMetrics[]>();

    // 操作タイプ別にグループ化
    for (const metric of metrics) {
      const group = operationGroups.get(metric.operationType) || [];
      group.push(metric);
      operationGroups.set(metric.operationType, group);
    }

    // 各操作タイプの統計計算
    return Array.from(operationGroups.entries()).map(([operationType, operationMetrics]) => {
      const durations = operationMetrics.map(m => m.duration);
      const successCount = operationMetrics.filter(m => m.success).length;

      return {
        operationType,
        count: operationMetrics.length,
        averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        successRate: successCount / operationMetrics.length
      };
    });
  }

  /**
   * パフォーマンス改善推奨事項生成
   */
  private generateRecommendations(metrics: PerformanceMetrics[]): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    const thresholds = this.config.performanceThresholds;

    // 実行時間分析
    const slowOperations = metrics.filter(m => {
      switch (m.operationType) {
        case 'initialize':
          return m.duration > thresholds.maxInitializationTime;
        case 'getTemplates':
          return m.duration > thresholds.maxTemplateRetrievalTime;
        case 'generateScaffold':
          return m.duration > thresholds.maxScaffoldGenerationTime;
        default:
          return false;
      }
    });

    if (slowOperations.length > 0) {
      const slowRatio = slowOperations.length / metrics.length;
      recommendations.push({
        priority: slowRatio > 0.5 ? 'high' : 'medium',
        category: 'speed',
        issue: `${(slowRatio * 100).toFixed(1)}% of operations exceed performance thresholds`,
        recommendation: 'Optimize slow operations by caching, reducing I/O, or implementing lazy loading',
        potentialImpact: 'Improved user experience and reduced resource consumption'
      });
    }

    // メモリ使用量分析
    const highMemoryOperations = metrics.filter(m => 
      (m.memoryUsage.heapUsed / (1024 * 1024)) > thresholds.maxMemoryUsage
    );

    if (highMemoryOperations.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'memory',
        issue: `${highMemoryOperations.length} operations exceeded memory usage threshold`,
        recommendation: 'Review memory allocation patterns and implement proper cleanup',
        potentialImpact: 'Reduced memory footprint and better scalability'
      });
    }

    // 成功率分析
    const successRate = this.calculateSuccessRate(metrics);
    if (successRate < thresholds.minSuccessRate) {
      recommendations.push({
        priority: 'high',
        category: 'reliability',
        issue: `Success rate (${(successRate * 100).toFixed(1)}%) below threshold`,
        recommendation: 'Improve error handling and add input validation',
        potentialImpact: 'Increased plugin reliability and user confidence'
      });
    }

    // 操作頻度分析
    const operationCounts = new Map<OperationType, number>();
    metrics.forEach(m => {
      operationCounts.set(m.operationType, (operationCounts.get(m.operationType) || 0) + 1);
    });

    const scaffoldOperations = operationCounts.get('generateScaffold') || 0;
    const templateOperations = operationCounts.get('getTemplates') || 0;

    if (templateOperations > scaffoldOperations * 10) {
      recommendations.push({
        priority: 'low',
        category: 'scalability',
        issue: 'High frequency of template retrieval compared to scaffold generation',
        recommendation: 'Implement template caching to reduce redundant operations',
        potentialImpact: 'Reduced API calls and improved performance'
      });
    }

    return recommendations;
  }

  /**
   * パフォーマンストレンド計算
   */
  private calculateTrends(pluginId: string, metrics: PerformanceMetrics[]): PerformanceTrend[] {
    const trends: PerformanceTrend[] = [];

    if (metrics.length < 10) {
      return trends; // データが少ない場合はトレンド分析をスキップ
    }

    // 最新50%と古い50%を比較
    const midPoint = Math.floor(metrics.length / 2);
    const olderMetrics = metrics.slice(0, midPoint);
    const newerMetrics = metrics.slice(midPoint);

    // 平均実行時間のトレンド
    const olderAvgTime = this.calculateAverageResponseTime(olderMetrics);
    const newerAvgTime = this.calculateAverageResponseTime(newerMetrics);
    const timeChange = ((newerAvgTime - olderAvgTime) / olderAvgTime) * 100;

    trends.push({
      metric: 'Average Response Time',
      direction: timeChange > 5 ? 'degrading' : timeChange < -5 ? 'improving' : 'stable',
      change: timeChange,
      timeframe: 'Recent vs. Earlier Period'
    });

    // 成功率のトレンド
    const olderSuccessRate = this.calculateSuccessRate(olderMetrics);
    const newerSuccessRate = this.calculateSuccessRate(newerMetrics);
    const successRateChange = ((newerSuccessRate - olderSuccessRate) / olderSuccessRate) * 100;

    trends.push({
      metric: 'Success Rate',
      direction: successRateChange > 2 ? 'improving' : successRateChange < -2 ? 'degrading' : 'stable',
      change: successRateChange,
      timeframe: 'Recent vs. Earlier Period'
    });

    return trends;
  }

  /**
   * 定期パフォーマンスレポート生成
   */
  private generatePerformanceReports(): void {
    for (const pluginId of Array.from(this.metrics.keys())) {
      const report = this.generateReport(pluginId);
      if (report) {
        this.context.logger.info('Performance report generated', {
          pluginId,
          totalOperations: report.totalOperations,
          averageResponseTime: report.averageResponseTime,
          successRate: report.successRate,
          recommendationCount: report.recommendations.length
        });

        this.emit('performanceReport', report);
      }
    }
  }

  /**
   * プラグインメトリクスクリア
   */
  clearMetrics(pluginId?: string): void {
    if (pluginId) {
      this.metrics.delete(pluginId);
    } else {
      this.metrics.clear();
    }
  }

  /**
   * 設定更新
   */
  updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 現在のメトリクス統計取得
   */
  getMetricsStats(): { totalPlugins: number; totalOperations: number; activeOperations: number } {
    const totalPlugins = this.metrics.size;
    const totalOperations = Array.from(this.metrics.values()).reduce(
      (sum, metrics) => sum + metrics.length, 0
    );
    const activeOperations = this.activeOperations.size;

    return { totalPlugins, totalOperations, activeOperations };
  }
}

/**
 * プラグインパフォーマンス監視デコレータ
 */
export function monitorPerformance(monitor: PluginMonitor) {
  return function <T extends Plugin>(plugin: T): T {
    const originalInitialize = plugin.initialize.bind(plugin);
    const originalGetTemplates = plugin.getProjectTemplates.bind(plugin);
    const originalGenerateScaffold = plugin.generateScaffold.bind(plugin);

    plugin.initialize = async function(context: PluginContext) {
      const operationId = monitor.startOperation(plugin.metadata.id, 'initialize');
      try {
        const result = await originalInitialize(context);
        monitor.endOperation(operationId, true);
        return result;
      } catch (error) {
        monitor.endOperation(operationId, false, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    };

    plugin.getProjectTemplates = function() {
      const operationId = monitor.startOperation(plugin.metadata.id, 'getTemplates');
      try {
        const result = originalGetTemplates();
        monitor.endOperation(operationId, true);
        return result;
      } catch (error) {
        monitor.endOperation(operationId, false, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    };

    plugin.generateScaffold = async function(template, options, context) {
      const operationId = monitor.startOperation(plugin.metadata.id, 'generateScaffold', {
        templateId: template.id,
        projectName: options.projectName
      });
      try {
        const result = await originalGenerateScaffold(template, options, context);
        monitor.endOperation(operationId, result.success);
        return result;
      } catch (error) {
        monitor.endOperation(operationId, false, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    };

    return plugin;
  };
}