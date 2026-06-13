import Taro from '@tarojs/taro';

const COMICS_KEY = 'comics_collection';

export interface LendingRecord {
  id: string;
  borrower: string;
  lendDate: string;
  dueDate: string;
  returnDate?: string;
  notes?: string;
  isActive: boolean;
}

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
  lendingHistory: LendingRecord[];
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

  addLendingRecord(comicId: string, record: Omit<LendingRecord, 'id'>): boolean {
    const comics = this.getAllComics();
    const comicIndex = comics.findIndex(c => c.id === comicId);
    
    if (comicIndex >= 0) {
      const newRecord: LendingRecord = {
        ...record,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2)
      };
      
      if (!comics[comicIndex].lendingHistory) {
        comics[comicIndex].lendingHistory = [];
      }
      
      comics[comicIndex].lendingHistory.push(newRecord);
      return this.setStorageData(COMICS_KEY, comics);
    }
    return false;
  }

  returnLendingRecord(comicId: string, recordId: string, returnDate: string, notes?: string): boolean {
    const comics = this.getAllComics();
    const comicIndex = comics.findIndex(c => c.id === comicId);
    
    if (comicIndex >= 0 && comics[comicIndex].lendingHistory) {
      const recordIndex = comics[comicIndex].lendingHistory.findIndex(r => r.id === recordId);
      
      if (recordIndex >= 0) {
        comics[comicIndex].lendingHistory[recordIndex].isActive = false;
        comics[comicIndex].lendingHistory[recordIndex].returnDate = returnDate;
        if (notes) {
          comics[comicIndex].lendingHistory[recordIndex].notes = notes;
        }
        return this.setStorageData(COMICS_KEY, comics);
      }
    }
    return false;
  }

  updateComicPrice(comicId: string, newPrice: number): boolean {
    const comics = this.getAllComics();
    const comicIndex = comics.findIndex(c => c.id === comicId);
    
    if (comicIndex >= 0) {
      comics[comicIndex].purchasePrice = newPrice;
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

  getComicsByMonth(year: number, month: number): StoredComic[] {
    const allComics = this.getAllComics();
    return allComics.filter(comic => {
      const addDate = new Date(comic.addDate);
      return addDate.getFullYear() === year && addDate.getMonth() + 1 === month;
    });
  }

  getComicsByYear(year: number): StoredComic[] {
    const allComics = this.getAllComics();
    return allComics.filter(comic => {
      const addDate = new Date(comic.addDate);
      return addDate.getFullYear() === year;
    });
  }

  getAllLendingRecords(): { comic: StoredComic; record: LendingRecord }[] {
    const allComics = this.getAllComics();
    const records: { comic: StoredComic; record: LendingRecord }[] = [];
    
    allComics.forEach(comic => {
      if (comic.lendingHistory && comic.lendingHistory.length > 0) {
        comic.lendingHistory.forEach(record => {
          records.push({ comic, record });
        });
      }
    });
    
    return records;
  }

  getActiveLendingRecords(): { comic: StoredComic; record: LendingRecord }[] {
    const allComics = this.getAllComics();
    const records: { comic: StoredComic; record: LendingRecord }[] = [];
    
    allComics.forEach(comic => {
      if (comic.lendingHistory && comic.lendingHistory.length > 0) {
        comic.lendingHistory
          .filter(record => record.isActive)
          .forEach(record => {
            records.push({ comic, record });
          });
      }
    });
    
    return records;
  }
}

export const dataService = new DataService();
