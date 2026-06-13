import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { dataService, StoredComic } from '../../services/dataService';

const DetailPage: React.FC = () => {
  const [comic, setComic] = useState<StoredComic | null>(null);
  const [missingVolumes, setMissingVolumes] = useState<number[]>([]);
  const [showLendingForm, setShowLendingForm] = useState(false);
  const [borrower, setBorrower] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadComic();
  }, []);

  const loadComic = () => {
    const { id } = Taro.getCurrentInstance().router?.params || {};
    const foundComic = dataService.getComicById(id || '');
    if (foundComic) {
      setComic(foundComic);
      calculateMissing(foundComic);
    }
  };

  const calculateMissing = (comic: StoredComic) => {
    const missing: number[] = [];
    for (let i = 1; i <= comic.totalVolumes; i++) {
      if (!comic.volumes.includes(i)) {
        missing.push(i);
      }
    }
    setMissingVolumes(missing);
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleEdit = () => {
    Taro.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  };

  const toggleLendingForm = () => {
    setShowLendingForm(!showLendingForm);
  };

  const handleSubmitLending = () => {
    if (!borrower.trim() || !dueDate.trim()) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (!comic) return;

    const lendingInfo: StoredComic['lendingInfo'] = {
      borrower: borrower.trim(),
      lendDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate.trim(),
      returned: false
    };

    const success = dataService.updateComicLending(comic.id, lendingInfo);

    if (success) {
      Taro.showToast({
        title: '借阅登记成功',
        icon: 'success'
      });
      
      setBorrower('');
      setDueDate('');
      setShowLendingForm(false);
      
      setTimeout(() => {
        loadComic();
      }, 1500);
    } else {
      Taro.showToast({
        title: '登记失败',
        icon: 'none'
      });
    }
  };

  const handleMarkReturned = () => {
    if (!comic || !comic.lendingInfo) return;

    Taro.showModal({
      title: '确认归还',
      content: '确认该藏品已归还吗？',
      success: (res) => {
        if (res.confirm) {
          const lendingInfo: StoredComic['lendingInfo'] = {
            ...comic.lendingInfo,
            returned: true
          };

          const success = dataService.updateComicLending(comic.id, lendingInfo);

          if (success) {
            Taro.showToast({
              title: '已标记归还',
              icon: 'success'
            });
            
            setTimeout(() => {
              loadComic();
            }, 1500);
          }
        }
      }
    });
  };

  if (!comic) {
    return (
      <View className={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const progress = (comic.volumes.length / comic.totalVolumes) * 100;

  return (
    <View className={styles.container}>
      <ScrollView scrollY>
        <View className={styles.coverSection}>
          <Image
            className={styles.coverImage}
            src={comic.coverImage}
            mode='aspectFill'
          />
          <View className={styles.backButton} onClick={handleBack}>
            <Text>←</Text>
          </View>
        </View>

        <View className={styles.mainInfo}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>{comic.title}</Text>
            {comic.isKey && (
              <Text className={styles.keyBadge}>⭐ 重点</Text>
            )}
          </View>

          <Text className={styles.author}>{comic.author}</Text>

          <View className={styles.metaGrid}>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>出版社</Text>
              <Text className={styles.metaValue}>{comic.publisher}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>题材</Text>
              <Text className={styles.metaValue}>{comic.genre}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>品相</Text>
              <Text className={styles.metaValue}>{comic.condition}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>购买渠道</Text>
              <Text className={styles.metaValue}>{comic.purchaseChannel}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>购买价格</Text>
              <Text className={styles.metaValue}>¥{comic.purchasePrice}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>添加日期</Text>
              <Text className={styles.metaValue}>{comic.addDate}</Text>
            </View>
          </View>

          <View className={styles.progressSection}>
            <View className={styles.progressHeader}>
              <Text className={styles.progressLabel}>套装完整度</Text>
              <Text className={styles.progressValue}>
                {comic.volumes.length}/{comic.totalVolumes}卷 ({progress.toFixed(1)}%)
              </Text>
            </View>
            <View className={styles.progressBar}>
              <View 
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </View>
            {missingVolumes.length > 0 && (
              <Text className={styles.missingCount}>
                ⚠️ 缺少 {missingVolumes.length} 册待补全
              </Text>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📚 卷册详情</Text>
          <View className={styles.volumeList}>
            {Array.from({ length: comic.totalVolumes }, (_, i) => i + 1).map(vol => {
              const hasVolume = comic.volumes.includes(vol);
              return (
                <View 
                  key={vol}
                  className={`${styles.volumeTag} ${!hasVolume ? styles.volumeTagMissing : ''}`}
                >
                  <Text>{vol}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {comic.notes && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📝 收藏备注</Text>
            <View className={styles.notesSection}>
              <Text className={styles.notesText}>{comic.notes}</Text>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🤝 借阅信息</Text>
          
          {comic.lendingInfo && !comic.lendingInfo.returned ? (
            <View className={styles.lendingCard}>
              <View className={styles.lendingHeader}>
                <Text className={styles.lendingTitle}>当前借出中</Text>
                <Text className={styles.lendingStatus}>未归还</Text>
              </View>
              <View className={styles.lendingInfo}>
                <Text className={styles.lendingItem}>借阅人：{comic.lendingInfo.borrower}</Text>
                <Text className={styles.lendingItem}>借出日期：{comic.lendingInfo.lendDate}</Text>
                <Text className={styles.lendingItem}>应还日期：{comic.lendingInfo.dueDate}</Text>
              </View>
              <View className={styles.actionArea}>
                <View className={styles.actionButton} onClick={handleMarkReturned}>
                  <Text>标记归还</Text>
                </View>
              </View>
            </View>
          ) : showLendingForm ? (
            <View className={styles.lendingForm}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>借阅人 *</Text>
                <Input
                  className={styles.formInput}
                  placeholder='请输入借阅人姓名'
                  value={borrower}
                  onInput={(e) => setBorrower(e.detail.value)}
                />
              </View>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>应还日期 *</Text>
                <Input
                  className={styles.formInput}
                  placeholder='格式: 2024-12-31'
                  value={dueDate}
                  onInput={(e) => setDueDate(e.detail.value)}
                />
              </View>
              <View className={styles.formButtons}>
                <View className={styles.cancelButton} onClick={toggleLendingForm}>
                  <Text>取消</Text>
                </View>
                <View className={styles.submitButtonForm} onClick={handleSubmitLending}>
                  <Text>确认登记</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className={styles.lendingEmpty}>
              <Text className={styles.lendingEmptyText}>暂无借阅记录</Text>
              <View className={styles.actionButton} onClick={toggleLendingForm}>
                <Text>登记借阅</Text>
              </View>
            </View>
          )}
        </View>

        <View className={styles.actionButtons}>
          <View className={`${styles.actionButton} ${styles.actionButtonSecondary}`} onClick={handleEdit}>
            <Text>编辑藏品</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailPage;
