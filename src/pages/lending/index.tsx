import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockComics } from '../../data/comics';
import { Comic } from '../../types/comic';

interface LendingRecord {
  comic: Comic;
  lendingInfo: NonNullable<Comic['lendingInfo']>;
}

const LendingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'returned'>('active');
  const [lendingRecords, setLendingRecords] = useState<LendingRecord[]>([]);
  const [returnedRecords, setReturnedRecords] = useState<LendingRecord[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [returnedCount, setReturnedCount] = useState(0);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const active: LendingRecord[] = [];
    const returned: LendingRecord[] = [];

    mockComics.forEach(comic => {
      if (comic.lendingInfo) {
        if (comic.lendingInfo.returned) {
          returned.push({ comic, lendingInfo: comic.lendingInfo });
        } else {
          active.push({ comic, lendingInfo: comic.lendingInfo });
        }
      }
    });

    setLendingRecords(active);
    setReturnedRecords(returned);
    setActiveCount(active.length);
    setReturnedCount(returned.length);
  };

  const handleMarkReturned = (comicId: string) => {
    Taro.showModal({
      title: '确认归还',
      content: '确认该藏品已归还吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '已标记归还',
            icon: 'success'
          });
          setTimeout(() => {
            loadRecords();
          }, 1500);
        }
      }
    });
  };

  const handleAddLending = () => {
    Taro.showToast({
      title: '借阅登记功能开发中',
      icon: 'none'
    });
  };

  const isOverdue = (dueDate: string) => {
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
          {currentRecords.map(record => (
            <View key={record.comic.id} className={styles.lendingCard}>
              <Image
                className={styles.lendingCover}
                src={record.comic.coverImage}
                mode='aspectFill'
              />
              <View className={styles.lendingInfo}>
                <View className={styles.lendingTop}>
                  <Text className={styles.lendingTitle}>{record.comic.title}</Text>
                  <Text className={styles.lendingAuthor}>{record.comic.author}</Text>
                </View>
                <View className={styles.lendingMeta}>
                  <Text className={styles.lendingItem}>
                    借阅人：{record.lendingInfo.borrower}
                  </Text>
                  <Text className={styles.lendingItem}>
                    借出日期：{record.lendingInfo.lendDate}
                  </Text>
                  <Text className={styles.lendingItem}>
                    应还日期：{record.lendingInfo.dueDate}
                    {activeTab === 'active' && isOverdue(record.lendingInfo.dueDate) && (
                      <Text className={`${styles.lendingStatus} ${styles.statusOverdue}`}>
                        已逾期
                      </Text>
                    )}
                    {activeTab === 'active' && !isOverdue(record.lendingInfo.dueDate) && (
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
                </View>
                {activeTab === 'active' && (
                  <View className={styles.actionArea}>
                    <View 
                      className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                      onClick={() => handleMarkReturned(record.comic.id)}
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
