<template>
  <div class="publisher">
    <h2>Today's Opinion Articles ({{graunArticles.length}})</h2>
    <p v-for="(article, index) in graunArticles" :key="index">{{article.webTitle}}</p>
    <h2>Personnel ({{graunPersonnel.length}})</h2>
    <p v-for="(person, index) in graunPersonnel" :key="index">
      {{person.name}} - {{[person['uni-text'], person['college-text']].join(', ')}}
    </p>
  </div>
</template>

<script>
export default {
  mounted(){
    this.$store.dispatch('graun/loadArticles')
  },
  data(){
    return {
      name : 'moose'
    }
  },
  computed : {
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