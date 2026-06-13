import { dataService, StoredComic } from './dataService';
import { mockComics } from '../data/comics';

class InitDataService {
  private initialized = false;

  initializeData(): void {
    if (this.initialized) return;
    
    const existingComics = dataService.getAllComics();
    
    if (existingComics.length === 0) {
      console.log('[InitData] No existing data, loading mock data...');
      mockComics.forEach(comic => {
        const storedComic: StoredComic = {
          ...comic,
          lendingHistory: comic.lendingInfo ? [{
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            borrower: comic.lendingInfo.borrower,
            lendDate: comic.lendingInfo.lendDate,
            dueDate: comic.lendingInfo.dueDate,
            isActive: !comic.lendingInfo.returned,
            returnDate: comic.lendingInfo.returned ? comic.lendingInfo.dueDate : undefined
          }] : []
        };
        dataService.saveComic(storedComic);
      });
    }
    
    this.initialized = true;
    console.log('[InitData] Data initialized successfully');
  }

  clearAllData(): void {
    const emptyComics: StoredComic[] = [];
    dataService.setStorageData('comics_collection', emptyComics);
    this.initialized = false;
    console.log('[InitData] All data cleared');
  }
}

export const initDataService = new InitDataService();
