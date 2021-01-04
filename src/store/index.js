import { createStore } from 'vuex'
import staticGraunPersonnel from '../../data/the-guardian-personnel.json'
import staticArticles from '../../data/articles.test.json'

import ky from 'ky';

const apiKey = '9db526cb-6cfe-45a3-b45f-c89483d43628'
const apiInterval = 1000
const apiUrl =new URL('https://content.guardianapis.com/search')

apiUrl.searchParams.set('api-key',apiKey)
apiUrl.searchParams.append("from-date", "2020-12-20")
apiUrl.searchParams.append("to-date", "2020-12-26")
apiUrl.searchParams.append("show-tags", "contributor")
apiUrl.searchParams.append("page-size", "10")
apiUrl.searchParams.append("section", "commentisfree") //TEMP

let gotPages = 0
let timer = null
let maxPage = null
const forceMaxPage = 3

const getNextPageOfArticles = async (context) => {

  // Update the API URL and make the call
  apiUrl.searchParams.set("page", gotPages + 1)
  const parsed = await ky.get(apiUrl).json()
  const pageOfArticles = parsed.response.results

  // Update `maxPage` according to the response, and `gotPages`
  maxPage = forceMaxPage || parsed.response.pages
  gotPages++

  if(Number.isInteger(forceMaxPage)){
    maxPage = Math.min(forceMaxPage, parsed.response.pages)
  } else {
    maxPage = parsed.response.pages
  }

  if (gotPages === maxPage && timer) {
    clearInterval(timer)
    context.commit('proceed', false)
    context.commit('complete', true)
  }

  // Add author info to the article data and wang it in the state
  addAuthorToArticles(pageOfArticles)
  context.commit('appendArticles', pageOfArticles)
}

const addAuthorToArticles = articles => {
  articles.forEach(article => article.author = getAuthorByArticle(article))
}

const getAuthorByArticle = article => {
  const verbose = false
  if(Array.isArray(article.tags) === false) {
    verbose && console.info('no tags')
    return null
  }

  const contributorTag = article.tags.find(tag => tag.type === 'contributor')

  if (!contributorTag) {
    verbose && console.info('no contributor', article)
    return null
  }

  if(!contributorTag.webTitle) {
    verbose && console.info('no webTitle')
    return null
  }

  const author = staticGraunPersonnel.find(person => person.name === contributorTag.webTitle)

  if(!author) {
    verbose && console.info(contributorTag.webTitle,'no matching author')
    return null
  }

  console.info(author.name, '✓')

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
        personnel: staticGraunPersonnel,
        proceed: false,
        complete: false,
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
        async proceed(context) {
          context.commit('proceed', true)

          // Do this immediately
          await getNextPageOfArticles(context)

          // And then do it repeatedly
          if(gotPages < maxPage) {
            timer = setInterval(() => getNextPageOfArticles(context), apiInterval)
          }
        },
        halt(context) {
          clearInterval(timer)
          context.commit('proceed', false)
        },
        restart(context) {
          gotPages = 0
          timer = null
          maxPage = null
          context.commit('expungeArticles', false)
          context.dispatch('proceed')
        }
      },
      mutations: {
        appendArticles (state, articles) {
          state.articles.push(...articles)
        },
        expungeArticles (state) {
          state.articles = []
        },
        proceed(state, newProceed) {
          state.proceed = newProceed
        },
        complete(state, newcomplete) {
          state.complete = newcomplete
        }
      }
    }
  }
})
