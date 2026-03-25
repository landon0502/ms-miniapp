<template>
  <div class="dashboard-container">
    <div class="page-title">仪表盘</div>
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">1,234</div>
          <div class="stat-label">总用户数</div>
        </div>
        <el-icon class="stat-icon"><User /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">5,678</div>
          <div class="stat-label">总商品数</div>
        </div>
        <el-icon class="stat-icon"><Goods /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">9,012</div>
          <div class="stat-label">总订单数</div>
        </div>
        <el-icon class="stat-icon"><Tickets /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">¥123,456</div>
          <div class="stat-label">总销售额</div>
        </div>
        <el-icon class="stat-icon"><Money /></el-icon>
      </el-card>
    </div>
    <div class="chart-container">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>销售趋势</span>
            <el-select v-model="timeRange" size="small" @change="updateCharts">
              <el-option label="近7天" value="7" />
              <el-option label="近30天" value="30" />
              <el-option label="近90天" value="90" />
            </el-select>
          </div>
        </template>
        <div class="chart-content">
          <div ref="lineChartRef" class="chart"></div>
        </div>
      </el-card>
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>商品分类分布</span>
          </div>
        </template>
        <div class="chart-content">
          <div ref="pieChartRef" class="chart"></div>
        </div>
      </el-card>
      <el-card class="chart-card full-width">
        <template #header>
          <div class="card-header">
            <span>订单状态分布</span>
          </div>
        </template>
        <div class="chart-content">
          <div ref="barChartRef" class="chart"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { User, Goods, Tickets, Money } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

export default {
  name: 'Dashboard',
  components: {
    User,
    Goods,
    Tickets,
    Money
  },
  setup() {
    const lineChartRef = ref(null)
    const pieChartRef = ref(null)
    const barChartRef = ref(null)
    const timeRange = ref('7')
    let lineChart = null
    let pieChart = null
    let barChart = null

    // 销售趋势数据
    const getSalesData = () => {
      const days = parseInt(timeRange.value)
      const data = []
      const categories = []
      const today = new Date()
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        categories.push(`${date.getMonth() + 1}/${date.getDate()}`)
        data.push(Math.floor(Math.random() * 5000) + 1000)
      }
      
      return { categories, data }
    }

    // 商品分类数据
    const getCategoryData = () => {
      return [
        { name: '护肤品', value: 35 },
        { name: '彩妆', value: 25 },
        { name: '香水', value: 15 },
        { name: '珠宝', value: 10 },
        { name: '配饰', value: 15 }
      ]
    }

    // 订单状态数据
    const getOrderStatusData = () => {
      return {
        categories: ['待支付', '已支付', '已发货', '已完成', '已取消'],
        data: [120, 320, 280, 450, 80]
      }
    }

    // 初始化折线图
    const initLineChart = () => {
      if (lineChartRef.value) {
        lineChart = echarts.init(lineChartRef.value)
        updateLineChart()
      }
    }

    // 更新折线图
    const updateLineChart = () => {
      if (!lineChart) return
      
      const { categories, data } = getSalesData()
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderColor: '#1890ff',
          textStyle: {
            color: '#fff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: categories,
          axisLine: {
            lineStyle: {
              color: '#909399'
            }
          },
          axisLabel: {
            color: '#606266'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#909399'
            }
          },
          axisLabel: {
            color: '#606266'
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [
          {
            name: '销售额',
            type: 'line',
            stack: 'Total',
            data: data,
            smooth: true,
            lineStyle: {
              color: '#1890ff',
              width: 3
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(24, 144, 255, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(24, 144, 255, 0.1)'
                }
              ])
            },
            itemStyle: {
              color: '#1890ff'
            }
          }
        ]
      }
      lineChart.setOption(option)
    }

    // 初始化饼图
    const initPieChart = () => {
      if (pieChartRef.value) {
        pieChart = echarts.init(pieChartRef.value)
        updatePieChart()
      }
    }

    // 更新饼图
    const updatePieChart = () => {
      if (!pieChart) return
      
      const data = getCategoryData()
      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderColor: '#1890ff',
          textStyle: {
            color: '#fff'
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: {
            color: '#606266'
          }
        },
        series: [
          {
            name: '商品分类',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data,
            color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
          }
        ]
      }
      pieChart.setOption(option)
    }

    // 初始化柱状图
    const initBarChart = () => {
      if (barChartRef.value) {
        barChart = echarts.init(barChartRef.value)
        updateBarChart()
      }
    }

    // 更新柱状图
    const updateBarChart = () => {
      if (!barChart) return
      
      const { categories, data } = getOrderStatusData()
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderColor: '#1890ff',
          textStyle: {
            color: '#fff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLine: {
            lineStyle: {
              color: '#909399'
            }
          },
          axisLabel: {
            color: '#606266'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#909399'
            }
          },
          axisLabel: {
            color: '#606266'
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [
          {
            name: '订单数量',
            type: 'bar',
            data: data,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#1890ff'
                },
                {
                  offset: 1,
                  color: '#69c0ff'
                }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '60%'
          }
        ]
      }
      barChart.setOption(option)
    }

    // 更新所有图表
    const updateCharts = () => {
      updateLineChart()
      updatePieChart()
      updateBarChart()
    }

    // 响应式处理
    const handleResize = () => {
      lineChart?.resize()
      pieChart?.resize()
      barChart?.resize()
    }

    onMounted(() => {
      initLineChart()
      initPieChart()
      initBarChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      lineChart?.dispose()
      pieChart?.dispose()
      barChart?.dispose()
    })

    return {
      lineChartRef,
      pieChartRef,
      barChartRef,
      timeRange,
      updateCharts
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background: transparent;
  min-height: 100vh;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.25);
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.stat-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0.3;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

.chart-card {
  height: 400px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-content {
  height: calc(100% - 48px);
  padding: 16px;
  background: transparent;
  border-radius: 4px;
}

.chart {
  width: 100%;
  height: 100%;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card {
    height: 300px;
  }
}
</style>
