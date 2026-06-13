import React, { useState } from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

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

  const handleScanCode = () => {
    Taro.scanCode({
      success: (res) => {
        console.log('[Add] Scan code success:', res);
        Taro.showToast({
          title: '扫码功能暂未开放',
          icon: 'none'
        });
      },
      fail: () => {
        Taro.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
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

    Taro.showToast({
      title: '添加成功',
      icon: 'success'
    });

    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
  };

  const renderVolumeGrid = () => {
    const total = parseInt(totalVolumes) || 0;
    const volumes = [];
    for (let i = 1; i <= Math.min(total, 30); i++) {
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
            onInput={(e) => setTitle(e.detail.value)}
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
