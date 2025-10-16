import { environment } from '../../config/environment';
import logger from '../../utils/logger';

export interface QueryMetrics {
  query: string;
  executionTime: number;
  rowsReturned: number;
  timestamp: Date;
  parameters?: any[];
}

export interface DatabaseStats {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: number;
  cacheHits: number;
  cacheMisses: number;
}

export class QueryOptimizer {
  private static metrics: QueryMetrics[] = [];
  private static stats: DatabaseStats = {
    totalQueries: 0,
    averageExecutionTime: 0,
    slowQueries: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  private static readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private static readonly MAX_METRICS_HISTORY = 1000;

  /**
   * تسجيل استعلام مع المقاييس
   */
  static logQuery(
    query: string, 
    executionTime: number, 
    rowsReturned: number, 
    parameters?: any[]
  ): void {
    const metric: QueryMetrics = {
      query: this.sanitizeQuery(query),
      executionTime,
      rowsReturned,
      timestamp: new Date(),
      parameters
    };

    this.metrics.push(metric);
    this.updateStats(metric);

    // الاحتفاظ بآخر 1000 استعلام فقط
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY);
    }

    // تسجيل الاستعلامات البطيئة
    if (executionTime > this.SLOW_QUERY_THRESHOLD) {
      logger.warn('Slow query detected', {
        query: metric.query,
        executionTime,
        rowsReturned,
        parameters
      });
    }

