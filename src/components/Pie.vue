<template>
  <p>{{pieData}}</p>
  <canvas class="pie" ref="canvas">
  </canvas>
</template>

<script>
import {onMounted, ref} from 'vue'
import Chart from 'chart.js';

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

  setup(props, context){
    // Vue3 ref mechanism
    const canvas = ref(null)

    onMounted(() => {

      let theChart = new Chart(canvas.value, {
        type: 'pie',
        responsive: true,
        data: {
            labels: props.pieLabels,
            datasets: [{
                label: 'Something',
                data: props.pieData,
                // weight : 1,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1
            }]
        },
        // options: {
        //   title: {
        //     display: true,
        //     text: 'Predicted world population (millions) in 2050'
        //   }
        // }
      })

    })

    return {
      canvas
    }
  }
}
</script>
