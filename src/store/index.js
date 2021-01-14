import { createStore, createLogger } from 'vuex'
import staticGraunPersonnel from '../../data/the-guardian-personnel.json'
import ky from 'ky';
import staticArticles from '../../data/articles.test.json'

const apiKey = '9db526cb-6cfe-45a3-b45f-c89483d43628'
const apiInterval = 1000
const apiUrl =new URL('https://content.guardianapis.com/search')
const dateString = new Date().toISOString().slice(0,10)

apiUrl.searchParams.set('api-key',apiKey)
apiUrl.searchParams.append("from-date", dateString)
apiUrl.searchParams.append("to-date", dateString)
apiUrl.searchParams.append("show-tags", "contributor")
apiUrl.searchParams.append("page-size", "20")
// apiUrl.searchParams.append("section", "commentisfree") //TEMP

let gotPages = 0
let timer = null
let maxPage = null
const forceMaxPage = null

const getNextPageOfArticles = async (context) => {
  // Update the API URL and make the call
  apiUrl.searchParams.set("page", gotPages + 1)
  const parsed = await ky.get(apiUrl).json()
  const pageOfArticles = parsed.response.results

  // Add author info to the article data and wang it in the state
  addAuthorToArticles(pageOfArticles)
  context.commit('appendArticles', pageOfArticles)

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

    localStorage.setItem(dateString, JSON.stringify(context.getters['theDaysArticles']))
  }
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
    'Oxbridge': 0,
    'Other UK': 0,
    'International': 0,
    'Undisclosed': 0,
    'Unknown': 0,
  }

  articles.forEach( article => {
    if(!article.author) {
      stats.Unknown++
      return
    }

    if (article.author.oxbridge) {
      stats.Oxbridge++
    } else if(article.author['non-brit']){
      stats.International++
    } else if(article.author['uni-text']) {
      stats['Other UK']++
    } else {
      stats['Undisclosed']++
    }
  })

  return stats
}

export default createStore({
  modules: {
    graun: {
      namespaced : true,
      state: {
        articles: {}, // object keyed by date e.g. {'2020-02-14' : [...articles]}
        personnel: staticGraunPersonnel,
        proceed: false,
        complete: false,
      },
      getters: {
        theDaysArticles(state){
          return state.articles[dateString] || []
        },
        /**
         * Gets "stats" object comprised of `data` (array) & `labels` (array)
         * @param {Vuex state} state
         */
        statsOverall(state, getters){
          return getStatsForArticles(getters['theDaysArticles'])
        },

        statsByPillar: (state) => {
          // Simple object to group articles
          const pillarsObj = {}

          // Array of pillars (sortable) w/ id, name & stats
          const pillarsStats = []

          // Group all articles by pillarId
          state.articles[dateString].forEach(article => {
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
          // Any cached articles for this date?
          const cachedArticlesString = localStorage.getItem(dateString)

          if(cachedArticlesString) {

            try {
              const cachedArticles = JSON.parse(cachedArticlesString)
              Array.isArray(cachedArticles) && context.commit('setArticles', cachedArticles)
              console.log('Found in cache, bailing...');
              return
            } catch(error) {
              console.error('Bad JSON', error)
            }
          }

          // No cache found
          console.log('No cache');
          context.commit('proceed', true)

          // Do this immediately
          context.commit('setArticles', [])
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
          context.commit('setArticles', [])
          context.dispatch('proceed')
        }
      },
      mutations: {
        setArticles (state, articles) {
          if(Array.isArray(articles)){
            state.articles[dateString] = articles
          } else {
            throw error('This isn\'t an array')
          }
        },
        appendArticles (state, articles) {
          state.articles[dateString].push(...articles)
        },
        proceed(state, newProceed) {
          state.proceed = newProceed
        },
        complete(state, newcomplete) {
          state.complete = newcomplete
        }
      },
      plugins: process.env.NODE_ENV === 'development'
        ? [createLogger()]
        : []
    }
  }
})
