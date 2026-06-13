export interface Comic {
  id: string;
  title: string;
  author: string;
  publisher: string;
  volumes: number[];
  totalVolumes: number;
  coverUrl: string;
  purchasePrice: number;
  purchaseChannel: string;
  condition: '全新' | '近乎全新' | '很好' | '好' | '一般';
  genre: string;
  isKey: boolean;
  notes: string;
  coverImage: string;
  addDate: string;
  lendingInfo?: {
    borrower: string;
    lendDate: string;
    dueDate: string;
    returned: boolean;
  };
}

export interface StatsData {
  totalComics: number;
  totalSeries: number;
  totalSpend: number;
  monthlySpend: number;
  monthlyChange: number;
  conditionDistribution: {
    condition: string;
    count: number;
  }[];
  monthlyData: {
    month: string;
    count: number;
    spend: number;
  }[];
}
