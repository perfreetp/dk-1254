export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/add/index',
    'pages/bookshelf/index',
    'pages/stats/index',
    'pages/detail/index',
    'pages/missing/index',
    'pages/lending/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FEFAE0',
    navigationBarTitleText: '漫画收藏馆',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#D4A373',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/add/index',
        text: '录入'
      },
      {
        pagePath: 'pages/bookshelf/index',
        text: '书架'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计'
      }
    ]
  }
})
