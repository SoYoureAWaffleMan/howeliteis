<template>
  <div class="publisher">
    <h2>Today's Articles ({{graunArticles.length}})</h2>
    <div class="total">
      <div class="pie-tin">
        <Pie
        :pie-data="totalPieData"
        :pie-labels="totalPieLabels"
        />
      </div>
      <caption>Based on {{statsOverall.foundTally}}/{{graunArticles.length}} contributors</caption>
    </div>
    <div v-for="(pillar, index) in statsByPillar" :key="index" class="pillar">
      <h3>{{pillar.pillarName}}</h3>
      <div class="pie-tin">
        <Pie
        :pie-data="[pillar.stats.oxTally, pillar.stats.plebTally]"

        />
      </div>
      <caption>Based on {{statsOverall.foundTally}}/{{graunArticles.length}} contributors</caption>
    </div>
    <!-- <div>Oxbridge {{statsOverall.oxTally}}</div>
    <div>Pleb {{statsOverall.plebTally}}</div>
    <div>Pass {{statsOverall.unknownTally}}</div> -->

    <!-- <p v-for="(article, index) in graunArticles" :key="index">
      {{article.sectionName}} - {{ article.tags.length ? article.tags[0].webTitle : 'No tags'}}
      <a :href=article.webUrl>{{article.webTitle.substring(0,25)}}</a>
    </p> -->

    <!-- <h2>Personnel ({{graunPersonnel.length}})</h2>
    <p v-for="(person, index) in graunPersonnel" :key="index">
      {{person.name}} - {{[person['uni-text'], person['college-text']].join(', ')}}
    </p> -->
  </div>
</template>

<script>
import Pie from '../components/Pie.vue';
// var myChart = new Chart(ctx, {...});

export default {
  components : {
    Pie
  },
  mounted(){
    this.$store.dispatch('graun/loadArticles')
  },

  computed : {
    statsOverall(){
      return this.$store.getters['graun/statsOverall']
    },
    statsByPillar(){
      return this.$store.getters['graun/statsByPillar']
    },
    totalPieData(){
      return [this.statsOverall.oxTally, this.statsOverall.plebTally]
    },
    totalPieLabels(){
      return ['Oxbridge', 'Others']
    },
    graunPersonnel(){
      return this.$store.state.graun.personnel
    },
    graunArticles(){
      return this.$store.getters['graun/articles']
    }
  }
}
</script>

<style lang="scss" scoped>
.publisher {
  max-width: 1000px;
  margin: auto;
}

.total {
  display: flex;
  flex-direction: column;
  align-items: center;

  .pie-tin {
    height: 280px;
    width: 400px;
  }
}

.pillar {
  display: flex;
  flex-direction: column;
  align-items: center;

  .pie-tin {
    height: 160px;
    width: 200px;
  }
}

</style>