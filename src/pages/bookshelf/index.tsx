import React, { useState, useEffect } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { dataService, StoredComic } from '../../services/dataService';

const BookshelfPage: React.FC = () => {
  const [comics, setComics] = useState<StoredComic[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('全部');
  const [selectedAuthor, setSelectedAuthor] = useState('全部');
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'price'>('date');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allComics = dataService.getAllComics();
    setComics(allComics);
  };

  const genres = ['全部', '热血', '冒险', '悬疑', '黑暗', '未分类'];
  const getAuthors = () => {
    const allComics = dataService.getAllComics();
    const authors = new Set(allComics.map(c => c.author));
    return ['全部', ...Array.from(authors)];
  };

  const filteredComics = comics.filter(comic => {
    const matchSearch = !searchKeyword || 
      comic.title.includes(searchKeyword) || 
      comic.author.includes(searchKeyword);
    const matchGenre = selectedGenre === '全部' || comic.genre === selectedGenre;
    const matchAuthor = selectedAuthor === '全部' || comic.author.includes(selectedAuthor);
    return matchSearch && matchGenre && matchAuthor;
  });

  const sortedComics = [...filteredComics].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.addDate).getTime() - new Date(a.addDate).getTime();
      case 'progress':
        const progressA = a.volumes.length / a.totalVolumes;
        const progressB = b.volumes.length / b.totalVolumes;
        return progressB - progressA;
      case 'price':
        return b.purchasePrice - a.purchasePrice;
      default:
        return 0;
    }
  });

  const goToDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  };

  const goToAdd = () => {
    Taro.switchTab({
      url: '/pages/add/index'
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>我的书架</Text>
          <Text className={styles.countBadge}>{filteredComics.length} 套</Text>
        </View>
        <View className={styles.searchRow}>
          <Input
            className={styles.searchInput}
            placeholder='搜索漫画名称或作者'
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.filterSection}>
        <ScrollView className={styles.filterScroll} scrollX>
          {genres.map(genre => (
            <View
              key={genre}
              className={`${styles.filterTag} ${selectedGenre === genre ? styles.filterTagActive : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              <Text>{genre}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.sortSection}>
        <Text className={styles.sortLabel}>排序：</Text>
        <View className={styles.sortOptions}>
          <View 
            className={`${styles.sortOption} ${sortBy === 'date' ? styles.sortOptionActive : ''}`}
            onClick={() => setSortBy('date')}
          >
            <Text>时间</Text>
          </View>
          <View 
            className={`${styles.sortOption} ${sortBy === 'progress' ? styles.sortOptionActive : ''}`}
            onClick={() => setSortBy('progress')}
          >
            <Text>完整度</Text>
          </View>
          <View 
            className={`${styles.sortOption} ${sortBy === 'price' ? styles.sortOptionActive : ''}`}
            onClick={() => setSortBy('price')}
          >
            <Text>价格</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {sortedComics.length > 0 ? (
          <View className={styles.seriesList}>
            {sortedComics.map(comic => (
              <View 
                key={comic.id} 
                className={styles.seriesCard}
                onClick={() => goToDetail(comic.id)}
              >
                <View className={styles.seriesCover}>
                  <Image
                    src={comic.coverImage}
                    mode='aspectFill'
                    style={{ width: '100%', height: '100%' }}
                  />
                  {comic.isKey && (
                    <View className={styles.keyBadge}>
                      <Text>⭐重点</Text>
                    </View>
                  )}
                </View>
                <View className={styles.seriesInfo}>
                  <View className={styles.seriesHeader}>
                    <Text className={styles.seriesTitle}>{comic.title}</Text>
                    <Text className={styles.seriesAuthor}>{comic.author}</Text>
                  </View>
                  <View className={styles.seriesMeta}>
                    <Text className={styles.metaItem}>
                      {comic.volumes.length}/{comic.totalVolumes}卷 · {comic.publisher}
                    </Text>
                    <View className={styles.progressBar}>
                      <View 
                        className={styles.progressFill}
                        style={{ width: `${(comic.volumes.length / comic.totalVolumes) * 100}%` }}
                      />
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text className={styles.metaItem}>
                        品相: {comic.condition} · {comic.genre}
                      </Text>
                      <Text className={styles.priceTag}>¥{comic.purchasePrice}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📚</Text>
            <Text className={styles.emptyText}>暂无藏品\n快去添加你的第一本漫画吧</Text>
            <View className={styles.addButton} onClick={goToAdd}>
              <Text>去添加</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default BookshelfPage;
