import Taro from '@tarojs/taro';

const COMICS_KEY = 'comics_collection';

export interface StoredComic {
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

class DataService {
  private getStorageData<T>(key: string, defaultValue: T): T {
    try {
      const data = Taro.getStorageSync(key);
      return data || defaultValue;
    } catch (e) {
      console.error('[DataService] Get storage error:', e);
      return defaultValue;
    }
  }

  private setStorageData<T>(key: string, data: T): boolean {
    try {
      Taro.setStorageSync(key, data);
      return true;
    } catch (e) {
      console.error('[DataService] Set storage error:', e);
      return false;
    }
  }

  getAllComics(): StoredComic[] {
    return this.getStorageData<StoredComic[]>(COMICS_KEY, []);
  }

  saveComic(comic: StoredComic): boolean {
    const comics = this.getAllComics();
    const existingIndex = comics.findIndex(c => c.id === comic.id);
    
    if (existingIndex >= 0) {
      comics[existingIndex] = comic;
    } else {
      comics.push(comic);
    }
    
    return this.setStorageData(COMICS_KEY, comics);
  }

  getComicById(id: string): StoredComic | undefined {
    const comics = this.getAllComics();
    return comics.find(c => c.id === id);
  }

  updateComicLending(id: string, lendingInfo: StoredComic['lendingInfo']): boolean {
    const comics = this.getAllComics();
    const comicIndex = comics.findIndex(c => c.id === id);
    
    if (comicIndex >= 0) {
      comics[comicIndex].lendingInfo = lendingInfo;
      return this.setStorageData(COMICS_KEY, comics);
    }
    return false;
  }

  deleteComic(id: string): boolean {
    const comics = this.getAllComics();
    const filteredComics = comics.filter(c => c.id !== id);
    return this.setStorageData(COMICS_KEY, filteredComics);
  }

  checkDuplicateTitle(title: string): StoredComic | undefined {
    const comics = this.getAllComics();
    return comics.find(c => c.title.toLowerCase() === title.toLowerCase());
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const dataService = new DataService();