    // تسجيل مفصل في وضع التطوير
    if (environment.isDevelopment()) {
      logger.debug('Query executed', {
        query: metric.query,
        executionTime: `${executionTime}ms`,
        rowsReturned,
        parameters
      });
    }
  }

  /**
   * تحديث الإحصائيات
   */
  private static updateStats(metric: QueryMetrics): void {
    this.stats.totalQueries++;
    
    // حساب متوسط وقت التنفيذ
    const totalTime = this.stats.averageExecutionTime * (this.stats.totalQueries - 1) + metric.executionTime;
    this.stats.averageExecutionTime = totalTime / this.stats.totalQueries;
    
    // حساب الاستعلامات البطيئة
    if (metric.executionTime > this.SLOW_QUERY_THRESHOLD) {
      this.stats.slowQueries++;
    }
  }

  /**
   * تنظيف الاستعلام من المعلومات الحساسة
   */
  private static sanitizeQuery(query: string): string {
    return query
      .replace(/\$\d+/g, '?') // استبدال المعاملات
      .replace(/'[^']*'/g, "'?'") // استبدال النصوص
      .replace(/\b\d+\b/g, '?') // استبدال الأرقام
      .trim();
  }

  /**
   * تحليل الاستعلامات البطيئة
   */
  static analyzeSlowQueries(): QueryMetrics[] {
    return this.metrics
      .filter(m => m.executionTime > this.SLOW_QUERY_THRESHOLD)
      .sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * تحليل الاستعلامات الأكثر تكراراً
   */
  static analyzeFrequentQueries(): Array<{ query: string; count: number; avgTime: number }> {
    const queryMap = new Map<string, { count: number; totalTime: number }>();

    this.metrics.forEach(metric => {
      const existing = queryMap.get(metric.query);
      if (existing) {
        existing.count++;
        existing.totalTime += metric.executionTime;
      } else {
        queryMap.set(metric.query, {
          count: 1,
          totalTime: metric.executionTime
        });
      }
    });

    return Array.from(queryMap.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgTime: data.totalTime / data.count
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * الحصول على إحصائيات قاعدة البيانات
   */
  static getStats(): DatabaseStats {
    return { ...this.stats };
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  static resetStats(): void {
    this.metrics = [];
    this.stats = {
      totalQueries: 0,
      averageExecutionTime: 0,
      slowQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * تحسين استعلامات الشخصيات
   */
  static optimizeCharacterQueries() {
    return {
      // استعلام محسن للحصول على الشخصيات مع العلاقات
      getCharactersWithRelationships: `
        SELECT 
          c.*,
          r.id as relationship_id,
          r.target,
          r.type,
          r.nature,
          r.strength
        FROM characters c
        LEFT JOIN relationships r ON c.id = r.source
        WHERE c.id = ANY($1)
        ORDER BY c.id, r.strength DESC
      `,
      
      // استعلام محسن للحصول على الشخصيات النشطة فقط
      getActiveCharacters: `
        SELECT c.*
        FROM characters c
        WHERE c.id IN (
          SELECT DISTINCT source FROM relationships
          UNION
          SELECT DISTINCT target FROM relationships
        )
        AND c.metadata->>'isActive' = 'true'
      `,
      
      // استعلام محسن لإحصائيات الشخصيات
      getCharacterStats: `
        SELECT 
          c.id,
          c.name,
          COUNT(r.id) as relationship_count,
          AVG(r.strength) as avg_relationship_strength,
          COUNT(cf.conflict_id) as conflict_count
        FROM characters c
        LEFT JOIN relationships r ON c.id = r.source OR c.id = r.target
        LEFT JOIN conflict_participants cf ON c.id = cf.character_id
        GROUP BY c.id, c.name
        ORDER BY relationship_count DESC
      `
    };
  }

  /**
   * تحسين استعلامات الصراعات
   */
  static optimizeConflictQueries() {
    return {
      // استعلام محسن للحصول على الصراعات مع المشاركين
      getConflictsWithParticipants: `
        SELECT 
          c.*,
          cp.character_id,
          cp.role,
          ch.name as character_name
        FROM conflicts c
        LEFT JOIN conflict_participants cp ON c.id = cp.conflict_id
        LEFT JOIN characters ch ON cp.character_id = ch.id
        WHERE c.id = ANY($1)
        ORDER BY c.id, cp.role
      `,
      
      // استعلام محسن للصراعات النشطة
      getActiveConflicts: `
        SELECT c.*
        FROM conflicts c
        WHERE c.current_stage != 'resolved'
        AND c.updated_at > NOW() - INTERVAL '7 days'
        ORDER BY c.updated_at DESC
      `,
      
      // استعلام محسن لإحصائيات الصراعات
      getConflictStats: `
        SELECT 
          c.current_stage,
          COUNT(*) as count,
          AVG(c.intensity) as avg_intensity,
          AVG(c.complexity) as avg_complexity
        FROM conflicts c
        GROUP BY c.current_stage
        ORDER BY count DESC
      `
    };
  }

  /**
   * تحسين استعلامات الشبكة
   */
  static optimizeNetworkQueries() {
    return {
      // استعلام محسن للحصول على الشبكة الكاملة
      getFullNetwork: `
        WITH character_relationships AS (
          SELECT 
            c.id as character_id,
            c.name as character_name,
            c.description,
            r.id as relationship_id,
            r.target,
            r.type,
            r.nature,
            r.strength,
            CASE 
              WHEN r.source = c.id THEN 'outgoing'
              ELSE 'incoming'
            END as direction
          FROM characters c
          LEFT JOIN relationships r ON c.id = r.source OR c.id = r.target
        ),
        conflict_network AS (
          SELECT 
            c.id as character_id,
            c.name as character_name,
            cf.id as conflict_id,
            cf.title as conflict_title,
            cf.current_stage,
            cp.role
          FROM characters c
          LEFT JOIN conflict_participants cp ON c.id = cp.character_id
          LEFT JOIN conflicts cf ON cp.conflict_id = cf.id
        )
        SELECT 
          cr.*,
          cn.conflict_id,
          cn.conflict_title,
          cn.current_stage,
          cn.role
        FROM character_relationships cr
        LEFT JOIN conflict_network cn ON cr.character_id = cn.character_id
        ORDER BY cr.character_id, cr.relationship_id
      `,
      
      // استعلام محسن لحساب مقاييس الشبكة
      getNetworkMetrics: `
        WITH network_stats AS (
          SELECT 
            COUNT(DISTINCT c.id) as total_characters,
            COUNT(DISTINCT r.id) as total_relationships,
            COUNT(DISTINCT cf.id) as total_conflicts,
            AVG(r.strength) as avg_relationship_strength,
            COUNT(DISTINCT CASE WHEN r.nature = 'POSITIVE' THEN r.id END) as positive_relationships,
            COUNT(DISTINCT CASE WHEN r.nature = 'NEGATIVE' THEN r.id END) as negative_relationships
          FROM characters c
          LEFT JOIN relationships r ON c.id = r.source OR c.id = r.target
          LEFT JOIN conflict_participants cp ON c.id = cp.character_id
          LEFT JOIN conflicts cf ON cp.conflict_id = cf.id
        )
        SELECT 
          *,
          CASE 
            WHEN total_relationships > 0 
            THEN positive_relationships::float / total_relationships 
            ELSE 0 
          END as positive_ratio,
          CASE 
            WHEN total_relationships > 0 
            THEN negative_relationships::float / total_relationships 
            ELSE 0 
          END as negative_ratio
        FROM network_stats
      `
    };
  }

  /**
   * تحسين استعلامات البحث
   */
  static optimizeSearchQueries() {
    return {
      // استعلام محسن للبحث في النصوص
      searchInText: `
        SELECT 
          c.id,
          c.name,
          c.description,
          ts_rank(to_tsvector('arabic', c.description), plainto_tsquery('arabic', $1)) as rank
        FROM characters c
        WHERE to_tsvector('arabic', c.description) @@ plainto_tsquery('arabic', $1)
        ORDER BY rank DESC
        LIMIT $2
      `,
      
      // استعلام محسن للبحث في العلاقات
      searchRelationships: `
        SELECT 
          r.*,
          cs.name as source_name,
          ct.name as target_name
        FROM relationships r
        JOIN characters cs ON r.source = cs.id
        JOIN characters ct ON r.target = ct.id
        WHERE r.description ILIKE $1
        OR cs.name ILIKE $1
        OR ct.name ILIKE $1
        ORDER BY r.strength DESC
        LIMIT $2
      `
    };
  }

  /**
   * تحليل أداء الاستعلامات
   */
  static generatePerformanceReport(): string {
    const slowQueries = this.analyzeSlowQueries();
    const frequentQueries = this.analyzeFrequentQueries();
    const stats = this.getStats();

    let report = '=== Database Performance Report ===\n\n';
    
    report += `Total Queries: ${stats.totalQueries}\n`;
    report += `Average Execution Time: ${stats.averageExecutionTime.toFixed(2)}ms\n`;
    report += `Slow Queries: ${stats.slowQueries}\n`;
    report += `Cache Hit Rate: ${((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(2)}%\n\n`;

    if (slowQueries.length > 0) {
      report += '=== Slow Queries ===\n';
      slowQueries.slice(0, 5).forEach((query, index) => {
        report += `${index + 1}. ${query.query}\n`;
        report += `   Time: ${query.executionTime}ms, Rows: ${query.rowsReturned}\n\n`;
      });
    }

    if (frequentQueries.length > 0) {
      report += '=== Most Frequent Queries ===\n';
      frequentQueries.slice(0, 5).forEach((query, index) => {
        report += `${index + 1}. ${query.query}\n`;
        report += `   Count: ${query.count}, Avg Time: ${query.avgTime.toFixed(2)}ms\n\n`;
      });
    }

    return report;
  }
}

