import React from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native';
import { PieChart, BarChart, LineChart, ProgressChart } from 'react-native-chart-kit';

const chartConfig = {
  backgroundGradientFrom: '#f3f3f3',
  backgroundGradientTo: '#ececec',
  color: (opacity = 1) => `rgba(26, 188, 156, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  useShadowColorFromDataset: false,
};

const pieChartData = [
  { name: 'JavaScript', population: 30, color: '#ffcd56', legendFontColor: '#2C3E50', legendFontSize: 15 },
  { name: 'Python', population: 50, color: '#36a2eb', legendFontColor: '#2C3E50', legendFontSize: 15 },
  { name: 'Java', population: 20, color: '#ff6384', legendFontColor: '#2C3E50', legendFontSize: 15 },
];

const barChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
};

const lineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{ data: [30, 40, 80, 55, 90, 100] }],
};

const progressChartData = {
  labels: ['Progress'],
  data: [0.6],
};

const Charts = () => (
  <View style={styles.chartContainer}>
    {/* <Text style={styles.title}>Dashboard Charts</Text> */}
    <PieChart
      data={pieChartData}
      width={Dimensions.get('window').width - 50}
      height={220}
      chartConfig={chartConfig}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      absolute
    />
    <BarChart
      style={styles.chart}
      data={barChartData}
      width={Dimensions.get('window').width - 50}
      height={220}
      chartConfig={chartConfig}
      verticalLabelRotation={30}
    />
    <LineChart
      style={styles.chart}
      data={lineChartData}
      width={Dimensions.get('window').width - 50}
      height={220}
      chartConfig={chartConfig}
    />
    <ProgressChart
      data={progressChartData}
      width={Dimensions.get('window').width - 50}
      height={220}
      chartConfig={chartConfig}
      strokeWidth={16}
      radius={32}
    />
  </View>
);

const styles = StyleSheet.create({
  chartContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2C3E50',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default Charts;
