<template>
  <div class="publisher">
    <button class="playpause" @click="playPause">{{ playPauseSymbol }}</button>
    <h2>Today's Articles ({{graunArticles.length}})</h2>
    <div>
      <!-- {{statsOverall}} -->
    </div>
    <div class="total">
      <div class="pie-tin">
        <Pie
        :pie-data="totalPieData"
        :pie-labels="totalPieLabels"
        />
      </div>
    </div>
    <!-- <div v-for="(pillar, index) in statsByPillar" :key="index" class="pillar">
      <h3>{{pillar.pillarName}}</h3>
      <div class="pie-tin">

        <Pie
          :pie-data="[pillar.stats.oxTally, pillar.stats.plebTally]"
          :pie-labels="totalPieLabels"
        />
      </div>
      <caption>Based on {{statsOverall.foundTally}}/{{graunArticles.length}} contributors</caption>
    </div> -->
    <!-- <div>Oxbridge {{statsOverall.oxTally}}</div>
    <div>Pleb {{statsOverall.plebTally}}</div>
    <div>Pass {{statsOverall.unknownTally}}</div> -->

    <div class="article-list">
      <p v-for="(article, index) in graunArticles" :key="index">
        {{article.sectionName}}
        <a :href=article.webUrl>{{article.webTitle.substring(0,25)}}</a>&nbsp;
        <span v-if="article.author" class="author" :class="getAuthorClass(article.author)">{{article.author.name}}</span>
      </p>
    </div>

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
    this.$store.dispatch('graun/loadStaff')
  },

  computed : {
    playPauseSymbol() {
      if(this.complete) {
        return '⟳'
      }

      return this.proceed ? '⏸' : '▶'
    },
    statsOverall(){
      return this.$store.getters['graun/statsOverall']
    },
    statsByPillar(){
      return this.$store.getters['graun/statsByPillar']
    },
    totalPieData(){
      return Object.values(this.statsOverall)
    },
    totalPieLabels(){
      return Object.keys(this.statsOverall)
    },
    graunPersonnel(){
      return this.$store.state.graun.personnel
    },
    graunArticles(){
      return this.$store.getters['graun/theDaysArticles']
    },
    proceed(){
      return this.$store.state.graun.proceed
    },
    complete(){
      return this.$store.state.graun.complete
    }
  },
  methods : {
    playPause() {
      if(this.complete) {
        this.$store.dispatch('graun/restart')
      } else {
        this.$store.dispatch(this.proceed ? 'graun/halt' : 'graun/proceed')
      }
    },
    getAuthorClass(author){
      if(!author) {
        return 'unknown'
      }

      if(author['oxbridge']) {
        return 'oxbridge'
      }

      if(author['non-brit']) {
        return 'international'
      }

      if(author['uni-text']) {
        return 'other-uk'
      }

      return 'undisclosed'
    }
  }
}
</script>

<style lang="scss" scoped>
.publisher {
  max-width: 1000px;
  margin: auto;
}

button.playpause {
  min-height: 2rem;
  min-width: 2rem;
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


.article-list{
  display: flex;
  flex-direction: column;
  // align-items: center;

  p {
    // flex : 0 1;
    // text-align: left;
    // max-width: 300px
  }
}

.author {
  &.international {
    background: lemonchiffon;
  }

  &.oxbridge {
    background: pink;
  }

  &.other-uk {
    background: powderblue;
  }

  &.undisclosed {
    outline : 2px dashed orange
  }
}

</style>