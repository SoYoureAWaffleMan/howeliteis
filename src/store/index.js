import { createStore } from 'vuex'
import staticGraunPersonnel from '../../data/the-guardian-personnel.json'
import staticArticles from '../../data/articles.test.json'

import ky from 'ky';

const apiKey = '9db526cb-6cfe-45a3-b45f-c89483d43628'
const apiUrl =new URL('https://content.guardianapis.com/search')
apiUrl.searchParams.append('api-key',apiKey)

export default createStore({
  modules: {
    graun: {
      namespaced : true,
      state: {
        articles: [],
        personnel: staticGraunPersonnel
      }, 
      getters: {
        // Curried syntax to allow parameter
        authorFromArticle: (state) => (article) => {
          if(Array.isArray(article.tags) === false) {
            console.log('no tags')
            return null
          }

          const contributorTag = article.tags.find(tag => tag.type === 'contributor')

          if (!contributorTag) {
            console.log('no contributor')
            return null
          }

          if(!contributorTag.webTitle) {
            console.log('no webTitle')
            return null
          }

          const author = state.personnel.find(person => person.name === contributorTag.webTitle)

          if(!author) {
            console.log(contributorTag.webTitle,'no matching author')
            return null
          }

          console.log(author.name, '✓')

          return author
        },

        articles(state){
          console.log('getting')
          return state.articles
        },

        statsOverall(state, getters){

          const stats = {
            foundTally:0,
            oxTally: 0,
            plebTally: 0,
            unknownTally:0,
            total: getters.articles.length,
          }          

          getters.articles.forEach( article => {
            let author = getters.authorFromArticle(article)

            if(author){
              stats.foundTally++
            }

            if (!author || author.oxbridge === null) {
              stats.unknownTally++
            } else if(author.oxbridge){
              stats.oxTally++
            } else {
              stats.plebTally++
            }

          })

          return stats
          
        },
      },
      actions: {
        async loadArticles () {

          apiUrl.searchParams.append("from-date", "2020-12-12")
          apiUrl.searchParams.append("to-date", "2020-12-12")
          apiUrl.searchParams.append("show-tags", "contributor")
          apiUrl.searchParams.append("section", "commentisfree")

          // const parsed = await ky.get(`https://content.guardianapis.com/search?q=opinion&from-date=2020-12-10&show-tags=contributor&api-key=${apiKey}`).json();
          
          const parsed = await ky.get(apiUrl).json();
            
          console.log('GOT response',parsed)
          this.commit('graun/articles', parsed.response.results)

            // setTimeout(() => {
            //   this.commit('graun/articles', staticArticles.response.results)
            // }, 1000)

            
        } 
      },
      mutations: {
        articles (state, articles) {
          console.log('mutating', articles)
          state.articles = articles
        }
      },
    }
  }
})
