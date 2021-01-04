<template>
  <p>{{pieData}}</p>
  <canvas class="pie" ref="canvas">
  </canvas>
</template>

<script>
import {onMounted, ref} from 'vue'
import Chart from 'chart.js';

let theChart
let theChartDataset

export default {
  name: 'Pie',

  props : {
    pieData : {
      required : true,
      type : Array
    },
    pieLabels : {
      required : true,
      type : Array
    },
  },

  data() {
    return {
      isAwake : false,
      pieBackgrounds : [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
      ],
      pieBorders : [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
      ]
    }
  },

  methods : {
    wakeUp : function(){
      theChart.data.labels = this.pieLabels
      theChartDataset.backgroundColor = this.pieBackgrounds
      theChartDataset.borderColor = this.pieBorders
    }
  },

  watch : {
    pieData(){
      console.log('CHANGE', this.pieData);
      !this.isAwake && this.wakeUp()
      theChart.data.datasets[0].data = this.pieData
      theChart.update()
    }
  },

  mounted() {
    theChart = new Chart(this.$refs.canvas, {
        type: 'doughnut',
        responsive: true,
        cutoutPercentage : 10,
        data: {
          labels: [],
          datasets: [{
            data: [1,0],
            backgroundColor: '#ccc',
            borderColor: '#555',
            // borderWidth: 1
          }]
        },
        // options: {
        //   title: {
        //     display: true,
        //     text: 'Predicted world population (millions) in 2050'
        //   }
        // }
      })

    theChartDataset = theChart.data.datasets[0]
  }
}
</script>
