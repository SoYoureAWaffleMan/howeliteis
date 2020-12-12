<template>
  <div class="publisher">
    <h2>Today's Opinion Articles ({{graunArticles.length}})</h2>
    <div>Total {{statsOverall.total}}</div>
    <div>Found {{statsOverall.foundTally}}</div>
    <div>Oxbridge {{statsOverall.oxTally}}</div>
    <div>Pleb {{statsOverall.plebTally}}</div>
    <div>Pass {{statsOverall.unknownTally}}</div>
    <p v-for="(article, index) in graunArticles" :key="index">
      {{article.sectionName}} - {{article.tags[0].webTitle}}
      <a :href=article.webUrl>{{article.webTitle.substring(0,25)}}</a>
    </p>
    <!-- <h2>Personnel ({{graunPersonnel.length}})</h2>
    <p v-for="(person, index) in graunPersonnel" :key="index">
      {{person.name}} - {{[person['uni-text'], person['college-text']].join(', ')}}
    </p> -->
  </div>
</template>

<script>
export default {
  mounted(){
    this.$store.dispatch('graun/loadArticles')
    
  },

  computed : {
    statsOverall(){
      return this.$store.getters['graun/statsOverall']
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

<style scoped>

</style>