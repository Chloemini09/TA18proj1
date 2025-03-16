// server.js - UV API代理服务器
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// 创建Express应用
const app = express();

// 启用中间件
app.use(cors({
  origin: 'http://localhost:5173', // 您的Vue应用URL
  methods: ['GET', 'POST'],
  credentials: true
}));// 启用CORS以允许前端应用访问
app.use(express.json()); // 解析JSON请求体

// 主页路由
app.get('/', (req, res) => {
  res.send('UV API 代理服务器正在运行');
});

// 通过经纬度获取UV数据的API端点 - 已修复
app.get('/api/uv', async (req, res) => {
  try {
    // 从请求中获取latitude和longitude参数
    const { lat, lng } = req.query;
    
    // 验证必要参数
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要的参数 (lat, lng)' 
      });
    }
    
    console.log(`获取位置 [${lat}, ${lng}] 的UV数据`);
    
    // 使用axios调用OpenUV API - 修复参数引用
    const response = await axios.get('https://api.openuv.io/api/v1/uv', {
      params: { lat, lng }, // 修复：使用请求中的lat和lng参数
      headers: {
        'x-access-token': process.env.OPENUV_API_KEY
      }
    });
    
    // 将API响应转发给客户端
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('获取UV数据时出错:', error.message);
    
    // 处理API响应错误
    if (error.response) {
      console.error('API响应状态码:', error.response.status);
      console.error('API响应数据:', error.response.data);
      
      return res.status(error.response.status).json({
        success: false,
        error: '获取UV数据失败',
        details: error.response.data
      });
    }
    
    // 处理网络错误或其他错误
    res.status(500).json({ 
      success: false, 
      error: '获取UV数据时发生服务器错误',
      message: error.message
    });
  }
});

// 通过城市名获取UV数据的API端点
app.get('/api/uv/city', async (req, res) => {
  try {
    const { city } = req.query;
    
    // 验证城市参数
    if (!city) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少城市名参数' 
      });
    }
    
    // 澳大利亚主要城市的经纬度查询表
    const australiaCityCoordinates = {
      'Melbourne': { lat: -37.8136, lng: 144.9631 },
      'Sydney': { lat: -33.8688, lng: 151.2093 },
      'Brisbane': { lat: -27.4698, lng: 153.0251 },
      'Perth': { lat: -31.9505, lng: 115.8605 },
      'Adelaide': { lat: -34.9285, lng: 138.6007 },
      'Gold Coast': { lat: -28.0167, lng: 153.4000 },
      'Canberra': { lat: -35.2809, lng: 149.1300 },
      'Hobart': { lat: -42.8821, lng: 147.3272 },
      'Darwin': { lat: -12.4634, lng: 130.8456 }
    };
    
    // 获取城市经纬度
    const cityCoords = australiaCityCoordinates[city];
    if (!cityCoords) {
      return res.status(404).json({ 
        success: false, 
        error: '未找到该城市的坐标数据' 
      });
    }
    
    console.log(`通过城市名 ${city} 获取UV数据，坐标:`, cityCoords);
    
    // 使用axios调用OpenUV API
    const response = await axios.get('https://api.openuv.io/api/v1/uv', {
      params: { lat: cityCoords.lat, lng: cityCoords.lng },
      headers: {
        'x-access-token': process.env.OPENUV_API_KEY
      }
    });
    
    // 将API响应转发给客户端
    res.json({
      success: true,
      data: response.data,
      city: city
    });
  } catch (error) {
    console.error('通过城市名获取UV数据时出错:', error.message);
    
    // 处理API响应错误
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: '获取UV数据失败',
        details: error.response.data
      });
    }
    
    // 处理其他类型的错误
    res.status(500).json({ 
      success: false, 
      error: '获取UV数据时发生服务器错误',
      message: error.message
    });
  }
});

