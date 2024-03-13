/* global Vue */
/* global fetchWithAbort */

const conceptMappingsApp = Vue.createApp({
  data () {
    return {
      mappings: []
    }
  },
  provide: {
    content_lang: window.SKOSMOS.content_lang
  },
  methods: {
    loadMappings () {
      fetchWithAbort('rest/v1/' + window.SKOSMOS.vocab + '/mappings?uri=' + window.SKOSMOS.uri + '&external=true&clang=' + window.SKOSMOS.lang + '&lang=' + window.SKOSMOS.content_lang)
        .then(data => {
          return data.json()
        })
        .then(data => {
          this.mappings = this.group_by(data.mappings, 'typeLabel')
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            console.log('Fetching of mappings aborted')
          } else {
            throw error
          }
        })
    },
    // from https://stackoverflow.com/a/71505541
    group_by (arr, prop) {
      return arr.reduce(function (ret, x) {
        if (!ret[x[prop]]) { ret[x[prop]] = [] }
        ret[x[prop]].push(x)
        return ret
      }, {})
    }
  },
  mounted () {
    // Only load mappings when on the concept page
    // window.SKOSMOS variable should maybe have a separate property for current page
    if (window.SKOSMOS.uri) {
      this.loadMappings()
    }
  },
  template: `
    <div v-load-concept-page="loadMappings">
      <concept-mappings :mappings="mappings" v-if="mappings.length !== 0"></concept-mappings>
    </div>
  `
})

/* Custom directive used to add an event listener for loading a concept page */
conceptMappingsApp.directive('load-concept-page', {
  mounted: (el, binding) => {
    el.loadConceptPageEvent = event => {
      binding.value() // calling the method given as the attribute value (loadMappings)
    }
    document.addEventListener('loadConceptPage', el.loadConceptPageEvent) // registering an event listener for loading a concept page
  },
  unmounted: el => {
    document.removeEventListener('loadConceptPage', el.loadConceptPageEvent)
  }
})

conceptMappingsApp.component('concept-mappings', {
  props: ['mappings'],
  inject: ['content_lang'],
  template: `
    <div class="row property prop-mapping" v-for="mapping in Object.entries(mappings)">
      <div class="col-sm-4 px-0 property-label" :title="mapping[1][0].description"><h2>{{ mapping[0] }}</h2></div>
      <div class="col-sm-8">
        <div class="row mb-2" v-for="m in mapping[1]">
          <div class="col-sm-5 prop-mapping-label">
            <a :href="m.hrefLink">{{ m.prefLabel }}</a><span v-if="m.lang && m.lang !== this.content_lang"> ({{ m.lang }})</span>
          </div>
          <div class="col-sm-7 prop-mapping-vocab">{{ m.vocabName }}</div>
        </div>
      </div>
    </div>
  `
})

conceptMappingsApp.mount('#concept-mappings')
