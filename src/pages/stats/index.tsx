import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockComics } from '../../data/comics';

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalComics: 0,
    totalSeries: 0,
    totalSpend: 0,
    monthlySpend: 0,
    monthlyChange: 12.5
  });
  const [conditionData, setConditionData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const totalVolumes = mockComics.reduce((sum, comic) => sum + comic.volumes.length, 0);
    const totalSeries = mockComics.length;
    const totalSpend = mockComics.reduce((sum, comic) => sum + comic.purchasePrice, 0);
    
    setStats({
      totalComics: totalVolumes,
      totalSeries,
      totalSpend,
      monthlySpend: 1280,
      monthlyChange: 12.5
    });

    const conditionCounts: any = {};
    mockComics.forEach(comic => {
      conditionCounts[comic.condition] = (conditionCounts[comic.condition] || 0) + 1;
    });
    
    const conditions = ['全新', '近乎全新', '很好', '好', '一般'];
    const conditionList = conditions.map(c => ({
      condition: c,
      count: conditionCounts[c] || 0
    }));
    setConditionData(conditionList);

    const months = ['3月', '4月', '5月', '6月', '7月', '8月'];
    const monthData = [
      { month: '3月', count: 5, spend: 500 },
      { month: '4月', count: 8, spend: 800 },
      { month: '5月', count: 3, spend: 300 },
      { month: '6月', count: 12, spend: 1200 },
      { month: '7月', count: 7, spend: 700 },
      { month: '8月', count: 6, spend: 600 }
    ];
    setMonthlyData(monthData);
  };

  const handleShare = () => {
    Taro.showToast({
      title: '分享图生成中...',
      icon: 'loading'
    });

    setTimeout(() => {
      Taro.showToast({
        title: '分享功能开发中',
        icon: 'none'
      });
    }, 1500);
  };

  const maxCount = Math.max(...conditionData.map(c => c.count), 1);
  const maxSpend = Math.max(...monthlyData.map(m => m.spend), 1);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>收藏统计</Text>
        <Text className={styles.subTitle}>了解你的收藏趋势和花费</Text>
      </View>

      <View className={styles.statsOverview}>
        <View className={styles.overviewGrid}>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewValue}>{stats.totalComics}</Text>
            <Text className={styles.overviewLabel}>总册数</Text>
          </View>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewValue}>{stats.totalSeries}</Text>
            <Text className={styles.overviewLabel}>套装数</Text>
          </View>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewValue}>¥{stats.totalSpend}</Text>
            <Text className={styles.overviewLabel}>总花费</Text>
          </View>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewValue}>¥{stats.monthlySpend}</Text>
            <Text className={styles.overviewLabel}>本月花费</Text>
          </View>
        </View>

        <View className={styles.changeCard}>
          <Text className={styles.changeLabel}>相比上月</Text>
          <Text className={styles.changeValue}>↑ {stats.monthlyChange}%</Text>
          <Text className={styles.changeDesc}>收藏热情持续上涨 📈</Text>
        </View>
      </View>

      <View className={styles.conditionSection}>
        <Text className={styles.sectionTitle}>品相分布</Text>
        <View className={styles.conditionGrid}>
          {conditionData.map((item) => (
            <View key={item.condition} className={styles.conditionItem}>
              <View className={styles.conditionBar}>
                <View 
                  className={styles.conditionFill}
                  style={{ height: `${(item.count / maxCount) * 100}%` }}
                />
              </View>
              <Text className={styles.conditionCount}>{item.count}</Text>
              <Text className={styles.conditionLabel}>{item.condition}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.monthlySection}>
        <Text className={styles.sectionTitle}>月度趋势</Text>
        <View className={styles.monthlyChart}>
          {monthlyData.map((item) => (
            <View key={item.month} className={styles.chartBar}>
              <View className={styles.barContainer}>
                <View 
                  className={styles.bar}
                  style={{ height: `${(item.spend / maxSpend) * 100}%` }}
                />
              </View>
              <Text className={styles.barLabel}>{item.month}</Text>
            </View>
          ))}
        </View>
        <View className={styles.chartLegend}>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} />
            <Text>花费趋势 (元)</Text>
          </View>
        </View>
      </View>

      <View className={styles.shareSection}>
        <Text className={styles.sectionTitle}>📤 分享书架</Text>
        <View className={styles.sharePreview}>
          <View className={styles.shareContent}>
            <Text className={styles.shareTitle}>📚 我的漫画收藏馆</Text>
            <View className={styles.shareStats}>
              <View className={styles.shareStat}>
                <Text className={styles.shareStatValue}>{stats.totalComics}</Text>
                <Text className={styles.shareStatLabel}>总册数</Text>
              </View>
              <View className={styles.shareStat}>
                <Text className={styles.shareStatValue}>{stats.totalSeries}</Text>
                <Text className={styles.shareStatLabel}>套装数</Text>
              </View>
              <View className={styles.shareStat}>
                <Text className={styles.shareStatValue}>¥{stats.totalSpend}</Text>
                <Text className={styles.shareStatLabel}>总花费</Text>
              </View>
            </View>
            <View className={styles.shareDecoration}>
              <View className={styles.decoItem}>
                <Text style={{ fontSize: '32rpx' }}>📖</Text>
              </View>
              <View className={styles.decoItem}>
                <Text style={{ fontSize: '32rpx' }}>📕</Text>
              </View>
              <View className={styles.decoItem}>
                <Text style={{ fontSize: '32rpx' }}>📗</Text>
              </View>
              <View className={styles.decoItem}>
                <Text style={{ fontSize: '32rpx' }}>📘</Text>
              </View>
            </View>
            <Text className={styles.shareTime}>生成于 {new Date().toLocaleDateString()}</Text>
          </View>
        </View>
        <View className={styles.shareButton} onClick={handleShare}>
          <Text>生成分享图</Text>
        </View>
      </View>
    </View>
  );
};

export default StatsPage;
