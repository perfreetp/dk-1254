import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { dataService, StoredComic, LendingRecord } from '../../services/dataService';

interface LendingDisplayItem {
  comic: StoredComic;
  record: LendingRecord;
}

const LendingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'returned'>('active');
  const [lendingRecords, setLendingRecords] = useState<LendingDisplayItem[]>([]);
  const [returnedRecords, setReturnedRecords] = useState<LendingDisplayItem[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [returnedCount, setReturnedCount] = useState(0);

  const loadRecords = () => {
    const allLendingRecords = dataService.getAllLendingRecords();
    const active: LendingDisplayItem[] = [];
    const returned: LendingDisplayItem[] = [];

    allLendingRecords.forEach(({ comic, record }) => {
      if (record.isActive) {
        active.push({ comic, record });
      } else {
        returned.push({ comic, record });
      }
    });

    setLendingRecords(active);
    setReturnedRecords(returned);
    setActiveCount(active.length);
    setReturnedCount(returned.length);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  useDidShow(() => {
    loadRecords();
  });

  const handleMarkReturned = (comicId: string, recordId: string) => {
    Taro.showModal({
      title: '确认归还',
      content: '确认该藏品已归还吗？',
      success: (res) => {
        if (res.confirm) {
          const today = new Date().toISOString().split('T')[0];
          const success = dataService.returnLendingRecord(comicId, recordId, today);

          if (success) {
            Taro.showToast({
              title: '已标记归还',
              icon: 'success'
            });
            
            setTimeout(() => {
              loadRecords();
            }, 1500);
          }
        }
      }
    });
  };

  const handleAddLending = () => {
    Taro.showToast({
      title: '请在详情页登记借阅',
      icon: 'none'
    });
  };

  const isOverdue = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date();
  };

  const currentRecords = activeTab === 'active' ? lendingRecords : returnedRecords;

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>借阅记录</Text>
        <Text className={styles.subTitle}>追踪你的藏品借出情况，确保按时归还</Text>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{activeCount}</Text>
          <Text className={styles.statLabel}>借出中</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{returnedCount}</Text>
          <Text className={styles.statLabel}>已归还</Text>
        </View>
      </View>

      <View className={styles.tabSection}>
        <View 
          className={`${styles.tab} ${activeTab === 'active' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Text>借出中 ({activeCount})</Text>
        </View>
        <View 
          className={`${styles.tab} ${activeTab === 'returned' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('returned')}
        >
          <Text>已归还 ({returnedCount})</Text>
        </View>
      </View>

      {currentRecords.length > 0 ? (
        <View className={styles.lendingList}>
          {currentRecords.map(({ comic, record }) => (
            <View key={record.id} className={styles.lendingCard}>
              <Image
                className={styles.lendingCover}
                src={comic.coverImage}
                mode='aspectFill'
              />
              <View className={styles.lendingInfo}>
                <View className={styles.lendingTop}>
                  <Text className={styles.lendingTitle}>{comic.title}</Text>
                  <Text className={styles.lendingAuthor}>{comic.author}</Text>
                </View>
                <View className={styles.lendingMeta}>
                  <Text className={styles.lendingItem}>
                    借阅人：{record.borrower}
                  </Text>
                  <Text className={styles.lendingItem}>
                    借出日期：{record.lendDate}
                  </Text>
                  <Text className={styles.lendingItem}>
                    应还日期：{record.dueDate}
                    {activeTab === 'active' && isOverdue(record.dueDate) && (
                      <Text className={`${styles.lendingStatus} ${styles.statusOverdue}`}>
                        已逾期
                      </Text>
                    )}
                    {activeTab === 'active' && !isOverdue(record.dueDate) && (
                      <Text className={`${styles.lendingStatus} ${styles.statusNormal}`}>
                        正常
                      </Text>
                    )}
                    {activeTab === 'returned' && (
                      <Text className={`${styles.lendingStatus} ${styles.statusReturned}`}>
                        已归还
                      </Text>
                    )}
                  </Text>
                  {activeTab === 'returned' && record.returnDate && (
                    <Text className={styles.lendingItem}>
                      实际归还：{record.returnDate}
                    </Text>
                  )}
                  {activeTab === 'returned' && record.notes && (
                    <Text className={styles.lendingItem}>
                      备注：{record.notes}
                    </Text>
                  )}
                </View>
                {activeTab === 'active' && (
                  <View className={styles.actionArea}>
                    <View 
                      className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                      onClick={() => handleMarkReturned(comic.id, record.id)}
                    >
                      <Text>标记归还</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>
            {activeTab === 'active' ? '📖' : '✅'}
          </Text>
          <Text className={styles.emptyText}>
            {activeTab === 'active' 
              ? '暂无借出记录\n快去分享你的藏品吧' 
              : '暂无已归还记录'}
          </Text>
          {activeTab === 'active' && (
            <View className={styles.addButton} onClick={handleAddLending}>
              <Text>登记借阅</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default LendingPage;
