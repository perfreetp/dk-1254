import React, { useState, useEffect } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { dataService, StoredComic } from '../../services/dataService';
import { initDataService } from '../../services/initData';

const HomePage: React.FC = () => {
  const [stats, setStats] = useState({
    totalComics: 0,
    totalSeries: 0,
    totalSpend: 0
  });
  const [hotComics, setHotComics] = useState<StoredComic[]>([]);
  const [latestComics, setLatestComics] = useState<StoredComic[]>([]);
  const [missingCount, setMissingCount] = useState(0);
  const [lendingCount, setLendingCount] = useState(0);

  const loadData = () => {
    initDataService.initializeData();
    
    const allComics = dataService.getAllComics();
    
    const totalVolumes = allComics.reduce((sum, comic) => sum + comic.volumes.length, 0);
    const totalSeries = allComics.length;
    const totalSpend = allComics.reduce((sum, comic) => sum + comic.purchasePrice, 0);
    
    setStats({
      totalComics: totalVolumes,
      totalSeries,
      totalSpend
    });

    const keyComics = allComics.filter(comic => comic.isKey);
    setHotComics(keyComics.slice(0, 5));

    const sorted = [...allComics].sort((a, b) => 
      new Date(b.addDate).getTime() - new Date(a.addDate).getTime()
    );
    setLatestComics(sorted.slice(0, 3));

    let missing = 0;
    allComics.forEach(comic => {
      missing += comic.totalVolumes - comic.volumes.length;
    });
    setMissingCount(missing);

    const lending = allComics.filter(comic => 
      comic.lendingInfo && !comic.lendingInfo.returned
    ).length;
    setLendingCount(lending);
  };

  useEffect(() => {
    loadData();
  }, []);

  useDidShow(() => {
    loadData();
  });

  const handleSearch = () => {
    Taro.navigateTo({
      url: '/pages/bookshelf/index'
    });
  };

  const goToDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  };

  const goToMissing = () => {
    Taro.navigateTo({
      url: '/pages/missing/index'
    });
  };

  const goToLending = () => {
    Taro.navigateTo({
      url: '/pages/lending/index'
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.welcome}>我的收藏馆</Text>
        <Text className={styles.subTitle}>记录每一本珍贵的收藏</Text>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.totalComics}</Text>
          <Text className={styles.statLabel}>总册数</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.totalSeries}</Text>
          <Text className={styles.statLabel}>套装数</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.totalSpend}</Text>
          <Text className={styles.statLabel}>总花费(元)</Text>
        </View>
      </View>

      <View className={styles.searchSection} onClick={handleSearch}>
        <View className={styles.searchBox}>
          <Text className={styles.searchText}>搜索漫画标题或作者</Text>
        </View>
      </View>

      <View className={styles.quickActions}>
        <Text className={styles.sectionTitle}>快捷功能</Text>
        <View className={styles.actionGrid}>
          <View className={styles.actionCard} onClick={goToMissing}>
            <View className={styles.actionIcon}>
              <Text style={{ fontSize: '40rpx' }}>📋</Text>
            </View>
            <View className={styles.actionText}>
              <Text className={styles.actionTitle}>缺册清单</Text>
              <Text className={styles.actionDesc}>查看缺失的卷册</Text>
            </View>
            {missingCount > 0 && (
              <Text className={styles.badge}>{missingCount}</Text>
            )}
          </View>

          <View className={styles.actionCard} onClick={goToLending}>
            <View className={styles.actionIcon}>
              <Text style={{ fontSize: '40rpx' }}>🤝</Text>
            </View>
            <View className={styles.actionText}>
              <Text className={styles.actionTitle}>借阅记录</Text>
              <Text className={styles.actionDesc}>追踪借出情况</Text>
            </View>
            {lendingCount > 0 && (
              <Text className={styles.badge}>{lendingCount}</Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.hotSection}>
        <View className={styles.sectionTitle}>
          <Text>重点藏品</Text>
          <Text className={styles.viewMore} onClick={handleSearch}>查看全部</Text>
        </View>
        <ScrollView className={styles.hotList} scrollX>
          {hotComics.length > 0 ? (
            hotComics.map(comic => (
              <View 
                key={comic.id} 
                className={styles.hotCard}
                onClick={() => goToDetail(comic.id)}
              >
                <Image
                  className={styles.hotCover}
                  src={comic.coverImage}
                  mode='aspectFill'
                />
                <View className={styles.hotInfo}>
                  <Text className={styles.hotTitle}>
                    {comic.title}
                    {comic.isKey && <Text className={styles.keyBadge}>重点</Text>}
                  </Text>
                  <Text className={styles.hotMeta}>{comic.author}</Text>
                  <Text className={styles.hotVolumes}>
                    {comic.volumes.length}/{comic.totalVolumes}卷
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyHot}>
              <Text className={styles.emptyText}>暂无重点藏品</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View className={styles.latestSection}>
        <View className={styles.sectionTitle}>
          <Text>最新添加</Text>
          <Text className={styles.viewMore} onClick={handleSearch}>查看全部</Text>
        </View>
        <View className={styles.latestList}>
          {latestComics.length > 0 ? (
            latestComics.map(comic => (
              <View 
                key={comic.id} 
                className={styles.latestCard}
                onClick={() => goToDetail(comic.id)}
              >
                <Image
                  className={styles.latestCover}
                  src={comic.coverImage}
                  mode='aspectFill'
                />
                <View className={styles.latestInfo}>
                  <View>
                    <Text className={styles.latestTitle}>{comic.title}</Text>
                    <Text className={styles.latestAuthor}>{comic.author}</Text>
                  </View>
                  <View className={styles.latestMeta}>
                    <Text className={styles.metaItem}>
                      {comic.volumes.length}/{comic.totalVolumes}卷 · {comic.publisher}
                    </Text>
                    <Text className={styles.metaItem}>
                      <Text style={{ color: '#D4A373', fontWeight: '600' }}>¥{comic.purchasePrice}</Text>
                      · {comic.purchaseChannel}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyLatest}>
              <Text className={styles.emptyText}>暂无收藏，快去添加吧</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default HomePage;
