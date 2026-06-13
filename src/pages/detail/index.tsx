import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { dataService, StoredComic, LendingRecord } from '../../services/dataService';

const DetailPage: React.FC = () => {
  const [comic, setComic] = useState<StoredComic | null>(null);
  const [missingVolumes, setMissingVolumes] = useState<number[]>([]);
  const [showLendingForm, setShowLendingForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState<string | null>(null);
  const [borrower, setBorrower] = useState('');
  const [lendDate, setLendDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnNotes, setReturnNotes] = useState('');

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

  useEffect(() => {
    loadComic();
  }, []);

  useDidShow(() => {
    loadComic();
  });

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
    if (!showLendingForm) {
      setBorrower('');
      setLendDate('');
      setDueDate('');
    }
  };

  const handleSubmitLending = () => {
    if (!borrower.trim() || !lendDate.trim() || !dueDate.trim()) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (!comic) return;

    const success = dataService.addLendingRecord(comic.id, {
      borrower: borrower.trim(),
      lendDate: lendDate.trim(),
      dueDate: dueDate.trim(),
      isActive: true
    });

    if (success) {
      Taro.showToast({
        title: '借阅登记成功',
        icon: 'success'
      });
      
      setBorrower('');
      setLendDate('');
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

  const toggleReturnForm = (recordId: string) => {
    setShowReturnForm(showReturnForm === recordId ? null : recordId);
    if (showReturnForm !== recordId) {
      setReturnDate('');
      setReturnNotes('');
    }
  };

  const handleSubmitReturn = (recordId: string) => {
    if (!returnDate.trim()) {
      Taro.showToast({
        title: '请填写归还日期',
        icon: 'none'
      });
      return;
    }

    if (!comic) return;

    const success = dataService.returnLendingRecord(
      comic.id,
      recordId,
      returnDate.trim(),
      returnNotes.trim() || undefined
    );

    if (success) {
      Taro.showToast({
        title: '归还登记成功',
        icon: 'success'
      });
      
      setReturnDate('');
      setReturnNotes('');
      setShowReturnForm(null);
      
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

  const getCurrentLending = (): LendingRecord | null => {
    if (!comic || !comic.lendingHistory) return null;
    const activeRecords = comic.lendingHistory.filter(r => r.isActive);
    return activeRecords.length > 0 ? activeRecords[0] : null;
  };

  const getLendingHistory = (): LendingRecord[] => {
    if (!comic || !comic.lendingHistory) return [];
    return [...comic.lendingHistory].sort((a, b) => 
      new Date(b.lendDate).getTime() - new Date(a.lendDate).getTime()
    );
  };

  const isOverdue = (record: LendingRecord): boolean => {
    if (record.isActive && new Date(record.dueDate) < new Date()) {
      return true;
    }
    return false;
  };

  if (!comic) {
    return (
      <View className={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const progress = (comic.volumes.length / comic.totalVolumes) * 100;
  const currentLending = getCurrentLending();
  const lendingHistory = getLendingHistory();

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
          <Text className={styles.sectionTitle}>🤝 借阅台账</Text>
          
          {currentLending && (
            <View className={styles.currentLendingCard}>
              <View className={styles.currentLendingHeader}>
                <View className={styles.currentLendingTitle}>
                  <Text>📖 当前借出</Text>
                  {isOverdue(currentLending) && (
                    <Text className={styles.overdueBadge}>⚠️ 已逾期</Text>
                  )}
                </View>
              </View>
              <View className={styles.currentLendingInfo}>
                <Text className={styles.currentLendingItem}>
                  借阅人：{currentLending.borrower}
                </Text>
                <Text className={styles.currentLendingItem}>
                  借出日期：{currentLending.lendDate}
                </Text>
                <Text className={styles.currentLendingItem}>
                  应还日期：{currentLending.dueDate}
                </Text>
              </View>
              <View className={styles.currentLendingAction}>
                <View 
                  className={styles.returnButton}
                  onClick={() => toggleReturnForm(currentLending.id)}
                >
                  <Text>登记归还</Text>
                </View>
              </View>
              
              {showReturnForm === currentLending.id && (
                <View className={styles.returnForm}>
                  <View className={styles.returnFormGroup}>
                    <Text className={styles.returnFormLabel}>实际归还日期 *</Text>
                    <Input
                      className={styles.returnFormInput}
                      placeholder='格式: 2024-03-20'
                      value={returnDate}
                      onInput={(e) => setReturnDate(e.detail.value)}
                    />
                  </View>
                  <View className={styles.returnFormGroup}>
                    <Text className={styles.returnFormLabel}>备注（选填）</Text>
                    <Input
                      className={styles.returnFormInput}
                      placeholder='记录归还情况...'
                      value={returnNotes}
                      onInput={(e) => setReturnNotes(e.detail.value)}
                    />
                  </View>
                  <View className={styles.returnFormButtons}>
                    <View 
                      className={styles.cancelReturnButton}
                      onClick={() => toggleReturnForm(currentLending.id)}
                    >
                      <Text>取消</Text>
                    </View>
                    <View 
                      className={styles.confirmReturnButton}
                      onClick={() => handleSubmitReturn(currentLending.id)}
                    >
                      <Text>确认归还</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {lendingHistory.length > 0 ? (
            <View className={styles.lendingHistorySection}>
              <Text className={styles.historyTitle}>📋 历史记录</Text>
              {lendingHistory.map((record, index) => (
                !record.isActive && (
                  <View key={record.id} className={styles.historyCard}>
                    <View className={styles.historyHeader}>
                      <Text className={styles.historyIndex}>第{index + 1}次</Text>
                      <Text className={styles.historyStatus}>已归还</Text>
                    </View>
                    <View className={styles.historyInfo}>
                      <Text className={styles.historyItem}>借阅人：{record.borrower}</Text>
                      <Text className={styles.historyItem}>借出日期：{record.lendDate}</Text>
                      <Text className={styles.historyItem}>应还日期：{record.dueDate}</Text>
                      {record.returnDate && (
                        <Text className={styles.historyItem}>实际归还：{record.returnDate}</Text>
                      )}
                      {record.notes && (
                        <Text className={styles.historyItem}>备注：{record.notes}</Text>
                      )}
                    </View>
                  </View>
                )
              ))}
            </View>
          ) : null}

          {!currentLending && !showLendingForm && (
            <View className={styles.lendingEmpty}>
              <Text className={styles.lendingEmptyText}>暂无借阅记录</Text>
              <View className={styles.actionButton} onClick={toggleLendingForm}>
                <Text>登记借阅</Text>
              </View>
            </View>
          )}

          {showLendingForm && (
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
                <Text className={styles.formLabel}>借出日期 *</Text>
                <Input
                  className={styles.formInput}
                  placeholder='格式: 2024-03-15'
                  value={lendDate}
                  onInput={(e) => setLendDate(e.detail.value)}
                />
              </View>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>应还日期 *</Text>
                <Input
                  className={styles.formInput}
                  placeholder='格式: 2024-04-15'
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
