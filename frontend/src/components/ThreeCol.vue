<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as Texts from '../texts'
import ShowText from './ShowText.vue';
const tac = ref<Texts.TextAndCommentaries|null>(null)
onMounted(async () => {
  const ret = await Texts.fetchText("Shabbos 47b")
  console.log(ret)
  tac.value = ret
})
const selBituyId = ref("")

// defineProps<{}>()
</script>

<template>
  <div class="container text-center" v-if="tac">
    <div class="row">
      <div style="width: 26%" class="ourCol peirushCol rashi">
        <h5 class="text-center">{{tac.find(1)!.titleHe}}</h5>
        <ShowText :text="tac.find(1)" :filter="selBituyId"/>
      </div>
      <div style="width: 48%" class="ourCol mainCol vilna" @click="selBituyId=''">
        <h2 class="vilna text-center">{{tac.text.titleHe}}</h2>
        <ShowText :text="tac.text" @bituyClicked="selBituyId=$event.ref" />
      </div>
      <div style="width: 26%" class="ourCol peirushCol rashi">
        <h5 class="text-center">{{tac.find(0)!.titleHe}}</h5>
        <ShowText :text="tac.find(0)" :filter="selBituyId" />
      </div>
    </div>
  </div>
  <div v-else>
    Loading text...
  </div>
</template>

<!-- <style>
.peirushCol .diburMaschil { font-family: 'Mekorot-Vilna', 'Times New Roman', Times, serif; font-size: 1.2em; }
</style> -->

<style scoped>
.ourCol { height: 100vh; overflow-y: scroll; }
.peirushCol { padding-top: 1rem }
.ourCol { text-align: justify; direction: rtl; }
.mainCol { font-size: 18pt; }
.debug .mainCol { background: #DDF; }
.debug .peirushCol { background: #FDD }
.vilna { font-family: 'Mekorot-Vilna', 'Times New Roman', Times, serif; }
.rashi { font-family: 'Mekorot-Rashi', 'Rashi', serif; }
.ourCol::-webkit-scrollbar {
  background-color: transparent;
  width: 10px;
}
.ourCol::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 0.3rem;
}
.ourCol:hover::-webkit-scrollbar-thumb {
  background-color: #BBB;
}

@font-face { 
  font-family: 'Mekorot-Vilna';
  src: url('https://cdn.glitch.com/48a1c300-b9e5-4d26-99f0-ab8e379bb552%2FMekorot-Vilna.woff2?v=1606163564066') format('woff2'),  
        url('https://cdn.glitch.com/48a1c300-b9e5-4d26-99f0-ab8e379bb552%2FMekorot-Vilna.woff?v=1606163594943') format('woff');
}

@font-face { 
  font-family: 'Mekorot-Rashi';
  src: url('https://cdn.glitch.com/48a1c300-b9e5-4d26-99f0-ab8e379bb552%2FMekorot-Rashi.woff2?v=1606163753614') format('woff2'),  
        url('https://cdn.glitch.com/48a1c300-b9e5-4d26-99f0-ab8e379bb552%2FMekorot-Rashi.woff?v=1606163747981') format('woff');
}
</style>
