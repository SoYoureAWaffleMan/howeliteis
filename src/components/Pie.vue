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
      // Oxbridge, Other, International, Undisclosed, Unknown
      pieBackgrounds : [
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(150, 20, 200, 0.2)',
        'rgba(180, 250, 180, 0.2)',
        'rgba(200, 200, 200, 0.2)',
      ],
      pieBorders : [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(150, 20, 200, 1)',
        'rgba(180, 250, 180, 1)',
        'rgba(200, 200, 200, 1)',
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
            data: [1],
            backgroundColor: '#ccc',
            borderColor: '#555',
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
    window.theChart = theChart
  },

  methods : {
    wakeUp : function() {
      theChart.data.labels = this.pieLabels
      theChart.options.animation.duration = 1001
      theDataset.backgroundColor = this.pieBackgrounds
      theDataset.borderColor = this.pieBorders
      theChart.update() // subsequent update when data changes does not update label colors *shrug*
    }
  },

  watch : {
    pieData() {
      !this.isAwake && this.wakeUp()
      theDataset.data = this.pieData
      theChart.update()
    },
  },

}
</script>
