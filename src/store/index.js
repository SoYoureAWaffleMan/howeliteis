import { createStore } from 'vuex'
import staticGraunPersonnel from '../../data/the-guardian-personnel.json'
import ky from 'ky';

const apiKey = '9db526cb-6cfe-45a3-b45f-c89483d43628'

export default createStore({
  modules: {
    graun: {
      namespaced : true,
      state: {
        articles: [],
        personnel: staticGraunPersonnel
      }, 
      getters: {
        personnel () {  },
        articles(state){
          console.log('getting')
          return state.articles
        }
      },
      actions: {
        async loadArticles () { 
            const parsed = await ky.get('https://content.guardianapis.com/search?q=opinion&from-date=2020-12-10&api-key=test').json();
            console.log('GOT response',parsed)
            this.commit('graun/articles', parsed.response.results)
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
