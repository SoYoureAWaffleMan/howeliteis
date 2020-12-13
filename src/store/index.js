import { createStore } from 'vuex'
import staticGraunPersonnel from '../../data/the-guardian-personnel.json'
import staticArticles from '../../data/articles.test.json'

import ky from 'ky';

const apiKey = '9db526cb-6cfe-45a3-b45f-c89483d43628'
const apiInterval = 2000
const apiUrl =new URL('https://content.guardianapis.com/search')
apiUrl.searchParams.set('api-key',apiKey)

let gotPages = 0
let maxPage = null
let forceMaxPage = 3

const getNextPageOfArticles = async () => {
  apiUrl.searchParams.set("page", gotPages + 1)
  const parsed = await ky.get(apiUrl).json()
  maxPage = forceMaxPage || parsed.response.pages
  return parsed.response.results
}

const addAuthorToArticles = articles => {
  articles.forEach(article => article.author = getAuthorByArticle(article))
}

const getAuthorByArticle = article => {
  const verbose = false
  if(Array.isArray(article.tags) === false) {
    verbose && console.log('no tags')
    return null
  }

  const contributorTag = article.tags.find(tag => tag.type === 'contributor')

  if (!contributorTag) {
    verbose && console.log('no contributor', article)
    return null
  }

  if(!contributorTag.webTitle) {
    verbose && console.log('no webTitle')
    return null
  }

  const author = staticGraunPersonnel.find(person => person.name === contributorTag.webTitle)

  if(!author) {
    verbose && console.log(contributorTag.webTitle,'no matching author')
    return null
  }

  console.log(author.name, '✓')

  return author
}

const getStatsForArticles = articles => {
  const stats = {
    foundTally:0,
    oxTally: 0,
    plebTally: 0,
    unknownTally:0,
    total: articles.length,
  }

  articles.forEach( article => {
    if(article.author){
      stats.foundTally++
    }

    if (!article.author || article.author.oxbridge === null) {
      stats.unknownTally++
    } else if(article.author.oxbridge){
      stats.oxTally++
    } else {
      stats.plebTally++
    }
  })

  return stats
}

export default createStore({
  modules: {
    graun: {
      namespaced : true,
      state: {
        articles: [],
        personnel: staticGraunPersonnel
      },
      getters: {
        articles(state){
          return state.articles
        },

        statsOverall(state, getters){
          return getStatsForArticles(getters.articles)
        },

        statsByPillar: (state) => {
          // Simple object to group articles
          const pillarsObj = {}

          // Array of pillars (sortable) w/ id, name & stats
          const pillarsStats = []

          // Group all articles by pillarId
          state.articles.forEach(article => {
            if(pillarsObj.hasOwnProperty(article.pillarId)) {
              pillarsObj[article.pillarId].push(article)
            } else {
              pillarsObj[article.pillarId] = [article]
            }
          })

          // Convert pillarsObj into an array inc. pillar name and pillar stats
          for (var pillarId in pillarsObj) {
            let pillarArticles = pillarsObj[pillarId]
            let pillarName = pillarsObj[pillarId][0].pillarName // this assumes first article is present & correct

            pillarsStats.push({
              pillarId: pillarId,
              pillarName,
              stats: getStatsForArticles(pillarArticles)
            })
          }

          //sort pillars here

          return pillarsStats

        },
      },
      actions: {
        async loadArticles () {
          apiUrl.searchParams.append("from-date", "2020-12-13")
          apiUrl.searchParams.append("to-date", "2020-12-13")
          apiUrl.searchParams.append("show-tags", "contributor")
          apiUrl.searchParams.append("page-size", "10")
          apiUrl.searchParams.append("section", "commentisfree") //TEMP

          var timer = setInterval(async () => {

            let pageOfArticles = await getNextPageOfArticles()
            gotPages++
            addAuthorToArticles(pageOfArticles)
            this.commit('graun/appendArticles', pageOfArticles)

            if (gotPages === maxPage) {
              console.log('interval finito ', timer);
              clearInterval(timer)
            }

          }, apiInterval);


          // const parsed = await ky.get(apiUrl).json()
          // const articles = parsed.response.results
          // addAuthorToArticles(articles)

          // const totalPages = parsed.response.pages

          // this.commit('graun/appendArticles', parsed.response.results)

            // setTimeout(() => {
            //   this.commit('graun/articles', staticArticles.response.results)
            // }, 1000)


        }
      },
      mutations: {
        appendArticles (state, articles) {
          state.articles.push(...articles)
          console.log('DONE', state.articles.length);

        }
      }
    }
  }
})
