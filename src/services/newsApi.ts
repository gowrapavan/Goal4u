// News API Configuration and Service Layer
const NEWS_API_KEY = import.meta.env.VITE_NEWSAPI_KEY;
const NEWS_BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface NewsSource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}

class NewsAPI {
  private isConfigured(): boolean {
    return !!(
      NEWS_API_KEY &&
      NEWS_API_KEY !== 'your_newsapi_key_here' &&
      NEWS_API_KEY.trim() !== ''
    );
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    // Check if API key is available
    if (!this.isConfigured()) {
      throw new Error(
        'NewsAPI key is not configured. Please add your API key to the .env file as VITE_NEWSAPI_KEY=your_actual_key'
      );
    }

    const url = new URL(`${NEWS_BASE_URL}${endpoint}`);

    // Add API key and default parameters
    url.searchParams.append('apiKey', NEWS_API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 426) {
          throw new Error(
            'NewsAPI key is invalid or expired. Please check your API key at https://newsapi.org/account'
          );
        }
        if (response.status === 401) {
          throw new Error(
            'NewsAPI key is unauthorized. Please verify your API key.'
          );
        }
        if (response.status === 429) {
          throw new Error(
            'NewsAPI rate limit exceeded. Please try again later or upgrade your plan.'
          );
        }
        throw new Error(
          `NewsAPI Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(data.message || 'NewsAPI request failed');
      }

      return data;
    } catch (error) {
      console.error('NewsAPI Request failed:', error);
      throw error;
    }
  }

  async getSportsNews(
    page: number = 1,
    pageSize: number = 20
  ): Promise<NewsResponse> {
    if (!this.isConfigured()) {
      throw new Error(
        'NewsAPI key is not configured. Please add your API key to the .env file as VITE_NEWSAPI_KEY=your_actual_key'
      );
    }

    // Use multiple approaches to get comprehensive sports coverage
    const sportsQueries = [
      'football OR soccer',
      '"Premier League" OR "Champions League" OR "World Cup"',
      'Messi OR Ronaldo OR Mbappé OR Haaland',
      '"Manchester United" OR "Real Madrid" OR Barcelona OR Liverpool',
      'FIFA OR UEFA OR "La Liga" OR "Serie A" OR Bundesliga',
    ];

    // Rotate through different queries based on page to get variety
    const queryIndex = (page - 1) % sportsQueries.length;
    const query = sportsQueries[queryIndex];

    try {
      // Try /everything endpoint first for comprehensive coverage
      return await this.request<NewsResponse>('/everything', {
        q: query,
        searchIn: 'title,description',
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: pageSize.toString(),
        page: Math.ceil(page / sportsQueries.length).toString(),
        from: this.getDateDaysAgo(30), // Last 30 days
        to: this.getTodayDate(),
      });
    } catch (error) {
      console.warn('Everything endpoint failed, trying top-headlines:', error);

      // Fallback to top-headlines with sports category
      try {
        return await this.request<NewsResponse>('/top-headlines', {
          category: 'sports',
          language: 'en',
          pageSize: pageSize.toString(),
          page: page.toString(),
        });
      } catch (headlinesError) {
        console.error('Both endpoints failed:', headlinesError);
        throw new Error(
          'Unable to fetch sports news. Please check your API key and try again.'
        );
      }
    }
  }

  async getTopHeadlines(
    category: string = 'sports',
    country: string = 'us',
    pageSize: number = 10
  ): Promise<NewsResponse> {
    if (!this.isConfigured()) {
      throw new Error('NewsAPI key is not configured');
    }

    return this.request<NewsResponse>('/top-headlines', {
      category,
      country,
      pageSize: pageSize.toString(),
    });
  }

  async searchNews(
    query: string,
    sortBy: string = 'publishedAt',
    page: number = 1,
    pageSize: number = 20
  ): Promise<NewsResponse> {
    if (!this.isConfigured()) {
      throw new Error('NewsAPI key is not configured');
    }

    return this.request<NewsResponse>('/everything', {
      q: query,
      searchIn: 'title,description',
      sortBy,
      language: 'en',
      pageSize: pageSize.toString(),
      page: page.toString(),
      from: this.getDateDaysAgo(30),
    });
  }

  async getRelatedNews(
    keywords: string,
    excludeTitle: string,
    limit: number = 4
  ): Promise<NewsArticle[]> {
    if (!this.isConfigured()) {
      throw new Error('NewsAPI key is not configured');
    }

    try {
      // Clean and enhance keywords for better search
      const cleanKeywords = this.enhanceKeywords(keywords);

      const response = await this.request<NewsResponse>('/everything', {
        q: cleanKeywords,
        searchIn: 'title,description',
        language: 'en',
        sortBy: 'relevancy',
        pageSize: '50', // Get more to filter out duplicates
        from: this.getDateDaysAgo(60), // Wider date range for related content
      });

      // Filter out the current article and return limited results
      return response.articles
        .filter(
          (article) =>
            article.title !== excludeTitle &&
            article.title &&
            article.description &&
            article.urlToImage // Prefer articles with images
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch related news:', error);
      throw error;
    }
  }

  async getNewsSources(
    category: string = 'sports',
    language: string = 'en'
  ): Promise<NewsSource[]> {
    if (!this.isConfigured()) {
      throw new Error('NewsAPI key is not configured');
    }

    const response = await this.request<{ sources: NewsSource[] }>(
      '/top-headlines/sources',
      {
        category,
        language,
      }
    );

    return response.sources;
  }

  // Enhanced keyword processing for better search results
  private enhanceKeywords(keywords: string): string {
    const sportsTerms = [
      'football',
      'soccer',
      'Premier League',
      'Champions League',
      'FIFA',
      'UEFA',
    ];
    const keywordArray = keywords
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 2);

    // Add sports context if not present
    const hasSportsContext = keywordArray.some((word) =>
      sportsTerms.some(
        (term) =>
          term.toLowerCase().includes(word) || word.includes(term.toLowerCase())
      )
    );

    if (!hasSportsContext && keywordArray.length > 0) {
      keywordArray.push('football', 'soccer');
    }

    return keywordArray.slice(0, 5).join(' OR ');
  }

  // Helper method to extract keywords from title for related news
  extractKeywords(title: string): string {
    const stopWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'are',
      'was',
      'were',
      'vs',
      'against',
      'will',
      'has',
      'have',
      'this',
      'that',
      'from',
      'they',
      'their',
      'after',
      'before',
    ];

    const words = title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(' ')
      .filter((word) => word.length > 3 && !stopWords.includes(word))
      .slice(0, 4);

    return words.join(' ');
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Helper to get date N days ago in ISO format
  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  // Helper to get today's date in ISO format
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Validate article quality
  isValidArticle(article: NewsArticle): boolean {
    return !!(
      article.title &&
      article.description &&
      article.url &&
      article.source?.name &&
      article.publishedAt &&
      !article.title.toLowerCase().includes('[removed]') &&
      !article.description?.toLowerCase().includes('[removed]')
    );
  }

  // Filter and clean articles
  filterArticles(articles: NewsArticle[]): NewsArticle[] {
    return articles
      .filter(this.isValidArticle)
      .filter(
        (article, index, self) =>
          // Remove duplicates based on title similarity
          index ===
          self.findIndex(
            (a) =>
              a.title.toLowerCase().trim() ===
              article.title.toLowerCase().trim()
          )
      )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }
}

export const newsAPI = new NewsAPI();
