import React, { useState, useEffect } from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { dataService, StoredComic } from '../../services/dataService';

interface ScanResult {
  title: string;
  author?: string;
  publisher?: string;
  totalVolumes?: number;
}

const AddPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [totalVolumes, setTotalVolumes] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseChannel, setPurchaseChannel] = useState('');
  const [condition, setCondition] = useState('全新');
  const [isKey, setIsKey] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedVolumes, setSelectedVolumes] = useState<number[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<StoredComic | null>(null);

  useEffect(() => {
    if (scanResult) {
      setTitle(scanResult.title || '');
      setAuthor(scanResult.author || '');
      setPublisher(scanResult.publisher || '');
      setTotalVolumes(scanResult.totalVolumes?.toString() || '');
    }
  }, [scanResult]);

  const checkDuplicate = (newTitle: string) => {
    if (!newTitle.trim()) {
      setDuplicateWarning(null);
      return;
    }
    
    const existing = dataService.checkDuplicateTitle(newTitle);
    if (existing) {
      setDuplicateWarning(existing);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleTitleInput = (value: string) => {
    setTitle(value);
    checkDuplicate(value);
  };

  const handleScanCode = () => {
    Taro.scanCode({
      success: (res) => {
        console.log('[Add] Scan success:', res);
        
        if (res.result) {
          const mockScanData: ScanResult = generateMockScanData(res.result);
          setScanResult(mockScanData);
          
          Taro.showModal({
            title: '扫描成功',
            content: `检测到: ${mockScanData.title}\n是否使用此信息继续录入?`,
            confirmText: '使用',
            cancelText: '取消',
            success: (modalRes) => {
              if (!modalRes.confirm) {
                setScanResult(null);
                setTitle('');
                setAuthor('');
                setPublisher('');
                setTotalVolumes('');
              }
            }
          });
        }
      },
      fail: () => {
        Taro.showToast({
          title: '扫码失败，请重试',
          icon: 'none'
        });
      }
    });
  };

  const generateMockScanData = (scanText: string): ScanResult => {
    const titles = ['进击的巨人', '咒术回战', 'ONE PIECE', '鬼灭之刃', '链锯人', '死亡笔记', '钢之炼金术师'];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    
    return {
      title: scanText || randomTitle,
      author: '作者待定',
      publisher: '出版社待定',
      totalVolumes: Math.floor(Math.random() * 20) + 5
    };
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setCoverImage(res.tempFilePaths[0]);
      }
    });
  };

  const toggleVolume = (vol: number) => {
    const newVolumes = selectedVolumes.includes(vol)
      ? selectedVolumes.filter(v => v !== vol)
      : [...selectedVolumes, vol].sort((a, b) => a - b);
    setSelectedVolumes(newVolumes);
  };

  const selectAllVolumes = () => {
    const allVolumes = [];
    const total = parseInt(totalVolumes) || 0;
    for (let i = 1; i <= total; i++) {
      allVolumes.push(i);
    }
    setSelectedVolumes(allVolumes);
  };

  const clearAllVolumes = () => {
    setSelectedVolumes([]);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({
        title: '请输入漫画名称',
        icon: 'none'
      });
      return;
    }

    const newComic: StoredComic = {
      id: dataService.generateId(),
      title: title.trim(),
      author: author.trim() || '未知作者',
      publisher: publisher.trim() || '未知出版社',
      volumes: selectedVolumes,
      totalVolumes: parseInt(totalVolumes) || selectedVolumes.length,
      coverUrl: coverImage || 'https://picsum.photos/id/200/300/400',
      purchasePrice: parseFloat(purchasePrice) || 0,
      purchaseChannel: purchaseChannel.trim() || '未知渠道',
      condition: condition as StoredComic['condition'],
      genre: '未分类',
      isKey,
      notes: notes.trim(),
      coverImage: coverImage || 'https://picsum.photos/id/200/300/400',
      addDate: new Date().toISOString().split('T')[0],
      lendingHistory: []
    };

    const success = dataService.saveComic(newComic);

    if (success) {
      Taro.showToast({
        title: '添加成功',
        icon: 'success'
      });

      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    } else {
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  };

  const handleUseExisting = () => {
    if (duplicateWarning) {
      Taro.showModal({
        title: '已有收藏',
        content: `"${duplicateWarning.title}" 已收藏\n作者: ${duplicateWarning.author}\n已有卷数: ${duplicateWarning.volumes.length}/${duplicateWarning.totalVolumes}卷\n\n是否查看详情?`,
        confirmText: '查看详情',
        cancelText: '继续添加',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({
              url: `/pages/detail/index?id=${duplicateWarning.id}`
            });
          } else {
            setDuplicateWarning(null);
          }
        }
      });
    }
  };

  const renderVolumeGrid = () => {
    const total = parseInt(totalVolumes) || 0;
    const volumes = [];
    for (let i = 1; i <= Math.min(total, 50); i++) {
      volumes.push(i);
    }

    return (
      <View className={styles.volumeGrid}>
        {volumes.map(vol => (
          <View
            key={vol}
            className={`${styles.volumeTag} ${selectedVolumes.includes(vol) ? styles.volumeTagSelected : ''}`}
            onClick={() => toggleVolume(vol)}
          >
            <Text>{vol}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>添加新藏品</Text>
        <Text className={styles.subTitle}>记录你的每一本珍贵收藏</Text>
      </View>

      {duplicateWarning && (
        <View className={styles.warningCard} onClick={handleUseExisting}>
          <View className={styles.warningContent}>
            <Text className={styles.warningIcon}>⚠️</Text>
            <View className={styles.warningText}>
              <Text className={styles.warningTitle}>发现已有收藏</Text>
              <Text className={styles.warningDesc}>
                「{duplicateWarning.title}」已收藏 {duplicateWarning.volumes.length}/{duplicateWarning.totalVolumes}卷
              </Text>
              <Text className={styles.warningAction}>点击查看详情</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.quickActions}>
        <View className={styles.actionGrid}>
          <View className={styles.actionCard} onClick={handleScanCode}>
            <View className={styles.actionIcon}>
              <Text>📷</Text>
            </View>
            <Text className={styles.actionText}>扫码添加</Text>
          </View>
          <View className={styles.actionCard} onClick={handleChooseImage}>
            <View className={styles.actionIcon}>
              <Text>📸</Text>
            </View>
            <Text className={styles.actionText}>拍照上传</Text>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>📖 基础信息</Text>

        {coverImage && (
          <View className={styles.coverPreview}>
            <Image src={coverImage} mode='aspectFill' />
            <View className={styles.removeCover} onClick={() => setCoverImage('')}>
              <Text>✕</Text>
            </View>
          </View>
        )}

        {!coverImage && (
          <View className={styles.uploadArea} onClick={handleChooseImage}>
            <Text className={styles.uploadIcon}>📷</Text>
            <Text className={styles.uploadText}>上传封面照片</Text>
          </View>
        )}

        <View className={styles.formGroup}>
          <Text className={styles.label}>漫画名称 *</Text>
          <Input
            className={styles.input}
            placeholder='请输入漫画名称'
            value={title}
            onInput={(e) => handleTitleInput(e.detail.value)}
          />
        </View>

        <View className={styles.inputRow}>
          <View className={styles.inputHalf}>
            <Text className={styles.label}>作者</Text>
            <Input
              className={styles.input}
              placeholder='作者名称'
              value={author}
              onInput={(e) => setAuthor(e.detail.value)}
            />
          </View>
          <View className={styles.inputHalf}>
            <Text className={styles.label}>出版社</Text>
            <Input
              className={styles.input}
              placeholder='出版社'
              value={publisher}
              onInput={(e) => setPublisher(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.inputRow}>
          <View className={styles.inputHalf}>
            <Text className={styles.label}>总卷数</Text>
            <Input
              className={styles.input}
              type='number'
              placeholder='总卷数'
              value={totalVolumes}
              onInput={(e) => {
                setTotalVolumes(e.detail.value);
                setSelectedVolumes([]);
              }}
            />
          </View>
          <View className={styles.inputHalf}>
            <Text className={styles.label}>购买价格</Text>
            <Input
              className={styles.input}
              type='number'
              placeholder='价格(元)'
              value={purchasePrice}
              onInput={(e) => setPurchasePrice(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>购买渠道</Text>
          <Input
            className={styles.input}
            placeholder='当当网/京东/实体店等'
            value={purchaseChannel}
            onInput={(e) => setPurchaseChannel(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>📚 已有卷册</Text>
        
        {totalVolumes ? (
          <View className={styles.volumesSection}>
            {renderVolumeGrid()}
            <View className={styles.quickButtons}>
              <View className={styles.quickButton} onClick={selectAllVolumes}>
                <Text>全选</Text>
              </View>
              <View className={styles.quickButton} onClick={clearAllVolumes}>
                <Text>清空</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className={styles.uploadArea}>
            <Text className={styles.uploadText}>请先输入总卷数</Text>
          </View>
        )}
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>✨ 品相与备注</Text>

        <View className={styles.formGroup}>
          <Text className={styles.label}>品相等级</Text>
          <View className={styles.conditionGrid}>
            {['全新', '近乎全新', '很好', '好', '一般'].map((c) => (
              <View
                key={c}
                className={`${styles.conditionTag} ${condition === c ? styles.conditionTagSelected : ''}`}
                onClick={() => setCondition(c)}
              >
                <Text>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <View className={styles.keyToggle}>
            <View className={styles.toggleLabel}>
              <Text>⭐</Text>
              <Text>重点藏品（防重复购买）</Text>
            </View>
            <View 
              className={`${styles.toggleSwitch} ${isKey ? styles.toggleSwitchActive : ''}`}
              onClick={() => setIsKey(!isKey)}
            >
              <View className={`${styles.toggleDot} ${isKey ? styles.toggleDotActive : ''}`} />
            </View>
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>收藏备注</Text>
          <Input
            className={styles.input}
            placeholder='记录品相细节、购买故事等...'
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.submitButton} onClick={handleSubmit}>
          <Text>保存藏品</Text>
        </View>
      </View>
    </View>
  );
};

export default AddPage;