// 提供模拟UV数据的API端点 - 支持经纬度
app.get('/api/uv/mock/coords', (req, res) => {
  const { lat, lng } = req.query;
  
  // 验证必要参数
  if (!lat || !lng) {
    return res.status(400).json({ 
      success: false, 
      error: '缺少必要的参数 (lat, lng)' 
    });
  }
  
  // 根据经纬度生成合理的模拟UV值
  // 基于纬度的简单UV预测（越接近赤道，UV越高）
  const latAbs = Math.abs(parseFloat(lat));
  let uvBase = 10 - (latAbs / 10); // 赤道最高约10，极地最低约0
  
  // 添加一些随机变化
  const randomFactor = Math.random() * 2 - 1; // -1到1之间
  const uvValue = Math.max(0, Math.min(12, uvBase + randomFactor)).toFixed(1);
  
  // 模拟数据生成时间
  const currentTime = new Date();
  const maxUVTime = new Date(currentTime);
  maxUVTime.setHours(13, 0, 0, 0); // 通常中午时分UV最高
  
  // 创建与OpenUV API响应结构相似的模拟数据
  const mockData = {
    result: {
      uv: parseFloat(uvValue),
      uv_time: currentTime.toISOString(),
      uv_max: Math.round(parseFloat(uvValue) * 1.2 * 10) / 10, // 最大值通常比当前值高20%左右
      uv_max_time: maxUVTime.toISOString(),
      safe_exposure_time: {
        st1: Math.floor(200 / parseFloat(uvValue)), // 皮肤类型1的安全暴露时间（分钟）
        st2: Math.floor(300 / parseFloat(uvValue)), // 皮肤类型2的安全暴露时间
        st3: Math.floor(400 / parseFloat(uvValue)), // 皮肤类型3的安全暴露时间
        st4: Math.floor(500 / parseFloat(uvValue)), // 皮肤类型4的安全暴露时间
        st5: Math.floor(600 / parseFloat(uvValue)), // 皮肤类型5的安全暴露时间
        st6: Math.floor(700 / parseFloat(uvValue))  // 皮肤类型6的安全暴露时间
      },
      sun_info: {
        sun_position: {
          altitude: 45 + (Math.random() * 10 - 5), // 太阳高度角度
          azimuth: 180 + (Math.random() * 30 - 15)  // 太阳方位角度
        },
        sun_times: {
          sunrise: new Date(new Date().setHours(6, Math.floor(Math.random() * 30), 0, 0)).toISOString(),
          sun_noon: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
          sunset: new Date(new Date().setHours(18, Math.floor(Math.random() * 30), 0, 0)).toISOString()
        }
      }
    }
  };
  
  // 返回模拟数据
  res.json({
    success: true,
    data: mockData,
    mock: true,
    location: {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    }
  });
});

// 提供模拟UV数据的API端点 - 城市名
app.get('/api/uv/mock', (req, res) => {
  const { city } = req.query;
  
  // 不同城市的UV值模拟数据
  const cityUVMap = {
    'Melbourne': 4.2,
    'Sydney': 5.8,
    'Brisbane': 7.3,
    'Perth': 6.5,
    'Adelaide': 5.1,
    'Gold Coast': 7.8,
    'Canberra': 4.5,
    'Hobart': 3.8,
    'Darwin': 9.2,
    'default': 3.5
  };
  
  // 获取UV值，如果城市不存在则使用默认值
  const cityName = city || 'default';
  const uvValue = cityUVMap[cityName] || cityUVMap.default;
  
  // 模拟数据生成时间
  const currentTime = new Date();
  const maxUVTime = new Date(currentTime);
  maxUVTime.setHours(13, 0, 0, 0); // 通常中午时分UV最高
  
  // 创建与OpenUV API响应结构相似的模拟数据
  const mockData = {
    result: {
      uv: uvValue,
      uv_time: currentTime.toISOString(),
      uv_max: Math.round(uvValue * 1.2 * 10) / 10, // 最大值通常比当前值高20%左右
      uv_max_time: maxUVTime.toISOString(),
      safe_exposure_time: {
        st1: Math.floor(200 / uvValue), // 皮肤类型1的安全暴露时间（分钟）
        st2: Math.floor(300 / uvValue), // 皮肤类型2的安全暴露时间
        st3: Math.floor(400 / uvValue), // 皮肤类型3的安全暴露时间
        st4: Math.floor(500 / uvValue), // 皮肤类型4的安全暴露时间
        st5: Math.floor(600 / uvValue), // 皮肤类型5的安全暴露时间
        st6: Math.floor(700 / uvValue)  // 皮肤类型6的安全暴露时间
      },
      sun_info: {
        sun_position: {
          altitude: 45 + (Math.random() * 10 - 5), // 太阳高度角度
          azimuth: 180 + (Math.random() * 30 - 15)  // 太阳方位角度
        },
        sun_times: {
          sunrise: new Date(new Date().setHours(6, Math.floor(Math.random() * 30), 0, 0)).toISOString(),
          sun_noon: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
          sunset: new Date(new Date().setHours(18, Math.floor(Math.random() * 30), 0, 0)).toISOString()
        }
      }
    }
  };
  
  // 返回模拟数据
  res.json({
    success: true,
    data: mockData,
    mock: true,
    city: cityName
  });
});

// 服务器状态检查端点
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    serverTime: new Date().toISOString(),
    apiKey: process.env.OPENUV_API_KEY ? 'configured' : 'missing'
  });
});

// 捕获所有其他路由
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '请求的资源不存在',
    availableEndpoints: [
      '/',
      '/api/uv',
      '/api/uv/city',
      '/api/uv/mock',
      '/api/uv/mock/coords',
      '/api/status'
    ]
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`UV API 代理服务器已在端口 ${PORT} 上启动`);
  console.log(`主页: http://localhost:${PORT}/`);
  console.log(`状态检查: http://localhost:${PORT}/api/status`);
  console.log(`通过经纬度获取UV数据: http://localhost:${PORT}/api/uv?lat=-37.8136&lng=144.9631`);
  console.log(`模拟数据(城市): http://localhost:${PORT}/api/uv/mock?city=Melbourne`);
  console.log(`模拟数据(经纬度): http://localhost:${PORT}/api/uv/mock/coords?lat=-37.8136&lng=144.9631`);
});