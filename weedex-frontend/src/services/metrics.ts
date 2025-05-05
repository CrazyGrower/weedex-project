export class MetricsService {
  private static instance: MetricsService;
  private metrics: Map<string, number> = new Map();

  private constructor() {
    this.initializePerformanceMetrics();
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  private initializePerformanceMetrics() {
    if (window.performance) {
      const timing = window.performance.timing;
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      this.metrics.set('dnsLookup', timing.domainLookupEnd - timing.domainLookupStart);
      this.metrics.set('tcpConnection', timing.connectEnd - timing.connectStart);
      this.metrics.set('serverResponse', timing.responseEnd - timing.requestStart);
      this.metrics.set('domProcessing', timing.domComplete - timing.domLoading);
      this.metrics.set('pageLoad', timing.loadEventEnd - timing.navigationStart);

      // Utiliser les métriques de performance modernes
      const paintEntries = window.performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      const lcp = window.performance.getEntriesByType('largest-contentful-paint')[0];

      if (fcp) {
        this.metrics.set('firstContentfulPaint', fcp.startTime);
      }
      if (lcp) {
        this.metrics.set('largestContentfulPaint', lcp.startTime);
      }
    }
  }

  public logMetric(name: string, value: number) {
    this.metrics.set(name, value);
    this.sendMetrics();
  }

  private sendMetrics() {
    // Envoyer les métriques à votre backend ou service d'analytics
    console.log('Metrics:', Object.fromEntries(this.metrics));
  }

  public getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
} 