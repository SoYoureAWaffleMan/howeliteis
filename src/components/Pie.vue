<template>
  <p>{{pieData}}</p>
  <canvas class="pie" ref="canvas">
  </canvas>
</template>

<script>
import Chart from 'chart.js';

let theChart
let theDataset

export default {
  name: 'Pie',

  props : {
    pieTitle : {
      default : ''
    },
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
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(150, 20, 200, 0.2)',
        'rgba(180, 180, 180, 0.2)',
      ],
      pieBorders : [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(150, 20, 200, 1)',
        'rgba(180, 180, 180, 1)',
      ]
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

        options: {
          animation: {
              duration: 0
          },
          title: {
            // display: true,
            // text: 'Predicted world population (millions) in 2050'
          }
        }
      })

    theDataset = theChart.data.datasets[0]
    window.theChart = theDataset
  },

  methods : {
    wakeUp : function() {
      theChart.data.labels = this.pieLabels
      theChart.options.animation.duration = 1001
      theDataset.backgroundColor = this.pieBackgrounds
      theDataset.borderColor = this.pieBorders
    }
  },

  watch : {
    pieData() {
      !this.isAwake && this.wakeUp()
      theChart.data.datasets[0].data = this.pieData
      theChart.update()
    },
    pieTitle() {
      !this.isAwake && this.wakeUp()
      theChart.options.title.display = true;
      theChart.options.title.text = 'Based on stuff';
      theChart.update()
    }
  },

}
</script>
