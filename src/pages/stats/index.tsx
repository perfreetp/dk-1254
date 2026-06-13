import React, { useState, useEffect } from 'react';
import { View, Text, Canvas, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { dataService, StoredComic } from '../../services/dataService';

interface MonthData {
  month: string;
  count: number;
  spend: number;
  comics: StoredComic[];
}

const StatsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'all' | 'year' | 'month'>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filteredStats, setFilteredStats] = useState({
    totalComics: 0,
    totalSeries: 0,
    totalSpend: 0
  });
  const [conditionData, setConditionData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [shareImagePath, setShareImagePath] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<MonthData | null>(null);
  const [topSpendMonths, setTopSpendMonths] = useState<MonthData[]>([]);

  const calculateStats = () => {
    const allComics = dataService.getAllComics();
    
    const years = new Set<number>();
    allComics.forEach(comic => {
      years.add(new Date(comic.addDate).getFullYear());
    });
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    setAvailableYears(Array.from(years).sort((a, b) => b - a));

    let filteredComics = allComics;
    
    if (viewMode === 'year') {
      filteredComics = allComics.filter(comic => {
        const addDate = new Date(comic.addDate);
        return addDate.getFullYear() === selectedYear;
      });
    } else if (viewMode === 'month') {
      filteredComics = allComics.filter(comic => {
        const addDate = new Date(comic.addDate);
        return addDate.getFullYear() === selectedYear && addDate.getMonth() + 1 === selectedMonth;
      });
    }

    const totalVolumes = filteredComics.reduce((sum, comic) => sum + comic.volumes.length, 0);
    const totalSeries = filteredComics.length;
    const totalSpend = filteredComics.reduce((sum, comic) => sum + comic.purchasePrice, 0);

    setFilteredStats({
      totalComics: totalVolumes,
      totalSeries,
      totalSpend
    });

    const conditionCounts: any = {};
    filteredComics.forEach(comic => {
      conditionCounts[comic.condition] = (conditionCounts[comic.condition] || 0) + 1;
    });
    
    const conditions = ['全新', '近乎全新', '很好', '好', '一般'];
    const conditionList = conditions.map(c => ({
      condition: c,
      count: conditionCounts[c] || 0
    }));
    setConditionData(conditionList);

    let monthData: MonthData[] = [];
    
    if (viewMode === 'month') {
      monthData = [{
        month: `${selectedYear}年${selectedMonth}月`,
        count: totalSeries,
        spend: totalSpend,
        comics: filteredComics
      }];
    } else if (viewMode === 'year') {
      monthData = [];
      for (let i = 1; i <= 12; i++) {
        const monthComics = allComics.filter(comic => {
          const addDate = new Date(comic.addDate);
          return addDate.getFullYear() === selectedYear && addDate.getMonth() + 1 === i;
        });
        
        if (monthComics.length > 0) {
          monthData.push({
            month: `${i}月`,
            count: monthComics.length,
            spend: monthComics.reduce((sum, c) => sum + c.purchasePrice, 0),
            comics: monthComics
          });
        }
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const monthComics = allComics.filter(comic => {
          const addDate = new Date(comic.addDate);
          return addDate.getFullYear() === year && addDate.getMonth() + 1 === month;
        });
        
        monthData.push({
          month: `${month}月`,
          count: monthComics.length,
          spend: monthComics.reduce((sum, c) => sum + c.purchasePrice, 0),
          comics: monthComics
        });
      }
    }
    
    setMonthlyData(monthData);

    if (viewMode === 'all') {
      const allMonthData: MonthData[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const monthComics = allComics.filter(comic => {
          const addDate = new Date(comic.addDate);
          return addDate.getFullYear() === year && addDate.getMonth() + 1 === month;
        });
        
        if (monthComics.length > 0) {
          allMonthData.push({
            month: `${year}年${month}月`,
            count: monthComics.length,
            spend: monthComics.reduce((sum, c) => sum + c.purchasePrice, 0),
            comics: monthComics
          });
        }
      }
      
      const sortedBySpend = [...allMonthData].sort((a, b) => b.spend - a.spend);
      setTopSpendMonths(sortedBySpend.slice(0, 3));
    }
  };

  useEffect(() => {
    calculateStats();
  }, [viewMode, selectedYear, selectedMonth]);

  useDidShow(() => {
    calculateStats();
  });

  const getViewTitle = () => {
    if (viewMode === 'month') {
      return `${selectedYear}年${selectedMonth}月`;
    } else if (viewMode === 'year') {
      return `${selectedYear}年`;
    }
    return '全部时间';
  };

  const generateAndShowShareImage = () => {
    Taro.showLoading({ title: '生成中...' });
    
    const canvasWidth = 600;
    const canvasHeight = 800;
    
    const query = Taro.createSelectorQuery();
    query.select('#shareCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res && res[0] && res[0].node) {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d') as any;
          
          if (ctx) {
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            
            ctx.fillStyle = '#FEFAE0';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            ctx.fillStyle = '#D4A373';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`📚 我的漫画收藏馆`, canvasWidth / 2, 100);
            
            ctx.fillStyle = '#86909C';
            ctx.font = '28px Arial';
            ctx.fillText(getViewTitle(), canvasWidth / 2, 140);
            
            const statsY = 220;
            const statSpacing = 200;
            
            ctx.fillStyle = '#1D2129';
            ctx.font = 'bold 64px Arial';
            ctx.fillText(filteredStats.totalComics.toString(), canvasWidth / 2 - statSpacing, statsY);
            ctx.font = '28px Arial';
            ctx.fillStyle = '#86909C';
            ctx.fillText('总册数', canvasWidth / 2 - statSpacing, statsY + 50);
            
            ctx.fillStyle = '#1D2129';
            ctx.font = 'bold 64px Arial';
            ctx.fillText(filteredStats.totalSeries.toString(), canvasWidth / 2, statsY);
            ctx.font = '28px Arial';
            ctx.fillStyle = '#86909C';
            ctx.fillText('套装数', canvasWidth / 2, statsY + 50);
            
            ctx.fillStyle = '#1D2129';
            ctx.font = 'bold 64px Arial';
            ctx.fillText(`¥${filteredStats.totalSpend}`, canvasWidth / 2 + statSpacing, statsY);
            ctx.font = '28px Arial';
            ctx.fillStyle = '#86909C';
            ctx.fillText('总花费', canvasWidth / 2 + statSpacing, statsY + 50);
            
            ctx.fillStyle = '#E8E4D9';
            ctx.fillRect(50, 340, canvasWidth - 100, 2);
            
            ctx.fillStyle = '#D4A373';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('代表收藏', 50, 420);
            
            let displayComics = monthlyData
              .flatMap(m => m.comics)
              .sort((a, b) => new Date(b.addDate).getTime() - new Date(a.addDate).getTime())
              .slice(0, 4);
            
            if (displayComics.length === 0) {
              displayComics = dataService.getAllComics().slice(0, 4);
            }
            
            let coverY = 460;
            
            displayComics.forEach((comic, index) => {
              const coverX = 50 + (index % 2) * 260;
              if (index % 2 === 0 && index > 0) {
                coverY += 160;
              }
              
              ctx.fillStyle = '#FFFFFF';
              ctx.shadowColor = 'rgba(0,0,0,0.1)';
              ctx.shadowBlur = 10;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;
              ctx.beginPath();
              ctx.roundRect(coverX, coverY, 100, 130, 12);
              ctx.fill();
              ctx.shadowBlur = 0;
              
              ctx.fillStyle = '#1D2129';
              ctx.font = 'bold 28px Arial';
              ctx.textAlign = 'left';
              ctx.fillText(comic.title.substring(0, 8), coverX + 110, coverY + 30);
              
              ctx.fillStyle = '#86909C';
              ctx.font = '24px Arial';
              ctx.fillText(comic.author.substring(0, 6), coverX + 110, coverY + 70);
              
              ctx.fillStyle = '#D4A373';
              ctx.font = 'bold 24px Arial';
              ctx.fillText(`${comic.volumes.length}/${comic.totalVolumes}卷`, coverX + 110, coverY + 110);
            });
            
            ctx.fillStyle = '#86909C';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${getViewTitle()} · ${new Date().toLocaleDateString()}`, canvasWidth / 2, canvasHeight - 50);
            
            Taro.canvasToTempFilePath({
              canvas,
              success: (res) => {
                Taro.hideLoading();
                setShareImagePath(res.tempFilePath);
                setShowShareModal(true);
              },
              fail: () => {
                Taro.hideLoading();
                Taro.showToast({
                  title: '生成失败',
                  icon: 'none'
                });
              }
            });
          }
        } else {
          Taro.hideLoading();
          Taro.showToast({
            title: '生成失败',
            icon: 'none'
          });
        }
      });
  };

  const saveToAlbum = () => {
    if (!shareImagePath) return;
    
    Taro.saveImageToPhotosAlbum({
      filePath: shareImagePath,
      success: () => {
        Taro.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: () => {
        Taro.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  };

  const shareToFriend = () => {
    if (!shareImagePath) return;
    
    Taro.showShareImage({
      sharePath: shareImagePath,
      success: () => {
        Taro.showToast({
          title: '分享成功',
          icon: 'success'
        });
        setShowShareModal(false);
      },
      fail: () => {
        Taro.showToast({
          title: '分享取消',
          icon: 'none'
        });
      }
    });
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  const maxSpend = Math.max(...monthlyData.map(m => m.spend), 1);
  const maxCount = Math.max(...monthlyData.map(m => m.count), 1);

  return (
    <ScrollView scrollY className={styles.container}>
      {showShareModal && (
        <View className={styles.shareModal} onClick={closeShareModal}>
          <View className={styles.shareModalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.shareModalTitle}>分享图预览</Text>
            {shareImagePath && (
              <Image 
                className={styles.sharePreviewImage}
                src={shareImagePath}
                mode='aspectFit'
              />
            )}
            <View className={styles.shareModalButtons}>
              <View className={styles.shareModalButton} onClick={closeShareModal}>
                <Text>关闭</Text>
              </View>
              <View className={styles.shareModalButton} onClick={saveToAlbum}>
                <Text>保存</Text>
              </View>
              <View className={`${styles.shareModalButton} ${styles.shareModalButtonPrimary}`} onClick={shareToFriend}>
                <Text>转发</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      <Canvas 
        type="2d" 
        id="shareCanvas" 
        style={{ width: '600px', height: '800px', position: 'absolute', left: '-9999px' }} 
      />
      
      <View className={styles.header}>
        <Text className={styles.title}>收藏统计</Text>
        <Text className={styles.subTitle}>了解你的收藏趋势和花费</Text>
      </View>

      <View className={styles.viewModeSection}>
        <View 
          className={`${styles.viewModeButton} ${viewMode === 'all' ? styles.viewModeButtonActive : ''}`}
          onClick={() => setViewMode('all')}
        >
          <Text>全部</Text>
        </View>
        <View 
          className={`${styles.viewModeButton} ${viewMode === 'year' ? styles.viewModeButtonActive : ''}`}
          onClick={() => setViewMode('year')}
        >
          <Text>按年</Text>
        </View>
        <View 
          className={`${styles.viewModeButton} ${viewMode === 'month' ? styles.viewModeButtonActive : ''}`}
          onClick={() => setViewMode('month')}
        >
          <Text>按月</Text>
        </View>
      </View>

      {(viewMode === 'year' || viewMode === 'month') && (
        <View className={styles.yearMonthSelector}>
          <ScrollView className={styles.yearScroll} scrollX>
            {availableYears.map(year => (
              <View
                key={year}
                className={`${styles.yearButton} ${selectedYear === year ? styles.yearButtonActive : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                <Text>{year}年</Text>
              </View>
            ))}
          </ScrollView>
          
          {viewMode === 'month' && (
            <ScrollView className={styles.monthScroll} scrollX>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <View
                  key={month}
                  className={`${styles.monthButton} ${selectedMonth === month ? styles.monthButtonActive : ''}`}
                  onClick={() => setSelectedMonth(month)}
                >
                  <Text>{month}月</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <View className={styles.currentStatsCard}>
        <Text className={styles.currentStatsTitle}>{getViewTitle()} 收藏概览</Text>
        <View className={styles.currentStatsGrid}>
          <View className={styles.currentStatItem}>
            <Text className={styles.currentStatValue}>{filteredStats.totalSeries}</Text>
            <Text className={styles.currentStatLabel}>套装数</Text>
          </View>
          <View className={styles.currentStatItem}>
            <Text className={styles.currentStatValue}>{filteredStats.totalComics}</Text>
            <Text className={styles.currentStatLabel}>总册数</Text>
          </View>
          <View className={styles.currentStatItem}>
            <Text className={styles.currentStatValue}>¥{filteredStats.totalSpend}</Text>
            <Text className={styles.currentStatLabel}>总花费</Text>
          </View>
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
                  style={{ height: `${Math.max((item.count / Math.max(filteredStats.totalSeries, 1)) * 100, 5)}%` }}
                />
              </View>
              <Text className={styles.conditionCount}>{item.count}</Text>
              <Text className={styles.conditionLabel}>{item.condition}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.monthlySection}>
        <Text className={styles.sectionTitle}>{getViewTitle()} 收藏趋势</Text>
        <View className={styles.monthlyChart}>
          {monthlyData.map((item, index) => (
            <View key={index} className={styles.chartBar}>
              <View className={styles.barContainer}>
                <View 
                  className={styles.bar}
                  style={{ height: `${Math.max((item.spend / maxSpend) * 100, 5)}%` }}
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
          <View className={styles.legendItem}>
            <View className={styles.legendDotCount} />
            <Text>新增套装数</Text>
          </View>
        </View>
      </View>

      {viewMode === 'all' && topSpendMonths.length > 0 && (
        <View className={styles.topSpendSection}>
          <Text className={styles.sectionTitle}>💰 花费最高月份</Text>
          {topSpendMonths.map((month, index) => (
            <View 
              key={index} 
              className={styles.topSpendCard}
              onClick={() => {
                const [year, mon] = month.month.split('年');
                setSelectedYear(parseInt(year));
                setSelectedMonth(parseInt(mon));
                setViewMode('month');
                setSelectedMonthDetail(month);
              }}
            >
              <View className={styles.topSpendRank}>
                <Text className={styles.topSpendRankText}>{index + 1}</Text>
              </View>
              <View className={styles.topSpendInfo}>
                <Text className={styles.topSpendMonth}>{month.month}</Text>
                <Text className={styles.topSpendMeta}>
                  新增 {month.count} 套 · {month.comics.length > 0 ? month.comics[0].title : ''}
                  {month.comics.length > 1 ? ` 等${month.comics.length}本` : ''}
                </Text>
              </View>
              <View className={styles.topSpendAmount}>
                <Text className={styles.topSpendAmountText}>¥{month.spend}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {(viewMode === 'year' || viewMode === 'month') && monthlyData.length > 0 && (
        <View className={styles.monthDetailSection}>
          <Text className={styles.sectionTitle}>📚 {getViewTitle()} 新增收藏</Text>
          {monthlyData.map((month, index) => (
            <View key={index} className={styles.monthDetailCard}>
              <View className={styles.monthDetailHeader}>
                <Text className={styles.monthDetailTitle}>{month.month}</Text>
                <Text className={styles.monthDetailStats}>
                  {month.count} 套 · ¥{month.spend}
                </Text>
              </View>
              {month.comics.length > 0 && (
                <View className={styles.monthDetailComics}>
                  {month.comics.map((comic, cIndex) => (
                    <View key={cIndex} className={styles.monthDetailComicItem}>
                      <Text className={styles.monthDetailComicTitle}>{comic.title}</Text>
                      <Text className={styles.monthDetailComicAuthor}>{comic.author}</Text>
                      <Text className={styles.monthDetailComicPrice}>¥{comic.purchasePrice}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View className={styles.shareSection}>
        <Text className={styles.sectionTitle}>📤 分享书架</Text>
        <View className={styles.sharePreview}>
          <View className={styles.shareContent}>
            <Text className={styles.shareTitle}>📚 我的漫画收藏馆</Text>
            <Text className={styles.shareSubtitle}>{getViewTitle()}</Text>
            <View className={styles.shareStats}>
              <View className={styles.shareStat}>
                <Text className={styles.shareStatValue}>{filteredStats.totalComics}</Text>
                <Text className={styles.shareStatLabel}>总册数</Text>
              </View>
              <View className={styles.shareStat}>
                <Text className={styles.shareStatValue}>{filteredStats.totalSeries}</Text>
                <Text className={styles.shareStatLabel}>套装数</Text>
              </View>
              <View className={styles.shareStat}>
                <Text className={styles.shareStatValue}>¥{filteredStats.totalSpend}</Text>
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
          </View>
        </View>
        <View className={styles.shareButton} onClick={generateAndShowShareImage}>
          <Text>生成分享图</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default StatsPage;
