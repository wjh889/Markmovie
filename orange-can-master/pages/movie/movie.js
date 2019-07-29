var util = require('../../util/util.js')
var app = getApp();
Page({
  data: {
    inTheaters: {},
    comingSoon: {},
    top250: {},
    containerShow: true,
    searchPanelShow: false,
    searchResult: {},
  },
  onLoad: function (event) {
    var inTheatersUrl = app.globalData.doubanBase + "in_theaters" + "?city=上海&start=0&count=10";
    var comingSoonUrl = app.globalData.doubanBase +
      "coming_soon" + "?start=0&count=10";
    var top250Url = app.globalData.doubanBase +
      "top250" + "?start=0&count=10";
   
   
    wx.showNavigationBarLoading();
    console.log('show');

    this.getMovieListData(inTheatersUrl, "in_theaters", "正在热映");
    this.getMovieListData(comingSoonUrl, "coming_soon", "即将上映");
    this.getMovieListData(top250Url, "top250", "豆瓣Top250");
  },

  getMovieListData: function (url, settedKey, categoryTitle) {
    var that = this;
    wx.request({
      url: url,
      method: 'GET',
      header: {
        "content-type": "json"
      },
      success: function (res) {
        that.processDoubanData(res.data, settedKey, categoryTitle);
        //console.log(url);
      },
      fail: function (error) {
        // fail
        console.log(error)
      }
    })
  },

  processDoubanData: function (moviesDouban, settedKey,
    categoryTitle) {
    var movies = [];
    console.log(moviesDouban)
    if (moviesDouban.count == 0) {
      wx.showToast({
        title: '正在搜索...',
        icon: 'loading',
        duration: 200,
      });
      this.setData({
        searchPanelShow: false
      })
    }
    else {
     
      wx.showToast({
        title: '正在加载',
        icon: 'loading',
        duration: 500,


      })
      this.setData({
        searchPanelShow: true
        
      })
      for (var idx in moviesDouban.subjects) {
        var subject = moviesDouban.subjects[idx];
        var title = subject.title;
        if (title.length >= 6) {
          title = title.substring(0, 6) + "...";
        }
        // [1,1,1,1,1] [1,1,1,0,0]

        var temp = {
          stars: util.convertToStarsArray(subject.rating.stars),
          title: title,
          average: subject.rating.average,
          coverageUrl: subject.images.large,
          movieId: settedKey=='searchResult'?'old'+subject.id:subject.id
        }
        movies.push(temp)
      }
      var readyData = {};
      readyData[settedKey] = {
        categoryTitle: categoryTitle,
        movies: movies
      }
      this.setData(readyData);
      console.log('hide');
      //IMPROVE：三分类全加载后再hide
      wx.hideNavigationBarLoading();
    }

  },

  onMoreTap: function (event) {
    var category = event.currentTarget.dataset.category;
    wx.navigateTo({
      url: "more-movie/more-movie?category=" + category
    })
  },

  onMovieTap: function (event) {
    var movieId = event.currentTarget.dataset.movieId;
    wx.navigateTo({
      url: "movie-detail/movie-detail?id=" + movieId
    })
  },

  onBindFocus: function (event) {
    this.setData({
      containerShow: false,
      searchPanelShow: false,
      cancelShow:true,

    })
  },

  onCancelImgTap: function (event) {
    this.setData({
      containerShow: true,
      searchPanelShow: false,
      searchResult: {},
      inputValue: ''
    }
    )
  },
  onBindConfirm: function (event) {
    var discountName = event.detail.value['search - input'] ? event.detail.value['search - input'] : event.detail.value
    console.log('event.detail.value', discountName)
    //var keyWord = event.detail.value；
    if (discountName == null || discountName.trim()=="")
    {
      this.setData({
        searchPanelShow: false
      })
    }else{
      //https://brainext.club:5000/forwardreq/https/api.douban.com/v2/movie/in_theaters?start=0&count=3
      var searchUrl = app.globalData.doubanOld+"v2/movie/search?q=" + discountName.trim();
      //var searchUrl = "http://t.yushu.im/v2/movie/search?q=" + discountName.trim();
      this.getMovieListData(searchUrl, "searchResult", "");
    }
  }
  
})
