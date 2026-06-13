import React, { useState, useEffect } from 'react';
import { View, Text, Canvas, Image } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { dataService, StoredComic } from '../../services/dataService';

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
  const [shareImagePath, setShareImagePath] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);

  const calculateStats = () => {
    const allComics = dataService.getAllComics();
    
    const totalVolumes = allComics.reduce((sum, comic) => sum + comic.volumes.length, 0);
    const totalSeries = allComics.length;
    const totalSpend = allComics.reduce((sum, comic) => sum + comic.purchasePrice, 0);
    
    setStats({
      totalComics: totalVolumes,
      totalSeries,
      totalSpend,
      monthlySpend: 1280,
      monthlyChange: 12.5
    });

    const conditionCounts: any = {};
    allComics.forEach(comic => {
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

  useEffect(() => {
    calculateStats();
  }, []);

  useDidShow(() => {
    calculateStats();
  });

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
            ctx.fillText('📚 我的漫画收藏馆', canvasWidth / 2, 100);
            
            const statsY = 200;
            const statSpacing = 200;
            
            ctx.fillStyle = '#1D2129';
            ctx.font = 'bold 64px Arial';
            ctx.fillText(stats.totalComics.toString(), canvasWidth / 2 - statSpacing, statsY);
            ctx.font = '28px Arial';
            ctx.fillStyle = '#86909C';
            ctx.fillText('总册数', canvasWidth / 2 - statSpacing, statsY + 50);
            
            ctx.fillStyle = '#1D2129';
            ctx.font = 'bold 64px Arial';
            ctx.fillText(stats.totalSeries.toString(), canvasWidth / 2, statsY);
            ctx.font = '28px Arial';
            ctx.fillStyle = '#86909C';
            ctx.fillText('套装数', canvasWidth / 2, statsY + 50);
            
            ctx.fillStyle = '#1D2129';
            ctx.font = 'bold 64px Arial';
            ctx.fillText(`¥${stats.totalSpend}`, canvasWidth / 2 + statSpacing, statsY);
            ctx.font = '28px Arial';
            ctx.fillStyle = '#86909C';
            ctx.fillText('总花费', canvasWidth / 2 + statSpacing, statsY + 50);
            
            ctx.fillStyle = '#E8E4D9';
            ctx.fillRect(50, 320, canvasWidth - 100, 2);
            
            ctx.fillStyle = '#D4A373';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('近期收藏', 50, 400);
            
            const allComics = dataService.getAllComics().slice(0, 4);
            let coverY = 440;
            
            allComics.forEach((comic, index) => {
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
            ctx.fillText(`生成于 ${new Date().toLocaleDateString()}`, canvasWidth / 2, canvasHeight - 50);
            
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
        setShowShareModal(false);
      },
      fail: () => {
        Taro.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  };

  const handleShare = () => {
    generateAndShowShareImage();
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  const maxCount = Math.max(...conditionData.map(c => c.count), 1);
  const maxSpend = Math.max(...monthlyData.map(m => m.spend), 1);

  return (
    <View className={styles.container}>
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
              <View className={`${styles.shareModalButton} ${styles.shareModalButtonPrimary}`} onClick={saveToAlbum}>
                <Text>保存到相册</Text>
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
