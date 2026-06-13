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
        dataService.saveComic(comic as StoredComic);
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
