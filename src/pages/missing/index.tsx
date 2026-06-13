import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { dataService, StoredComic } from '../../services/dataService';

interface MissingSeries {
  id: string;
  title: string;
  author: string;
  volumes: number[];
  totalVolumes: number;
  missingVolumes: number[];
}

const MissingPage: React.FC = () => {
  const [missingSeries, setMissingSeries] = useState<MissingSeries[]>([]);
  const [totalMissing, setTotalMissing] = useState(0);
  const [seriesCount, setSeriesCount] = useState(0);

  const calculateMissing = () => {
    const allComics = dataService.getAllComics();
    const missing: MissingSeries[] = [];
    let total = 0;

    allComics.forEach(comic => {
      const missingVolumes: number[] = [];
      for (let i = 1; i <= comic.totalVolumes; i++) {
        if (!comic.volumes.includes(i)) {
          missingVolumes.push(i);
        }
      }
      
      if (missingVolumes.length > 0) {
        missing.push({
          id: comic.id,
          title: comic.title,
          author: comic.author,
          volumes: comic.volumes,
          totalVolumes: comic.totalVolumes,
          missingVolumes
        });
        total += missingVolumes.length;
      }
    });

    setMissingSeries(missing);
    setTotalMissing(total);
    setSeriesCount(missing.length);
  };

  useEffect(() => {
    calculateMissing();
  }, []);

  useDidShow(() => {
    calculateMissing();
  });

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>缺册清单</Text>
        <Text className={styles.subTitle}>追踪你缺失的卷册，不错过任何一本好书</Text>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{totalMissing}</Text>
          <Text className={styles.statLabel}>缺失总册数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{seriesCount}</Text>
          <Text className={styles.statLabel}>涉及套装</Text>
        </View>
      </View>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsIcon}>💡</Text>
        <Text className={styles.tipsText}>
          保持套装完整是收藏的乐趣！点击套装可以查看详情并快速添加缺失卷册到购书清单。
        </Text>
      </View>

      {missingSeries.length > 0 ? (
        <View className={styles.seriesList}>
          {missingSeries.map(series => (
            <View key={series.id} className={styles.seriesCard}>
              <View className={styles.seriesHeader}>
                <View className={styles.seriesInfo}>
                  <Text className={styles.seriesTitle}>{series.title}</Text>
                  <Text className={styles.seriesAuthor}>{series.author}</Text>
                </View>
                <View className={styles.seriesProgress}>
                  <Text className={styles.missingCount}>{series.missingVolumes.length}册</Text>
                  <Text className={styles.missingLabel}>待补全</Text>
                </View>
              </View>
              <View className={styles.missingVolumes}>
                {series.missingVolumes.map(vol => (
                  <View key={vol} className={styles.volumeTag}>
                    <Text>第{vol}卷</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🎉</Text>
          <Text className={styles.emptyText}>
            太棒了！\n你的收藏已全部完整
          </Text>
        </View>
      )}
    </View>
  );
};

export default MissingPage;
